"use client";

import React, { useState, useMemo, useEffect } from "react";
import RecipientLayout from "@/components/RecipientLayout";
import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle2,
  MessageSquare,
  X,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  ArrowUpDown,
  Eye,
  Download,
  PenTool,
  Trash2,
} from "lucide-react";

interface SharedDoc {
  id: string;
  name: string;
  pages: number;
  fromName: string;
  fromEmail: string;
  type: "Quotation" | "MOU" | "Agreement" | "NDA";
  receivedDate: string;
  receivedTime: string;
  status: "Pending Signature" | "Changes Requested" | "Signed" | "Declined";
  signUrl: string;
  previewUrl: string;
}

const SEED_SHARED_DOCS: SharedDoc[] = [
  {
    id: "doc-1",
    name: "Quotation - Q-001",
    pages: 2,
    fromName: "ACME Technologies Pvt Ltd",
    fromEmail: "john.doe@email.com",
    type: "Quotation",
    receivedDate: "28 Oct 2026",
    receivedTime: "10:30 AM",
    status: "Pending Signature",
    signUrl: "/sign/doc-1",
    previewUrl: "/preview/doc-1",
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
    status: "Changes Requested",
    signUrl: "/sign/doc-2",
    previewUrl: "/preview/doc-2",
  },
  {
    id: "doc-3",
    name: "Service Agreement - SA-003",
    pages: 4,
    fromName: "Northstar Systems",
    fromEmail: "contact@northstar.com",
    type: "Agreement",
    receivedDate: "22 Oct 2026",
    receivedTime: "11:20 AM",
    status: "Signed",
    signUrl: "/sign/doc-3",
    previewUrl: "/preview/doc-3",
  },
  {
    id: "doc-4",
    name: "Quotation - Q-008",
    pages: 3,
    fromName: "ACME Technologies Pvt Ltd",
    fromEmail: "john.doe@email.com",
    type: "Quotation",
    receivedDate: "20 Oct 2026",
    receivedTime: "09:45 AM",
    status: "Signed",
    signUrl: "/sign/doc-4",
    previewUrl: "/preview/doc-4",
  },
  {
    id: "doc-5",
    name: "NDA - NDA-006",
    pages: 3,
    fromName: "Zenith Innovations",
    fromEmail: "info@zenith.com",
    type: "NDA",
    receivedDate: "18 Oct 2026",
    receivedTime: "04:10 PM",
    status: "Declined",
    signUrl: "/sign/doc-5",
    previewUrl: "/preview/doc-5",
  },
];

export default function SharedWithMePage() {
  const [documents, setDocuments] = useState<SharedDoc[]>(SEED_SHARED_DOCS);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Document Types");
  const [senderFilter, setSenderFilter] = useState("All Senders");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sortBy, setSortBy] = useState<"Newest" | "Oldest" | "Name">("Newest");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  // Stats calculation
  const totalDocs = documents.length;
  const pendingCount = documents.filter(
    (d) => d.status === "Pending Signature" || d.status === "Changes Requested"
  ).length;
  const signedCount = documents.filter((d) => d.status === "Signed").length;
  const declinedCount = documents.filter((d) => d.status === "Declined").length;

  // Filtered & Sorted documents
  const filteredDocs = useMemo(() => {
    const result = documents.filter((doc) => {
      const matchSearch =
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.fromName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.fromEmail.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType =
        typeFilter === "All Document Types" || doc.type === typeFilter;
      const matchSender =
        senderFilter === "All Senders" || doc.fromName === senderFilter;
      const matchStatus =
        statusFilter === "All Status" || doc.status === statusFilter;
      return matchSearch && matchType && matchSender && matchStatus;
    });

    if (sortBy === "Oldest") {
      result.reverse();
    } else if (sortBy === "Name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }
    return result;
  }, [documents, searchTerm, typeFilter, senderFilter, statusFilter, sortBy]);

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

  const handleDownloadPDF = (doc: SharedDoc) => {
    setActiveMenuId(null);
    showToast(`Downloading PDF for ${doc.name}...`);
    if (typeof window !== "undefined") {
      const w = window.open(`/preview/${doc.id}?autoPrint=true`, "_blank");
      if (w) w.focus();
    }
  };

  const handleDelete = (doc: SharedDoc) => {
    setActiveMenuId(null);
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    showToast(`Removed ${doc.name} from list`);
  };

  return (
    <RecipientLayout activePath="/recipient/shared">
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
              Shared with Me
            </h1>
            <p
              style={{
                fontSize: "13.5px",
                color: "#64748b",
                margin: "4px 0 0 0",
                fontWeight: 400,
              }}
            >
              Documents shared with you for review and signature.
            </p>
          </div>

          {/* Right Illustration matching screenshot */}
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
                width: "140px",
                height: "100px",
                borderRadius: "50%",
                background: "radial-gradient(circle, #e0f2fe 0%, #eff6ff 70%, transparent 100%)",
                filter: "blur(4px)",
              }}
            />

            {/* Back Paper with fold and blue signature */}
            <div
              style={{
                position: "absolute",
                right: "26px",
                top: "6px",
                width: "100px",
                height: "76px",
                backgroundColor: "#ffffff",
                border: "1.5px solid #bfdbfe",
                borderRadius: "10px",
                boxShadow: "0 4px 12px rgba(37,99,235,0.08)",
                padding: "8px",
                transform: "rotate(4deg)",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ width: "30px", height: "3px", backgroundColor: "#3b82f6", borderRadius: "2px" }} />
                <div style={{ width: "55px", height: "2.5px", backgroundColor: "#e2e8f0", borderRadius: "2px" }} />
                <div style={{ width: "45px", height: "2.5px", backgroundColor: "#e2e8f0", borderRadius: "2px" }} />
              </div>
              <div
                style={{
                  textAlign: "right",
                  fontFamily: "'Brush Script MT', cursive, sans-serif",
                  fontSize: "15px",
                  color: "#2563eb",
                  fontWeight: 600,
                  transform: "rotate(-5deg)",
                  letterSpacing: "0.5px",
                }}
              >
                J. Doe
              </div>
            </div>

            {/* Front Card with checkmark */}
            <div
              style={{
                position: "absolute",
                right: "88px",
                top: "14px",
                width: "90px",
                height: "68px",
                backgroundColor: "#f8fafc",
                border: "1.5px solid #cbd5e1",
                borderRadius: "10px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.04)",
                padding: "8px",
                transform: "rotate(-6deg)",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ width: "24px", height: "3px", backgroundColor: "#60a5fa", borderRadius: "2px" }} />
                <div style={{ width: "48px", height: "2.5px", backgroundColor: "#cbd5e1", borderRadius: "2px" }} />
              </div>
              <div
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  backgroundColor: "#dcfce7",
                  color: "#16a34a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  fontWeight: 800,
                }}
              >
                ✓
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
                right: "4px",
                top: "0px",
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

        {/* ================= 2. FOUR SUMMARY STAT CARDS ================= */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "18px",
          }}
        >
          {/* Card 1: Total Documents */}
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
                {totalDocs}
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

          {/* Card 2: Pending Signature */}
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
                {pendingCount}
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

          {/* Card 3: Signed */}
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
                {signedCount}
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

          {/* Card 4: Declined */}
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
                {declinedCount}
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
          {/* Filter Bar with Dropdowns and Sort */}
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
            <div style={{ position: "relative", width: "260px" }}>
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

            {/* Dropdown Filters */}
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
                  <option value="ACME Technologies Pvt Ltd">ACME Technologies Pvt Ltd</option>
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

              {/* Status Filter */}
              <div style={{ position: "relative" }}>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
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
                  <option value="All Status">All Status</option>
                  <option value="Pending Signature">Pending Signature</option>
                  <option value="Changes Requested">Changes Requested</option>
                  <option value="Signed">Signed</option>
                  <option value="Declined">Declined</option>
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
                    <option value="Name">Name</option>
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
                    Status
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
                  const isBottom = docIdx >= 3;

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

                      {/* Status Column */}
                      <td style={{ padding: "16px 18px" }}>
                        {doc.status === "Pending Signature" && (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "4px 12px",
                              borderRadius: "9999px",
                              fontSize: "11.5px",
                              fontWeight: 600,
                              backgroundColor: "#fffbeb",
                              color: "#b45309",
                              border: "1px solid #fef3c7",
                            }}
                          >
                            <Clock style={{ width: "13px", height: "13px", color: "#d97706" }} />
                            <span>Pending Signature</span>
                          </span>
                        )}
                        {doc.status === "Changes Requested" && (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "4px 12px",
                              borderRadius: "9999px",
                              fontSize: "11.5px",
                              fontWeight: 600,
                              backgroundColor: "#fff7ed",
                              color: "#c2410c",
                              border: "1px solid #ffedd5",
                            }}
                          >
                            <MessageSquare style={{ width: "13px", height: "13px", color: "#ea580c" }} />
                            <span>Changes Requested</span>
                          </span>
                        )}
                        {doc.status === "Signed" && (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "4px 12px",
                              borderRadius: "9999px",
                              fontSize: "11.5px",
                              fontWeight: 600,
                              backgroundColor: "#f0fdf4",
                              color: "#15803d",
                              border: "1px solid #dcfce7",
                            }}
                          >
                            <CheckCircle2 style={{ width: "13px", height: "13px", color: "#16a34a" }} />
                            <span>Signed</span>
                          </span>
                        )}
                        {doc.status === "Declined" && (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "4px 12px",
                              borderRadius: "9999px",
                              fontSize: "11.5px",
                              fontWeight: 600,
                              backgroundColor: "#fef2f2",
                              color: "#b91c1c",
                              border: "1px solid #fee2e2",
                            }}
                          >
                            <X style={{ width: "13px", height: "13px", color: "#dc2626" }} />
                            <span>Declined</span>
                          </span>
                        )}
                      </td>

                      {/* Action Button */}
                      <td style={{ padding: "16px 18px", textAlign: "center" }}>
                        {doc.status === "Pending Signature" && (
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
                        )}
                        {doc.status === "Changes Requested" && (
                          <Link
                            href={doc.previewUrl}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "7px 20px",
                              backgroundColor: "#ffffff",
                              color: "#2563eb",
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                              fontSize: "12.5px",
                              fontWeight: 600,
                              textDecoration: "none",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor = "#f8fafc")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor = "#ffffff")
                            }
                          >
                            View
                          </Link>
                        )}
                        {doc.status === "Signed" && (
                          <Link
                            href={doc.previewUrl}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "7px 18px",
                              backgroundColor: "#ffffff",
                              color: "#2563eb",
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                              fontSize: "12.5px",
                              fontWeight: 600,
                              textDecoration: "none",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor = "#f8fafc")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor = "#ffffff")
                            }
                          >
                            View PDF
                          </Link>
                        )}
                        {doc.status === "Declined" && (
                          <Link
                            href={doc.previewUrl}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "7px 20px",
                              backgroundColor: "#ffffff",
                              color: "#2563eb",
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                              fontSize: "12.5px",
                              fontWeight: 600,
                              textDecoration: "none",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor = "#f8fafc")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor = "#ffffff")
                            }
                          >
                            View
                          </Link>
                        )}
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
                              href={doc.previewUrl}
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
      </div>
    </RecipientLayout>
  );
}
