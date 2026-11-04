/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST as shareDocument } from "@/app/api/v1/documents/[id]/shares/route";
import { POST as shareTemplate } from "@/app/api/v1/templates/[id]/share/route";
import * as sessionModule from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth/session", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth/session")>("@/lib/auth/session");
  return {
    ...actual,
    validateSession: vi.fn(),
  };
});

vi.mock("@/lib/services/document-snapshot", () => ({
  createDocumentSnapshot: vi.fn().mockResolvedValue({ id: "snap-123" }),
}));

vi.mock("@/lib/audit", () => ({
  recordAuditLog: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/email-templates/sharing-emails", () => ({
  sendDocumentSharedEmail: vi.fn().mockResolvedValue({ success: true }),
  sendTemplateSharedEmail: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("@/lib/queue/queue-manager", () => ({
  enqueueDocumentSharedEmail: vi.fn().mockResolvedValue(true),
  enqueueSigningReminder: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    document: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    documentShare: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    template: {
      findFirst: vi.fn(),
    },
  },
}));

describe("Multi-Email Sharing Functionality", () => {
  const mockOrg = {
    id: "org-test-uuid",
    name: "Acme Technologies",
    status: "ACTIVE",
    isActive: true,
  };

  const mockUser = {
    id: "user-test-uuid",
    email: "admin@acme.com",
    role: "ORG_ADMIN",
    status: "ACTIVE",
    organizationId: mockOrg.id,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(sessionModule.validateSession).mockResolvedValue({
      user: mockUser,
      organization: mockOrg,
      session: { id: "session-test-uuid" },
    } as any);
  });

  const authHeaders = {
    "Content-Type": "application/json",
    Origin: "http://localhost:3000",
    Cookie: "vx_session=valid_token",
  };

  describe("Document Sharing (Quotations & MOUs) to Multiple Recipients", () => {
    it("shares a document with multiple recipients via recipients array", async () => {
      vi.mocked(prisma.document.findFirst).mockResolvedValue({
        id: "doc-1",
        docNumber: "VX-QTN-2026-0001",
        title: "Enterprise Web Portal",
        type: "QUOTATION",
        status: "DRAFT",
        organization: mockOrg,
      } as any);

      (prisma.documentShare.create as any).mockImplementation(({ data }: any) => {
        return Promise.resolve({
          id: `share-${Math.random().toString(36).substring(7)}`,
          ...data,
          createdAt: new Date(),
        });
      });

      const body = {
        recipients: [
          { name: "John Doe", email: "john@client.com" },
          { name: "Sarah Smith", email: "sarah@client.com" },
          { name: "Finance Team", email: "finance@client.com" },
        ],
        customMessage: "Please review and approve the proposal.",
        sendEmail: true,
      };

      const req = new NextRequest("http://localhost:3000/api/v1/documents/doc-1/shares", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(body),
      });

      const res = await shareDocument(req, { params: Promise.resolve({ id: "doc-1" }) });
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.data.totalRecipients).toBe(3);
      expect(json.data.shares).toHaveLength(3);
      expect(json.data.shareUrl).toBeDefined();

      // Verify DocumentShare.create was called 3 times
      expect(prisma.documentShare.create).toHaveBeenCalledTimes(3);

      // Verify status transitioned from DRAFT to SENT
      expect(prisma.document.update).toHaveBeenCalledWith({
        where: { id: "doc-1" },
        data: { status: "SENT", sentAt: expect.any(Date) },
      });
    });

    it("automatically splits comma-separated recipientEmail string into multiple shares", async () => {
      vi.mocked(prisma.document.findFirst).mockResolvedValue({
        id: "doc-2",
        docNumber: "VX-MOU-2026-0002",
        title: "Bilateral Technology Partnership",
        type: "MOU",
        status: "SENT",
        organization: mockOrg,
      } as any);

      (prisma.documentShare.create as any).mockImplementation(({ data }: any) => {
        return Promise.resolve({ id: "share-xyz", ...data });
      });

      const body = {
        recipientName: "Legal Dept",
        recipientEmail: "legal1@partner.com, legal2@partner.com",
        recipientRole: "CLIENT",
      };

      const req = new NextRequest("http://localhost:3000/api/v1/documents/doc-2/shares", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(body),
      });

      const res = await shareDocument(req, { params: Promise.resolve({ id: "doc-2" }) });
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.data.totalRecipients).toBe(2);
      expect(prisma.documentShare.create).toHaveBeenCalledTimes(2);
    });

    it("rejects request when no valid recipient email is provided", async () => {
      const body = {
        recipients: [{ name: "Invalid", email: "not-an-email" }],
      };

      const req = new NextRequest("http://localhost:3000/api/v1/documents/doc-1/shares", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(body),
      });

      const res = await shareDocument(req, { params: Promise.resolve({ id: "doc-1" }) });
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.message).toContain("recipient email");
    });
  });

  describe("Template Sharing to Multiple Recipients", () => {
    it("does not share a platform sample template", async () => {
      const body = {
        recipients: [
          { name: "Dev Lead", email: "lead@agency.com" },
          { name: "Product Manager", email: "pm@agency.com" },
        ],
        customMessage: "Take a look at this Modern Corporate Quotation template.",
      };

      const req = new NextRequest("http://localhost:3000/api/v1/templates/sample-quote-modern-corp/share", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(body),
      });

      const res = await shareTemplate(req, {
        params: Promise.resolve({ id: "sample-quote-modern-corp" }),
      });
      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json.success).toBe(false);
      expect(json.error.message).toBe("Organization template not found.");
    });

    it("shares an organization template to multiple recipient emails", async () => {
      vi.mocked(prisma.template.findFirst).mockResolvedValue({
        id: "tmpl-org-1",
        title: "Custom Retainer MOU",
        category: "MOU",
        type: "MOU",
        organizationId: mockOrg.id,
      } as any);

      const body = {
        recipientEmail: "partner1@org.com, partner2@org.com",
      };

      const req = new NextRequest("http://localhost:3000/api/v1/templates/tmpl-org-1/share", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(body),
      });

      const res = await shareTemplate(req, {
        params: Promise.resolve({ id: "tmpl-org-1" }),
      });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.totalRecipients).toBe(2);
      expect(json.data.templateTitle).toBe("Custom Retainer MOU");
    });
  });
});
