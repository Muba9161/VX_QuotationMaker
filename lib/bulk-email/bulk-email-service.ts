import { prisma } from "@/lib/prisma";
import { isRedisConnected } from "@/lib/redis";
import { enqueueBulkEmailRecipient } from "@/lib/queue/queue-manager";
import { sendBulkEmail } from "@/lib/email";
import { recordAuditLog } from "@/lib/audit";

export interface CreateBatchParams {
  tenantId: string;
  senderUserId?: string;
  senderUserName?: string;
  subject: string;
  message: string;
  recipients: Array<{
    contactId?: string | null;
    email: string;
    name?: string;
  }>;
}

/**
 * Resolves all eligible contacts within the requesting tenant.
 */
export async function getTenantRecipients(tenantId: string) {
  const contacts = await prisma.contact.findMany({
    where: {
      organizationId: tenantId,
      status: "ACTIVE",
      email: { not: null },
    },
    select: {
      id: true,
      name: true,
      companyName: true,
      email: true,
      phone: true,
    },
    orderBy: { name: "asc" },
  });

  // Deduplicate contacts by email
  const seenEmails = new Set<string>();
  const uniqueContacts = [];

  for (const contact of contacts) {
    if (!contact.email) continue;
    const normalized = contact.email.toLowerCase().trim();
    if (!seenEmails.has(normalized)) {
      seenEmails.add(normalized);
      uniqueContacts.push(contact);
    }
  }

  return uniqueContacts;
}

/**
 * Direct execution fallback when Redis is offline or in local test runners.
 */
export async function processBulkEmailBatchDirect(batchId: string): Promise<void> {
  const batch = await prisma.bulkEmailBatch.findUnique({
    where: { id: batchId },
    include: {
      organization: { select: { name: true } },
      recipients: { where: { status: "QUEUED" } },
    },
  });

  if (!batch || batch.recipients.length === 0) return;

  const orgName = batch.organization?.name || "VorldX";

  for (const recipient of batch.recipients) {
    await prisma.bulkEmailRecipient.update({
      where: { id: recipient.id },
      data: { status: "PROCESSING" },
    }).catch(() => {});

    const result = await sendBulkEmail({
      to: recipient.email,
      recipientName: recipient.name,
      organizationName: orgName,
      subject: batch.subject,
      message: batch.message,
    });

    const now = new Date();
    if (result.success) {
      await prisma.bulkEmailRecipient.update({
        where: { id: recipient.id },
        data: {
          status: "SENT",
          messageId: result.messageId || null,
          sentAt: now,
          error: null,
        },
      });
      await prisma.bulkEmailBatch.update({
        where: { id: batchId },
        data: {
          sentCount: { increment: 1 },
          pendingCount: { decrement: 1 },
        },
      });
    } else {
      await prisma.bulkEmailRecipient.update({
        where: { id: recipient.id },
        data: {
          status: "FAILED",
          error: result.error || "Delivery failed",
        },
      });
      await prisma.bulkEmailBatch.update({
        where: { id: batchId },
        data: {
          failedCount: { increment: 1 },
          pendingCount: { decrement: 1 },
        },
      });
    }
  }

  const finalBatch = await prisma.bulkEmailBatch.findUnique({
    where: { id: batchId },
    select: { sentCount: true, failedCount: true, totalRecipients: true },
  });

  if (finalBatch) {
    const finalStatus =
      finalBatch.failedCount === 0
        ? "COMPLETED"
        : finalBatch.sentCount === 0
        ? "FAILED"
        : "PARTIAL_FAILURE";
    await prisma.bulkEmailBatch.update({
      where: { id: batchId },
      data: { status: finalStatus },
    });
  }
}

/**
 * Creates and enqueues a bulk email batch with tenant boundary verification.
 */
export async function createBulkEmailBatch(params: CreateBatchParams) {
  const { tenantId, senderUserId, subject, message, recipients } = params;

  // 1. Verify tenant boundary for all contactIds
  const contactIds = recipients
    .map((r) => r.contactId)
    .filter((id): id is string => Boolean(id));

  if (contactIds.length > 0) {
    const validContacts = await prisma.contact.findMany({
      where: {
        id: { in: contactIds },
        organizationId: tenantId,
      },
      select: { id: true },
    });

    const validIdSet = new Set(validContacts.map((c) => c.id));
    const unauthorized = contactIds.filter((id) => !validIdSet.has(id));
    if (unauthorized.length > 0) {
      throw new Error(`Unauthorized cross-tenant contact access detected: ${unauthorized.join(", ")}`);
    }
  }

  // 2. Deduplicate recipients by email within this batch
  const dedupedMap = new Map<string, { contactId?: string | null; email: string; name: string }>();
  for (const r of recipients) {
    const normalized = r.email.toLowerCase().trim();
    if (!dedupedMap.has(normalized)) {
      dedupedMap.set(normalized, {
        contactId: r.contactId || null,
        email: normalized,
        name: r.name?.trim() || "",
      });
    }
  }
  const cleanRecipients = Array.from(dedupedMap.values());

  if (cleanRecipients.length === 0) {
    throw new Error("No valid recipients provided.");
  }

  // 3. Retrieve organization name for email metadata
  const org = await prisma.organization.findUnique({
    where: { id: tenantId },
    select: { name: true },
  });

  const orgName = org?.name || "VorldX";

  // 4. Create batch & recipient records atomically
  const batch = await prisma.$transaction(async (tx) => {
    const newBatch = await tx.bulkEmailBatch.create({
      data: {
        organizationId: tenantId,
        senderUserId: senderUserId || null,
        subject,
        message,
        status: "QUEUED",
        totalRecipients: cleanRecipients.length,
        pendingCount: cleanRecipients.length,
        sentCount: 0,
        failedCount: 0,
      },
    });

    await tx.bulkEmailRecipient.createMany({
      data: cleanRecipients.map((r) => ({
        batchId: newBatch.id,
        contactId: r.contactId || null,
        name: r.name,
        email: r.email,
        status: "QUEUED",
      })),
    });

    return newBatch;
  });

  // 5. Fetch created recipients to obtain generated UUIDs for queuing
  const createdRecipients = await prisma.bulkEmailRecipient.findMany({
    where: { batchId: batch.id },
    select: { id: true, email: true, name: true },
  });

  // 6. Enqueue jobs into BullMQ or trigger direct background runner if Redis offline
  const redisOk = await isRedisConnected();
  if (redisOk) {
    for (const r of createdRecipients) {
      const jobId = await enqueueBulkEmailRecipient({
        batchId: batch.id,
        recipientId: r.id,
        to: r.email,
        recipientName: r.name,
        organizationName: orgName,
        subject,
        message,
      });

      await prisma.bulkEmailRecipient.update({
        where: { id: r.id },
        data: { jobId },
      }).catch(() => {});
    }
  } else {
    // Asynchronous non-blocking dispatch via event loop tick
    setTimeout(() => {
      processBulkEmailBatchDirect(batch.id).catch((err) => {
        console.error(`[Bulk Email Direct Runner Error] Batch ${batch.id}:`, err);
      });
    }, 10);
  }

  // 7. Record audit log
  await recordAuditLog({
    action: "BULK_EMAIL_ENQUEUED",
    resourceType: "BULK_EMAIL",
    resourceId: batch.id,
    userId: senderUserId,
    organizationId: tenantId,
    details: `Bulk email batch "${subject}" enqueued for ${cleanRecipients.length} recipients.`,
  }).catch(() => {});

  return {
    id: batch.id,
    subject: batch.subject,
    status: batch.status,
    totalRecipients: batch.totalRecipients,
    createdAt: batch.createdAt,
  };
}

/**
 * Returns a paginated list of batches for the requesting tenant.
 */
export async function getTenantBatches(tenantId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [batches, total] = await Promise.all([
    prisma.bulkEmailBatch.findMany({
      where: { organizationId: tenantId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        senderUser: {
          select: { id: true, name: true, email: true },
        },
      },
    }),
    prisma.bulkEmailBatch.count({
      where: { organizationId: tenantId },
    }),
  ]);

  return {
    batches: batches.map((b) => ({
      id: b.id,
      subject: b.subject,
      status: b.status,
      totalRecipients: b.totalRecipients,
      sentCount: b.sentCount,
      failedCount: b.failedCount,
      pendingCount: b.pendingCount,
      createdAt: b.createdAt,
      sender: b.senderUser ? { name: b.senderUser.name, email: b.senderUser.email } : null,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Returns detailed batch metrics and individual recipient statuses.
 */
export async function getBatchDetails(batchId: string, tenantId: string) {
  const batch = await prisma.bulkEmailBatch.findFirst({
    where: {
      id: batchId,
      organizationId: tenantId,
    },
    include: {
      senderUser: { select: { id: true, name: true, email: true } },
      recipients: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          error: true,
          sentAt: true,
          createdAt: true,
        },
      },
    },
  });

  return batch;
}
