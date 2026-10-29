import { AuthError } from "./guards";

/**
 * Cross-Site Request Forgery (CSRF) & Origin Protection
 *
 * Policy:
 * 1. For state-changing HTTP methods (POST, PUT, PATCH, DELETE), verify that the request
 *    originates from a trusted origin.
 * 2. Trusted origin is derived strictly from the server-side configuration (APP_URL),
 *    never from untrusted client-supplied headers (e.g. X-Forwarded-Host).
 * 3. In development and test environments, loopback addresses (localhost, 127.0.0.1, [::1])
 *    are permitted to enable frictionless local development.
 * 4. Missing Origin Policy:
 *    - Browsers send the `Origin` header on all cross-origin requests and same-origin fetch POSTs.
 *    - If `Origin` is absent, the `Referer` header is evaluated as a fallback.
 *    - If both `Origin` and `Referer` are missing on a state-changing request carrying a cookie,
 *      the request is rejected to prevent CSRF attacks from stripped or spoofed clients.
 *    - Pure API clients using Bearer tokens (with no session cookie) are permitted without an Origin.
 */

const STATE_CHANGING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const SESSION_COOKIE_NAME = "vx_session";

function normalizeOrigin(input: string): string | null {
  if (!input) return null;
  try {
    const url = new URL(input);
    return url.origin.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Checks whether an origin string matches the server's trusted origin list.
 */
export function isTrustedOrigin(originOrUrl: string): boolean {
  const normalized = normalizeOrigin(originOrUrl);
  if (!normalized) return false;

  // 1. Check configured application origin
  const configuredAppUrl = process.env.APP_URL || "http://localhost:3000";
  const configuredOrigin = normalizeOrigin(configuredAppUrl);

  if (configuredOrigin && normalized === configuredOrigin) {
    return true;
  }

  // 2. Allow local loopback origins in development and test environments
  const isDevOrTest = process.env.NODE_ENV !== "production";
  if (isDevOrTest) {
    try {
      const parsed = new URL(normalized);
      const hostname = parsed.hostname.toLowerCase();
      const isLoopback =
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname === "[::1]";

      if (isLoopback && (parsed.protocol === "http:" || parsed.protocol === "https:")) {
        return true;
      }
    } catch {
      return false;
    }
  }

  return false;
}

export interface OriginValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Evaluates the Origin and Referer headers of a request against the trusted origin policy.
 */
export function validateRequestOrigin(req: Request): OriginValidationResult {
  const method = req.method.toUpperCase();

  // Safe read-only methods do not require CSRF origin validation
  if (!STATE_CHANGING_METHODS.has(method)) {
    return { valid: true };
  }

  // 1. Inspect the standard Origin header
  const origin = req.headers.get("origin");
  if (origin) {
    if (isTrustedOrigin(origin)) {
      return { valid: true };
    }
    return {
      valid: false,
      reason: `Untrusted request origin: '${origin}'.`,
    };
  }

  // 2. Fallback to Referer header if Origin is omitted
  const referer = req.headers.get("referer");
  if (referer) {
    const refererOrigin = normalizeOrigin(referer);
    if (refererOrigin && isTrustedOrigin(refererOrigin)) {
      return { valid: true };
    }
    return {
      valid: false,
      reason: `Untrusted request referer: '${referer}'.`,
    };
  }

  // 3. Handle requests missing both Origin and Referer
  const cookieHeader = req.headers.get("cookie") || "";
  const hasSessionCookie = cookieHeader.includes(`${SESSION_COOKIE_NAME}=`);
  const hasBearerToken = (req.headers.get("authorization") || "").startsWith("Bearer ");

  // If a browser session cookie is present, Origin or Referer is mandatory for state changes
  if (hasSessionCookie) {
    return {
      valid: false,
      reason: "Missing Origin and Referer headers on cookie-authenticated state-changing request.",
    };
  }

  // Pure API clients (using Bearer tokens without cookies) are permitted
  if (hasBearerToken) {
    return { valid: true };
  }

  // In development and test, allow direct tool/script invocations if explicitly configured
  if (process.env.NODE_ENV === "test") {
    return { valid: true };
  }

  return {
    valid: false,
    reason: "Missing required Origin header for state-changing request.",
  };
}

/**
 * Guard that enforces trusted origin validation.
 * Throws AuthError(403) if the request fails CSRF/Origin validation.
 */
export function requireTrustedOrigin(req: Request): void {
  const result = validateRequestOrigin(req);
  if (!result.valid) {
    throw new AuthError(
      result.reason || "Untrusted request origin.",
      "CSRF_ORIGIN_REJECTED",
      403
    );
  }
}

