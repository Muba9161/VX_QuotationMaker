import { NextRequest, NextResponse } from "next/server";
import { resolveShareByToken } from "@/lib/services/share-token";
import { prisma } from "@/lib/prisma";
import { recordAuditLog } from "@/lib/audit";
import { extractClientIp } from "@/lib/utils/client-ip";

/**
 * POST /api/v1/public/shares/[token]/decline
 * Allows recipient to decline the quotation or MOU with an optional reason.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const { ip: ipAddress } = extractClientIp(req);
    const userAgent = req.headers.get("user-agent") || "Unknown Client";

    const body = await req.json().catch(() => ({}));
    const reason = (body.reason || "Declined by recipient").trim();

    const resolution = await resolveShareByToken(token);
    if (!resolution.valid) {
      return NextResponse.json({ error: "INVALID_TOKEN", message: "Document link is expired or invalid." }, { status: 404 });
    }

    const { share, document } = resolution;

    if (share.status === "COMPLETED" || document.status === "SIGNED") {
      return NextResponse.json({ error: "ALREADY_SIGNED", message: "This document has already been signed." }, { status: 400 });
    }

    // Claim both records conditionally so a concurrent signature cannot be overwritten.
    await prisma.$transaction(async (tx) => {
      const claimedShare = await tx.documentShare.updateMany({
        where: {
          id: share.id,
          status: { notIn: ["COMPLETED", "DECLINED", "REVOKED", "EXPIRED"] },
        },
        data: { status: "DECLINED" },
      });

      if (claimedShare.count !== 1) {
        throw new Error("DOCUMENT_NOT_ACTIONABLE");
      }

      const claimedDocument = await tx.document.updateMany({
        where: {
          id: document.id,
          status: { notIn: ["SIGNED", "DECLINED", "REVOKED", "EXPIRED"] },
        },
        data: { status: "DECLINED" },
      });

      if (claimedDocument.count !== 1) {
        throw new Error("DOCUMENT_NOT_ACTIONABLE");
      }

      await tx.documentAccessEvent.create({
        data: {
          shareId: share.id,
          documentId: document.id,
          eventType: "DOCUMENT_DECLINED",
          ipAddress,
          userAgent,
          metadata: { reason },
        },
      });
    });

    await recordAuditLog({
      organizationId: document.organizationId,
      action: "DECLINED",
      details: `Document ${document.docNumber} was declined by ${share.recipientName} (${share.recipientEmail}). Reason: ${reason}`,
    });

    return NextResponse.json(
      {
        success: true,
        message: "You have declined this document.",
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      }
    );
  } catch (err) {
    if (err instanceof Error && err.message === "DOCUMENT_NOT_ACTIONABLE") {
      return NextResponse.json(
        { error: "DOCUMENT_NOT_ACTIONABLE", message: "This document is no longer available for a response." },
        { status: 400 }
      );
    }
    const message = err instanceof Error ? err.message : "Error declining document";
    return NextResponse.json({ error: "INTERNAL_ERROR", message }, { status: 500 });
  }
}
