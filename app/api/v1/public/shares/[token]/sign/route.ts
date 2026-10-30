import { NextRequest, NextResponse } from "next/server";
import { processDocumentSignature } from "@/lib/services/signing-service";
import { extractClientIp } from "@/lib/utils/client-ip";

/**
 * POST /api/v1/public/shares/[token]/sign
 * Captures explicit electronic signature and legal consent from the recipient.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const { ip: ipAddress } = extractClientIp(req);
    const userAgent = req.headers.get("user-agent") || "Unknown Client";

    const body = await req.json();

    const result = await processDocumentSignature({
      rawToken: token,
      signerName: body.signerName,
      signerEmail: body.signerEmail,
      signatureType: body.signatureType === "TYPED" ? "TYPED" : "DRAWN",
      signatureData: body.signatureData,
      consentAccepted: Boolean(body.consentAccepted),
      consentVersion: body.consentVersion || "1.0",
      consentStatement: body.consentStatement || "I confirm that I have reviewed this document and agree to sign it electronically.",
      ipAddress,
      userAgent,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, message: result.message },
        {
          status: result.error === "ORDER_RESTRICTED" ? 403 : 400,
          headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: result.isFullySigned
          ? "Document successfully executed and signed by all parties."
          : "Your signature has been successfully recorded. Awaiting remaining signatories.",
        isFullySigned: result.isFullySigned,
        documentStatus: result.documentStatus,
        signatureId: result.signatureId,
        pdfHash: result.pdfHash,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error submitting signature";
    return NextResponse.json({ error: "INTERNAL_ERROR", message }, { status: 500 });
  }
}
