import { describe, it, expect, beforeEach } from "vitest";
import {
  getTenantCache,
  setTenantCache,
  deleteTenantCache,
  invalidateTenantResource,
  _clearTenantMemoryCache,
} from "@/lib/cache/tenant-cache";

describe("Phase 5: Tenant-Scoped Distributed Cache", () => {
  beforeEach(() => {
    _clearTenantMemoryCache();
  });

  it("strictly isolates cached values between distinct tenants", async () => {
    const orgA = "org-uuid-1111";
    const orgB = "org-uuid-2222";
    const resource = "quotation";
    const key = "q-001";

    const payloadOrgA = { id: "q-001", total: 50000, client: "Client Alpha" };
    const payloadOrgB = { id: "q-001", total: 95000, client: "Client Beta" };

    // Set value for Org A
    await setTenantCache(orgA, resource, key, payloadOrgA, 60);
    // Set value for Org B under identical resource and key
    await setTenantCache(orgB, resource, key, payloadOrgB, 60);

    // Retrieve for Org A
    const retrievedA = await getTenantCache<typeof payloadOrgA>(orgA, resource, key);
    expect(retrievedA).toEqual(payloadOrgA);

    // Retrieve for Org B
    const retrievedB = await getTenantCache<typeof payloadOrgB>(orgB, resource, key);
    expect(retrievedB).toEqual(payloadOrgB);

    // Ensure Org A cannot read Org B's data
    expect(retrievedA?.total).toBe(50000);
    expect(retrievedB?.total).toBe(95000);
  });

  it("throws validation error when orgId is empty to prevent cross-tenant leak", async () => {
    await expect(setTenantCache("", "quotation", "key1", { data: 1 })).rejects.toThrow(
      "TenantCache: orgId is strictly required"
    );

    await expect(getTenantCache("   ", "quotation", "key1")).rejects.toThrow(
      "TenantCache: orgId is strictly required"
    );
  });

  it("returns null for non-existent cache keys", async () => {
    const result = await getTenantCache("org-123", "mou", "non-existent-key");
    expect(result).toBeNull();
  });

  it("evicts single tenant key on delete", async () => {
    const org = "org-xyz";
    await setTenantCache(org, "document", "doc-1", { status: "DRAFT" }, 60);

    const before = await getTenantCache(org, "document", "doc-1");
    expect(before).toEqual({ status: "DRAFT" });

    await deleteTenantCache(org, "document", "doc-1");

    const after = await getTenantCache(org, "document", "doc-1");
    expect(after).toBeNull();
  });

  it("invalidates all keys of a resource namespace for a specific tenant only", async () => {
    const orgA = "org-tenant-a";
    const orgB = "org-tenant-b";

    await setTenantCache(orgA, "quotation", "q1", { n: 1 }, 60);
    await setTenantCache(orgA, "quotation", "q2", { n: 2 }, 60);
    await setTenantCache(orgA, "mou", "m1", { n: 3 }, 60);
    await setTenantCache(orgB, "quotation", "q1", { n: 4 }, 60);

    // Invalidate only quotations for Org A
    const count = await invalidateTenantResource(orgA, "quotation");
    expect(count).toBeGreaterThanOrEqual(2);

    // Quotations for Org A should be gone
    expect(await getTenantCache(orgA, "quotation", "q1")).toBeNull();
    expect(await getTenantCache(orgA, "quotation", "q2")).toBeNull();

    // MOU for Org A should still exist
    expect(await getTenantCache(orgA, "mou", "m1")).toEqual({ n: 3 });

    // Quotation for Org B must be unaffected
    expect(await getTenantCache(orgB, "quotation", "q1")).toEqual({ n: 4 });
  });
});

