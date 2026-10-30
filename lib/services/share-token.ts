import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { DocumentShare, Document, Organization, DocumentSnapshot, DocumentSignature, DocumentItem, DocumentClause } from "@prisma/client";

/**
 * Generates a 256-bit cryptographically secure random opaque token.
 * 32 bytes = 256 bits = 64 hex characters.
 */
export function generateShareToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Computes a standard SHA-256 hexadecimal hash of the raw token.
 * Only this hash is stored in PostgreSQL to prevent token leakage from database dumps.
 */
export function hashShareToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken.trim()).digest("hex");
}

export type PopulatedShare = DocumentShare & {
  document: Document & {
    items: DocumentItem[];
    clauses: DocumentClause[];
  };
  snapshot: DocumentSnapshot | null;
  organization: Pick<Organization, "id" | "name" | "logoUrl" | "primaryColor" | "secondaryColor" | "email" | "phone" | "address" | "taxId" | "website">;
  signatures: DocumentSignature[];
};

export type ResolveShareResult =
  | {
      valid: true;
      share: PopulatedShare;
      document: PopulatedShare["document"];
      organization: PopulatedShare["organization"];
      snapshot: DocumentSnapshot | null;
    }
  | {
      valid: false;
      reason: "INVALID_TOKEN_FORMAT" | "NOT_FOUND" | "REVOKED" | "EXPIRED";
      share?: PopulatedShare;
    };

/**
 * Validates a public share token against the database:
 * 1. Hashes raw token.
 * 2. Checks existence, status, and expiration.
 * 3. Enforces organization isolation.
 */
export async function resolveShareByToken(rawToken: string): Promise<ResolveShareResult> {
  if (!rawToken || typeof rawToken !== "string" || rawToken.length < 32) {
    return { valid: false, reason: "INVALID_TOKEN_FORMAT" };
  }

  const tokenHash = hashShareToken(rawToken);

  const share = (await prisma.documentShare.findUnique({
    where: { tokenHash },
    include: {
      document: {
        include: {
          items: { orderBy: { sortOrder: "asc" } },
          clauses: { orderBy: { sortOrder: "asc" } },
        },
      },
      snapshot: true,
      organization: {
        select: {
          id: true,
          name: true,
          logoUrl: true,
          primaryColor: true,
          secondaryColor: true,
          email: true,
          phone: true,
          address: true,
          taxId: true,
          website: true,
        },
      },
      signatures: {
        orderBy: { createdAt: "asc" },
      },
    },
  })) as PopulatedShare | null;

  if (!share) {
    return { valid: false, reason: "NOT_FOUND" };
  }

  if (share.status === "REVOKED") {
    return { valid: false, reason: "REVOKED", share };
  }

  const now = new Date();
  if (share.status === "EXPIRED" || (share.expiresAt && new Date(share.expiresAt) < now)) {
    // If not already marked expired, update status asynchronously
    if (share.status !== "EXPIRED") {
      prisma.documentShare
        .update({
          where: { id: share.id },
          data: { status: "EXPIRED" },
        })
        .catch(() => {});
    }
    return { valid: false, reason: "EXPIRED", share };
  }

  return {
    valid: true,
    share,
    document: share.document,
    organization: share.organization,
    snapshot: share.snapshot,
  };
}
