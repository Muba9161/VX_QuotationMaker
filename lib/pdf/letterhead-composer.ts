import { PDFDocument } from "pdf-lib";
import sharp from "sharp";
import { readTenantAsset } from "@/lib/storage/upload";

export interface LetterheadCompositionOptions {
  generatedPdfBytes: Uint8Array;
  letterheadUrl?: string | null;
  letterheadBuffer?: Buffer | null;
  letterheadMimeType?: string | null;
  orgId?: string | null;
  applyToDocument?: boolean;
  imagePlacement?: "header" | "full-page";
  required?: boolean;
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

  if (applyToDocument === false) {
    return generatedPdfBytes;
  }
  if (!letterheadUrl && !options.letterheadBuffer) {
    if (options.required) {
      throw new Error("The selected quotation template asset is unavailable.");
    }
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
      if (options.required) {
        throw new Error("The selected quotation template asset could not be loaded.");
      }
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
      // Normalize supported uploaded image formats to PNG for PDF embedding.
      const normalizedImage = await sharp(letterheadBytes).png().toBuffer();
      const embeddedImage = await composedDoc.embedPng(normalizedImage);

      const embeddedBasePages = await composedDoc.embedPdf(baseDoc, baseDoc.getPageIndices());

      for (let i = 0; i < embeddedBasePages.length; i++) {
        const basePage = baseDoc.getPage(i);
        const { width, height } = basePage.getSize();
        const newPage = composedDoc.addPage([width, height]);

        const imagePlacement = options.imagePlacement || "header";
        const imgDims = imagePlacement === "full-page"
          ? embeddedImage.scaleToFit(width, height)
          : embeddedImage.scaleToFit(width, height * 0.22);
        newPage.drawImage(embeddedImage, {
          x: (width - imgDims.width) / 2,
          y: imagePlacement === "full-page" ? (height - imgDims.height) / 2 : height - imgDims.height - 4,
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
    if (options.required) throw err;
    console.warn("[Letterhead Composer] Composition fallback triggered:", err);
    return generatedPdfBytes;
  }
}
