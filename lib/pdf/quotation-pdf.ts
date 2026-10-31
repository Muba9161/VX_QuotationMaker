import { jsPDF } from "jspdf";
export interface QuotationPdfData {
  quotationNumber: string;
  title: string;
  issueDate: string;
  validTill?: string | null;
  currencySymbol: string;
  subtotal: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
  paymentTerms?: string | null;
  deliveryTerms?: string | null;
  notes?: string | null;
  termsAndConditions?: string | null;
  client: {
    name: string;
    company?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  };
  organization: {
    name: string;
    displayName?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    website?: string | null;
    taxId?: string | null;
    primaryColor?: string | null;
    signatoryName?: string | null;
    signatoryTitle?: string | null;
  };
  items: Array<{
    name?: string | null;
    description: string;
    quantity: number;
    unit: string;
    rate: number;
    discount?: number | null;
    taxPercent?: number | null;
    amount: number;
  }>;
}

/**
 * Builds a publication-grade, professional multi-page commercial Quotation PDF.
 * Uses balanced A4 page geometry (14mm margins, 182mm content width).
 */
export function generateQuotationPdf(data: QuotationPdfData): Uint8Array {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm
  let y = margin;

  const primaryColor = data.organization.primaryColor || "#2563eb";
  const hex = primaryColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2) || "25", 16);
  const g = parseInt(hex.substring(2, 4) || "63", 16);
  const b = parseInt(hex.substring(4, 6) || "eb", 16);

  // Column geometry (Total = 182mm)
  const colW = {
    num: 8,
    desc: 82,
    qty: 16,
    unit: 16,
    rate: 28,
    amt: 32,
  };
  const colX = {
    num: margin + 1,
    desc: margin + colW.num + 2,
    qty: margin + colW.num + colW.desc + colW.qty,
    unit: margin + colW.num + colW.desc + colW.qty + colW.unit / 2 + 1,
    rate: margin + colW.num + colW.desc + colW.qty + colW.unit + colW.rate,
    amt: margin + contentWidth - 2,
  };

  const renderTableHeader = () => {
    doc.setFillColor(r, g, b);
    doc.rect(margin, y, contentWidth, 8, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text("#", colX.num + 1, y + 5.2);
    doc.text("Item & Description", colX.desc, y + 5.2);
    doc.text("Qty", colX.qty, y + 5.2, { align: "right" });
    doc.text("Unit", colX.unit, y + 5.2, { align: "center" });
    doc.text("Rate", colX.rate, y + 5.2, { align: "right" });
    doc.text("Amount", colX.amt, y + 5.2, { align: "right" });
    y += 8;
  };

  const ensureSpace = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 20) {
      doc.addPage();
      y = margin + 6;
      renderTableHeader();
    }
  };

  const addHeaderAndFooter = (currentPage: number, totalPages: number) => {
    // Top colored brand strip
    doc.setFillColor(r, g, b);
    doc.rect(0, 0, pageWidth, 4, "F");

    // Bottom footer rule
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    const orgDisplayName = data.organization.displayName || data.organization.name;
    doc.text(
      `${orgDisplayName} • Quotation ${data.quotationNumber} • Commercial Proposal`,
      margin,
      pageHeight - 7
    );
    doc.text(`Page ${currentPage} of ${totalPages}`, pageWidth - margin, pageHeight - 7, {
      align: "right",
    });
  };

  // ================= 1. HEADER =================
  const orgDisplayName = data.organization.displayName || data.organization.name;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text(orgDisplayName, margin, y + 2);

  doc.setFontSize(22);
  doc.setTextColor(r, g, b);
  doc.text("QUOTATION", pageWidth - margin, y + 3, { align: "right" });
  y += 8;

  // Organization sub-details on left, Meta details on right
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);

  const orgContactLines: string[] = [];
  if (data.organization.address) orgContactLines.push(data.organization.address);
  const contactRow = [data.organization.email, data.organization.phone, data.organization.website]
    .filter(Boolean)
    .join(" | ");
  if (contactRow) orgContactLines.push(contactRow);
  if (data.organization.taxId) orgContactLines.push(`GST / Tax ID: ${data.organization.taxId}`);

  const splitOrg = doc.splitTextToSize(orgContactLines.join("\n"), 105);
  doc.text(splitOrg, margin, y);

  const metaRightX = pageWidth - margin;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`Quotation #: ${data.quotationNumber}`, metaRightX, y, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`Date of Issue: ${data.issueDate}`, metaRightX, y + 4.5, { align: "right" });
  if (data.validTill) {
    doc.text(`Valid Till: ${data.validTill}`, metaRightX, y + 9, { align: "right" });
  }

  y += Math.max(splitOrg.length * 4.2 + 6, 18);

  // ================= 2. CLIENT "BILLED TO" CARD =================
  ensureSpace(26);
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 23, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(r, g, b);
  doc.text("QUOTATION PREPARED FOR:", margin + 5, y + 5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  const clientHeading = data.client.company
    ? `${data.client.company} — Attn: ${data.client.name}`
    : data.client.name;
  doc.text(clientHeading, margin + 5, y + 10.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  const clientDetails = [data.client.address, data.client.email, data.client.phone]
    .filter(Boolean)
    .join(" • ");
  const splitClient = doc.splitTextToSize(clientDetails || "No address provided", contentWidth - 10);
  doc.text(splitClient[0] || "", margin + 5, y + 16);
  y += 28;

  // ================= 3. PROPOSAL TITLE =================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`Subject: ${data.title}`, margin, y);
  y += 6;

  // ================= 4. LINE ITEMS TABLE =================
  renderTableHeader();

  data.items.forEach((item, index) => {
    const itemFullText = item.name ? `${item.name}\n${item.description}` : item.description;
    const splitDesc = doc.splitTextToSize(itemFullText, colW.desc - 4);
    const rowHeight = Math.max(splitDesc.length * 4.2 + 5, 8.5);

    ensureSpace(rowHeight);

    // Subtle alternate row shading
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, rowHeight, "F");
    }

    // Row item index
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(String(index + 1), colX.num + 1, y + 5);

    // Description
    if (item.name) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(splitDesc[0] || "", colX.desc, y + 5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      for (let i = 1; i < splitDesc.length; i++) {
        doc.text(splitDesc[i], colX.desc, y + 5 + i * 4);
      }
    } else {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      for (let i = 0; i < splitDesc.length; i++) {
        doc.text(splitDesc[i], colX.desc, y + 5 + i * 4);
      }
    }

    // Quantity, Unit, Rate, Amount
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(String(item.quantity), colX.qty, y + 5, { align: "right" });
    doc.text(item.unit || "Nos", colX.unit, y + 5, { align: "center" });
    doc.text(
      `${data.currencySymbol} ${item.rate.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      colX.rate,
      y + 5,
      { align: "right" }
    );

    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(
      `${data.currencySymbol} ${item.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      colX.amt,
      y + 5,
      { align: "right" }
    );

    y += rowHeight;
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y, pageWidth - margin, y);
  });

  y += 5;
  ensureSpace(48);

  // ================= 5. FINANCIAL SUMMARY =================
  const summaryWidth = 84;
  const summaryX = pageWidth - margin - summaryWidth;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("Subtotal:", summaryX, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(
    `${data.currencySymbol} ${data.subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
    colX.amt,
    y,
    { align: "right" }
  );
  y += 5.5;

  if (data.discountAmount > 0) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Total Discount:", summaryX, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(220, 38, 38);
    doc.text(
      `- ${data.currencySymbol} ${data.discountAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      colX.amt,
      y,
      { align: "right" }
    );
    y += 5.5;

    // Display Taxable Amount after discount
    const taxableAmount = Math.max(0, data.subtotal - data.discountAmount);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Taxable Amount:", summaryX, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(
      `${data.currencySymbol} ${taxableAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      colX.amt,
      y,
      { align: "right" }
    );
    y += 5.5;
  }

  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Tax (${data.taxRate}%):`, summaryX, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(
    `${data.currencySymbol} ${data.taxAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
    colX.amt,
    y,
    { align: "right" }
  );
  y += 6.5;

  // Prominent Grand Total block
  doc.setFillColor(r, g, b);
  doc.roundedRect(summaryX - 3, y - 4, summaryWidth + 3, 10, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(255, 255, 255);
  doc.text("Grand Total:", summaryX + 2, y + 2.5);
  doc.text(
    `${data.currencySymbol} ${data.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
    colX.amt - 1,
    y + 2.5,
    { align: "right" }
  );
  y += 16;

  // ================= 6. TERMS & SIGNATURE =================
  ensureSpace(42);

  // Left column: Terms, Notes
  const termsWidth = contentWidth - summaryWidth - 10;
  let termY = y;

  if (data.paymentTerms || data.deliveryTerms || data.notes || data.termsAndConditions) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text("Terms & Conditions:", margin, termY);
    termY += 4.5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);

    if (data.paymentTerms) {
      doc.text(`• Payment: ${data.paymentTerms}`, margin + 2, termY);
      termY += 4;
    }
    if (data.deliveryTerms) {
      doc.text(`• Delivery: ${data.deliveryTerms}`, margin + 2, termY);
      termY += 4;
    }
    if (data.notes) {
      const splitNotes = doc.splitTextToSize(`• Notes: ${data.notes}`, termsWidth);
      doc.text(splitNotes, margin + 2, termY);
      termY += splitNotes.length * 3.8;
    }
    if (data.termsAndConditions) {
      const splitTC = doc.splitTextToSize(`• ${data.termsAndConditions}`, termsWidth);
      doc.text(splitTC, margin + 2, termY);
      termY += splitTC.length * 3.8;
    }
  }

  // Right column: Authorized Signatory Block
  const sigX = pageWidth - margin - 60;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`For ${orgDisplayName}`, sigX, y);

  doc.setDrawColor(203, 213, 225);
  doc.line(sigX, y + 20, pageWidth - margin, y + 20);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  const signatory = data.organization.signatoryName || "Authorized Signatory";
  doc.text(signatory, sigX, y + 24.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  const sigTitle = data.organization.signatoryTitle || "Executive";
  doc.text(sigTitle, sigX, y + 28.5);

  // Stamp headers and footers across all generated pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    addHeaderAndFooter(p, totalPages);
  }

  return new Uint8Array(doc.output("arraybuffer"));
}
