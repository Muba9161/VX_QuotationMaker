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
  letterheadApplied?: boolean;
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
  templateImageBase64?: string | null;
  templateImageFormat?: "PNG" | "JPEG";
}

export function generateQuotationPdf(data: QuotationPdfData): Uint8Array {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  const contentBottom = pageHeight - 18;
  const primaryColor = data.organization.primaryColor || "#2563eb";
  const colorHex = /^#[0-9a-f]{6}$/i.test(primaryColor) ? primaryColor.slice(1) : "2563eb";
  const color = [
    parseInt(colorHex.slice(0, 2), 16),
    parseInt(colorHex.slice(2, 4), 16),
    parseInt(colorHex.slice(4, 6), 16),
  ] as const;
  const pageContentStart = data.letterheadApplied ? 68 : margin + 3;
  const columns = {
    number: { x: margin, width: 8 },
    description: { x: margin + 8, width: 76 },
    quantity: { x: margin + 84, width: 14 },
    unit: { x: margin + 98, width: 16 },
    rate: { x: margin + 114, width: 30 },
    amount: { x: margin + 144, width: 38 },
  };
  let y = margin;

  const formatMoney = (value: number) => {
    const formatted = new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number.isFinite(value) ? value : 0);
    const symbol = data.currencySymbol === "₹" ? "INR" : data.currencySymbol.trim();
    return symbol ? `${symbol} ${formatted}` : formatted;
  };

  const drawRightFit = (
    text: string,
    rightX: number,
    baseline: number,
    maxWidth: number,
    fontSize: number,
    bold = false,
    textColor: readonly [number, number, number] = [15, 23, 42]
  ) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(...textColor);
    let fittedSize = fontSize;
    while (doc.getTextWidth(text) > maxWidth && fittedSize > 6) {
      fittedSize -= 0.25;
      doc.setFontSize(fittedSize);
    }
    doc.text(text, rightX, baseline, { align: "right" });
  };

  const renderTableHeader = () => {
    doc.setFillColor(...color);
    doc.rect(margin, y, contentWidth, 9, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("#", columns.number.x + 2, y + 5.8);
    doc.text("Item & Description", columns.description.x + 2, y + 5.8);
    doc.text("Qty", columns.quantity.x + columns.quantity.width - 1, y + 5.8, { align: "right" });
    doc.text("Unit", columns.unit.x + columns.unit.width / 2, y + 5.8, { align: "center" });
    doc.text("Rate", columns.rate.x + columns.rate.width - 2, y + 5.8, { align: "right" });
    doc.text("Amount", columns.amount.x + columns.amount.width - 2, y + 5.8, { align: "right" });
    y += 9;
  };

  const addPage = (withTableHeader = false) => {
    doc.addPage();
    y = pageContentStart;
    if (withTableHeader) renderTableHeader();
  };

  const ensureSpace = (height: number, withTableHeader = false) => {
    if (y + height > contentBottom) addPage(withTableHeader);
  };

  const drawPageChrome = (page: number, totalPages: number) => {
    doc.setFillColor(...color);
    doc.rect(0, 0, pageWidth, 3.5, "F");
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    const orgDisplayName = data.organization.displayName || data.organization.name;
    doc.text(`${orgDisplayName} | Quotation ${data.quotationNumber}`, margin, pageHeight - 7);
    doc.text(`Page ${page} of ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: "right" });
  };

  const orgDisplayName = data.organization.displayName || data.organization.name;
  const headerTop = margin + 5;

  if (data.letterheadApplied) {
    y = pageContentStart;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(19);
    doc.setTextColor(...color);
    doc.text("QUOTATION", margin, y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(`Quotation #: ${data.quotationNumber}`, pageWidth - margin, y - 2, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(`Date of Issue: ${data.issueDate}`, pageWidth - margin, y + 3, { align: "right" });
    if (data.validTill) {
      doc.text(`Valid Till: ${data.validTill}`, pageWidth - margin, y + 8, { align: "right" });
    }
    y += 15;
  } else {
    let logoWidth = 0;
    if (data.templateImageBase64) {
      try {
        const imageInfo = doc.getImageProperties(data.templateImageBase64);
        const scale = Math.min(20 / imageInfo.width, 15 / imageInfo.height);
        logoWidth = imageInfo.width * scale;
        doc.addImage(
          data.templateImageBase64,
          data.templateImageFormat || "PNG",
          margin,
          headerTop,
          logoWidth,
          imageInfo.height * scale,
          undefined,
          "FAST"
        );
      } catch {
        logoWidth = 0;
      }
    }

    const orgX = margin + Math.max(logoWidth + 4, 0);
    const orgMaxWidth = 104 - Math.max(logoWidth + 4, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(15, 23, 42);
    const splitOrgName = doc.splitTextToSize(orgDisplayName, orgMaxWidth);
    doc.text(splitOrgName, orgX, headerTop + 4);

    const orgContactLines = [
      data.organization.address,
      [data.organization.email, data.organization.phone, data.organization.website].filter(Boolean).join(" | "),
      data.organization.taxId ? `GST / Tax ID: ${data.organization.taxId}` : "",
    ].filter(Boolean);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    const contactText = doc.splitTextToSize(orgContactLines.join("\n"), orgMaxWidth);
    const contactY = headerTop + splitOrgName.length * 5 + 2;
    doc.text(contactText, orgX, contactY);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...color);
    doc.text("QUOTATION", pageWidth - margin, headerTop + 4, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`Quotation #: ${data.quotationNumber}`, pageWidth - margin, headerTop + 11, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(`Date of Issue: ${data.issueDate}`, pageWidth - margin, headerTop + 16, { align: "right" });
    if (data.validTill) {
      doc.text(`Valid Till: ${data.validTill}`, pageWidth - margin, headerTop + 21, { align: "right" });
    }

    y = Math.max(
      headerTop + splitOrgName.length * 5 + contactText.length * 3.8 + 5,
      headerTop + (data.validTill ? 25 : 20)
    );
    y += 5;
  }

  const clientHeading = data.client.company
    ? `${data.client.company} - Attn: ${data.client.name}`
    : data.client.name;
  const clientLines = doc.splitTextToSize(clientHeading, contentWidth - 10);
  const clientDetails = [
    data.client.address,
    data.client.email,
    data.client.phone,
  ].filter(Boolean).join(" | ");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const clientDetailLines = doc.splitTextToSize(clientDetails || "No address provided", contentWidth - 10);
  const clientCardHeight = Math.max(23, 9 + clientLines.length * 4.5 + clientDetailLines.length * 3.8);
  ensureSpace(clientCardHeight + 10);
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, clientCardHeight, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...color);
  doc.text("QUOTATION PREPARED FOR:", margin + 5, y + 5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(clientLines, margin + 5, y + 10);
  const clientDetailsY = y + 10 + clientLines.length * 4.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(clientDetailLines, margin + 5, clientDetailsY);
  y += clientCardHeight + 7;

  const titleLines = doc.splitTextToSize(`Subject: ${data.title}`, contentWidth);
  const titleHeight = Math.max(6, titleLines.length * 5);
  ensureSpace(titleHeight + 4);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(titleLines, margin, y + 4);
  y += titleHeight + 4;

  renderTableHeader();

  const lineHeight = 4;
  data.items.forEach((item, index) => {
    doc.setFont("helvetica", item.name ? "bold" : "normal");
    doc.setFontSize(8);
    const description = item.name ? `${item.name}\n${item.description}` : item.description;
    const descriptionLines = doc.splitTextToSize(description, columns.description.width - 4) as string[];
    let lineIndex = 0;
    let firstSegment = true;

    while (lineIndex < descriptionLines.length) {
      const availableHeight = contentBottom - y;
      if (availableHeight < 9) addPage(true);
      const usableHeight = contentBottom - y;
      const maxLines = Math.max(1, Math.floor((usableHeight - 4) / lineHeight));
      const segment = descriptionLines.slice(lineIndex, lineIndex + maxLines);
      const rowHeight = segment.length * lineHeight + 4;

      if (index % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, contentWidth, rowHeight, "F");
      }

      if (firstSegment) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(String(index + 1), columns.number.x + 2, y + 5);
        doc.setTextColor(71, 85, 105);
        doc.text(String(item.quantity), columns.quantity.x + columns.quantity.width - 1, y + 5, { align: "right" });
        doc.text(item.unit || "Nos", columns.unit.x + columns.unit.width / 2, y + 5, { align: "center" });
        drawRightFit(
          formatMoney(item.rate),
          columns.rate.x + columns.rate.width - 2,
          y + 5,
          columns.rate.width - 3,
          7.5,
          false,
          [71, 85, 105]
        );
        drawRightFit(
          formatMoney(item.amount),
          columns.amount.x + columns.amount.width - 2,
          y + 5,
          columns.amount.width - 3,
          8,
          true
        );
      }

      segment.forEach((line, segmentIndex) => {
        const currentLine = lineIndex + segmentIndex;
        const isItemName = Boolean(item.name) && currentLine === 0;
        doc.setFont("helvetica", isItemName ? "bold" : "normal");
        doc.setFontSize(8);
        const lineColor = isItemName ? [15, 23, 42] : [71, 85, 105];
        doc.setTextColor(lineColor[0], lineColor[1], lineColor[2]);
        doc.text(line, columns.description.x + 2, y + 5 + segmentIndex * lineHeight);
      });

      y += rowHeight;
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y, pageWidth - margin, y);
      lineIndex += segment.length;
      firstSegment = false;
      if (lineIndex < descriptionLines.length) addPage(true);
    }
  });

  const summaryRows = data.discountAmount > 0 ? 4 : 2;
  const summaryHeight = summaryRows * 6 + 13;
  ensureSpace(summaryHeight + 8);
  y += 4;
  const summaryWidth = 84;
  const summaryX = pageWidth - margin - summaryWidth;
  const amountRightX = pageWidth - margin - 2;
  const summaryAmountWidth = summaryWidth - 6;

  const drawSummaryRow = (label: string, value: string, valueColor: readonly [number, number, number] = [15, 23, 42]) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(label, summaryX, y);
    drawRightFit(value, amountRightX, y, summaryAmountWidth, 8.5, true, valueColor);
    y += 5.5;
  };

  drawSummaryRow("Subtotal:", formatMoney(data.subtotal));
  if (data.discountAmount > 0) {
    drawSummaryRow("Total Discount:", `- ${formatMoney(data.discountAmount)}`, [185, 28, 28]);
    drawSummaryRow("Taxable Amount:", formatMoney(Math.max(0, data.subtotal - data.discountAmount)));
  }
  drawSummaryRow(`Tax / GST (${data.taxRate}%):`, formatMoney(data.taxAmount));

  y += 1;
  ensureSpace(14);
  doc.setFillColor(...color);
  doc.roundedRect(summaryX - 3, y - 4, summaryWidth + 3, 11, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("Grand Total:", summaryX + 2, y + 3);
  drawRightFit(formatMoney(data.grandTotal), amountRightX - 1, y + 3, summaryAmountWidth - 2, 9.5, true, [255, 255, 255]);
  y += 14;

  const termEntries = [
    data.paymentTerms ? `Payment: ${data.paymentTerms}` : null,
    data.deliveryTerms ? `Delivery: ${data.deliveryTerms}` : null,
    data.notes ? `Notes: ${data.notes}` : null,
    data.termsAndConditions ? `Terms: ${data.termsAndConditions}` : null,
  ].filter((entry): entry is string => Boolean(entry));

  if (termEntries.length > 0) {
    ensureSpace(11);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text("Terms & Conditions", margin, y + 4);
    y += 8;

    termEntries.forEach((entry) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      const wrapped = doc.splitTextToSize(`- ${entry}`, contentWidth - 4) as string[];
      wrapped.forEach((line) => {
        if (y + 4 > contentBottom) {
          addPage();
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.setTextColor(15, 23, 42);
          doc.text("Terms & Conditions (continued)", margin, y + 4);
          y += 8;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(71, 85, 105);
        }
        doc.setTextColor(71, 85, 105);
        doc.text(line, margin + 2, y + 3);
        y += 4;
      });
    });
    y += 4;
  }

  ensureSpace(34);
  const signatoryWidth = 62;
  const signatoryX = pageWidth - margin - signatoryWidth;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`For ${orgDisplayName}`, signatoryX, y + 3);
  doc.setDrawColor(148, 163, 184);
  doc.line(signatoryX, y + 19, pageWidth - margin, y + 19);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(data.organization.signatoryName || "Authorized Signatory", signatoryX, y + 23);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(data.organization.signatoryTitle || "Executive", signatoryX, y + 27);

  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page);
    drawPageChrome(page, totalPages);
  }

  return new Uint8Array(doc.output("arraybuffer"));
}
