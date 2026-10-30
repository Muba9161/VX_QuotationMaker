import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantContext } from "@/lib/auth/guards";
import { generateSignedDocumentPdf, SignatureCertificateEntry, verifyPdfHash } from "@/lib/pdf/signed-pdf-generator";
import { generateQuotationPdf, QuotationPdfData } from "@/lib/pdf/quotation-pdf";
import { generateMouPdf, MouPdfData } from "@/lib/pdf/mou-pdf";

/**
 * GET /api/v1/documents/[id]/signed-pdf
 * Generates and streams the finalized signed PDF with execution certificates for organization users.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { tenantId } = await requireTenantContext(req);
    const { id: documentId } = await params;

    const doc = await prisma.document.findFirst({
      where: { id: documentId, organizationId: tenantId },
      include: {
        organization: true,
        items: { orderBy: { sortOrder: "asc" } },
        clauses: { orderBy: { sortOrder: "asc" } },
        snapshots: { orderBy: { version: "desc" }, take: 1 },
        phase4Signatures: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!doc) {
      return NextResponse.json({ error: "NOT_FOUND", message: "Document not found" }, { status: 404 });
    }

    const snapshot = doc.snapshots[0] || null;
    const snapshotJson = (snapshot?.contentJson || null) as Record<string, unknown> | null;
    const snapshotHash = snapshot?.contentHash || "SNAPSHOT";

    let pdfBytes: Uint8Array;

    if (doc.phase4Signatures.length > 0) {
      const certEntries: SignatureCertificateEntry[] = doc.phase4Signatures.map((s) => ({
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

      const generated = generateSignedDocumentPdf({
        docType: doc.type as "QUOTATION" | "MOU",
        signatures: certEntries,
        snapshotHash,
      });
      pdfBytes = generated.pdfBytes;

      const latestSig = doc.phase4Signatures[doc.phase4Signatures.length - 1];
      if (latestSig?.signedPdfHash) {
        verifyPdfHash(pdfBytes, latestSig.signedPdfHash);
      }
    } else {
      // Unsigned PDF fallback
      if (doc.type === "QUOTATION") {
        const qData: QuotationPdfData = {
          quotationNumber: doc.docNumber,
          title: doc.title,
          issueDate: doc.issueDate.toISOString(),
          validTill: doc.validTill ? doc.validTill.toISOString() : null,
          currencySymbol: doc.currencySymbol,
          subtotal: Number(snapshotJson?.subtotal ?? doc.subtotal),
          discountAmount: Number(snapshotJson?.discountAmount ?? doc.discountAmount),
          taxRate: Number(snapshotJson?.taxRate ?? doc.taxRate),
          taxAmount: Number(snapshotJson?.taxAmount ?? doc.taxAmount),
          grandTotal: Number(snapshotJson?.total ?? doc.total),
          paymentTerms: doc.paymentTerms,
          notes: doc.notes,
          termsAndConditions: doc.termsAndConditions,
          client: {
            name: doc.clientName,
            company: doc.clientCompany,
            email: doc.clientEmail,
            phone: doc.clientPhone,
            address: doc.clientAddress,
          },
          organization: {
            name: doc.organization.name,
            email: doc.organization.email,
            phone: doc.organization.phone,
            address: doc.organization.address,
            website: doc.organization.website,
            taxId: doc.organization.taxId,
            primaryColor: doc.organization.primaryColor,
          },
          items: doc.items.map((it) => ({
            name: it.name,
            description: it.description,
            quantity: Number(it.quantity),
            unit: it.unit,
            rate: Number(it.rate),
            taxPercent: Number(it.taxPercent),
            amount: Number(it.amount),
          })),
        };
        pdfBytes = generateQuotationPdf(qData);
      } else {
        const mData: MouPdfData = {
          mouNumber: doc.docNumber,
          title: doc.title,
          effectiveDate: doc.effectiveDate ? doc.effectiveDate.toISOString() : null,
          expiryDate: doc.expiryDate ? doc.expiryDate.toISOString() : null,
          purpose: doc.purpose,
          governingLaw: doc.governingLaw,
          notes: doc.notes,
          partyA: {
            name: doc.organization.name,
            email: doc.organization.email,
            phone: doc.organization.phone,
            address: doc.organization.address,
            primaryColor: doc.organization.primaryColor,
          },
          partyB: {
            name: doc.clientName,
            company: doc.clientCompany,
            email: doc.clientEmail,
            phone: doc.clientPhone,
            address: doc.clientAddress,
          },
          clauses: doc.clauses.map((c) => ({
            title: c.title,
            content: c.content,
            sortOrder: c.sortOrder,
          })),
        };
        pdfBytes = generateMouPdf(mData);
      }
    }

    const filename = `${doc.docNumber}-Final-Signed.pdf`;

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error generating signed PDF";
    return NextResponse.json({ error: "INTERNAL_ERROR", message }, { status: 500 });
  }
}
