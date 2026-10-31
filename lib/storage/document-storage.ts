import fs from "fs";
import path from "path";
import crypto from "crypto";

/**
 * Tenant-Isolated Document Storage Manager
 *
 * Provides safe local filesystem storage for Quotation & MOU documents,
 * contract attachments, and digitally signed PDF audit records.
 *
 * Security & Integrity Guarantees:
 * 1. Zero Cloud: Strictly local filesystem persistence (no S3/Cloudinary).
 * 2. Multi-Tenant Directory Partitioning: storage/{orgId}/documents/{docId}/{category}/
 * 3. Path Traversal Defense: Canonical path validation against storage root.
 * 4. Cryptographic Integrity: SHA-256 checksum computation on writes and reads.
 */

export type DocumentFileCategory = "originals" | "signed" | "attachments";

export class DocumentStorageError extends Error {
  public readonly code: string;
  public readonly status: number;

  constructor(message: string, code = "STORAGE_ERROR", status = 400) {
    super(message);
    this.name = "DocumentStorageError";
    this.code = code;
    this.status = status;
  }
}

export interface StoredDocumentResult {
  filename: string;
  absolutePath: string;
  relativePath: string;
  sizeBytes: number;
  sha256Hash: string;
  createdAt: string;
}

export function getStorageRoot(): string {
  const configured = process.env.LOCAL_STORAGE_PATH || "./storage";
  return path.resolve(configured);
}

/**
 * Validates and resolves the isolated directory for a specific tenant and document.
 */
export function resolveDocumentDir(
  orgId: string,
  docId: string,
  category: DocumentFileCategory
): string {
  if (!orgId || !orgId.trim() || orgId.includes("..") || orgId.includes("/") || orgId.includes("\\")) {
    throw new DocumentStorageError("Invalid organization identifier.", "INVALID_TENANT_ID", 400);
  }
  if (!docId || !docId.trim() || docId.includes("..") || docId.includes("/") || docId.includes("\\")) {
    throw new DocumentStorageError("Invalid document identifier.", "INVALID_DOCUMENT_ID", 400);
  }

  const base = getStorageRoot();
  const targetDir = path.resolve(base, orgId.trim(), "documents", docId.trim(), category);

  // Canonical path traversal check
  if (!targetDir.startsWith(base)) {
    throw new DocumentStorageError("Path traversal attempt detected.", "PATH_TRAVERSAL_DETECTED", 400);
  }

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  return targetDir;
}

/**
 * Saves a document buffer with automated SHA-256 hashing.
 */
export async function saveDocumentFile(
  orgId: string,
  docId: string,
  filename: string,
  buffer: Buffer,
  category: DocumentFileCategory = "originals"
): Promise<StoredDocumentResult> {
  const sanitizedFilename = path.basename(filename);
  if (!sanitizedFilename || sanitizedFilename === "." || sanitizedFilename === "..") {
    throw new DocumentStorageError("Invalid filename provided.", "INVALID_FILENAME", 400);
  }

  const dir = resolveDocumentDir(orgId, docId, category);
  const filePath = path.resolve(dir, sanitizedFilename);

  // Secondary traversal check for resolved file path
  if (!filePath.startsWith(dir)) {
    throw new DocumentStorageError("Path traversal attempt detected in filename.", "PATH_TRAVERSAL_DETECTED", 400);
  }

  await fs.promises.writeFile(filePath, buffer);

  const sha256Hash = crypto.createHash("sha256").update(buffer).digest("hex");
  const relativePath = path.relative(getStorageRoot(), filePath).replace(/\\/g, "/");

  return {
    filename: sanitizedFilename,
    absolutePath: filePath,
    relativePath,
    sizeBytes: buffer.length,
    sha256Hash,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Reads a stored document file and verifies its byte contents.
 */
export async function readDocumentFile(
  orgId: string,
  docId: string,
  filename: string,
  category: DocumentFileCategory = "originals"
): Promise<{ buffer: Buffer; sha256Hash: string; sizeBytes: number }> {
  const sanitizedFilename = path.basename(filename);
  const dir = resolveDocumentDir(orgId, docId, category);
  const filePath = path.resolve(dir, sanitizedFilename);

  if (!filePath.startsWith(dir)) {
    throw new DocumentStorageError("Path traversal attempt detected.", "PATH_TRAVERSAL_DETECTED", 400);
  }

  if (!fs.existsSync(filePath)) {
    throw new DocumentStorageError(`Document file '${sanitizedFilename}' not found.`, "FILE_NOT_FOUND", 404);
  }

  const buffer = await fs.promises.readFile(filePath);
  const sha256Hash = crypto.createHash("sha256").update(buffer).digest("hex");

  return {
    buffer,
    sha256Hash,
    sizeBytes: buffer.length,
  };
}

/**
 * Verifies that the on-disk file bytes exactly match an expected SHA-256 checksum.
 */
export async function verifyDocumentFileIntegrity(
  orgId: string,
  docId: string,
  filename: string,
  expectedHash: string,
  category: DocumentFileCategory = "signed"
): Promise<boolean> {
  try {
    const { sha256Hash } = await readDocumentFile(orgId, docId, filename, category);
    return sha256Hash.toLowerCase() === expectedHash.toLowerCase();
  } catch {
    return false;
  }
}

/**
 * Deletes a stored document file.
 */
export async function deleteDocumentFile(
  orgId: string,
  docId: string,
  filename: string,
  category: DocumentFileCategory
): Promise<boolean> {
  const sanitizedFilename = path.basename(filename);
  const dir = resolveDocumentDir(orgId, docId, category);
  const filePath = path.resolve(dir, sanitizedFilename);

  if (!filePath.startsWith(dir)) {
    throw new DocumentStorageError("Path traversal attempt detected.", "PATH_TRAVERSAL_DETECTED", 400);
  }

  if (fs.existsSync(filePath)) {
    await fs.promises.unlink(filePath);
    return true;
  }

  return false;
}

