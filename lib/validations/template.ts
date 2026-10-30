import { z } from "zod";

/**
 * Document Template Validation Schemas
 */

export const templateItemSchema = z.object({
  description: z.string().min(1, "Item description is required.").max(2000),
  defaultQuantity: z.number().positive().default(1),
  unit: z.string().max(50).default("Nos"),
  defaultRate: z.number().min(0).default(0),
  sortOrder: z.number().int().default(0),
});

export const templateClauseSchema = z.object({
  title: z.string().min(1, "Clause title is required.").max(255),
  content: z.string().min(1, "Clause content cannot be empty.").max(20000),
  sortOrder: z.number().int().default(0),
});

export const createTemplateSchema = z.object({
  title: z.string().min(2, "Template title must be at least 2 characters.").max(255),
  type: z.enum(["QUOTATION", "MOU"]),
  description: z.string().max(2000).optional().nullable(),
  isDefault: z.boolean().default(false),
  contentSchema: z.record(z.string(), z.unknown()).optional(),
  items: z.array(templateItemSchema).optional(),
  clauses: z.array(templateClauseSchema).optional(),
});

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;

export const updateTemplateSchema = createTemplateSchema.partial();

export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;

