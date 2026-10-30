import { NextRequest, NextResponse } from "next/server";
import { resolveShareByToken } from "@/lib/services/share-token";
import { createAndSendOtp } from "@/lib/services/otp";
import { prisma } from "@/lib/prisma";
import { extractClientIp } from "@/lib/utils/client-ip";

/**
 * POST /api/v1/public/shares/[token]/otp
 * Generates and emails a 6-digit OTP code to the recipient.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const { ip: ipAddress } = extractClientIp(req);
    const userAgent = req.headers.get("user-agent") || "Unknown Client";

    const resolution = await resolveShareByToken(token);
    if (!resolution.valid) {
      return NextResponse.json({ error: "INVALID_TOKEN", message: "Document link is expired or invalid." }, { status: 404 });
    }

    const { share, document } = resolution;

    const otpRes = await createAndSendOtp(share.id, share.recipientEmail, share.recipientName, document.docNumber);

    if (!otpRes.success) {
      return NextResponse.json(
        { error: "RATE_LIMITED", message: otpRes.error, cooldownRemainingSeconds: otpRes.cooldownRemainingSeconds },
        { status: 429 }
      );
    }

    // Record access event
    await prisma.documentAccessEvent.create({
      data: {
        shareId: share.id,
        documentId: document.id,
        eventType: "OTP_REQUESTED",
        ipAddress,
        userAgent,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "A 6-digit verification code has been sent to your email.",
        expiresAt: otpRes.expiresAt,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error requesting OTP";
    return NextResponse.json({ error: "INTERNAL_ERROR", message }, { status: 500 });
  }
}
