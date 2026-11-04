import sharp from "sharp";
import { composePdfWithLetterhead, parseAssetUrl } from "@/lib/pdf/letterhead-composer";
import type { QuotationPdfData } from "@/lib/pdf/quotation-pdf";
import { generateQuotationPdf } from "@/lib/pdf/quotation-pdf";
import { readTenantAsset } from "@/lib/storage/upload";

export interface QuotationTemplateRenderData {
  fileSource: string | null;
  fileUrl: string | null;
  imageFilename: string | null;
  contentSchema: unknown;
}

export interface QuotationRenderOrganization {
  id: string;
  name: string;
  displayName?: string | null;
  logoUrl?: string | null;
  primaryColor?: string | null;
  letterheadUrl?: string | null;
  letterheadApplyQuotations?: boolean;
}

export type QuotationRenderResult =
  | { success: true; pdfBytes: Uint8Array }
  | { success: false; code: string; message: string; status: number };

export async function renderQuotationPdf(options: {
  data: QuotationPdfData;
  organization: QuotationRenderOrganization;
  template: QuotationTemplateRenderData | null;
  templateWasSelected: boolean;
}): Promise<QuotationRenderResult> {
  const { data, organization, template, templateWasSelected } = options;
  const tenantId = organization.id;

  if (templateWasSelected && !template) {
    return {
      success: false,
      code: "TEMPLATE_UNAVAILABLE",
      message: "The original quotation template is no longer available. Restore the template or contact your administrator.",
      status: 409,
    };
  }

  if (template?.fileSource === "UPLOAD_DOCX") {
    return {
      success: false,
      code: "TEMPLATE_FORMAT_UNSUPPORTED",
      message: "This quotation uses a Word template that cannot be rendered as a quotation PDF. Select a PDF or image template and save a new revision.",
      status: 422,
    };
  }

  const templateSchema =
    template?.contentSchema &&
    typeof template.contentSchema === "object" &&
    !Array.isArray(template.contentSchema)
      ? template.contentSchema as Record<string, unknown>
      : {};
  const templateAccentColor =
    typeof templateSchema.accentColor === "string" &&
    /^#[0-9a-f]{6}$/i.test(templateSchema.accentColor)
      ? templateSchema.accentColor
      : null;
  const hasUploadedDocumentTemplate =
    template?.fileSource === "UPLOAD_PDF" ||
    template?.fileSource === "UPLOAD_IMAGE";
  const uploadedTemplateLocation = hasUploadedDocumentTemplate
    ? parseAssetUrl(template.fileUrl || "")
    : null;
  const uploadedTemplateAsset =
    uploadedTemplateLocation?.orgId === tenantId
      ? await readTenantAsset(
          tenantId,
          uploadedTemplateLocation.filename,
          "template"
        )
      : null;

  if (
    hasUploadedDocumentTemplate &&
    (!uploadedTemplateLocation ||
      uploadedTemplateLocation.orgId !== tenantId ||
      !uploadedTemplateAsset)
  ) {
    return {
      success: false,
      code: "TEMPLATE_ASSET_UNAVAILABLE",
      message: "The saved quotation template file is missing. Restore the original template asset to preview, download, or print this quotation.",
      status: 409,
    };
  }

  const templateImage =
    !hasUploadedDocumentTemplate && template?.imageFilename
      ? await readTenantAsset(tenantId, template.imageFilename, "template")
      : null;

  if (template?.imageFilename && !templateImage && !uploadedTemplateAsset) {
    return {
      success: false,
      code: "TEMPLATE_ASSET_UNAVAILABLE",
      message: "The saved quotation template branding asset is missing. Restore the original template asset to preserve its appearance.",
      status: 409,
    };
  }

  const organizationLogoLocation = organization.logoUrl
    ? parseAssetUrl(organization.logoUrl)
    : null;
  const organizationLogo =
    !templateImage &&
    !hasUploadedDocumentTemplate &&
    organizationLogoLocation?.orgId === tenantId
      ? await readTenantAsset(
          tenantId,
          organizationLogoLocation.filename,
          "logo"
        )
      : null;
  const logoAsset = templateImage || organizationLogo;
  const normalizedTemplateImage = logoAsset
    ? await sharp(logoAsset.buffer).png().toBuffer()
    : null;

  const rawPdfBuffer = generateQuotationPdf({
    ...data,
    letterheadApplied: Boolean(
      uploadedTemplateAsset ||
      (organization.letterheadUrl &&
        organization.letterheadApplyQuotations !== false)
    ),
    templateImageBase64: normalizedTemplateImage
      ? `data:image/png;base64,${normalizedTemplateImage.toString("base64")}`
      : null,
    templateImageFormat: normalizedTemplateImage ? "PNG" : undefined,
    organization: {
      ...data.organization,
      primaryColor: templateAccentColor || data.organization.primaryColor,
    },
  });

  const pdfWithSelectedTemplate = uploadedTemplateAsset
    ? await composePdfWithLetterhead({
        generatedPdfBytes: rawPdfBuffer,
        letterheadBuffer: uploadedTemplateAsset.buffer,
        letterheadMimeType: uploadedTemplateAsset.mimeType,
        imagePlacement: "full-page",
        required: true,
      })
    : rawPdfBuffer;

  const pdfBytes = await composePdfWithLetterhead({
    generatedPdfBytes: pdfWithSelectedTemplate,
    letterheadUrl: organization.letterheadUrl,
    applyToDocument: organization.letterheadApplyQuotations !== false,
    orgId: tenantId,
  });

  return { success: true, pdfBytes };
}
