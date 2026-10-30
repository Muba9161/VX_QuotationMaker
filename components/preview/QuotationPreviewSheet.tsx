"use client";

import React from "react";

export interface QuotationData {
  id: string;
  docNumber: string;
  title: string;
  issueDate: string;
  validTill?: string | null;
  currencySymbol?: string;
  subtotal: number;
  discountAmount?: number;
  taxRate?: number;
  taxAmount?: number;
  total: number;
  clientName: string;
  clientCompany?: string | null;
  clientEmail?: string | null;
  clientAddress?: string | null;
  paymentTerms?: string | null;
  notes?: string | null;
  termsAndConditions?: string | null;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unit?: string | null;
    unitPrice?: number;
    rate?: number;
    amount: number;
  }>;
}

interface QuotationPreviewSheetProps {
  data: QuotationData;
  orgName?: string;
}

export default function QuotationPreviewSheet({
  data,
  orgName = "Acme Technologies Pvt Ltd",
}: QuotationPreviewSheetProps) {
  const sym = data.currencySymbol || "₹";

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
      id="printable-quotation-sheet"
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
      {/* Header: Company Info & Quotation Title */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: "24px",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              letterSpacing: "0.5px",
            }}
          >
            VX
          </div>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              {orgName}
            </h2>
            <p style={{ fontSize: "11px", color: "#64748b", margin: "2px 0 0 0" }}>
              Official Commercial Quotation
            </p>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <span
            style={{
              display: "inline-block",
              padding: "4px 12px",
              borderRadius: "9999px",
              fontSize: "11px",
              fontWeight: 700,
              backgroundColor: "#eff6ff",
              color: "#2563eb",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Quotation
          </span>
          <div style={{ marginTop: "6px", fontSize: "12px", color: "#475569" }}>
            <strong style={{ color: "#0f172a" }}>Ref: </strong>
            {data.docNumber}
          </div>
          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
            Date: {formatDate(data.issueDate)}
          </div>
          {data.validTill && (
            <div style={{ fontSize: "11px", color: "#64748b" }}>
              Valid Till: {formatDate(data.validTill)}
            </div>
          )}
        </div>
      </div>

      {/* Bill To & Subject */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
          padding: "24px 0",
          borderBottom: "1px solid #f1f5f9",
          fontSize: "12px",
        }}
      >
        <div>
          <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "#94a3b8", marginBottom: "4px" }}>
            Billed To
          </div>
          <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "14px" }}>{data.clientName}</div>
          {data.clientCompany && (
            <div style={{ fontWeight: 600, color: "#334155", marginTop: "2px" }}>{data.clientCompany}</div>
          )}
          {data.clientEmail && (
            <div style={{ color: "#64748b", marginTop: "2px" }}>{data.clientEmail}</div>
          )}
          {data.clientAddress && (
            <div style={{ color: "#64748b", marginTop: "4px", whiteSpace: "pre-line" }}>
              {data.clientAddress}
            </div>
          )}
        </div>

        <div>
          <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "#94a3b8", marginBottom: "4px" }}>
            Proposal / Subject
          </div>
          <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "14px" }}>{data.title}</div>
          {data.paymentTerms && (
            <div style={{ color: "#475569", marginTop: "8px" }}>
              <span style={{ fontWeight: 600, color: "#334155" }}>Payment Terms: </span>
              {data.paymentTerms}
            </div>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div style={{ padding: "24px 0", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
              <th style={{ padding: "10px 12px", width: "40px", textAlign: "center", fontWeight: 700, color: "#475569", fontSize: "11px", textTransform: "uppercase" }}>#</th>
              <th style={{ padding: "10px 12px", fontWeight: 700, color: "#475569", fontSize: "11px", textTransform: "uppercase" }}>Item & Description</th>
              <th style={{ padding: "10px 12px", textAlign: "right", width: "60px", fontWeight: 700, color: "#475569", fontSize: "11px", textTransform: "uppercase" }}>Qty</th>
              <th style={{ padding: "10px 12px", textAlign: "center", width: "60px", fontWeight: 700, color: "#475569", fontSize: "11px", textTransform: "uppercase" }}>Unit</th>
              <th style={{ padding: "10px 12px", textAlign: "right", width: "100px", fontWeight: 700, color: "#475569", fontSize: "11px", textTransform: "uppercase" }}>Rate</th>
              <th style={{ padding: "10px 12px", textAlign: "right", width: "110px", fontWeight: 700, color: "#475569", fontSize: "11px", textTransform: "uppercase" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, idx) => {
              const rate = Number(item.unitPrice ?? item.rate ?? 0);
              const amount = Number(item.amount ?? 0);
              return (
                <tr key={item.id || idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px", textAlign: "center", color: "#94a3b8" }}>{idx + 1}</td>
                  <td style={{ padding: "12px", fontWeight: 600, color: "#1e293b" }}>{item.description}</td>
                  <td style={{ padding: "12px", textAlign: "right", color: "#475569" }}>{item.quantity}</td>
                  <td style={{ padding: "12px", textAlign: "center", color: "#64748b" }}>{item.unit || "Nos"}</td>
                  <td style={{ padding: "12px", textAlign: "right", color: "#475569" }}>
                    {sym}{rate.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: "12px", textAlign: "right", fontWeight: 700, color: "#0f172a" }}>
                    {sym}{amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Totals */}
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "16px 0", borderTop: "1px solid #e2e8f0" }}>
        <div style={{ width: "260px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#475569" }}>
            <span>Subtotal:</span>
            <span style={{ fontWeight: 600, color: "#0f172a" }}>
              {sym}{Number(data.subtotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>

          {Number(data.discountAmount) > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", color: "#059669" }}>
              <span>Discount:</span>
              <span style={{ fontWeight: 600 }}>
                -{sym}{Number(data.discountAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          {Number(data.taxAmount) > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", color: "#475569" }}>
              <span>GST ({data.taxRate || 18}%):</span>
              <span style={{ fontWeight: 600, color: "#0f172a" }}>
                {sym}{Number(data.taxAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingTop: "8px",
              borderTop: "2px solid #0f172a",
              fontSize: "14px",
              fontWeight: 800,
              color: "#0f172a",
            }}
          >
            <span>Grand Total:</span>
            <span>
              {sym}{Number(data.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Terms & Notes */}
      {(data.termsAndConditions || data.notes) && (
        <div style={{ paddingTop: "24px", borderTop: "1px solid #e2e8f0", fontSize: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {data.termsAndConditions && (
            <div>
              <div style={{ fontWeight: 700, color: "#334155", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
                Terms & Conditions
              </div>
              <p style={{ color: "#475569", lineHeight: 1.5, margin: 0, whiteSpace: "pre-line" }}>
                {data.termsAndConditions}
              </p>
            </div>
          )}
          {data.notes && (
            <div>
              <div style={{ fontWeight: 700, color: "#334155", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
                Notes
              </div>
              <p style={{ color: "#475569", lineHeight: 1.5, margin: 0, whiteSpace: "pre-line" }}>
                {data.notes}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Signatory Block */}
      <div style={{ paddingTop: "40px", display: "flex", justifyContent: "flex-end" }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ borderBottom: "1px solid #94a3b8", width: "180px", paddingBottom: "32px", marginBottom: "8px" }}></div>
          <div style={{ fontSize: "12px", fontWeight: 800, color: "#0f172a" }}>Authorized Signatory</div>
          <div style={{ fontSize: "11px", color: "#64748b" }}>{orgName}</div>
        </div>
      </div>
    </div>
  );
}
