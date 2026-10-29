"use client";

import React, { useState, useMemo, useEffect } from "react";
import RecipientLayout from "@/components/RecipientLayout";
import Link from "next/link";
import {
  Download,
  CheckCircle2,
  FileText,
  Clock,
  Eye,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Calendar,
  ArrowUpDown,
  Shield,
  HelpCircle,
  Check,
  X,
  FileCheck,
  Share2,
  Printer,
  Sparkles,
} from "lucide-react";

interface DownloadItem {
  id: string;
  name: string;
  pages: number;
  type: "Quotation" | "MOU" | "Agreement" | "NDA" | "Attachment";
  senderName: string;
  senderEmail: string;
  downloadedDate: string;
  downloadedTime: string;
  size: string;
  status: "Downloaded" | "Pending";
  previewUrl: string;
}

const SEED_DOWNLOADS: DownloadItem[] = [
  {
    id: "dl-1",
    name: "Quotation - Q-001",
    pages: 2,
    type: "Quotation",
    senderName: "ACME Technologies Pvt Ltd",
    senderEmail: "john.doe@acme.com",
    downloadedDate: "28 Oct 2026",
    downloadedTime: "10:30 AM",
    size: "320 KB",
    status: "Downloaded",
    previewUrl: "/preview/doc-1",
  },
  {
    id: "dl-2",
    name: "MOU - M-014",
    pages: 5,
    type: "MOU",
    senderName: "BrightPath Solutions",
    senderEmail: "sarah@brightpath.com",
    downloadedDate: "26 Oct 2026",
    downloadedTime: "02:15 PM",
    size: "850 KB",
    status: "Downloaded",
    previewUrl: "/preview/doc-2",
  },
  {
    id: "dl-3",
    name: "Service Agreement - SA-003",
    pages: 4,
    type: "Agreement",
    senderName: "Northstar Systems",
    senderEmail: "contact@northstar.com",
    downloadedDate: "24 Oct 2026",
    downloadedTime: "11:20 AM",
    size: "670 KB",
    status: "Downloaded",
    previewUrl: "/preview/doc-3",
  },
  {
    id: "dl-4",
    name: "NDA - NDA-006",
    pages: 3,
    type: "NDA",
    senderName: "Zenith Innovations",
    senderEmail: "info@zenith.com",
    downloadedDate: "22 Oct 2026",
    downloadedTime: "09:45 AM",
    size: "410 KB",
    status: "Downloaded",
    previewUrl: "/preview/doc-4",
  },
  {
    id: "dl-5",
    name: "Quotation - Q-002",
    pages: 2,
    type: "Quotation",
    senderName: "ACME Technologies Pvt Ltd",
    senderEmail: "john.doe@acme.com",
    downloadedDate: "20 Oct 2026",
    downloadedTime: "03:10 PM",
    size: "290 KB",
    status: "Downloaded",
    previewUrl: "/preview/doc-5",
  },
  {
    id: "dl-6",
    name: "Terms_and_Conditions.pdf",
    pages: 1,
    type: "Attachment",
    senderName: "Tech Solutions Pvt Ltd",
    senderEmail: "info@techsolutions.com",
    downloadedDate: "18 Oct 2026",
    downloadedTime: "01:05 PM",
    size: "120 KB",
    status: "Downloaded",
    previewUrl: "/preview/doc-6",
  },
];

export default function RecipientDownloadsPage() {
  const [downloads, setDownloads] = useState<DownloadItem[]>(SEED_DOWNLOADS);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Document Types");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [dateRangeFilter, setDateRangeFilter] = useState("Date Range");
  const [sortBy, setSortBy] = useState("Sort by: Newest");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<DownloadItem | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredDownloads.map((d) => d.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDownload = (doc: DownloadItem) => {
    showToast(`Downloading "${doc.name}" (${doc.size})...`);
  };

  const handleBatchDownload = () => {
    if (selectedIds.length === 0) return;
    showToast(`Preparing ZIP archive for ${selectedIds.length} documents...`);
  };

  // Filter & Sort
  const filteredDownloads = useMemo(() => {
    return downloads
      .filter((doc) => {
        const search = searchTerm.toLowerCase().trim();
        const matchSearch =
          !search ||
          doc.name.toLowerCase().includes(search) ||
          doc.senderName.toLowerCase().includes(search) ||
          doc.senderEmail.toLowerCase().includes(search);

        const matchType =
          typeFilter === "All Document Types" ||
          doc.type.toLowerCase() === typeFilter.toLowerCase();

        const matchStatus =
          statusFilter === "All Status" ||
          doc.status.toLowerCase() === statusFilter.toLowerCase();

        return matchSearch && matchType && matchStatus;
      })
      .sort((a, b) => {
        if (sortBy === "Sort by: Oldest") {
          return b.id.localeCompare(a.id);
        }
        if (sortBy === "Sort by: Name") {
          return a.name.localeCompare(b.name);
        }
        // Default: Newest (dl-1 = 28 Oct down to dl-6 = 18 Oct)
        return a.id.localeCompare(b.id);
      });
  }, [downloads, searchTerm, typeFilter, statusFilter, sortBy]);

  const allSelected =
    filteredDownloads.length > 0 &&
    filteredDownloads.every((d) => selectedIds.includes(d.id));

  const getTypeBadgeStyle = (type: string) => {
    switch (type) {
      case "Quotation":
        return { bg: "#e0f2fe", color: "#0284c7", border: "#bae6fd" };
      case "Agreement":
        return { bg: "#dcfce7", color: "#059669", border: "#bbf7d0" };
      case "MOU":
        return { bg: "#f3e8ff", color: "#7c3aed", border: "#e9d5ff" };
      case "NDA":
        return { bg: "#ffe4e6", color: "#e11d48", border: "#fecdd3" };
      case "Attachment":
        return { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" };
      default:
        return { bg: "#f8fafc", color: "#64748b", border: "#e2e8f0" };
    }
  };

  const getDocIconStyle = (type: string, id: string) => {
    if (id === "dl-1") return { bg: "#eff6ff", border: "#bfdbfe", color: "#2563eb" };
    if (id === "dl-2") return { bg: "#fef2f2", border: "#fecaca", color: "#ef4444" };
    if (id === "dl-3") return { bg: "#ecfdf5", border: "#a7f3d0", color: "#10b981" };
    if (id === "dl-4") return { bg: "#eff6ff", border: "#bfdbfe", color: "#2563eb" };
    if (id === "dl-5") return { bg: "#faf5ff", border: "#e9d5ff", color: "#8b5cf6" };
    if (id === "dl-6") return { bg: "#fef2f2", border: "#fecaca", color: "#ef4444" };
    return { bg: "#f8fafc", border: "#e2e8f0", color: "#64748b" };
  };

  const renderSenderLogo = (sender: string) => {
    if (sender.includes("BrightPath")) {
      return (
        <div
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "7px",
            background: "linear-gradient(135deg, #0284c7, #06b6d4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontWeight: "800",
            fontSize: "13px",
            boxShadow: "0 2px 4px rgba(2, 132, 199, 0.2)",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              borderLeft: "2.5px solid #fff",
              borderBottom: "2.5px solid #fff",
              transform: "rotate(-45deg)",
            }}
          />
        </div>
      );
    }
    if (sender.includes("Northstar")) {
      return (
        <div
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "7px",
            background: "linear-gradient(135deg, #0f766e, #14b8a6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontWeight: "800",
            fontSize: "13px",
            boxShadow: "0 2px 4px rgba(15, 118, 110, 0.2)",
            flexShrink: 0,
          }}
        >
          N
        </div>
      );
    }
    if (sender.includes("Zenith")) {
      return (
        <div
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "7px",
            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontWeight: "800",
            fontSize: "13px",
            boxShadow: "0 2px 4px rgba(124, 58, 237, 0.2)",
            flexShrink: 0,
          }}
        >
          Z
        </div>
      );
    }
    if (sender.includes("Tech Solutions")) {
      return (
        <div
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "7px",
            background: "linear-gradient(135deg, #0284c7, #3b82f6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontWeight: "800",
            fontSize: "13px",
            boxShadow: "0 2px 4px rgba(2, 132, 199, 0.2)",
            flexShrink: 0,
          }}
        >
          <Sparkles size={14} />
        </div>
      );
    }
    // ACME
    return (
      <div
        style={{
          width: "30px",
          height: "30px",
          borderRadius: "7px",
          background: "linear-gradient(135deg, #2563eb, #3b82f6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          fontWeight: "800",
          fontSize: "13px",
          boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)",
          flexShrink: 0,
        }}
      >
        ▲
      </div>
    );
  };

  return (
    <RecipientLayout activePath="/recipient/downloads">
      {/* Toast Notification */}
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
              Downloads
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "#64748b",
                margin: 0,
                fontWeight: "400",
              }}
            >
              Access and download your signed documents and other files.
            </p>
          </div>

          {/* Right Vector Illustration */}
          <div
            style={{
              position: "relative",
              width: "220px",
              height: "100px",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              flexShrink: 0,
            }}
          >
            {/* Soft blue glow backdrop */}
            <div
              style={{
                position: "absolute",
                right: "-10px",
                top: "-15px",
                width: "160px",
                height: "120px",
                background: "radial-gradient(ellipse at center, rgba(191, 219, 254, 0.8) 0%, rgba(219, 234, 254, 0.3) 70%, transparent 100%)",
                borderRadius: "50%",
                filter: "blur(14px)",
              }}
            />

            {/* Document sheet card */}
            <div
              style={{
                position: "relative",
                width: "100px",
                height: "85px",
                background: "#ffffff",
                borderRadius: "10px",
                boxShadow: "0 8px 24px rgba(37, 99, 235, 0.12), 0 2px 6px rgba(0,0,0,0.04)",
                border: "1px solid #dbeafe",
                padding: "12px 10px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                transform: "rotate(4deg)",
              }}
            >
              <div style={{ width: "100%", height: "5px", background: "#cbd5e1", borderRadius: "3px" }} />
              <div style={{ width: "75%", height: "5px", background: "#e2e8f0", borderRadius: "3px" }} />
              <div style={{ width: "85%", height: "5px", background: "#cbd5e1", borderRadius: "3px" }} />
              <div style={{ width: "50%", height: "5px", background: "#e2e8f0", borderRadius: "3px" }} />
            </div>

            {/* Big Blue Download Circle Badge */}
            <div
              style={{
                position: "absolute",
                right: "68px",
                top: "20px",
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                boxShadow: "0 6px 18px rgba(37, 99, 235, 0.4)",
                border: "3px solid #ffffff",
                zIndex: 2,
              }}
            >
              <Download size={22} strokeWidth={2.6} />
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
                background: "rgba(37, 99, 235, 0.15)",
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
          {/* Card 1: Total Downloads */}
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
              <Download size={22} strokeWidth={2.4} />
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
                6
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#0f172a",
                  marginTop: "2px",
                }}
              >
                Total Downloads
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  marginTop: "1px",
                }}
              >
                Files downloaded by you
              </div>
            </div>
          </div>

          {/* Card 2: Signed Documents */}
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
              <CheckCircle2 size={22} strokeWidth={2.4} />
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
                4
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
                PDFs you have downloaded
              </div>
            </div>
          </div>

          {/* Card 3: Other Documents */}
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
                background: "#f3e8ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#8b5cf6",
                flexShrink: 0,
              }}
            >
              <FileText size={22} strokeWidth={2.4} />
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
                Other Documents
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  marginTop: "1px",
                }}
              >
                Attachments / supporting files
              </div>
            </div>
          </div>

          {/* Card 4: Pending Downloads */}
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
              <Clock size={22} strokeWidth={2.4} />
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
                0
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#0f172a",
                  marginTop: "2px",
                }}
              >
                Pending Downloads
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  marginTop: "1px",
                }}
              >
                Available for download
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
              gap: "12px",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            {/* Search Input */}
            <div
              style={{
                position: "relative",
                flex: "1 1 260px",
                maxWidth: "340px",
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
                placeholder="Search documents..."
                style={{
                  width: "100%",
                  padding: "9px 14px 9px 40px",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  fontSize: "13px",
                  color: "#0f172a",
                  outline: "none",
                }}
              />
            </div>

            {/* Filter Dropdowns */}
            <div
              style={{
                display: "flex",
                gap: "10px",
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
                    padding: "8px 32px 8px 14px",
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
                  <option value="MOU">MOU</option>
                  <option value="Agreement">Agreement</option>
                  <option value="NDA">NDA</option>
                  <option value="Attachment">Attachment</option>
                </select>
                <ChevronDown
                  size={14}
                  color="#64748b"
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
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
                    padding: "8px 32px 8px 14px",
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
                  <option value="All Status">All Status</option>
                  <option value="Downloaded">Downloaded</option>
                  <option value="Pending">Pending</option>
                </select>
                <ChevronDown
                  size={14}
                  color="#64748b"
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                />
              </div>

              {/* Date Range */}
              <div style={{ position: "relative" }}>
                <select
                  value={dateRangeFilter}
                  onChange={(e) => setDateRangeFilter(e.target.value)}
                  style={{
                    appearance: "none",
                    padding: "8px 32px 8px 32px",
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
                  <option value="Date Range">Date Range</option>
                  <option value="Today">Today</option>
                  <option value="Last 7 Days">Last 7 Days</option>
                  <option value="Last 30 Days">Last 30 Days</option>
                </select>
                <Calendar
                  size={14}
                  color="#64748b"
                  style={{
                    position: "absolute",
                    left: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                />
                <ChevronDown
                  size={14}
                  color="#64748b"
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                />
              </div>

              {/* Sort By */}
              <div style={{ position: "relative" }}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    appearance: "none",
                    padding: "8px 32px 8px 32px",
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
                  <option value="Sort by: Newest">Sort by: Newest</option>
                  <option value="Sort by: Oldest">Sort by: Oldest</option>
                  <option value="Sort by: Name">Sort by: Name</option>
                </select>
                <ArrowUpDown
                  size={14}
                  color="#64748b"
                  style={{
                    position: "absolute",
                    left: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                />
                <ChevronDown
                  size={14}
                  color="#64748b"
                  style={{
                    position: "absolute",
                    right: "10px",
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
                  <th style={{ width: "38px", padding: "12px 10px", textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      style={{
                        width: "16px",
                        height: "16px",
                        accentColor: "#2563eb",
                        cursor: "pointer",
                      }}
                    />
                  </th>
                  <th style={{ textAlign: "left", padding: "12px 12px", width: "240px" }}>Document</th>
                  <th style={{ textAlign: "left", padding: "12px 12px", width: "100px" }}>Type</th>
                  <th style={{ textAlign: "left", padding: "12px 12px", width: "210px" }}>From</th>
                  <th style={{ textAlign: "left", padding: "12px 12px", width: "140px" }}>Downloaded On</th>
                  <th style={{ textAlign: "left", padding: "12px 12px", width: "90px" }}>Size</th>
                  <th style={{ textAlign: "left", padding: "12px 12px", width: "110px" }}>Status</th>
                  <th style={{ textAlign: "center", padding: "12px 12px", width: "220px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDownloads.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        textAlign: "center",
                        padding: "48px 16px",
                        color: "#64748b",
                        fontSize: "14px",
                      }}
                    >
                      No downloaded documents match your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredDownloads.map((doc) => {
                    const isSelected = selectedIds.includes(doc.id);
                    const typeStyle = getTypeBadgeStyle(doc.type);
                    const iconStyle = getDocIconStyle(doc.type, doc.id);
                    const isMenuOpen = activeMenuId === doc.id;

                    return (
                      <tr
                        key={doc.id}
                        style={{
                          background: isSelected ? "#f8fafc" : "#ffffff",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                          borderRadius: "12px",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {/* Checkbox */}
                        <td
                          style={{
                            padding: "16px 10px",
                            textAlign: "center",
                            borderTop: "1px solid #f1f5f9",
                            borderBottom: "1px solid #f1f5f9",
                            borderLeft: "1px solid #f1f5f9",
                            borderTopLeftRadius: "12px",
                            borderBottomLeftRadius: "12px",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(doc.id)}
                            style={{
                              width: "16px",
                              height: "16px",
                              accentColor: "#2563eb",
                              cursor: "pointer",
                            }}
                          />
                        </td>

                        {/* Document */}
                        <td
                          style={{
                            padding: "16px 12px",
                            borderTop: "1px solid #f1f5f9",
                            borderBottom: "1px solid #f1f5f9",
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
                                {doc.pages} {doc.pages === 1 ? "page" : "pages"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Type */}
                        <td
                          style={{
                            padding: "16px 12px",
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
                            padding: "16px 12px",
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

                        {/* Downloaded On */}
                        <td
                          style={{
                            padding: "16px 12px",
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
                            {doc.downloadedDate}
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#64748b",
                              marginTop: "2px",
                            }}
                          >
                            {doc.downloadedTime}
                          </div>
                        </td>

                        {/* Size */}
                        <td
                          style={{
                            padding: "16px 12px",
                            borderTop: "1px solid #f1f5f9",
                            borderBottom: "1px solid #f1f5f9",
                            fontSize: "13px",
                            fontWeight: "500",
                            color: "#334155",
                          }}
                        >
                          {doc.size}
                        </td>

                        {/* Status */}
                        <td
                          style={{
                            padding: "16px 12px",
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
                              background: "#dcfce7",
                              color: "#059669",
                              border: "1px solid #bbf7d0",
                            }}
                          >
                            {doc.status}
                          </span>
                        </td>

                        {/* Action Buttons */}
                        <td
                          style={{
                            padding: "16px 12px",
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
                            {/* Download Button */}
                            <button
                              onClick={() => handleDownload(doc)}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "6px 12px",
                                borderRadius: "8px",
                                border: "1px solid #bae6fd",
                                background: "#f0f9ff",
                                color: "#0284c7",
                                fontSize: "12px",
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
                              <Download size={13} />
                              Download
                            </button>

                            {/* View Button */}
                            <button
                              onClick={() => setSelectedDoc(doc)}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "6px 12px",
                                borderRadius: "8px",
                                border: "1px solid #bae6fd",
                                background: "#f0f9ff",
                                color: "#0284c7",
                                fontSize: "12px",
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
                              <Eye size={13} />
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
                                  width: "30px",
                                  height: "30px",
                                  borderRadius: "7px",
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
                                    top: "36px",
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
                                    <FileCheck size={14} color="#64748b" />
                                    Open Preview
                                  </Link>
                                  <button
                                    onClick={() => {
                                      handleDownload(doc);
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
                                    Re-Download
                                  </button>
                                  <button
                                    onClick={() => {
                                      showToast(`Watermark verified for ${doc.name}`);
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
                                    <Shield size={14} color="#64748b" />
                                    Verify Security
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

          {/* Pagination & Batch Action */}
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
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <span style={{ fontSize: "13px", color: "#64748b" }}>
                Showing 1 to {filteredDownloads.length} of {filteredDownloads.length} documents
              </span>
              {selectedIds.length > 0 && (
                <button
                  onClick={handleBatchDownload}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#2563eb",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(37, 99, 235, 0.25)",
                  }}
                >
                  <Download size={13} />
                  Download Selected ({selectedIds.length})
                </button>
              )}
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

        {/* ================= BOTTOM BANNER ================= */}
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
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                background: "#dbeafe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#2563eb",
                flexShrink: 0,
              }}
            >
              <Shield size={22} strokeWidth={2.4} />
            </div>
            <div>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "#0f172a",
                }}
              >
                Your Downloads are Secure
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#475569",
                  marginTop: "2px",
                }}
              >
                All downloaded documents are securely stored and watermarked for your reference.
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsHelpOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              color: "#334155",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              transition: "all 0.15s ease",
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#f8fafc";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#ffffff";
            }}
          >
            <HelpCircle size={16} color="#64748b" />
            Need Help?
          </button>
        </div>
      </div>

      {/* ================= VIEW MODAL ================= */}
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
              maxWidth: "540px",
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
                  Download Details
                </h3>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    margin: "2px 0 0 0",
                  }}
                >
                  File ID: {selectedDoc.id}
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

            {/* Body */}
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Document Banner */}
              <div
                style={{
                  background: "#eff6ff",
                  borderRadius: "12px",
                  padding: "16px",
                  border: "1px solid #bfdbfe",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "10px",
                    background: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#2563eb",
                    boxShadow: "0 2px 6px rgba(37,99,235,0.15)",
                  }}
                >
                  <FileText size={22} />
                </div>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: "700", color: "#1e3a8a" }}>
                    {selectedDoc.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "#3b82f6", marginTop: "2px" }}>
                    {selectedDoc.type} • {selectedDoc.pages} {selectedDoc.pages === 1 ? "page" : "pages"} • {selectedDoc.size}
                  </div>
                </div>
              </div>

              {/* Meta Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
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
                  <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>DOWNLOADED ON</div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a", marginTop: "2px" }}>
                    {selectedDoc.downloadedDate}
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "1px" }}>
                    {selectedDoc.downloadedTime}
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
                  <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>STATUS</div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#10b981", marginTop: "2px", display: "flex", alignItems: "center", gap: "5px" }}>
                    <CheckCircle2 size={14} />
                    {selectedDoc.status}
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "1px" }}>
                    Watermarked & Cached
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
              <button
                onClick={() => {
                  handleDownload(selectedDoc);
                  setSelectedDoc(null);
                }}
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
                <Download size={14} />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= HELP MODAL ================= */}
      {isHelpOpen && (
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
          onClick={() => setIsHelpOpen(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "18px",
              width: "100%",
              maxWidth: "500px",
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
                  <HelpCircle size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                    Download Help & Security
                  </h3>
                  <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
                    Frequently asked questions
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsHelpOpen(false)}
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

            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>
                  Where are my downloaded PDFs saved?
                </div>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", lineHeight: "1.5" }}>
                  Downloaded documents are saved directly to your computer's standard default Downloads directory.
                </div>
              </div>

              <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>
                  Are signed documents legally binding?
                </div>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", lineHeight: "1.5" }}>
                  Yes, each document includes a cryptographically secure audit trail and verifiable digital timestamp adhering to global electronic signature standards.
                </div>
              </div>

              <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>
                  Can I re-download older documents?
                </div>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", lineHeight: "1.5" }}>
                  Yes, documents remain permanently accessible in your WorldX archive unless deleted or requested by the issuer.
                </div>
              </div>
            </div>

            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid #f1f5f9",
                background: "#f8fafc",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setIsHelpOpen(false)}
                style={{
                  padding: "9px 18px",
                  borderRadius: "9px",
                  border: "none",
                  background: "#2563eb",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </RecipientLayout>
  );
}
