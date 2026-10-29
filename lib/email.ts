import nodemailer, { type Transporter } from "nodemailer";

interface SendInvitationEmailParams {
  to: string;
  organizationName: string;
  role: string;
  inviteUrl: string;
  invitedByName?: string;
}

let cachedTransporter: Transporter | null = null;

function getMailTransporter(): Transporter | null {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    return null;
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === "true",
    requireTLS: port === 587,
    auth: { user, pass },
    connectionTimeout: 15000,
  });

  return cachedTransporter;
}

/**
 * Dispatches a professional team invitation email via the configured SMTP server.
 * Handles delivery failures gracefully and returns delivery status without throwing.
 */
export async function sendInvitationEmail(
  params: SendInvitationEmailParams
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const mailTransporter = getMailTransporter();
    if (!mailTransporter) {
      console.warn("[Email Service] SMTP configuration missing, skipping email dispatch.");
      return { success: false, error: "SMTP credentials not configured" };
    }

    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@vorldx.com";
    const inviterText = params.invitedByName
      ? `${params.invitedByName} has invited you`
      : "You have been invited";

    const info = await mailTransporter.sendMail({
      from: {
        name: "VorldX Platform",
        address: fromAddress,
      },
      to: params.to,
      subject: `You've been invited to join ${params.organizationName} on VorldX`,
      text: `${inviterText} to join ${params.organizationName} as ${params.role}.\n\nAccept your invitation: ${params.inviteUrl}\n\nThis invitation link expires in 7 days.\nIf you have a Google account matching ${params.to}, you can also directly sign in using 'Sign in with Google' on the login page.`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 28px;">
            <div style="display: inline-block; width: 44px; height: 44px; background-color: #2563eb; border-radius: 12px; line-height: 44px; color: #ffffff; font-weight: 800; font-size: 20px;">VX</div>
            <h1 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 16px 0 4px 0;">Team Invitation</h1>
            <p style="font-size: 14px; color: #64748b; margin: 0;">VorldX White-Label Quotation & MOU Platform</p>
          </div>

          <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <p style="font-size: 15px; line-height: 1.6; margin: 0 0 12px 0;">
              Hello,
            </p>
            <p style="font-size: 15px; line-height: 1.6; margin: 0 0 12px 0;">
              <strong>${inviterText}</strong> to join the workspace for <strong>${params.organizationName}</strong> with the role of <strong>${params.role}</strong>.
            </p>
            <p style="font-size: 13px; color: #64748b; margin: 0;">
              This invitation link is valid for 7 days.
            </p>
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${params.inviteUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; border-radius: 10px; font-weight: 600; font-size: 14px; text-decoration: none; display: inline-block; box-shadow: 0 2px 4px rgba(37,99,235,0.2);">
              Accept Invitation
            </a>
          </div>

          <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 28px;">
            <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0 0 8px 0;">
              <strong>Google Sign-In:</strong> If your Google account email is <code>${params.to}</code>, you can also simply click <strong>"Sign in with Google"</strong> on the login page to automatically accept this invitation and access your dashboard.
            </p>
            <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin: 0; word-break: break-all;">
              Or copy and paste this link into your browser: <br />
              <a href="${params.inviteUrl}" style="color: #2563eb;">${params.inviteUrl}</a>
            </p>
          </div>
        </div>
      `,
    });

    console.log(`[Email Service] Invitation email successfully dispatched to ${params.to} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "Failed to send email";
    console.error(`[Email Service Error] Failed to send invitation email to ${params.to}:`, errMessage);
    return { success: false, error: errMessage };
  }
}
