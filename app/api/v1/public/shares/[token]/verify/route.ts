import { NextRequest, NextResponse } from "next/server";
import { resolveShareByToken } from "@/lib/services/share-token";
import { verifySubmittedOtp } from "@/lib/services/otp";
import { prisma } from "@/lib/prisma";
import { extractClientIp } from "@/lib/utils/client-ip";

/**
 * POST /api/v1/public/shares/[token]/verify
 * Verifies submitted OTP code and sets an HTTP-only secure cookie for this share session.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const { ip: ipAddress } = extractClientIp(req);
    const userAgent = req.headers.get("user-agent") || "Unknown Client";

    const body = await req.json();
    const code = (body.code || "").trim();

    const resolution = await resolveShareByToken(token);
    if (!resolution.valid) {
      return NextResponse.json({ error: "INVALID_TOKEN", message: "Document link is expired or invalid." }, { status: 404 });
    }

    const { share, document } = resolution;

    const verifyResult = await verifySubmittedOtp(share.id, code);

    if (!verifyResult.valid) {
      return NextResponse.json(
        {
          error: verifyResult.reason,
          message: verifyResult.message,
          remainingAttempts: verifyResult.remainingAttempts,
        },
        { status: 400 }
      );
    }

    // Record access event
    await prisma.documentAccessEvent.create({
      data: {
        shareId: share.id,
        documentId: document.id,
        eventType: "OTP_VERIFIED",
        ipAddress,
        userAgent,
      },
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Identity verified successfully.",
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      }
    );

    // Set secure cookie valid for 4 hours
    response.cookies.set(`vorldx_otp_${share.id}`, "verified", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 4 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error verifying code";
    return NextResponse.json({ error: "INTERNAL_ERROR", message }, { status: 500 });
  }
}
