import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  isTrustedOrigin,
  validateRequestOrigin,
  requireTrustedOrigin,
} from "@/lib/auth/csrf";
import { AuthError } from "@/lib/auth/guards";

describe("CSRF & Origin Protection", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  describe("isTrustedOrigin", () => {
    it("recognizes the configured application URL origin", () => {
      vi.stubEnv("APP_URL", "https://quotations.vorldx.com");
      expect(isTrustedOrigin("https://quotations.vorldx.com")).toBe(true);
      expect(isTrustedOrigin("https://quotations.vorldx.com/")).toBe(true);
      expect(isTrustedOrigin("https://evil.com")).toBe(false);
    });

    it("permits local loopback origins in development/test", () => {
      vi.stubEnv("NODE_ENV", "development");
      expect(isTrustedOrigin("http://localhost:3000")).toBe(true);
      expect(isTrustedOrigin("http://127.0.0.1:3000")).toBe(true);
      expect(isTrustedOrigin("http://[::1]:3000")).toBe(true);
    });

    it("rejects loopback origins in production if not matching APP_URL", () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("APP_URL", "https://app.vorldx.com");
      expect(isTrustedOrigin("http://localhost:3000")).toBe(false);
      expect(isTrustedOrigin("https://app.vorldx.com")).toBe(true);
    });

    it("rejects invalid URLs gracefully", () => {
      expect(isTrustedOrigin("not-a-valid-url")).toBe(false);
      expect(isTrustedOrigin("")).toBe(false);
    });
  });

  describe("validateRequestOrigin", () => {
    it("allows GET requests without origin checking", () => {
      const req = new Request("https://app.vorldx.com/api/v1/auth/me", {
        method: "GET",
      });
      const result = validateRequestOrigin(req);
      expect(result.valid).toBe(true);
    });

    it("allows POST with a valid Origin header", () => {
      vi.stubEnv("APP_URL", "https://app.vorldx.com");
      const req = new Request("https://app.vorldx.com/api/v1/auth/login", {
        method: "POST",
        headers: { origin: "https://app.vorldx.com" },
      });
      const result = validateRequestOrigin(req);
      expect(result.valid).toBe(true);
    });

    it("rejects POST with an untrusted Origin header", () => {
      vi.stubEnv("APP_URL", "https://app.vorldx.com");
      const req = new Request("https://app.vorldx.com/api/v1/auth/login", {
        method: "POST",
        headers: { origin: "https://attacker.evil.com" },
      });
      const result = validateRequestOrigin(req);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("Untrusted request origin");
    });

    it("falls back to Referer when Origin is omitted", () => {
      vi.stubEnv("APP_URL", "https://app.vorldx.com");
      const req = new Request("https://app.vorldx.com/api/v1/auth/login", {
        method: "POST",
        headers: { referer: "https://app.vorldx.com/login" },
      });
      const result = validateRequestOrigin(req);
      expect(result.valid).toBe(true);
    });

    it("rejects untrusted Referer when Origin is omitted", () => {
      vi.stubEnv("APP_URL", "https://app.vorldx.com");
      const req = new Request("https://app.vorldx.com/api/v1/auth/login", {
        method: "POST",
        headers: { referer: "https://phishing.site/login" },
      });
      const result = validateRequestOrigin(req);
      expect(result.valid).toBe(false);
    });

    it("rejects cookie-authenticated POST when both Origin and Referer are absent", () => {
      vi.stubEnv("NODE_ENV", "production");
      const req = new Request("https://app.vorldx.com/api/v1/auth/logout", {
        method: "POST",
        headers: { cookie: "vx_session=active_token" },
      });
      const result = validateRequestOrigin(req);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("Missing Origin and Referer");
    });

    it("allows non-browser Bearer token API requests without Origin header", () => {
      vi.stubEnv("NODE_ENV", "production");
      const req = new Request("https://app.vorldx.com/api/v1/documents", {
        method: "POST",
        headers: { authorization: "Bearer api_key_or_token" },
      });
      const result = validateRequestOrigin(req);
      expect(result.valid).toBe(true);
    });
  });

  describe("requireTrustedOrigin guard", () => {
    it("throws AuthError(403) on invalid origin", () => {
      vi.stubEnv("APP_URL", "https://app.vorldx.com");
      const req = new Request("https://app.vorldx.com/api/v1/auth/login", {
        method: "POST",
        headers: { origin: "https://attacker.evil.com" },
      });
      expect(() => requireTrustedOrigin(req)).toThrow(AuthError);
    });

    it("does not throw on trusted origin", () => {
      vi.stubEnv("APP_URL", "https://app.vorldx.com");
      const req = new Request("https://app.vorldx.com/api/v1/auth/login", {
        method: "POST",
        headers: { origin: "https://app.vorldx.com" },
      });
      expect(() => requireTrustedOrigin(req)).not.toThrow();
    });
  });
});

