import { z } from "zod";

/**
 * MOU (Memorandum of Understanding) Validation Schemas
 */

export const mouClauseSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Section title is required.").max(255),
  content: z.string().min(1, "Section clause content cannot be empty.").max(20000),
  sortOrder: z.number().int().default(0),
});

export type MouClauseInput = z.infer<typeof mouClauseSchema>;

export const createMouSchema = z.object({
  contactId: z.string().uuid("Invalid party ID format.").optional().nullable(),
  clientId: z.string().uuid("Invalid party ID format.").optional().nullable(),
  clientName: z.string().min(1, "Party / representative name is required.").max(255),
  clientCompany: z.string().max(255).optional().nullable(),
  clientEmail: z.string().email("Invalid email address.").optional().nullable().or(z.literal("")),
  clientPhone: z.string().max(50).optional().nullable(),
  clientAddress: z.string().max(1000).optional().nullable(),

  title: z.string().min(2, "MOU title must be at least 2 characters.").max(255),
  purpose: z.string().max(3000).optional().nullable(),
  governingLaw: z.string().max(255).default("Indian Jurisdiction"),

  effectiveDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  expiryDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional().nullable(),

  notes: z.string().max(5000).optional().nullable(),
  templateId: z.string().uuid().optional().nullable(),

  clauses: z.array(mouClauseSchema).min(1, "MOU must contain at least one structured section or clause."),
});

export type CreateMouInput = z.infer<typeof createMouSchema>;

export const updateMouSchema = createMouSchema.partial();

export type UpdateMouInput = z.infer<typeof updateMouSchema>;

export const mouStatusSchema = z.object({
  status: z.string().min(1, "Target status is required."),
  remarks: z.string().max(1000).optional(),
});

export type MouStatusInput = z.infer<typeof mouStatusSchema>;

export const mouFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.string().optional(),
  contactId: z.string().uuid().optional(),
});

export type MouFilterInput = z.infer<typeof mouFilterSchema>;

