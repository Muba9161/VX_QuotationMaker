import nodemailer from "nodemailer";

interface BaseShareEmailProps {
  to: string;
  recipientName: string;
  organizationName: string;
  docTitle: string;
  docNumber: string;
  docType: string;
  shareUrl: string;
  expiresAtFormatted: string;
  customMessage?: string | null;
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === "true",
    requireTLS: port === 587,
    auth: { user, pass },
    connectionTimeout: 10000,
  });
}

/**
 * Checks whether an email address belongs to a mock, testing, or placeholder domain.
 * Prevents SMTP delivery bounces to non-existent mailboxes (e.g., contact@acme.com).
 */
export function isMockOrPlaceholderEmail(email: string): boolean {
  if (!email || !email.includes("@")) return true;
  const domain = email.toLowerCase().split("@")[1]?.trim() || "";
  const placeholderDomains = [
    "acme.com",
    "example.com",
    "example.org",
    "example.net",
    "test.com",
    "demo.com",
    "sample.com",
    "placeholder.com",
    "domain.com",
  ];
  return placeholderDomains.includes(domain);
}

/**
 * Sends a "Document Shared" invitation email to the external recipient.
 */
export async function sendDocumentSharedEmail(props: BaseShareEmailProps): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = getTransporter();
    if (!transporter) {
      console.warn("[Email Service] SMTP not configured. Skipping share email dispatch.");
      return { success: false, error: "SMTP not configured" };
    }

    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@vorldx.com";
    const subject = `${props.organizationName} has shared ${props.docType} ${props.docNumber} with you`;

    const customMsgBlock = props.customMessage
      ? `<div style="background:#f8fafc;border-left:4px solid #2563eb;padding:12px 16px;margin:16px 0;border-radius:4px;color:#334155;font-style:italic;">"${props.customMessage}"</div>`
      : "";

    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;">
        <div style="border-bottom:1px solid #e2e8f0;padding-bottom:16px;margin-bottom:20px;">
          <h2 style="color:#0f172a;margin:0;font-size:20px;">${props.organizationName}</h2>
        </div>
        <p style="color:#334155;font-size:15px;line-height:1.5;">Hello <strong>${props.recipientName}</strong>,</p>
        <p style="color:#334155;font-size:15px;line-height:1.5;">
          ${props.organizationName} has prepared and shared <strong>${props.docType} ${props.docNumber}</strong> (<em>${props.docTitle}</em>) for your review and digital signing.
        </p>
        ${customMsgBlock}
        <div style="text-align:center;margin:32px 0;">
          <a href="${props.shareUrl}" style="background-color:#2563eb;color:#ffffff;padding:12px 28px;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px;display:inline-block;">
            Review & Sign Document
          </a>
        </div>
        <p style="color:#64748b;font-size:13px;line-height:1.5;">
          This secure link is valid until <strong>${props.expiresAtFormatted}</strong>.<br/>
          If the button above does not work, copy and paste this URL into your browser:<br/>
          <a href="${props.shareUrl}" style="color:#2563eb;word-break:break-all;">${props.shareUrl}</a>
        </p>
        <div style="border-top:1px solid #e2e8f0;margin-top:24px;padding-top:16px;color:#94a3b8;font-size:12px;text-align:center;">
          Powered by VorldX White-Label Document Platform.
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: { name: `${props.organizationName} via VorldX`, address: fromAddress },
      to: props.to,
      subject,
      html,
    });

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    console.error("[Email Service Error] sendDocumentSharedEmail:", message);
    return { success: false, error: message };
  }
}

/**
 * Sends a 6-digit OTP verification code to the recipient.
 */
export async function sendOtpVerificationEmail(to: string, recipientName: string, otp: string, docNumber: string): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = getTransporter();
    if (!transporter) return { success: false, error: "SMTP not configured" };

    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@vorldx.com";

    const html = `
      <div style="font-family:sans-serif;max-width:540px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
        <h3 style="color:#0f172a;margin-top:0;">Document Security Verification</h3>
        <p style="color:#334155;font-size:14px;">Hello ${recipientName},</p>
        <p style="color:#334155;font-size:14px;">Your one-time verification code to access <strong>${docNumber}</strong> is:</p>
        <div style="background:#f1f5f9;border:1px dashed #cbd5e1;padding:16px;border-radius:8px;text-align:center;margin:20px 0;">
          <span style="font-size:32px;font-weight:800;letter-spacing:6px;color:#2563eb;">${otp}</span>
        </div>
        <p style="color:#64748b;font-size:12px;">This code expires in 10 minutes. Do not share this code with anyone.</p>
      </div>
    `;

    await transporter.sendMail({
      from: { name: "VorldX Secure Verification", address: fromAddress },
      to,
      subject: `Your Verification Code for ${docNumber}`,
      html,
    });

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Error sending OTP" };
  }
}

/**
 * Sends a notification to the document creator / org when a document has been viewed.
 */
export async function sendDocumentViewedNotification(to: string, recipientName: string, docNumber: string, docTitle: string) {
  try {
    if (isMockOrPlaceholderEmail(to)) {
      return;
    }
    const transporter = getTransporter();
    if (!transporter) return;

    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@vorldx.com";
    await transporter.sendMail({
      from: { name: "VorldX Document Tracker", address: fromAddress },
      to,
      subject: `Document Viewed: ${docNumber} by ${recipientName}`,
      text: `${recipientName} has opened and viewed ${docNumber} ("${docTitle}").`,
    });
  } catch {}
}

/**
 * Sends a notification when a document has been signed.
 */
export async function sendDocumentSignedEmail(to: string, signerName: string, docNumber: string, docTitle: string, isFullySigned: boolean) {
  try {
    if (isMockOrPlaceholderEmail(to)) {
      return;
    }
    const transporter = getTransporter();
    if (!transporter) return;

    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@vorldx.com";
    const statusText = isFullySigned ? "fully executed and signed by all parties" : `signed by ${signerName}`;

    await transporter.sendMail({
      from: { name: "VorldX Signatures", address: fromAddress },
      to,
      subject: `Signature Completed: ${docNumber}`,
      text: `Good news! ${docNumber} ("${docTitle}") has been ${statusText}.\nYou can view and download the executed certificate and PDF from your dashboard.`,
    });
  } catch {}
}

