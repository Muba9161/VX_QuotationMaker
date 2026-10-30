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

    if (share.status === "COMPLETED") {
      return NextResponse.json({ error: "ALREADY_SIGNED", message: "This document has already been signed." }, { status: 400 });
    }

    // Atomically update share and document status
    await prisma.$transaction([
      prisma.documentShare.update({
        where: { id: share.id },
        data: { status: "DECLINED" },
      }),
      prisma.document.update({
        where: { id: document.id },
        data: { status: "DECLINED" },
      }),
      prisma.documentAccessEvent.create({
        data: {
          shareId: share.id,
          documentId: document.id,
          eventType: "DOCUMENT_DECLINED",
          ipAddress,
          userAgent,
          metadata: { reason },
        },
      }),
    ]);

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
    const message = err instanceof Error ? err.message : "Error declining document";
    return NextResponse.json({ error: "INTERNAL_ERROR", message }, { status: 500 });
  }
}
