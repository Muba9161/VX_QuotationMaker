import fs from "fs";
import path from "path";
import crypto from "crypto";

/**
 * Local Filesystem Secure Asset Storage Service
 *
 * Requirements:
 * 1. Strictly local filesystem storage (Zero AWS S3 / object storage).
 * 2. MIME type whitelisting (PNG, JPEG, WebP, SVG).
 * 3. File size capping (5MB maximum).
 * 4. Path traversal prevention via canonical path validation.
 * 5. Safe unguessable generated filenames (UUID + whitelisted extension).
 */

export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
};

export class UploadError extends Error {
  public readonly code: string;
  public readonly status: number;

  constructor(message: string, code = "UPLOAD_ERROR", status = 400) {
    super(message);
    this.name = "UploadError";
    this.code = code;
    this.status = status;
  }
}

/**
 * Resolves and creates the tenant-specific upload directory.
 */
function getTenantUploadDir(orgId: string, subfolder = "branding"): string {
  const resolvedBase = path.resolve(/*turbopackIgnore: true*/ process.env.LOCAL_STORAGE_PATH || "./storage");
  const tenantDir = path.resolve(resolvedBase, "uploads", subfolder, orgId);

  // Path traversal defense: verify directory resides within resolvedBase
  if (!tenantDir.startsWith(resolvedBase)) {
    throw new UploadError("Invalid storage path detected.", "PATH_TRAVERSAL_DETECTED", 400);
  }

  if (!fs.existsSync(tenantDir)) {
    fs.mkdirSync(tenantDir, { recursive: true });
  }

  return tenantDir;
}

export interface StoredAssetResult {
  filename: string;
  relativePath: string;
  publicUrl: string;
  sizeBytes: number;
  mimeType: string;
}

/**
 * Validates and saves an uploaded file buffer to the local filesystem.
 */
export async function saveTenantAsset(
  orgId: string,
  file: File,
  category: "logo" | "letterhead" = "logo"
): Promise<StoredAssetResult> {
  // 1. File size validation
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new UploadError(
      `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum allowed size of 5MB.`,
      "FILE_TOO_LARGE",
      400
    );
  }

  if (file.size === 0) {
    throw new UploadError("Cannot upload an empty file.", "EMPTY_FILE", 400);
  }

  // 2. MIME type validation
  const ext = ALLOWED_MIME_TYPES[file.type.toLowerCase()];
  if (!ext) {
    throw new UploadError(
      `Unsupported file type '${file.type}'. Allowed types: PNG, JPEG, WebP, SVG.`,
      "INVALID_FILE_TYPE",
      400
    );
  }

  // 3. Generate unguessable random filename
  const filename = `${category}-${crypto.randomUUID()}${ext}`;
  const targetDir = getTenantUploadDir(orgId, "branding");
  const targetPath = path.resolve(targetDir, filename);

  // Final path traversal verification
  if (!targetPath.startsWith(targetDir)) {
    throw new UploadError("Path traversal rejected.", "SECURITY_VIOLATION", 403);
  }

  // 4. Write to disk
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.promises.writeFile(targetPath, buffer);

  const publicUrl = `/api/v1/organization/branding/asset/${orgId}/${filename}`;

  return {
    filename,
    relativePath: path.relative(process.cwd(), targetPath),
    publicUrl,
    sizeBytes: file.size,
    mimeType: file.type,
  };
}

/**
 * Safely reads a tenant asset from disk. Returns null if missing or invalid.
 */
export async function readTenantAsset(
  orgId: string,
  filename: string
): Promise<{ buffer: Buffer; mimeType: string } | null> {
  // Disallow path traversal characters in filename
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return null;
  }

  const targetDir = getTenantUploadDir(orgId, "branding");
  const targetPath = path.resolve(targetDir, filename);

  if (!targetPath.startsWith(targetDir) || !fs.existsSync(targetPath)) {
    return null;
  }

  const ext = path.extname(filename).toLowerCase();
  const mimeType =
    Object.keys(ALLOWED_MIME_TYPES).find((m) => ALLOWED_MIME_TYPES[m] === ext) ||
    "application/octet-stream";

  const buffer = await fs.promises.readFile(targetPath);
  return { buffer, mimeType };
}
