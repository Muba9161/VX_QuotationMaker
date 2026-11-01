import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantContext, requireTrustedOrigin } from "@/lib/auth/guards";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { generateShareToken, hashShareToken } from "@/lib/services/share-token";
import { createDocumentSnapshot } from "@/lib/services/document-snapshot";
import { sendDocumentSharedEmail } from "@/lib/email-templates/sharing-emails";
import { recordAuditLog } from "@/lib/audit";
import {
  enqueueDocumentSharedEmail,
  enqueueSigningReminder,
} from "@/lib/queue/queue-manager";

/**
 * GET /api/v1/documents/[id]/shares
 * Lists all share links and their statuses for a given document.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { tenantId } = await requireTenantContext(req);
    const { id: documentId } = await params;

    // Verify document belongs to tenant
    const doc = await prisma.document.findFirst({
      where: { id: documentId, organizationId: tenantId },
      select: { id: true, docNumber: true, title: true, status: true, type: true },
    });

    if (!doc) {
      return errorResponse("Document not found", "NOT_FOUND", 404);
    }

    const shares = await prisma.documentShare.findMany({
      where: { documentId, organizationId: tenantId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        recipientName: true,
        recipientEmail: true,
        recipientRole: true,
        signingOrder: true,
        requireOtp: true,
        allowDownload: true,
        status: true,
        expiresAt: true,
        viewedAt: true,
        revokedAt: true,
        completedAt: true,
        createdAt: true,
        customMessage: true,
        snapshot: {
          select: { version: true, contentHash: true },
        },
        signatures: {
          select: {
            id: true,
            signerName: true,
            signerEmail: true,
            signerRole: true,
            signatureType: true,
            createdAt: true,
          },
        },
      },
    });

    return successResponse({ document: doc, shares });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/v1/documents/[id]/shares
 * Creates a cryptographically secure document share link, freezes a document snapshot,
 * and dispatches an invitation email.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireTrustedOrigin(req);
    const { tenantId, user } = await requireTenantContext(req);
    const { id: documentId } = await params;

    const body = await req.json();
    const recipientRole = (body.recipientRole || "CLIENT").trim().toUpperCase();
    const signingOrder = Number(body.signingOrder) || 1;
    const customMessage = body.customMessage ? String(body.customMessage).trim() : null;
    const requireOtp = Boolean(body.requireOtp);
    const allowDownload = body.allowDownload !== false;
    const expiresInDays = Math.min(Math.max(Number(body.expiresInDays) || 30, 1), 90);
    const sendEmail = body.sendEmail !== false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let recipientsList: Array<{ name: string; email: string }> = [];

    if (Array.isArray(body.recipients) && body.recipients.length > 0) {
      recipientsList = body.recipients
        .map((r: any) => ({
          name: (r.name || r.email?.split("@")[0] || "Recipient").trim(),
          email: String(r.email || "").trim().toLowerCase(),
        }))
        .filter((r: any) => emailRegex.test(r.email));
    } else if (Array.isArray(body.recipientEmails) && body.recipientEmails.length > 0) {
      recipientsList = body.recipientEmails
        .map((e: any) => ({
          name: (body.recipientName || String(e).split("@")[0] || "Recipient").trim(),
          email: String(e).trim().toLowerCase(),
        }))
        .filter((r: any) => emailRegex.test(r.email));
    } else if (typeof body.recipientEmail === "string") {
      const splitEmails = body.recipientEmail
        .split(/[,;\s]+/)
        .map((e: string) => e.trim().toLowerCase())
        .filter((e: string) => emailRegex.test(e));
      
      const defaultName = (body.recipientName || "Recipient").trim();
      recipientsList = splitEmails.map((email: string) => ({
        name: defaultName,
        email,
      }));
    }

    if (recipientsList.length === 0) {
      return errorResponse("At least one valid recipient email is required.", "VALIDATION_ERROR", 400);
    }

    // Load document
    const doc = await prisma.document.findFirst({
      where: { id: documentId, organizationId: tenantId },
      include: { organization: true },
    });

    if (!doc) {
      return errorResponse("Document not found.", "NOT_FOUND", 404);
    }

    // 1. Freeze or retrieve document snapshot once
    const snapshot = await createDocumentSnapshot(doc.id, tenantId);

    // 2. Compute expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";

    const createdShares: Array<{
      shareId: string;
      rawToken: string;
      shareUrl: string;
      recipientName: string;
      recipientEmail: string;
      status: string;
      expiresAt: Date;
      requireOtp: boolean;
      allowDownload: boolean;
      emailSent: boolean;
      emailError?: string;
    }> = [];

    // 3. Process each recipient
    for (const target of recipientsList) {
      const rawToken = generateShareToken();
      const tokenHash = hashShareToken(rawToken);

      const share = await prisma.documentShare.create({
        data: {
          organizationId: tenantId,
          documentId: doc.id,
          snapshotId: snapshot.id,
          tokenHash,
          recipientName: target.name,
          recipientEmail: target.email,
          recipientRole,
          signingOrder,
          customMessage,
          requireOtp,
          allowDownload,
          status: "ACTIVE",
          expiresAt,
          createdByUserId: user.id,
        },
      });

      const shareUrl = `${protocol}://${host}/share/${rawToken}`;
      let emailSent = false;
      let emailError: string | undefined;

      if (sendEmail) {
        const emailPayload = {
          to: target.email,
          recipientName: target.name,
          organizationName: doc.organization.name,
          docTitle: doc.title,
          docNumber: doc.docNumber,
          docType: doc.type,
          shareUrl,
          expiresAtFormatted: expiresAt.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          customMessage,
        };

        enqueueDocumentSharedEmail(emailPayload).catch(() => {});
        const emailRes = await sendDocumentSharedEmail(emailPayload);
        emailSent = emailRes.success;
        emailError = emailRes.error;

        const reminderDelayMs = Math.max(0, expiresAt.getTime() - Date.now() - 24 * 60 * 60 * 1000);
        if (reminderDelayMs > 0) {
          enqueueSigningReminder(
            {
              shareId: share.id,
              recipientEmail: target.email,
              recipientName: target.name,
              organizationName: doc.organization.name,
              docTitle: doc.title,
              docNumber: doc.docNumber,
              shareUrl,
              expiresAtFormatted: emailPayload.expiresAtFormatted,
            },
            reminderDelayMs
          ).catch(() => {});
        }
      }

      createdShares.push({
        shareId: share.id,
        rawToken,
        shareUrl,
        recipientName: target.name,
        recipientEmail: target.email,
        status: share.status,
        expiresAt: share.expiresAt,
        requireOtp,
        allowDownload,
        emailSent,
        emailError,
      });
    }

    // 4. If document is in DRAFT, transition to SENT
    if (doc.status === "DRAFT") {
      await prisma.document.update({
        where: { id: doc.id },
        data: {
          status: "SENT",
          sentAt: new Date(),
        },
      });
    }

    // 5. Record audit log
    const recipientSummary = recipientsList.map((r) => `${r.name} (${r.email})`).join(", ");
    await recordAuditLog({
      organizationId: tenantId,
      userId: user.id,
      action: "SENT",
      details: `Document ${doc.docNumber} shared with ${recipientsList.length} recipient(s): ${recipientSummary}. Expires: ${expiresAt.toISOString()}`,
    });

    const primary = createdShares[0];
    return successResponse(
      {
        ...primary,
        shares: createdShares,
        totalRecipients: createdShares.length,
      },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
