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
    const recipientName = (body.recipientName || "").trim();
    const recipientEmail = (body.recipientEmail || "").trim().toLowerCase();
    const recipientRole = (body.recipientRole || "CLIENT").trim().toUpperCase();
    const signingOrder = Number(body.signingOrder) || 1;
    const customMessage = body.customMessage ? String(body.customMessage).trim() : null;
    const requireOtp = Boolean(body.requireOtp);
    const allowDownload = body.allowDownload !== false;
    const expiresInDays = Math.min(Math.max(Number(body.expiresInDays) || 30, 1), 90);
    const sendEmail = body.sendEmail !== false;

    if (!recipientName) {
      return errorResponse("Recipient name is required.", "VALIDATION_ERROR", 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!recipientEmail || !emailRegex.test(recipientEmail)) {
      return errorResponse("Valid recipient email is required.", "VALIDATION_ERROR", 400);
    }

    // Load document
    const doc = await prisma.document.findFirst({
      where: { id: documentId, organizationId: tenantId },
      include: { organization: true },
    });

    if (!doc) {
      return errorResponse("Document not found.", "NOT_FOUND", 404);
    }

    // 1. Freeze or retrieve document snapshot
    const snapshot = await createDocumentSnapshot(doc.id, tenantId);

    // 2. Generate 256-bit secure token and hash
    const rawToken = generateShareToken();
    const tokenHash = hashShareToken(rawToken);

    // 3. Compute expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // 4. Create DocumentShare atomically
    const share = await prisma.documentShare.create({
      data: {
        organizationId: tenantId,
        documentId: doc.id,
        snapshotId: snapshot.id,
        tokenHash,
        recipientName,
        recipientEmail,
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

    // 5. If document is in DRAFT, transition to SENT
    if (doc.status === "DRAFT") {
      await prisma.document.update({
        where: { id: doc.id },
        data: {
          status: "SENT",
          sentAt: new Date(),
        },
      });
    }

    // 6. Record audit log
    await recordAuditLog({
      organizationId: tenantId,
      userId: user.id,
      action: "SENT",
      details: `Document ${doc.docNumber} shared with ${recipientName} (${recipientEmail}). Expires: ${expiresAt.toISOString()}`,
    });

    // 7. Determine public share URL
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const shareUrl = `${protocol}://${host}/share/${rawToken}`;

    // 8. Dispatch email if requested (non-blocking)
    let emailSent = false;
    let emailError: string | undefined;

    if (sendEmail) {
      const emailPayload = {
        to: recipientEmail,
        recipientName,
        organizationName: doc.organization.name,
        docTitle: doc.title,
        docNumber: doc.docNumber,
        docType: doc.type,
        shareUrl,
        expiresAtFormatted: expiresAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        customMessage,
      };

      try {
        await enqueueDocumentSharedEmail(emailPayload);
        emailSent = true;
      } catch {
        const emailRes = await sendDocumentSharedEmail(emailPayload);
        emailSent = emailRes.success;
        emailError = emailRes.error;
      }

      // Schedule automated reminder 24 hours before expiration if window permits
      const reminderDelayMs = Math.max(0, expiresAt.getTime() - Date.now() - 24 * 60 * 60 * 1000);
      if (reminderDelayMs > 0) {
        enqueueSigningReminder(
          {
            shareId: share.id,
            recipientEmail,
            recipientName,
            organizationName: doc.organization.name,
            docTitle: doc.title,
            docNumber: doc.docNumber,
            shareUrl,
            expiresAtFormatted: expiresAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
          },
          reminderDelayMs
        ).catch(() => {});
      }
    }

    return successResponse(
      {
        shareId: share.id,
        rawToken,
        shareUrl,
        recipientName,
        recipientEmail,
        status: share.status,
        expiresAt: share.expiresAt,
        requireOtp,
        allowDownload,
        emailSent,
        emailError,
      },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
