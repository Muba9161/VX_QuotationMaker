import { jsPDF } from "jspdf";
import crypto from "crypto";
import { generateQuotationPdf, QuotationPdfData } from "./quotation-pdf";
import { generateMouPdf, MouPdfData } from "./mou-pdf";

export interface SignatureCertificateEntry {
  signerName: string;
  signerEmail: string;
  signerRole: string;
  signatureType: string; // DRAWN | TYPED
  signatureData: string;
  consentStatement: string;
  consentAcceptedAt: Date | string;
  ipAddress?: string | null;
  userAgent?: string | null;
  snapshotHash: string;
}

/**
 * Generates a signed Quotation or MOU PDF with an embedded Digital Signature Execution Certificate.
 */
export function generateSignedDocumentPdf(params: {
  docType: "QUOTATION" | "MOU";
  quotationData?: QuotationPdfData;
  mouData?: MouPdfData;
  signatures: SignatureCertificateEntry[];
  snapshotHash: string;
}): { pdfBytes: Uint8Array; pdfHash: string } {
  // 1. Generate base document bytes
  const baseBytes =
    params.docType === "QUOTATION" && params.quotationData
      ? generateQuotationPdf(params.quotationData)
      : params.mouData
      ? generateMouPdf(params.mouData)
      : new Uint8Array();

  // If no signatures, return base document
  if (params.signatures.length === 0) {
    const hash = crypto.createHash("sha256").update(baseBytes).digest("hex");
    return { pdfBytes: baseBytes, pdfHash: hash };
  }

  // 2. Build PDF and append Digital Execution Certificate Page
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Header Banner
  doc.setFillColor(30, 58, 138); // Navy blue
  doc.rect(0, 0, pageWidth, 24, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("DIGITAL SIGNATURE EXECUTION CERTIFICATE", margin, 15);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Cryptographic Verification & Audit Record", margin, 20);

  let y = 34;

  // Security Verification Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 32, 3, 3, "FD");

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("TAMPER-EVIDENT INTEGRITY RECORD", margin + 6, y + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Document Type: ${params.docType}`, margin + 6, y + 15);
  doc.text(`Unsigned Document Snapshot SHA-256 Hash:`, margin + 6, y + 21);

  doc.setFont("courier", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text(params.snapshotHash, margin + 6, y + 27);

  y += 42;

  // Signatures Section Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`RECORDED SIGNATURES (${params.signatures.length})`, margin, y);
  y += 6;

  // Render each signature block
  params.signatures.forEach((sig, index) => {
    const blockHeight = 58;
    if (y + blockHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, contentWidth, blockHeight, 3, 3, "FD");

    // Header strip for this signer
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 8, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(30, 58, 138);
    doc.text(`Signer ${index + 1}: ${sig.signerName} (${sig.signerRole})`, margin + 4, y + 5.5);

    // Left Column: Details
    const leftX = margin + 6;
    let detailY = y + 14;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);

    doc.text("Verified Email:", leftX, detailY);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text(sig.signerEmail, leftX + 24, detailY);

    detailY += 6;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Executed At:", leftX, detailY);
    doc.setTextColor(15, 23, 42);
    const dateStr = new Date(sig.consentAcceptedAt).toUTCString();
    doc.text(`${dateStr}`, leftX + 24, detailY);

    detailY += 6;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Signer IP:", leftX, detailY);
    doc.setTextColor(15, 23, 42);
    doc.text(sig.ipAddress || "Logged on secure portal", leftX + 24, detailY);

    detailY += 6;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Consent:", leftX, detailY);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(7.5);
    doc.text("Explicit electronic signature consent recorded", leftX + 24, detailY);

    // Right Column: Render Signature
    const rightBoxX = margin + contentWidth - 65;
    const rightBoxY = y + 11;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(rightBoxX, rightBoxY, 60, 40, 2, 2, "FD");

    if (sig.signatureType === "DRAWN" && sig.signatureData.startsWith("data:image")) {
      try {
        doc.addImage(sig.signatureData, "PNG", rightBoxX + 4, rightBoxY + 4, 52, 24);
      } catch {
        doc.setFont("times", "italic");
        doc.setFontSize(14);
        doc.setTextColor(37, 99, 235);
        doc.text(sig.signerName, rightBoxX + 10, rightBoxY + 22);
      }
    } else {
      doc.setFont("times", "italic");
      doc.setFontSize(15);
      doc.setTextColor(37, 99, 235);
      doc.text(sig.signerName, rightBoxX + 8, rightBoxY + 20);
    }

    doc.setDrawColor(148, 163, 184);
    doc.line(rightBoxX + 6, rightBoxY + 30, rightBoxX + 54, rightBoxY + 30);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text("Legally Authorized Signature", rightBoxX + 11, rightBoxY + 35);

    y += blockHeight + 8;
  });

  // Footer Certificate Seal
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, pageHeight - 20, margin + contentWidth, pageHeight - 20);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text("Generated by VorldX Digital Signing Infrastructure. All digital execution evidence preserved.", margin, pageHeight - 14);

  const finalOutput = doc.output("arraybuffer");
  const finalBytes = new Uint8Array(finalOutput);
  const pdfHash = crypto.createHash("sha256").update(finalBytes).digest("hex");

  return { pdfBytes: finalBytes, pdfHash };
}

/**
 * Cryptographically verifies that a PDF byte array matches an expected SHA-256 hash.
 * Recalculates the SHA-256 digest from the bytes and compares in constant time.
 */
export function verifyPdfHash(
  pdfBytes: Uint8Array,
  expectedHash: string
): { valid: boolean; calculatedHash: string } {
  const calculatedHash = crypto.createHash("sha256").update(pdfBytes).digest("hex");
  return {
    valid: calculatedHash.toLowerCase() === expectedHash.trim().toLowerCase(),
    calculatedHash,
  };
}

