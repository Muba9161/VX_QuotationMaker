import { describe, it, expect } from "vitest";
import { generateShareToken, hashShareToken } from "@/lib/services/share-token";

describe("Phase 4: Cryptographic Share Tokens", () => {
  it("generates a 256-bit cryptographically secure random token (64 hex chars)", () => {
    const token1 = generateShareToken();
    const token2 = generateShareToken();

    expect(token1).toHaveLength(64);
    expect(token2).toHaveLength(64);
    expect(token1).not.toBe(token2);
    expect(/^[0-9a-f]{64}$/.test(token1)).toBe(true);
  });

  it("produces deterministic SHA-256 hash of the token", () => {
    const rawToken = "a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90";
    const hash1 = hashShareToken(rawToken);
    const hash2 = hashShareToken(rawToken);

    expect(hash1).toHaveLength(64);
    expect(hash1).toBe(hash2);
    expect(/^[0-9a-f]{64}$/.test(hash1)).toBe(true);
  });

  it("produces different hashes for distinct tokens", () => {
    const tokenA = generateShareToken();
    const tokenB = generateShareToken();

    expect(hashShareToken(tokenA)).not.toBe(hashShareToken(tokenB));
  });

  it("handles whitespace trimming cleanly", () => {
    const token = generateShareToken();
    const untrimmed = `   ${token}   `;

    expect(hashShareToken(untrimmed)).toBe(hashShareToken(token));
  });
});

