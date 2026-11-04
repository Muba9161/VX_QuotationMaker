"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  FileCheck2,
  Bookmark,
  Copy,
  Eye,
  Trash2,
  Image as ImageIcon,
  CheckCircle,
  Share2,
} from "lucide-react";

export interface TemplateDisplayItem {
  id: string;
  organizationId?: string;
  title: string;
  type: "QUOTATION" | "MOU" | "LETTERHEAD";
  category?: string;
  description?: string | null;
  isDefault?: boolean;
  tags?: string[];
  styleTag?: string;
  accentColor?: string;
  imageUrl?: string | null;
  fileUrl?: string | null;
  fileSource?: string;
  paymentTerms?: string;
  notes?: string;
  termsConditions?: string;
  lineItems?: Array<{ description: string; defaultQuantity: number; unit: string; defaultRate: number }>;
  items?: Array<{ id?: string; description: string; defaultQuantity: number; unit: string; defaultRate: number }>;
  clauses?: Array<{ id?: string; title: string; content: string; sortOrder?: number }>;
  letterheadConfig?: {
    layout: string;
    accentColor: string;
    headerTagline?: string;
    footerNote?: string;
  };
}

interface TemplateCardProps {
  template: TemplateDisplayItem;
  onPreview: (template: TemplateDisplayItem) => void;
  onDuplicate: (template: TemplateDisplayItem) => void;
  onShare?: (template: TemplateDisplayItem) => void;
  onDelete?: (template: TemplateDisplayItem) => void;
  onManageImage?: (template: TemplateDisplayItem) => void;
}

export default function TemplateCard({
  template,
  onPreview,
  onDuplicate,
  onShare,
  onDelete,
  onManageImage,
}: TemplateCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPreviewHovered, setIsPreviewHovered] = useState(false);

  const accent = template.accentColor || "#2563EB";
  const category = (template.category || template.type || "QUOTATION").toUpperCase();

  const getActionUrl = () => {
    if (category === "MOU") {
      return `/mou/new?templateId=${encodeURIComponent(template.id)}`;
    }
    if (category === "LETTERHEAD") {
      return `/branding?letterheadId=${encodeURIComponent(template.id)}`;
    }
    return `/quotations/new?templateId=${encodeURIComponent(template.id)}`;
  };

  const getCategoryBadge = () => {
    switch (category) {
      case "MOU":
        return {
          label: "MOU",
          bg: "#faf5ff",
          text: "#7e22ce",
          border: "#e9d5ff",
          icon: <FileCheck2 style={{ width: "11px", height: "11px", color: "#7e22ce" }} />,
        };
      case "LETTERHEAD":
        return {
          label: "Letterhead",
          bg: "#fffbeb",
          text: "#b45309",
          border: "#fde68a",
          icon: <Bookmark style={{ width: "11px", height: "11px", color: "#b45309" }} />,
        };
      default:
        return {
          label: "Quotation",
          bg: "#eff6ff",
          text: "#1d4ed8",
          border: "#bfdbfe",
          icon: <FileText style={{ width: "11px", height: "11px", color: "#1d4ed8" }} />,
        };
    }
  };

  const catBadge = getCategoryBadge();

  const quoteItems = template.lineItems || template.items || [];
  const totalVal = quoteItems.reduce(
    (acc, item) => acc + Number(item.defaultRate || 0) * (Number(item.defaultQuantity) || 1),
    0
  );

  const templateClauses = template.clauses || [];

  const letterheadConfig = template.letterheadConfig;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        borderRadius: "16px",
        backgroundColor: "#ffffff",
        border: isHovered ? "1.5px solid #94a3b8" : "1.5px solid #e2e8f0",
        boxShadow: isHovered
          ? "0 12px 24px -4px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.03)"
          : "0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02)",
        transform: isHovered ? "translateY(-2px)" : "translateY(0)",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* 1. Top Accent Line */}
      <div style={{ height: "3.5px", width: "100%", backgroundColor: accent }} />

      {/* 2. Unified Card Header: Category & Scope Badges */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "9px 14px",
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #f1f5f9",
          boxSizing: "border-box",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "2.5px 8px",
            borderRadius: "9999px",
            fontSize: "11px",
            fontWeight: 700,
            backgroundColor: catBadge.bg,
            color: catBadge.text,
            border: `1px solid ${catBadge.border}`,
          }}
        >
          {catBadge.icon}
          {catBadge.label}
        </span>

        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "2.5px 8px",
            borderRadius: "9999px",
            fontSize: "10.5px",
            fontWeight: 700,
            backgroundColor: "#ecfdf5",
            color: "#047857",
            border: "1px solid #a7f3d0",
          }}
        >
          <CheckCircle style={{ width: "11px", height: "11px", color: "#059669" }} />
          My Organization
        </span>
      </div>

      {/* 3. Document Preview Canvas: Centered Complete Floating Sheet */}
      <div
        onClick={() => onPreview(template)}
        onMouseEnter={() => setIsPreviewHovered(true)}
        onMouseLeave={() => setIsPreviewHovered(false)}
        style={{
          position: "relative",
          height: "172px",
          width: "100%",
          cursor: "pointer",
          backgroundColor: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "12px 14px",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {template.imageUrl ? (
          /* Custom Uploaded Thumbnail */
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={template.imageUrl}
            alt={template.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
            }}
          />
        ) : (
          /* Floating document preview */
          <div
            style={{
              width: "100%",
              maxWidth: "235px",
              height: "148px",
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              boxShadow: isPreviewHovered
                ? "0 8px 16px -2px rgba(15, 23, 42, 0.1), 0 2px 4px -1px rgba(15, 23, 42, 0.04)"
                : "0 2px 6px rgba(15, 23, 42, 0.05), 0 1px 2px rgba(15, 23, 42, 0.03)",
              padding: "10px 12px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transform: isPreviewHovered ? "scale(1.02)" : "scale(1)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              boxSizing: "border-box",
              userSelect: "none",
            }}
          >
            {category === "QUOTATION" ? (
              /* Realistic Quotation Invoice Mini Sheet */
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
                {/* Invoice Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "5px" }}>
                  <div>
                    <span style={{ fontSize: "10px", fontWeight: 800, color: accent, letterSpacing: "0.4px", display: "block", lineHeight: 1.1 }}>
                      QUOTATION
                    </span>
                    <span style={{ fontSize: "7.5px", color: "#94a3b8", fontFamily: "monospace" }}>{template.title}</span>
                  </div>
                  <span
                    style={{
                      fontSize: "8px",
                      fontWeight: 700,
                      padding: "2px 5px",
                      borderRadius: "4px",
                      backgroundColor: "#f1f5f9",
                      color: "#475569",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    Estimate
                  </span>
                </div>

                {/* Schedule Items */}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", margin: "4px 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "7.5px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.3px", borderBottom: "1px solid #f8fafc", paddingBottom: "1px" }}>
                    <span style={{ maxWidth: "135px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Service / Deliverable</span>
                    <span>Rate</span>
                  </div>
                  {quoteItems.length > 0 ? (
                    quoteItems.slice(0, 2).map((item, index) => (
                      <div key={`${item.description}-${index}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "8.5px", fontWeight: 600, color: "#1e293b", maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.description}
                        </span>
                        <span style={{ fontSize: "8.5px", fontWeight: 700, color: "#475569", fontFamily: "monospace" }}>
                          ₹{Number(item.defaultRate || 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span style={{ fontSize: "8.5px", color: "#94a3b8" }}>No line items configured</span>
                  )}
                </div>

                {/* Total Footer Pill */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "5px" }}>
                  <span style={{ fontSize: "7.5px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                    Authorized Total
                  </span>
                  <span
                    style={{
                      fontSize: "9px",
                      fontWeight: 800,
                      color: "#ffffff",
                      backgroundColor: accent,
                      padding: "2px 7px",
                      borderRadius: "4px",
                      fontFamily: "monospace",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    }}
                  >
                    {quoteItems.length > 0 ? `₹${totalVal.toLocaleString("en-IN")}` : "—"}
                  </span>
                </div>
              </div>
            ) : category === "MOU" ? (
              /* Formal Legal MOU Agreement Mini Sheet */
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
                <div style={{ textAlign: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "4px" }}>
                  <span style={{ fontSize: "8.5px", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.3px", display: "block", lineHeight: 1.1 }}>
                    Memorandum of Understanding
                  </span>
                  <span style={{ fontSize: "7px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.2px" }}>
                    {template.title}
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px", margin: "3px 0" }}>
                  {templateClauses.slice(0, 2).map((clause) => (
                    <div
                      key={clause.id || clause.title}
                      style={{
                        padding: "3px 6px",
                        borderRadius: "4px",
                        backgroundColor: "#faf5ff",
                        border: "1px solid #f3e8ff",
                        borderLeft: "2.5px solid #9333ea",
                      }}
                    >
                      <span style={{ fontSize: "7.5px", fontWeight: 700, color: "#581c87", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {clause.title}
                      </span>
                      <span style={{ fontSize: "7px", color: "#6b7280", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {clause.content}
                      </span>
                    </div>
                  ))}
                  {templateClauses.length === 0 && (
                    <span style={{ fontSize: "8.5px", color: "#94a3b8" }}>No clauses configured</span>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "3px" }}>
                  <div style={{ borderTop: "1px solid #94a3b8", width: "65px", paddingTop: "1px", textAlign: "center", fontSize: "7px", fontWeight: 700, color: "#64748b" }}>
                    Party A (Org)
                  </div>
                  <div style={{ borderTop: "1px solid #94a3b8", width: "65px", paddingTop: "1px", textAlign: "center", fontSize: "7px", fontWeight: 700, color: "#64748b" }}>
                    Party B (Client)
                  </div>
                </div>
              </div>
            ) : (
              /* Corporate Letterhead Mini Sheet */
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `2px solid ${accent}`, paddingBottom: "5px" }}>
                  <div>
                    <span style={{ fontSize: "9.5px", fontWeight: 800, color: "#0f172a", display: "block", lineHeight: 1.1 }}>
                      {template.title}
                    </span>
                    <span style={{ fontSize: "7px", color: "#64748b", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "150px" }}>
                      {letterheadConfig?.headerTagline || ""}
                    </span>
                  </div>
                  <div
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "4px",
                      backgroundColor: accent,
                      color: "#ffffff",
                      fontSize: "8px",
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    }}
                  >
                    {template.title.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Simulated Document Letter Body */}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", margin: "auto 0" }}>
                  <span style={{ fontSize: "7px", color: "#94a3b8", fontFamily: "monospace" }}>{template.category || template.type}</span>
                  <div style={{ height: "3.5px", width: "100%", backgroundColor: "#f1f5f9", borderRadius: "2px" }} />
                  <div style={{ height: "3.5px", width: "88%", backgroundColor: "#f1f5f9", borderRadius: "2px" }} />
                  <div style={{ height: "3.5px", width: "65%", backgroundColor: "#f1f5f9", borderRadius: "2px" }} />
                </div>

                <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "3px", fontSize: "6.5px", color: "#94a3b8", display: "flex", justifyContent: "space-between", overflow: "hidden", whiteSpace: "nowrap" }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", maxWidth: "140px" }}>{letterheadConfig?.footerNote || ""}</span>
                  <span>{template.title}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hover Quick-Preview Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.25)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: isPreviewHovered ? 1 : 0,
            transition: "opacity 0.2s ease",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              borderRadius: "9999px",
              backgroundColor: "#ffffff",
              color: "#0f172a",
              fontSize: "11px",
              fontWeight: 700,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            }}
          >
            <Eye style={{ width: "13px", height: "13px", color: "#2563eb" }} />
            Click to Preview
          </span>
        </div>
      </div>

      {/* 4. Card Content: Title, Description & Tags */}
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "14px 16px 16px 16px",
          boxSizing: "border-box",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
            <h3
              onClick={() => onPreview(template)}
              style={{
                fontSize: "13.5px",
                fontWeight: 700,
                color: isHovered ? "#2563eb" : "#0f172a",
                cursor: "pointer",
                margin: 0,
                lineHeight: 1.3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                transition: "color 0.15s ease",
              }}
              title={template.title}
            >
              {template.title}
            </h3>
            {template.isDefault && (
              <span
                style={{
                  flexShrink: 0,
                  borderRadius: "4px",
                  backgroundColor: "#eff6ff",
                  padding: "1px 6px",
                  fontSize: "9.5px",
                  fontWeight: 700,
                  color: "#1d4ed8",
                  border: "1px solid #bfdbfe",
                }}
              >
                Default
              </span>
            )}
          </div>

          <p
            style={{
              margin: "6px 0 0 0",
              fontSize: "12px",
              color: "#64748b",
              lineHeight: 1.45,
              minHeight: "34px",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {template.description || ""}
          </p>

          {/* Meta Badges */}
          <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            {template.styleTag && (
              <span
                style={{
                  borderRadius: "6px",
                  backgroundColor: "#f1f5f9",
                  padding: "2px 7px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#475569",
                }}
              >
                {template.styleTag}
              </span>
            )}
            {template.tags?.map((tag) => (
              <span
                key={tag}
                style={{
                  borderRadius: "6px",
                  backgroundColor: "#f1f5f9",
                  padding: "2px 7px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#475569",
                }}
              >
                {tag}
              </span>
            ))}
            {quoteItems.length > 0 && (
              <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500 }}>
                • {quoteItems.length} items
              </span>
            )}
            {templateClauses.length > 0 && (
              <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500 }}>
                • {templateClauses.length} clauses
              </span>
            )}
          </div>
        </div>

        {/* 5. Action Buttons Bar */}
        <div
          style={{
            marginTop: "14px",
            paddingTop: "12px",
            borderTop: "1px solid #f1f5f9",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(36px, 1fr))",
            alignItems: "center",
            gap: "8px",
            boxSizing: "border-box",
          }}
        >
          {/* Primary Action Button */}
          <Link
            href={getActionUrl()}
            style={{
              gridColumn: "1 / -1",
              width: "100%",
              minWidth: 0,
              height: "40px",
              padding: "0 12px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "8px",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: 700,
              whiteSpace: "nowrap",
              textDecoration: "none",
              transition: "background-color 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1d4ed8")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
          >
            Use Template
          </Link>

          {/* Quick Preview Button */}
          <button
            type="button"
            onClick={() => onPreview(template)}
            style={{
              width: "100%",
              minWidth: 0,
              height: "38px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              backgroundColor: "#ffffff",
              color: "#475569",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f8fafc";
              e.currentTarget.style.borderColor = "#94a3b8";
              e.currentTarget.style.color = "#2563eb";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#ffffff";
              e.currentTarget.style.borderColor = "#cbd5e1";
              e.currentTarget.style.color = "#475569";
            }}
            title="Preview Template Details"
          >
            <Eye style={{ width: "14px", height: "14px" }} />
          </button>

          {/* Duplicate Button */}
          <button
            type="button"
            onClick={() => onDuplicate(template)}
            style={{
              width: "100%",
              minWidth: 0,
              height: "38px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              backgroundColor: "#ffffff",
              color: "#475569",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f8fafc";
              e.currentTarget.style.borderColor = "#94a3b8";
              e.currentTarget.style.color = "#2563eb";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#ffffff";
              e.currentTarget.style.borderColor = "#cbd5e1";
              e.currentTarget.style.color = "#475569";
            }}
            title="Duplicate to My Templates"
          >
            <Copy style={{ width: "14px", height: "14px" }} />
          </button>

          {/* Share Button */}
          {onShare && (
            <button
              type="button"
              onClick={() => onShare(template)}
              style={{
                width: "100%",
                minWidth: 0,
                height: "38px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                backgroundColor: "#ffffff",
                color: "#475569",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f8fafc";
                e.currentTarget.style.borderColor = "#94a3b8";
                e.currentTarget.style.color = "#2563eb";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#ffffff";
                e.currentTarget.style.borderColor = "#cbd5e1";
                e.currentTarget.style.color = "#475569";
              }}
              title="Share Template"
            >
              <Share2 style={{ width: "14px", height: "14px" }} />
            </button>
          )}

          {/* Custom Template Actions */}
          {onManageImage && (
            <button
              type="button"
              onClick={() => onManageImage(template)}
              style={{
                width: "100%",
                minWidth: 0,
                height: "38px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                backgroundColor: "#ffffff",
                color: "#475569",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f8fafc";
                e.currentTarget.style.borderColor = "#94a3b8";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#ffffff";
                e.currentTarget.style.borderColor = "#cbd5e1";
              }}
              title="Manage Thumbnail Image"
            >
              <ImageIcon style={{ width: "14px", height: "14px" }} />
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(template)}
              style={{
                width: "100%",
                minWidth: 0,
                height: "38px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                border: "1px solid #fecaca",
                backgroundColor: "#fff5f5",
                color: "#dc2626",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fee2e2")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff5f5")}
              title="Delete Template"
            >
              <Trash2 style={{ width: "14px", height: "14px" }} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
