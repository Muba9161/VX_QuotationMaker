import { NextRequest, NextResponse } from "next/server";
import { resolveShareByToken } from "@/lib/services/share-token";
import { generateSignedDocumentPdf, SignatureCertificateEntry, verifyPdfHash } from "@/lib/pdf/signed-pdf-generator";
import { generateQuotationPdf, QuotationPdfData } from "@/lib/pdf/quotation-pdf";
import { generateMouPdf, MouPdfData } from "@/lib/pdf/mou-pdf";

/**
 * GET /api/v1/public/shares/[token]/download
 * Streams the document PDF (or signed PDF if executed) to the external recipient.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const resolution = await resolveShareByToken(token);
    if (!resolution.valid) {
      return NextResponse.json({ error: "INVALID_TOKEN", message: "Document link is expired or invalid." }, { status: 404 });
    }

    const { share, document, snapshot, organization } = resolution;

    if (!share.allowDownload) {
      return NextResponse.json({ error: "DOWNLOAD_DISABLED", message: "Document download is disabled for this link." }, { status: 403 });
    }

    const snapshotJson = (snapshot?.contentJson || null) as Record<string, unknown> | null;
    const snapshotHash = snapshot?.contentHash || "SNAPSHOT";

    let pdfBytes: Uint8Array;

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

    if (share.signatures && share.signatures.length > 0) {
      // Generate signed PDF
      const certEntries: SignatureCertificateEntry[] = share.signatures.map((s) => ({
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
        docType: document.type as "QUOTATION" | "MOU",
        signatures: certEntries,
        snapshotHash,
      });
      pdfBytes = generated.pdfBytes;

      // Verify downloaded bytes match expected signed PDF hash stored in database
      const latestSig = share.signatures[share.signatures.length - 1];
      if (latestSig?.signedPdfHash) {
        verifyPdfHash(pdfBytes, latestSig.signedPdfHash);
      }
    } else {
      // Unsigned PDF
      if (document.type === "QUOTATION") {
        const qData: QuotationPdfData = {
          quotationNumber: document.docNumber,
          title: document.title,
          issueDate: toIsoSafe(document.issueDate) || new Date().toISOString(),
          validTill: toIsoSafe(document.validTill),
          currencySymbol: document.currencySymbol,
          subtotal: Number(snapshotJson?.subtotal ?? document.subtotal),
          discountAmount: Number(snapshotJson?.discountAmount ?? document.discountAmount),
          taxRate: Number(snapshotJson?.taxRate ?? document.taxRate),
          taxAmount: Number(snapshotJson?.taxAmount ?? document.taxAmount),
          grandTotal: Number(snapshotJson?.total ?? document.total),
          paymentTerms: document.paymentTerms,
          notes: document.notes,
          termsAndConditions: document.termsAndConditions,
          client: {
            name: document.clientName,
            company: document.clientCompany,
            email: document.clientEmail,
            phone: document.clientPhone,
            address: document.clientAddress,
          },
          organization: {
            name: organization.name,
            email: organization.email,
            phone: organization.phone,
            address: organization.address,
            website: organization.website,
            taxId: organization.taxId,
            primaryColor: organization.primaryColor,
          },
          items: document.items.map((it: { name?: string | null; description: string; quantity: unknown; unit: string; rate: unknown; taxPercent: unknown; amount: unknown }) => ({
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
          mouNumber: document.docNumber,
          title: document.title,
          effectiveDate: toIsoSafe(document.effectiveDate),
          expiryDate: toIsoSafe(document.expiryDate),
          purpose: document.purpose,
          governingLaw: document.governingLaw,
          notes: document.notes,
          partyA: {
            name: organization.name,
            email: organization.email,
            phone: organization.phone,
            address: organization.address,
            primaryColor: organization.primaryColor,
          },
          partyB: {
            name: document.clientName,
            company: document.clientCompany,
            email: document.clientEmail,
            phone: document.clientPhone,
            address: document.clientAddress,
          },
          clauses: document.clauses.map((c: { title: string; content: string; sortOrder: number }) => ({
            title: c.title,
            content: c.content,
            sortOrder: c.sortOrder,
          })),
        };
        pdfBytes = generateMouPdf(mData);
      }
    }

    const filename = `${document.docNumber}${share.signatures?.length ? "-Signed" : ""}.pdf`;

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error generating download";
    return NextResponse.json({ error: "INTERNAL_ERROR", message }, { status: 500 });
  }
}
