import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantContext, requireTrustedOrigin } from "@/lib/auth/guards";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { recordAuditLog } from "@/lib/audit";
import { sendTemplateSharedEmail } from "@/lib/email-templates/sharing-emails";
import { getSampleTemplateById } from "@/lib/templates/sample-templates-catalog";

/**
 * POST /api/v1/templates/[id]/share
 * Shares a template (either platform sample or organization template)
 * to one or more recipient emails via SMTP.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireTrustedOrigin(req);
    const { tenantId, user, organization } = await requireTenantContext(req);
    const { id: templateId } = await params;

    const body = await req.json();
    const customMessage = body.customMessage ? String(body.customMessage).trim() : null;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let recipientsList: Array<{ name: string; email: string }> = [];

    if (Array.isArray(body.recipients) && body.recipients.length > 0) {
      recipientsList = body.recipients
        .map((r: any) => ({
          name: (r.name || r.email?.split("@")[0] || "Collaborator").trim(),
          email: String(r.email || "").trim().toLowerCase(),
        }))
        .filter((r: any) => emailRegex.test(r.email));
    } else if (Array.isArray(body.recipientEmails) && body.recipientEmails.length > 0) {
      recipientsList = body.recipientEmails
        .map((e: any) => ({
          name: (body.recipientName || String(e).split("@")[0] || "Collaborator").trim(),
          email: String(e).trim().toLowerCase(),
        }))
        .filter((r: any) => emailRegex.test(r.email));
    } else if (typeof body.recipientEmail === "string") {
      const splitEmails = body.recipientEmail
        .split(/[,;\s]+/)
        .map((e: string) => e.trim().toLowerCase())
        .filter((e: string) => emailRegex.test(e));
      
      const defaultName = (body.recipientName || "Collaborator").trim();
      recipientsList = splitEmails.map((email: string) => ({
        name: defaultName,
        email,
      }));
    }

    if (recipientsList.length === 0) {
      return errorResponse("At least one valid recipient email is required.", "VALIDATION_ERROR", 400);
    }

    // Resolve template from platform samples or tenant database
    let templateTitle = "Template";
    let templateCategory = "Quotation";

    if (templateId.startsWith("sample-")) {
      const sample = getSampleTemplateById(templateId);
      if (!sample) {
        return errorResponse("Sample template not found.", "NOT_FOUND", 404);
      }
      templateTitle = sample.title;
      templateCategory = sample.category || sample.type || "Quotation";
    } else {
      const dbTemplate = await prisma.template.findFirst({
        where: { id: templateId, organizationId: tenantId },
      });
      if (!dbTemplate) {
        return errorResponse("Organization template not found.", "NOT_FOUND", 404);
      }
      templateTitle = dbTemplate.title;
      templateCategory = dbTemplate.category || dbTemplate.type || "Quotation";
    }

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const templateUrl = `${protocol}://${host}/templates?preview=${encodeURIComponent(templateId)}`;

    const deliveryResults: Array<{ email: string; success: boolean; error?: string }> = [];

    // Dispatch email to all specified recipients
    for (const target of recipientsList) {
      const emailResult = await sendTemplateSharedEmail({
        to: target.email,
        recipientName: target.name,
        organizationName: organization.name || "VorldX Platform",
        templateTitle,
        templateCategory,
        templateUrl,
        customMessage,
      });

      deliveryResults.push({
        email: target.email,
        success: emailResult.success,
        error: emailResult.error,
      });
    }

    // Record audit trail
    const recipientSummary = recipientsList.map((r) => r.email).join(", ");
    await recordAuditLog({
      organizationId: tenantId,
      userId: user.id,
      action: "TEMPLATE_SHARED",
      details: `Template "${templateTitle}" (${templateCategory}) shared with ${recipientsList.length} recipient(s): ${recipientSummary}`,
    });

    return successResponse(
      {
        templateId,
        templateTitle,
        templateCategory,
        templateUrl,
        totalRecipients: recipientsList.length,
        deliveries: deliveryResults,
        message: `Template shared with ${recipientsList.length} recipient(s).`,
      },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}

