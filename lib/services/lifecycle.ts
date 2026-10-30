import { DocumentStatus } from "@prisma/client";

/**
 * Document Status Lifecycle & Transition Rules
 *
 * Enforces valid state machines for Quotations and MOUs, ensuring unauthorized
 * or logically impossible status transitions are rejected on the server.
 */

// Quotation valid status transitions
const QUOTATION_VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["SENT", "REVOKED"],
  SENT: ["VIEWED", "APPROVED", "DECLINED", "EXPIRED", "REVOKED"],
  VIEWED: ["APPROVED", "DECLINED", "EXPIRED", "REVOKED"],
  APPROVED: [], // Terminal accepted state
  DECLINED: ["DRAFT"], // Can re-draft if rejected
  EXPIRED: ["DRAFT"],  // Can renew draft
  REVOKED: ["DRAFT"],
};

// MOU valid status transitions for standard lifecycle management
// Note: Transition to SIGNED is strictly restricted to verified digital signing workflows (Phase 4)
const MOU_VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["PENDING_APPROVAL", "APPROVED", "SENT", "REVOKED"],
  PENDING_APPROVAL: ["APPROVED", "DRAFT", "REVOKED"],
  APPROVED: ["SENT", "REVOKED"],
  SENT: ["VIEWED", "PENDING_SIGNATURE", "DECLINED", "EXPIRED", "REVOKED"],
  VIEWED: ["PENDING_SIGNATURE", "DECLINED", "EXPIRED", "REVOKED"],
  PENDING_SIGNATURE: ["DECLINED", "EXPIRED", "REVOKED"],
  SIGNED: [], // Terminal executed state
  DECLINED: ["DRAFT"],
  EXPIRED: ["DRAFT"],
  REVOKED: ["DRAFT"],
};

/**
 * Maps standard user-facing status strings to schema DocumentStatus enum.
 */
export function normalizeDocumentStatus(status: string): DocumentStatus {
  const upper = status.trim().toUpperCase();
  switch (upper) {
    case "DRAFT":
      return DocumentStatus.DRAFT;
    case "SENT":
      return DocumentStatus.SENT;
    case "VIEWED":
      return DocumentStatus.VIEWED;
    case "ACCEPTED":
    case "APPROVED":
      return DocumentStatus.APPROVED;
    case "REJECTED":
    case "DECLINED":
      return DocumentStatus.DECLINED;
    case "EXPIRED":
      return DocumentStatus.EXPIRED;
    case "CANCELLED":
    case "REVOKED":
      return DocumentStatus.REVOKED;
    case "READY":
    case "PENDING_APPROVAL":
      return DocumentStatus.PENDING_APPROVAL;
    case "PARTIALLY_SIGNED":
    case "PENDING_SIGNATURE":
      return DocumentStatus.PENDING_SIGNATURE;
    case "SIGNED":
      return DocumentStatus.SIGNED;
    default:
      throw new Error(`Unknown document status: ${status}`);
  }
}

/**
 * Validates whether a requested transition is allowable under the lifecycle state machine.
 */
export function validateStatusTransition(
  docType: "QUOTATION" | "MOU" | string,
  currentStatus: DocumentStatus,
  targetStatus: DocumentStatus
): { valid: boolean; error?: string } {
  if (currentStatus === targetStatus) {
    return { valid: true };
  }

  // Pre-Phase 4 Guard: Manual transitions to SIGNED are strictly forbidden.
  // Digital signing with cryptographic verification will be implemented in Phase 4.
  if (docType === "MOU" && targetStatus === DocumentStatus.SIGNED) {
    return {
      valid: false,
      error: "MOU cannot be marked as SIGNED via manual status updates. Verified digital signing workflow is required (Phase 4).",
    };
  }

  const table = docType === "QUOTATION"
    ? QUOTATION_VALID_TRANSITIONS
    : MOU_VALID_TRANSITIONS;

  const allowed = table[currentStatus] || [];
  if (!allowed.includes(targetStatus)) {
    return {
      valid: false,
      error: `Invalid status transition: Cannot transition ${docType} from ${currentStatus} to ${targetStatus}.`,
    };
  }

  return { valid: true };
}

