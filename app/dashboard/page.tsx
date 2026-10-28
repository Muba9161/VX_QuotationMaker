"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import OrgLayout from "@/components/OrgLayout";
import {
  FileText,
  Clock,
  CheckCircle2,
  Plus,
  MoreVertical,
  X,
  Eye,
  Download,
  Send,
  Trash2,
  ChevronDown,
  PenTool,
} from "lucide-react";
import { deleteOrgDocument } from "@/lib/orgStorage";

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

// 31 days data for October activity chart matching screenshot pattern
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

export default function OrgDashboardPage() {
  const [documents, setDocuments] = useState<RecentDoc[]>(INITIAL_DOCUMENTS);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<"Quotation" | "MOU">("Quotation");
  const [newRecipient, setNewRecipient] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const [userName, setUserName] = useState("Rahul");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem("vorldx_org_auth");
      if (auth) {
        try {
          const parsed = JSON.parse(auth);
          if (parsed.name) {
            setUserName(parsed.name.split(" ")[0]);
          }
        } catch {}
      }

      const handleGlobalClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest("[data-doc-menu]")) {
          setActiveMenuId(null);
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
    deleteOrgDocument(doc.id);
    showToast(`Deleted ${doc.docNumber}`);
  };

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    const newDoc: RecentDoc = {
      id: `doc-${Date.now()}`,
      docNumber:
        newType === "Quotation"
          ? `Q-00${documents.length + 1}`
          : `MOU-00${documents.length + 1}`,
      title: newTitle || "New Service Proposal",
      type: newType,
      recipient: newRecipient || "Client Corp",
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
    <OrgLayout activePath="/dashboard">
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
              Here&apos;s what&apos;s happening in Acme Technologies.
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
                <div
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
                  }}
                >
                  <span>This Month</span>
                  <ChevronDown style={{ width: "13px", height: "13px", color: "#64748b" }} />
                </div>
              </div>
            </div>

            {/* Stacked Bar Chart SVG Canvas */}
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
                  const maxVal = 300;
                  const qHeight = (item.quotations / maxVal) * 100;
                  const mHeight = (item.mous / maxVal) * 100;
                  const isHovered = hoveredBarIndex === idx;

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
                          <div style={{ fontWeight: 700 }}>{item.day} Oct</div>
                          <div style={{ fontSize: "10px", color: "#93c5fd" }}>
                            Quotations: {item.quotations}
                          </div>
                          <div style={{ fontSize: "10px", color: "#bfdbfe" }}>
                            MOUs: {item.mous}
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
                          transition: "height 0.2s ease, background-color 0.15s ease",
                        }}
                      />

                      {/* Bottom Bar: Quotations (royal blue) */}
                      <div
                        style={{
                          width: "8px",
                          height: `${qHeight}%`,
                          backgroundColor: isHovered ? "#1d4ed8" : "#2563eb",
                          transition: "height 0.2s ease, background-color 0.15s ease",
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
                  {/* Proportions: Draft 6/26 (23.08% -> 72.5), Sent 8/26 (30.77% -> 96.7), Signed 10/26 (38.46% -> 120.8), Expired 2/26 (7.69% -> 24.16) */}
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
              href="/my-documents"
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
                        }}
                      >
                        {doc.recipient}
                      </td>

                      {/* Status Badge */}
                      <td style={{ padding: "15px 16px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "3px 12px",
                            borderRadius: "9999px",
                            fontSize: "11px",
                            fontWeight: 600,
                            letterSpacing: "0.1px",
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
                          fontSize: "12.5px",
                          color: "#64748b",
                        }}
                      >
                        {doc.lastUpdated}
                      </td>

                      {/* Actions */}
                      <td
                        style={{
                          padding: "15px 20px",
                          textAlign: "right",
                          position: "relative",
                        }}
                        data-doc-menu="true"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(isMenuOpen ? null : doc.id);
                          }}
                          style={{
                            backgroundColor: isMenuOpen ? "#eff6ff" : "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: "6px",
                            borderRadius: "6px",
                            color: isMenuOpen ? "#2563eb" : "#64748b",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <MoreVertical
                            style={{ width: "16px", height: "16px" }}
                          />
                        </button>

                        {/* Action Popover Menu */}
                        {isMenuOpen && (
                          <div
                            data-doc-menu="true"
                            style={{
                              position: "absolute",
                              right: "16px",
                              top: isBottom ? "auto" : "38px",
                              bottom: isBottom ? "38px" : "auto",
                              backgroundColor: "#ffffff",
                              borderRadius: "12px",
                              boxShadow: "0 10px 30px rgba(15, 23, 42, 0.18)",
                              border: "1px solid #e2e8f0",
                              width: "180px",
                              zIndex: 9999,
                              padding: "6px",
                              display: "flex",
                              flexDirection: "column",
                              gap: "2px",
                              textAlign: "left",
                            }}
                          >
                            <Link
                              href={`/preview/${doc.id}`}
                              onClick={() => setActiveMenuId(null)}
                              style={{
                                padding: "8px 12px",
                                fontSize: "12.5px",
                                fontWeight: 500,
                                color: "#0f172a",
                                textDecoration: "none",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                transition: "background-color 0.15s ease",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor = "#f8fafc")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor = "transparent")
                              }
                            >
                              <Eye style={{ width: "14px", height: "14px", color: "#475569" }} />
                              <span>View Document</span>
                            </Link>

                            <Link
                              href={`/documents/${doc.id}/send`}
                              onClick={() => setActiveMenuId(null)}
                              style={{
                                padding: "8px 12px",
                                fontSize: "12.5px",
                                fontWeight: 500,
                                color: "#2563eb",
                                textDecoration: "none",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                transition: "background-color 0.15s ease",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor = "#eff6ff")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor = "transparent")
                              }
                            >
                              <Send style={{ width: "14px", height: "14px", color: "#2563eb" }} />
                              <span>Send for Signature</span>
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleDownloadPDF(doc)}
                              style={{
                                padding: "8px 12px",
                                fontSize: "12.5px",
                                fontWeight: 500,
                                color: "#0f172a",
                                border: "none",
                                backgroundColor: "transparent",
                                borderRadius: "8px",
                                textAlign: "left",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                width: "100%",
                                transition: "background-color 0.15s ease",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor = "#f8fafc")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor = "transparent")
                              }
                            >
                              <Download style={{ width: "14px", height: "14px", color: "#475569" }} />
                              <span>Download PDF</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(doc)}
                              style={{
                                padding: "8px 12px",
                                fontSize: "12.5px",
                                fontWeight: 500,
                                color: "#ef4444",
                                border: "none",
                                backgroundColor: "transparent",
                                borderRadius: "8px",
                                textAlign: "left",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                width: "100%",
                                transition: "background-color 0.15s ease",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor = "#fee2e2")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor = "transparent")
                              }
                            >
                              <Trash2 style={{ width: "14px", height: "14px", color: "#ef4444" }} />
                              <span>Delete</span>
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

      {/* ================= CREATE DOCUMENT MODAL ================= */}
      {isCreateOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "18px",
              width: "100%",
              maxWidth: "460px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              padding: "24px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <h3
                style={{
                  fontSize: "17px",
                  fontWeight: 800,
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
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                }}
              >
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>

            <form
              onSubmit={handleCreateDocument}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#334155",
                    marginBottom: "4px",
                  }}
                >
                  Document Type
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  style={{
                    width: "100%",
                    height: "38px",
                    padding: "0 10px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "13px",
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
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#334155",
                    marginBottom: "4px",
                  }}
                >
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Website Development"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{
                    width: "100%",
                    height: "38px",
                    padding: "0 10px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "13px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#334155",
                    marginBottom: "4px",
                  }}
                >
                  Recipient Organization
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tech Solutions Pvt Ltd"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  style={{
                    width: "100%",
                    height: "38px",
                    padding: "0 10px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "13px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "8px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  style={{
                    flex: 1,
                    height: "38px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#ffffff",
                    borderRadius: "8px",
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
                    flex: 1,
                    height: "38px",
                    border: "none",
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
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
    </OrgLayout>
  );
}
