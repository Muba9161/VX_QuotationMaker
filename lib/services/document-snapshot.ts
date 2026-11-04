import crypto from "crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface TemplateSnapshot {
  id: string;
  title: string;
  version: number;
  type: string;
  category: string | null;
  fileSource: string | null;
  fileUrl: string | null;
  imageUrl: string | null;
  imageFilename: string | null;
  imageMimeType: string | null;
  contentSchema: unknown;
  items: Array<{
    description: string;
    defaultQuantity: number;
    unit: string;
    defaultRate: number;
    sortOrder: number;
  }>;
  clauses: Array<{
    title: string;
    content: string;
    sortOrder: number;
  }>;
}

export type TemplateSnapshotOrigin = "selected" | "recovered" | "copied" | "none";

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
  template?: TemplateSnapshot | null;
  templateSnapshotOrigin?: TemplateSnapshotOrigin;
  items: Array<{
    id: string;
    name?: string | null;
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

type SnapshotDatabase = Pick<Prisma.TransactionClient, "document" | "documentSnapshot">;
type DocumentWithTemplate = Prisma.DocumentGetPayload<{
  include: {
    template: {
      include: {
        items: true;
        clauses: true;
      };
    };
  };
}>;

interface CreateDocumentSnapshotOptions {
  database?: SnapshotDatabase;
  templateSnapshot?: TemplateSnapshot | null;
  templateSnapshotOrigin?: TemplateSnapshotOrigin;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function getTemplateSnapshot(contentJson: unknown): TemplateSnapshot | null {
  if (!isRecord(contentJson) || !isRecord(contentJson.template)) return null;

  const template = contentJson.template;
  return isTemplateSnapshot(template) ? template : null;
}

function isTemplateSnapshot(value: unknown): value is TemplateSnapshot {
  if (!isRecord(value)) return false;
  const nullableStringFields = [
    "category",
    "fileSource",
    "fileUrl",
    "imageUrl",
    "imageFilename",
    "imageMimeType",
  ];
  return typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.version === "number" &&
    typeof value.type === "string" &&
    "contentSchema" in value &&
    nullableStringFields.every(
      (field) => value[field] === null || typeof value[field] === "string"
    ) &&
    Array.isArray(value.items) &&
    value.items.every(
      (item) =>
        isRecord(item) &&
        typeof item.description === "string" &&
        typeof item.defaultQuantity === "number" &&
        typeof item.unit === "string" &&
        typeof item.defaultRate === "number" &&
        typeof item.sortOrder === "number"
    ) &&
    Array.isArray(value.clauses) &&
    value.clauses.every(
      (clause) =>
        isRecord(clause) &&
        typeof clause.title === "string" &&
        typeof clause.content === "string" &&
        typeof clause.sortOrder === "number"
    );
}

export function getTemplateSnapshotOrigin(contentJson: unknown): TemplateSnapshotOrigin | null {
  if (!isRecord(contentJson)) return null;
  const origin = contentJson.templateSnapshotOrigin;
  return origin === "selected" || origin === "recovered" || origin === "copied" || origin === "none"
    ? origin
    : null;
}

function toTemplateSnapshot(template: DocumentWithTemplate["template"]): TemplateSnapshot | null {
  if (!template) return null;

  return {
    id: template.id,
    title: template.title,
    version: template.version,
    type: template.type,
    category: template.category,
    fileSource: template.fileSource,
    fileUrl: template.fileUrl,
    imageUrl: template.imageUrl,
    imageFilename: template.imageFilename,
    imageMimeType: template.imageMimeType,
    contentSchema: template.contentSchema,
    items: template.items.map((item) => ({
      description: item.description,
      defaultQuantity: Number(item.defaultQuantity),
      unit: item.unit,
      defaultRate: Number(item.defaultRate),
      sortOrder: item.sortOrder,
    })),
    clauses: template.clauses.map((clause) => ({
      title: clause.title,
      content: clause.content,
      sortOrder: clause.sortOrder,
    })),
  };
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!isRecord(value)) return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, canonicalize(value[key])])
  );
}

/**
 * Deterministically creates a canonical JSON string and its SHA-256 hash.
 */
export function hashSnapshotContent(content: DocumentSnapshotContent): string {
  const canonicalString = JSON.stringify(canonicalize(content));
  return crypto.createHash("sha256").update(canonicalString).digest("hex");
}

/**
 * Creates an immutable DocumentSnapshot in the database for the given document.
 * If a snapshot already exists with identical hash, reuses it; otherwise increments version.
 */
export async function createDocumentSnapshot(
  documentId: string,
  organizationId: string,
  options: CreateDocumentSnapshotOptions = {}
) {
  const database = options.database || prisma;
  const doc = await database.document.findFirst({
    where: { id: documentId, organizationId },
    include: {
      items: { orderBy: { sortOrder: "asc" } },
      clauses: { orderBy: { sortOrder: "asc" } },
      template: {
        include: {
          items: { orderBy: { sortOrder: "asc" } },
          clauses: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
  });

  if (!doc) {
    throw new Error(`Document ${documentId} not found in organization ${organizationId}`);
  }

  const previousSnapshot = await database.documentSnapshot.findFirst({
    where: { documentId: doc.id },
    orderBy: { version: "desc" },
  });
  const previousTemplateSnapshot = getTemplateSnapshot(previousSnapshot?.contentJson);
  const previousTemplateSnapshotOrigin = getTemplateSnapshotOrigin(previousSnapshot?.contentJson);
  const canPreservePreviousTemplate =
    options.templateSnapshot === undefined &&
    options.templateSnapshotOrigin === undefined &&
    previousTemplateSnapshotOrigin !== null &&
    (previousTemplateSnapshot?.id === doc.templateId ||
      (!doc.templateId && (previousTemplateSnapshot || previousTemplateSnapshotOrigin === "none")));

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
    template:
      options.templateSnapshot !== undefined
        ? options.templateSnapshot
        : canPreservePreviousTemplate
          ? previousTemplateSnapshot
          : toTemplateSnapshot(doc.template),
    templateSnapshotOrigin:
      options.templateSnapshotOrigin ||
      (canPreservePreviousTemplate
        ? previousTemplateSnapshotOrigin
        : doc.templateId
          ? "recovered"
          : "none"),
    items: doc.items.map((it) => ({
      id: it.id,
      name: it.name,
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
  const existing = await database.documentSnapshot.findFirst({
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
  const lastSnapshot = await database.documentSnapshot.findFirst({
    where: { documentId: doc.id },
    orderBy: { version: "desc" },
  });

  const nextVersion = (lastSnapshot?.version || 0) + 1;

  return await database.documentSnapshot.create({
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
