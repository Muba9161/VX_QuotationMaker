import { jsPDF } from "jspdf";

export interface MouPdfData {
  mouNumber: string;
  title: string;
  effectiveDate?: string | null;
  expiryDate?: string | null;
  purpose?: string | null;
  governingLaw?: string | null;
  notes?: string | null;
  partyA: {
    name: string;
    displayName?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    signatoryName?: string | null;
    signatoryTitle?: string | null;
    primaryColor?: string | null;
  };
  partyB: {
    name: string;
    company?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  };
  clauses: Array<{
    title: string;
    content: string;
    sortOrder: number;
  }>;
}

/**
 * Builds a publication-grade Memorandum of Understanding (MOU) PDF.
 * Uses balanced A4 page layout (15mm margins, 180mm content width).
 */
export function generateMouPdf(data: MouPdfData): Uint8Array {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2; // 180mm
  let y = margin;

  const primaryColor = data.partyA.primaryColor || "#1e3a8a";
  const hex = primaryColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2) || "1e", 16);
  const g = parseInt(hex.substring(2, 4) || "3a", 16);
  const b = parseInt(hex.substring(4, 6) || "8a", 16);

  const addHeaderAndFooter = (currentPage: number, totalPages: number) => {
    // Top colored brand bar
    doc.setFillColor(r, g, b);
    doc.rect(0, 0, pageWidth, 4, "F");

    // Bottom footer divider
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `MEMORANDUM OF UNDERSTANDING • Ref: ${data.mouNumber}`,
      margin,
      pageHeight - 7
    );
    doc.text(`Page ${currentPage} of ${totalPages}`, pageWidth - margin, pageHeight - 7, {
      align: "right",
    });
  };

  const ensureSpace = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 20) {
      doc.addPage();
      y = margin + 6;
    }
  };

  // ================= 1. DOCUMENT HEADER =================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(r, g, b);
  doc.text("MEMORANDUM OF UNDERSTANDING", pageWidth / 2, y + 2, { align: "center" });
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Reference No: ${data.mouNumber}`, pageWidth / 2, y, { align: "center" });
  y += 8;

  // Title / Subject
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  const titleLines = doc.splitTextToSize(data.title, contentWidth - 20);
  doc.text(titleLines, pageWidth / 2, y, { align: "center" });
  y += titleLines.length * 5 + 4;

  // Metadata ribbon
  const metaItems = [
    `Effective Date: ${data.effectiveDate || "Upon Signing"}`,
    data.expiryDate ? `Expiry Date: ${data.expiryDate}` : "Duration: Perpetual / Ongoing",
    `Jurisdiction: ${data.governingLaw || "Indian Law"}`,
  ];
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(metaItems.join("  •  "), pageWidth / 2, y, { align: "center" });
  y += 7;

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 7;

  // ================= 2. PARTIES SECTION =================
  ensureSpace(42);
  const boxWidth = (contentWidth - 6) / 2;

  // Party A (First Party)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, boxWidth, 34, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(r, g, b);
  doc.text("FIRST PARTY (ORGANIZATION):", margin + 4, y + 5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  const orgName = data.partyA.displayName || data.partyA.name;
  doc.text(orgName, margin + 4, y + 10.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  const pAContact = [data.partyA.address, data.partyA.email, data.partyA.phone]
    .filter(Boolean)
    .join(" • ");
  const splitPA = doc.splitTextToSize(pAContact || "No contact info", boxWidth - 8);
  doc.text(splitPA, margin + 4, y + 15.5);

  // Party B (Second Party / Counterparty)
  const pBX = margin + boxWidth + 6;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(pBX, y, boxWidth, 34, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(r, g, b);
  doc.text("SECOND PARTY (PARTNER):", pBX + 4, y + 5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  const partyBHeading = data.partyB.company
    ? `${data.partyB.company} (${data.partyB.name})`
    : data.partyB.name;
  doc.text(partyBHeading, pBX + 4, y + 10.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  const pBContact = [data.partyB.address, data.partyB.email, data.partyB.phone]
    .filter(Boolean)
    .join(" • ");
  const splitPB = doc.splitTextToSize(pBContact || "No contact info", boxWidth - 8);
  doc.text(splitPB, pBX + 4, y + 15.5);

  y += 40;

  // Purpose Preamble
  if (data.purpose) {
    ensureSpace(20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text("Preamble & Purpose:", margin, y);
    y += 4.5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    const splitPurpose = doc.splitTextToSize(data.purpose, contentWidth);
    doc.text(splitPurpose, margin, y);
    y += splitPurpose.length * 4.2 + 6;
  }

  // ================= 3. STRUCTURED CLAUSES =================
  data.clauses.forEach((clause, index) => {
    ensureSpace(24);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(r, g, b);
    doc.text(`Article ${index + 1}.  ${clause.title}`, margin, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const splitContent = doc.splitTextToSize(clause.content, contentWidth - 4);

    for (let i = 0; i < splitContent.length; i++) {
      ensureSpace(5);
      doc.text(splitContent[i], margin + 2, y);
      y += 4.2;
    }
    y += 4;
  });

  // Additional Notes
  if (data.notes) {
    ensureSpace(20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text("Special Terms & Addenda:", margin, y);
    y += 4.5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    const splitNotes = doc.splitTextToSize(data.notes, contentWidth);
    doc.text(splitNotes, margin, y);
    y += splitNotes.length * 4.2 + 6;
  }

  // ================= 4. SIGNATURE EXECUTION BLOCKS =================
  ensureSpace(45);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    "IN WITNESS WHEREOF, the parties hereto have executed this Memorandum of Understanding as of the effective date.",
    margin,
    y
  );
  y += 10;

  const sigBoxW = (contentWidth - 10) / 2;

  // Party A Signature Line
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y + 16, margin + sigBoxW, y + 16);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  const pASigName = data.partyA.signatoryName || "Authorized Signatory";
  doc.text(pASigName, margin, y + 20.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(data.partyA.signatoryTitle || "First Party Representative", margin, y + 24.5);
  doc.text(orgName, margin, y + 28.5);

  // Party B Signature Line
  const sigBX = margin + sigBoxW + 10;
  doc.line(sigBX, y + 16, sigBX + sigBoxW, y + 16);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(data.partyB.name, sigBX, y + 20.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(data.partyB.company || "Second Party Representative", sigBX, y + 24.5);
  doc.text("Counterparty Signature Placeholder", sigBX, y + 28.5);

  // Stamp headers and footers across all generated pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    addHeaderAndFooter(p, totalPages);
  }

  return new Uint8Array(doc.output("arraybuffer"));
}
