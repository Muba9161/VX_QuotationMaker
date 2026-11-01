"use client";

import React, { useState } from "react";
import { FileText, FileCheck2, Bookmark, Building2 } from "lucide-react";

interface BrandingDocumentPreviewProps {
  name: string;
  tagline: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string | null;
  signatoryName: string;
  signatoryTitle: string;
  letterheadUrl?: string | null;
}

export default function BrandingDocumentPreview({
  name,
  tagline,
  website,
  email,
  phone,
  address,
  primaryColor,
  secondaryColor,
  accentColor,
  logoUrl,
  signatoryName,
  signatoryTitle,
}: BrandingDocumentPreviewProps) {
  const [docType, setDocType] = useState<"QUOTATION" | "MOU" | "LETTERHEAD">("QUOTATION");

  return (
    <div
      style={{
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        backgroundColor: "#ffffff",
        padding: "24px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        boxSizing: "border-box",
      }}
    >
      {/* Header & Mode Switcher */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          borderBottom: "1px solid #f1f5f9",
          paddingBottom: "14px",
        }}
      >
        <div>
          <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
            Live Document Simulation
          </h3>
          <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
            Preview how your branding renders across client-facing documents
          </p>
        </div>

        {/* Toggle Pills */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            borderRadius: "8px",
            backgroundColor: "#f1f5f9",
            padding: "3px",
            border: "1px solid #e2e8f0",
          }}
        >
          <button
            type="button"
            onClick={() => setDocType("QUOTATION")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 12px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: docType === "QUOTATION" ? "#ffffff" : "transparent",
              color: docType === "QUOTATION" ? "#0f172a" : "#64748b",
              fontSize: "12px",
              fontWeight: docType === "QUOTATION" ? 700 : 500,
              cursor: "pointer",
              boxShadow: docType === "QUOTATION" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
              transition: "all 0.15s ease",
            }}
          >
            <FileText style={{ width: "13px", height: "13px", color: docType === "QUOTATION" ? "#2563eb" : "#94a3b8" }} />
            <span>Quotation</span>
          </button>

          <button
            type="button"
            onClick={() => setDocType("MOU")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 12px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: docType === "MOU" ? "#ffffff" : "transparent",
              color: docType === "MOU" ? "#0f172a" : "#64748b",
              fontSize: "12px",
              fontWeight: docType === "MOU" ? 700 : 500,
              cursor: "pointer",
              boxShadow: docType === "MOU" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
              transition: "all 0.15s ease",
            }}
          >
            <FileCheck2 style={{ width: "13px", height: "13px", color: docType === "MOU" ? "#7c3aed" : "#94a3b8" }} />
            <span>MOU</span>
          </button>

          <button
            type="button"
            onClick={() => setDocType("LETTERHEAD")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 12px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: docType === "LETTERHEAD" ? "#ffffff" : "transparent",
              color: docType === "LETTERHEAD" ? "#0f172a" : "#64748b",
              fontSize: "12px",
              fontWeight: docType === "LETTERHEAD" ? 700 : 500,
              cursor: "pointer",
              boxShadow: docType === "LETTERHEAD" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
              transition: "all 0.15s ease",
            }}
          >
            <Bookmark style={{ width: "13px", height: "13px", color: docType === "LETTERHEAD" ? "#d97706" : "#94a3b8" }} />
            <span>Letterhead</span>
          </button>
        </div>
      </div>

      {/* Simulated Document Canvas */}
      <div
        style={{
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          backgroundColor: "#f8fafc",
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
            borderRadius: "10px",
            backgroundColor: "#ffffff",
            boxShadow: "0 4px 14px rgba(15, 23, 42, 0.05)",
            border: "1px solid #e2e8f0",
            padding: "28px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxSizing: "border-box",
            position: "relative",
            overflow: "hidden",
            color: "#1e293b",
          }}
        >
          {/* Top Brand Stripe */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              backgroundColor: primaryColor,
            }}
          />

          <div>
            {/* Header Row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                borderBottom: "1.5px solid #f1f5f9",
                paddingBottom: "16px",
              }}
            >
              <div>
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt="Logo"
                    style={{
                      maxHeight: "44px",
                      maxWidth: "180px",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        backgroundColor: primaryColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ffffff",
                        fontWeight: 800,
                        fontSize: "14px",
                      }}
                    >
                      {(name || "C").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                        {name || "Company Legal Name"}
                      </h4>
                      {tagline && <p style={{ fontSize: "11px", color: "#64748b", margin: "2px 0 0 0" }}>{tagline}</p>}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: "10px", fontSize: "10.5px", color: "#64748b", lineHeight: 1.4 }}>
                  {address && <p style={{ margin: 0 }}>{address}</p>}
                  <p style={{ margin: "2px 0 0 0" }}>
                    {[email, phone, website].filter(Boolean).join(" • ")}
                  </p>
                </div>
              </div>

              <div style={{ textAlign: "right", fontSize: "11px", color: "#64748b" }}>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: primaryColor,
                    display: "block",
                  }}
                >
                  {docType === "QUOTATION"
                    ? "Commercial Quotation"
                    : docType === "MOU"
                    ? "Memorandum of Understanding"
                    : "Official Corporate Letterhead"}
                </span>
                <p style={{ margin: "3px 0 0 0", fontFamily: "monospace", fontSize: "10.5px" }}>
                  Ref: {docType.substring(0, 3)}-2026-0042
                </p>
                <p style={{ margin: "2px 0 0 0", fontSize: "10.5px" }}>Date: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* Document Content Based on Selected Tab */}
            {docType === "QUOTATION" && (
              <div style={{ marginTop: "18px" }}>
                {/* Billed To Card */}
                <div
                  style={{
                    borderRadius: "8px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    padding: "12px 14px",
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "11.5px",
                    marginBottom: "16px",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                      Billed To
                    </span>
                    <p style={{ fontWeight: 700, color: "#0f172a", margin: "2px 0 0 0" }}>
                      Acme Global Technologies Inc.
                    </p>
                    <p style={{ color: "#64748b", margin: "1px 0 0 0" }}>Cyber City, Bengaluru, Karnataka, India</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                      Validity
                    </span>
                    <p style={{ fontWeight: 600, color: "#0f172a", margin: "2px 0 0 0" }}>30 Calendar Days</p>
                    <p style={{ color: "#64748b", margin: "1px 0 0 0" }}>Net 15 Milestone Terms</p>
                  </div>
                </div>

                {/* Table */}
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "11.5px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: primaryColor, color: "#ffffff" }}>
                      <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700 }}>Description</th>
                      <th style={{ padding: "8px 12px", textAlign: "center", fontWeight: 700, width: "65px" }}>Unit</th>
                      <th style={{ padding: "8px 12px", textAlign: "center", fontWeight: 700, width: "55px" }}>Qty</th>
                      <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, width: "105px" }}>
                        Rate (₹)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "8px 12px", fontWeight: 600, color: "#1e293b" }}>
                        Enterprise Cloud Architecture & Infrastructure
                      </td>
                      <td style={{ padding: "8px 12px", textAlign: "center", color: "#64748b" }}>Phase</td>
                      <td style={{ padding: "8px 12px", textAlign: "center", fontWeight: 600, color: "#334155" }}>1</td>
                      <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, color: "#0f172a", fontFamily: "monospace" }}>
                        ₹1,50,000
                      </td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #f1f5f9", backgroundColor: "#fafafa" }}>
                      <td style={{ padding: "8px 12px", fontWeight: 600, color: "#1e293b" }}>
                        API Gateway Integration & Security Audit
                      </td>
                      <td style={{ padding: "8px 12px", textAlign: "center", color: "#64748b" }}>Module</td>
                      <td style={{ padding: "8px 12px", textAlign: "center", fontWeight: 600, color: "#334155" }}>2</td>
                      <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, color: "#0f172a", fontFamily: "monospace" }}>
                        ₹90,000
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: "1.5px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
                      <td colSpan={3} style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, color: "#64748b" }}>
                        Subtotal:
                      </td>
                      <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, color: "#0f172a", fontFamily: "monospace" }}>
                        ₹2,40,000
                      </td>
                    </tr>
                    <tr style={{ backgroundColor: "#f8fafc" }}>
                      <td colSpan={3} style={{ padding: "4px 12px 8px 12px", textAlign: "right", fontWeight: 700, color: "#64748b" }}>
                        GST (18%):
                      </td>
                      <td style={{ padding: "4px 12px 8px 12px", textAlign: "right", fontWeight: 700, color: "#0f172a", fontFamily: "monospace" }}>
                        ₹43,200
                      </td>
                    </tr>
                    <tr style={{ borderTop: "2px solid #e2e8f0", backgroundColor: "#f1f5f9" }}>
                      <td colSpan={3} style={{ padding: "10px 12px", textAlign: "right", fontWeight: 800, fontSize: "12px", color: "#0f172a" }}>
                        Authorized Total:
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          textAlign: "right",
                          fontWeight: 800,
                          fontSize: "13px",
                          color: primaryColor,
                          fontFamily: "monospace",
                        }}
                      >
                        ₹2,83,200
                      </td>
                    </tr>
                  </tfoot>
                </table>

                {/* Terms Box */}
                <div
                  style={{
                    marginTop: "12px",
                    borderRadius: "6px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #f1f5f9",
                    padding: "8px 12px",
                    fontSize: "10.5px",
                    color: "#64748b",
                  }}
                >
                  <strong style={{ color: "#334155" }}>Payment Terms: </strong>
                  50% advance against work order, 50% on client milestone sign-off.
                </div>
              </div>
            )}

            {docType === "MOU" && (
              <div style={{ marginTop: "18px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <p style={{ fontSize: "11px", color: "#475569", lineHeight: 1.5, fontStyle: "italic", textAlign: "center", margin: "4px 0" }}>
                  &ldquo;This Memorandum of Understanding (&lsquo;MOU&rsquo;) sets forth the bilateral collaborative terms between {name || "The Company"} and the Partner Organization.&rdquo;
                </p>

                <div
                  style={{
                    borderRadius: "8px",
                    border: "1px solid #e9d5ff",
                    borderLeft: `3.5px solid ${primaryColor}`,
                    backgroundColor: "#faf5ff",
                    padding: "10px 12px",
                  }}
                >
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#581c87", display: "block" }}>
                    1. PURPOSE & BILATERAL COOPERATION
                  </span>
                  <span style={{ fontSize: "10.5px", color: "#475569", marginTop: "2px", display: "block" }}>
                    The Parties agree to collaborate in good faith on joint technical evaluations, pilot solution architecture, and strategic go-to-market initiatives.
                  </span>
                </div>

                <div
                  style={{
                    borderRadius: "8px",
                    border: "1px solid #e9d5ff",
                    borderLeft: `3.5px solid ${primaryColor}`,
                    backgroundColor: "#faf5ff",
                    padding: "10px 12px",
                  }}
                >
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#581c87", display: "block" }}>
                    2. CONFIDENTIALITY & PROPRIETARY RIGHTS
                  </span>
                  <span style={{ fontSize: "10.5px", color: "#475569", marginTop: "2px", display: "block" }}>
                    All proprietary data, source code, and commercial specifications exchanged during this engagement shall remain strictly confidential for 36 months.
                  </span>
                </div>
              </div>
            )}

            {docType === "LETTERHEAD" && (
              <div style={{ marginTop: "20px" }}>
                <div
                  style={{
                    borderRadius: "8px",
                    border: "2px dashed #cbd5e1",
                    padding: "28px 16px",
                    textAlign: "center",
                    backgroundColor: "#f8fafc",
                  }}
                >
                  <Bookmark style={{ width: "26px", height: "26px", color: primaryColor, margin: "0 auto 8px auto" }} />
                  <p style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", margin: 0 }}>
                    Official Document Content Zone
                  </p>
                  <p style={{ fontSize: "10.5px", color: "#64748b", margin: "3px 0 0 0" }}>
                    Your customized corporate headers and footers frame the document body seamlessly.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Document Footer & Signatory Block */}
          <div
            style={{
              marginTop: "24px",
              paddingTop: "14px",
              borderTop: "1.5px solid #f1f5f9",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              fontSize: "10.5px",
              color: "#64748b",
            }}
          >
            <div>
              <p style={{ fontWeight: 700, color: "#0f172a", margin: 0 }}>{name || "Company Legal Name"}</p>
              <p style={{ margin: "2px 0 0 0", fontSize: "9.5px" }}>Confidential • For Authorized Recipient Only</p>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ height: "20px", borderBottom: "1.5px solid #cbd5e1", width: "120px", margin: "0 0 4px auto" }} />
              <p style={{ fontWeight: 700, color: "#0f172a", margin: 0 }}>
                {signatoryName || "Authorized Signatory"}
              </p>
              <p style={{ margin: "1px 0 0 0", fontSize: "9.5px", color: "#64748b" }}>
                {signatoryTitle || "Executive Officer"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
