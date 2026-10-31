import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendOtpVerificationEmail } from "@/lib/email-templates/sharing-emails";

/**
 * Generates a 6-digit cryptographically secure numeric OTP.
 */
export function generateOtpCode(): string {
  const num = crypto.randomInt(100000, 999999);
  return num.toString();
}

/**
 * Retrieves and validates the dedicated OTP HMAC secret.
 * Enforces a minimum length of 32 characters for cryptographic strength.
 * Never falls back to session/JWT secrets or hardcoded defaults.
 */
export function getOtpSecret(): string {
  let secret = process.env.OTP_SECRET;

  // In non-test environments, reload from .env.local if not yet populated in the running process
  if (!secret && process.env.NODE_ENV !== "test") {
    try {
      const fs = require("fs");
      const path = require("path");
      const envPath = path.resolve(process.cwd(), ".env.local");
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf8");
        const match = content.match(/^OTP_SECRET=(.+)$/m);
        if (match && match[1]?.trim()) {
          secret = match[1].trim();
          process.env.OTP_SECRET = secret;
        }
      }
    } catch {
      // ignore
    }
  }

  if (!secret) {
    throw new Error("OTP_SECRET is not configured in environment variables.");
  }
  if (secret.length < 32) {
    throw new Error("OTP_SECRET must be at least 32 characters long for cryptographic strength.");
  }
  return secret;
}

/**
 * Computes keyed HMAC-SHA-256 hash of the 6-digit OTP code using the dedicated OTP_SECRET.
 */
export function hashOtp(otp: string): string {
  const secret = getOtpSecret();
  return crypto
    .createHmac("sha256", secret)
    .update(otp.trim())
    .digest("hex");
}

/**
 * Creates and dispatches an OTP for a given document share.
 * Enforces a 60-second cooldown between requests.
 */
export async function createAndSendOtp(shareId: string, recipientEmail: string, recipientName: string, docNumber: string) {
  // 1. Verify dedicated OTP secret configuration before creating record
  try {
    getOtpSecret();
  } catch (configErr) {
    return {
      success: false,
      error: configErr instanceof Error ? configErr.message : "OTP_SECRET configuration error.",
    };
  }

  // 2. Check for recent active OTP within 60 seconds (rate limiting / cooldown)
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const recentOtp = await prisma.documentOtp.findFirst({
    where: {
      shareId,
      createdAt: { gte: oneMinuteAgo },
    },
    orderBy: { createdAt: "desc" },
  });

  if (recentOtp) {
    return {
      success: false,
      error: "Please wait 60 seconds before requesting a new verification code.",
      cooldownRemainingSeconds: Math.ceil((recentOtp.createdAt.getTime() + 60000 - Date.now()) / 1000),
    };
  }

  const rawOtp = generateOtpCode();
  const otpHash = hashOtp(rawOtp);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Invalidate any older unverified OTPs
  await prisma.documentOtp.deleteMany({
    where: { shareId, verifiedAt: null },
  });

  const otpRecord = await prisma.documentOtp.create({
    data: {
      shareId,
      otpHash,
      expiresAt,
      maxAttempts: 3,
      attempts: 0,
    },
  });

  // Dispatch OTP email
  const emailRes = await sendOtpVerificationEmail(recipientEmail, recipientName, rawOtp, docNumber);

  return {
    success: true,
    otpId: otpRecord.id,
    expiresAt,
    emailSent: emailRes.success,
  };
}

/**
 * Verifies a submitted OTP against the stored SHA-256 hash.
 */
export async function verifySubmittedOtp(shareId: string, submittedOtp: string) {
  const candidate = (submittedOtp || "").trim();
  if (!candidate || candidate.length !== 6 || !/^\d{6}$/.test(candidate)) {
    return { valid: false, reason: "INVALID_FORMAT", message: "Please enter a valid 6-digit code." };
  }

  const latestOtp = await prisma.documentOtp.findFirst({
    where: { shareId, verifiedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!latestOtp) {
    return { valid: false, reason: "NOT_FOUND", message: "No active verification code found. Please request a new one." };
  }

  if (latestOtp.expiresAt < new Date()) {
    return { valid: false, reason: "EXPIRED", message: "Verification code has expired. Please request a new code." };
  }

  if (latestOtp.attempts >= latestOtp.maxAttempts) {
    return { valid: false, reason: "MAX_ATTEMPTS_EXCEEDED", message: "Too many failed attempts. Please request a new code." };
  }

  let submittedHash: string;
  try {
    submittedHash = hashOtp(candidate);
  } catch (configErr) {
    return {
      valid: false,
      reason: "CONFIG_ERROR",
      message: configErr instanceof Error ? configErr.message : "OTP_SECRET configuration error.",
    };
  }

  if (submittedHash !== latestOtp.otpHash) {
    const updatedAttempts = latestOtp.attempts + 1;
    await prisma.documentOtp.update({
      where: { id: latestOtp.id },
      data: { attempts: updatedAttempts },
    });

    const remaining = latestOtp.maxAttempts - updatedAttempts;
    return {
      valid: false,
      reason: "MISMATCH",
      remainingAttempts: Math.max(0, remaining),
      message: remaining > 0 ? `Incorrect verification code. ${remaining} attempt(s) remaining.` : "Incorrect code. Maximum attempts exceeded. Please request a new code.",
    };
  }

  // Mark as verified
  await prisma.documentOtp.update({
    where: { id: latestOtp.id },
    data: { verifiedAt: new Date() },
  });

  return { valid: true };
}

