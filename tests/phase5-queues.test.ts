import { describe, it, expect, afterAll } from "vitest";
import {
  enqueueInviteEmail,
  enqueueDocumentSharedEmail,
  enqueueSignatureCompletedEmail,
  enqueuePdfGeneration,
  enqueueSigningReminder,
  enqueueMaintenanceJob,
  closeAllQueues,
  QUEUE_NAMES,
} from "@/lib/queue/queue-manager";

describe("Phase 5: Background Queues & Job Enqueueing", () => {
  afterAll(async () => {
    await closeAllQueues();
  });

  it("exports designated queue names matching architecture specification", () => {
    expect(QUEUE_NAMES.EMAIL).toBe("email-queue");
    expect(QUEUE_NAMES.PDF).toBe("pdf-queue");
    expect(QUEUE_NAMES.REMINDER).toBe("reminder-queue");
    expect(QUEUE_NAMES.MAINTENANCE).toBe("maintenance-queue");
  });

  it("successfully enqueues team invitation email jobs", async () => {
    const jobId = await enqueueInviteEmail({
      to: "invited-dev@example.com",
      organizationName: "VorldX Test Org",
      role: "Editor",
      inviteUrl: "https://example.com/invite?token=fake",
    });

    expect(typeof jobId).toBe("string");
    expect(jobId.length).toBeGreaterThan(0);
  });

  it("successfully enqueues document shared email jobs", async () => {
    const jobId = await enqueueDocumentSharedEmail({
      to: "recipient@example.com",
      recipientName: "John Doe",
      organizationName: "VorldX",
      docTitle: "Enterprise Agreement",
      docNumber: "AGR-2026-001",
      docType: "Agreement",
      shareUrl: "https://example.com/share/test",
      expiresAtFormatted: "15 Nov 2026",
    });

    expect(typeof jobId).toBe("string");
    expect(jobId.length).toBeGreaterThan(0);
  });

  it("successfully enqueues signature completed notification jobs", async () => {
    const jobId = await enqueueSignatureCompletedEmail({
      to: "audit@example.com",
      recipientName: "Auditor",
      signerName: "John Doe",
      signerEmail: "john@example.com",
      organizationName: "VorldX",
      docTitle: "Enterprise Agreement",
      docNumber: "AGR-2026-001",
      docType: "Agreement",
      executedAtFormatted: "31 Oct 2026 14:00:00 UTC",
    });

    expect(typeof jobId).toBe("string");
    expect(jobId.length).toBeGreaterThan(0);
  });

  it("successfully enqueues async PDF generation and signing jobs", async () => {
    const jobId = await enqueuePdfGeneration({
      documentId: "doc-uuid-1",
      organizationId: "org-uuid-1",
      shareId: "share-uuid-1",
      signerName: "John Doe",
      signerEmail: "john@example.com",
      ipAddress: "127.0.0.1",
      consentText: "I agree to be legally bound.",
      timestamp: new Date().toISOString(),
    });

    expect(typeof jobId).toBe("string");
    expect(jobId.length).toBeGreaterThan(0);
  });

  it("successfully enqueues signing reminders and maintenance jobs", async () => {
    const reminderId = await enqueueSigningReminder({
      shareId: "share-uuid-2",
      recipientEmail: "pending@example.com",
      recipientName: "Pending User",
      organizationName: "VorldX",
      docTitle: "Quotation Q-001",
      docNumber: "Q-001",
      shareUrl: "https://example.com/share/pending",
      expiresAtFormatted: "05 Nov 2026",
    });
    expect(reminderId).toBeDefined();

    const maintenanceId = await enqueueMaintenanceJob();
    expect(maintenanceId).toBeDefined();
  });
});

