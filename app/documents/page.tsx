"use client";

import React, { useState } from "react";
import Link from "next/link";
import OrgLayout from "@/components/OrgLayout";

export default function CreateNewDocumentPage() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  return (
    <OrgLayout activePath="/dashboard">
      <div
        style={{
          width: "100%",
          maxWidth: "1000px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          boxSizing: "border-box",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        }}
      >
        {/* ================= PAGE HEADER ================= */}
        <div>
          <h1
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#0f172a",
              margin: 0,
              letterSpacing: "-0.3px",
              lineHeight: 1.2,
            }}
          >
            Create New Document
          </h1>
          <p
            style={{
              fontSize: "13px",
              fontWeight: 400,
              color: "#64748b",
              margin: "3px 0 0 0",
            }}
          >
            Choose the document type and start creating.
          </p>
        </div>

        {/* ================= TWO PRIMARY CHOICE CARDS ================= */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "18px",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {/* Card 1: Quotation */}
          <div
            onMouseEnter={() => setHoveredCard("quotation")}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "14px",
              border: "1px solid #eef2f6",
              boxShadow:
                hoveredCard === "quotation"
                  ? "0 6px 20px rgba(37, 99, 235, 0.08)"
                  : "0 1px 4px rgba(15, 23, 42, 0.03)",
              padding: "26px 24px 22px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              transition: "all 0.15s ease",
              boxSizing: "border-box",
            }}
          >
            {/* Circle Icon Container */}
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                backgroundColor: "#eff6ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "12px",
                boxShadow: "0 2px 5px rgba(37, 99, 235, 0.08)",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2563eb"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ width: "24px", height: "24px" }}
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>

            {/* Title */}
            <h2
              style={{
                fontSize: "16.5px",
                fontWeight: 700,
                color: "#0f172a",
                margin: "0 0 5px 0",
                letterSpacing: "-0.2px",
              }}
            >
              Quotation
            </h2>

            {/* Subtitle */}
            <p
              style={{
                fontSize: "12.5px",
                fontWeight: 400,
                color: "#64748b",
                margin: "0 0 18px 0",
                maxWidth: "290px",
                lineHeight: "1.45",
              }}
            >
              Create a professional quotation with items, pricing, taxes and
              terms.
            </p>

            {/* Primary Action Button */}
            <Link
              href="/quotations/new"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                maxWidth: "210px",
                padding: "9px 20px",
                backgroundColor: "#2563eb",
                color: "#ffffff",
                borderRadius: "8px",
                fontSize: "12.5px",
                fontWeight: 600,
                textDecoration: "none",
                boxShadow: "0 2px 6px rgba(37, 99, 235, 0.22)",
                transition: "background-color 0.15s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#1d4ed8")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#2563eb")
              }
            >
              Create Quotation
            </Link>
          </div>

          {/* Card 2: Memorandum of Understanding */}
          <div
            onMouseEnter={() => setHoveredCard("mou")}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "14px",
              border: "1px solid #eef2f6",
              boxShadow:
                hoveredCard === "mou"
                  ? "0 6px 20px rgba(147, 51, 234, 0.08)"
                  : "0 1px 4px rgba(15, 23, 42, 0.03)",
              padding: "26px 24px 22px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              transition: "all 0.15s ease",
              boxSizing: "border-box",
            }}
          >
            {/* Circle Icon Container */}
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                backgroundColor: "#f5f3ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "12px",
                boxShadow: "0 2px 5px rgba(147, 51, 234, 0.08)",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9333ea"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ width: "24px", height: "24px" }}
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>

            {/* Title */}
            <h2
              style={{
                fontSize: "16.5px",
                fontWeight: 700,
                color: "#0f172a",
                margin: "0 0 5px 0",
                letterSpacing: "-0.2px",
              }}
            >
              Memorandum of Understanding
            </h2>

            {/* Subtitle */}
            <p
              style={{
                fontSize: "12.5px",
                fontWeight: 400,
                color: "#64748b",
                margin: "0 0 18px 0",
                maxWidth: "290px",
                lineHeight: "1.45",
              }}
            >
              Create an MOU with customizable clauses and signatories.
            </p>

            {/* Outlined Action Button */}
            <Link
              href="/mou/new"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                maxWidth: "210px",
                padding: "9px 20px",
                backgroundColor: "#ffffff",
                color: "#2563eb",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                fontSize: "12.5px",
                fontWeight: 600,
                textDecoration: "none",
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
            >
              Create MOU
            </Link>
          </div>
        </div>

        {/* ================= BOTTOM SECTION: OR USE A TEMPLATE ================= */}
        <div style={{ marginTop: "4px", width: "100%", boxSizing: "border-box" }}>
          {/* Header Row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <h3
              style={{
                fontSize: "13.5px",
                fontWeight: 700,
                color: "#0f172a",
                margin: 0,
              }}
            >
              Or use a template
            </h3>
            <Link
              href="/templates"
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#2563eb",
                textDecoration: "none",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.textDecoration = "underline")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.textDecoration = "none")
              }
            >
              View All Templates
            </Link>
          </div>

          {/* 4 A4 Preview Cards Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "16px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {/* Template 1: Standard Quotation */}
            <Link
              href="/quotations/new?tmpl=standard"
              onMouseEnter={() => setHoveredTemplate("t1")}
              onMouseLeave={() => setHoveredTemplate(null)}
              style={{
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              {/* A4 Sheet Thumbnail */}
              <div
                style={{
                  width: "100%",
                  height: "145px",
                  backgroundColor: "#ffffff",
                  borderRadius: "6px",
                  border:
                    hoveredTemplate === "t1"
                      ? "1px solid #3b82f6"
                      : "1px solid #cbd5e1",
                  boxShadow:
                    hoveredTemplate === "t1"
                      ? "0 4px 12px rgba(37, 99, 235, 0.12)"
                      : "0 1px 4px rgba(15, 23, 42, 0.04)",
                  padding: "10px 10px",
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                  transition: "all 0.15s ease",
                  transform:
                    hoveredTemplate === "t1" ? "translateY(-2px)" : "none",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Header bar */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1.5px solid #2563eb",
                    paddingBottom: "4px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <div
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "2px",
                        backgroundColor: "#2563eb",
                      }}
                    />
                    <div
                      style={{
                        width: "32px",
                        height: "4px",
                        borderRadius: "2px",
                        backgroundColor: "#1e293b",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      width: "24px",
                      height: "3.5px",
                      borderRadius: "2px",
                      backgroundColor: "#94a3b8",
                    }}
                  />
                </div>

                {/* Client info lines */}
                <div style={{ display: "flex", flexDirection: "column", gap: "2.5px" }}>
                  <div
                    style={{
                      width: "42px",
                      height: "3px",
                      borderRadius: "1.5px",
                      backgroundColor: "#cbd5e1",
                    }}
                  />
                  <div
                    style={{
                      width: "56px",
                      height: "2.5px",
                      borderRadius: "1px",
                      backgroundColor: "#e2e8f0",
                    }}
                  />
                </div>

                {/* Table representation */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "2.5px",
                    marginTop: "2px",
                    borderTop: "1px solid #f1f5f9",
                    paddingTop: "3px",
                  }}
                >
                  {/* Table Header */}
                  <div
                    style={{
                      height: "7px",
                      backgroundColor: "#eff6ff",
                      borderRadius: "2px",
                      display: "flex",
                      alignItems: "center",
                      padding: "0 3px",
                      gap: "3px",
                    }}
                  >
                    <div
                      style={{
                        flex: 2,
                        height: "2.5px",
                        backgroundColor: "#93c5fd",
                        borderRadius: "1px",
                      }}
                    />
                    <div
                      style={{
                        flex: 1,
                        height: "2.5px",
                        backgroundColor: "#93c5fd",
                        borderRadius: "1px",
                      }}
                    />
                    <div
                      style={{
                        flex: 1,
                        height: "2.5px",
                        backgroundColor: "#93c5fd",
                        borderRadius: "1px",
                      }}
                    />
                  </div>
                  {/* Row 1 */}
                  <div
                    style={{
                      height: "6px",
                      display: "flex",
                      alignItems: "center",
                      padding: "0 3px",
                      gap: "3px",
                      borderBottom: "1px solid #f8fafc",
                    }}
                  >
                    <div
                      style={{
                        flex: 2,
                        height: "2.5px",
                        backgroundColor: "#cbd5e1",
                        borderRadius: "1px",
                      }}
                    />
                    <div
                      style={{
                        flex: 1,
                        height: "2.5px",
                        backgroundColor: "#e2e8f0",
                        borderRadius: "1px",
                      }}
                    />
                    <div
                      style={{
                        flex: 1,
                        height: "2.5px",
                        backgroundColor: "#cbd5e1",
                        borderRadius: "1px",
                      }}
                    />
                  </div>
                  {/* Row 2 */}
                  <div
                    style={{
                      height: "6px",
                      display: "flex",
                      alignItems: "center",
                      padding: "0 3px",
                      gap: "3px",
                    }}
                  >
                    <div
                      style={{
                        flex: 2,
                        height: "2.5px",
                        backgroundColor: "#cbd5e1",
                        borderRadius: "1px",
                      }}
                    />
                    <div
                      style={{
                        flex: 1,
                        height: "2.5px",
                        backgroundColor: "#e2e8f0",
                        borderRadius: "1px",
                      }}
                    />
                    <div
                      style={{
                        flex: 1,
                        height: "2.5px",
                        backgroundColor: "#cbd5e1",
                        borderRadius: "1px",
                      }}
                    />
                  </div>
                </div>

                {/* Total Box & Signature */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    marginTop: "auto",
                    paddingTop: "3px",
                    borderTop: "1px dashed #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      width: "24px",
                      height: "2px",
                      backgroundColor: "#cbd5e1",
                    }}
                  />
                  <div
                    style={{
                      width: "32px",
                      height: "8px",
                      backgroundColor: "#eff6ff",
                      border: "1px solid #bfdbfe",
                      borderRadius: "2px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "20px",
                        height: "2.5px",
                        backgroundColor: "#2563eb",
                        borderRadius: "1px",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Label */}
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#334155",
                  marginTop: "6px",
                  textAlign: "center",
                }}
              >
                Standard Quotation
              </span>
            </Link>

            {/* Template 2: Service Quotation */}
            <Link
              href="/quotations/new?tmpl=service"
              onMouseEnter={() => setHoveredTemplate("t2")}
              onMouseLeave={() => setHoveredTemplate(null)}
              style={{
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              {/* A4 Sheet Thumbnail */}
              <div
                style={{
                  width: "100%",
                  height: "145px",
                  backgroundColor: "#ffffff",
                  borderRadius: "6px",
                  border:
                    hoveredTemplate === "t2"
                      ? "1px solid #3b82f6"
                      : "1px solid #cbd5e1",
                  boxShadow:
                    hoveredTemplate === "t2"
                      ? "0 4px 12px rgba(37, 99, 235, 0.12)"
                      : "0 1px 4px rgba(15, 23, 42, 0.04)",
                  padding: "10px 10px",
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                  transition: "all 0.15s ease",
                  transform:
                    hoveredTemplate === "t2" ? "translateY(-2px)" : "none",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Header bar */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1.5px solid #0284c7",
                    paddingBottom: "4px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <div
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        backgroundColor: "#0284c7",
                      }}
                    />
                    <div
                      style={{
                        width: "34px",
                        height: "4px",
                        borderRadius: "2px",
                        backgroundColor: "#1e293b",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      width: "22px",
                      height: "3.5px",
                      borderRadius: "2px",
                      backgroundColor: "#94a3b8",
                    }}
                  />
                </div>

                {/* Scope statement */}
                <div style={{ display: "flex", flexDirection: "column", gap: "2.5px" }}>
                  <div
                    style={{
                      width: "80%",
                      height: "2.5px",
                      borderRadius: "1px",
                      backgroundColor: "#cbd5e1",
                    }}
                  />
                  <div
                    style={{
                      width: "90%",
                      height: "2.5px",
                      borderRadius: "1px",
                      backgroundColor: "#e2e8f0",
                    }}
                  />
                </div>

                {/* Milestones / Service items */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "3px",
                    marginTop: "2px",
                  }}
                >
                  <div
                    style={{
                      height: "8px",
                      backgroundColor: "#f0f9ff",
                      borderRadius: "1.5px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0 3px",
                    }}
                  >
                    <div
                      style={{
                        width: "30px",
                        height: "2.5px",
                        backgroundColor: "#0369a1",
                        borderRadius: "1px",
                      }}
                    />
                    <div
                      style={{
                        width: "14px",
                        height: "2.5px",
                        backgroundColor: "#0284c7",
                        borderRadius: "1px",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      height: "8px",
                      backgroundColor: "#f8fafc",
                      borderRadius: "1.5px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0 3px",
                    }}
                  >
                    <div
                      style={{
                        width: "38px",
                        height: "2.5px",
                        backgroundColor: "#64748b",
                        borderRadius: "1px",
                      }}
                    />
                    <div
                      style={{
                        width: "14px",
                        height: "2.5px",
                        backgroundColor: "#64748b",
                        borderRadius: "1px",
                      }}
                    />
                  </div>
                </div>

                {/* Bottom Signature Line */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    marginTop: "auto",
                    paddingTop: "3px",
                    borderTop: "1px dashed #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      width: "28px",
                      height: "2px",
                      backgroundColor: "#cbd5e1",
                    }}
                  />
                  <div
                    style={{
                      width: "24px",
                      height: "2px",
                      backgroundColor: "#0284c7",
                    }}
                  />
                </div>
              </div>

              {/* Label */}
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#334155",
                  marginTop: "6px",
                  textAlign: "center",
                }}
              >
                Service Quotation
              </span>
            </Link>

            {/* Template 3: IT Project Quotation */}
            <Link
              href="/quotations/new?tmpl=it-project"
              onMouseEnter={() => setHoveredTemplate("t3")}
              onMouseLeave={() => setHoveredTemplate(null)}
              style={{
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              {/* A4 Sheet Thumbnail */}
              <div
                style={{
                  width: "100%",
                  height: "145px",
                  backgroundColor: "#ffffff",
                  borderRadius: "6px",
                  border:
                    hoveredTemplate === "t3"
                      ? "1px solid #3b82f6"
                      : "1px solid #cbd5e1",
                  boxShadow:
                    hoveredTemplate === "t3"
                      ? "0 4px 12px rgba(37, 99, 235, 0.12)"
                      : "0 1px 4px rgba(15, 23, 42, 0.04)",
                  padding: "10px 10px",
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                  transition: "all 0.15s ease",
                  transform:
                    hoveredTemplate === "t3" ? "translateY(-2px)" : "none",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Header bar */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1.5px solid #3b82f6",
                    paddingBottom: "4px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <div
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "2px",
                        backgroundColor: "#3b82f6",
                      }}
                    />
                    <div
                      style={{
                        width: "38px",
                        height: "4px",
                        borderRadius: "2px",
                        backgroundColor: "#1e293b",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      width: "20px",
                      height: "3.5px",
                      borderRadius: "2px",
                      backgroundColor: "#94a3b8",
                    }}
                  />
                </div>

                {/* SOW & Tech paragraphs */}
                <div style={{ display: "flex", flexDirection: "column", gap: "2.5px" }}>
                  <div
                    style={{
                      width: "88%",
                      height: "2.5px",
                      borderRadius: "1px",
                      backgroundColor: "#cbd5e1",
                    }}
                  />
                  <div
                    style={{
                      width: "82%",
                      height: "2.5px",
                      borderRadius: "1px",
                      backgroundColor: "#e2e8f0",
                    }}
                  />
                </div>

                {/* Deliverables modules representation */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "3px",
                    marginTop: "2px",
                  }}
                >
                  <div
                    style={{
                      height: "6px",
                      backgroundColor: "#eff6ff",
                      borderRadius: "1px",
                      display: "flex",
                      alignItems: "center",
                      padding: "0 3px",
                      gap: "3px",
                    }}
                  >
                    <div
                      style={{
                        width: "20px",
                        height: "2.5px",
                        backgroundColor: "#3b82f6",
                        borderRadius: "1px",
                      }}
                    />
                    <div
                      style={{
                        width: "36px",
                        height: "2px",
                        backgroundColor: "#93c5fd",
                        borderRadius: "1px",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      height: "6px",
                      backgroundColor: "#f8fafc",
                      borderRadius: "1px",
                      display: "flex",
                      alignItems: "center",
                      padding: "0 3px",
                      gap: "3px",
                    }}
                  >
                    <div
                      style={{
                        width: "20px",
                        height: "2.5px",
                        backgroundColor: "#64748b",
                        borderRadius: "1px",
                      }}
                    />
                    <div
                      style={{
                        width: "40px",
                        height: "2px",
                        backgroundColor: "#cbd5e1",
                        borderRadius: "1px",
                      }}
                    />
                  </div>
                </div>

                {/* Bottom Signature Line */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    marginTop: "auto",
                    paddingTop: "3px",
                    borderTop: "1px dashed #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      width: "28px",
                      height: "2px",
                      backgroundColor: "#cbd5e1",
                    }}
                  />
                  <div
                    style={{
                      width: "20px",
                      height: "5px",
                      borderRadius: "1.5px",
                      backgroundColor: "#bfdbfe",
                    }}
                  />
                </div>
              </div>

              {/* Label */}
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#334155",
                  marginTop: "6px",
                  textAlign: "center",
                }}
              >
                IT Project Quotation
              </span>
            </Link>

            {/* Template 4: Partnership MOU */}
            <Link
              href="/mou/new?tmpl=partnership"
              onMouseEnter={() => setHoveredTemplate("t4")}
              onMouseLeave={() => setHoveredTemplate(null)}
              style={{
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              {/* A4 Sheet Thumbnail */}
              <div
                style={{
                  width: "100%",
                  height: "145px",
                  backgroundColor: "#ffffff",
                  borderRadius: "6px",
                  border:
                    hoveredTemplate === "t4"
                      ? "1px solid #9333ea"
                      : "1px solid #cbd5e1",
                  boxShadow:
                    hoveredTemplate === "t4"
                      ? "0 4px 12px rgba(147, 51, 234, 0.12)"
                      : "0 1px 4px rgba(15, 23, 42, 0.04)",
                  padding: "10px 10px",
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                  transition: "all 0.15s ease",
                  transform:
                    hoveredTemplate === "t4" ? "translateY(-2px)" : "none",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Header bar */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    borderBottom: "1.5px solid #9333ea",
                    paddingBottom: "4px",
                    gap: "2.5px",
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "4px",
                      borderRadius: "2px",
                      backgroundColor: "#581c87",
                    }}
                  />
                  <div
                    style={{
                      width: "30px",
                      height: "2.5px",
                      borderRadius: "1px",
                      backgroundColor: "#a855f7",
                    }}
                  />
                </div>

                {/* Recitals / Whereas lines */}
                <div style={{ display: "flex", flexDirection: "column", gap: "2.5px" }}>
                  <div
                    style={{
                      width: "26px",
                      height: "3px",
                      borderRadius: "1px",
                      backgroundColor: "#9333ea",
                    }}
                  />
                  <div
                    style={{
                      width: "90%",
                      height: "2.5px",
                      borderRadius: "1px",
                      backgroundColor: "#cbd5e1",
                    }}
                  />
                  <div
                    style={{
                      width: "82%",
                      height: "2.5px",
                      borderRadius: "1px",
                      backgroundColor: "#e2e8f0",
                    }}
                  />
                </div>

                {/* Section Clause 1 */}
                <div style={{ display: "flex", flexDirection: "column", gap: "2.5px" }}>
                  <div
                    style={{
                      width: "30px",
                      height: "3px",
                      borderRadius: "1px",
                      backgroundColor: "#9333ea",
                    }}
                  />
                  <div
                    style={{
                      width: "92%",
                      height: "2.5px",
                      borderRadius: "1px",
                      backgroundColor: "#cbd5e1",
                    }}
                  />
                </div>

                {/* Double Signatory Lines at Bottom */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    marginTop: "auto",
                    paddingTop: "3px",
                    borderTop: "1px dashed #e2e8f0",
                  }}
                >
                  {/* Party 1 */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.5px" }}>
                    <div
                      style={{
                        width: "24px",
                        height: "2px",
                        backgroundColor: "#9333ea",
                      }}
                    />
                    <div
                      style={{
                        width: "16px",
                        height: "1.5px",
                        backgroundColor: "#cbd5e1",
                      }}
                    />
                  </div>
                  {/* Party 2 */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1.5px",
                      alignItems: "flex-end",
                    }}
                  >
                    <div
                      style={{
                        width: "24px",
                        height: "2px",
                        backgroundColor: "#9333ea",
                      }}
                    />
                    <div
                      style={{
                        width: "16px",
                        height: "1.5px",
                        backgroundColor: "#cbd5e1",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Label */}
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#334155",
                  marginTop: "6px",
                  textAlign: "center",
                }}
              >
                Partnership MOU
              </span>
            </Link>
          </div>
        </div>
      </div>
    </OrgLayout>
  );
}
