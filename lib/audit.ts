import { prisma } from "@/lib/prisma";

/**
 * Centralized Audit Logging Service
 *
 * Records immutable audit logs for organization settings, branding,
 * letterhead updates, and team management actions.
 */

export interface AuditLogParams {
  userId?: string | null;
  actorId?: string | null;
  organizationId?: string | null;
  userName?: string | null;
  action: string;
  details?: string | null;
  description?: string | null;
  resourceType?: string | null;
  resourceId?: string | null;
  changes?: unknown;
  ipAddress?: string | null;
}

/**
 * Appends an entry to the platform audit log in PostgreSQL.
 * Silently catches errors so audit logging failures never break primary transactions.
 */
export async function recordAuditLog(params: AuditLogParams): Promise<void> {
  try {
    const details = params.details || params.description || (params.changes ? JSON.stringify(params.changes) : null);
    await prisma.platformAuditLog.create({
      data: {
        userId: params.userId || params.actorId || null,
        organizationId: params.organizationId || null,
        userName: params.userName || "System",
        action: params.action,
        details,
        ipAddress: params.ipAddress || null,
      },
    });
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[AuditLog Error] Failed to persist audit record:", err);
    }
  }
}
