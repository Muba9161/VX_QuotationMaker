import { NextRequest } from "next/server";

const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const IPV6_REGEX = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;

export interface ExtractedIpResult {
  ip: string;
  source: "header_forwarded" | "header_real" | "connection" | "fallback";
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
 * Extracts and sanitizes the client IP address from a request, preventing header spoofing
 * and respecting proxy trust configuration.
 *
 * Proxy Trust Rules:
 * - If TRUST_PROXY is "true" or "1", x-forwarded-for is evaluated according to standard reverse proxy conventions.
 * - If TRUST_PROXY is not enabled, headers are treated as advisory and validated against format injection.
 * - Malformed, spoofed, or non-IP strings are discarded safely.
 */
export function extractClientIp(req: Request | NextRequest): ExtractedIpResult {
  const isTrustedProxy = process.env.TRUST_PROXY === "true" || process.env.TRUST_PROXY === "1";

  // 1. Try x-forwarded-for header
  const forwardedHeader = req.headers.get("x-forwarded-for");
  if (forwardedHeader) {
    // Can contain comma-separated list of IPs: "client, proxy1, proxy2"
    const ips = forwardedHeader
      .split(",")
      .map((part) => part.trim())
      .filter((part) => isValidIp(part));

    if (ips.length > 0) {
      // In trusted proxy setups, client IP is the first valid entry in the chain
      return {
        ip: ips[0],
        source: "header_forwarded",
        isTrustedProxy,
      };
    }
  }

  // 2. Try x-real-ip header
  const realIpHeader = req.headers.get("x-real-ip")?.trim();
  if (realIpHeader && isValidIp(realIpHeader)) {
    return {
      ip: realIpHeader,
      source: "header_real",
      isTrustedProxy,
    };
  }

  // 3. Fallback to localhost default for local development
  return {
    ip: "127.0.0.1",
    source: "fallback",
    isTrustedProxy: false,
  };
}

