import { beforeEach, describe, expect, it, vi } from "vitest";

const sessionFindUniqueMock = vi.hoisted(() => vi.fn());
const sessionDeleteMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({
  prisma: {
    session: {
      findUnique: sessionFindUniqueMock,
      delete: sessionDeleteMock,
    },
  },
}));

import { hashSessionToken, isSessionValid } from "@/lib/auth/session";

describe("Lightweight protected-route session validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionDeleteMock.mockResolvedValue({});
  });

  it("only selects session expiry and active user status", async () => {
    sessionFindUniqueMock.mockResolvedValue({
      id: "session-id",
      expiresAt: new Date(Date.now() + 60_000),
      user: { status: "ACTIVE" },
    });

    await expect(isSessionValid("raw-token")).resolves.toBe(true);
    expect(sessionFindUniqueMock).toHaveBeenCalledWith({
      where: { sessionToken: hashSessionToken("raw-token") },
      select: {
        id: true,
        expiresAt: true,
        user: { select: { status: true } },
      },
    });
  });

  it("rejects missing, expired, and inactive sessions", async () => {
    await expect(isSessionValid("")).resolves.toBe(false);
    expect(sessionFindUniqueMock).not.toHaveBeenCalled();

    sessionFindUniqueMock.mockResolvedValueOnce(null);
    await expect(isSessionValid("missing-token")).resolves.toBe(false);

    sessionFindUniqueMock.mockResolvedValueOnce({
      id: "expired-session",
      expiresAt: new Date(Date.now() - 60_000),
      user: { status: "ACTIVE" },
    });
    await expect(isSessionValid("expired-token")).resolves.toBe(false);
    expect(sessionDeleteMock).toHaveBeenCalledWith({ where: { id: "expired-session" } });

    sessionFindUniqueMock.mockResolvedValueOnce({
      id: "inactive-session",
      expiresAt: new Date(Date.now() + 60_000),
      user: { status: "SUSPENDED" },
    });
    await expect(isSessionValid("inactive-token")).resolves.toBe(false);
  });
});
