"use client";

import React, { useState } from "react";
import { X, Loader2, AlertCircle } from "lucide-react";

export interface ClientData {
  id?: string;
  name: string;
  companyName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  taxId?: string | null;
  website?: string | null;
  notes?: string | null;
  status?: string;
}

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (client: ClientData) => void;
  initialData?: ClientData | null;
}

const emptyFormData: ClientData = {
  name: "",
  companyName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  country: "India",
  postalCode: "",
  taxId: "",
  website: "",
  notes: "",
};

export default function ClientModal({ isOpen, onClose, onSaved, initialData }: ClientModalProps) {
  const [formData, setFormData] = useState<ClientData>(() => initialData ? { ...emptyFormData, ...initialData } : emptyFormData);
  const [prevInitialData, setPrevInitialData] = useState<ClientData | null | undefined>(initialData);

  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData);
    setFormData(initialData ? {
      id: initialData.id,
      name: initialData.name || "",
      companyName: initialData.companyName || "",
      email: initialData.email || "",
      phone: initialData.phone || "",
      address: initialData.address || "",
      city: initialData.city || "",
      state: initialData.state || "",
      country: initialData.country || "India",
      postalCode: initialData.postalCode || "",
      taxId: initialData.taxId || "",
      website: initialData.website || "",
      notes: initialData.notes || "",
    } : emptyFormData);
  }

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("Contact person name is required.");
      return;
    }

    try {
      setLoading(true);
      const isEdit = Boolean(initialData?.id);
      const url = isEdit ? `/api/v1/clients/${initialData!.id}` : "/api/v1/clients";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json?.error?.message || "Failed to save client record.");
        return;
      }

      onSaved(json.data);
      onClose();
    } catch {
      setError("Network error while saving client.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          maxWidth: "680px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "24px 28px",
          boxShadow: "0 20px 45px rgba(0,0,0,0.2)",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "14px", borderBottom: "1px solid #f1f5f9" }}>
          <div>
            <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
              {initialData?.id ? "Edit Client Information" : "Add New Client"}
            </h2>
            <p style={{ fontSize: "12.5px", color: "#64748b", margin: "2px 0 0 0" }}>
              Clients can be associated with Quotations and MOUs across your workspace.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "4px" }}
          >
            <X style={{ width: "18px", height: "18px" }} />
          </button>
        </div>

        {error && (
          <div style={{ margin: "14px 0", padding: "12px 16px", backgroundColor: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca", borderRadius: "10px", fontSize: "13px", display: "flex", alignItems: "center", gap: "10px" }}>
            <AlertCircle style={{ width: "16px", height: "16px", color: "#dc2626", flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                Contact Person Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Rohan Sharma"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                Company / Organization Name
              </label>
              <input
                type="text"
                value={formData.companyName || ""}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="e.g. Tech Solutions Pvt Ltd"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                Email Address
              </label>
              <input
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. rohan@techsol.com"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +91 98765 43210"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
              Address
            </label>
            <input
              type="text"
              value={formData.address || ""}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. Plot 42, Knowledge Park III"
              style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                City
              </label>
              <input
                type="text"
                value={formData.city || ""}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Noida"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                State
              </label>
              <input
                type="text"
                value={formData.state || ""}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="e.g. U.P."
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                Country
              </label>
              <input
                type="text"
                value={formData.country || "India"}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="India"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                Postal Code
              </label>
              <input
                type="text"
                value={formData.postalCode || ""}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                placeholder="201306"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                GST / Tax ID
              </label>
              <input
                type="text"
                value={formData.taxId || ""}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                placeholder="e.g. 09ABCDE1234F1Z5"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                Website URL
              </label>
              <input
                type="text"
                value={formData.website || ""}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="e.g. https://techsol.com"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
              Additional Notes
            </label>
            <textarea
              rows={2}
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Important business requirements, preferred terms, or contact history..."
              style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{ padding: "9px 18px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#ffffff", fontSize: "13px", fontWeight: 600, color: "#475569", cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ padding: "9px 22px", borderRadius: "8px", border: "none", backgroundColor: "#2563eb", color: "#ffffff", fontSize: "13px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              {loading && <Loader2 style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} />}
              <span>{initialData?.id ? "Save Changes" : "Create Client"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
