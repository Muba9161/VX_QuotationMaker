/**
 * Startup Environment Configuration Validator
 *
 * Enforces production readiness by validating essential secrets, database URIs,
 * and service endpoints during application boot.
 *
 * Security:
 * - Secret values are NEVER printed or echoed in validation reports.
 * - Missing or weak secrets produce actionable error diagnostics without leaking contents.
 */

export interface EnvValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateEnvironment(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Authoritative Database URL
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    errors.push("DATABASE_URL is required but missing from environment.");
  } else if (
    !databaseUrl.startsWith("postgresql://") &&
    !databaseUrl.startsWith("postgres://")
  ) {
    errors.push("DATABASE_URL must be a valid PostgreSQL connection string starting with postgresql://");
  }

  // 2. JWT Session Secret
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    errors.push("JWT_SECRET is required for session signing.");
  } else if (jwtSecret.length < 32) {
    warnings.push("JWT_SECRET is shorter than 32 characters; recommend at least 256 bits of entropy.");
  }

  // 3. Document Sharing OTP Secret
  const otpSecret = process.env.OTP_SECRET;
  if (!otpSecret) {
    warnings.push("OTP_SECRET is missing; ephemeral fallback will be used in development/test.");
  } else if (otpSecret.length < 32) {
    warnings.push("OTP_SECRET should be at least 32 characters for robust HMAC-SHA256 signing.");
  }

  // 4. Redis URL (Optional for pure local dev, required for distributed scaling)
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl && !redisUrl.startsWith("redis://") && !redisUrl.startsWith("rediss://")) {
    errors.push("REDIS_URL must begin with redis:// or rediss://");
  }

  // 5. Storage Directory
  const storagePath = process.env.LOCAL_STORAGE_PATH;
  if (!storagePath) {
    warnings.push("LOCAL_STORAGE_PATH is not set; defaulting to local ./storage folder.");
  }

  // 6. Application URL
  const appUrl = process.env.APP_URL;
  if (appUrl) {
    try {
      new URL(appUrl);
    } catch {
      errors.push("APP_URL must be a valid RFC-compliant URL (e.g. http://localhost:3000).");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Asserts environment validity on startup. Logs warnings and throws on critical errors.
 */
export function assertEnvironment(): void {
  const result = validateEnvironment();

  if (result.warnings.length > 0) {
    for (const w of result.warnings) {
      console.warn(`[Config Warning] ${w}`);
    }
  }

  if (!result.valid) {
    for (const e of result.errors) {
      console.error(`[Config Error] ${e}`);
    }
    throw new Error(`Environment validation failed with ${result.errors.length} error(s).`);
  }
}

