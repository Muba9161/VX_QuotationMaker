import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { resolveShareByToken } from "@/lib/services/share-token";
import { generateSignedDocumentPdf, SignatureCertificateEntry, verifyPdfHash } from "@/lib/pdf/signed-pdf-generator";
import { QuotationPdfData } from "@/lib/pdf/quotation-pdf";
import { generateMouPdf, MouPdfData } from "@/lib/pdf/mou-pdf";
import { composePdfWithLetterhead } from "@/lib/pdf/letterhead-composer";
import {
  getTemplateSnapshot,
  getTemplateSnapshotOrigin,
} from "@/lib/services/document-snapshot";
import { renderQuotationPdf } from "@/lib/pdf/quotation-renderer";

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
    const isPreview = new URL(req.url).searchParams.get("preview") === "1";

    if (!isPreview && !share.allowDownload) {
      return NextResponse.json({ error: "DOWNLOAD_DISABLED", message: "Document download is disabled for this link." }, { status: 403 });
    }

    if (
      share.requireOtp &&
      req.cookies.get(`vorldx_otp_${share.id}`)?.value !== "verified"
    ) {
      return NextResponse.json(
        { error: "OTP_REQUIRED", message: "Complete email verification before viewing or downloading this document." },
        { status: 403, headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
      );
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
    const toPdfDate = (value: string | null): string | null => {
      const isoDate = value ? toIsoSafe(value) : null;
      return isoDate ? isoDate.split("T")[0] : null;
    };

    let quotationPdf: Uint8Array | null = null;

    if (document.type === "QUOTATION") {
      const savedTemplate = getTemplateSnapshot(snapshotJson);
      const templateOrigin = getTemplateSnapshotOrigin(snapshotJson);
      const templateWasSelected =
        Boolean(savedTemplate) ||
        Boolean(document.templateId) ||
        Boolean(templateOrigin && templateOrigin !== "none");
      const snapshotItems = Array.isArray(snapshotJson?.items)
        ? snapshotJson.items as Array<Record<string, unknown>>
        : null;
      const items = snapshotItems || document.items;
      const currentItemNames = new Map(
        document.items.map((item) => [item.id, item.name])
      );
      const getValue = <T,>(key: string, fallback: T): T => {
        const value = snapshotJson?.[key];
        return value === undefined || value === null ? fallback : value as T;
      };

      const quotationData: QuotationPdfData = {
        quotationNumber: snapshot?.docNumber || document.docNumber,
        title: snapshot?.title || document.title,
        issueDate: toPdfDate(
          getValue("issueDate", toIsoSafe(document.issueDate))
        ) || new Date().toISOString().split("T")[0],
        validTill: toPdfDate(getValue("validTill", toIsoSafe(document.validTill))),
        currencySymbol: getValue("currencySymbol", document.currencySymbol),
        subtotal: Number(getValue("subtotal", document.subtotal)),
        discountAmount: Number(getValue("discountAmount", document.discountAmount)),
        taxRate: Number(getValue("taxRate", document.taxRate)),
        taxAmount: Number(getValue("taxAmount", document.taxAmount)),
        grandTotal: Number(getValue("total", document.total)),
        paymentTerms: getValue("paymentTerms", document.paymentTerms),
        notes: getValue("notes", document.notes),
        termsAndConditions: getValue("termsAndConditions", document.termsAndConditions),
        client: {
          name: getValue("clientName", document.clientName),
          company: getValue("clientCompany", document.clientCompany) || document.contact?.companyName,
          email: getValue("clientEmail", document.clientEmail) || document.contact?.email,
          phone: getValue("clientPhone", document.clientPhone) || document.contact?.phone,
          address: getValue("clientAddress", document.clientAddress) || document.contact?.address,
        },
        organization: {
          name: organization.name,
          displayName: organization.displayName,
          email: organization.email,
          phone: organization.phone,
          address: organization.address,
          website: organization.website,
          taxId: organization.taxId,
          primaryColor: organization.primaryColor,
        },
        items: items.map((item) => ({
          name:
            typeof item.name === "string"
              ? item.name
              : typeof item.id === "string"
                ? currentItemNames.get(item.id) || null
                : null,
          description: String(item.description || ""),
          quantity: Number(item.quantity),
          unit: String(item.unit || ""),
          rate: Number(item.rate),
          discount: Number(item.discount || 0),
          taxPercent: Number(item.taxPercent || 0),
          amount: Number(item.amount),
        })),
      };

      const renderResult = await renderQuotationPdf({
        data: quotationData,
        organization,
        template: savedTemplate || document.template,
        templateWasSelected,
      });
      if (!renderResult.success) {
        return NextResponse.json(
          { error: renderResult.code, message: renderResult.message },
          {
            status: renderResult.status,
            headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
          }
        );
      }
      quotationPdf = renderResult.pdfBytes;
    }

    if (share.signatures && share.signatures.length > 0) {
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

      // Verify downloaded bytes match expected signed PDF hash stored in database
      const latestSig = share.signatures[share.signatures.length - 1];
      if (latestSig?.signedPdfHash) {
        verifyPdfHash(generated.pdfBytes, latestSig.signedPdfHash);
      }

      if (quotationPdf) {
        const quotationDocument = await PDFDocument.load(quotationPdf);
        const certificateDocument = await PDFDocument.load(generated.pdfBytes);
        const certificatePages = await quotationDocument.copyPages(
          certificateDocument,
          certificateDocument.getPageIndices()
        );
        certificatePages.forEach((page) => quotationDocument.addPage(page));
        pdfBytes = await quotationDocument.save();
      } else {
        pdfBytes = generated.pdfBytes;
      }
    } else {
      // Unsigned PDF
      if (document.type === "QUOTATION") {
        if (!quotationPdf) {
          throw new Error("The shared quotation PDF could not be rendered.");
        }
        pdfBytes = quotationPdf;
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

      // Apply organization letterhead to public download if enabled
      const shouldApply = organization.letterheadApplyMous !== false;

      if (organization.letterheadUrl && shouldApply) {
        pdfBytes = await composePdfWithLetterhead({
          generatedPdfBytes: pdfBytes,
          letterheadUrl: organization.letterheadUrl,
          applyToDocument: true,
          orgId: organization.id,
        });
      }
    }

    const filename = `${document.docNumber}${share.signatures?.length ? "-Signed" : ""}.pdf`;

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${isPreview ? "inline" : "attachment"}; filename="${filename}"`,
        "Cache-Control": "private, no-store, no-cache, must-revalidate",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error generating download";
    return NextResponse.json({ error: "INTERNAL_ERROR", message }, { status: 500 });
  }
}
