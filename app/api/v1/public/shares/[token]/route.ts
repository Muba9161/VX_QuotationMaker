import { NextRequest, NextResponse } from "next/server";
import { resolveShareByToken } from "@/lib/services/share-token";
import { maskEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { extractClientIp } from "@/lib/utils/client-ip";

/**
 * GET /api/v1/public/shares/[token]
 * Public endpoint for clients to load shared documents safely via 256-bit opaque tokens.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const { ip: ipAddress } = extractClientIp(req);
    const userAgent = req.headers.get("user-agent") || "Unknown Client";

    const resolution = await resolveShareByToken(token);

    if (!resolution.valid) {
      if (resolution.reason === "REVOKED") {
        return NextResponse.json(
          {
            error: "REVOKED",
            message: "This document share link has been revoked by the sender. Access is no longer permitted.",
          },
          { status: 410, headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
        );
      }
      if (resolution.reason === "EXPIRED") {
        return NextResponse.json(
          {
            error: "EXPIRED",
            message: "This document share link has expired. Please contact the sender to request a renewed link.",
          },
          { status: 410, headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
        );
      }
      return NextResponse.json(
        {
          error: "NOT_FOUND",
          message: "The requested document link is invalid or does not exist.",
        },
        { status: 404, headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
      );
    }

    const { share, document, organization, snapshot } = resolution;

    // Check if OTP is required and whether client has verified OTP in cookies
    const otpVerifiedCookie = req.cookies.get(`vorldx_otp_${share.id}`)?.value;
    const isOtpRequired = share.requireOtp && otpVerifiedCookie !== "verified";

    // Record access event asynchronously
    prisma.documentAccessEvent
      .create({
        data: {
          shareId: share.id,
          documentId: document.id,
          eventType: isOtpRequired ? "TOKEN_OPENED" : "DOCUMENT_VIEWED",
          ipAddress,
          userAgent,
        },
      })
      .catch(() => {});

    // If OTP required, do not return document contents yet
    if (isOtpRequired) {
      return NextResponse.json(
        {
          status: "OTP_REQUIRED",
          requiresOtp: true,
          recipientName: share.recipientName,
          recipientEmailMasked: maskEmail(share.recipientEmail),
          organization: {
            name: organization.name,
            logoUrl: organization.logoUrl,
            primaryColor: organization.primaryColor,
          },
          docNumber: document.docNumber,
          docType: document.type,
          title: document.title,
        },
        { status: 200, headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
      );
    }

    // Update viewedAt and document status if it was SENT
    if (!share.viewedAt) {
      prisma.documentShare
        .update({
          where: { id: share.id },
          data: { viewedAt: new Date() },
        })
        .catch(() => {});
    }

    if (document.status === "SENT") {
      prisma.document
        .update({
          where: { id: document.id },
          data: { status: "VIEWED", viewedAt: new Date() },
        })
        .catch(() => {});
    }

    // Determine document data from immutable snapshot if present, else live document
    const snapshotJson = (snapshot?.contentJson || null) as Record<string, unknown> | null;

    const toIsoSafe = (d: unknown): string | null => {
      if (!d) return null;
      if (d instanceof Date) return d.toISOString();
      if (typeof d === "string") return d;
      try {
        return new Date(d as string | number).toISOString();
      } catch {
        return null;
      }
    };

    const publicDoc = {
      id: document.id,
      docNumber: snapshot?.docNumber || document.docNumber,
      title: snapshot?.title || document.title,
      type: document.type,
      status: document.status,
      clientName: (snapshotJson?.clientName as string) || document.clientName,
      clientCompany: (snapshotJson?.clientCompany as string) || document.clientCompany,
      clientEmail: (snapshotJson?.clientEmail as string) || document.clientEmail,
      clientPhone: (snapshotJson?.clientPhone as string) || document.clientPhone,
      clientAddress: (snapshotJson?.clientAddress as string) || document.clientAddress,
      currencySymbol: (snapshotJson?.currencySymbol as string) || document.currencySymbol,
      subtotal: Number(snapshotJson?.subtotal ?? document.subtotal),
      taxRate: Number(snapshotJson?.taxRate ?? document.taxRate),
      taxAmount: Number(snapshotJson?.taxAmount ?? document.taxAmount),
      discountAmount: Number(snapshotJson?.discountAmount ?? document.discountAmount),
      total: Number(snapshotJson?.total ?? document.total),
      issueDate: (snapshotJson?.issueDate as string) || toIsoSafe(document.issueDate) || "",
      validTill: (snapshotJson?.validTill as string) || toIsoSafe(document.validTill),
      effectiveDate: (snapshotJson?.effectiveDate as string) || toIsoSafe(document.effectiveDate),
      expiryDate: (snapshotJson?.expiryDate as string) || toIsoSafe(document.expiryDate),
      paymentTerms: (snapshotJson?.paymentTerms as string) || document.paymentTerms,
      notes: (snapshotJson?.notes as string) || document.notes,
      termsAndConditions: (snapshotJson?.termsAndConditions as string) || document.termsAndConditions,
      governingLaw: (snapshotJson?.governingLaw as string) || document.governingLaw,
      purpose: (snapshotJson?.purpose as string) || document.purpose,
      items: (snapshotJson?.items as Array<unknown>) || document.items,
      clauses: (snapshotJson?.clauses as Array<unknown>) || document.clauses,
      snapshotVersion: snapshot?.version || 1,
      snapshotHash: snapshot?.contentHash || null,
    };

    return NextResponse.json(
      {
        status: share.status,
        share: {
          id: share.id,
          recipientName: share.recipientName,
          recipientEmail: share.recipientEmail,
          recipientRole: share.recipientRole,
          signingOrder: share.signingOrder,
          allowDownload: share.allowDownload,
          expiresAt: share.expiresAt,
          customMessage: share.customMessage,
        },
        organization,
        document: publicDoc,
        signatures: share.signatures,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
        },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: "INTERNAL_ERROR", message }, { status: 500 });
  }
}
