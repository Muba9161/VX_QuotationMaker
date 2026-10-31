import { z } from "zod";
import { UserRole } from "@prisma/client";

/**
 * Organization Settings & Workspace Validation Schemas
 *
 * Strict boundary validation for Organization Profile, Commercial Settings,
 * Branding, Letterhead, and Team Management.
 */

// Hex color validation (#RGB or #RRGGBB)
const hexColorRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const updateSettingsSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters.").max(100).optional(),
  displayName: z.string().max(100).optional().nullable(),
  tagline: z.string().max(255).optional().nullable(),
  email: z.string().email("Invalid organization email address.").optional(),
  phone: z.string().max(50).optional().nullable(),
  website: z.string().max(255).optional().nullable(),
  address: z.string().max(1000).optional().nullable(),
  taxId: z.string().max(100).optional().nullable(),
  cin: z.string().max(100).optional().nullable(),
  // Commercial Settings
  defaultTaxRate: z.number().min(0, "Tax rate cannot be negative.").max(100, "Tax rate cannot exceed 100%.").optional(),
  defaultCurrency: z.string().min(1).max(10).optional(),
  defaultCurrencySymbol: z.string().min(1).max(5).optional(),
  defaultPaymentTerms: z.string().max(500).optional().nullable(),
  standardNotes: z.string().max(2000).optional().nullable(),
  standardTermsConditions: z.string().max(5000).optional().nullable(),
  defaultExpiryDays: z.number().int().min(1, "Expiry days must be at least 1.").max(365, "Expiry days cannot exceed 365.").optional(),
  allowMemberRegistration: z.boolean().optional(),
  requireAdminApproval: z.boolean().optional(),
  autoRemindersEnabled: z.boolean().optional(),
  reminderDaysBeforeExpiry: z.number().int().min(1).max(30).optional(),
  notifyDocViewed: z.boolean().optional(),
  notifyDocSigned: z.boolean().optional(),
  notifyDocExpired: z.boolean().optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;

export const updateBrandingSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters.").max(100).optional(),
  tagline: z.string().max(255).optional().nullable(),
  website: z.string().max(255).optional().nullable(),
  email: z.string().email("Invalid email address.").optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  address: z.string().max(1000).optional().nullable(),
  primaryColor: z.string().regex(hexColorRegex, "Primary color must be a valid hex code (e.g. #2563EB).").optional(),
  secondaryColor: z.string().regex(hexColorRegex, "Secondary color must be a valid hex code (e.g. #10B981).").optional(),
  accentColor: z.string().regex(hexColorRegex, "Accent color must be a valid hex code (e.g. #06B6D4).").optional(),
  logoUrl: z.string().max(1000).optional().nullable(),
  // Centralized Letterhead configuration shared by quotations and MOUs
  letterheadUrl: z.string().max(1000).optional().nullable(),
  letterheadHeaderText: z.string().max(2000).optional().nullable(),
  letterheadFooterText: z.string().max(2000).optional().nullable(),
  letterheadLogoPosition: z.enum(["left", "center", "right"]).optional(),
  defaultSignatoryName: z.string().max(255).optional().nullable(),
  defaultSignatoryTitle: z.string().max(255).optional().nullable(),
});

export type UpdateBrandingInput = z.infer<typeof updateBrandingSchema>;

export const inviteMemberSchema = z.object({
  name: z.string().min(1, "Name is required.").max(255).optional(),
  email: z.string().email("Please provide a valid email address.").toLowerCase().trim(),
  // Client can only assign organization-level roles, never platform roles!
  role: z.enum([UserRole.ORG_ADMIN, UserRole.EDITOR, UserRole.VIEWER] as const, {
    message: "Role must be ORG_ADMIN, EDITOR, or VIEWER.",
  }),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

export const updateMemberSchema = z.object({
  name: z.string().min(1, "Name is required.").max(100).optional(),
  role: z.enum([UserRole.ORG_ADMIN, UserRole.EDITOR, UserRole.VIEWER]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(),
  title: z.string().max(100).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
});

export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;

export const updateInviteSchema = z.object({
  role: z.enum([UserRole.ORG_ADMIN, UserRole.EDITOR, UserRole.VIEWER], {
    message: "Role must be ORG_ADMIN, EDITOR, or VIEWER.",
  }),
});

export type UpdateInviteInput = z.infer<typeof updateInviteSchema>;

export const acceptInviteSchema = z.object({
  token: z.string().min(1, "Invitation token is required."),
  name: z.string().min(2, "Name must be at least 2 characters.").max(100).optional(),
  password: z.string().min(8, "Password must be at least 8 characters.").max(100).optional(),
});

export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;
