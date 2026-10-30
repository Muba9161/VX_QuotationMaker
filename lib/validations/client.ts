import { z } from "zod";

/**
 * Client Management Validation Schemas
 */

export const createClientSchema = z.object({
  name: z.string().min(2, "Contact person name must be at least 2 characters.").max(255),
  companyName: z.string().max(255).optional().nullable(),
  email: z.string().email("Please provide a valid email address.").optional().nullable().or(z.literal("")),
  phone: z.string().max(50).optional().nullable(),
  address: z.string().max(1000).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  country: z.string().max(100).default("India").optional(),
  postalCode: z.string().max(20).optional().nullable(),
  taxId: z.string().max(100).optional().nullable(),
  website: z.string().max(255).optional().nullable(),
  notes: z.string().max(3000).optional().nullable(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;

export const updateClientSchema = createClientSchema.partial().extend({
  status: z.enum(["ACTIVE", "ARCHIVED"]).optional(),
});

export type UpdateClientInput = z.infer<typeof updateClientSchema>;

export const clientFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(["ACTIVE", "ARCHIVED", "ALL"]).default("ACTIVE"),
});

export type ClientFilterInput = z.infer<typeof clientFilterSchema>;

