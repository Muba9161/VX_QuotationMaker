import { NextRequest } from "next/server";

const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const IPV6_REGEX = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;

export interface ExtractedIpResult {
  ip: string | null;
  source: "header_forwarded" | "header_real" | "socket" | "unknown";
  isTrustedProxy: boolean;
}

/**
 * Validates whether a candidate string is a syntactically valid IPv4 or IPv6 address.
 */
export function isValidIp(candidate: string): boolean {
  if (!candidate || typeof candidate !== "string") return false;
  const trimmed = candidate.trim();
  return IPV4_REGEX.test(trimmed) || IPV6_REGEX.test(trimmed);
}

/**
 * Extracts and sanitizes client IP address from an incoming request.
 *
 * Security Considerations:
 * 1. IP addresses reflect network routing topology and DO NOT prove signer identity.
 * 2. If TRUST_PROXY is not enabled, client-provided x-forwarded-for/x-real-ip headers
 *    are untrusted and discarded to prevent header spoofing.
 * 3. In trusted proxy environments (TRUST_PROXY=true/1), the leftmost valid address in
 *    the x-forwarded-for chain (client, proxy1, proxy2) is extracted.
 * 4. Invalid, malformed, or missing addresses safely resolve to null (unknown) rather
 *    than falsely recording localhost (127.0.0.1).
 */
export function extractClientIp(req: Request | NextRequest): ExtractedIpResult {
  const isTrustedProxy = process.env.TRUST_PROXY === "true" || process.env.TRUST_PROXY === "1";

  // Check direct socket IP if available (e.g., standard NextRequest / Node connection)
  const socketIp = (req as unknown as { ip?: string }).ip;
  if (socketIp && isValidIp(socketIp)) {
    return {
      ip: socketIp.trim(),
      source: "socket",
      isTrustedProxy,
    };
  }

  // If a reverse proxy is explicitly trusted, evaluate forwarded headers
  if (isTrustedProxy) {
    const forwardedHeader = req.headers.get("x-forwarded-for");
    if (forwardedHeader) {
      const candidates = forwardedHeader
        .split(",")
        .map((part) => part.trim())
        .filter((part) => isValidIp(part));

      if (candidates.length > 0) {
        return {
          ip: candidates[0],
          source: "header_forwarded",
          isTrustedProxy: true,
        };
      }
    }

    const realIpHeader = req.headers.get("x-real-ip")?.trim();
    if (realIpHeader && isValidIp(realIpHeader)) {
      return {
        ip: realIpHeader,
        source: "header_real",
        isTrustedProxy: true,
      };
    }
  }

  // Unknown or untrusted connection: do not fabricate localhost
  return {
    ip: null,
    source: "unknown",
    isTrustedProxy: false,
  };
}
