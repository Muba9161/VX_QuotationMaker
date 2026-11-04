import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const isSessionValidMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth/session", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth/session")>();
  return {
    ...actual,
    isSessionValid: isSessionValidMock,
  };
});

import { proxy } from "@/proxy";

describe("Protected page authentication proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each(["/dashboard", "/quotations", "/admin/dashboard", "/recipient/dashboard"])(
    "redirects unauthenticated visits to %s to login",
    async (pathname) => {
      const response = await proxy(new NextRequest(`http://localhost:3000${pathname}`));

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe("http://localhost:3000/login");
      expect(response.headers.get("cache-control")).toContain("no-store");
      expect(isSessionValidMock).not.toHaveBeenCalled();
    }
  );

  it.each(["/", "/login", "/register", "/invite", "/share/public-token", "/sign/public-token"])(
    "allows public route %s without a session",
    async (pathname) => {
      const response = await proxy(new NextRequest(`http://localhost:3000${pathname}`));

      expect(response.headers.get("location")).toBeNull();
      expect(isSessionValidMock).not.toHaveBeenCalled();
    }
  );

  it("allows protected routes only with a valid session and disables caching", async () => {
    isSessionValidMock.mockResolvedValue(true);

    const request = new NextRequest("http://localhost:3000/quotations", {
      headers: { cookie: "vx_session=active-token" },
    });
    const response = await proxy(request);

    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(isSessionValidMock).toHaveBeenCalledWith("active-token");
  });

  it("redirects revoked sessions and clears their cookie", async () => {
    isSessionValidMock.mockResolvedValue(false);

    const request = new NextRequest("http://localhost:3000/quotations", {
      headers: { cookie: "vx_session=revoked-token" },
    });
    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login");
    expect(response.headers.get("set-cookie")).toContain("vx_session=;");
  });

  it("fails closed with an explicit server error when session validation is unavailable", async () => {
    isSessionValidMock.mockRejectedValue(new Error("database unavailable"));

    const request = new NextRequest("http://localhost:3000/quotations", {
      headers: { cookie: "vx_session=active-token" },
    });
    const response = await proxy(request);

    expect(response.status).toBe(503);
    expect(await response.text()).toContain("Unable to verify your session");
  });
});
