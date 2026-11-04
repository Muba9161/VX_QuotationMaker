/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as listTemplates } from "@/app/api/v1/templates/route";
import * as sessionModule from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/auth/session", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth/session")>("@/lib/auth/session");
  return {
    ...actual,
    validateSession: vi.fn(),
  };
});

vi.mock("@/lib/prisma", () => ({
  prisma: {
    template: {
      findMany: vi.fn(),
    },
  },
}));

describe("Database-backed Template Library", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(sessionModule.validateSession).mockResolvedValue({
      user: { id: "u_1", organizationId: "org_1", role: "ORG_ADMIN", isActive: true } as any,
      organization: { id: "org_1", name: "Acme", status: "ACTIVE" } as any,
      session: { id: "s_1" } as any,
    });
  });

  it("returns only saved, active, non-sample templates for the authenticated organization", async () => {
    const savedTemplate = {
      id: "org_tmpl_1",
      organizationId: "org_1",
      title: "My Custom Agency Quote",
      type: "QUOTATION",
      category: "QUOTATION",
      isSample: false,
      contentSchema: { styleTag: "Agency", accentColor: "#123456" },
      items: [{ id: "item_1", defaultQuantity: "2", defaultRate: "125.50" }],
      clauses: [],
    };
    vi.mocked(prisma.template.findMany).mockResolvedValue([savedTemplate as any]);

    const req = new Request("http://localhost:3000/api/v1/templates?includeSamples=true&category=QUOTATION", {
      headers: {
        Origin: "http://localhost:3000",
        Cookie: "vx_session=valid_token",
      },
    });

    const res = await listTemplates(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toHaveLength(1);
    expect(json.data[0]).toMatchObject({
      id: "org_tmpl_1",
      organizationId: "org_1",
      styleTag: "Agency",
      accentColor: "#123456",
    });
    expect(json.data[0].items[0]).toMatchObject({
      defaultQuantity: 2,
      defaultRate: 125.5,
    });
    expect(prisma.template.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          organizationId: "org_1",
          isActive: true,
          isSample: false,
          category: "QUOTATION",
        }),
      })
    );
  });

  it("returns an empty collection when the organization has no saved templates", async () => {
    vi.mocked(prisma.template.findMany).mockResolvedValue([]);

    const req = new Request("http://localhost:3000/api/v1/templates?includeSamples=true", {
      headers: {
        Origin: "http://localhost:3000",
        Cookie: "vx_session=valid_token",
      },
    });

    const res = await listTemplates(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toEqual([]);
    expect(prisma.template.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ organizationId: "org_1", isSample: false }),
      })
    );
  });

  it("returns saved quotation, MOU, and letterhead templates when no type filter is requested", async () => {
    vi.mocked(prisma.template.findMany).mockResolvedValue([
      {
        id: "quote_1",
        title: "Saved Quote",
        type: "QUOTATION",
        category: "QUOTATION",
        contentSchema: {},
        items: [],
        clauses: [],
      },
      {
        id: "mou_1",
        title: "Saved MOU",
        type: "MOU",
        category: "MOU",
        contentSchema: {},
        items: [],
        clauses: [{ title: "Term", content: "Saved clause" }],
      },
      {
        id: "letterhead_1",
        title: "Saved Letterhead",
        type: "QUOTATION",
        category: "LETTERHEAD",
        contentSchema: {},
        items: [],
        clauses: [],
      },
    ] as any);

    const req = new Request("http://localhost:3000/api/v1/templates", {
      headers: {
        Origin: "http://localhost:3000",
        Cookie: "vx_session=valid_token",
      },
    });

    const res = await listTemplates(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.map((template: { id: string }) => template.id)).toEqual([
      "quote_1",
      "mou_1",
      "letterhead_1",
    ]);
    expect(json.data[1].clauses).toEqual([{ title: "Term", content: "Saved clause" }]);
    expect(prisma.template.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          organizationId: "org_1",
          isActive: true,
          isSample: false,
        }),
      })
    );
    const query = vi.mocked(prisma.template.findMany).mock.calls[0]?.[0];
    expect(query?.where).not.toHaveProperty("type");
  });
});
