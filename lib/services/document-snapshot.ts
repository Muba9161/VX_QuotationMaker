import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export interface DocumentSnapshotContent {
  id: string;
  docNumber: string;
  title: string;
  type: string;
  organizationId: string;
  clientName: string;
  clientCompany?: string | null;
  clientEmail?: string | null;
  clientPhone?: string | null;
  clientAddress?: string | null;
  currency: string;
  currencySymbol: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountType?: string | null;
  discountValue: number;
  discountAmount: number;
  total: number;
  issueDate: string;
  validTill?: string | null;
  effectiveDate?: string | null;
  expiryDate?: string | null;
  paymentTerms?: string | null;
  notes?: string | null;
  termsAndConditions?: string | null;
  governingLaw?: string | null;
  purpose?: string | null;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unit: string;
    rate: number;
    taxPercent: number;
    amount: number;
    sortOrder: number;
  }>;
  clauses: Array<{
    id: string;
    title: string;
    content: string;
    sortOrder: number;
  }>;
}

/**
 * Deterministically creates a canonical JSON string and its SHA-256 hash.
 */
export function hashSnapshotContent(content: DocumentSnapshotContent): string {
  const canonicalString = JSON.stringify(content, Object.keys(content).sort());
  return crypto.createHash("sha256").update(canonicalString).digest("hex");
}

/**
 * Creates an immutable DocumentSnapshot in the database for the given document.
 * If a snapshot already exists with identical hash, reuses it; otherwise increments version.
 */
export async function createDocumentSnapshot(documentId: string, organizationId: string) {
  const doc = await prisma.document.findFirst({
    where: { id: documentId, organizationId },
    include: {
      items: { orderBy: { sortOrder: "asc" } },
      clauses: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!doc) {
    throw new Error(`Document ${documentId} not found in organization ${organizationId}`);
  }

  const content: DocumentSnapshotContent = {
    id: doc.id,
    docNumber: doc.docNumber,
    title: doc.title,
    type: doc.type,
    organizationId: doc.organizationId,
    clientName: doc.clientName,
    clientCompany: doc.clientCompany,
    clientEmail: doc.clientEmail,
    clientPhone: doc.clientPhone,
    clientAddress: doc.clientAddress,
    currency: doc.currency,
    currencySymbol: doc.currencySymbol,
    subtotal: Number(doc.subtotal),
    taxRate: Number(doc.taxRate),
    taxAmount: Number(doc.taxAmount),
    discountType: doc.discountType,
    discountValue: Number(doc.discountValue),
    discountAmount: Number(doc.discountAmount),
    total: Number(doc.total),
    issueDate: doc.issueDate.toISOString(),
    validTill: doc.validTill ? doc.validTill.toISOString() : null,
    effectiveDate: doc.effectiveDate ? doc.effectiveDate.toISOString() : null,
    expiryDate: doc.expiryDate ? doc.expiryDate.toISOString() : null,
    paymentTerms: doc.paymentTerms,
    notes: doc.notes,
    termsAndConditions: doc.termsAndConditions,
    governingLaw: doc.governingLaw,
    purpose: doc.purpose,
    items: doc.items.map((it) => ({
      id: it.id,
      description: it.description,
      quantity: Number(it.quantity),
      unit: it.unit,
      rate: Number(it.rate),
      taxPercent: Number(it.taxPercent),
      amount: Number(it.amount),
      sortOrder: it.sortOrder,
    })),
    clauses: doc.clauses.map((c) => ({
      id: c.id,
      title: c.title,
      content: c.content,
      sortOrder: c.sortOrder,
    })),
  };

  const contentHash = hashSnapshotContent(content);

  // Check if identical snapshot already exists
  const existing = await prisma.documentSnapshot.findFirst({
    where: {
      documentId: doc.id,
      contentHash,
    },
    orderBy: { version: "desc" },
  });

  if (existing) {
    return existing;
  }

  // Get current highest version
  const lastSnapshot = await prisma.documentSnapshot.findFirst({
    where: { documentId: doc.id },
    orderBy: { version: "desc" },
  });

  const nextVersion = (lastSnapshot?.version || 0) + 1;

  return await prisma.documentSnapshot.create({
    data: {
      documentId: doc.id,
      organizationId: doc.organizationId,
      version: nextVersion,
      title: doc.title,
      docNumber: doc.docNumber,
      type: doc.type,
      contentJson: content as unknown as object,
      contentHash,
    },
  });
}

