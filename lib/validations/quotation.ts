import { z } from "zod";

/**
 * Quotation Management Validation Schemas
 */

export const quotationItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().max(255).optional(),
  description: z.string().min(1, "Item description is required.").max(2000),
  quantity: z.number().positive("Quantity must be greater than zero."),
  unit: z.string().max(50).default("Nos"),
  rate: z.number().min(0, "Unit price cannot be negative."),
  discount: z.number().min(0, "Discount cannot be negative.").default(0),
  taxPercent: z.number().min(0).max(100).default(18),
  sortOrder: z.number().int().default(0),
});

export type QuotationItemInput = z.infer<typeof quotationItemSchema>;

export const createQuotationSchema = z.object({
  contactId: z.string().uuid("Invalid client ID format.").optional().nullable(),
  clientId: z.string().uuid("Invalid client ID format.").optional().nullable(),
  clientName: z.string().min(1, "Client or company name is required.").max(255),
  clientCompany: z.string().max(255).optional().nullable(),
  clientEmail: z.string().email("Invalid client email address.").optional().nullable().or(z.literal("")),
  clientPhone: z.string().max(50).optional().nullable(),
  clientAddress: z.string().max(1000).optional().nullable(),

  title: z.string().min(2, "Quotation title must be at least 2 characters.").max(255),
  issueDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  validTill: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional().nullable(),
  currency: z.string().max(10).default("INR"),
  currencySymbol: z.string().max(5).default("₹"),

  discountType: z.enum(["percentage", "fixed", "none"]).default("none"),
  discountValue: z.number().min(0).default(0),
  taxRate: z.number().min(0).max(100).default(18),

  paymentTerms: z.string().max(2000).optional().nullable(),
  deliveryTerms: z.string().max(2000).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  termsAndConditions: z.string().max(5000).optional().nullable(),
  templateId: z.string().uuid().optional().nullable(),

  items: z.array(quotationItemSchema).min(1, "Quotation must contain at least one line item."),
});

export type CreateQuotationInput = z.infer<typeof createQuotationSchema>;

export const updateQuotationSchema = createQuotationSchema.partial();

export type UpdateQuotationInput = z.infer<typeof updateQuotationSchema>;

export const quotationStatusSchema = z.object({
  status: z.string().min(1, "Target status is required."),
  remarks: z.string().max(1000).optional(),
});

export type QuotationStatusInput = z.infer<typeof quotationStatusSchema>;

export const quotationFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.string().optional(),
  contactId: z.string().uuid().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export type QuotationFilterInput = z.infer<typeof quotationFilterSchema>;

