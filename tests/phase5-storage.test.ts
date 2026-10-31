import { describe, it, expect, afterAll } from "vitest";
import {
  saveDocumentFile,
  readDocumentFile,
  verifyDocumentFileIntegrity,
  deleteDocumentFile,
  DocumentStorageError,
  getStorageRoot,
} from "@/lib/storage/document-storage";
import fs from "fs";
import path from "path";
import crypto from "crypto";

describe("Phase 5: Tenant-Isolated Document Storage", () => {
  const testOrgId = "test-org-uuid-0001";
  const testDocId = "test-doc-uuid-0002";
  const testFilename = "test-certificate.pdf";
  const dummyContent = Buffer.from("%PDF-1.4 Mock Executed Digital Document Content\n%%EOF");

  afterAll(async () => {
    // Clean up test file if left
    try {
      await deleteDocumentFile(testOrgId, testDocId, testFilename, "signed");
      const testDir = path.resolve(getStorageRoot(), testOrgId);
      if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true, force: true });
      }
    } catch {
      // ignore
    }
  });

  it("saves document bytes and computes SHA-256 hash", async () => {
    const res = await saveDocumentFile(testOrgId, testDocId, testFilename, dummyContent, "signed");

    expect(res.filename).toBe(testFilename);
    expect(res.sizeBytes).toBe(dummyContent.length);
    expect(typeof res.sha256Hash).toBe("string");
    expect(res.sha256Hash.length).toBe(64); // SHA-256 hex is 64 characters

    const expectedHash = crypto.createHash("sha256").update(dummyContent).digest("hex");
    expect(res.sha256Hash).toBe(expectedHash);
  });

  it("reads back stored document file and confirms byte contents", async () => {
    const file = await readDocumentFile(testOrgId, testDocId, testFilename, "signed");

    expect(file.sizeBytes).toBe(dummyContent.length);
    expect(file.buffer.equals(dummyContent)).toBe(true);
  });

  it("validates document integrity against expected hash", async () => {
    const validHash = crypto.createHash("sha256").update(dummyContent).digest("hex");
    const tamperedHash = "a".repeat(64);

    const isValid = await verifyDocumentFileIntegrity(
      testOrgId,
      testDocId,
      testFilename,
      validHash,
      "signed"
    );
    expect(isValid).toBe(true);

    const isTampered = await verifyDocumentFileIntegrity(
      testOrgId,
      testDocId,
      testFilename,
      tamperedHash,
      "signed"
    );
    expect(isTampered).toBe(false);
  });

  it("blocks directory traversal attacks in tenantId or docId", async () => {
    await expect(
      saveDocumentFile("../evil-tenant", testDocId, "exploit.pdf", dummyContent, "signed")
    ).rejects.toThrow(DocumentStorageError);

    await expect(
      saveDocumentFile(testOrgId, "../../etc", "exploit.pdf", dummyContent, "signed")
    ).rejects.toThrow(DocumentStorageError);

    await expect(
      readDocumentFile(testOrgId, testDocId, "../../../boot.ini", "signed")
    ).rejects.toThrow(DocumentStorageError);
  });

  it("deletes stored document file cleanly", async () => {
    const deleted = await deleteDocumentFile(testOrgId, testDocId, testFilename, "signed");
    expect(deleted).toBe(true);

    await expect(readDocumentFile(testOrgId, testDocId, testFilename, "signed")).rejects.toThrow(
      "not found"
    );
  });
});

