"use client";

import React, { use, useState, useEffect, Suspense } from "react";
import Link from "next/link";
import OrgLayout from "@/components/OrgLayout";
import {
  Edit3,
  Download,
  Send,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Search,
  Maximize2,
  Expand,
  X,
} from "lucide-react";
import { getOrgDocumentById, getOrgBranding, OrgDocument } from "@/lib/orgStorage";

function PreviewContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const docId = resolvedParams.id;
  const branding = getOrgBranding();

  const foundDoc = getOrgDocumentById(docId);
  const isMou =
    foundDoc?.type?.toLowerCase() === "mou" ||
    docId.includes("mou") ||
    docId === "doc-4" ||
    docId === "doc-2";

  const doc: OrgDocument = foundDoc || {
    id: docId,
    docNumber: isMou ? "MOU-002" : "Q-001",
    title: isMou ? "Strategic Collaboration" : "Website Development",
    type: isMou ? "mou" : "quotation",
    customerName: isMou ? "Innovate India" : "Tech Solutions Pvt Ltd",
    customerAddress: isMou
      ? "BKC, Mumbai, Maharashtra"
      : "A-123, Sector 62, Noida, U.P. 201301",
    date: isMou ? "24-10-2026" : "28-10-2026",
    validTill: isMou ? "24-11-2026" : "28-11-2026",
    items: isMou
      ? []
      : [
          {
            id: "1",
            description: "Website Development",
            quantity: 1,
            unit: "Nos",
            rate: 25000,
            amount: 25000,
          },
          {
            id: "2",
            description: "Hosting Setup",
            quantity: 1,
            unit: "Nos",
            rate: 5000,
            amount: 5000,
          },
        ],
    clauses: [],
    subtotal: isMou ? 0 : 30000,
    taxRate: isMou ? 0 : 18,
    taxAmount: isMou ? 0 : 5400,
    discount: 0,
    total: isMou ? 0 : 35400,
    paymentTerms: isMou
      ? "Non-financial goodwill agreement"
      : "50% advance, 50% on delivery",
    notes: isMou ? "Signed in good faith." : "Thank you for your business.",
    status: isMou ? "Draft" : "Sent",
    createdAt: isMou ? "24 Oct 2026" : "28 Oct 2026",
    recipients: [],
  };

  const [zoom, setZoom] = useState<number>(100);
  const [isZoomMenuOpen, setIsZoomMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get("autoPrint") === "true" || sp.get("download") === "true") {
        const timer = setTimeout(() => {
          window.print();
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleDownload = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const zoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 150));
  };

  const zoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 70));
  };

  const editHref =
    doc.type?.toLowerCase() === "mou" ? "/mou/new" : "/quotations/new";

  return (
    <OrgLayout activePath="/my-documents">
      <div
        style={{
          width: "100%",
          maxWidth: isFullscreen ? "100%" : "1180px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          boxSizing: "border-box",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        }}
      >
        {/* ================= TOP HEADER BAR ================= */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "14px",
          }}
          className="no-print"
        >
          <div>
            <h1
              style={{
                fontSize: "20px",
                fontWeight: 800,
                color: "#0f172a",
                margin: 0,
                letterSpacing: "-0.3px",
              }}
            >
              Document Preview
            </h1>
            <p
              style={{
                fontSize: "12px",
                color: "#64748b",
                margin: "3px 0 0 0",
              }}
            >
              Review document exactly as the recipient will view it
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Send for Signature */}
            <Link
              href={`/documents/${doc.id}/send`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                padding: "8px 16px",
                backgroundColor: "#eff6ff",
                color: "#2563eb",
                border: "1px solid #bfdbfe",
                borderRadius: "8px",
                fontSize: "12.5px",
                fontWeight: 600,
                textDecoration: "none",
                transition: "all 0.15s ease",
              }}
            >
              <Send style={{ width: "13px", height: "13px" }} />
              <span>Send for Signature</span>
            </Link>

            {/* Edit */}
            <Link
              href={editHref}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                backgroundColor: "#ffffff",
                color: "#334155",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                fontSize: "12.5px",
                fontWeight: 600,
                textDecoration: "none",
                boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                transition: "all 0.15s ease",
              }}
            >
              <Edit3 style={{ width: "13px", height: "13px" }} />
              <span>Edit</span>
            </Link>

            {/* Download PDF */}
            <button
              type="button"
              onClick={handleDownload}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                padding: "8px 18px",
                backgroundColor: "#2563eb",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontSize: "12.5px",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(37,99,235,0.25)",
                transition: "background-color 0.15s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#1d4ed8")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#2563eb")
              }
            >
              <Download style={{ width: "14px", height: "14px" }} />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* ================= MAIN 2-COLUMN VIEWER ================= */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isFullscreen ? "1fr" : "1fr 200px",
            gap: "24px",
            alignItems: "start",
          }}
        >
          {/* LEFT: PDF VIEWER CONTAINER */}
          <div
            style={{
              backgroundColor: "#2e3b4e",
              borderRadius: "10px",
              overflow: "hidden",
              boxShadow: "0 4px 18px rgba(15, 23, 42, 0.12)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Dark Toolbar (Matching Image 2) */}
            <div
              className="no-print"
              style={{
                backgroundColor: "#2b3648",
                borderBottom: "1px solid #1e2638",
                padding: "7px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                color: "#cbd5e1",
                fontSize: "12.5px",
                userSelect: "none",
              }}
            >
              {/* Left Group: Page arrows, count, separator, zoom */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                  <button
                    type="button"
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#94a3b8",
                      cursor: "pointer",
                      padding: "4px",
                      borderRadius: "4px",
                      display: "flex",
                      alignItems: "center",
                    }}
                    title="Previous page"
                  >
                    <ChevronLeft style={{ width: "15px", height: "15px" }} />
                  </button>
                  <button
                    type="button"
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#94a3b8",
                      cursor: "pointer",
                      padding: "4px",
                      borderRadius: "4px",
                      display: "flex",
                      alignItems: "center",
                    }}
                    title="Next page"
                  >
                    <ChevronRight style={{ width: "15px", height: "15px" }} />
                  </button>
                </div>

                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#f1f5f9",
                    minWidth: "34px",
                    textAlign: "center",
                  }}
                >
                  1 / 1
                </span>

                <span style={{ color: "#475569" }}>|</span>

                {/* Zoom - and + */}
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <button
                    type="button"
                    onClick={zoomOut}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#cbd5e1",
                      cursor: "pointer",
                      padding: "4px 6px",
                      borderRadius: "4px",
                      display: "flex",
                      alignItems: "center",
                    }}
                    title="Zoom out"
                  >
                    <Minus style={{ width: "13px", height: "13px" }} />
                  </button>
                  <button
                    type="button"
                    onClick={zoomIn}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#cbd5e1",
                      cursor: "pointer",
                      padding: "4px 6px",
                      borderRadius: "4px",
                      display: "flex",
                      alignItems: "center",
                    }}
                    title="Zoom in"
                  >
                    <Plus style={{ width: "13px", height: "13px" }} />
                  </button>
                </div>

                {/* Zoom Dropdown */}
                <div style={{ position: "relative" }}>
                  <button
                    type="button"
                    onClick={() => setIsZoomMenuOpen(!isZoomMenuOpen)}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#f1f5f9",
                      fontSize: "12px",
                      fontWeight: 500,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "3px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    <span>{zoom}%</span>
                    <ChevronDown style={{ width: "11px", height: "11px", color: "#94a3b8" }} />
                  </button>

                  {isZoomMenuOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 4px)",
                        left: 0,
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "6px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                        padding: "4px 0",
                        zIndex: 40,
                        minWidth: "80px",
                      }}
                    >
                      {[75, 90, 100, 110, 125, 150].map((val) => (
                        <div
                          key={val}
                          onClick={() => {
                            setZoom(val);
                            setIsZoomMenuOpen(false);
                          }}
                          style={{
                            padding: "6px 12px",
                            fontSize: "11.5px",
                            color: zoom === val ? "#38bdf8" : "#cbd5e1",
                            fontWeight: zoom === val ? 700 : 400,
                            cursor: "pointer",
                          }}
                        >
                          {val}%
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Group: Search, fit width, expand */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setSearchOpen(!searchOpen)}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: searchOpen ? "#38bdf8" : "#cbd5e1",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                  }}
                  title="Search document"
                >
                  <Search style={{ width: "14px", height: "14px" }} />
                </button>

                <button
                  type="button"
                  onClick={() => setZoom(100)}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#cbd5e1",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                  }}
                  title="Fit to width"
                >
                  <Maximize2 style={{ width: "14px", height: "14px" }} />
                </button>

                <button
                  type="button"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#cbd5e1",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                  }}
                  title="Toggle full width"
                >
                  <Expand style={{ width: "14px", height: "14px" }} />
                </button>
              </div>
            </div>

            {/* Optional search input overlay */}
            {searchOpen && (
              <div
                style={{
                  backgroundColor: "#1e293b",
                  borderBottom: "1px solid #334155",
                  padding: "6px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Search style={{ width: "13px", height: "13px", color: "#94a3b8" }} />
                <input
                  type="text"
                  placeholder="Find in document..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    backgroundColor: "transparent",
                    border: "none",
                    outline: "none",
                    fontSize: "12px",
                    color: "#ffffff",
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchOpen(false);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#94a3b8",
                    cursor: "pointer",
                  }}
                >
                  <X style={{ width: "13px", height: "13px" }} />
                </button>
              </div>
            )}

            {/* Document Canvas Gray Area */}
            <div
              style={{
                backgroundColor: "#e2e8f0",
                padding: "36px 20px 48px 20px",
                overflowX: "auto",
                display: "flex",
                justifyContent: "center",
                minHeight: "720px",
              }}
            >
              {/* White A4 Sheet */}
              <div
                id="printable-a4-sheet"
                style={{
                  width: "100%",
                  maxWidth: "760px",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 8px 30px rgba(15, 23, 42, 0.15)",
                  padding: "48px 52px",
                  boxSizing: "border-box",
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: "top center",
                  transition: "transform 0.15s ease",
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                  color: "#0f172a",
                }}
              >
                {/* 1. Header (Acme Geometric Logo + Company details) */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    borderBottom: "1px solid #e2e8f0",
                    paddingBottom: "20px",
                  }}
                >
                  {/* Left: Geometric Blue Logo */}
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <svg
                      width="42"
                      height="42"
                      viewBox="0 0 38 38"
                      fill="none"
                      style={{ flexShrink: 0 }}
                    >
                      {/* Stylized sharp geometric "A" matching Image 2 */}
                      <path
                        d="M19 4L4 34H14.5L19 22L23.5 34H34L19 4Z"
                        fill="#2563eb"
                      />
                      <path
                        d="M19 4L23.5 34H34L19 4Z"
                        fill="#38bdf8"
                      />
                      <polygon
                        points="19,22 14.5,34 23.5,34"
                        fill="#1d4ed8"
                      />
                    </svg>

                    <div>
                      <h2
                        style={{
                          fontSize: "18px",
                          fontWeight: 900,
                          color: "#0f172a",
                          margin: 0,
                          letterSpacing: "0.5px",
                        }}
                      >
                        ACME
                      </h2>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#334155",
                          fontWeight: 500,
                          margin: "2px 0 0 0",
                        }}
                      >
                        Acme Technologies Pvt Ltd
                      </p>
                    </div>
                  </div>

                  {/* Right: Company Contact Info */}
                  <div
                    style={{
                      textAlign: "right",
                      fontSize: "11px",
                      color: "#64748b",
                      lineHeight: "1.45",
                    }}
                  >
                    <div style={{ fontWeight: 600, color: "#1e293b" }}>
                      Acme Technologies Pvt Ltd
                    </div>
                    <div>A-123, Sector 62, Noida, U.P. 201301</div>
                    <div>https://www.acme.com | contact@acme.com</div>
                    <div>+91 98765 43210</div>
                  </div>
                </div>

                {/* 2. Document Title & Numbers Block */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  {/* Left: Title */}
                  <div>
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#2563eb",
                        letterSpacing: "0.8px",
                        textTransform: "uppercase",
                      }}
                    >
                      {isMou ? "MOU" : "QUOTATION"}
                    </div>
                    <h1
                      style={{
                        fontSize: "24px",
                        fontWeight: 900,
                        color: "#0f172a",
                        margin: "2px 0 0 0",
                        letterSpacing: "-0.5px",
                      }}
                    >
                      QUOTATION
                    </h1>
                  </div>

                  {/* Right: Meta values */}
                  <div
                    style={{
                      textAlign: "right",
                      fontSize: "12px",
                      color: "#475569",
                      lineHeight: "1.6",
                    }}
                  >
                    <div>
                      <span>Quotation No: </span>
                      <strong style={{ color: "#0f172a" }}>{doc.docNumber}</strong>
                    </div>
                    <div>
                      <span>Date: </span>
                      <strong style={{ color: "#0f172a" }}>{doc.date}</strong>
                    </div>
                    <div>
                      <span>Valid Till: </span>
                      <strong style={{ color: "#0f172a" }}>{doc.validTill}</strong>
                    </div>
                  </div>
                </div>

                {/* 3. Bill To Box */}
                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      marginBottom: "4px",
                    }}
                  >
                    BILL TO:
                  </div>
                  <div
                    style={{
                      fontSize: "13.5px",
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    {doc.customerName || "Innovate India"}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#475569",
                      marginTop: "2px",
                    }}
                  >
                    {doc.customerAddress || "BKC, Mumbai, Maharashtra"}
                  </div>
                </div>

                {/* 4. Table */}
                <div style={{ marginTop: "4px" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "11.5px",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          backgroundColor: "#f0f7ff",
                          borderTop: "1px solid #e2e8f0",
                          borderBottom: "1px solid #e2e8f0",
                        }}
                      >
                        <th
                          style={{
                            padding: "8px 10px",
                            textAlign: "left",
                            fontWeight: 700,
                            color: "#1e293b",
                            width: "30px",
                          }}
                        >
                          #
                        </th>
                        <th
                          style={{
                            padding: "8px 10px",
                            textAlign: "left",
                            fontWeight: 700,
                            color: "#1e293b",
                          }}
                        >
                          DESCRIPTION
                        </th>
                        <th
                          style={{
                            padding: "8px 10px",
                            textAlign: "center",
                            fontWeight: 700,
                            color: "#1e293b",
                            width: "50px",
                          }}
                        >
                          QTY
                        </th>
                        <th
                          style={{
                            padding: "8px 10px",
                            textAlign: "center",
                            fontWeight: 700,
                            color: "#1e293b",
                            width: "60px",
                          }}
                        >
                          UNIT
                        </th>
                        <th
                          style={{
                            padding: "8px 10px",
                            textAlign: "right",
                            fontWeight: 700,
                            color: "#1e293b",
                            width: "85px",
                          }}
                        >
                          RATE (₹)
                        </th>
                        <th
                          style={{
                            padding: "8px 10px",
                            textAlign: "right",
                            fontWeight: 700,
                            color: "#1e293b",
                            width: "95px",
                          }}
                        >
                          AMOUNT (₹)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {doc.items && doc.items.length > 0 ? (
                        doc.items.map((it, idx) => (
                          <tr
                            key={it.id || idx}
                            style={{
                              borderBottom: "1px solid #f1f5f9",
                            }}
                          >
                            <td style={{ padding: "10px", color: "#64748b" }}>
                              {idx + 1}
                            </td>
                            <td
                              style={{
                                padding: "10px",
                                fontWeight: 600,
                                color: "#0f172a",
                              }}
                            >
                              {it.description}
                            </td>
                            <td style={{ padding: "10px", textAlign: "center" }}>
                              {it.quantity}
                            </td>
                            <td style={{ padding: "10px", textAlign: "center" }}>
                              {it.unit}
                            </td>
                            <td style={{ padding: "10px", textAlign: "right" }}>
                              {it.rate.toLocaleString("en-IN")}
                            </td>
                            <td
                              style={{
                                padding: "10px",
                                textAlign: "right",
                                fontWeight: 700,
                                color: "#0f172a",
                              }}
                            >
                              {it.amount.toLocaleString("en-IN")}
                            </td>
                          </tr>
                        ))
                      ) : (
                        /* Empty single row matching Image 2 */
                        <tr style={{ height: "42px", borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "10px" }} />
                          <td style={{ padding: "10px" }} />
                          <td style={{ padding: "10px" }} />
                          <td style={{ padding: "10px" }} />
                          <td style={{ padding: "10px" }} />
                          <td
                            style={{
                              padding: "10px",
                              textAlign: "right",
                              fontWeight: 600,
                              color: "#0f172a",
                            }}
                          >
                            ₹0
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {/* Summary Totals Area */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      marginTop: "4px",
                    }}
                  >
                    <div
                      style={{
                        width: "240px",
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "5px 10px",
                        fontSize: "12px",
                        color: "#475569",
                      }}
                    >
                      <span>Subtotal</span>
                      <span style={{ fontWeight: 600, color: "#0f172a" }}>
                        ₹{doc.subtotal.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div
                      style={{
                        width: "240px",
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "5px 10px",
                        fontSize: "12px",
                        color: "#475569",
                      }}
                    >
                      <span>GST ({doc.taxRate}%)</span>
                      <span style={{ fontWeight: 600, color: "#0f172a" }}>
                        ₹{doc.taxAmount.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* Total Row Banner Matching Image 2 */}
                    <div
                      style={{
                        width: "100%",
                        backgroundColor: "#f0f7ff",
                        borderTop: "1px solid #e2e8f0",
                        borderBottom: "1px solid #e2e8f0",
                        display: "flex",
                        justifyContent: "flex-end",
                        boxSizing: "border-box",
                        marginTop: "2px",
                      }}
                    >
                      <div
                        style={{
                          width: "240px",
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "8px 10px",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 800,
                            color: "#0f172a",
                          }}
                        >
                          Total
                        </span>
                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: 800,
                            color: "#2563eb",
                          }}
                        >
                          ₹{doc.total.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Terms & Notes */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "24px",
                    fontSize: "11.5px",
                    paddingTop: "6px",
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontWeight: 700,
                        color: "#0f172a",
                        display: "block",
                        marginBottom: "3px",
                      }}
                    >
                      Payment Terms:
                    </span>
                    <span style={{ color: "#475569" }}>{doc.paymentTerms}</span>
                  </div>

                  <div>
                    <span
                      style={{
                        fontWeight: 700,
                        color: "#0f172a",
                        display: "block",
                        marginBottom: "3px",
                      }}
                    >
                      Notes:
                    </span>
                    <span style={{ color: "#475569" }}>{doc.notes}</span>
                  </div>
                </div>

                {/* 6. Signatures */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    marginTop: "32px",
                    paddingTop: "12px",
                  }}
                >
                  {/* Left Signature */}
                  <div style={{ width: "220px" }}>
                    <div
                      style={{
                        fontFamily:
                          "'Brush Script MT', 'Dancing Script', 'Caveat', cursive",
                        fontSize: "22px",
                        color: "#0f172a",
                        paddingBottom: "2px",
                      }}
                    >
                      Rahul Sharma
                    </div>
                    <div
                      style={{
                        height: "1px",
                        backgroundColor: "#94a3b8",
                        marginBottom: "4px",
                      }}
                    />
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#475569",
                        fontWeight: 500,
                      }}
                    >
                      Authorized Signatory (Acme Technologies)
                    </div>
                  </div>

                  {/* Right Signature */}
                  <div style={{ width: "220px", textAlign: "right" }}>
                    <div
                      style={{
                        fontStyle: "italic",
                        fontSize: "13px",
                        color: "#94a3b8",
                        paddingBottom: "4px",
                      }}
                    >
                      Pending Signature
                    </div>
                    <div
                      style={{
                        height: "1px",
                        backgroundColor: "#cbd5e1",
                        marginBottom: "4px",
                      }}
                    />
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#64748b",
                        fontWeight: 500,
                      }}
                    >
                      Client Acceptance Signatory
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: DOCUMENT PAGES SIDEBAR */}
          {!isFullscreen && (
            <div
              className="no-print"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <h3
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#0f172a",
                  margin: 0,
                }}
              >
                Document Pages
              </h3>

              {/* Active Page Thumbnail */}
              <div
                style={{
                  border: "2px solid #2563eb",
                  borderRadius: "8px",
                  backgroundColor: "#ffffff",
                  padding: "8px",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(37,99,235,0.12)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  boxSizing: "border-box",
                }}
              >
                {/* Mini A4 Sheet */}
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "1 / 1.38",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "3px",
                    padding: "8px 6px",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    pointerEvents: "none",
                    overflow: "hidden",
                  }}
                >
                  {/* Mini Header */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: "0.5px solid #e2e8f0",
                      paddingBottom: "3px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                      <svg width="8" height="8" viewBox="0 0 38 38" fill="none">
                        <path d="M19 4L4 34H14.5L19 22L23.5 34H34L19 4Z" fill="#2563eb" />
                      </svg>
                      <span
                        style={{
                          fontSize: "5.5px",
                          fontWeight: 800,
                          color: "#0f172a",
                        }}
                      >
                        ACME
                      </span>
                    </div>
                    <span style={{ fontSize: "4.5px", color: "#94a3b8" }}>
                      {doc.docNumber}
                    </span>
                  </div>

                  {/* Mini title */}
                  <div style={{ margin: "3px 0" }}>
                    <div
                      style={{
                        fontSize: "4px",
                        fontWeight: 700,
                        color: "#2563eb",
                      }}
                    >
                      {isMou ? "MOU" : "QUOTATION"}
                    </div>
                    <div
                      style={{
                        fontSize: "6px",
                        fontWeight: 900,
                        color: "#0f172a",
                      }}
                    >
                      QUOTATION
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "4px",
                        color: "#64748b",
                        marginTop: "1px",
                      }}
                    >
                      <span>{doc.customerName || "Innovate India"}</span>
                      <span>{doc.date}</span>
                    </div>
                  </div>

                  {/* Mini Table Preview */}
                  <div
                    style={{
                      border: "0.5px solid #e2e8f0",
                      borderRadius: "1.5px",
                      overflow: "hidden",
                      margin: "2px 0",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "#f0f7ff",
                        height: "5px",
                        width: "100%",
                      }}
                    />
                    <div
                      style={{
                        height: "14px",
                        backgroundColor: "#ffffff",
                        width: "100%",
                      }}
                    />
                    <div
                      style={{
                        backgroundColor: "#eef6fc",
                        height: "5px",
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        paddingRight: "2px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "4px",
                          fontWeight: 700,
                          color: "#2563eb",
                        }}
                      >
                        ₹{doc.total}
                      </span>
                    </div>
                  </div>

                  {/* Mini Signatures */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "auto",
                      paddingTop: "2px",
                    }}
                  >
                    <div
                      style={{
                        width: "35%",
                        height: "0.5px",
                        backgroundColor: "#94a3b8",
                      }}
                    />
                    <div
                      style={{
                        width: "35%",
                        height: "0.5px",
                        backgroundColor: "#cbd5e1",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      textAlign: "right",
                      fontSize: "4px",
                      color: "#94a3b8",
                      marginTop: "1px",
                    }}
                  >
                    Total: ₹{doc.total.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Page Number (Matching Image 2: "1") */}
              <div
                style={{
                  textAlign: "center",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#2563eb",
                }}
              >
                1
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global CSS for Print Mode */}
      <style jsx global>{`
        @media print {
          body {
            background-color: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print,
          header,
          aside,
          nav {
            display: none !important;
          }
          #printable-a4-sheet {
            box-shadow: none !important;
            border: none !important;
            padding: 20mm !important;
            max-width: 100% !important;
            width: 100% !important;
            transform: none !important;
          }
        }
      `}</style>
    </OrgLayout>
  );
}

export default function DocumentPreviewPage(props: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div
          style={{
            padding: "32px",
            textAlign: "center",
            color: "#64748b",
            fontSize: "14px",
          }}
        >
          Loading document preview...
        </div>
      }
    >
      <PreviewContent params={props.params} />
    </Suspense>
  );
}
