import { z } from "zod";

/**
 * Validation schemas for Bulk Email operations.
 */

export const bulkEmailRecipientSchema = z.object({
  contactId: z.string().uuid("Invalid contact ID").optional().nullable(),
  email: z.string().trim().email("Invalid email address"),
  name: z.string().trim().max(255).default(""),
});

export const createBulkEmailBatchSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(3, "Subject must be at least 3 characters")
    .max(200, "Subject cannot exceed 200 characters"),
  message: z
    .string()
    .trim()
    .min(5, "Message must be at least 5 characters")
    .max(50000, "Message cannot exceed 50,000 characters"),
  recipients: z
    .array(bulkEmailRecipientSchema)
    .min(1, "Please select at least one recipient")
    .max(500, "Cannot send to more than 500 recipients in a single batch"),
});

export type CreateBulkEmailBatchInput = z.infer<typeof createBulkEmailBatchSchema>;

