"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import OrgLayout from "@/components/OrgLayout";
import ConfirmModal from "@/components/ConfirmModal";
import {
  LayoutGrid,
  FileCheck2,
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
  X,
} from "lucide-react";

interface TemplateRecord {
  id: string;
  title: string;
  type: "QUOTATION" | "MOU";
  description?: string | null;
  isDefault: boolean;
  version: number;
  items?: Array<{ id: string; description: string; defaultQuantity: number; unit: string; defaultRate: number }>;
  clauses?: Array<{ id: string; title: string; content: string }>;
  createdAt: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "QUOTATION" | "MOU">("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<"QUOTATION" | "MOU">("QUOTATION");
  const [newDescription, setNewDescription] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const refreshTemplates = async () => {
    try {
      const url = activeTab === "ALL" ? "/api/v1/templates" : `/api/v1/templates?type=${activeTab}`;
      const res = await fetch(url, { credentials: "include" });
      if (res.ok) {
        const json = await res.json();
        setTemplates(json.data || []);
      }
    } catch {
      showToast("Failed to refresh templates.");
    }
  };

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const url = activeTab === "ALL" ? "/api/v1/templates" : `/api/v1/templates?type=${activeTab}`;
        const res = await fetch(url, { credentials: "include" });
        if (res.ok && !ignore) {
          const json = await res.json();
          setTemplates(json.data || []);
        }
      } catch {
        if (!ignore) showToast("Failed to load templates.");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [activeTab]);

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/v1/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: newTitle.trim(),
          type: newType,
          description: newDescription.trim() || undefined,
          isDefault,
        }),
      });

      if (!res.ok) {
        showToast("Failed to create template.");
        return;
      }

      showToast("Template created successfully!");
      setIsModalOpen(false);
      setNewTitle("");
      setNewDescription("");
      setIsDefault(false);
      refreshTemplates();
    } catch {
      showToast("Network error creating template.");
    } finally {
      setSubmitting(false);
    }
  };

  const triggerDeleteConfirm = (id: string, title: string) => {
    setDeleteTarget({ id, title });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/v1/templates/${deleteTarget.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        showToast(json?.error?.message || "Failed to delete template.");
        setIsDeleting(false);
        return;
      }

      // Optimistically remove from visible list immediately
      setTemplates((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      showToast(`Template "${deleteTarget.title}" deleted successfully.`);
      setDeleteTarget(null);
      setIsDeleting(false);
      refreshTemplates();
    } catch {
      showToast("Error deleting template.");
      setIsDeleting(false);
    }
  };

  return (
    <OrgLayout activePath="/templates">
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
              Document Templates
            </h1>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "3px 0 0 0" }}>
              Standardize commercial proposals and agreements with reusable organizational templates.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px", backgroundColor: "#2563eb", color: "#ffffff", borderRadius: "10px", border: "none", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 6px rgba(37,99,235,0.2)" }}
          >
            <Plus style={{ width: "16px", height: "16px" }} />
            <span>Create Template</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>
          {(["ALL", "QUOTATION", "MOU"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "8px 18px",
                borderRadius: "8px",
                border: activeTab === tab ? "1px solid #2563eb" : "1px solid #e2e8f0",
                backgroundColor: activeTab === tab ? "#eff6ff" : "#ffffff",
                color: activeTab === tab ? "#2563eb" : "#64748b",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {tab === "ALL" ? "All Templates" : tab === "QUOTATION" ? "Quotation Templates" : "MOU Templates"}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#64748b" }}>
            <Loader2 style={{ width: "24px", height: "24px", animation: "spin 1s linear infinite", color: "#2563eb", margin: "0 auto 10px" }} />
            <span>Loading templates...</span>
          </div>
        ) : templates.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center", backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
            <LayoutGrid style={{ width: "40px", height: "40px", color: "#cbd5e1", margin: "0 auto 12px" }} />
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>No templates found</h3>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>Create standard templates to streamline your document workflow.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "18px" }}>
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                style={{ backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "20px 22px", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {tpl.type === "QUOTATION" ? (
                        <FileCheck2 style={{ width: "16px", height: "16px", color: "#2563eb" }} />
                      ) : (
                        <FileText style={{ width: "16px", height: "16px", color: "#1e3a8a" }} />
                      )}
                      <span style={{ fontSize: "11px", fontWeight: 700, color: tpl.type === "QUOTATION" ? "#2563eb" : "#1e3a8a", textTransform: "uppercase" }}>
                        {tpl.type}
                      </span>
                    </div>
                    {tpl.isDefault && (
                      <span style={{ padding: "2px 6px", borderRadius: "4px", backgroundColor: "#f0fdf4", color: "#166534", fontSize: "10.5px", fontWeight: 700 }}>
                        Default
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: "0 0 6px 0" }}>{tpl.title}</h3>
                  <p style={{ fontSize: "12.5px", color: "#64748b", margin: 0, lineHeight: 1.4 }}>
                    {tpl.description || "No description provided."}
                  </p>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
                  <Link
                    href={tpl.type === "QUOTATION" ? `/quotations/new?templateId=${tpl.id}` : `/mou/new?templateId=${tpl.id}`}
                    style={{ fontSize: "12.5px", fontWeight: 600, color: "#2563eb", textDecoration: "none" }}
                  >
                    Use Template &rarr;
                  </Link>

                  <button
                    type="button"
                    onClick={() => triggerDeleteConfirm(tpl.id, tpl.title)}
                    style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "4px" }}
                    title="Delete Template"
                  >
                    <Trash2 style={{ width: "14px", height: "14px" }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, backgroundColor: "rgba(15, 23, 42, 0.65)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", maxWidth: "480px", width: "100%", padding: "24px", boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Create Document Template</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}>
                <X style={{ width: "18px", height: "18px" }} />
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>Template Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Standard Web Development Proposal"
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>Document Type *</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as "QUOTATION" | "MOU")}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                >
                  <option value="QUOTATION">Quotation Template</option>
                  <option value="MOU">MOU Template</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>Description</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Brief description of this template's use case..."
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  style={{ width: "16px", height: "16px", accentColor: "#2563eb" }}
                />
                <label htmlFor="isDefault" style={{ fontSize: "12.5px", color: "#334155", cursor: "pointer" }}>
                  Set as default template for this document type
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: "8px 16px", border: "1px solid #cbd5e1", background: "#ffffff", borderRadius: "8px", fontSize: "12.5px", cursor: "pointer" }}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: "8px 20px", border: "none", backgroundColor: "#2563eb", color: "#ffffff", borderRadius: "8px", fontSize: "12.5px", fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer" }}
                >
                  {submitting ? "Saving..." : "Create Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Template"
        description={`Are you sure you want to permanently delete template "${deleteTarget?.title}"? Any future documents will need to be created from scratch or another template.`}
        confirmLabel="Delete Template"
        variant="danger"
        isConfirming={isDeleting}
      />
    </OrgLayout>
  );
}
