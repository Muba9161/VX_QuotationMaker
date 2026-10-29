"use client";

import React, { useState, useMemo, useEffect } from "react";
import RecipientLayout from "@/components/RecipientLayout";
import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle2,
  X,
  XCircle,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Calendar,
  Info,
  Headphones,
  Check,
  Eye,
  Download,
  Send,
  Building,
  Mail,
  ArrowRight,
  ShieldAlert,
  FileCheck,
} from "lucide-react";

interface DeclinedDocument {
  id: string;
  name: string;
  pages: number;
  type: "Quotation" | "MOU" | "Agreement" | "NDA";
  senderName: string;
  senderEmail: string;
  receivedDate: string;
  receivedTime: string;
  declinedDate: string;
  declinedTime: string;
  declineReason: string;
  previewUrl: string;
}

const SEED_DECLINED_DOCUMENTS: DeclinedDocument[] = [
  {
    id: "dec-1",
    name: "NDA - NDA-006",
    pages: 3,
    type: "NDA",
    senderName: "Zenith Innovations",
    senderEmail: "info@zenith.com",
    receivedDate: "18 Oct 2026",
    receivedTime: "10:15 AM",
    declinedDate: "20 Oct 2026",
    declinedTime: "02:30 PM",
    declineReason: "Not interested at this time.",
    previewUrl: "/preview/doc-1",
  },
  {
    id: "dec-2",
    name: "Quotation - Q-005",
    pages: 2,
    type: "Quotation",
    senderName: "ZCME Technologies Pvt Ltd",
    senderEmail: "john.doe@acme.com",
    receivedDate: "15 Oct 2026",
    receivedTime: "11:20 AM",
    declinedDate: "16 Oct 2026",
    declinedTime: "09:45 AM",
    declineReason: "Pricing is higher than expected.",
    previewUrl: "/preview/doc-2",
  },
  {
    id: "dec-3",
    name: "Service Agreement - SA-007",
    pages: 5,
    type: "Agreement",
    senderName: "Northstar Systems",
    senderEmail: "contact@northstar.com",
    receivedDate: "12 Oct 2026",
    receivedTime: "01:10 PM",
    declinedDate: "14 Oct 2026",
    declinedTime: "04:20 PM",
    declineReason: "Need different terms and conditions.",
    previewUrl: "/preview/doc-3",
  },
  {
    id: "dec-4",
    name: "MOU - M-011",
    pages: 4,
    type: "MOU",
    senderName: "BrightPath Solutions",
    senderEmail: "sarah@brightpath.com",
    receivedDate: "10 Oct 2026",
    receivedTime: "09:30 AM",
    declinedDate: "12 Oct 2026",
    declinedTime: "11:50 AM",
    declineReason: "Not aligned with current requirements.",
    previewUrl: "/preview/doc-4",
  },
  {
    id: "dec-5",
    name: "Quotation - Q-003",
    pages: 2,
    type: "Quotation",
    senderName: "ACME Technologies Pvt Ltd",
    senderEmail: "john.doe@acme.com",
    receivedDate: "05 Oct 2026",
    receivedTime: "03:15 PM",
    declinedDate: "06 Oct 2026",
    declinedTime: "10:40 AM",
    declineReason: "Going with another vendor.",
    previewUrl: "/preview/doc-5",
  },
];

export default function DeclinedDocumentsPage() {
  const [documents, setDocuments] = useState<DeclinedDocument[]>(SEED_DECLINED_DOCUMENTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Document Types");
  const [senderFilter, setSenderFilter] = useState("All Senders");
  const [timeFilter, setTimeFilter] = useState("All Time");

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<DeclinedDocument | null>(null);
  const [contactDoc, setContactDoc] = useState<DeclinedDocument | null>(null);
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Close menus on outside click
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
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Sender company list for dropdown
  const uniqueSenders = useMemo(() => {
    const set = new Set(SEED_DECLINED_DOCUMENTS.map((d) => d.senderName));
    return Array.from(set);
  }, []);

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // Search
      const search = searchTerm.toLowerCase().trim();
      const matchSearch =
        !search ||
        doc.name.toLowerCase().includes(search) ||
        doc.senderName.toLowerCase().includes(search) ||
        doc.senderEmail.toLowerCase().includes(search) ||
        doc.declineReason.toLowerCase().includes(search);

      // Type filter
      const matchType =
        typeFilter === "All Document Types" || doc.type.toLowerCase() === typeFilter.toLowerCase();

      // Sender filter
      const matchSender =
        senderFilter === "All Senders" ||
        doc.senderName.toLowerCase() === senderFilter.toLowerCase();

      return matchSearch && matchType && matchSender;
    });
  }, [documents, searchTerm, typeFilter, senderFilter]);

  const handleOpenContact = (doc: DeclinedDocument) => {
    setContactDoc(doc);
    setContactSubject(`Regarding Declined Document: ${doc.name}`);
    setContactMessage(`Hello ${doc.senderName},\n\nI would like to discuss the terms regarding "${doc.name}" that was recently declined.`);
    setActiveMenuId(null);
  };

  const handleSendContactMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;
    showToast(`Message sent successfully to ${contactDoc?.senderName}!`);
    setContactDoc(null);
  };

  const getTypeBadgeStyle = (type: string) => {
    switch (type) {
      case "Quotation":
        return {
          bg: "#e0f2fe",
          color: "#0284c7",
          border: "#bae6fd",
        };
      case "Agreement":
        return {
          bg: "#dcfce7",
          color: "#059669",
          border: "#bbf7d0",
        };
      case "MOU":
        return {
          bg: "#f3e8ff",
          color: "#7c3aed",
          border: "#e9d5ff",
        };
      case "NDA":
        return {
          bg: "#ffe4e6",
          color: "#e11d48",
          border: "#fecdd3",
        };
      default:
        return {
          bg: "#f1f5f9",
          color: "#475569",
          border: "#e2e8f0",
        };
    }
  };

  const getDocIconStyle = (type: string) => {
    switch (type) {
      case "Quotation":
        return {
          bg: "#eff6ff",
          border: "#bfdbfe",
          color: "#2563eb",
        };
      case "Agreement":
        return {
          bg: "#ecfdf5",
          border: "#a7f3d0",
          color: "#10b981",
        };
      case "MOU":
        return {
          bg: "#faf5ff",
          border: "#e9d5ff",
          color: "#8b5cf6",
        };
      case "NDA":
        return {
          bg: "#fef2f2",
          border: "#fecaca",
          color: "#ef4444",
        };
      default:
        return {
          bg: "#f8fafc",
          border: "#e2e8f0",
          color: "#64748b",
        };
    }
  };

  const renderSenderLogo = (sender: string) => {
    if (sender.includes("Zenith")) {
      return (
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "7px",
            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontWeight: "800",
            fontSize: "14px",
            boxShadow: "0 2px 4px rgba(124, 58, 237, 0.2)",
            flexShrink: 0,
          }}
        >
          Z
        </div>
      );
    }
    if (sender.includes("Northstar")) {
      return (
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "7px",
            background: "linear-gradient(135deg, #0f766e, #14b8a6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontWeight: "800",
            fontSize: "14px",
            boxShadow: "0 2px 4px rgba(15, 118, 110, 0.2)",
            flexShrink: 0,
          }}
        >
          N
        </div>
      );
    }
    if (sender.includes("BrightPath")) {
      return (
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "7px",
            background: "linear-gradient(135deg, #0284c7, #06b6d4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontWeight: "800",
            fontSize: "14px",
            boxShadow: "0 2px 4px rgba(2, 132, 199, 0.2)",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "14px",
              height: "14px",
              borderLeft: "3px solid #fff",
              borderBottom: "3px solid #fff",
              transform: "rotate(-45deg)",
            }}
          />
        </div>
      );
    }
    // ACME / ZCME
    return (
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "7px",
          background: "linear-gradient(135deg, #2563eb, #3b82f6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          fontWeight: "800",
          fontSize: "14px",
          boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)",
          flexShrink: 0,
        }}
      >
        ▲
      </div>
    );
  };

  return (
    <RecipientLayout activePath="/recipient/declined">
      {/* Toast */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "28px",
            right: "28px",
            zIndex: 9999,
            background: "#0f172a",
            color: "#ffffff",
            padding: "12px 22px",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          <Check size={16} color="#10b981" />
          {toastMessage}
        </div>
      )}

      <div
        style={{
          width: "100%",
          maxWidth: "1400px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* ================= HERO HEADER CARD ================= */}
        <div
          style={{
            position: "relative",
            background: "#ffffff",
            borderRadius: "18px",
            padding: "30px 36px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
            border: "1px solid #edf2f7",
            overflow: "hidden",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Left Text */}
          <div style={{ maxWidth: "600px", zIndex: 1 }}>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "800",
                color: "#0f172a",
                letterSpacing: "-0.02em",
                margin: "0 0 8px 0",
              }}
            >
              Declined Documents
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "#64748b",
                margin: 0,
                fontWeight: "400",
              }}
            >
              Documents you have declined to sign.
            </p>
          </div>

          {/* Right Vector Illustration */}
          <div
            style={{
              position: "relative",
              width: "200px",
              height: "100px",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              flexShrink: 0,
            }}
          >
            {/* Soft pink/red glowing backdrop */}
            <div
              style={{
                position: "absolute",
                right: "-10px",
                top: "-15px",
                width: "160px",
                height: "120px",
                background: "radial-gradient(ellipse at center, rgba(254, 226, 226, 0.8) 0%, rgba(254, 242, 242, 0.3) 70%, transparent 100%)",
                borderRadius: "50%",
                filter: "blur(14px)",
              }}
            />

            {/* Document sheet card */}
            <div
              style={{
                position: "relative",
                width: "95px",
                height: "85px",
                background: "#ffffff",
                borderRadius: "10px",
                boxShadow: "0 8px 24px rgba(239, 68, 68, 0.14), 0 2px 6px rgba(0,0,0,0.04)",
                border: "1px solid #fee2e2",
                padding: "12px 10px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                transform: "rotate(4deg)",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "5px",
                  background: "#e2e8f0",
                  borderRadius: "3px",
                }}
              />
              <div
                style={{
                  width: "75%",
                  height: "5px",
                  background: "#cbd5e1",
                  borderRadius: "3px",
                }}
              />
              <div
                style={{
                  width: "85%",
                  height: "5px",
                  background: "#e2e8f0",
                  borderRadius: "3px",
                }}
              />
              <div
                style={{
                  width: "50%",
                  height: "5px",
                  background: "#e2e8f0",
                  borderRadius: "3px",
                }}
              />
            </div>

            {/* Big Red Declined Circle Badge */}
            <div
              style={{
                position: "absolute",
                right: "68px",
                top: "22px",
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                boxShadow: "0 6px 16px rgba(239, 68, 68, 0.4)",
                border: "3px solid #ffffff",
                zIndex: 2,
              }}
            >
              <X size={22} strokeWidth={3} />
            </div>

            {/* Secondary soft particle */}
            <div
              style={{
                position: "absolute",
                right: "135px",
                bottom: "16px",
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                background: "rgba(239, 68, 68, 0.2)",
              }}
            />
          </div>
        </div>

        {/* ================= 4 METRIC STATS CARDS ================= */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: "18px",
          }}
        >
          {/* Card 1: Declined Documents */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "20px 22px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
              border: "1px solid #edf2f7",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "#fee2e2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ef4444",
                flexShrink: 0,
              }}
            >
              <X size={24} strokeWidth={2.5} />
            </div>
            <div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "800",
                  color: "#0f172a",
                  lineHeight: "1.2",
                }}
              >
                3
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#0f172a",
                  marginTop: "2px",
                }}
              >
                Declined Documents
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  marginTop: "1px",
                }}
              >
                Not signed by you
              </div>
            </div>
          </div>

          {/* Card 2: Total Documents */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "20px 22px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
              border: "1px solid #edf2f7",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "#eff6ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#2563eb",
                flexShrink: 0,
              }}
            >
              <FileText size={22} strokeWidth={2.2} />
            </div>
            <div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "800",
                  color: "#0f172a",
                  lineHeight: "1.2",
                }}
              >
                8
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#0f172a",
                  marginTop: "2px",
                }}
              >
                Total Documents
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  marginTop: "1px",
                }}
              >
                Shared with you
              </div>
            </div>
          </div>

          {/* Card 3: Pending Signature */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "20px 22px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
              border: "1px solid #edf2f7",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "#fef3c7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#f59e0b",
                flexShrink: 0,
              }}
            >
              <Clock size={22} strokeWidth={2.2} />
            </div>
            <div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "800",
                  color: "#0f172a",
                  lineHeight: "1.2",
                }}
              >
                2
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#0f172a",
                  marginTop: "2px",
                }}
              >
                Pending Signature
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  marginTop: "1px",
                }}
              >
                Need your action
              </div>
            </div>
          </div>

          {/* Card 4: Signed Documents */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "20px 22px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
              border: "1px solid #edf2f7",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "#dcfce7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#10b981",
                flexShrink: 0,
              }}
            >
              <CheckCircle2 size={22} strokeWidth={2.2} />
            </div>
            <div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "800",
                  color: "#0f172a",
                  lineHeight: "1.2",
                }}
              >
                3
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#0f172a",
                  marginTop: "2px",
                }}
              >
                Signed Documents
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  marginTop: "1px",
                }}
              >
                Completed
              </div>
            </div>
          </div>
        </div>

        {/* ================= MAIN TABLE CONTAINER ================= */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "18px",
            padding: "24px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
            border: "1px solid #edf2f7",
          }}
        >
          {/* Filter Bar */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "14px",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            {/* Search Input */}
            <div
              style={{
                position: "relative",
                flex: "1 1 300px",
                maxWidth: "380px",
              }}
            >
              <Search
                size={18}
                color="#94a3b8"
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search declined documents..."
                style={{
                  width: "100%",
                  padding: "10px 14px 10px 42px",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  fontSize: "14px",
                  color: "#0f172a",
                  outline: "none",
                }}
              />
            </div>

            {/* Filter Dropdowns */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {/* Type Filter */}
              <div style={{ position: "relative" }}>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  style={{
                    appearance: "none",
                    padding: "9px 34px 9px 14px",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    background: "#ffffff",
                    fontSize: "13px",
                    fontWeight: "500",
                    color: "#334155",
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  <option value="All Document Types">All Document Types</option>
                  <option value="Quotation">Quotation</option>
                  <option value="Agreement">Agreement</option>
                  <option value="MOU">MOU</option>
                  <option value="NDA">NDA</option>
                </select>
                <ChevronDown
                  size={15}
                  color="#64748b"
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                />
              </div>

              {/* Sender Filter */}
              <div style={{ position: "relative" }}>
                <select
                  value={senderFilter}
                  onChange={(e) => setSenderFilter(e.target.value)}
                  style={{
                    appearance: "none",
                    padding: "9px 34px 9px 14px",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    background: "#ffffff",
                    fontSize: "13px",
                    fontWeight: "500",
                    color: "#334155",
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  <option value="All Senders">All Senders</option>
                  {uniqueSenders.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={15}
                  color="#64748b"
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                />
              </div>

              {/* Date Filter */}
              <div style={{ position: "relative" }}>
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  style={{
                    appearance: "none",
                    padding: "9px 34px 9px 34px",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    background: "#ffffff",
                    fontSize: "13px",
                    fontWeight: "500",
                    color: "#334155",
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  <option value="All Time">All Time</option>
                  <option value="Today">Today</option>
                  <option value="Last 7 Days">Last 7 Days</option>
                  <option value="Last 30 Days">Last 30 Days</option>
                  <option value="This Month">This Month</option>
                </select>
                <Calendar
                  size={14}
                  color="#64748b"
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                />
                <ChevronDown
                  size={15}
                  color="#64748b"
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: "0 8px",
              }}
            >
              <thead>
                <tr style={{ color: "#0f172a", fontSize: "13px", fontWeight: "700" }}>
                  <th style={{ textAlign: "left", padding: "12px 14px", width: "240px" }}>Document</th>
                  <th style={{ textAlign: "left", padding: "12px 14px", width: "100px" }}>Type</th>
                  <th style={{ textAlign: "left", padding: "12px 14px", width: "200px" }}>From</th>
                  <th style={{ textAlign: "left", padding: "12px 14px", width: "130px" }}>Received On</th>
                  <th style={{ textAlign: "left", padding: "12px 14px", width: "130px" }}>Declined On</th>
                  <th style={{ textAlign: "left", padding: "12px 14px" }}>Reason for Declining</th>
                  <th style={{ textAlign: "center", padding: "12px 14px", width: "120px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        textAlign: "center",
                        padding: "48px 16px",
                        color: "#64748b",
                        fontSize: "14px",
                      }}
                    >
                      No declined documents match your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredDocuments.map((doc) => {
                    const typeStyle = getTypeBadgeStyle(doc.type);
                    const iconStyle = getDocIconStyle(doc.type);
                    const isMenuOpen = activeMenuId === doc.id;

                    return (
                      <tr
                        key={doc.id}
                        style={{
                          background: "#ffffff",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                          borderRadius: "12px",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {/* Document */}
                        <td
                          style={{
                            padding: "16px 14px",
                            borderTop: "1px solid #f1f5f9",
                            borderBottom: "1px solid #f1f5f9",
                            borderLeft: "1px solid #f1f5f9",
                            borderTopLeftRadius: "12px",
                            borderBottomLeftRadius: "12px",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "8px",
                                background: iconStyle.bg,
                                border: `1px solid ${iconStyle.border}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: iconStyle.color,
                                flexShrink: 0,
                              }}
                            >
                              <FileText size={18} />
                            </div>
                            <div>
                              <div
                                style={{
                                  fontSize: "14px",
                                  fontWeight: "700",
                                  color: "#0f172a",
                                }}
                              >
                                {doc.name}
                              </div>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "#64748b",
                                  marginTop: "2px",
                                }}
                              >
                                {doc.pages} pages
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Type */}
                        <td
                          style={{
                            padding: "16px 14px",
                            borderTop: "1px solid #f1f5f9",
                            borderBottom: "1px solid #f1f5f9",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-block",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: "600",
                              background: typeStyle.bg,
                              color: typeStyle.color,
                              border: `1px solid ${typeStyle.border}`,
                            }}
                          >
                            {doc.type}
                          </span>
                        </td>

                        {/* From */}
                        <td
                          style={{
                            padding: "16px 14px",
                            borderTop: "1px solid #f1f5f9",
                            borderBottom: "1px solid #f1f5f9",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            {renderSenderLogo(doc.senderName)}
                            <div>
                              <div
                                style={{
                                  fontSize: "13px",
                                  fontWeight: "600",
                                  color: "#0f172a",
                                }}
                              >
                                {doc.senderName}
                              </div>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "#64748b",
                                }}
                              >
                                {doc.senderEmail}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Received On */}
                        <td
                          style={{
                            padding: "16px 14px",
                            borderTop: "1px solid #f1f5f9",
                            borderBottom: "1px solid #f1f5f9",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "13px",
                              fontWeight: "500",
                              color: "#0f172a",
                            }}
                          >
                            {doc.receivedDate}
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#64748b",
                              marginTop: "2px",
                            }}
                          >
                            {doc.receivedTime}
                          </div>
                        </td>

                        {/* Declined On */}
                        <td
                          style={{
                            padding: "16px 14px",
                            borderTop: "1px solid #f1f5f9",
                            borderBottom: "1px solid #f1f5f9",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "13px",
                              fontWeight: "500",
                              color: "#0f172a",
                            }}
                          >
                            {doc.declinedDate}
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#64748b",
                              marginTop: "2px",
                            }}
                          >
                            {doc.declinedTime}
                          </div>
                        </td>

                        {/* Reason for Declining */}
                        <td
                          style={{
                            padding: "16px 14px",
                            borderTop: "1px solid #f1f5f9",
                            borderBottom: "1px solid #f1f5f9",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "13px",
                              color: "#334155",
                              lineHeight: "1.4",
                            }}
                          >
                            {doc.declineReason}
                          </span>
                        </td>

                        {/* Action */}
                        <td
                          style={{
                            padding: "16px 14px",
                            borderTop: "1px solid #f1f5f9",
                            borderBottom: "1px solid #f1f5f9",
                            borderRight: "1px solid #f1f5f9",
                            borderTopRightRadius: "12px",
                            borderBottomRightRadius: "12px",
                            textAlign: "center",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "8px",
                            }}
                            data-doc-menu
                          >
                            <button
                              onClick={() => setSelectedDoc(doc)}
                              style={{
                                padding: "6px 16px",
                                borderRadius: "8px",
                                border: "1px solid #bae6fd",
                                background: "#f0f9ff",
                                color: "#0284c7",
                                fontSize: "13px",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                              }}
                              onMouseOver={(e) => {
                                (e.currentTarget as HTMLElement).style.background = "#e0f2fe";
                              }}
                              onMouseOut={(e) => {
                                (e.currentTarget as HTMLElement).style.background = "#f0f9ff";
                              }}
                            >
                              View
                            </button>

                            {/* ••• Popover button */}
                            <div style={{ position: "relative" }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(isMenuOpen ? null : doc.id);
                                }}
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "8px",
                                  border: "none",
                                  background: isMenuOpen ? "#f1f5f9" : "transparent",
                                  color: "#64748b",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <MoreVertical size={16} />
                              </button>

                              {/* Menu Dropdown */}
                              {isMenuOpen && (
                                <div
                                  style={{
                                    position: "absolute",
                                    right: 0,
                                    top: "38px",
                                    width: "185px",
                                    background: "#ffffff",
                                    borderRadius: "10px",
                                    boxShadow: "0 10px 25px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.04)",
                                    border: "1px solid #e2e8f0",
                                    padding: "6px",
                                    zIndex: 50,
                                    textAlign: "left",
                                  }}
                                >
                                  <button
                                    onClick={() => {
                                      setSelectedDoc(doc);
                                      setActiveMenuId(null);
                                    }}
                                    style={{
                                      width: "100%",
                                      padding: "8px 12px",
                                      borderRadius: "6px",
                                      border: "none",
                                      background: "transparent",
                                      color: "#334155",
                                      fontSize: "13px",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                      cursor: "pointer",
                                    }}
                                    onMouseOver={(e) => (e.currentTarget.style.background = "#f8fafc")}
                                    onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                                  >
                                    <Eye size={14} color="#64748b" />
                                    View Details
                                  </button>
                                  <Link
                                    href={doc.previewUrl}
                                    style={{
                                      width: "100%",
                                      padding: "8px 12px",
                                      borderRadius: "6px",
                                      color: "#334155",
                                      fontSize: "13px",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                      textDecoration: "none",
                                    }}
                                    onMouseOver={(e) => (e.currentTarget.style.background = "#f8fafc")}
                                    onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                                  >
                                    <FileText size={14} color="#64748b" />
                                    Open Preview
                                  </Link>
                                  <button
                                    onClick={() => handleOpenContact(doc)}
                                    style={{
                                      width: "100%",
                                      padding: "8px 12px",
                                      borderRadius: "6px",
                                      border: "none",
                                      background: "transparent",
                                      color: "#334155",
                                      fontSize: "13px",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                      cursor: "pointer",
                                    }}
                                    onMouseOver={(e) => (e.currentTarget.style.background = "#f8fafc")}
                                    onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                                  >
                                    <Mail size={14} color="#64748b" />
                                    Contact Sender
                                  </button>
                                  <button
                                    onClick={() => {
                                      showToast(`Downloading PDF for ${doc.name}...`);
                                      setActiveMenuId(null);
                                    }}
                                    style={{
                                      width: "100%",
                                      padding: "8px 12px",
                                      borderRadius: "6px",
                                      border: "none",
                                      background: "transparent",
                                      color: "#334155",
                                      fontSize: "13px",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                      cursor: "pointer",
                                    }}
                                    onMouseOver={(e) => (e.currentTarget.style.background = "#f8fafc")}
                                    onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                                  >
                                    <Download size={14} color="#64748b" />
                                    Download Copy
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "20px",
              paddingTop: "16px",
              borderTop: "1px solid #f1f5f9",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div style={{ fontSize: "13px", color: "#64748b" }}>
              Showing 1 to {filteredDocuments.length} of {filteredDocuments.length} declined documents
            </div>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <button
                disabled
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  background: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#cbd5e1",
                  cursor: "not-allowed",
                }}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#2563eb",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                1
              </button>
              <button
                disabled
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  background: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#cbd5e1",
                  cursor: "not-allowed",
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ================= BOTTOM HELP BANNER ================= */}
        <div
          style={{
            background: "#f0f7ff",
            borderRadius: "16px",
            padding: "20px 24px",
            border: "1px solid #dbeafe",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "#dbeafe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#2563eb",
                flexShrink: 0,
              }}
            >
              <Info size={20} strokeWidth={2.4} />
            </div>
            <div>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "#0f172a",
                }}
              >
                Need Help?
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#475569",
                  marginTop: "2px",
                }}
              >
                If you have any questions about a declined document or want to discuss further, please contact the sender directly.
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (documents.length > 0) {
                handleOpenContact(documents[0]);
              } else {
                showToast("No senders available to contact.");
              }
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "10px",
              border: "1px solid #bfdbfe",
              background: "#ffffff",
              color: "#1d4ed8",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(37, 99, 235, 0.08)",
              transition: "all 0.15s ease",
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#eff6ff";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#ffffff";
            }}
          >
            <Headphones size={16} />
            Contact Sender
          </button>
        </div>
      </div>

      {/* ================= VIEW DETAILS MODAL ================= */}
      {selectedDoc && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            padding: "20px",
          }}
          onClick={() => setSelectedDoc(null)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "18px",
              width: "100%",
              maxWidth: "560px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
              overflow: "hidden",
              border: "1px solid #e2e8f0",
              animation: "scaleUp 0.18s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "800",
                    color: "#0f172a",
                    margin: 0,
                  }}
                >
                  Declined Document Details
                </h3>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    margin: "2px 0 0 0",
                  }}
                >
                  Document reference: {selectedDoc.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#f1f5f9",
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Declined Notice Box */}
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "12px",
                  padding: "16px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "#fee2e2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ef4444",
                    flexShrink: 0,
                  }}
                >
                  <XCircle size={18} />
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#991b1b" }}>
                    Declined on {selectedDoc.declinedDate} at {selectedDoc.declinedTime}
                  </div>
                  <div style={{ fontSize: "12px", color: "#b91c1c", marginTop: "2px" }}>
                    You chose not to sign this document. The sender was notified of this decision.
                  </div>
                </div>
              </div>

              {/* Decline Reason Callout */}
              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: "12px",
                  padding: "16px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "#64748b",
                    marginBottom: "6px",
                  }}
                >
                  Reason Provided for Declining
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#0f172a",
                    lineHeight: "1.5",
                  }}
                >
                  "{selectedDoc.declineReason}"
                </div>
              </div>

              {/* Document Info Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "14px",
                }}
              >
                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: "10px",
                    border: "1px solid #f1f5f9",
                    background: "#f8fafc",
                  }}
                >
                  <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>DOCUMENT</div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a", marginTop: "2px" }}>
                    {selectedDoc.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "1px" }}>
                    {selectedDoc.type} • {selectedDoc.pages} pages
                  </div>
                </div>

                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: "10px",
                    border: "1px solid #f1f5f9",
                    background: "#f8fafc",
                  }}
                >
                  <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>RECEIVED ON</div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a", marginTop: "2px" }}>
                    {selectedDoc.receivedDate}
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "1px" }}>
                    {selectedDoc.receivedTime}
                  </div>
                </div>
              </div>

              {/* Sender Details */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  background: "#ffffff",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {renderSenderLogo(selectedDoc.senderName)}
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>
                      {selectedDoc.senderName}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>{selectedDoc.senderEmail}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    handleOpenContact(selectedDoc);
                    setSelectedDoc(null);
                  }}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "8px",
                    border: "1px solid #bae6fd",
                    background: "#f0f9ff",
                    color: "#0284c7",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Message
                </button>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid #f1f5f9",
                background: "#f8fafc",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                onClick={() => setSelectedDoc(null)}
                style={{
                  padding: "9px 18px",
                  borderRadius: "9px",
                  border: "1px solid #e2e8f0",
                  background: "#ffffff",
                  color: "#334155",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
              <Link
                href={selectedDoc.previewUrl}
                style={{
                  padding: "9px 18px",
                  borderRadius: "9px",
                  border: "none",
                  background: "#2563eb",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: "600",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Eye size={14} />
                Preview Document
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ================= CONTACT SENDER MODAL ================= */}
      {contactDoc && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            padding: "20px",
          }}
          onClick={() => setContactDoc(null)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "18px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
              overflow: "hidden",
              border: "1px solid #e2e8f0",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "#eff6ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#2563eb",
                  }}
                >
                  <Mail size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                    Contact Sender
                  </h3>
                  <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
                    To: {contactDoc.senderName} ({contactDoc.senderEmail})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setContactDoc(null)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#f1f5f9",
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSendContactMessage}>
              <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#475569",
                      marginBottom: "6px",
                    }}
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "14px",
                      color: "#0f172a",
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#475569",
                      marginBottom: "6px",
                    }}
                  >
                    Message
                  </label>
                  <textarea
                    rows={5}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    required
                    placeholder="Write your note or question for the sender..."
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "14px",
                      color: "#0f172a",
                      outline: "none",
                      resize: "vertical",
                      fontFamily: "inherit",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  padding: "16px 24px",
                  borderTop: "1px solid #f1f5f9",
                  background: "#f8fafc",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setContactDoc(null)}
                  style={{
                    padding: "9px 18px",
                    borderRadius: "9px",
                    border: "1px solid #e2e8f0",
                    background: "#ffffff",
                    color: "#334155",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "9px 18px",
                    borderRadius: "9px",
                    border: "none",
                    background: "#2563eb",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Send size={14} />
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </RecipientLayout>
  );
}
