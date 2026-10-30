import { describe, it, expect, beforeEach } from "vitest";
import { generateOtpCode, hashOtp } from "@/lib/services/otp";

describe("Phase 4: OTP Verification & Hashing", () => {
  beforeEach(() => {
    process.env.OTP_SECRET = "test-otp-secret-with-minimum-32-characters-entropy";
  });
  it("generates a 6-digit numeric OTP code", () => {
    const code = generateOtpCode();
    expect(code).toHaveLength(6);
    expect(/^\d{6}$/.test(code)).toBe(true);
    const num = parseInt(code, 10);
    expect(num).toBeGreaterThanOrEqual(100000);
    expect(num).toBeLessThanOrEqual(999999);
  });

  it("produces deterministic SHA-256 hash for OTP codes", () => {
    const code = "482915";
    const hash1 = hashOtp(code);
    const hash2 = hashOtp(code);

    expect(hash1).toHaveLength(64);
    expect(hash1).toBe(hash2);
    expect(/^[0-9a-f]{64}$/.test(hash1)).toBe(true);
  });

  it("produces different hashes for different OTP codes", () => {
    const hashA = hashOtp("111111");
    const hashB = hashOtp("222222");

    expect(hashA).not.toBe(hashB);
  });
});

