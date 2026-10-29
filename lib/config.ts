/**
 * Environment & Runtime Configuration
 * Validates and exposes server-side environment variables safely.
 *
 * Rules:
 * - Server-side only: never import or expose to client-side components.
 * - Does not print or leak secrets in error messages.
 */

export interface AppConfig {
  databaseUrl: string;
  appUrl: string;
  localStoragePath: string;
  nodeEnv: "development" | "production" | "test";
  redisUrl?: string;
  jwtSecret?: string;
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(
      `[Config Error] Missing required environment variable: ${name}. ` +
        `Please configure this variable in your environment or .env.local file.`
    );
  }
  return value.trim();
}

function getOptionalEnv(name: string, fallback?: string): string | undefined {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    return fallback;
  }
  return value.trim();
}

/**
 * Returns validated application configuration.
 * Throws a sanitized Error if a required configuration key is missing.
 */
export function getAppConfig(): AppConfig {
  const nodeEnv = (process.env.NODE_ENV || "development") as AppConfig["nodeEnv"];

  return {
    databaseUrl: getRequiredEnv("DATABASE_URL"),
    appUrl: getOptionalEnv("APP_URL", "http://localhost:3000")!,
    localStoragePath: getOptionalEnv("LOCAL_STORAGE_PATH", "./storage")!,
    nodeEnv,
    redisUrl: getOptionalEnv("REDIS_URL"),
    jwtSecret: getOptionalEnv("JWT_SECRET"),
  };
}

