"use client";

import React from "react";
import Link from "next/link";
import { Save, FileText, Loader2 } from "lucide-react";

interface QuotationActionFooterProps {
  editId: string | null;
  loading: boolean;
  isFinalized: boolean;
  onSave: (isDraft: boolean) => void;
}

export default function QuotationActionFooter({
  editId,
  loading,
  isFinalized,
  onSave,
}: QuotationActionFooterProps) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "12px" }}>
      <Link
        href="/quotations"
        style={{
          padding: "10px 20px",
          borderRadius: "10px",
          border: "1px solid #cbd5e1",
          backgroundColor: "#ffffff",
          color: "#475569",
          fontSize: "13px",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Cancel
      </Link>

      {/* Save as Draft Button */}
      <button
        type="button"
        onClick={() => onSave(true)}
        disabled={loading || isFinalized}
        style={{
          padding: "10px 22px",
          borderRadius: "10px",
          border: "1px solid #cbd5e1",
          backgroundColor: "#ffffff",
          color: "#334155",
          fontSize: "13px",
          fontWeight: 700,
          cursor: loading || isFinalized ? "not-allowed" : "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <FileText style={{ width: "16px", height: "16px", color: "#64748b" }} />
        <span>Save as Draft</span>
      </button>

      {/* Save Quotation Button */}
      <button
        type="button"
        onClick={() => onSave(false)}
        disabled={loading || isFinalized}
        style={{
          padding: "10px 26px",
          borderRadius: "10px",
          border: "none",
          backgroundColor: isFinalized ? "#94a3b8" : "#2563eb",
          color: "#ffffff",
          fontSize: "13px",
          fontWeight: 700,
          cursor: loading || isFinalized ? "not-allowed" : "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          boxShadow: "0 2px 8px rgba(37,99,235,0.25)",
        }}
      >
        {loading ? (
          <>
            <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} />
            <span>Saving...</span>
          </>
        ) : (
          <>
            <Save style={{ width: "16px", height: "16px" }} />
            <span>{editId ? "Update Quotation" : "Save Quotation"}</span>
          </>
        )}
      </button>
    </div>
  );
}

