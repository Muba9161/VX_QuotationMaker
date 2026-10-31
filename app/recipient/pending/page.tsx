"use client";

import React, { useState, useMemo, useEffect } from "react";
import RecipientLayout from "@/components/RecipientLayout";
import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle2,
  X,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  ArrowUpDown,
  ShieldCheck,
  Headphones,
  FileCheck,
  Eye,
  Download,
  PenTool,
  Trash2,
  BookOpen,
} from "lucide-react";

interface PendingDoc {
  id: string;
  name: string;
  pages: number;
  fromName: string;
  fromEmail: string;
  type: "Quotation" | "MOU" | "Agreement" | "NDA";
  receivedDate: string;
  receivedTime: string;
  validTill: string;
  signUrl: string;
}

const SEED_PENDING_DOCS: PendingDoc[] = [
  {
    id: "doc-1",
    name: "Quotation - Q-001",
    pages: 2,
    fromName: "VorldXnologies Pvt Ltd",
    fromEmail: "john.doe@email.com",
    type: "Quotation",
    receivedDate: "28 Oct 2026",
    receivedTime: "10:30 AM",
    validTill: "28 Nov 2026",
    signUrl: "/sign/doc-1",
  },
  {
    id: "doc-2",
    name: "MOU - M-014",
    pages: 5,
    fromName: "BrightPath Solutions",
    fromEmail: "sarah@brightpath.com",
    type: "MOU",
    receivedDate: "26 Oct 2026",
    receivedTime: "02:15 PM",
    validTill: "15 Nov 2026",
    signUrl: "/sign/doc-2",
  },
  {
    id: "doc-3",
    name: "Service Agreement - SA-006",
    pages: 4,
    fromName: "Northstar Systems",
    fromEmail: "contact@northstar.com",
    type: "Agreement",
    receivedDate: "24 Oct 2026",
    receivedTime: "11:20 AM",
    validTill: "30 Nov 2026",
    signUrl: "/sign/doc-3",
  },
  {
    id: "doc-4",
    name: "NDA - NDA-006",
    pages: 3,
    fromName: "Zenith Innovations",
    fromEmail: "info@zenith.com",
    type: "NDA",
    receivedDate: "22 Oct 2026",
    receivedTime: "09:45 AM",
    validTill: "15 Nov 2026",
    signUrl: "/sign/doc-4",
  },
];

export default function PendingSignaturePage() {
  const [documents, setDocuments] = useState<PendingDoc[]>(SEED_PENDING_DOCS);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Document Types");
  const [senderFilter, setSenderFilter] = useState("All Senders");
  const [sortBy, setSortBy] = useState<"Newest" | "Oldest" | "Due Soon">("Newest");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Global click listener to close action menus
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-doc-menu]")) {
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

  // Filtered and sorted documents
  const filteredDocs = useMemo(() => {
    let result = documents.filter((doc) => {
      const matchSearch =
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.fromName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.fromEmail.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType =
        typeFilter === "All Document Types" || doc.type === typeFilter;
      const matchSender =
        senderFilter === "All Senders" || doc.fromName === senderFilter;
      return matchSearch && matchType && matchSender;
    });

    if (sortBy === "Oldest") {
      result = [...result].reverse();
    } else if (sortBy === "Due Soon") {
      result = [...result].sort((a, b) => a.validTill.localeCompare(b.validTill));
    }
    return result;
  }, [documents, searchTerm, typeFilter, senderFilter, sortBy]);

  // Company logo renderer matching reference screenshot
  const renderCompanyLogo = (name: string) => {
    if (name.includes("ACME")) {
      return (
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            backgroundColor: "#eff6ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <polygon points="12 3, 21 20, 3 20" fill="#2563eb" />
            <polygon points="12 10, 17 20, 7 20" fill="#60a5fa" />
          </svg>
        </div>
      );
    }
    if (name.includes("BrightPath")) {
      return (
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            backgroundColor: "#f0fdfa",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="4" width="6" height="16" rx="2" fill="#0d9488" />
            <polygon points="13 4, 19 9, 13 14" fill="#14b8a6" />
          </svg>
        </div>
      );
    }
    if (name.includes("Northstar")) {
      return (
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            backgroundColor: "#0f172a",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "15px",
            fontWeight: 900,
            letterSpacing: "-0.5px",
            flexShrink: 0,
          }}
        >
          N
        </div>
      );
    }
    if (name.includes("Zenith")) {
      return (
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            backgroundColor: "#7c3aed",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            fontWeight: 900,
            flexShrink: 0,
          }}
        >
          Z
        </div>
      );
    }
    return (
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "8px",
          backgroundColor: "#f1f5f9",
          color: "#475569",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "13px",
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {name[0]}
      </div>
    );
  };

  const handleDownloadPDF = (doc: PendingDoc) => {
    setActiveMenuId(null);
    showToast(`Downloading PDF for ${doc.name}...`);
    if (typeof window !== "undefined") {
      const w = window.open(`/preview/${doc.id}?autoPrint=true`, "_blank");
      if (w) w.focus();
    }
  };

  const handleDelete = (doc: PendingDoc) => {
    setActiveMenuId(null);
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    showToast(`Removed ${doc.name} from list`);
  };

  return (
    <RecipientLayout activePath="/recipient/pending">
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
          maxWidth: "1160px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          boxSizing: "border-box",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        }}
      >
        {/* ================= 1. HEADER CARD WITH ILLUSTRATION ================= */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #eef2f6",
            boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
            padding: "24px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          {/* Left Text */}
          <div style={{ position: "relative", zIndex: 2 }}>
            <h1
              style={{
                fontSize: "26px",
                fontWeight: 800,
                color: "#0f172a",
                margin: 0,
                letterSpacing: "-0.4px",
              }}
            >
              Pending Signature
            </h1>
            <p
              style={{
                fontSize: "13.5px",
                color: "#64748b",
                margin: "4px 0 0 0",
                fontWeight: 400,
              }}
            >
              Documents waiting for your review and signature.
            </p>
          </div>

          {/* Right Illustration: Clock + Document Card + Plane */}
          <div
            style={{
              position: "relative",
              width: "220px",
              height: "90px",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            {/* Soft blue glow background */}
            <div
              style={{
                position: "absolute",
                right: "10px",
                top: "-10px",
                width: "150px",
                height: "110px",
                borderRadius: "50%",
                background: "radial-gradient(circle, #dbeafe 0%, #eff6ff 70%, transparent 100%)",
                filter: "blur(4px)",
              }}
            />

            {/* Amber Analog Clock Badge on left of card */}
            <div
              style={{
                position: "absolute",
                left: "14px",
                top: "22px",
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                backgroundColor: "#fffbeb",
                border: "2px solid #fde68a",
                boxShadow: "0 4px 10px rgba(217,119,6,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 3,
              }}
            >
              <Clock style={{ width: "24px", height: "24px", color: "#d97706" }} />
            </div>

            {/* Document card sheet with blue signature */}
            <div
              style={{
                position: "absolute",
                right: "20px",
                top: "8px",
                width: "105px",
                height: "76px",
                backgroundColor: "#ffffff",
                border: "1.5px solid #bfdbfe",
                borderRadius: "10px",
                boxShadow: "0 4px 14px rgba(37,99,235,0.08)",
                padding: "8px",
                transform: "rotate(3deg)",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                zIndex: 2,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ width: "32px", height: "3px", backgroundColor: "#3b82f6", borderRadius: "2px" }} />
                <div style={{ width: "58px", height: "2.5px", backgroundColor: "#e2e8f0", borderRadius: "2px" }} />
                <div style={{ width: "46px", height: "2.5px", backgroundColor: "#e2e8f0", borderRadius: "2px" }} />
              </div>
              <div
                style={{
                  textAlign: "right",
                  fontFamily: "'Brush Script MT', cursive, sans-serif",
                  fontSize: "15px",
                  color: "#2563eb",
                  fontWeight: 600,
                  transform: "rotate(-4deg)",
                  letterSpacing: "0.5px",
                }}
              >
                J. Doe
              </div>
            </div>

            {/* Paper Airplane */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              style={{
                position: "absolute",
                right: "0px",
                top: "2px",
                transform: "rotate(15deg)",
              }}
            >
              <path
                d="M3 12L21 3L12 21L10 13L3 12Z"
                fill="#60a5fa"
                stroke="#3b82f6"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* ================= 2. FOUR SUMMARY METRIC CARDS ================= */}
        {/* Exact Order from Screenshot: Pending Signature (2), Total Documents (5), Signed (8), Declined (1) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "18px",
          }}
        >
          {/* Card 1: Pending Signature (2) */}
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
              <FileCheck style={{ width: "24px", height: "24px" }} />
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
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#0f172a",
                  marginTop: "5px",
                  display: "block",
                }}
              >
                Pending Signature
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "#94a3b8",
                  marginTop: "2px",
                  display: "block",
                }}
              >
                Need your action
              </span>
            </div>
          </div>

          {/* Card 2: Total Documents (5) */}
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
                5
              </span>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#0f172a",
                  marginTop: "5px",
                  display: "block",
                }}
              >
                Total Documents
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "#94a3b8",
                  marginTop: "2px",
                  display: "block",
                }}
              >
                Shared with you
              </span>
            </div>
          </div>

          {/* Card 3: Signed (8) */}
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
                8
              </span>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#0f172a",
                  marginTop: "5px",
                  display: "block",
                }}
              >
                Signed
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "#94a3b8",
                  marginTop: "2px",
                  display: "block",
                }}
              >
                Completed
              </span>
            </div>
          </div>

          {/* Card 4: Declined (1) */}
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
              <X style={{ width: "24px", height: "24px", strokeWidth: 2.5 }} />
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
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#0f172a",
                  marginTop: "5px",
                  display: "block",
                }}
              >
                Declined
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "#94a3b8",
                  marginTop: "2px",
                  display: "block",
                }}
              >
                Not signed
              </span>
            </div>
          </div>
        </div>

        {/* ================= 3. FILTER BAR + TABLE CARD ================= */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "18px",
            border: "1px solid #eef2f6",
            boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
            padding: "20px 24px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          {/* Filter Bar with Search, Type, Sender, and Sort */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            {/* Search Input */}
            <div style={{ position: "relative", width: "280px" }}>
              <Search
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "15px",
                  height: "15px",
                  color: "#94a3b8",
                }}
              />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px 9px 36px",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  fontSize: "13px",
                  color: "#1e293b",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Filter Dropdowns */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              {/* Type Filter */}
              <div style={{ position: "relative" }}>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  style={{
                    appearance: "none",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "8px 32px 8px 14px",
                    fontSize: "12.5px",
                    fontWeight: 500,
                    color: "#334155",
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  <option value="All Document Types">All Document Types</option>
                  <option value="Quotation">Quotation</option>
                  <option value="MOU">MOU</option>
                  <option value="Agreement">Agreement</option>
                  <option value="NDA">NDA</option>
                </select>
                <ChevronDown
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "14px",
                    height: "14px",
                    color: "#94a3b8",
                    pointerEvents: "none",
                  }}
                />
              </div>

              {/* Senders Filter */}
              <div style={{ position: "relative" }}>
                <select
                  value={senderFilter}
                  onChange={(e) => setSenderFilter(e.target.value)}
                  style={{
                    appearance: "none",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "8px 32px 8px 14px",
                    fontSize: "12.5px",
                    fontWeight: 500,
                    color: "#334155",
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  <option value="All Senders">All Senders</option>
                  <option value="VorldXnologies Pvt Ltd">VorldXnologies Pvt Ltd</option>
                  <option value="BrightPath Solutions">BrightPath Solutions</option>
                  <option value="Northstar Systems">Northstar Systems</option>
                  <option value="Zenith Innovations">Zenith Innovations</option>
                </select>
                <ChevronDown
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "14px",
                    height: "14px",
                    color: "#94a3b8",
                    pointerEvents: "none",
                  }}
                />
              </div>

              {/* Sort By Filter */}
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "8px 12px",
                  }}
                >
                  <ArrowUpDown style={{ width: "13px", height: "13px", color: "#64748b" }} />
                  <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#0f172a" }}>
                    Sort by:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    style={{
                      border: "none",
                      backgroundColor: "transparent",
                      fontSize: "12.5px",
                      fontWeight: 500,
                      color: "#334155",
                      cursor: "pointer",
                      outline: "none",
                      paddingRight: "16px",
                    }}
                  >
                    <option value="Newest">Newest</option>
                    <option value="Oldest">Oldest</option>
                    <option value="Due Soon">Due Soon</option>
                  </select>
                  <ChevronDown
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "13px",
                      height: "13px",
                      color: "#94a3b8",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Table matching Screenshot columns: Document | From | Type | Received On | Valid Till | Pages | Action */}
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
                      padding: "14px 18px",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    Document
                  </th>
                  <th
                    style={{
                      padding: "14px 18px",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    From
                  </th>
                  <th
                    style={{
                      padding: "14px 18px",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    Type
                  </th>
                  <th
                    style={{
                      padding: "14px 18px",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    Received On
                  </th>
                  <th
                    style={{
                      padding: "14px 18px",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    Valid Till
                  </th>
                  <th
                    style={{
                      padding: "14px 18px",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    Pages
                  </th>
                  <th
                    style={{
                      padding: "14px 18px",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#0f172a",
                      textAlign: "center",
                    }}
                  >
                    Action
                  </th>
                  <th
                    style={{
                      padding: "14px 14px",
                      width: "36px",
                      textAlign: "right",
                    }}
                  />
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map((doc, docIdx) => {
                  const isMenuOpen = activeMenuId === doc.id;
                  const isBottom = docIdx >= 2;

                  // Document icon styling based on type
                  const docIconBg =
                    doc.type === "Quotation"
                      ? "#eff6ff"
                      : doc.type === "MOU"
                      ? "#fee2e2"
                      : doc.type === "Agreement"
                      ? "#ecfdf5"
                      : "#fee2e2";
                  const docIconColor =
                    doc.type === "Quotation"
                      ? "#2563eb"
                      : doc.type === "MOU"
                      ? "#dc2626"
                      : doc.type === "Agreement"
                      ? "#059669"
                      : "#dc2626";

                  // Type Pill style
                  const typePillBg =
                    doc.type === "Quotation"
                      ? "#eff6ff"
                      : doc.type === "MOU"
                      ? "#f5f3ff"
                      : doc.type === "Agreement"
                      ? "#ecfdf5"
                      : "#fdf2f2";
                  const typePillColor =
                    doc.type === "Quotation"
                      ? "#2563eb"
                      : doc.type === "MOU"
                      ? "#7c3aed"
                      : doc.type === "Agreement"
                      ? "#059669"
                      : "#e02424";

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
                      {/* Document Column */}
                      <td style={{ padding: "16px 18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div
                            style={{
                              width: "34px",
                              height: "34px",
                              borderRadius: "8px",
                              backgroundColor: docIconBg,
                              color: docIconColor,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <FileText style={{ width: "17px", height: "17px" }} />
                          </div>
                          <div>
                            <div
                              style={{
                                fontSize: "13px",
                                fontWeight: 700,
                                color: "#0f172a",
                                lineHeight: 1.2,
                              }}
                            >
                              {doc.name}
                            </div>
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#94a3b8",
                                marginTop: "3px",
                              }}
                            >
                              {doc.pages} pages
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* From Column */}
                      <td style={{ padding: "16px 18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          {renderCompanyLogo(doc.fromName)}
                          <div>
                            <div
                              style={{
                                fontSize: "13px",
                                fontWeight: 700,
                                color: "#0f172a",
                                lineHeight: 1.2,
                              }}
                            >
                              {doc.fromName}
                            </div>
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#94a3b8",
                                marginTop: "3px",
                              }}
                            >
                              {doc.fromEmail}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Type Pill */}
                      <td style={{ padding: "16px 18px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 10px",
                            borderRadius: "6px",
                            fontSize: "11.5px",
                            fontWeight: 600,
                            backgroundColor: typePillBg,
                            color: typePillColor,
                          }}
                        >
                          {doc.type}
                        </span>
                      </td>

                      {/* Received On */}
                      <td style={{ padding: "16px 18px" }}>
                        <div
                          style={{
                            fontSize: "12.5px",
                            fontWeight: 600,
                            color: "#0f172a",
                            lineHeight: 1.2,
                          }}
                        >
                          {doc.receivedDate}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#94a3b8",
                            marginTop: "3px",
                          }}
                        >
                          {doc.receivedTime}
                        </div>
                      </td>

                      {/* Valid Till Date */}
                      <td style={{ padding: "16px 18px" }}>
                        <div
                          style={{
                            fontSize: "12.5px",
                            fontWeight: 500,
                            color: "#334155",
                          }}
                        >
                          {doc.validTill}
                        </div>
                      </td>

                      {/* Pages Count */}
                      <td style={{ padding: "16px 18px" }}>
                        <div
                          style={{
                            fontSize: "12.5px",
                            fontWeight: 600,
                            color: "#334155",
                          }}
                        >
                          {doc.pages}
                        </div>
                      </td>

                      {/* Action Button: Review & Sign (Solid Blue) */}
                      <td style={{ padding: "16px 18px", textAlign: "center" }}>
                        <Link
                          href={doc.signUrl}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "7px 18px",
                            backgroundColor: "#2563eb",
                            color: "#ffffff",
                            borderRadius: "8px",
                            fontSize: "12.5px",
                            fontWeight: 600,
                            textDecoration: "none",
                            boxShadow: "0 1px 3px rgba(37,99,235,0.25)",
                            transition: "background-color 0.15s ease",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "#1d4ed8")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "#2563eb")
                          }
                        >
                          Review & Sign
                        </Link>
                      </td>

                      {/* 3 Dots Menu */}
                      <td
                        style={{
                          padding: "16px 14px",
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

                        {/* Dropdown Popover */}
                        {isMenuOpen && (
                          <div
                            style={{
                              position: "absolute",
                              right: "14px",
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
                              href={doc.signUrl}
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
                              <span>Signing Portal</span>
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
                              <span>Preview Document</span>
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

          {/* Table Footer with Pagination */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: "12px",
              borderTop: "1px solid #f1f5f9",
              fontSize: "12.5px",
              color: "#64748b",
            }}
          >
            <div>
              Showing 1 to {filteredDocs.length} of {documents.length} documents
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button
                type="button"
                disabled
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#ffffff",
                  color: "#cbd5e1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "not-allowed",
                }}
              >
                <ChevronLeft style={{ width: "16px", height: "16px" }} />
              </button>

              <button
                type="button"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "12.5px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                1
              </button>

              <button
                type="button"
                disabled
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#ffffff",
                  color: "#cbd5e1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "not-allowed",
                }}
              >
                <ChevronRight style={{ width: "16px", height: "16px" }} />
              </button>
            </div>
          </div>
        </div>

        {/* ================= 4. BOTTOM "NEED HELP SIGNING?" BANNER ================= */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #eef2f6",
            boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
            boxSizing: "border-box",
          }}
        >
          {/* Left Side: Shield + Text */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "14px",
                backgroundColor: "#eff6ff",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ShieldCheck style={{ width: "24px", height: "24px" }} />
            </div>
            <div>
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#0f172a",
                  margin: 0,
                }}
              >
                Need Help Signing?
              </h3>
              <p
                style={{
                  fontSize: "12.5px",
                  color: "#64748b",
                  margin: "3px 0 0 0",
                  fontWeight: 400,
                }}
              >
                Review the document, check the details and add your signature. If you have any questions, feel free to contact the sender.
              </p>
            </div>
          </div>

          {/* Right Side Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              type="button"
              onClick={() => setIsContactOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                fontSize: "12.5px",
                fontWeight: 600,
                color: "#2563eb",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f8fafc")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#ffffff")
              }
            >
              <Headphones style={{ width: "15px", height: "15px", color: "#2563eb" }} />
              <span>Contact Sender</span>
            </button>

            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                fontSize: "12.5px",
                fontWeight: 600,
                color: "#2563eb",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f8fafc")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#ffffff")
              }
            >
              <BookOpen style={{ width: "15px", height: "15px", color: "#2563eb" }} />
              <span>View Signing Guide</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= MODAL: CONTACT SENDER ================= */}
      {isContactOpen && (
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
              maxWidth: "460px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                Contact Sender
              </h3>
              <button
                type="button"
                onClick={() => setIsContactOpen(false)}
                style={{ border: "none", backgroundColor: "transparent", cursor: "pointer", color: "#94a3b8" }}
              >
                <X style={{ width: "18px", height: "18px" }} />
              </button>
            </div>
            <div style={{ padding: "24px" }}>
              <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px 0" }}>
                Send a quick question or request clarification regarding your pending documents.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Select Sender
                  </label>
                  <select
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "13px",
                      outline: "none",
                      backgroundColor: "#ffffff",
                    }}
                  >
                    <option>VorldXnologies Pvt Ltd (john.doe@email.com)</option>
                    <option>BrightPath Solutions (sarah@brightpath.com)</option>
                    <option>Northstar Systems (contact@northstar.com)</option>
                    <option>Zenith Innovations (info@zenith.com)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Your Message
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Type your message or requested changes here..."
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "13px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                <button
                  type="button"
                  onClick={() => setIsContactOpen(false)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#ffffff",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsContactOpen(false);
                    showToast("Message sent to sender successfully!");
                  }}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: VIEW SIGNING GUIDE ================= */}
      {isGuideOpen && (
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
              maxWidth: "500px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                Digital Signing Guide
              </h3>
              <button
                type="button"
                onClick={() => setIsGuideOpen(false)}
                style={{ border: "none", backgroundColor: "transparent", cursor: "pointer", color: "#94a3b8" }}
              >
                <X style={{ width: "18px", height: "18px" }} />
              </button>
            </div>
            <div style={{ padding: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "12px", flexShrink: 0 }}>1</div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>Click &quot;Review &amp; Sign&quot;</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>Open the interactive document review portal.</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "12px", flexShrink: 0 }}>2</div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>Review Terms &amp; Quotations</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>Inspect scope of work, pricing, timelines, and legal clauses.</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "12px", flexShrink: 0 }}>3</div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>Sign Electronically or Request Changes</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>Use draw/type signature with cryptographic timestamp or submit change requests directly.</div>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
                <button
                  type="button"
                  onClick={() => setIsGuideOpen(false)}
                  style={{
                    padding: "8px 20px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </RecipientLayout>
  );
}
