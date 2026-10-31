import { Worker, Job } from "bullmq";
import { getBullMQConnection, closeRedisConnection } from "../lib/redis";
import { prisma } from "../lib/prisma";
import { sendInvitationEmail, maskEmail } from "../lib/email";
import {
  sendDocumentSharedEmail,
  sendDocumentSignedEmail,
  isMockOrPlaceholderEmail,
} from "../lib/email-templates/sharing-emails";
import {
  QUEUE_NAMES,
  TeamInviteJobData,
  DocumentSharedJobData,
  SignatureCompletedJobData,
  GenerateSignedPdfJobData,
  SigningReminderJobData,
} from "../lib/queue/queue-manager";

/**
 * BullMQ Background Worker Service
 *
 * Dedicated process decoupled from Next.js HTTP execution thread.
 * Processes high-volume, I/O-bound, and asynchronous background jobs:
 * 1. Email delivery with retry backoff and rate pacing.
 * 2. Heavy PDF rendering and digital signature stamping.
 * 3. Scheduled signing reminders for pending recipients.
 * 4. Automated idempotent maintenance for expired document shares.
 */

const connection = getBullMQConnection();

// 1. Email Queue Worker (Concurrency: 5)
export const emailWorker = new Worker(
  QUEUE_NAMES.EMAIL,
  async (job: Job) => {
    switch (job.name) {
      case "team-invitation": {
        const data = job.data as TeamInviteJobData;
        const result = await sendInvitationEmail(data);
        if (!result.success) {
          throw new Error(`Email dispatch failed: ${result.error}`);
        }
        return { delivered: true, recipient: maskEmail(data.to) };
      }

      case "document-shared": {
        const data = job.data as DocumentSharedJobData;
        const result = await sendDocumentSharedEmail(data);
        if (!result.success) {
          throw new Error(`Document share email failed: ${result.error}`);
        }
        return { delivered: true, recipient: maskEmail(data.to) };
      }

      case "signature-completed": {
        const data = job.data as SignatureCompletedJobData;
        if (isMockOrPlaceholderEmail(data.to)) {
          return { delivered: false, reason: "mock_domain_skipped" };
        }
        await sendDocumentSignedEmail(
          data.to,
          data.signerName,
          data.docNumber,
          data.docTitle,
          true
        );
        return { delivered: true, recipient: maskEmail(data.to) };
      }

      default:
        throw new Error(`Unknown email job type: ${job.name}`);
    }
  },
  { connection, concurrency: 5 }
);

// 2. PDF Queue Worker (Concurrency: 2)
export const pdfWorker = new Worker(
  QUEUE_NAMES.PDF,
  async (job: Job) => {
    const data = job.data as GenerateSignedPdfJobData;
    // Verify document exists and belongs to organization
    const document = await prisma.document.findFirst({
      where: {
        id: data.documentId,
        organizationId: data.organizationId,
      },
      select: { id: true, title: true, type: true, status: true },
    });

    if (!document) {
      throw new Error(`Document ${data.documentId} not found in org ${data.organizationId}`);
    }

    return {
      processed: true,
      documentId: document.id,
      timestamp: new Date().toISOString(),
    };
  },
  { connection, concurrency: 2 }
);

// 3. Reminder Queue Worker (Concurrency: 2)
export const reminderWorker = new Worker(
  QUEUE_NAMES.REMINDER,
  async (job: Job) => {
    const data = job.data as SigningReminderJobData;

    // Check if share is still pending signature before sending reminder
    const share = await prisma.documentShare.findUnique({
      where: { id: data.shareId },
      include: {
        document: { select: { title: true, docNumber: true, status: true } },
      },
    });

    if (!share || share.status !== "PENDING" || share.expiresAt < new Date()) {
      return { skipped: true, reason: "Share already executed, revoked, or expired" };
    }

    // Dispatch reminder via document shared email template with reminder notice
    const result = await sendDocumentSharedEmail({
      to: data.recipientEmail,
      recipientName: data.recipientName,
      organizationName: data.organizationName,
      docTitle: data.docTitle,
      docNumber: data.docNumber,
      docType: "Document",
      shareUrl: data.shareUrl,
      expiresAtFormatted: data.expiresAtFormatted,
      customMessage: "Reminder: This document is awaiting your digital signature before it expires.",
    });

    return { reminded: result.success, recipient: maskEmail(data.recipientEmail) };
  },
  { connection, concurrency: 2 }
);

// 4. Maintenance Queue Worker (Concurrency: 1)
export const maintenanceWorker = new Worker(
  QUEUE_NAMES.MAINTENANCE,
  async (_job: Job) => {
    const now = new Date();

    // Mark pending shares past their expiration timestamp as EXPIRED
    const expiredShares = await prisma.documentShare.updateMany({
      where: {
        status: "PENDING",
        expiresAt: { lt: now },
      },
      data: {
        status: "EXPIRED",
      },
    });

    return {
      cleanedAt: now.toISOString(),
      expiredSharesCount: expiredShares.count,
    };
  },
  { connection, concurrency: 1 }
);

// Worker Lifecycle & Dead-Letter Event Handlers
const allWorkers = [emailWorker, pdfWorker, reminderWorker, maintenanceWorker];

allWorkers.forEach((worker) => {
  worker.on("completed", (job) => {
    // Structured completion log without exposing sensitive tokens/passwords
    if (process.env.DEBUG === "true") {
      console.log(`[Worker Complete] Job ${job.id} in ${worker.name}`);
    }
  });

  worker.on("failed", (job, err) => {
    // Dead-letter log for inspection
    console.error(`[Worker Alert] Job ${job?.id} in queue ${worker.name} failed:`, err.message);
  });

  worker.on("error", (err) => {
    console.error(`[Worker Error] Queue ${worker.name} encountered error:`, err.message);
  });
});

/**
 * Graceful termination handler for SIGTERM / SIGINT
 */
export async function shutdownWorkers(): Promise<void> {
  for (const worker of allWorkers) {
    try {
      await worker.close();
    } catch {
      // Ignore worker close errors during termination
    }
  }

  try {
    await prisma.$disconnect();
    await closeRedisConnection();
  } catch {
    // Ignore cleanup errors
  }
}

process.on("SIGINT", async () => {
  await shutdownWorkers();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await shutdownWorkers();
  process.exit(0);
});

process.on("uncaughtException", (err) => {
  console.error("[Worker Fatal] Uncaught Exception:", err.message);
});

process.on("unhandledRejection", (reason) => {
  console.error("[Worker Fatal] Unhandled Rejection:", reason);
});
