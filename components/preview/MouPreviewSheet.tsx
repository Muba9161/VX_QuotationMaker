"use client";

import React from "react";

export interface MouData {
  id: string;
  docNumber: string;
  title: string;
  issueDate: string;
  validTill?: string | null;
  clientName: string;
  clientCompany?: string | null;
  clientEmail?: string | null;
  clientAddress?: string | null;
  notes?: string | null;
  termsAndConditions?: string | null;
  clauses?: Array<{
    id: string;
    title: string;
    content: string;
    sortOrder: number;
  }>;
}

interface MouPreviewSheetProps {
  data: MouData;
  orgName?: string;
}

export default function MouPreviewSheet({
  data,
  orgName = "Organization",
}: MouPreviewSheetProps) {
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      id="printable-mou-sheet"
      style={{
        width: "100%",
        maxWidth: "800px",
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
        border: "1px solid #e2e8f0",
        padding: "48px",
        color: "#0f172a",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      {/* Header: MOU Title & Reference */}
      <div style={{ textAlign: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "24px" }}>
        <span
          style={{
            display: "inline-block",
            padding: "4px 12px",
            borderRadius: "9999px",
            fontSize: "11px",
            fontWeight: 700,
            backgroundColor: "#f5f3ff",
            color: "#7c3aed",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: "8px",
          }}
        >
          Memorandum of Understanding
        </span>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: "4px 0" }}>
          {data.title}
        </h1>
        <div style={{ marginTop: "8px", fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", gap: "16px" }}>
          <span>
            <strong style={{ color: "#334155" }}>MOU Ref:</strong> {data.docNumber}
          </span>
          <span>•</span>
          <span>
            <strong style={{ color: "#334155" }}>Effective Date:</strong> {formatDate(data.issueDate)}
          </span>
          {data.validTill && (
            <>
              <span>•</span>
              <span>
                <strong style={{ color: "#334155" }}>Valid Till:</strong> {formatDate(data.validTill)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Symmetrical Dual Party Cards */}
      <div style={{ padding: "24px 0", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ textAlign: "center", fontSize: "12px", color: "#64748b", fontWeight: 500, marginBottom: "16px" }}>
          This Memorandum of Understanding is entered into by and between:
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontSize: "12px" }}>
          {/* Party A: Organization */}
          <div style={{ padding: "16px", borderRadius: "12px", border: "1px solid #dbeafe", backgroundColor: "#f8fafc" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "#2563eb", marginBottom: "4px" }}>
              First Party (Host Organization)
            </div>
            <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "14px" }}>{orgName}</div>
            <div style={{ color: "#475569", marginTop: "4px" }}>Authorized Representative</div>
            <div style={{ color: "#64748b", marginTop: "2px" }}>Primary Execution Lead</div>
          </div>

          {/* Party B: Client/Partner */}
          <div style={{ padding: "16px", borderRadius: "12px", border: "1px solid #ede9fe", backgroundColor: "#f8fafc" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "#7c3aed", marginBottom: "4px" }}>
              Second Party (Partner / Recipient)
            </div>
            <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "14px" }}>
              {data.clientCompany || data.clientName}
            </div>
            <div style={{ color: "#475569", marginTop: "4px" }}>
              Representative: {data.clientName}
            </div>
            {data.clientEmail && (
              <div style={{ color: "#64748b", marginTop: "2px" }}>{data.clientEmail}</div>
            )}
            {data.clientAddress && (
              <div style={{ color: "#64748b", marginTop: "4px", whiteSpace: "pre-line" }}>
                {data.clientAddress}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recitals / Preamble */}
      {data.notes && (
        <div style={{ padding: "20px 0", borderBottom: "1px solid #f1f5f9", fontSize: "12px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "#94a3b8", marginBottom: "8px" }}>
            Preamble & Background
          </div>
          <p style={{ color: "#334155", lineHeight: 1.6, margin: 0, whiteSpace: "pre-line" }}>
            {data.notes}
          </p>
        </div>
      )}

      {/* Numbered Articles / Clauses */}
      <div style={{ padding: "24px 0", display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "#94a3b8" }}>
          Articles of Collaboration
        </div>

        {data.clauses && data.clauses.length > 0 ? (
          data.clauses.map((clause, idx) => (
            <div key={clause.id || idx} style={{ fontSize: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <h3 style={{ fontWeight: 800, color: "#0f172a", fontSize: "13px", margin: 0 }}>
                Article {idx + 1}. {clause.title}
              </h3>
              <p style={{ color: "#475569", lineHeight: 1.6, margin: 0, paddingLeft: "12px", borderLeft: "2px solid #e2e8f0", whiteSpace: "pre-line" }}>
                {clause.content}
              </p>
            </div>
          ))
        ) : (
          <div style={{ fontSize: "12px", color: "#94a3b8", fontStyle: "italic" }}>
            General collaborative terms and mutual covenants apply as outlined in the proposal agreement.
          </div>
        )}

        {data.termsAndConditions && (
          <div style={{ fontSize: "12px", display: "flex", flexDirection: "column", gap: "6px", paddingTop: "12px" }}>
            <h3 style={{ fontWeight: 800, color: "#0f172a", fontSize: "13px", margin: 0 }}>
              General Terms & Governing Law
            </h3>
            <p style={{ color: "#475569", lineHeight: 1.6, margin: 0, paddingLeft: "12px", borderLeft: "2px solid #e2e8f0", whiteSpace: "pre-line" }}>
              {data.termsAndConditions}
            </p>
          </div>
        )}
      </div>

      {/* Dual Signature Execution Block */}
      <div style={{ paddingTop: "40px", borderTop: "1px solid #e2e8f0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", fontSize: "12px" }}>
        <div>
          <div style={{ borderBottom: "1px solid #94a3b8", paddingBottom: "40px", marginBottom: "8px" }}></div>
          <div style={{ fontWeight: 800, color: "#0f172a" }}>For {orgName}</div>
          <div style={{ fontSize: "11px", color: "#64748b" }}>Authorized Signatory</div>
        </div>

        <div>
          <div style={{ borderBottom: "1px solid #94a3b8", paddingBottom: "40px", marginBottom: "8px" }}></div>
          <div style={{ fontWeight: 800, color: "#0f172a" }}>
            For {data.clientCompany || data.clientName}
          </div>
          <div style={{ fontSize: "11px", color: "#64748b" }}>
            Authorized Signatory / Partner
          </div>
        </div>
      </div>
    </div>
  );
}
