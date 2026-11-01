"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import OrgLayout from "@/components/OrgLayout";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Loader2,
  AlertCircle,
  FileText,
  FileCheck2,
  Sparkles,
} from "lucide-react";

interface FormLineItem {
  id: string;
  description: string;
  unit: string;
  defaultQuantity: number;
  defaultRate: number;
}

interface FormClause {
  id: string;
  title: string;
  content: string;
}

const PRESET_ACCENT_COLORS = [
  { name: "Royal Blue", hex: "#2563EB" },
  { name: "Emerald", hex: "#059669" },
  { name: "Violet", hex: "#7C3AED" },
  { name: "Amber", hex: "#D97706" },
  { name: "Rose", hex: "#E11D48" },
  { name: "Slate", hex: "#334155" },
];

export default function CreateTemplatePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [type, setType] = useState<"QUOTATION" | "MOU">("QUOTATION");
  const [description, setDescription] = useState("");
  const [styleTag, setStyleTag] = useState("Corporate");
  const [accentColor, setAccentColor] = useState("#2563EB");
  const [isDefault, setIsDefault] = useState(false);
  const [paymentTerms, setPaymentTerms] = useState("50% advance on order, 50% on milestone completion.");
  const [notes, setNotes] = useState("Rates valid for 30 calendar days.");

  // Quotation Line Items
  const [lineItems, setLineItems] = useState<FormLineItem[]>([
    {
      id: "1",
      description: "Strategic Architecture & System Design",
      unit: "Phase",
      defaultQuantity: 1,
      defaultRate: 50000,
    },
    {
      id: "2",
      description: "Development & Implementation Deliverables",
      unit: "Deliverable",
      defaultQuantity: 1,
      defaultRate: 75000,
    },
  ]);

  // MOU Clauses
  const [clauses, setClauses] = useState<FormClause[]>([
    {
      id: "1",
      title: "1. Purpose and Scope of Cooperation",
      content:
        "This Memorandum of Understanding ('MOU') defines the operational framework and bilateral cooperation terms between the Parties for joint initiative execution.",
    },
    {
      id: "2",
      title: "2. Confidentiality and Non-Disclosure",
      content:
        "All proprietary materials, customer data, and technical specifications exchanged during this engagement shall remain strictly confidential for a period of 3 years.",
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Line item handlers
  const handleAddItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        description: "",
        unit: "Nos",
        defaultQuantity: 1,
        defaultRate: 0,
      },
    ]);
  };

  const handleUpdateItem = (id: string, field: keyof FormLineItem, value: any) => {
    setLineItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    );
  };

  const handleRemoveItem = (id: string) => {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((it) => it.id !== id));
  };

  // Clause handlers
  const handleAddClause = () => {
    setClauses((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        title: `${prev.length + 1}. Clause Title`,
        content: "",
      },
    ]);
  };

  const handleUpdateClause = (id: string, field: keyof FormClause, value: string) => {
    setClauses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleRemoveClause = (id: string) => {
    if (clauses.length <= 1) return;
    setClauses((prev) => prev.filter((c) => c.id !== id));
  };

  const estimatedTotal = lineItems.reduce(
    (acc, it) => acc + (Number(it.defaultRate) || 0) * (Number(it.defaultQuantity) || 1),
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide a template title.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const payload: any = {
        title: title.trim(),
        type,
        category: type,
        description: description.trim() || null,
        isDefault,
        contentSchema: {
          styleTag: styleTag.trim() || "Standard",
          accentColor,
          paymentTerms: type === "QUOTATION" ? paymentTerms.trim() : undefined,
          notes: type === "QUOTATION" ? notes.trim() : undefined,
        },
      };

      if (type === "QUOTATION") {
        payload.items = lineItems.map((item, idx) => ({
          description: item.description.trim() || `Item ${idx + 1}`,
          unit: item.unit.trim() || "Nos",
          defaultQuantity: Number(item.defaultQuantity) || 1,
          defaultRate: Number(item.defaultRate) || 0,
          sortOrder: idx,
        }));
      } else {
        payload.clauses = clauses.map((clause, idx) => ({
          title: clause.title.trim() || `Clause ${idx + 1}`,
          content: clause.content.trim() || "Standard clause provisions.",
          sortOrder: idx,
        }));
      }

      const res = await fetch("/api/v1/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to create template.");
      }

      router.push("/templates");
    } catch (err: any) {
      setError(err.message || "Failed to create template.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OrgLayout>
      <div style={{ maxWidth: "880px", margin: "0 auto", paddingBottom: "60px" }}>
        {/* Top Navigation Row */}
        <div style={{ marginBottom: "20px" }}>
          <Link
            href="/templates"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              fontWeight: 600,
              color: "#64748b",
              textDecoration: "none",
              padding: "6px 10px",
              borderRadius: "8px",
              transition: "color 0.15s ease",
            }}
          >
            <ArrowLeft style={{ width: "15px", height: "15px" }} />
            <span>Back to Template Library</span>
          </Link>
        </div>

        {/* Page Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #e2e8f0",
            paddingBottom: "18px",
            marginBottom: "24px",
          }}
        >
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.3px" }}>
              Create Document Template
            </h1>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0 0" }}>
              Design a standardized, reusable template for your organization&apos;s quotations or bilateral agreements.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Link
              href="/templates"
              style={{
                height: "38px",
                padding: "0 16px",
                borderRadius: "9px",
                border: "1.5px solid #cbd5e1",
                backgroundColor: "#ffffff",
                color: "#475569",
                fontSize: "12.5px",
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Cancel
            </Link>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                height: "38px",
                padding: "0 20px",
                borderRadius: "9px",
                backgroundColor: isSubmitting ? "#94a3b8" : "#2563eb",
                color: "#ffffff",
                fontSize: "12.5px",
                fontWeight: 700,
                border: "none",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                boxShadow: "0 1px 3px rgba(37,99,235,0.25)",
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 style={{ width: "15px", height: "15px", animation: "spin 1s linear infinite" }} />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save style={{ width: "15px", height: "15px" }} />
                  <span>Create Template</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              marginBottom: "20px",
              borderRadius: "10px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              padding: "12px 16px",
              fontSize: "13px",
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <AlertCircle style={{ width: "18px", height: "18px", flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Main Form Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Card 1: Template Basics */}
          <div
            style={{
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            }}
          >
            <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: "0 0 16px 0" }}>
              Template Overview
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Type Switcher */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "8px" }}>
                  Document Type
                </label>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    type="button"
                    onClick={() => setType("QUOTATION")}
                    style={{
                      flex: 1,
                      height: "44px",
                      borderRadius: "10px",
                      border: type === "QUOTATION" ? "2px solid #2563eb" : "1.5px solid #e2e8f0",
                      backgroundColor: type === "QUOTATION" ? "#eff6ff" : "#ffffff",
                      color: type === "QUOTATION" ? "#1d4ed8" : "#475569",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <FileText style={{ width: "16px", height: "16px" }} />
                    <span>Quotation & Proposal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setType("MOU")}
                    style={{
                      flex: 1,
                      height: "44px",
                      borderRadius: "10px",
                      border: type === "MOU" ? "2px solid #9333ea" : "1.5px solid #e2e8f0",
                      backgroundColor: type === "MOU" ? "#faf5ff" : "#ffffff",
                      color: type === "MOU" ? "#7e22ce" : "#475569",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <FileCheck2 style={{ width: "16px", height: "16px" }} />
                    <span>MOU / Bilateral Agreement</span>
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  Template Title <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Enterprise Cloud Engineering Proposal"
                  required
                  style={{
                    width: "100%",
                    height: "40px",
                    padding: "0 14px",
                    borderRadius: "9px",
                    border: "1.5px solid #cbd5e1",
                    backgroundColor: "#ffffff",
                    fontSize: "13px",
                    color: "#0f172a",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Description */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe what scope or client situation this template is best suited for..."
                  rows={2}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "9px",
                    border: "1.5px solid #cbd5e1",
                    backgroundColor: "#ffffff",
                    fontSize: "13px",
                    color: "#0f172a",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Style Tag & Accent Color */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Style Tag
                  </label>
                  <input
                    type="text"
                    value={styleTag}
                    onChange={(e) => setStyleTag(e.target.value)}
                    placeholder="e.g. Corporate, Retainer, Tech"
                    style={{
                      width: "100%",
                      height: "40px",
                      padding: "0 14px",
                      borderRadius: "9px",
                      border: "1.5px solid #cbd5e1",
                      backgroundColor: "#ffffff",
                      fontSize: "13px",
                      color: "#0f172a",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Accent Color
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {PRESET_ACCENT_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setAccentColor(c.hex)}
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          backgroundColor: c.hex,
                          border: accentColor === c.hex ? "3px solid #0f172a" : "2px solid #ffffff",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                          cursor: "pointer",
                        }}
                        title={c.name}
                      />
                    ))}
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      style={{
                        width: "32px",
                        height: "32px",
                        padding: 0,
                        border: "none",
                        borderRadius: "50%",
                        cursor: "pointer",
                      }}
                      title="Custom color"
                    />
                  </div>
                </div>
              </div>

              {/* Default template toggle */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
                <input
                  type="checkbox"
                  id="isDefaultTemplate"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
                <label htmlFor="isDefaultTemplate" style={{ fontSize: "13px", fontWeight: 600, color: "#334155", cursor: "pointer" }}>
                  Set as default {type.toLowerCase()} template for my organization
                </label>
              </div>
            </div>
          </div>

          {/* Card 2: Items or Clauses depending on type */}
          {type === "QUOTATION" ? (
            <div
              style={{
                borderRadius: "14px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#ffffff",
                padding: "24px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <div>
                  <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                    Standard Line Items
                  </h2>
                  <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
                    Configure default deliverables and baseline pricing for documents created from this template.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddItem}
                  style={{
                    height: "34px",
                    padding: "0 14px",
                    borderRadius: "8px",
                    backgroundColor: "#eff6ff",
                    color: "#2563eb",
                    border: "1px solid #bfdbfe",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Plus style={{ width: "14px", height: "14px" }} />
                  <span>Add Item</span>
                </button>
              </div>

              {/* Items Table */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {lineItems.map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 12px",
                      borderRadius: "10px",
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", width: "20px" }}>
                      {idx + 1}.
                    </span>

                    <input
                      type="text"
                      placeholder="Item description or deliverable title..."
                      value={item.description}
                      onChange={(e) => handleUpdateItem(item.id, "description", e.target.value)}
                      style={{
                        flex: 1,
                        height: "36px",
                        padding: "0 12px",
                        borderRadius: "7px",
                        border: "1px solid #cbd5e1",
                        backgroundColor: "#ffffff",
                        fontSize: "12.5px",
                        color: "#0f172a",
                        outline: "none",
                      }}
                    />

                    <input
                      type="text"
                      placeholder="Unit"
                      value={item.unit}
                      onChange={(e) => handleUpdateItem(item.id, "unit", e.target.value)}
                      style={{
                        width: "80px",
                        height: "36px",
                        padding: "0 10px",
                        borderRadius: "7px",
                        border: "1px solid #cbd5e1",
                        backgroundColor: "#ffffff",
                        fontSize: "12px",
                        color: "#0f172a",
                        textAlign: "center",
                        outline: "none",
                      }}
                    />

                    <input
                      type="number"
                      placeholder="Qty"
                      min={1}
                      value={item.defaultQuantity}
                      onChange={(e) => handleUpdateItem(item.id, "defaultQuantity", Number(e.target.value) || 1)}
                      style={{
                        width: "65px",
                        height: "36px",
                        padding: "0 8px",
                        borderRadius: "7px",
                        border: "1px solid #cbd5e1",
                        backgroundColor: "#ffffff",
                        fontSize: "12px",
                        color: "#0f172a",
                        textAlign: "center",
                        outline: "none",
                      }}
                    />

                    <input
                      type="number"
                      placeholder="Rate (₹)"
                      min={0}
                      value={item.defaultRate}
                      onChange={(e) => handleUpdateItem(item.id, "defaultRate", Number(e.target.value) || 0)}
                      style={{
                        width: "110px",
                        height: "36px",
                        padding: "0 10px",
                        borderRadius: "7px",
                        border: "1px solid #cbd5e1",
                        backgroundColor: "#ffffff",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#0f172a",
                        textAlign: "right",
                        outline: "none",
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={lineItems.length <= 1}
                      style={{
                        height: "36px",
                        width: "36px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "7px",
                        border: "1px solid #fee2e2",
                        backgroundColor: "#fff5f5",
                        color: "#dc2626",
                        cursor: lineItems.length <= 1 ? "not-allowed" : "pointer",
                        opacity: lineItems.length <= 1 ? 0.4 : 1,
                      }}
                      title="Remove item"
                    >
                      <Trash2 style={{ width: "15px", height: "15px" }} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Total Summary Row */}
              <div
                style={{
                  marginTop: "16px",
                  padding: "12px 16px",
                  borderRadius: "9px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#64748b" }}>
                  Estimated Baseline Total ({lineItems.length} items)
                </span>
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: 800,
                    color: accentColor,
                    fontFamily: "monospace",
                  }}
                >
                  ₹{estimatedTotal.toLocaleString()}
                </span>
              </div>

              {/* Standard Terms & Notes */}
              <div style={{ marginTop: "18px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "5px" }}>
                    Default Payment Terms
                  </label>
                  <input
                    type="text"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    style={{
                      width: "100%",
                      height: "38px",
                      padding: "0 12px",
                      borderRadius: "8px",
                      border: "1.5px solid #cbd5e1",
                      backgroundColor: "#ffffff",
                      fontSize: "12.5px",
                      color: "#0f172a",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "5px" }}>
                    Default Quotation Notes
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{
                      width: "100%",
                      height: "38px",
                      padding: "0 12px",
                      borderRadius: "8px",
                      border: "1.5px solid #cbd5e1",
                      backgroundColor: "#ffffff",
                      fontSize: "12.5px",
                      color: "#0f172a",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                borderRadius: "14px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#ffffff",
                padding: "24px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <div>
                  <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                    Agreement Clauses
                  </h2>
                  <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
                    Define standard contractual clauses and legal provisions.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddClause}
                  style={{
                    height: "34px",
                    padding: "0 14px",
                    borderRadius: "8px",
                    backgroundColor: "#faf5ff",
                    color: "#9333ea",
                    border: "1px solid #e9d5ff",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Plus style={{ width: "14px", height: "14px" }} />
                  <span>Add Clause</span>
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {clauses.map((clause, idx) => (
                  <div
                    key={clause.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      padding: "14px",
                      borderRadius: "10px",
                      backgroundColor: "#faf5ff",
                      border: "1px solid #e9d5ff",
                      borderLeft: `3px solid ${accentColor}`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                      <input
                        type="text"
                        placeholder="Clause Title (e.g. 1. Confidentiality)"
                        value={clause.title}
                        onChange={(e) => handleUpdateClause(clause.id, "title", e.target.value)}
                        style={{
                          flex: 1,
                          height: "34px",
                          padding: "0 10px",
                          borderRadius: "6px",
                          border: "1px solid #cbd5e1",
                          backgroundColor: "#ffffff",
                          fontSize: "12.5px",
                          fontWeight: 700,
                          color: "#0f172a",
                          outline: "none",
                        }}
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveClause(clause.id)}
                        disabled={clauses.length <= 1}
                        style={{
                          height: "32px",
                          padding: "0 10px",
                          borderRadius: "6px",
                          border: "1px solid #fee2e2",
                          backgroundColor: "#ffffff",
                          color: "#dc2626",
                          cursor: clauses.length <= 1 ? "not-allowed" : "pointer",
                          opacity: clauses.length <= 1 ? 0.4 : 1,
                          fontSize: "11px",
                          fontWeight: 600,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Trash2 style={{ width: "13px", height: "13px" }} />
                        <span>Remove</span>
                      </button>
                    </div>

                    <textarea
                      placeholder="Clause contractual provisions, rights, and covenants..."
                      value={clause.content}
                      onChange={(e) => handleUpdateClause(clause.id, "content", e.target.value)}
                      rows={3}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "6px",
                        border: "1px solid #cbd5e1",
                        backgroundColor: "#ffffff",
                        fontSize: "12px",
                        color: "#334155",
                        outline: "none",
                        lineHeight: 1.5,
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Action Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: "12px",
              paddingTop: "10px",
            }}
          >
            <Link
              href="/templates"
              style={{
                height: "40px",
                padding: "0 20px",
                borderRadius: "9px",
                border: "1.5px solid #cbd5e1",
                backgroundColor: "#ffffff",
                color: "#475569",
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                height: "40px",
                padding: "0 24px",
                borderRadius: "9px",
                backgroundColor: isSubmitting ? "#94a3b8" : "#2563eb",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 700,
                border: "none",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 1px 3px rgba(37,99,235,0.25)",
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} />
                  <span>Creating Template...</span>
                </>
              ) : (
                <>
                  <Save style={{ width: "16px", height: "16px" }} />
                  <span>Save & Create Template</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </OrgLayout>
  );
}

