/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST as updateStatus } from "@/app/api/v1/mous/[id]/status/route";
import * as sessionModule from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { DocumentStatus } from "@prisma/client";

vi.mock("@/lib/auth/session", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth/session")>(
    "@/lib/auth/session"
  );
  return {
    ...actual,
    validateSession: vi.fn(),
  };
});

vi.mock("@/lib/prisma", () => ({
  prisma: {
    document: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    platformAuditLog: {
      create: vi.fn(),
    },
  },
}));

describe("Phase 3: MOU Lifecycle & Digital Signing Protection", () => {
  const mockOrgA = {
    id: "org_alpha_111",
    name: "Alpha Corp",
    status: "ACTIVE",
  };

  const mockUserAdminA = {
    id: "usr_admin_a",
    organizationId: "org_alpha_111",
    role: "ORG_ADMIN",
    name: "Alice Admin",
    email: "alice@alpha.com",
    isActive: true,
  };

  const mockMouA1: any = {
    id: "doc_mou_001",
    organizationId: "org_alpha_111",
    docNumber: "VX-MOU-2026-0001",
    title: "Partnership Agreement",
    type: "MOU",
    status: DocumentStatus.DRAFT,
  };

  const origin = "http://localhost:3000";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/v1/mous/[id]/status", () => {
    it("successfully transitions MOU from DRAFT to SENT", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockUserAdminA as any,
        organization: mockOrgA as any,
        session: { id: "sess_1" } as any,
      });

      vi.mocked(prisma.document.findFirst).mockResolvedValue(mockMouA1);
      vi.mocked(prisma.document.update).mockResolvedValue({
        ...mockMouA1,
        status: DocumentStatus.SENT,
        sentAt: new Date(),
      });

      const req = new Request("http://localhost:3000/api/v1/mous/doc_mou_001/status", {
        method: "POST",
        headers: {
          Origin: origin,
          "Content-Type": "application/json",
          Cookie: "vx_session=valid_token",
        },
        body: JSON.stringify({ status: "SENT" }),
      });

      const res = await updateStatus(req, {
        params: Promise.resolve({ id: "doc_mou_001" }),
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data.status).toBe("SENT");
    });

    it("rejects unauthorized manual transition to SIGNED status without verified digital signing", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockUserAdminA as any,
        organization: mockOrgA as any,
        session: { id: "sess_1" } as any,
      });

      vi.mocked(prisma.document.findFirst).mockResolvedValue({
        ...mockMouA1,
        status: DocumentStatus.SENT,
      });

      const req = new Request("http://localhost:3000/api/v1/mous/doc_mou_001/status", {
        method: "POST",
        headers: {
          Origin: origin,
          "Content-Type": "application/json",
          Cookie: "vx_session=valid_token",
        },
        body: JSON.stringify({ status: "SIGNED" }),
      });

      const res = await updateStatus(req, {
        params: Promise.resolve({ id: "doc_mou_001" }),
      });
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error.code).toBe("INVALID_TRANSITION");
      expect(data.error.message).toContain("Verified digital signing workflow is required");
      expect(prisma.document.update).not.toHaveBeenCalled();
    });

    it("successfully transitions MOU from SENT to DECLINED", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockUserAdminA as any,
        organization: mockOrgA as any,
        session: { id: "sess_1" } as any,
      });

      vi.mocked(prisma.document.findFirst).mockResolvedValue({
        ...mockMouA1,
        status: DocumentStatus.SENT,
      });
      vi.mocked(prisma.document.update).mockResolvedValue({
        ...mockMouA1,
        status: DocumentStatus.DECLINED,
      });

      const req = new Request("http://localhost:3000/api/v1/mous/doc_mou_001/status", {
        method: "POST",
        headers: {
          Origin: origin,
          "Content-Type": "application/json",
          Cookie: "vx_session=valid_token",
        },
        body: JSON.stringify({ status: "DECLINED", remarks: "Terms unacceptable" }),
      });

      const res = await updateStatus(req, {
        params: Promise.resolve({ id: "doc_mou_001" }),
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data.status).toBe("DECLINED");
    });

    it("rejects invalid lifecycle transition (SIGNED -> DRAFT) with 400", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockUserAdminA as any,
        organization: mockOrgA as any,
        session: { id: "sess_1" } as any,
      });

      vi.mocked(prisma.document.findFirst).mockResolvedValue({
        ...mockMouA1,
        status: DocumentStatus.SIGNED,
      });

      const req = new Request("http://localhost:3000/api/v1/mous/doc_mou_001/status", {
        method: "POST",
        headers: {
          Origin: origin,
          "Content-Type": "application/json",
          Cookie: "vx_session=valid_token",
        },
        body: JSON.stringify({ status: "DRAFT" }),
      });

      const res = await updateStatus(req, {
        params: Promise.resolve({ id: "doc_mou_001" }),
      });
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error.code).toBe("INVALID_TRANSITION");
    });
  });
});

