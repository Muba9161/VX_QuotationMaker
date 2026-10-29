import bcrypt from "bcryptjs";

/**
 * Password Security & Hashing Utilities
 *
 * Uses bcryptjs with a secure work factor (12 rounds) to protect user credentials.
 * Enforces password strength rules without ever logging plaintext passwords.
 */

const SALT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 8;

export interface PasswordValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Validates password complexity requirements.
 */
export function validatePasswordStrength(password: string): PasswordValidationResult {
  if (!password || typeof password !== "string") {
    return { valid: false, reason: "Password is required." };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      valid: false,
      reason: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
    };
  }

  // Require at least one letter and one number or special character
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasDigitOrSpecial = /[\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  if (!hasLetter || !hasDigitOrSpecial) {
    return {
      valid: false,
      reason: "Password must contain both letters and at least one number or special character.",
    };
  }

  return { valid: true };
}

/**
 * Hashes a plaintext password using bcrypt with salt rounds = 12.
 */
export async function hashPassword(password: string): Promise<string> {
  const validation = validatePasswordStrength(password);
  if (!validation.valid) {
    throw new Error(validation.reason);
  }

  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verifies a plaintext password against a stored bcrypt hash.
 * Safely handles null or invalid stored hashes without throwing.
 */
export async function verifyPassword(
  plaintext: string,
  storedHash: string | null | undefined
): Promise<boolean> {
  if (!plaintext || !storedHash) {
    return false;
  }

  try {
    return await bcrypt.compare(plaintext, storedHash);
  } catch {
    return false;
  }
}

