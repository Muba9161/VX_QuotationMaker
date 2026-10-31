import { prisma } from "@/lib/prisma";
import { resolveShareByToken } from "./share-token";
import { generateSignedDocumentPdf, SignatureCertificateEntry } from "@/lib/pdf/signed-pdf-generator";
import { sendDocumentSignedEmail, isMockOrPlaceholderEmail } from "@/lib/email-templates/sharing-emails";
import { recordAuditLog } from "@/lib/audit";
import { saveDocumentFile } from "@/lib/storage/document-storage";
import { enqueueSignatureCompletedEmail } from "@/lib/queue/queue-manager";

export interface SubmitSignatureInput {
  rawToken: string;
  signerName: string;
  signerEmail: string;
  signatureType: "DRAWN" | "TYPED";
  signatureData: string;
  consentAccepted: boolean;
  consentVersion?: string;
  consentStatement: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function processDocumentSignature(input: SubmitSignatureInput) {
  // 1. Resolve token
  const resolution = await resolveShareByToken(input.rawToken);
  if (!resolution.valid) {
    return { success: false, error: "INVALID_LINK", message: "This document share link is expired or invalid." };
  }

  const { share, document, snapshot, organization } = resolution;

  // 2. Check if already completed (idempotency)
  if (share.status === "COMPLETED") {
    return { success: false, error: "ALREADY_SIGNED", message: "This document has already been signed by this recipient." };
  }

  // 3. Validation and Signer Identity Binding
  const name = (input.signerName || "").trim();
  const verifiedEmail = (share.recipientEmail || "").trim().toLowerCase();
  const submittedEmail = (input.signerEmail || "").trim().toLowerCase();

  // Validate legal name
  if (name.length < 2 || !/[a-zA-Z]/.test(name)) {
    return { success: false, error: "VALIDATION_ERROR", message: "Please enter your full legal name." };
  }

  // Prevent client from overriding the verified recipient email or bypassing via empty email
  if (!submittedEmail || (verifiedEmail && submittedEmail !== verifiedEmail)) {
    return {
      success: false,
      error: "IDENTITY_MISMATCH",
      message: "Signer email is required and must match the designated recipient for this share link.",
    };
  }

  // Enforce OTP verification if configured for this share
  if (share.requireOtp) {
    const verifiedOtp = await prisma.documentOtp.findFirst({
      where: {
        shareId: share.id,
        verifiedAt: { not: null },
        expiresAt: { gte: new Date() },
      },
    });

    if (!verifiedOtp) {
      return {
        success: false,
        error: "OTP_REQUIRED",
        message: "Identity verification is required before signing. Please complete email verification first.",
      };
    }
  }

  if (!input.consentAccepted) {
    return { success: false, error: "CONSENT_REQUIRED", message: "You must review and accept the electronic signature consent." };
  }
  if (!input.signatureData || input.signatureData.trim().length === 0) {
    return { success: false, error: "SIGNATURE_REQUIRED", message: "Please provide a valid signature." };
  }

  // 4. Sequential Signing Check for MOUs
  if (document.type === "MOU" && share.signingOrder > 1) {
    const priorIncomplete = await prisma.documentShare.findFirst({
      where: {
        documentId: document.id,
        signingOrder: { lt: share.signingOrder },
        status: { not: "COMPLETED" },
      },
    });
    if (priorIncomplete) {
      return {
        success: false,
        error: "ORDER_RESTRICTED",
        message: `This MOU is configured for sequential signing. Please wait until prior signatories have completed signing.`,
      };
    }
  }

  const snapshotHash = snapshot?.contentHash || "UNHASHED_SNAPSHOT";

  // 5. Atomic transaction: create signature, update share status, record access event
  let result;
  try {
    result = await prisma.$transaction(async (tx) => {
      // Re-check share status inside transaction to prevent concurrent double-signing race conditions
      const currentShare = await tx.documentShare.findUnique({
        where: { id: share.id },
        select: { status: true },
      });

      if (!currentShare || currentShare.status === "COMPLETED") {
        throw new Error("ALREADY_COMPLETED");
      }

      // Create DocumentSignature
      const sig = await tx.documentSignature.create({
        data: {
          organizationId: document.organizationId,
          documentId: document.id,
          shareId: share.id,
          signerName: name,
          signerEmail: verifiedEmail,
          signerRole: share.recipientRole,
          signatureType: input.signatureType,
          signatureData: input.signatureData,
          consentStatement: input.consentStatement,
          consentVersion: input.consentVersion || "1.0",
          consentAcceptedAt: new Date(),
          ipAddress: input.ipAddress || null,
          userAgent: input.userAgent || null,
          snapshotHash,
        },
      });

      // Mark share completed
      await tx.documentShare.update({
        where: { id: share.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });

      // Consume OTP record upon signature creation to prevent replay
      if (share.requireOtp) {
        await tx.documentOtp.deleteMany({
          where: { shareId: share.id },
        });
      }

      // Record Access Event
    await tx.documentAccessEvent.create({
      data: {
        shareId: share.id,
        documentId: document.id,
        eventType: "SIGNATURE_SUBMITTED",
        ipAddress: input.ipAddress || null,
        userAgent: input.userAgent || null,
        metadata: {
          signerName: name,
          signerEmail: verifiedEmail,
          signatureType: input.signatureType,
        },
      },
    });

    // Check Multi-party completion
    const allShares = await tx.documentShare.findMany({
      where: { documentId: document.id, status: { not: "REVOKED" } },
    });

    const isFullySigned =
      document.type === "QUOTATION"
        ? true
        : allShares.length > 0 && allShares.every((s) => s.id === share.id || s.status === "COMPLETED");

    const newStatus = isFullySigned ? "SIGNED" : "PENDING_SIGNATURE";

    await tx.document.update({
      where: { id: document.id },
      data: {
        status: newStatus,
        signedAt: isFullySigned ? new Date() : undefined,
      },
    });

    return { sig, isFullySigned, newStatus };
  });
  } catch (txErr: unknown) {
    if (txErr instanceof Error && txErr.message === "ALREADY_COMPLETED") {
      return { success: false, error: "ALREADY_SIGNED", message: "This document has already been signed by this recipient." };
    }
    throw txErr;
  }

  // 6. Generate signed PDF certificate asynchronously / post-transaction
  const allSigs = await prisma.documentSignature.findMany({
    where: { documentId: document.id },
    orderBy: { createdAt: "asc" },
  });

  const certEntries: SignatureCertificateEntry[] = allSigs.map((s) => ({
    signerName: s.signerName,
    signerEmail: s.signerEmail,
    signerRole: s.signerRole,
    signatureType: s.signatureType,
    signatureData: s.signatureData,
    consentStatement: s.consentStatement,
    consentAcceptedAt: s.consentAcceptedAt,
    ipAddress: s.ipAddress,
    userAgent: s.userAgent,
    snapshotHash: s.snapshotHash,
  }));

  const { pdfBytes, pdfHash } = generateSignedDocumentPdf({
    docType: document.type as "QUOTATION" | "MOU",
    signatures: certEntries,
    snapshotHash,
  });

  // Persist final executed PDF to tenant-isolated storage
  try {
    const filename = `${document.docNumber}-Final-Signed.pdf`;
    await saveDocumentFile(
      document.organizationId,
      document.id,
      filename,
      Buffer.from(pdfBytes),
      "signed"
    );
  } catch {
    // Non-fatal if storage directory cannot be written immediately
  }

  await prisma.documentSignature.update({
    where: { id: result.sig.id },
    data: { signedPdfHash: pdfHash },
  });

  // 7. Audit log & email notification
  await recordAuditLog({
    organizationId: document.organizationId,
    userId: null,
    action: result.isFullySigned ? "SIGNED" : "SIGNATURE_STARTED",
    details: `Document ${document.docNumber} signed by ${name} (${verifiedEmail}). Status: ${result.newStatus} (PDF Hash: ${pdfHash})`,
  });

  // Notify organization (skip mock demo domains to prevent mailer-daemon bounces)
  if (organization.email && !isMockOrPlaceholderEmail(organization.email)) {
    enqueueSignatureCompletedEmail({
      to: organization.email,
      recipientName: organization.name,
      signerName: name,
      signerEmail: verifiedEmail,
      organizationName: organization.name,
      docTitle: document.title,
      docNumber: document.docNumber,
      docType: document.type,
      executedAtFormatted: new Date().toISOString(),
    }).catch(() => {
      sendDocumentSignedEmail(organization.email, name, document.docNumber, document.title, result.isFullySigned).catch(() => {});
    });
  }

  return {
    success: true,
    signatureId: result.sig.id,
    isFullySigned: result.isFullySigned,
    documentStatus: result.newStatus,
    pdfHash,
  };
}
