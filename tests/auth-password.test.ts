import { describe, it, expect } from "vitest";
import {
  validatePasswordStrength,
  hashPassword,
  verifyPassword,
} from "@/lib/auth/password";

describe("Password Security & Hashing Utilities", () => {
  describe("validatePasswordStrength", () => {
    it("rejects empty or non-string passwords", () => {
      // @ts-expect-error Testing invalid runtime input
      expect(validatePasswordStrength(null).valid).toBe(false);
      // @ts-expect-error Testing invalid runtime input
      expect(validatePasswordStrength(undefined).valid).toBe(false);
      expect(validatePasswordStrength("").valid).toBe(false);
    });

    it("rejects passwords shorter than 8 characters", () => {
      const result = validatePasswordStrength("Pass1!");
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("at least 8 characters");
    });

    it("rejects passwords without digits or special characters", () => {
      const result = validatePasswordStrength("LettersOnlyPassword");
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("number or special character");
    });

    it("rejects passwords with only numbers and special characters", () => {
      const result = validatePasswordStrength("12345678!@#$");
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("both letters");
    });

    it("accepts strong passwords meeting complexity criteria", () => {
      expect(validatePasswordStrength("StrongPass123!").valid).toBe(true);
      expect(validatePasswordStrength("SecureP@ssw0rd").valid).toBe(true);
      expect(validatePasswordStrength("simple123").valid).toBe(true);
    });
  });

  describe("hashPassword and verifyPassword", () => {
    it("hashes strong password and verifies correctly", async () => {
      const raw = "SuperSecret123!";
      const hash = await hashPassword(raw);

      expect(hash).toBeDefined();
      expect(hash).not.toEqual(raw);
      expect(hash.startsWith("$2")).toBe(true);

      const isValid = await verifyPassword(raw, hash);
      expect(isValid).toBe(true);

      const isInvalid = await verifyPassword("WrongPassword123!", hash);
      expect(isInvalid).toBe(false);
    });

    it("throws an error when hashing an insecure password", async () => {
      await expect(hashPassword("short")).rejects.toThrow();
    });

    it("handles null or undefined stored hashes gracefully", async () => {
      expect(await verifyPassword("Password123!", null)).toBe(false);
      expect(await verifyPassword("Password123!", undefined)).toBe(false);
      expect(await verifyPassword("", "$2a$12$somehash")).toBe(false);
    });
  });
});

