import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantContext } from "@/lib/auth/guards";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

/**
 * GET /api/v1/documents/[id]/signatures
 * Lists all signature records, legal consent details, timestamps, IP/UA, and audit hashes.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { tenantId } = await requireTenantContext(req);
    const { id: documentId } = await params;

    const doc = await prisma.document.findFirst({
      where: { id: documentId, organizationId: tenantId },
      select: { id: true, docNumber: true, title: true, type: true, status: true, signedAt: true },
    });

    if (!doc) {
      return errorResponse("Document not found", "NOT_FOUND", 404);
    }

    const signatures = await prisma.documentSignature.findMany({
      where: { documentId, organizationId: tenantId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        signerName: true,
        signerEmail: true,
        signerRole: true,
        signatureType: true,
        signatureData: true,
        consentStatement: true,
        consentVersion: true,
        consentAcceptedAt: true,
        ipAddress: true,
        userAgent: true,
        snapshotHash: true,
        signedPdfHash: true,
        createdAt: true,
        share: {
          select: {
            id: true,
            recipientName: true,
            recipientEmail: true,
            signingOrder: true,
            requireOtp: true,
          },
        },
      },
    });

    return successResponse({
      document: doc,
      signatures,
      totalSignatures: signatures.length,
      isFullySigned: doc.status === "SIGNED",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

