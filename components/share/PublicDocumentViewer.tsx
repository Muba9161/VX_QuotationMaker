"use client";

import React from "react";
import { CheckCircle, ShieldCheck } from "lucide-react";

export interface PublicDocPayload {
  id: string;
  docNumber: string;
  title: string;
  type: string;
  status: string;
  clientName: string;
  clientCompany?: string | null;
  clientEmail?: string | null;
  clientPhone?: string | null;
  clientAddress?: string | null;
  currencySymbol: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  issueDate: string;
  validTill?: string | null;
  effectiveDate?: string | null;
  expiryDate?: string | null;
  paymentTerms?: string | null;
  notes?: string | null;
  termsAndConditions?: string | null;
  governingLaw?: string | null;
  purpose?: string | null;
  items?: Array<{
    id?: string;
    description: string;
    quantity: number;
    unit: string;
    rate: number;
    taxPercent: number;
    amount: number;
    sortOrder?: number;
  }>;
  clauses?: Array<{
    id?: string;
    title: string;
    content: string;
    sortOrder?: number;
  }>;
  snapshotVersion?: number;
  snapshotHash?: string | null;
}

interface PublicDocumentViewerProps {
  document: PublicDocPayload;
  organization: {
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    primaryColor?: string;
    gstNumber?: string | null;
  };
  signatures?: Array<{
    id: string;
    signerName: string;
    signerEmail: string;
    signerRole: string;
    signatureType: string;
    signatureData: string;
    createdAt: string;
    consentAcceptedAt?: string;
  }>;
}

export default function PublicDocumentViewer({
  document,
  organization,
  signatures = [],
}: PublicDocumentViewerProps) {
  const isQuotation = document.type === "QUOTATION";

  return (
    <div
      style={{
        maxWidth: "920px",
        margin: "24px auto",
        backgroundColor: "#ffffff",
        borderRadius: "14px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 16px rgba(15, 23, 42, 0.06)",
        overflow: "hidden",
      }}
    >
      {/* Top Banner */}
      <div
        style={{
          height: "6px",
          backgroundColor: organization.primaryColor || "#2563eb",
        }}
      />

      <div style={{ padding: "36px 42px" }}>
        {/* Document Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            borderBottom: "1px solid #f1f5f9",
            paddingBottom: "24px",
            marginBottom: "28px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <span
              style={{
                display: "inline-block",
                padding: "3px 10px",
                borderRadius: "6px",
                backgroundColor: "#eff6ff",
                color: "#2563eb",
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              {document.type}
            </span>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              {document.title}
            </h1>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#64748b", marginTop: "4px" }}>
              {document.docNumber}
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
              {organization.name}
            </div>
            {organization.address && (
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px", maxWidth: "220px" }}>
                {organization.address}
              </div>
            )}
            {organization.gstNumber && (
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                GSTIN: {organization.gstNumber}
              </div>
            )}
          </div>
        </div>

        {/* Client & Date Metadata */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
            backgroundColor: "#f8fafc",
            padding: "20px 24px",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            marginBottom: "32px",
          }}
        >
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>
              {isQuotation ? "Billed / Prepared For" : "Party B (Client)"}
            </div>
            <div style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>
              {document.clientName}
            </div>
            {document.clientCompany && (
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#334155", marginTop: "2px" }}>
                {document.clientCompany}
              </div>
            )}
            {document.clientEmail && (
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                {document.clientEmail}
              </div>
            )}
            {document.clientAddress && (
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                {document.clientAddress}
              </div>
            )}
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "12px", color: "#64748b" }}>
              <strong>Issue Date:</strong>{" "}
              {new Date(document.issueDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
            {document.validTill && (
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                <strong>Valid Till:</strong>{" "}
                {new Date(document.validTill).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            )}
            {document.effectiveDate && (
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                <strong>Effective Date:</strong>{" "}
                {new Date(document.effectiveDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            )}
            {document.snapshotVersion && (
              <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "8px" }}>
                Snapshot Version {document.snapshotVersion}
              </div>
            )}
          </div>
        </div>

        {/* Quotation Line Items Table */}
        {isQuotation && document.items && (
          <div style={{ marginBottom: "32px", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ backgroundColor: "#f1f5f9", borderBottom: "2px solid #cbd5e1" }}>
                  <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "#334155" }}>#</th>
                  <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "#334155" }}>Description</th>
                  <th style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "#334155" }}>Qty</th>
                  <th style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "#334155" }}>Unit Rate</th>
                  <th style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "#334155" }}>Tax</th>
                  <th style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "#334155" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {document.items.map((it, idx) => (
                  <tr key={it.id || idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 14px", color: "#64748b" }}>{idx + 1}</td>
                    <td style={{ padding: "12px 14px", fontWeight: 600, color: "#0f172a" }}>{it.description}</td>
                    <td style={{ padding: "12px 14px", textAlign: "right", color: "#334155" }}>
                      {it.quantity} {it.unit}
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "right", color: "#334155" }}>
                      {document.currencySymbol}
                      {Number(it.rate).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "right", color: "#64748b" }}>{it.taxPercent}%</td>
                    <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700, color: "#0f172a" }}>
                      {document.currencySymbol}
                      {Number(it.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals Summary */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
              <div style={{ width: "280px", fontSize: "13px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", color: "#64748b" }}>
                  <span>Subtotal:</span>
                  <span style={{ fontWeight: 600, color: "#0f172a" }}>
                    {document.currencySymbol}
                    {Number(document.subtotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {document.discountAmount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", color: "#16a34a" }}>
                    <span>Discount:</span>
                    <span style={{ fontWeight: 600 }}>
                      -{document.currencySymbol}
                      {Number(document.discountAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", color: "#64748b" }}>
                  <span>GST ({document.taxRate}%):</span>
                  <span style={{ fontWeight: 600, color: "#0f172a" }}>
                    {document.currencySymbol}
                    {Number(document.taxAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    borderTop: "2px solid #0f172a",
                    marginTop: "8px",
                    fontSize: "16px",
                    fontWeight: 800,
                    color: "#0f172a",
                  }}
                >
                  <span>Grand Total:</span>
                  <span style={{ color: "#2563eb" }}>
                    {document.currencySymbol}
                    {Number(document.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MOU Clauses Section */}
        {!isQuotation && document.clauses && (
          <div style={{ marginBottom: "32px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", marginBottom: "16px", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>
              Terms, Articles & Understandings
            </h3>
            {document.purpose && (
              <div style={{ marginBottom: "20px", fontSize: "14px", color: "#334155", lineHeight: 1.6 }}>
                <strong>Purpose & Recitals:</strong> {document.purpose}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {document.clauses.map((clause, idx) => (
                <div key={clause.id || idx} style={{ borderLeft: "3px solid #2563eb", paddingLeft: "16px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
                    {idx + 1}. {clause.title}
                  </div>
                  <div style={{ fontSize: "13.5px", color: "#334155", marginTop: "4px", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                    {clause.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Terms & Notes */}
        {(document.paymentTerms || document.notes || document.termsAndConditions) && (
          <div
            style={{
              borderTop: "1px solid #e2e8f0",
              paddingTop: "24px",
              marginTop: "24px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
              fontSize: "12.5px",
            }}
          >
            {document.paymentTerms && (
              <div>
                <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>Payment Terms</div>
                <div style={{ color: "#64748b", lineHeight: 1.5 }}>{document.paymentTerms}</div>
              </div>
            )}
            {document.termsAndConditions && (
              <div>
                <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>Terms & Conditions</div>
                <div style={{ color: "#64748b", lineHeight: 1.5, whiteSpace: "pre-line" }}>
                  {document.termsAndConditions}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Executed Digital Signatures Certificate Block */}
        {signatures.length > 0 && (
          <div
            style={{
              marginTop: "36px",
              padding: "24px",
              borderRadius: "12px",
              backgroundColor: "#f8fafc",
              border: "1px solid #cbd5e1",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <ShieldCheck style={{ width: "20px", height: "20px", color: "#16a34a" }} />
              <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                Digital Execution & Signature Verification
              </h4>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
              {signatures.map((sig, idx) => (
                <div
                  key={sig.id || idx}
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    padding: "16px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#16a34a", fontSize: "12px", fontWeight: 700 }}>
                    <CheckCircle style={{ width: "14px", height: "14px" }} />
                    <span>Digitally Executed</span>
                  </div>

                  {sig.signatureType === "DRAWN" && sig.signatureData.startsWith("data:image") ? (
                    <img
                      src={sig.signatureData}
                      alt={sig.signerName}
                      style={{ height: "45px", maxWidth: "160px", margin: "12px 0 6px 0", objectFit: "contain" }}
                    />
                  ) : (
                    <div
                      style={{
                        fontFamily: "'Brush Script MT', cursive, serif",
                        fontSize: "22px",
                        color: "#1e3a8a",
                        margin: "12px 0 6px 0",
                        fontStyle: "italic",
                      }}
                    >
                      {sig.signerName}
                    </div>
                  )}

                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                    {sig.signerName}
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>{sig.signerEmail}</div>
                  <div style={{ fontSize: "10.5px", color: "#94a3b8", marginTop: "4px" }}>
                    Signed: {new Date(sig.createdAt).toUTCString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

