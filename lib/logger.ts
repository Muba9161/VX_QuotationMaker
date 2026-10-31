/**
 * Production Structured JSON Logger
 *
 * Implements high-throughput, structured log emission for server-side Next.js
 * and background workers.
 *
 * Security & Compliance:
 * 1. Automatic redaction of sensitive credentials (passwords, tokens, OTPs, auth headers).
 * 2. Correlation IDs for end-to-end request tracing.
 * 3. Log level filtering (DEBUG, INFO, WARN, ERROR).
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const SENSITIVE_KEY_REGEX = /(password|secret|token|authorization|cookie|otp|credential|api[-_]?key)/i;

/**
 * Recursively redacts sensitive keys from metadata objects.
 */
export function sanitizeLogMetadata(data: unknown, depth = 0): unknown {
  if (depth > 5) return "[MaxDepthReached]";
  if (data === null || data === undefined) return data;

  if (typeof data === "string" || typeof data === "number" || typeof data === "boolean") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeLogMetadata(item, depth + 1));
  }

  if (typeof data === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (SENSITIVE_KEY_REGEX.test(key)) {
        sanitized[key] = "[REDACTED]";
      } else if (typeof value === "object" && value !== null) {
        sanitized[key] = sanitizeLogMetadata(value, depth + 1);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  return String(data);
}

export class Logger {
  private level: LogLevel;
  private correlationId?: string;

  constructor(level: LogLevel = "info", correlationId?: string) {
    const envLevel = (process.env.LOG_LEVEL?.toLowerCase() as LogLevel) || level;
    this.level = LOG_LEVELS[envLevel] !== undefined ? envLevel : "info";
    this.correlationId = correlationId;
  }

  public withCorrelationId(id: string): Logger {
    return new Logger(this.level, id);
  }

  private shouldLog(targetLevel: LogLevel): boolean {
    return LOG_LEVELS[targetLevel] >= LOG_LEVELS[this.level];
  }

  private emit(level: LogLevel, message: string, meta?: Record<string, unknown> | Error): void {
    if (!this.shouldLog(level)) return;

    let errorData: Record<string, unknown> | undefined;
    let metadata: Record<string, unknown> | undefined;

    if (meta instanceof Error) {
      errorData = {
        name: meta.name,
        message: meta.message,
        stack: meta.stack,
      };
    } else if (meta && typeof meta === "object") {
      metadata = sanitizeLogMetadata(meta) as Record<string, unknown>;
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      ...(this.correlationId ? { correlationId: this.correlationId } : {}),
      ...(metadata ? { metadata } : {}),
      ...(errorData ? { error: errorData } : {}),
    };

    const serialized = JSON.stringify(logEntry);

    if (level === "error") {
      console.error(serialized);
    } else if (level === "warn") {
      console.warn(serialized);
    } else {
      console.log(serialized);
    }
  }

  public debug(message: string, meta?: Record<string, unknown>): void {
    this.emit("debug", message, meta);
  }

  public info(message: string, meta?: Record<string, unknown>): void {
    this.emit("info", message, meta);
  }

  public warn(message: string, meta?: Record<string, unknown>): void {
    this.emit("warn", message, meta);
  }

  public error(message: string, meta?: Record<string, unknown> | Error): void {
    this.emit("error", message, meta);
  }
}

export const logger = new Logger();

