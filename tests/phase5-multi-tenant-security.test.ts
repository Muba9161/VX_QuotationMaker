import { describe, it, expect } from "vitest";
import { getTenantCache, setTenantCache } from "@/lib/cache/tenant-cache";
import {
  saveDocumentFile,
  readDocumentFile,
  DocumentStorageError,
} from "@/lib/storage/document-storage";

describe("Phase 5: Multi-Tenant Security & Strict Isolation", () => {
  const ORG_A = "11111111-1111-1111-1111-111111111111";
  const ORG_B = "22222222-2222-2222-2222-222222222222";
  const sharedResourceId = "resource-shared-id-001";

  describe("Tenant Cache Isolation", () => {
    it("prevents Organization A from retrieving Organization B's cached records", async () => {
      const dataA = { clientName: "Alpha Corp", balance: 50000 };
      const dataB = { clientName: "Beta Corp", balance: 95000 };

      // Set identical resource key for both organizations
      await setTenantCache(ORG_A, "client", sharedResourceId, dataA);
      await setTenantCache(ORG_B, "client", sharedResourceId, dataB);

      // Verify Org A retrieves exclusively Org A's data
      const resultA = await getTenantCache<typeof dataA>(ORG_A, "client", sharedResourceId);
      expect(resultA).toEqual(dataA);
      expect(resultA?.clientName).toBe("Alpha Corp");

      // Verify Org B retrieves exclusively Org B's data
      const resultB = await getTenantCache<typeof dataB>(ORG_B, "client", sharedResourceId);
      expect(resultB).toEqual(dataB);
      expect(resultB?.clientName).toBe("Beta Corp");

      // Verify Org A querying with non-existent key in its namespace yields null
      const crossMiss = await getTenantCache(ORG_A, "client", "non-existent-for-a");
      expect(crossMiss).toBeNull();
    });
  });

  describe("Document Storage Isolation", () => {
    const docIdA = "doc-a-uuid";
    const docIdB = "doc-b-uuid";
    const contentA = Buffer.from("Sensitive confidential agreement of Organization Alpha");
    const contentB = Buffer.from("Sensitive financial proposal of Organization Beta");

    it("prevents cross-tenant file access even with identical filenames", async () => {
      const filename = "quotation-summary.pdf";

      await saveDocumentFile(ORG_A, docIdA, filename, contentA, "originals");
      await saveDocumentFile(ORG_B, docIdB, filename, contentB, "originals");

      // Org A reads its own file
      const fileA = await readDocumentFile(ORG_A, docIdA, filename, "originals");
      expect(fileA.buffer.toString()).toBe(contentA.toString());

      // Org B reads its own file
      const fileB = await readDocumentFile(ORG_B, docIdB, filename, "originals");
      expect(fileB.buffer.toString()).toBe(contentB.toString());

      // Org A attempts to read Org B's document ID under Org A's tenant ID
      await expect(
        readDocumentFile(ORG_A, docIdB, filename, "originals")
      ).rejects.toThrow(DocumentStorageError);

      // Org B attempts to read Org A's document ID under Org B's tenant ID
      await expect(
        readDocumentFile(ORG_B, docIdA, filename, "originals")
      ).rejects.toThrow(DocumentStorageError);
    });

    it("strictly blocks path traversal attempts to evade tenant partitioning", async () => {
      await expect(
        readDocumentFile(ORG_A, `../${ORG_B}/documents/${docIdB}`, "quotation-summary.pdf", "originals")
      ).rejects.toThrow("Invalid document identifier");

      await expect(
        readDocumentFile(`../${ORG_B}`, docIdA, "quotation-summary.pdf", "originals")
      ).rejects.toThrow("Invalid organization identifier");
    });
  });
});

