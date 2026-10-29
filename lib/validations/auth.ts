import { z } from "zod";

/**
 * Authentication Input Validation Schemas
 *
 * Enforces strict boundary validation on all authentication and registration payloads.
 */

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please provide a valid email address.")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, "Password is required."),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerOrgSchema = z.object({
  orgName: z
    .string()
    .min(2, "Organization name must be at least 2 characters.")
    .max(100, "Organization name cannot exceed 100 characters.")
    .trim(),
  adminName: z
    .string()
    .min(2, "Admin name must be at least 2 characters.")
    .max(100, "Admin name cannot exceed 100 characters.")
    .trim(),
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please provide a valid business email address.")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .max(128, "Password cannot exceed 128 characters."),
  phone: z.string().max(50).optional().nullable(),
});

export type RegisterOrgInput = z.infer<typeof registerOrgSchema>;

/**
 * Formats Zod validation issues into a clean field-to-error mapping.
 */
export function formatZodIssues(issues: z.ZodIssue[]): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const field = issue.path.join(".") || "payload";
    if (!errors[field]) {
      errors[field] = issue.message;
    }
  }
  return errors;
}
