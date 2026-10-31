import nodemailer, { type Transporter } from "nodemailer";

interface SendInvitationEmailParams {
  to: string;
  organizationName: string;
  role: string;
  inviteUrl: string;
  invitedByName?: string;
}

/**
 * Masks an email address for safe diagnostic logging without exposing full PII.
 * e.g. "alexander@example.com" -> "a***r@example.com"
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return "***@***";
  const [local, domain] = email.split("@");
  if (local.length <= 2) {
    return `${local[0] || "*"}***@${domain}`;
  }
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

let cachedTransporter: Transporter | null = null;

function createMailTransporter(): Transporter | null {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === "true",
    requireTLS: port === 587,
    auth: { user, pass },
    connectionTimeout: 15000,
  });
}

function getMailTransporter(): Transporter | null {
  if (cachedTransporter) return cachedTransporter;
  cachedTransporter = createMailTransporter();
  return cachedTransporter;
}

/**
 * Verifies that the configured SMTP server accepts connection and credentials.
 * Diagnostic utility that returns connection status without logging secrets.
 */
export async function verifySmtpConnection(): Promise<{ ok: boolean; error?: string }> {
  try {
    const transporter = getMailTransporter();
    if (!transporter) {
      return { ok: false, error: "SMTP environment variables are not configured in .env.local" };
    }
    await transporter.verify();
    return { ok: true };
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "SMTP verification failed";
    console.error("[Email Service Diagnostic] SMTP connection verification failed:", errMessage);
    return { ok: false, error: errMessage };
  }
}

/**
 * Dispatches a professional team invitation email via the configured SMTP server.
 * Handles delivery failures gracefully and returns delivery status without throwing.
 */
export async function sendInvitationEmail(
  params: SendInvitationEmailParams
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const masked = maskEmail(params.to);
  try {
    const mailTransporter = getMailTransporter();
    if (!mailTransporter) {
      console.warn("[Email Service] SMTP configuration missing, skipping email dispatch.");
      return { success: false, error: "SMTP credentials not configured" };
    }

    const domain = params.to.toLowerCase().split("@")[1]?.trim() || "";
    const placeholderDomains = ["acme.com", "example.com", "example.org", "test.com", "demo.com", "sample.com"];
    if (placeholderDomains.includes(domain)) {
      console.log(`[Email Service] Mock recipient domain '${domain}' detected. Simulating invitation delivery to ${masked}.`);
      return { success: true, messageId: `mock-${Date.now()}` };
    }

    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@vorldx.com";
    const inviterText = params.invitedByName
      ? `${params.invitedByName} has invited you`
      : "You have been invited";

    let info;
    try {
      info = await mailTransporter.sendMail({
        from: {
          name: `${params.organizationName} via VorldX`,
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
    } catch (sendErr) {
      // If the cached transporter failed with connection issue, retry once with a fresh transporter
      console.warn(`[Email Service Warning] Retrying email dispatch with fresh transporter to ${masked}...`);
      cachedTransporter = createMailTransporter();
      if (!cachedTransporter) {
        throw sendErr;
      }
      info = await cachedTransporter.sendMail({
        from: {
          name: `${params.organizationName} via VorldX`,
          address: fromAddress,
        },
        to: params.to,
        subject: `You've been invited to join ${params.organizationName} on VorldX`,
        text: `${inviterText} to join ${params.organizationName} as ${params.role}.\n\nAccept your invitation: ${params.inviteUrl}\n\nThis invitation link expires in 7 days.`,
        html: `<p>Hello, you've been invited to join <strong>${params.organizationName}</strong> as <strong>${params.role}</strong>.</p><p><a href="${params.inviteUrl}">Accept Invitation</a></p>`,
      });
    }

    console.log(`[Email Service] Invitation email successfully dispatched to ${masked} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "Failed to send email";
    console.error(`[Email Service Error] Failed to send invitation email to ${masked}:`, errMessage);
    return { success: false, error: errMessage };
  }
}
