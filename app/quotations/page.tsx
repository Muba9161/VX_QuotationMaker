"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import OrgLayout from "@/components/OrgLayout";
import ConfirmModal from "@/components/ConfirmModal";
import {
  FileCheck2,
  Plus,
  Search,
  Download,
  Trash2,
  CheckCircle2,
  Loader2,
  Send,
  History,
  ShieldCheck,
} from "lucide-react";
import ShareModal from "@/components/sharing/ShareModal";
import ShareHistoryModal from "@/components/sharing/ShareHistoryModal";
import SignatureAuditModal from "@/components/sharing/SignatureAuditModal";

interface QuotationItem {
  id: string;
  docNumber: string;
  title: string;
  clientName: string;
  clientCompany?: string | null;
  total: number;
  issueDate: string;
  validTill?: string | null;
  status: string;
}

export default function QuotationsListPage() {
  const [quotations, setQuotations] = useState<QuotationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; docNumber: string; isDraft: boolean } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [shareTarget, setShareTarget] = useState<QuotationItem | null>(null);
  const [historyTarget, setHistoryTarget] = useState<QuotationItem | null>(null);
  const [auditTarget, setAuditTarget] = useState<QuotationItem | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshQuotations = async () => {
    try {
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
      });
      if (activeTab !== "ALL") {
        params.set("status", activeTab);
      }
      if (search.trim()) {
        params.set("search", search.trim());
      }
      const res = await fetch(`/api/v1/quotations?${params.toString()}`, { credentials: "include" });
      if (res.ok) {
        const json = await res.json();
        setQuotations(json.data || []);
        if (json.meta?.pagination) {
          setPagination((prev) => ({ ...prev, ...json.meta.pagination }));
        }
      }
    } catch {
      showToast("Failed to refresh quotations.");
    }
  };

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const params = new URLSearchParams({
          page: String(pagination.page),
          limit: String(pagination.limit),
        });
        if (activeTab !== "ALL") {
          params.set("status", activeTab);
        }
        if (search.trim()) {
          params.set("search", search.trim());
        }

        const res = await fetch(`/api/v1/quotations?${params.toString()}`, {
          credentials: "include",
        });

        if (res.ok && !ignore) {
          const json = await res.json();
          setQuotations(json.data || []);
          if (json.meta?.pagination) {
            setPagination((prev) => ({ ...prev, ...json.meta.pagination }));
          }
        }
      } catch {
        if (!ignore) showToast("Failed to load quotations from server.");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [pagination.page, pagination.limit, activeTab, search]);

  const handleDownloadPdf = (id: string, docNumber: string) => {
    showToast(`Downloading PDF for ${docNumber}...`);
    window.open(`/api/v1/quotations/${id}/pdf`, "_blank");
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/v1/quotations/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      const json = await res.json();
      if (!res.ok) {
        showToast(json?.error?.message || "Failed to update quotation status.");
        return;
      }

      showToast(`Status updated to ${newStatus}.`);
      refreshQuotations();
    } catch {
      showToast("Error updating status.");
    }
  };

  const triggerDeleteConfirm = (q: QuotationItem) => {
    setDeleteTarget({
      id: q.id,
      docNumber: q.docNumber,
      isDraft: q.status === "DRAFT",
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/v1/quotations/${deleteTarget.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        showToast(json?.error?.message || "Failed to remove quotation.");
        setIsDeleting(false);
        return;
      }

      // Immediately synchronize local UI state
      setQuotations((prev) =>
        deleteTarget.isDraft
          ? prev.filter((q) => q.id !== deleteTarget.id)
          : prev.map((q) => (q.id === deleteTarget.id ? { ...q, status: "REVOKED" } : q))
      );

      const msg = json?.data?.message || `Quotation ${deleteTarget.docNumber} has been ${deleteTarget.isDraft ? "deleted" : "cancelled"}.`;
      showToast(msg);
      setDeleteTarget(null);
      setIsDeleting(false);
      refreshQuotations();
    } catch {
      showToast("Error removing quotation.");
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
      case "ACCEPTED":
        return { bg: "#f0fdf4", text: "#166534", label: "Accepted" };
      case "SENT":
        return { bg: "#eff6ff", text: "#1e40af", label: "Sent" };
      case "VIEWED":
        return { bg: "#f0fdfa", text: "#0f766e", label: "Viewed" };
      case "DECLINED":
      case "REJECTED":
        return { bg: "#fef2f2", text: "#991b1b", label: "Declined" };
      case "EXPIRED":
        return { bg: "#fefce8", text: "#854d0e", label: "Expired" };
      case "REVOKED":
        return { bg: "#f1f5f9", text: "#475569", label: "Cancelled" };
      default:
        return { bg: "#f8fafc", text: "#475569", label: "Draft" };
    }
  };

  return (
    <OrgLayout activePath="/quotations">
      {/* Toast */}
      {toastMessage && (
        <div style={{ position: "fixed", bottom: "28px", right: "28px", zIndex: 9999, display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#0f172a", color: "#ffffff", padding: "12px 20px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
          <CheckCircle2 style={{ width: "16px", height: "16px", color: "#34d399" }} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.4px" }}>
              Quotations
            </h1>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "3px 0 0 0" }}>
              Create, track, and manage commercial proposals and client quotations.
            </p>
          </div>

          <Link
            href="/quotations/new"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px", backgroundColor: "#2563eb", color: "#ffffff", borderRadius: "10px", textDecoration: "none", fontSize: "13px", fontWeight: 700, boxShadow: "0 2px 6px rgba(37,99,235,0.2)" }}
          >
            <Plus style={{ width: "16px", height: "16px" }} />
            <span>New Quotation</span>
          </Link>
        </div>

        {/* Search & Status Filters */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", backgroundColor: "#ffffff", padding: "14px 18px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, maxWidth: "380px", position: "relative" }}>
            <Search style={{ width: "16px", height: "16px", color: "#94a3b8", position: "absolute", left: "12px" }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by quote #, client, title..."
              style={{ width: "100%", padding: "8px 12px 8px 36px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", outline: "none" }}
            />
          </div>

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {[
              { key: "ALL", label: "All" },
              { key: "DRAFT", label: "Drafts" },
              { key: "SENT", label: "Sent" },
              { key: "APPROVED", label: "Accepted" },
              { key: "DECLINED", label: "Declined" },
              { key: "EXPIRED", label: "Expired" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  border: activeTab === tab.key ? "1px solid #2563eb" : "1px solid #e2e8f0",
                  backgroundColor: activeTab === tab.key ? "#eff6ff" : "#ffffff",
                  color: activeTab === tab.key ? "#2563eb" : "#64748b",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quotations Table */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: "60px", textAlign: "center", color: "#64748b", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
              <Loader2 style={{ width: "24px", height: "24px", animation: "spin 1s linear infinite", color: "#2563eb" }} />
              <span style={{ fontSize: "13.5px" }}>Loading quotations...</span>
            </div>
          ) : quotations.length === 0 ? (
            <div style={{ padding: "60px 20px", textAlign: "center" }}>
              <FileCheck2 style={{ width: "40px", height: "40px", color: "#cbd5e1", margin: "0 auto 12px" }} />
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>No quotations found</h3>
              <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                {search ? "No quotations match your search criteria." : "Create your first professional quotation."}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b", fontWeight: 600, fontSize: "12px" }}>
                    <th style={{ padding: "12px 18px" }}>Quote #</th>
                    <th style={{ padding: "12px 18px" }}>Client</th>
                    <th style={{ padding: "12px 18px" }}>Subject</th>
                    <th style={{ padding: "12px 18px" }}>Amount</th>
                    <th style={{ padding: "12px 18px" }}>Issue Date</th>
                    <th style={{ padding: "12px 18px" }}>Status</th>
                    <th style={{ padding: "12px 18px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quotations.map((q) => {
                    const badge = getStatusBadge(q.status);
                    return (
                      <tr key={q.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "14px 18px", fontWeight: 700, color: "#0f172a" }}>
                          {q.docNumber}
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <div style={{ fontWeight: 600, color: "#1e293b" }}>{q.clientName}</div>
                          {q.clientCompany && <div style={{ fontSize: "11.5px", color: "#64748b" }}>{q.clientCompany}</div>}
                        </td>
                        <td style={{ padding: "14px 18px", color: "#475569", maxWidth: "240px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {q.title}
                        </td>
                        <td style={{ padding: "14px 18px", fontWeight: 700, color: "#0f172a" }}>
                          ₹{Number(q.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: "14px 18px", color: "#64748b" }}>
                          {new Date(q.issueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <span style={{ padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, backgroundColor: badge.bg, color: badge.text }}>
                            {badge.label}
                          </span>
                        </td>
                        <td style={{ padding: "14px 18px", textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "6px" }}>
                            <button
                              type="button"
                              onClick={() => setShareTarget(q)}
                              title="Share with Client"
                              style={{ padding: "6px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "6px", color: "#2563eb", cursor: "pointer" }}
                            >
                              <Send style={{ width: "14px", height: "14px" }} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setHistoryTarget(q)}
                              title="Share History"
                              style={{ padding: "6px", background: "none", border: "1px solid #e2e8f0", borderRadius: "6px", color: "#64748b", cursor: "pointer" }}
                            >
                              <History style={{ width: "14px", height: "14px" }} />
                            </button>
                            {(q.status === "SIGNED" || q.status === "APPROVED") && (
                              <button
                                type="button"
                                onClick={() => setAuditTarget(q)}
                                title="Digital Signature Certificate"
                                style={{ padding: "6px", background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "6px", color: "#16a34a", cursor: "pointer" }}
                              >
                                <ShieldCheck style={{ width: "14px", height: "14px" }} />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDownloadPdf(q.id, q.docNumber)}
                              title="Download PDF"
                              style={{ padding: "6px", background: "none", border: "1px solid #e2e8f0", borderRadius: "6px", color: "#2563eb", cursor: "pointer" }}
                            >
                              <Download style={{ width: "14px", height: "14px" }} />
                            </button>
                            {q.status === "DRAFT" && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(q.id, "SENT")}
                                title="Mark as Sent"
                                style={{ padding: "4px 8px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "6px", color: "#1e40af", fontSize: "11.5px", fontWeight: 600, cursor: "pointer" }}
                              >
                                Send
                              </button>
                            )}
                            {q.status === "SENT" && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(q.id, "APPROVED")}
                                title="Mark as Accepted"
                                style={{ padding: "4px 8px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "6px", color: "#166534", fontSize: "11.5px", fontWeight: 600, cursor: "pointer" }}
                              >
                                Accept
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => triggerDeleteConfirm(q)}
                              title="Delete / Cancel"
                              style={{ padding: "6px", background: "none", border: "1px solid #e2e8f0", borderRadius: "6px", color: "#ef4444", cursor: "pointer" }}
                            >
                              <Trash2 style={{ width: "14px", height: "14px" }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
        title={deleteTarget?.isDraft ? "Delete Quotation" : "Cancel Quotation"}
        description={
          deleteTarget?.isDraft
            ? `Are you sure you want to permanently delete draft quotation "${deleteTarget.docNumber}"? This action cannot be undone.`
            : `Are you sure you want to cancel quotation "${deleteTarget?.docNumber}"? Its status will be updated to Revoked/Cancelled.`
        }
        confirmLabel={deleteTarget?.isDraft ? "Delete Quotation" : "Cancel Quotation"}
        variant="danger"
        isConfirming={isDeleting}
      />

      {/* Share Document Modal */}
      {shareTarget && (
        <ShareModal
          isOpen={Boolean(shareTarget)}
          onClose={() => setShareTarget(null)}
          documentId={shareTarget.id}
          docNumber={shareTarget.docNumber}
          docTitle={shareTarget.title}
          docType="QUOTATION"
          defaultRecipientName={shareTarget.clientName}
          onShareCreated={refreshQuotations}
        />
      )}

      {/* Share History Modal */}
      {historyTarget && (
        <ShareHistoryModal
          isOpen={Boolean(historyTarget)}
          onClose={() => setHistoryTarget(null)}
          documentId={historyTarget.id}
          docNumber={historyTarget.docNumber}
        />
      )}

      {/* Digital Signature Audit Modal */}
      {auditTarget && (
        <SignatureAuditModal
          isOpen={Boolean(auditTarget)}
          onClose={() => setAuditTarget(null)}
          documentId={auditTarget.id}
          docNumber={auditTarget.docNumber}
          docTitle={auditTarget.title}
        />
      )}
    </OrgLayout>
  );
}
