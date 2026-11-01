/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as getBranding } from "@/app/api/v1/organization/branding/route";
import * as sessionModule from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

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
    organization: {
      findUnique: vi.fn(),
    },
  },
}));

describe("Feature 5: Organization Identity & VorldX Footer Attribution", () => {
  const mockOrg = {
    id: "org_custom_999",
    name: "Starlight Aerospace Ltd",
    displayName: "Starlight Aero",
    tagline: "Innovating the Skies",
    email: "contact@starlight.com",
    phone: "+91 9876543210",
    website: "https://starlight.com",
    address: "Aerospace Park, Bangalore",
    status: "ACTIVE",
    logoUrl: "/api/v1/organization/branding/asset/starlight-logo.png",
    primaryColor: "#0f172a",
    secondaryColor: "#3b82f6",
    accentColor: "#f59e0b",
    letterheadUrl: null,
    letterheadHeaderText: null,
    letterheadFooterText: null,
    letterheadLogoPosition: "TOP_LEFT",
    defaultSignatoryName: "Dr. Vikram Sarabhai",
    defaultSignatoryTitle: "Managing Director",
    letterheadFilename: null,
    letterheadMimeType: null,
    letterheadUploadedAt: null,
    letterheadApplyQuotations: true,
    letterheadApplyMous: true,
  };

  const mockUser = {
    id: "usr_starlight_1",
    organizationId: mockOrg.id,
    role: "ORG_ADMIN",
    name: "Vikram Admin",
    email: "admin@starlight.com",
    status: "ACTIVE",
    isActive: true,
  };

  const mockSession = {
    session: { id: "sess_starlight" },
    user: mockUser,
    organization: mockOrg,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. Returns authentic organization legal company name and branding identity", async () => {
    vi.mocked(sessionModule.validateSession).mockResolvedValue(mockSession as any);
    vi.mocked(prisma.organization.findUnique).mockResolvedValue(mockOrg as any);

    const req = new Request("http://localhost:3000/api/v1/organization/branding", {
      headers: { Cookie: "vx_session=valid_token" },
    });

    const res = await getBranding(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data.organization.name).toBe("Starlight Aerospace Ltd");
    expect(body.data.branding.logoUrl).toBe("/api/v1/organization/branding/asset/starlight-logo.png");
    expect(body.data.branding.primaryColor).toBe("#0f172a");
  });

  it("2. Validates Footer component file contains the exact 'Powered by VorldX' text", () => {
    const footerPath = path.resolve(process.cwd(), "components/Footer.tsx");
    expect(fs.existsSync(footerPath)).toBe(true);

    const footerContent = fs.readFileSync(footerPath, "utf8");
    expect(footerContent).toContain("Powered by VorldX");
  });

  it("3. STRICT ATTRIBUTION: Confirms 'Powered by VorldX' appears ONLY in components/Footer.tsx", () => {
    const targetDirs = [
      path.resolve(process.cwd(), "components"),
      path.resolve(process.cwd(), "lib/pdf"),
      path.resolve(process.cwd(), "lib/email-templates"),
    ];

    const occurrences: string[] = [];

    function scanDir(dir: string) {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
          const content = fs.readFileSync(fullPath, "utf8");
          if (content.includes("Powered by VorldX")) {
            const relPath = path.relative(process.cwd(), fullPath).replace(/\\/g, "/");
            occurrences.push(relPath);
          }
        }
      }
    }

    for (const d of targetDirs) {
      scanDir(d);
    }

    // Must be found ONLY in components/Footer.tsx
    expect(occurrences).toEqual(["components/Footer.tsx"]);
  });
});
