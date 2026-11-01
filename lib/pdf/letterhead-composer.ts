import { PDFDocument } from "pdf-lib";
import { readTenantAsset } from "@/lib/storage/upload";

export interface LetterheadCompositionOptions {
  generatedPdfBytes: Uint8Array;
  letterheadUrl?: string | null;
  letterheadBuffer?: Buffer | null;
  letterheadMimeType?: string | null;
  orgId?: string | null;
  applyToDocument?: boolean;
}

/**
 * Extracts orgId and filename from a branding asset publicUrl.
 * e.g. /api/v1/organization/branding/asset/org-123/letterhead-abc.pdf -> { orgId: 'org-123', filename: 'letterhead-abc.pdf' }
 */
export function parseAssetUrl(url: string): { orgId: string; filename: string } | null {
  if (!url) return null;
  const match = url.match(/\/asset\/([^/]+)\/([^/?#]+)/);
  if (!match || !match[1] || !match[2]) return null;
  return { orgId: match[1], filename: match[2] };
}

/**
 * Composes a generated quotation or MOU PDF with an uploaded letterhead (PDF or Image).
 *
 * Guarantees:
 * 1. Background Layering: Letterhead renders underneath document content.
 * 2. Multi-page Consistency: Consistently applies across multi-page proposals.
 * 3. 100% Vector Integrity: PDF-to-PDF embedding avoids low-quality screenshot downsampling.
 * 4. Graceful Fallback: If no letterhead is configured or applyToDocument is false, returns original PDF untouched.
 */
export async function composePdfWithLetterhead(
  options: LetterheadCompositionOptions
): Promise<Uint8Array> {
  const { generatedPdfBytes, letterheadUrl, applyToDocument } = options;

  if (applyToDocument === false || (!letterheadUrl && !options.letterheadBuffer)) {
    return generatedPdfBytes;
  }

  try {
    let letterheadBytes: Buffer | null = options.letterheadBuffer || null;
    let mime = options.letterheadMimeType || "";

    if (!letterheadBytes && letterheadUrl) {
      const parsed = parseAssetUrl(letterheadUrl);
      if (parsed) {
        const asset = await readTenantAsset(parsed.orgId, parsed.filename, "letterhead");
        if (asset) {
          letterheadBytes = asset.buffer;
          mime = asset.mimeType;
        }
      }
    }

    if (!letterheadBytes || letterheadBytes.length === 0) {
      return generatedPdfBytes;
    }

    const isPdf =
      mime === "application/pdf" ||
      (letterheadUrl && letterheadUrl.toLowerCase().endsWith(".pdf")) ||
      letterheadBytes.slice(0, 5).toString("ascii").startsWith("%PDF-");

    // Load generated document with pdf-lib
    const baseDoc = await PDFDocument.load(generatedPdfBytes);
    const composedDoc = await PDFDocument.create();

    if (isPdf) {
      // 1. Compose with PDF letterhead
      const letterheadDoc = await PDFDocument.load(letterheadBytes);
      const [embeddedLetterhead] = await composedDoc.embedPdf(letterheadDoc, [0]);
      const embeddedBasePages = await composedDoc.embedPdf(baseDoc, baseDoc.getPageIndices());

      for (let i = 0; i < embeddedBasePages.length; i++) {
        const basePage = baseDoc.getPage(i);
        const { width, height } = basePage.getSize();
        const newPage = composedDoc.addPage([width, height]);

        // Draw letterhead in the background
        newPage.drawPage(embeddedLetterhead, {
          x: 0,
          y: 0,
          width,
          height,
        });

        // Draw generated document page in foreground
        newPage.drawPage(embeddedBasePages[i], {
          x: 0,
          y: 0,
          width,
          height,
        });
      }

      return await composedDoc.save();
    } else {
      // 2. Compose with Image letterhead (PNG / JPG / WebP)
      let embeddedImage;
      const isPng =
        mime === "image/png" ||
        (letterheadUrl && letterheadUrl.toLowerCase().endsWith(".png")) ||
        (letterheadBytes[0] === 0x89 && letterheadBytes[1] === 0x50);

      try {
        if (isPng) {
          embeddedImage = await composedDoc.embedPng(letterheadBytes);
        } else {
          embeddedImage = await composedDoc.embedJpg(letterheadBytes);
        }
      } catch {
        // If image embedding fails (e.g. webp format in pdf-lib), return original generated PDF
        return generatedPdfBytes;
      }

      const embeddedBasePages = await composedDoc.embedPdf(baseDoc, baseDoc.getPageIndices());

      for (let i = 0; i < embeddedBasePages.length; i++) {
        const basePage = baseDoc.getPage(i);
        const { width, height } = basePage.getSize();
        const newPage = composedDoc.addPage([width, height]);

        // Scale image letterhead across top of page respecting aspect ratio
        const imgDims = embeddedImage.scaleToFit(width, height * 0.22);
        newPage.drawImage(embeddedImage, {
          x: (width - imgDims.width) / 2,
          y: height - imgDims.height - 4,
          width: imgDims.width,
          height: imgDims.height,
        });

        // Draw document page on top
        newPage.drawPage(embeddedBasePages[i], {
          x: 0,
          y: 0,
          width,
          height,
        });
      }

      return await composedDoc.save();
    }
  } catch (err) {
    console.warn("[Letterhead Composer] Composition fallback triggered:", err);
    return generatedPdfBytes;
  }
}
