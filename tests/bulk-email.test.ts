/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as getRecipients } from "@/app/api/v1/emails/recipients/route";
import { GET as listBatches, POST as createBatch } from "@/app/api/v1/emails/bulk/route";
import { GET as getBatchDetails } from "@/app/api/v1/emails/bulk/[batchId]/route";
import * as sessionModule from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/auth/session", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth/session")>(
    "@/lib/auth/session"
  );
  return {
    ...actual,
    validateSession: vi.fn(),
  };
});

vi.mock("@/lib/redis", () => ({
  isRedisConnected: vi.fn().mockResolvedValue(false),
  getBullMQConnection: vi.fn().mockReturnValue({}),
  closeRedisConnection: vi.fn(),
}));

vi.mock("@/lib/queue/queue-manager", () => ({
  enqueueBulkEmailRecipient: vi.fn().mockResolvedValue("mock-job-id-123"),
}));

vi.mock("@/lib/email", () => ({
  sendBulkEmail: vi.fn().mockResolvedValue({ success: true, messageId: "msg-123" }),
  maskEmail: vi.fn((e: string) => e),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    organization: {
      findUnique: vi.fn(),
    },
    contact: {
      findMany: vi.fn(),
    },
    bulkEmailBatch: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    bulkEmailRecipient: {
      findMany: vi.fn(),
      createMany: vi.fn(),
      update: vi.fn(),
    },
    platformAuditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn((cb) => cb(prisma)),
  },
}));

describe("Feature 1: Bulk Email Service & API Suite", () => {
  const orgA = {
    id: "org_alpha_111",
    name: "Alpha Corp",
    status: "ACTIVE",
  };

  const userAdmin = {
    id: "usr_admin_1",
    organizationId: orgA.id,
    role: "ORG_ADMIN",
    name: "Admin User",
    email: "admin@alpha.com",
    isActive: true,
  };

  const userViewer = {
    id: "usr_viewer_1",
    organizationId: orgA.id,
    role: "VIEWER",
    name: "Viewer User",
    email: "viewer@alpha.com",
    isActive: true,
  };

  const sessionAdmin = {
    session: { id: "sess_admin" },
    user: userAdmin,
    organization: orgA,
  };

  const sessionViewer = {
    session: { id: "sess_viewer" },
    user: userViewer,
    organization: orgA,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. Unauthenticated request to bulk email routes is rejected (401)", async () => {
    vi.mocked(sessionModule.validateSession).mockResolvedValue(null);

    const req = new Request("http://localhost/api/v1/emails/recipients", {
      headers: { "x-csrf-token": "none" },
    });
    const res = await getRecipients(req);
    expect(res.status).toBe(401);
  });

  it("2. Resolves eligible contacts strictly within requesting tenant", async () => {
    vi.mocked(sessionModule.validateSession).mockResolvedValue(sessionAdmin as any);
    vi.mocked(prisma.organization.findUnique).mockResolvedValue(orgA as any);
    vi.mocked(prisma.contact.findMany).mockResolvedValue([
      { id: "c1", name: "Client One", companyName: "Co 1", email: "client1@example.com", phone: "123" },
      { id: "c2", name: "Client Two", companyName: "Co 2", email: "client2@example.com", phone: "456" },
      // Duplicate email
      { id: "c3", name: "Client One Dup", companyName: "Co 1", email: "client1@example.com", phone: "789" },
    ] as any);

    const req = new Request("http://localhost:3000/api/v1/emails/recipients", {
      headers: { Cookie: "vx_session=valid_token" },
    });
    const res = await getRecipients(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data.recipients).toHaveLength(2); // deduped
    expect(body.data.recipients[0].email).toBe("client1@example.com");
    expect(body.data.recipients[1].email).toBe("client2@example.com");
  });

  it("3. Rejects user without doc:send permission (Viewer role) with 403", async () => {
    vi.mocked(sessionModule.validateSession).mockResolvedValue(sessionViewer as any);
    vi.mocked(prisma.organization.findUnique).mockResolvedValue(orgA as any);

    const req = new Request("http://localhost:3000/api/v1/emails/bulk", {
      method: "POST",
      headers: {
        Cookie: "vx_session=valid_token",
        origin: "http://localhost:3000",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject: "Valid Subject",
        message: "Valid email message text here",
        recipients: [{ email: "client@example.com", name: "Client" }],
      }),
    });

    const res = await createBatch(req);
    expect(res.status).toBe(403);
  });

  it("4. Validates input schema rejecting empty recipients or invalid email", async () => {
    vi.mocked(sessionModule.validateSession).mockResolvedValue(sessionAdmin as any);
    vi.mocked(prisma.organization.findUnique).mockResolvedValue(orgA as any);

    const req = new Request("http://localhost:3000/api/v1/emails/bulk", {
      method: "POST",
      headers: {
        Cookie: "vx_session=valid_token",
        origin: "http://localhost:3000",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject: "Hi", // too short (min 3)
        message: "No", // too short (min 5)
        recipients: [{ email: "not-an-email" }],
      }),
    });

    const res = await createBatch(req);
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("5. Rejects cross-tenant contact access when contactId belongs to another tenant", async () => {
    vi.mocked(sessionModule.validateSession).mockResolvedValue(sessionAdmin as any);
    vi.mocked(prisma.organization.findUnique).mockResolvedValue(orgA as any);
    // Contact query within tenant org_alpha_111 returns empty (contact belongs to foreign org)
    vi.mocked(prisma.contact.findMany).mockResolvedValue([]);

    const req = new Request("http://localhost:3000/api/v1/emails/bulk", {
      method: "POST",
      headers: {
        Cookie: "vx_session=valid_token",
        origin: "http://localhost:3000",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject: "Quarterly Invoice Summary",
        message: "Hello team, please find the quarterly report attached.",
        recipients: [{ contactId: "99999999-9999-4999-8999-999999999999", email: "foreign@other.com", name: "Foreign" }],
      }),
    });

    const res = await createBatch(req);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error.message).toContain("Unauthorized cross-tenant contact access");
  });

  it("6. Creates batch and deduplicates identical email recipients", async () => {
    vi.mocked(sessionModule.validateSession).mockResolvedValue(sessionAdmin as any);
    vi.mocked(prisma.organization.findUnique).mockResolvedValue(orgA as any);
    vi.mocked(prisma.contact.findMany).mockResolvedValue([{ id: "11111111-1111-4111-8111-111111111111" }] as any);

    const mockCreatedBatch = {
      id: "batch_123",
      organizationId: orgA.id,
      subject: "Important Project Update",
      message: "Here are the latest milestones.",
      status: "QUEUED",
      totalRecipients: 2,
      createdAt: new Date(),
    };

    vi.mocked(prisma.bulkEmailBatch.create).mockResolvedValue(mockCreatedBatch as any);
    vi.mocked(prisma.bulkEmailRecipient.findMany).mockResolvedValue([
      { id: "r1", email: "client1@example.com", name: "Client 1" },
      { id: "r2", email: "client2@example.com", name: "Client 2" },
    ] as any);

    const req = new Request("http://localhost:3000/api/v1/emails/bulk", {
      method: "POST",
      headers: {
        Cookie: "vx_session=valid_token",
        origin: "http://localhost:3000",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject: "Important Project Update",
        message: "Here are the latest milestones.",
        recipients: [
          { contactId: "11111111-1111-4111-8111-111111111111", email: "client1@example.com", name: "Client 1" },
          { email: "client1@example.com", name: "Client 1 duplicate" },
          { email: "client2@example.com", name: "Client 2" },
        ],
      }),
    });

    const res = await createBatch(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.batch.totalRecipients).toBe(2);
  });

  it("7. Retrieves batch delivery progress and recipient status breakdown", async () => {
    vi.mocked(sessionModule.validateSession).mockResolvedValue(sessionAdmin as any);
    vi.mocked(prisma.organization.findUnique).mockResolvedValue(orgA as any);
    vi.mocked(prisma.bulkEmailBatch.findFirst).mockResolvedValue({
      id: "batch_123",
      organizationId: orgA.id,
      subject: "Important Project Update",
      status: "COMPLETED",
      totalRecipients: 2,
      sentCount: 2,
      failedCount: 0,
      pendingCount: 0,
      createdAt: new Date(),
      recipients: [
        { id: "r1", name: "Alice", email: "alice@example.com", status: "SENT", sentAt: new Date(), error: null },
        { id: "r2", name: "Bob", email: "bob@example.com", status: "SENT", sentAt: new Date(), error: null },
      ],
    } as any);

    const req = new Request("http://localhost:3000/api/v1/emails/bulk/batch_123", {
      headers: { Cookie: "vx_session=valid_token" },
    });
    const res = await getBatchDetails(req, { params: Promise.resolve({ batchId: "batch_123" }) });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data.batch.status).toBe("COMPLETED");
    expect(body.data.batch.recipients).toHaveLength(2);
    expect(body.data.batch.recipients[0].status).toBe("SENT");
  });
});
