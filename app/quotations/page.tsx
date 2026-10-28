"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import OrgLayout from "@/components/OrgLayout";
import {
  FileText,
  Send,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Calendar,
  ChevronDown,
  MoreVertical,
  Eye,
  Download,
  Trash2,
  ArrowUpDown,
  X,
  Edit,
} from "lucide-react";
import { deleteOrgDocument } from "@/lib/orgStorage";

interface QuotationRow {
  id: string;
  quotationId: string;
  client: string;
  subject: string;
  amount: number;
  validUntil: string;
  status: "Sent" | "Accepted" | "Draft" | "Rejected" | "Expired";
}

const DEFAULT_QUOTATIONS: QuotationRow[] = [
  {
    id: "q-024",
    quotationId: "Q-024",
    client: "Tech Solutions Pvt Ltd",
    subject: "Website Development",
    amount: 85000,
    validUntil: "15 Nov 2026",
    status: "Sent",
  },
  {
    id: "q-023",
    quotationId: "Q-023",
    client: "Global Systems",
    subject: "Annual IT Support",
    amount: 120000,
    validUntil: "10 Nov 2026",
    status: "Accepted",
  },
  {
    id: "q-022",
    quotationId: "Q-022",
    client: "NextGen Digital",
    subject: "Cloud Migration",
    amount: 240000,
    validUntil: "05 Nov 2026",
    status: "Draft",
  },
  {
    id: "q-021",
    quotationId: "Q-021",
    client: "Innovate India",
    subject: "Software License",
    amount: 65000,
    validUntil: "01 Nov 2026",
    status: "Expired",
  },
  {
    id: "q-020",
    quotationId: "Q-020",
    client: "BrightTech Ltd",
    subject: "UI/UX Design",
    amount: 95000,
    validUntil: "20 Nov 2026",
    status: "Sent",
  },
];

export default function QuotationsListPage() {
  const [quotations, setQuotations] = useState<QuotationRow[]>(DEFAULT_QUOTATIONS);
  const [activeTab, setActiveTab] = useState<
    "All" | "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired"
  >("All");
  const [search, setSearch] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [sortField, setSortField] = useState<
    "quotationId" | "amount" | "validUntil" | "status" | null
  >(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New quotation modal fields
  const [newId, setNewId] = useState("Q-025");
  const [newClient, setNewClient] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newAmount, setNewAmount] = useState<number>(50000);
  const [newValidUntil, setNewValidUntil] = useState("30 Nov 2026");

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-quote-menu]")) {
        setActiveMenuId(null);
      }
    };
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDownloadPDF = (q: QuotationRow) => {
    setActiveMenuId(null);
    showToast(`Downloading PDF for ${q.quotationId}...`);
    if (typeof window !== "undefined") {
      const w = window.open(`/preview/${q.id}?autoPrint=true`, "_blank");
      if (w) w.focus();
    }
  };

  const handleDelete = (q: QuotationRow) => {
    setActiveMenuId(null);
    setQuotations((prev) => prev.filter((item) => item.id !== q.id));
    deleteOrgDocument(q.id);
    showToast(`Deleted ${q.quotationId}`);
  };

  const handleCreateQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    const newQuote: QuotationRow = {
      id: `q-${Date.now()}`,
      quotationId: newId || `Q-0${quotations.length + 20}`,
      client: newClient || "Client Corp",
      subject: newSubject || "Custom Service",
      amount: Number(newAmount) || 50000,
      validUntil: newValidUntil || "30 Nov 2026",
      status: "Draft",
    };
    setQuotations([newQuote, ...quotations]);
    setIsCreateOpen(false);
    setNewClient("");
    setNewSubject("");
    showToast(`Created quotation ${newQuote.quotationId} successfully!`);
  };

  const handleSort = (field: "quotationId" | "amount" | "validUntil" | "status") => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filtered = quotations
    .filter((q) => {
      if (activeTab !== "All" && q.status !== activeTab) return false;
      if (!search.trim()) return true;
      const term = search.toLowerCase();
      return (
        q.quotationId.toLowerCase().includes(term) ||
        q.client.toLowerCase().includes(term) ||
        q.subject.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === "string") {
        return sortAsc
          ? (valA as string).localeCompare(valB as string)
          : (valB as string).localeCompare(valA as string);
      }
      return sortAsc
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number);
    });

  const getStatusBadge = (status: QuotationRow["status"]) => {
    switch (status) {
      case "Sent":
        return { bg: "#eff6ff", color: "#2563eb" };
      case "Accepted":
        return { bg: "#dcfce7", color: "#16a34a" };
      case "Draft":
        return { bg: "#fef3c7", color: "#d97706" };
      case "Expired":
        return { bg: "#fee2e2", color: "#ef4444" };
      case "Rejected":
        return { bg: "#f1f5f9", color: "#64748b" };
    }
  };

  return (
    <OrgLayout activePath="/quotations">
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
          gap: "22px",
          boxSizing: "border-box",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        }}
      >
        {/* ================= 1. PAGE HEADER ================= */}
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
              }}
            >
              Quotations
            </h1>
            <p
              style={{
                fontSize: "13.5px",
                fontWeight: 400,
                color: "#64748b",
                margin: "4px 0 0 0",
              }}
            >
              Create, manage, and track your business quotations.
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
            <span>Create Quotation</span>
          </button>
        </div>

        {/* ================= 2. FIVE METRIC CARDS IN A ROW ================= */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "16px",
          }}
        >
          {/* Card 1: Total Quotations (24) */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #eef2f6",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "14px",
                backgroundColor: "#eff6ff",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <FileText style={{ width: "22px", height: "22px" }} />
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
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#64748b",
                  marginTop: "4px",
                  display: "block",
                }}
              >
                Total Quotations
              </span>
            </div>
          </div>

          {/* Card 2: Draft (5) */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #eef2f6",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "14px",
                backgroundColor: "#fef3c7",
                color: "#f59e0b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <FileText style={{ width: "22px", height: "22px" }} />
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
                5
              </span>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#64748b",
                  marginTop: "4px",
                  display: "block",
                }}
              >
                Draft
              </span>
            </div>
          </div>

          {/* Card 3: Sent (12) */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #eef2f6",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "14px",
                backgroundColor: "#ecfdf5",
                color: "#10b981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Send style={{ width: "22px", height: "22px" }} />
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
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#64748b",
                  marginTop: "4px",
                  display: "block",
                }}
              >
                Sent
              </span>
            </div>
          </div>

          {/* Card 4: Accepted (6) */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #eef2f6",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "14px",
                backgroundColor: "#dcfce7",
                color: "#16a34a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <CheckCircle2 style={{ width: "22px", height: "22px" }} />
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
                6
              </span>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#64748b",
                  marginTop: "4px",
                  display: "block",
                }}
              >
                Accepted
              </span>
            </div>
          </div>

          {/* Card 5: Expired (1) */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #eef2f6",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "14px",
                backgroundColor: "#fee2e2",
                color: "#ef4444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Clock style={{ width: "22px", height: "22px" }} />
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
                1
              </span>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#64748b",
                  marginTop: "4px",
                  display: "block",
                }}
              >
                Expired
              </span>
            </div>
          </div>
        </div>

        {/* ================= 3. FILTER TABS & SEARCH ROW ================= */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "14px",
          }}
        >
          {/* Status Tabs */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              flexWrap: "wrap",
            }}
          >
            {(["All", "Draft", "Sent", "Accepted", "Rejected", "Expired"] as const).map(
              (tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: "8px 18px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: isActive ? 700 : 500,
                      backgroundColor: isActive ? "#2563eb" : "transparent",
                      color: isActive ? "#ffffff" : "#475569",
                      border: "none",
                      cursor: "pointer",
                      boxShadow: isActive
                        ? "0 2px 6px rgba(37,99,235,0.25)"
                        : "none",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {tab}
                  </button>
                );
              }
            )}
          </div>

          {/* Search Input & All Dates Dropdown */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div style={{ position: "relative", width: "240px" }}>
              <Search
                style={{
                  width: "15px",
                  height: "15px",
                  color: "#94a3b8",
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
              <input
                type="text"
                placeholder="Search quotations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  height: "38px",
                  padding: "0 12px 0 36px",
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "#0f172a",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                height: "38px",
                padding: "0 14px",
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "13px",
                color: "#475569",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              <Calendar style={{ width: "14px", height: "14px", color: "#64748b" }} />
              <span>All Dates</span>
              <ChevronDown style={{ width: "13px", height: "13px", color: "#64748b" }} />
            </div>
          </div>
        </div>

        {/* ================= 4. QUOTATIONS TABLE CARD ================= */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "18px",
            border: "1px solid #eef2f6",
            boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
            boxSizing: "border-box",
          }}
        >
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
                    backgroundColor: "#ffffff",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <th
                    style={{
                      padding: "16px 20px",
                      fontSize: "12.5px",
                      fontWeight: 700,
                      color: "#0f172a",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                    onClick={() => handleSort("quotationId")}
                  >
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <span>Quotation ID</span>
                      <ArrowUpDown style={{ width: "13px", height: "13px", color: "#94a3b8" }} />
                    </div>
                  </th>
                  <th
                    style={{
                      padding: "16px 20px",
                      fontSize: "12.5px",
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    Client
                  </th>
                  <th
                    style={{
                      padding: "16px 20px",
                      fontSize: "12.5px",
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    Subject
                  </th>
                  <th
                    style={{
                      padding: "16px 20px",
                      fontSize: "12.5px",
                      fontWeight: 700,
                      color: "#0f172a",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                    onClick={() => handleSort("amount")}
                  >
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <span>Amount</span>
                      <ArrowUpDown style={{ width: "13px", height: "13px", color: "#94a3b8" }} />
                    </div>
                  </th>
                  <th
                    style={{
                      padding: "16px 20px",
                      fontSize: "12.5px",
                      fontWeight: 700,
                      color: "#0f172a",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                    onClick={() => handleSort("validUntil")}
                  >
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <span>Valid Until</span>
                      <ArrowUpDown style={{ width: "13px", height: "13px", color: "#94a3b8" }} />
                    </div>
                  </th>
                  <th
                    style={{
                      padding: "16px 20px",
                      fontSize: "12.5px",
                      fontWeight: 700,
                      color: "#0f172a",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                    onClick={() => handleSort("status")}
                  >
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <span>Status</span>
                      <ArrowUpDown style={{ width: "13px", height: "13px", color: "#94a3b8" }} />
                    </div>
                  </th>
                  <th
                    style={{
                      padding: "16px 20px",
                      fontSize: "12.5px",
                      fontWeight: 700,
                      color: "#0f172a",
                      textAlign: "right",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((q, idx) => {
                  const badge = getStatusBadge(q.status);
                  const isMenuOpen = activeMenuId === q.id;
                  const isBottom = idx >= filtered.length - 2;

                  return (
                    <tr
                      key={q.id}
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
                      {/* Quotation ID */}
                      <td
                        style={{
                          padding: "16px 20px",
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#0f172a",
                        }}
                      >
                        {q.quotationId}
                      </td>

                      {/* Client */}
                      <td
                        style={{
                          padding: "16px 20px",
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "#1e293b",
                        }}
                      >
                        {q.client}
                      </td>

                      {/* Subject */}
                      <td
                        style={{
                          padding: "16px 20px",
                          fontSize: "13px",
                          color: "#475569",
                        }}
                      >
                        {q.subject}
                      </td>

                      {/* Amount */}
                      <td
                        style={{
                          padding: "16px 20px",
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#0f172a",
                        }}
                      >
                        ₹{q.amount.toLocaleString("en-IN")}
                      </td>

                      {/* Valid Until */}
                      <td
                        style={{
                          padding: "16px 20px",
                          fontSize: "13px",
                          color: "#475569",
                        }}
                      >
                        {q.validUntil}
                      </td>

                      {/* Status Badge */}
                      <td style={{ padding: "16px 20px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "4px 14px",
                            borderRadius: "9999px",
                            fontSize: "11.5px",
                            fontWeight: 600,
                            backgroundColor: badge.bg,
                            color: badge.color,
                          }}
                        >
                          {q.status}
                        </span>
                      </td>

                      {/* Actions Column */}
                      <td
                        style={{
                          padding: "16px 20px",
                          textAlign: "right",
                          position: "relative",
                        }}
                        data-quote-menu="true"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(isMenuOpen ? null : q.id);
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
                          <MoreVertical style={{ width: "16px", height: "16px" }} />
                        </button>

                        {/* Action Popover Menu */}
                        {isMenuOpen && (
                          <div
                            data-quote-menu="true"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              position: "absolute",
                              right: "20px",
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
                              href={`/preview/${q.id}`}
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
                              href={`/documents/${q.id}/send`}
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
                              onClick={() => handleDownloadPDF(q)}
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
                              onClick={() => handleDelete(q)}
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

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        padding: "36px",
                        textAlign: "center",
                        color: "#94a3b8",
                        fontSize: "13px",
                      }}
                    >
                      No quotations found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================= CREATE QUOTATION MODAL ================= */}
      {isCreateOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.45)",
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
                Create New Quotation
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
              onSubmit={handleCreateQuotation}
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
                  Quotation ID
                </label>
                <input
                  type="text"
                  required
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
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
                  Client Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Tech Corp"
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
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
                  Subject / Scope
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Website Redesign"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
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
                  Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  value={newAmount}
                  onChange={(e) => setNewAmount(Number(e.target.value))}
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
                  Valid Until
                </label>
                <input
                  type="text"
                  required
                  value={newValidUntil}
                  onChange={(e) => setNewValidUntil(e.target.value)}
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
                  Create Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </OrgLayout>
  );
}
