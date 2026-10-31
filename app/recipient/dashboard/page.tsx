"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import RecipientLayout from "@/components/RecipientLayout";
import {
  FileText,
  Clock,
  CheckCircle2,
  Plus,
  MoreVertical,
  X,
  Eye,
  Download,
  PenTool,
  ChevronDown,
  Trash2,
  ExternalLink,
} from "lucide-react";

interface RecentDoc {
  id: string;
  docNumber: string;
  title: string;
  type: "Quotation" | "MOU";
  recipient: string;
  status: "Sent" | "Signed" | "Pending" | "Draft";
  lastUpdated: string;
}

const INITIAL_DOCUMENTS: RecentDoc[] = [
  {
    id: "doc-1",
    docNumber: "Q-001",
    title: "Website Development",
    type: "Quotation",
    recipient: "Tech Solutions Pvt Ltd",
    status: "Sent",
    lastUpdated: "28 Oct 2026",
  },
  {
    id: "doc-2",
    docNumber: "MOU-001",
    title: "Partnership Agreement",
    type: "MOU",
    recipient: "Global Systems",
    status: "Signed",
    lastUpdated: "26 Oct 2026",
  },
  {
    id: "doc-3",
    docNumber: "Q-002",
    title: "IT Support Services",
    type: "Quotation",
    recipient: "NextGen Digital",
    status: "Pending",
    lastUpdated: "25 Oct 2026",
  },
  {
    id: "doc-4",
    docNumber: "MOU-002",
    title: "Strategic Collaboration",
    type: "MOU",
    recipient: "Innovate India",
    status: "Draft",
    lastUpdated: "24 Oct 2026",
  },
];

// 31 days data for October activity chart matching screenshot pattern exactly
const ACTIVITY_DATA = [
  { day: 1, quotations: 35, mous: 15 },
  { day: 2, quotations: 45, mous: 20 },
  { day: 3, quotations: 65, mous: 25 },
  { day: 4, quotations: 75, mous: 30 },
  { day: 5, quotations: 85, mous: 45 },
  { day: 6, quotations: 130, mous: 75 },
  { day: 7, quotations: 80, mous: 40 },
  { day: 8, quotations: 50, mous: 25 },
  { day: 9, quotations: 65, mous: 35 },
  { day: 10, quotations: 105, mous: 55 },
  { day: 11, quotations: 90, mous: 50 },
  { day: 12, quotations: 60, mous: 30 },
  { day: 13, quotations: 110, mous: 55 },
  { day: 14, quotations: 30, mous: 15 },
  { day: 15, quotations: 70, mous: 40 },
  { day: 16, quotations: 125, mous: 70 },
  { day: 17, quotations: 165, mous: 90 }, // Peak (~255)
  { day: 18, quotations: 110, mous: 60 },
  { day: 19, quotations: 100, mous: 60 },
  { day: 20, quotations: 75, mous: 40 },
  { day: 21, quotations: 55, mous: 30 },
  { day: 22, quotations: 70, mous: 35 },
  { day: 23, quotations: 90, mous: 45 },
  { day: 24, quotations: 70, mous: 40 },
  { day: 25, quotations: 110, mous: 60 },
  { day: 26, quotations: 45, mous: 20 },
  { day: 27, quotations: 60, mous: 35 },
  { day: 28, quotations: 35, mous: 15 },
  { day: 29, quotations: 40, mous: 20 },
  { day: 30, quotations: 105, mous: 55 },
  { day: 31, quotations: 115, mous: 65 },
];

export default function RecipientDashboardPage() {
  const [documents, setDocuments] = useState<RecentDoc[]>(INITIAL_DOCUMENTS);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<"Quotation" | "MOU">("Quotation");
  const [newRecipient, setNewRecipient] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const [chartPeriod, setChartPeriod] = useState("This Month");
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);

  const [userName, setUserName] = useState("John");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const signer = localStorage.getItem("vorldx_signer_name");
      if (signer) {
        setUserName(signer.split(" ")[0]);
      }

      const handleGlobalClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest("[data-doc-menu]")) {
          setActiveMenuId(null);
        }
        if (!target.closest("[data-period-menu]")) {
          setIsPeriodOpen(false);
        }
      };
      window.addEventListener("click", handleGlobalClick);
      return () => window.removeEventListener("click", handleGlobalClick);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDownloadPDF = (doc: RecentDoc) => {
    setActiveMenuId(null);
    showToast(`Downloading PDF for ${doc.docNumber}...`);
    if (typeof window !== "undefined") {
      const w = window.open(`/preview/${doc.id}?autoPrint=true`, "_blank");
      if (w) w.focus();
    }
  };

  const handleDelete = (doc: RecentDoc) => {
    setActiveMenuId(null);
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    showToast(`Removed ${doc.docNumber} from view`);
  };

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    const newDoc: RecentDoc = {
      id: `doc-${Date.now()}`,
      docNumber:
        newType === "Quotation"
          ? `Q-00${documents.length + 1}`
          : `MOU-00${documents.length + 1}`,
      title: newTitle || "New Service Document",
      type: newType,
      recipient: newRecipient || "Tech Solutions Pvt Ltd",
      status: "Draft",
      lastUpdated: "Just now",
    };
    setDocuments([newDoc, ...documents]);
    setIsCreateOpen(false);
    setNewTitle("");
    setNewRecipient("");
    showToast(`Created document #${newDoc.docNumber} successfully!`);
  };

  const getStatusBadgeStyle = (status: RecentDoc["status"]) => {
    switch (status) {
      case "Sent":
        return {
          backgroundColor: "#eff6ff",
          color: "#2563eb",
        };
      case "Signed":
        return {
          backgroundColor: "#dcfce7",
          color: "#16a34a",
        };
      case "Pending":
        return {
          backgroundColor: "#fef3c7",
          color: "#d97706",
        };
      case "Draft":
        return {
          backgroundColor: "#f1f5f9",
          color: "#475569",
        };
    }
  };

  return (
    <RecipientLayout activePath="/recipient/dashboard">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "28px",
            right: "28px",
            backgroundColor: "#0f172a",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            zIndex: 9999,
          }}
        >
          <CheckCircle2 style={{ width: "16px", height: "16px", color: "#4ade80" }} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div
        style={{
          width: "100%",
          maxWidth: "1140px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          boxSizing: "border-box",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        }}
      >
        {/* ================= 1. GREETING & HEADER ================= */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: 800,
                color: "#0f172a",
                margin: 0,
                letterSpacing: "-0.4px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              Good Morning, {userName}! 👋
            </h1>
            <p
              style={{
                fontSize: "13.5px",
                fontWeight: 400,
                color: "#64748b",
                margin: "4px 0 0 0",
              }}
            >
              Here&apos;s what&apos;s happening in VorldX Technologies.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 22px",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              fontSize: "13.5px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#1d4ed8")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#2563eb")
            }
          >
            <Plus style={{ width: "17px", height: "17px", strokeWidth: 2.5 }} />
            <span>Create Document</span>
          </button>
        </div>

        {/* ================= 2. FOUR TOP METRIC CARDS ================= */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "18px",
          }}
        >
          {/* Card 1: Total Documents (24) */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #eef2f6",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
              padding: "20px 22px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                backgroundColor: "#eff6ff",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <FileText style={{ width: "24px", height: "24px" }} />
            </div>
            <div>
              <span
                style={{
                  fontSize: "26px",
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: 1,
                  display: "block",
                }}
              >
                24
              </span>
              <span
                style={{
                  fontSize: "12.5px",
                  fontWeight: 500,
                  color: "#64748b",
                  marginTop: "5px",
                  display: "block",
                }}
              >
                Total Documents
              </span>
            </div>
          </div>

          {/* Card 2: Pending for Signature (12) */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #eef2f6",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
              padding: "20px 22px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                backgroundColor: "#fef3c7",
                color: "#d97706",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <PenTool style={{ width: "22px", height: "22px" }} />
            </div>
            <div>
              <span
                style={{
                  fontSize: "26px",
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: 1,
                  display: "block",
                }}
              >
                12
              </span>
              <span
                style={{
                  fontSize: "12.5px",
                  fontWeight: 500,
                  color: "#64748b",
                  marginTop: "5px",
                  display: "block",
                }}
              >
                Pending for Signature
              </span>
            </div>
          </div>

          {/* Card 3: Signed (10) */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #eef2f6",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
              padding: "20px 22px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                backgroundColor: "#dcfce7",
                color: "#16a34a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <CheckCircle2 style={{ width: "24px", height: "24px" }} />
            </div>
            <div>
              <span
                style={{
                  fontSize: "26px",
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: 1,
                  display: "block",
                }}
              >
                10
              </span>
              <span
                style={{
                  fontSize: "12.5px",
                  fontWeight: 500,
                  color: "#64748b",
                  marginTop: "5px",
                  display: "block",
                }}
              >
                Signed
              </span>
            </div>
          </div>

          {/* Card 4: Expired (2) */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #eef2f6",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
              padding: "20px 22px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                backgroundColor: "#fee2e2",
                color: "#dc2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Clock style={{ width: "24px", height: "24px" }} />
            </div>
            <div>
              <span
                style={{
                  fontSize: "26px",
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: 1,
                  display: "block",
                }}
              >
                2
              </span>
              <span
                style={{
                  fontSize: "12.5px",
                  fontWeight: 500,
                  color: "#64748b",
                  marginTop: "5px",
                  display: "block",
                }}
              >
                Expired
              </span>
            </div>
          </div>
        </div>

        {/* ================= 3. TWO CHARTS ROW ================= */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.65fr 1fr",
            gap: "18px",
          }}
        >
          {/* LEFT: Document Activity Stacked Bar Chart */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "18px",
              border: "1px solid #eef2f6",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              boxSizing: "border-box",
            }}
          >
            {/* Header: Title + Legends + Period Dropdown */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <h2
                style={{
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#0f172a",
                  margin: 0,
                }}
              >
                Document Activity
              </h2>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                {/* Legends */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "18px",
                    fontSize: "13px",
                    color: "#1e293b",
                    fontWeight: 500,
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "#1e293b",
                    }}
                  >
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "#2563eb",
                        display: "inline-block",
                      }}
                    />
                    Quotations
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "#1e293b",
                    }}
                  >
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "#60a5fa",
                        display: "inline-block",
                      }}
                    />
                    MOUs
                  </span>
                </div>

                {/* Period Select Dropdown */}
                <div style={{ position: "relative" }} data-period-menu="true">
                  <div
                    onClick={() => setIsPeriodOpen(!isPeriodOpen)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "6px 14px",
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "13px",
                      color: "#1e293b",
                      fontWeight: 500,
                      cursor: "pointer",
                      userSelect: "none",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f1f5f9")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f8fafc")
                    }
                  >
                    <span>{chartPeriod}</span>
                    <ChevronDown
                      style={{
                        width: "13px",
                        height: "13px",
                        color: "#64748b",
                        transform: isPeriodOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.15s ease",
                      }}
                    />
                  </div>

                  {/* Dropdown Popover */}
                  {isPeriodOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 4px)",
                        right: 0,
                        backgroundColor: "#ffffff",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 16px rgba(15,23,42,0.12)",
                        zIndex: 30,
                        minWidth: "140px",
                        overflow: "hidden",
                        padding: "4px 0",
                      }}
                    >
                      {[
                        "This Month",
                        "Last Month",
                        "Last 3 Months",
                        "This Year",
                        "All Time",
                      ].map((period) => (
                        <div
                          key={period}
                          onClick={() => {
                            setChartPeriod(period);
                            setIsPeriodOpen(false);
                            showToast(`Filtered activity by ${period}`);
                          }}
                          style={{
                            padding: "8px 14px",
                            fontSize: "12.5px",
                            fontWeight: chartPeriod === period ? 600 : 500,
                            color: chartPeriod === period ? "#2563eb" : "#334155",
                            backgroundColor:
                              chartPeriod === period ? "#eff6ff" : "transparent",
                            cursor: "pointer",
                            transition: "background-color 0.1s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (chartPeriod !== period) {
                              e.currentTarget.style.backgroundColor = "#f8fafc";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (chartPeriod !== period) {
                              e.currentTarget.style.backgroundColor = "transparent";
                            }
                          }}
                        >
                          {period}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stacked Bar Chart Canvas */}
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "175px",
              }}
            >
              {/* Y-Axis Gridlines & Labels */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  pointerEvents: "none",
                }}
              >
                {[300, 250, 200, 150, 100, 50, 0].map((val) => (
                  <div
                    key={val}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      height: "0px",
                    }}
                  >
                    <span
                      style={{
                        width: "28px",
                        fontSize: "10px",
                        fontWeight: 500,
                        color: "#94a3b8",
                        textAlign: "left",
                      }}
                    >
                      {val}
                    </span>
                    <div
                      style={{
                        flex: 1,
                        height: "1px",
                        backgroundColor: val === 0 ? "#cbd5e1" : "#f1f5f9",
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Stacked Bars container */}
              <div
                style={{
                  position: "absolute",
                  left: "34px",
                  right: "8px",
                  top: "0px",
                  bottom: "1px",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  gap: "3px",
                }}
              >
                {ACTIVITY_DATA.map((item, idx) => {
                  const multiplier =
                    chartPeriod === "Last Month"
                      ? 0.72
                      : chartPeriod === "Last 3 Months"
                      ? 1.22
                      : chartPeriod === "This Year"
                      ? 1.45
                      : chartPeriod === "All Time"
                      ? 1.7
                      : 1.0;
                  const maxVal = 300;
                  const qVal = Math.min(Math.round(item.quotations * multiplier), 210);
                  const mVal = Math.min(Math.round(item.mous * multiplier), 85);
                  const qHeight = (qVal / maxVal) * 100;
                  const mHeight = (mVal / maxVal) * 100;
                  const isHovered = hoveredBarIndex === idx;

                  const periodSuffix =
                    chartPeriod === "Last Month"
                      ? "Sep"
                      : chartPeriod === "Last 3 Months"
                      ? "Aug-Oct"
                      : chartPeriod === "This Year"
                      ? "2026"
                      : chartPeriod === "All Time"
                      ? "All"
                      : "Oct";

                  return (
                    <div
                      key={item.day}
                      onMouseEnter={() => setHoveredBarIndex(idx)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                      style={{
                        flex: 1,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        cursor: "pointer",
                        position: "relative",
                      }}
                    >
                      {/* Tooltip */}
                      {isHovered && (
                        <div
                          style={{
                            position: "absolute",
                            bottom: `calc(${qHeight + mHeight}% + 8px)`,
                            backgroundColor: "#0f172a",
                            color: "#ffffff",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            whiteSpace: "nowrap",
                            zIndex: 10,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            pointerEvents: "none",
                          }}
                        >
                          <div style={{ fontWeight: 700 }}>
                            {item.day} {periodSuffix}
                          </div>
                          <div style={{ fontSize: "10px", color: "#93c5fd" }}>
                            Quotations: {qVal}
                          </div>
                          <div style={{ fontSize: "10px", color: "#bfdbfe" }}>
                            MOUs: {mVal}
                          </div>
                        </div>
                      )}

                      {/* Top Bar: MOUs (light blue) */}
                      <div
                        style={{
                          width: "8px",
                          height: `${mHeight}%`,
                          backgroundColor: isHovered ? "#38bdf8" : "#60a5fa",
                          borderTopLeftRadius: "3px",
                          borderTopRightRadius: "3px",
                          transition: "height 0.25s ease, background-color 0.15s ease",
                        }}
                      />

                      {/* Bottom Bar: Quotations (royal blue) */}
                      <div
                        style={{
                          width: "8px",
                          height: `${qHeight}%`,
                          backgroundColor: isHovered ? "#1d4ed8" : "#2563eb",
                          transition: "height 0.25s ease, background-color 0.15s ease",
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* X-Axis Dates Labels */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                paddingLeft: "34px",
                paddingRight: "8px",
                marginTop: "10px",
                fontSize: "11px",
                color: "#64748b",
                fontWeight: 500,
              }}
            >
              <span>1 Oct</span>
              <span>5 Oct</span>
              <span>10 Oct</span>
              <span>15 Oct</span>
              <span>20 Oct</span>
              <span>25 Oct</span>
              <span>31 Oct</span>
            </div>
          </div>

          {/* RIGHT: Document Status Donut Chart */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "18px",
              border: "1px solid #eef2f6",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              boxSizing: "border-box",
            }}
          >
            <h2
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#0f172a",
                margin: "0 0 16px 0",
              }}
            >
              Document Status
            </h2>

            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "20px",
              }}
            >
              {/* Donut Chart SVG */}
              <div
                style={{
                  position: "relative",
                  width: "140px",
                  height: "140px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="140"
                  height="140"
                  viewBox="0 0 140 140"
                  style={{ transform: "rotate(-90deg)" }}
                >
                  {/* Total circumference for r=50 is 2 * Math.PI * 50 = 314.159 */}
                  {/* Segment 1: Draft (sky blue #60a5fa) */}
                  <circle
                    cx="70"
                    cy="70"
                    r="50"
                    fill="transparent"
                    stroke="#60a5fa"
                    strokeWidth="18"
                    strokeDasharray="72.5 241.66"
                    strokeDashoffset="0"
                  />
                  {/* Segment 2: Sent (royal blue #2563eb) */}
                  <circle
                    cx="70"
                    cy="70"
                    r="50"
                    fill="transparent"
                    stroke="#2563eb"
                    strokeWidth="18"
                    strokeDasharray="96.7 217.46"
                    strokeDashoffset="-72.5"
                  />
                  {/* Segment 3: Signed (green #10b981) */}
                  <circle
                    cx="70"
                    cy="70"
                    r="50"
                    fill="transparent"
                    stroke="#10b981"
                    strokeWidth="18"
                    strokeDasharray="120.8 193.36"
                    strokeDashoffset="-169.2"
                  />
                  {/* Segment 4: Expired (coral/red #f87171) */}
                  <circle
                    cx="70"
                    cy="70"
                    r="50"
                    fill="transparent"
                    stroke="#f87171"
                    strokeWidth="18"
                    strokeDasharray="24.16 290"
                    strokeDashoffset="-290"
                  />
                </svg>

                {/* Donut Center Text */}
                <div
                  style={{
                    position: "absolute",
                    textAlign: "center",
                    lineHeight: 1.1,
                  }}
                >
                  <span
                    style={{
                      fontSize: "24px",
                      fontWeight: 800,
                      color: "#0f172a",
                      display: "block",
                    }}
                  >
                    24
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 500,
                      color: "#64748b",
                      display: "block",
                    }}
                  >
                    Total
                  </span>
                </div>
              </div>

              {/* Status Legends List */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "12.5px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "#60a5fa",
                      }}
                    />
                    <span style={{ color: "#475569", fontWeight: 500 }}>Draft</span>
                  </div>
                  <span style={{ fontWeight: 700, color: "#0f172a" }}>6</span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "12.5px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "#2563eb",
                      }}
                    />
                    <span style={{ color: "#475569", fontWeight: 500 }}>Sent</span>
                  </div>
                  <span style={{ fontWeight: 700, color: "#0f172a" }}>8</span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "12.5px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "#10b981",
                      }}
                    />
                    <span style={{ color: "#475569", fontWeight: 500 }}>Signed</span>
                  </div>
                  <span style={{ fontWeight: 700, color: "#0f172a" }}>10</span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "12.5px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "#f87171",
                      }}
                    />
                    <span style={{ color: "#475569", fontWeight: 500 }}>Expired</span>
                  </div>
                  <span style={{ fontWeight: 700, color: "#0f172a" }}>2</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= 4. RECENT DOCUMENTS TABLE ================= */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "18px",
            border: "1px solid #eef2f6",
            boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          {/* Card Header */}
          <div
            style={{
              padding: "18px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <h2
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#0f172a",
                margin: 0,
              }}
            >
              Recent Documents
            </h2>
            <Link
              href="/recipient/shared"
              style={{
                fontSize: "12.5px",
                fontWeight: 600,
                color: "#2563eb",
                textDecoration: "none",
              }}
            >
              View All
            </Link>
          </div>

          {/* Table */}
          <div style={{ width: "100%", overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#f8fafc",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <th
                    style={{
                      padding: "12px 20px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#64748b",
                      width: "80px",
                    }}
                  >
                    #
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#64748b",
                    }}
                  >
                    Document Title
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#64748b",
                    }}
                  >
                    Type
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#64748b",
                    }}
                  >
                    Recipient
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#64748b",
                    }}
                  >
                    Status
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#64748b",
                    }}
                  >
                    Last Updated
                  </th>
                  <th
                    style={{
                      padding: "12px 20px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#64748b",
                      textAlign: "right",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc, docIdx) => {
                  const isMenuOpen = activeMenuId === doc.id;
                  const badgeStyle = getStatusBadgeStyle(doc.status);
                  const isBottom = docIdx >= 2;

                  return (
                    <tr
                      key={doc.id}
                      style={{
                        borderBottom: "1px solid #f8fafc",
                        transition: "background-color 0.15s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#fafafa")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      {/* Doc Number */}
                      <td
                        style={{
                          padding: "15px 20px",
                          fontSize: "12.5px",
                          fontWeight: 500,
                          color: "#64748b",
                        }}
                      >
                        {doc.docNumber}
                      </td>

                      {/* Title */}
                      <td
                        style={{
                          padding: "15px 16px",
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#0f172a",
                        }}
                      >
                        {doc.title}
                      </td>

                      {/* Type */}
                      <td
                        style={{
                          padding: "15px 16px",
                          fontSize: "12.5px",
                          color: "#475569",
                        }}
                      >
                        {doc.type}
                      </td>

                      {/* Recipient */}
                      <td
                        style={{
                          padding: "15px 16px",
                          fontSize: "12.5px",
                          color: "#334155",
                          fontWeight: 500,
                        }}
                      >
                        {doc.recipient}
                      </td>

                      {/* Status Badge */}
                      <td style={{ padding: "15px 16px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 700,
                            ...badgeStyle,
                          }}
                        >
                          {doc.status}
                        </span>
                      </td>

                      {/* Last Updated */}
                      <td
                        style={{
                          padding: "15px 16px",
                          fontSize: "12px",
                          color: "#64748b",
                        }}
                      >
                        {doc.lastUpdated}
                      </td>

                      {/* Actions Menu */}
                      <td
                        style={{
                          padding: "15px 20px",
                          textAlign: "right",
                          position: "relative",
                        }}
                        data-doc-menu="true"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMenuId(isMenuOpen ? null : doc.id)
                          }
                          style={{
                            padding: "6px",
                            backgroundColor: isMenuOpen ? "#f1f5f9" : "transparent",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            color: "#64748b",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (!isMenuOpen) e.currentTarget.style.backgroundColor = "#f1f5f9";
                          }}
                          onMouseLeave={(e) => {
                            if (!isMenuOpen) e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          <MoreVertical style={{ width: "16px", height: "16px" }} />
                        </button>

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                          <div
                            style={{
                              position: "absolute",
                              right: "20px",
                              ...(isBottom ? { bottom: "40px" } : { top: "40px" }),
                              width: "160px",
                              backgroundColor: "#ffffff",
                              borderRadius: "10px",
                              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                              border: "1px solid #e2e8f0",
                              zIndex: 40,
                              padding: "6px 0",
                              textAlign: "left",
                            }}
                          >
                            <Link
                              href={`/sign/${doc.id}`}
                              onClick={() => setActiveMenuId(null)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "8px 14px",
                                fontSize: "12.5px",
                                color: "#0f172a",
                                textDecoration: "none",
                                fontWeight: 500,
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor = "#f8fafc")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor = "transparent")
                              }
                            >
                              <PenTool style={{ width: "14px", height: "14px", color: "#2563eb" }} />
                              <span>Review & Sign</span>
                            </Link>

                            <Link
                              href={`/preview/${doc.id}`}
                              onClick={() => setActiveMenuId(null)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "8px 14px",
                                fontSize: "12.5px",
                                color: "#0f172a",
                                textDecoration: "none",
                                fontWeight: 500,
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor = "#f8fafc")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor = "transparent")
                              }
                            >
                              <Eye style={{ width: "14px", height: "14px", color: "#64748b" }} />
                              <span>View Document</span>
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleDownloadPDF(doc)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "8px 14px",
                                fontSize: "12.5px",
                                color: "#0f172a",
                                backgroundColor: "transparent",
                                border: "none",
                                width: "100%",
                                textAlign: "left",
                                cursor: "pointer",
                                fontWeight: 500,
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor = "#f8fafc")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor = "transparent")
                              }
                            >
                              <Download style={{ width: "14px", height: "14px", color: "#64748b" }} />
                              <span>Download PDF</span>
                            </button>

                            <div
                              style={{
                                height: "1px",
                                backgroundColor: "#f1f5f9",
                                margin: "4px 0",
                              }}
                            />

                            <button
                              type="button"
                              onClick={() => handleDelete(doc)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "8px 14px",
                                fontSize: "12.5px",
                                color: "#ef4444",
                                backgroundColor: "transparent",
                                border: "none",
                                width: "100%",
                                textAlign: "left",
                                cursor: "pointer",
                                fontWeight: 500,
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor = "#fef2f2")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor = "transparent")
                              }
                            >
                              <Trash2 style={{ width: "14px", height: "14px" }} />
                              <span>Remove</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================= MODAL: CREATE DOCUMENT ================= */}
      {isCreateOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "480px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h3
                style={{
                  fontSize: "17px",
                  fontWeight: 700,
                  color: "#0f172a",
                  margin: 0,
                }}
              >
                Create New Document
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                style={{
                  border: "none",
                  backgroundColor: "transparent",
                  color: "#94a3b8",
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                <X style={{ width: "18px", height: "18px" }} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateDocument} style={{ padding: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#334155",
                      marginBottom: "6px",
                    }}
                  >
                    Document Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Website Development Contract"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#334155",
                      marginBottom: "6px",
                    }}
                  >
                    Document Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) =>
                      setNewType(e.target.value as "Quotation" | "MOU")
                    }
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "14px",
                      outline: "none",
                      backgroundColor: "#ffffff",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="Quotation">Quotation</option>
                    <option value="MOU">MOU</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#334155",
                      marginBottom: "6px",
                    }}
                  >
                    Recipient / Organization
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VorldX Technologies Pvt Ltd"
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  marginTop: "24px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  style={{
                    padding: "9px 18px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#ffffff",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#475569",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "9px 20px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "#2563eb",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  Create Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </RecipientLayout>
  );
}
