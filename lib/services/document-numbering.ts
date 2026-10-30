import { prisma } from "@/lib/prisma";

export type DocumentNumberType = "QUOTATION" | "MOU";

/**
 * Concurrency-Safe Organization Document Numbering Service
 *
 * Employs PostgreSQL atomic counter increments to ensure that concurrent requests
 * never generate duplicate quotation or MOU identifiers.
 *
 * Format:
 * - Quotation: VX-QTN-{YEAR}-{0001}
 * - MOU:       VX-MOU-{YEAR}-{0001}
 */
export async function generateNextDocumentNumber(
  organizationId: string,
  type: DocumentNumberType,
  year?: number
): Promise<string> {
  const currentYear = year || new Date().getFullYear();
  const typeKey = type.toUpperCase();
  const prefix = typeKey === "QUOTATION" ? "QTN" : "MOU";

  // Use raw PostgreSQL atomic UPSERT to safely increment counter in one atomic statement
  const result = await prisma.$queryRawUnsafe<Array<{ next_val: number }>>(`
    INSERT INTO document_counters (id, organization_id, type, year, last_number, created_at, updated_at)
    VALUES (gen_random_uuid(), '${organizationId}'::uuid, '${typeKey}', ${currentYear}, 1, NOW(), NOW())
    ON CONFLICT (organization_id, type, year)
    DO UPDATE SET 
      last_number = document_counters.last_number + 1,
      updated_at = NOW()
    RETURNING last_number as next_val;
  `);

  if (!result || result.length === 0 || typeof result[0].next_val !== "number") {
    throw new Error(`Failed to generate sequential document number for ${type}`);
  }

  const sequence = String(result[0].next_val).padStart(4, "0");
  return `VX-${prefix}-${currentYear}-${sequence}`;
}

