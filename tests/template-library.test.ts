/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  ALL_SAMPLE_TEMPLATES,
  SAMPLE_QUOTATION_TEMPLATES,
  SAMPLE_MOU_TEMPLATES,
  SAMPLE_LETTERHEAD_TEMPLATES,
  getSampleTemplates,
  getSampleTemplateById,
} from "@/lib/templates/sample-templates-catalog";
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
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe("Template Library Catalog & Sample Definitions", () => {
  it("provides 7 professionally designed Quotation sample templates", () => {
    expect(SAMPLE_QUOTATION_TEMPLATES).toHaveLength(7);
    const titles = SAMPLE_QUOTATION_TEMPLATES.map((t) => t.title);
    expect(titles).toContain("Modern Corporate Quotation");
    expect(titles).toContain("Minimal Professional Quotation");
    expect(titles).toContain("Premium Business Proposal");
    expect(titles).toContain("Technology Services Proposal");
    expect(titles).toContain("Consulting & Professional Services");
    expect(titles).toContain("Creative Agency Proposal");
    expect(titles).toContain("Detailed Commercial Quotation");

    for (const t of SAMPLE_QUOTATION_TEMPLATES) {
      expect(t.type).toBe("QUOTATION");
      expect(t.category).toBe("QUOTATION");
      expect(t.isSample).toBe(true);
      expect(t.lineItems).toBeDefined();
      expect(t.lineItems!.length).toBeGreaterThan(0);
      expect(t.paymentTerms).toBeDefined();
    }
  });

  it("provides 6 professionally designed MOU sample templates", () => {
    expect(SAMPLE_MOU_TEMPLATES).toHaveLength(6);
    const titles = SAMPLE_MOU_TEMPLATES.map((t) => t.title);
    expect(titles).toContain("Standard Memorandum of Understanding");
    expect(titles).toContain("Business Partnership MOU");
    expect(titles).toContain("Service Agreement MOU");
    expect(titles).toContain("Technology Collaboration MOU");
    expect(titles).toContain("Consulting Engagement MOU");
    expect(titles).toContain("Vendor/Client Collaboration MOU");

    for (const t of SAMPLE_MOU_TEMPLATES) {
      expect(t.type).toBe("MOU");
      expect(t.category).toBe("MOU");
      expect(t.isSample).toBe(true);
      expect(t.clauses).toBeDefined();
      expect(t.clauses!.length).toBeGreaterThan(0);
    }
  });

  it("provides 6 professionally designed Letterhead sample templates", () => {
    expect(SAMPLE_LETTERHEAD_TEMPLATES).toHaveLength(6);
    const titles = SAMPLE_LETTERHEAD_TEMPLATES.map((t) => t.title);
    expect(titles).toContain("Minimal Corporate Letterhead");
    expect(titles).toContain("Modern Business Letterhead");
    expect(titles).toContain("Premium Executive Letterhead");
    expect(titles).toContain("Professional Services Letterhead");
    expect(titles).toContain("Clean Minimal Letterhead");
    expect(titles).toContain("Modern Technology Company Letterhead");

    for (const t of SAMPLE_LETTERHEAD_TEMPLATES) {
      expect(t.type).toBe("LETTERHEAD");
      expect(t.category).toBe("LETTERHEAD");
      expect(t.isSample).toBe(true);
      expect(t.letterheadConfig).toBeDefined();
      expect(t.letterheadConfig!.layout).toBeDefined();
    }
  });

  it("filters sample templates by category accurately", () => {
    expect(getSampleTemplates("QUOTATION")).toHaveLength(7);
    expect(getSampleTemplates("MOU")).toHaveLength(6);
    expect(getSampleTemplates("LETTERHEAD")).toHaveLength(6);
    expect(getSampleTemplates("ALL")).toHaveLength(19);
  });

  it("retrieves individual sample templates by id", () => {
    const sample = getSampleTemplateById("sample-quote-modern-corp");
    expect(sample).toBeDefined();
    expect(sample?.title).toBe("Modern Corporate Quotation");
    expect(sample?.lineItems).toHaveLength(4);

    const nonExistent = getSampleTemplateById("sample-non-existent");
    expect(nonExistent).toBeUndefined();
  });

  it("GET /api/v1/templates?includeSamples=true returns both org templates and platform samples", async () => {
    vi.mocked(sessionModule.validateSession).mockResolvedValue({
      user: { id: "u_1", organizationId: "org_1", role: "ORG_ADMIN", isActive: true } as any,
      organization: { id: "org_1", name: "Acme", status: "ACTIVE" } as any,
      session: { id: "s_1" } as any,
    });

    const mockOrgTemplate = {
      id: "org_tmpl_1",
      organizationId: "org_1",
      title: "My Custom Agency Quote",
      type: "QUOTATION",
      category: "QUOTATION",
      items: [],
      clauses: [],
      createdAt: new Date(),
    };

    vi.mocked(prisma.template.findMany).mockResolvedValue([mockOrgTemplate as any]);

    const req = new Request("http://localhost:3000/api/v1/templates?includeSamples=true&category=QUOTATION", {
      headers: {
        Origin: "http://localhost:3000",
        Cookie: "vx_session=valid_token",
      },
    });

    const res = await listTemplates(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    // 1 org template + 7 sample quotation templates = 8 templates
    expect(json.data).toHaveLength(8);

    const orgItem = json.data.find((t: any) => t.id === "org_tmpl_1");
    expect(orgItem.isSample).toBe(false);

    const sampleItem = json.data.find((t: any) => t.id === "sample-quote-modern-corp");
    expect(sampleItem.isSample).toBe(true);
  });
});
