"use client";

import React from "react";
import Link from "next/link";
import { X, Copy, ExternalLink, AlertCircle, FileText, Share2, CheckCircle2 } from "lucide-react";
import { TemplateDisplayItem } from "./TemplateCard";

interface TemplatePreviewModalProps {
  template: TemplateDisplayItem | null;
  onClose: () => void;
  onDuplicate: (template: TemplateDisplayItem) => void;
  onShare?: (template: TemplateDisplayItem) => void;
}

export default function TemplatePreviewModal({
  template,
  onClose,
  onDuplicate,
  onShare,
}: TemplatePreviewModalProps) {
  if (!template) return null;

  const category = (template.category || template.type || "QUOTATION").toUpperCase();
  const accent = template.accentColor || "#2563EB";

  const getActionUrl = () => {
    if (category === "MOU") {
      return `/mou/new?templateId=${encodeURIComponent(template.id)}`;
    }
    if (category === "LETTERHEAD") {
      return `/branding?letterheadId=${encodeURIComponent(template.id)}`;
    }
    return `/quotations/new?templateId=${encodeURIComponent(template.id)}`;
  };

  const quoteItems =
    template.lineItems && template.lineItems.length > 0
      ? template.lineItems
      : (template.items || []) as Array<{ description: string; unit?: string; defaultQuantity: number; defaultRate: number }>;

  const quoteTotal = quoteItems.reduce(
    (acc, it) => acc + (Number(it.defaultRate) || 0) * (Number(it.defaultQuantity) || 1),
    0
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        padding: "16px",
        backdropFilter: "blur(4px)",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
          width: "100%",
          maxWidth: "820px",
          borderRadius: "16px",
          backgroundColor: "#ffffff",
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
          border: "1px solid #cbd5e1",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        {/* Top Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 22px",
            borderBottom: "1px solid #e2e8f0",
            backgroundColor: "#f8fafc",
            boxSizing: "border-box",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                backgroundColor: accent,
                flexShrink: 0,
              }}
            />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                  {template.title}
                </h2>
                {template.isSample && (
                  <span
                    style={{
                      borderRadius: "9999px",
                      backgroundColor: "#eff6ff",
                      border: "1px solid #bfdbfe",
                      padding: "2px 8px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#1d4ed8",
                    }}
                  >
                    Platform Sample
                  </span>
                )}
              </div>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
                {template.styleTag || category} • Ready to customize and export
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "6px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "transparent",
              color: "#94a3b8",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background-color 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#e2e8f0";
              e.currentTarget.style.color = "#0f172a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#94a3b8";
            }}
            title="Close Preview"
          >
            <X style={{ width: "20px", height: "20px" }} />
          </button>
        </div>

        {/* Modal Body - Scrollable A4 Preview Simulation */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            backgroundColor: "#f1f5f9",
            padding: "24px",
            display: "flex",
            justifyContent: "center",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "680px",
              borderRadius: "12px",
              backgroundColor: "#ffffff",
              padding: "32px",
              boxShadow: "0 4px 14px rgba(15, 23, 42, 0.06)",
              border: "1px solid #e2e8f0",
              color: "#1e293b",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxSizing: "border-box",
              minHeight: "500px",
            }}
          >
            <div>
              {/* Document Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  borderBottom: "2px solid #f1f5f9",
                  paddingBottom: "18px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "10px",
                      backgroundColor: accent,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff",
                      fontWeight: 800,
                      fontSize: "16px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    }}
                  >
                    {template.title.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                      Your Company Name
                    </h3>
                    <p style={{ fontSize: "11.5px", color: "#64748b", margin: "2px 0 0 0" }}>
                      Official Corporate Document
                    </p>
                  </div>
                </div>

                <div style={{ textAlign: "right", fontSize: "12px", color: "#64748b" }}>
                  <div style={{ fontWeight: 800, fontSize: "13px", color: accent, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                    {category}
                  </div>
                  <p style={{ margin: "2px 0 0 0", fontFamily: "monospace", fontSize: "11px" }}>
                    Ref: DOC-{new Date().getFullYear()}-001
                  </p>
                  <p style={{ margin: "2px 0 0 0", fontSize: "11px" }}>
                    Date: {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Description & Overview */}
              {template.description && (
                <div
                  style={{
                    marginTop: "16px",
                    borderRadius: "8px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderLeft: `3px solid ${accent}`,
                    padding: "12px 14px",
                    fontSize: "12.5px",
                    color: "#334155",
                    lineHeight: 1.5,
                  }}
                >
                  {template.description}
                </div>
              )}

              {/* Category-Specific Preview Content */}
              {category === "QUOTATION" && (
                <div style={{ marginTop: "24px" }}>
                  <h4
                    style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      color: "#64748b",
                      margin: "0 0 10px 0",
                    }}
                  >
                    Itemized Pricing Schedule
                  </h4>

                  {/* Clean Formatted Table */}
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "12px",
                      borderRadius: "8px",
                      overflow: "hidden",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <thead>
                      <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1.5px solid #e2e8f0" }}>
                        <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "#475569" }}>
                          Description
                        </th>
                        <th style={{ padding: "10px 14px", textAlign: "center", fontWeight: 700, color: "#475569", width: "70px" }}>
                          Unit
                        </th>
                        <th style={{ padding: "10px 14px", textAlign: "center", fontWeight: 700, color: "#475569", width: "60px" }}>
                          Qty
                        </th>
                        <th style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "#475569", width: "110px" }}>
                          Rate (₹)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {quoteItems.map((item, idx) => (
                        <tr
                          key={idx}
                          style={{
                            borderBottom: "1px solid #f1f5f9",
                            backgroundColor: idx % 2 === 1 ? "#fafafa" : "#ffffff",
                          }}
                        >
                          <td style={{ padding: "10px 14px", fontWeight: 600, color: "#1e293b" }}>
                            {item.description}
                          </td>
                          <td style={{ padding: "10px 14px", textAlign: "center", color: "#64748b" }}>
                            {item.unit || "Nos"}
                          </td>
                          <td style={{ padding: "10px 14px", textAlign: "center", fontWeight: 600, color: "#334155" }}>
                            {item.defaultQuantity}
                          </td>
                          <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "#0f172a", fontFamily: "monospace" }}>
                            ₹{Number(item.defaultRate).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ backgroundColor: "#f8fafc", borderTop: "2px solid #e2e8f0" }}>
                        <td colSpan={3} style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700, fontSize: "12px", color: "#475569" }}>
                          Authorized Estimate Total:
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 800, fontSize: "13.5px", color: accent, fontFamily: "monospace" }}>
                          ₹{quoteTotal.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>

                  {/* Payment Terms & Notes */}
                  {(template.paymentTerms || template.notes) && (
                    <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                      {template.paymentTerms && (
                        <div style={{ fontSize: "11.5px", color: "#475569", backgroundColor: "#f8fafc", padding: "8px 12px", borderRadius: "6px", border: "1px solid #f1f5f9" }}>
                          <strong style={{ color: "#0f172a" }}>Payment Terms: </strong>
                          {template.paymentTerms}
                        </div>
                      )}
                      {template.notes && (
                        <div style={{ fontSize: "11.5px", color: "#475569", backgroundColor: "#f8fafc", padding: "8px 12px", borderRadius: "6px", border: "1px solid #f1f5f9" }}>
                          <strong style={{ color: "#0f172a" }}>Notes: </strong>
                          {template.notes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {category === "MOU" && (
                <div style={{ marginTop: "24px" }}>
                  <div
                    style={{
                      borderRadius: "8px",
                      backgroundColor: "#fffbeb",
                      border: "1px solid #fef3c7",
                      padding: "10px 14px",
                      fontSize: "11.5px",
                      color: "#92400e",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "16px",
                    }}
                  >
                    <AlertCircle style={{ width: "16px", height: "16px", color: "#b45309", flexShrink: 0 }} />
                    <span>Editable starting point — customize clauses to your specific bilateral agreement requirements.</span>
                  </div>

                  <h4
                    style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      color: "#64748b",
                      margin: "0 0 10px 0",
                    }}
                  >
                    Agreement Clauses & Provisions
                  </h4>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {(template.clauses || []).map((clause, idx) => (
                      <div
                        key={idx}
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #e9d5ff",
                          borderLeft: "3.5px solid #9333ea",
                          backgroundColor: "#faf5ff",
                          padding: "12px 14px",
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: "12.5px", color: "#581c87" }}>
                          {clause.title}
                        </div>
                        <div style={{ fontSize: "12px", color: "#475569", marginTop: "4px", lineHeight: 1.5 }}>
                          {clause.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {category === "LETTERHEAD" && (
                <div style={{ marginTop: "24px" }}>
                  <div
                    style={{
                      borderRadius: "10px",
                      border: "2px dashed #cbd5e1",
                      padding: "36px 20px",
                      textAlign: "center",
                      color: "#64748b",
                    }}
                  >
                    <div
                      style={{
                        margin: "0 auto 12px auto",
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        backgroundColor: "#f1f5f9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#94a3b8",
                      }}
                    >
                      <FileText style={{ width: "22px", height: "22px" }} />
                    </div>
                    <p style={{ fontWeight: 700, fontSize: "13px", color: "#334155", margin: 0 }}>
                      Sample Document Body Area
                    </p>
                    <p style={{ fontSize: "11.5px", color: "#64748b", margin: "4px 0 0 0" }}>
                      Your quotation or MOU content flows cleanly here, bounded by the header and footer styling above and below.
                    </p>
                  </div>

                  {template.letterheadConfig && (
                    <div
                      style={{
                        marginTop: "16px",
                        borderRadius: "8px",
                        backgroundColor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        padding: "12px 16px",
                        fontSize: "12px",
                        color: "#475569",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      <div>
                        <strong style={{ color: "#0f172a" }}>Layout: </strong> {template.letterheadConfig.layout}
                      </div>
                      <div>
                        <strong style={{ color: "#0f172a" }}>Tagline: </strong> {template.letterheadConfig.headerTagline || "None"}
                      </div>
                      <div>
                        <strong style={{ color: "#0f172a" }}>Footer note: </strong> {template.letterheadConfig.footerNote || "None"}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Document Footer Simulation */}
            <div
              style={{
                borderTop: "1px solid #f1f5f9",
                paddingTop: "14px",
                marginTop: "24px",
                fontSize: "11px",
                color: "#94a3b8",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Registered Office • Corporate Headquarters</span>
              <span>Page 1 of 1</span>
            </div>
          </div>
        </div>

        {/* Modal Action Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #e2e8f0",
            padding: "14px 22px",
            backgroundColor: "#ffffff",
            boxSizing: "border-box",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              type="button"
              onClick={() => onDuplicate(template)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                height: "36px",
                padding: "0 14px",
                borderRadius: "8px",
                border: "1.5px solid #cbd5e1",
                backgroundColor: "#ffffff",
                color: "#334155",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
            >
              <Copy style={{ width: "14px", height: "14px" }} /> Duplicate
            </button>

            {onShare && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onShare(template);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  height: "36px",
                  padding: "0 14px",
                  borderRadius: "8px",
                  border: "1.5px solid #cbd5e1",
                  backgroundColor: "#ffffff",
                  color: "#334155",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
              >
                <Share2 style={{ width: "14px", height: "14px", color: "#2563eb" }} /> Share
              </button>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                height: "36px",
                padding: "0 16px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                backgroundColor: "#ffffff",
                color: "#475569",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Close
            </button>

            <Link
              href={getActionUrl()}
              style={{
                height: "36px",
                padding: "0 18px",
                borderRadius: "8px",
                backgroundColor: "#2563eb",
                color: "#ffffff",
                fontSize: "12.5px",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                textDecoration: "none",
                boxShadow: "0 1px 3px rgba(37,99,235,0.25)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1d4ed8")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
            >
              <span>Use This Template</span>
              <ExternalLink style={{ width: "14px", height: "14px" }} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
