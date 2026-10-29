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
  Calendar,
  MessageSquare,
  RotateCcw,
  Info,
  Headphones,
  Check,
  Eye,
  Download,
  Trash2,
} from "lucide-react";

interface ChangeRequest {
  id: string;
  name: string;
  pages: number;
  type: "Quotation" | "MOU" | "Agreement" | "NDA";
  senderName: string;
  senderEmail: string;
  changeRequested: string;
  requestedDate: string;
  requestedTime: string;
  status: "Pending" | "In Review" | "Resolved" | "Declined";
  previewUrl: string;
}

const SEED_CHANGE_REQUESTS: ChangeRequest[] = [
  {
    id: "cr-1",
    name: "Quotation - Q-001",
    pages: 2,
    type: "Quotation",
    senderName: "ACME Technologies Pvt Ltd",
    senderEmail: "john.doe@acme.com",
    changeRequested: "Update total amount to ₹35,000 instead of ₹25,000.",
    requestedDate: "28 Oct 2026",
    requestedTime: "02:15 PM",
    status: "Pending",
    previewUrl: "/preview/doc-1",
  },
  {
    id: "cr-2",
    name: "Service Agreement - SA-003",
    pages: 4,
    type: "Agreement",
    senderName: "Northstar Systems",
    senderEmail: "contact@northstar.com",
    changeRequested: "Add clause 5.2 for extended support period.",
    requestedDate: "27 Oct 2026",
    requestedTime: "11:40 AM",
    status: "In Review",
    previewUrl: "/preview/doc-2",
  },
  {
    id: "cr-3",
    name: "MOU - M-014",
    pages: 5,
    type: "MOU",
    senderName: "BrightPath Solutions",
    senderEmail: "sarah@brightpath.com",
    changeRequested: "Change signatory name from John Smith to Jane Doe.",
    requestedDate: "26 Oct 2026",
    requestedTime: "04:20 PM",
    status: "Resolved",
    previewUrl: "/preview/doc-3",
  },
  {
    id: "cr-4",
    name: "NDA - NDA-006",
    pages: 3,
    type: "NDA",
    senderName: "Zenith Innovations",
    senderEmail: "info@zenith.com",
    changeRequested: "Remove clause 8.1 (Non-compete).",
    requestedDate: "24 Oct 2026",
    requestedTime: "09:30 AM",
    status: "Declined",
    previewUrl: "/preview/doc-4",
  },
  {
    id: "cr-5",
    name: "Quotation - Q-008",
    pages: 3,
    type: "Quotation",
    senderName: "ACME Technologies Pvt Ltd",
    senderEmail: "john.doe@acme.com",
    changeRequested: "Correct GST number in billing details.",
    requestedDate: "22 Oct 2026",
    requestedTime: "01:15 PM",
    status: "Pending",
    previewUrl: "/preview/doc-5",
  },
  {
    id: "cr-6",
    name: "Service Agreement - SA-005",
    pages: 6,
    type: "Agreement",
    senderName: "Northstar Systems",
    senderEmail: "contact@northstar.com",
    changeRequested: "Update effective date to 01 Nov 2026.",
    requestedDate: "20 Oct 2026",
    requestedTime: "03:45 PM",
    status: "In Review",
    previewUrl: "/preview/doc-6",
  },
];

export default function ChangeRequestsPage() {
  const [requests, setRequests] = useState<ChangeRequest[]>(SEED_CHANGE_REQUESTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Document Types");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [dateRangeFilter, setDateRangeFilter] = useState("Date Range");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
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

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchSearch =
        req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.changeRequested.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.senderEmail.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType =
        typeFilter === "All Document Types" || req.type === typeFilter;
      const matchStatus =
        statusFilter === "All Statuses" || req.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [requests, searchTerm, typeFilter, statusFilter]);

  const handleDownloadPDF = (req: ChangeRequest) => {
    setActiveMenuId(null);
    showToast(`Downloading document for ${req.name}...`);
    if (typeof window !== "undefined") {
      const w = window.open(`/preview/${req.id}?autoPrint=true`, "_blank");
      if (w) w.focus();
    }
  };

  const handleDelete = (req: ChangeRequest) => {
    setActiveMenuId(null);
    setRequests((prev) => prev.filter((r) => r.id !== req.id));
    showToast(`Removed change request for ${req.name}`);
  };

  return (
    <RecipientLayout activePath="/recipient/changes">
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
              Change Requests
            </h1>
            <p
              style={{
                fontSize: "13.5px",
                color: "#64748b",
                margin: "4px 0 0 0",
                fontWeight: 400,
              }}
            >
              Review and respond to the changes requested in your documents.
            </p>
          </div>

          {/* Right Illustration: Refresh Icons + Document + Pen */}
          <div
            style={{
              position: "relative",
              width: "230px",
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
                width: "160px",
                height: "110px",
                borderRadius: "50%",
                background: "radial-gradient(circle, #dbeafe 0%, #eff6ff 70%, transparent 100%)",
                filter: "blur(4px)",
              }}
            />

            {/* Left Purple Rotate Badge */}
            <div
              style={{
                position: "absolute",
                left: "14px",
                top: "22px",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "#7c3aed",
                boxShadow: "0 4px 10px rgba(124,58,237,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 3,
                color: "#ffffff",
              }}
            >
              <RotateCcw style={{ width: "18px", height: "18px", strokeWidth: 2.5 }} />
            </div>

            {/* Document sheet */}
            <div
              style={{
                position: "absolute",
                right: "30px",
                top: "8px",
                width: "95px",
                height: "76px",
                backgroundColor: "#ffffff",
                border: "1.5px solid #bfdbfe",
                borderRadius: "10px",
                boxShadow: "0 4px 14px rgba(37,99,235,0.08)",
                padding: "8px",
                transform: "rotate(2deg)",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                zIndex: 2,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ width: "28px", height: "3px", backgroundColor: "#3b82f6", borderRadius: "2px" }} />
                <div style={{ width: "52px", height: "2.5px", backgroundColor: "#e2e8f0", borderRadius: "2px" }} />
                <div style={{ width: "42px", height: "2.5px", backgroundColor: "#e2e8f0", borderRadius: "2px" }} />
              </div>
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  backgroundColor: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "9px",
                  color: "#2563eb",
                  fontWeight: 800,
                  alignSelf: "flex-end",
                }}
              >
                ✎
              </div>
            </div>

            {/* Blue Pen leaning on document */}
            <div
              style={{
                position: "absolute",
                right: "68px",
                top: "14px",
                width: "6px",
                height: "48px",
                backgroundColor: "#2563eb",
                borderRadius: "3px",
                transform: "rotate(-35deg)",
                zIndex: 4,
                boxShadow: "0 2px 6px rgba(37,99,235,0.3)",
              }}
            />

            {/* Right Blue Refresh Badge */}
            <div
              style={{
                position: "absolute",
                right: "4px",
                top: "24px",
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                backgroundColor: "#2563eb",
                boxShadow: "0 4px 10px rgba(37,99,235,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 3,
                color: "#ffffff",
              }}
            >
              <RotateCcw style={{ width: "16px", height: "16px", strokeWidth: 2.5 }} />
            </div>
          </div>
        </div>

        {/* ================= 2. FOUR SUMMARY METRIC CARDS ================= */}
        {/* Exact order from Screenshot: Change Requested (1), In Review (3), Resolved (4), Declined (1) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "18px",
          }}
        >
          {/* Card 1: Change Requested (1) */}
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
              <MessageSquare style={{ width: "24px", height: "24px" }} />
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
                Change Requested
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
                Action required from you
              </span>
            </div>
          </div>

          {/* Card 2: In Review (3) */}
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
                3
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
                In Review
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
                Being reviewed by sender
              </span>
            </div>
          </div>

          {/* Card 3: Resolved (4) */}
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
                4
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
                Resolved
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
                Changes made in document
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
                Change request rejected
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
          {/* Filter Bar with Search, Type, Status, and Date Range */}
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
                placeholder="Search change requests..."
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
                  <option value="All Statuses">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In Review">In Review</option>
                  <option value="Resolved">Resolved</option>
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

              {/* Date Range Filter with Calendar Icon */}
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
                  <Calendar style={{ width: "14px", height: "14px", color: "#64748b" }} />
                  <select
                    value={dateRangeFilter}
                    onChange={(e) => setDateRangeFilter(e.target.value)}
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
                    <option value="Date Range">Date Range</option>
                    <option value="Last 7 Days">Last 7 Days</option>
                    <option value="This Month">This Month</option>
                    <option value="Last 30 Days">Last 30 Days</option>
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

          {/* Table matching Screenshot columns: Document | Type | Sender | Change Requested | Requested On | Status | Action */}
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
                    Sender
                  </th>
                  <th
                    style={{
                      padding: "14px 18px",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    Change Requested
                  </th>
                  <th
                    style={{
                      padding: "14px 18px",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    Requested On
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
                      padding: "14px 10px",
                      width: "36px",
                      textAlign: "right",
                    }}
                  />
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req, reqIdx) => {
                  const isMenuOpen = activeMenuId === req.id;
                  const isBottom = reqIdx >= 3;

                  // Document icon styling based on type
                  const docIconBg =
                    req.type === "Quotation"
                      ? "#eff6ff"
                      : req.type === "MOU"
                      ? "#f5f3ff"
                      : req.type === "Agreement"
                      ? "#ecfdf5"
                      : "#fee2e2";
                  const docIconColor =
                    req.type === "Quotation"
                      ? "#2563eb"
                      : req.type === "MOU"
                      ? "#7c3aed"
                      : req.type === "Agreement"
                      ? "#059669"
                      : "#dc2626";

                  // Type Pill style
                  const typePillBg =
                    req.type === "Quotation"
                      ? "#eff6ff"
                      : req.type === "MOU"
                      ? "#f5f3ff"
                      : req.type === "Agreement"
                      ? "#ecfdf5"
                      : "#fdf2f2";
                  const typePillColor =
                    req.type === "Quotation"
                      ? "#2563eb"
                      : req.type === "MOU"
                      ? "#7c3aed"
                      : req.type === "Agreement"
                      ? "#059669"
                      : "#e02424";

                  return (
                    <tr
                      key={req.id}
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
                              {req.name}
                            </div>
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#94a3b8",
                                marginTop: "3px",
                              }}
                            >
                              {req.pages} pages
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
                          {req.type}
                        </span>
                      </td>

                      {/* Sender */}
                      <td style={{ padding: "16px 18px" }}>
                        <div
                          style={{
                            fontSize: "12.5px",
                            fontWeight: 600,
                            color: "#0f172a",
                            lineHeight: 1.2,
                          }}
                        >
                          {req.senderName}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#94a3b8",
                            marginTop: "3px",
                          }}
                        >
                          {req.senderEmail}
                        </div>
                      </td>

                      {/* Change Requested Description */}
                      <td style={{ padding: "16px 18px", maxWidth: "260px" }}>
                        <div
                          style={{
                            fontSize: "12.5px",
                            color: "#334155",
                            lineHeight: 1.4,
                          }}
                        >
                          {req.changeRequested}
                        </div>
                      </td>

                      {/* Requested On */}
                      <td style={{ padding: "16px 18px" }}>
                        <div
                          style={{
                            fontSize: "12.5px",
                            fontWeight: 600,
                            color: "#0f172a",
                            lineHeight: 1.2,
                          }}
                        >
                          {req.requestedDate}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#94a3b8",
                            marginTop: "3px",
                          }}
                        >
                          {req.requestedTime}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td style={{ padding: "16px 18px" }}>
                        {req.status === "Pending" && (
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
                            <span>Pending</span>
                          </span>
                        )}
                        {req.status === "In Review" && (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "4px 12px",
                              borderRadius: "9999px",
                              fontSize: "11.5px",
                              fontWeight: 600,
                              backgroundColor: "#eff6ff",
                              color: "#2563eb",
                              border: "1px solid #bfdbfe",
                            }}
                          >
                            <Clock style={{ width: "13px", height: "13px", color: "#2563eb" }} />
                            <span>In Review</span>
                          </span>
                        )}
                        {req.status === "Resolved" && (
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
                              border: "1px solid #bbf7d0",
                            }}
                          >
                            <CheckCircle2 style={{ width: "13px", height: "13px", color: "#16a34a" }} />
                            <span>Resolved</span>
                          </span>
                        )}
                        {req.status === "Declined" && (
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
                              border: "1px solid #fecaca",
                            }}
                          >
                            <X style={{ width: "13px", height: "13px", color: "#dc2626" }} />
                            <span>Declined</span>
                          </span>
                        )}
                      </td>

                      {/* Action Button: View Details */}
                      <td style={{ padding: "16px 18px", textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={() => setSelectedRequest(req)}
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
                          View Details
                        </button>
                      </td>

                      {/* 3 Dots Menu */}
                      <td
                        style={{
                          padding: "16px 10px",
                          textAlign: "right",
                          position: "relative",
                        }}
                        data-doc-menu="true"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMenuId(isMenuOpen ? null : req.id)
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
                              right: "10px",
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
                              href={req.previewUrl}
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
                              onClick={() => handleDownloadPDF(req)}
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
                              onClick={() => handleDelete(req)}
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

          {/* Table Footer with Pagination matching Screenshot: 1 to 6 of 6 change requests */}
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
              Showing 1 to {filteredRequests.length} of {requests.length} change requests
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

        {/* ================= 4. BOTTOM "NEED HELP WITH CHANGE REQUESTS?" BANNER ================= */}
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
          {/* Left Side: Info Icon + Text */}
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
              <Info style={{ width: "24px", height: "24px" }} />
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
                Need Help with Change Requests?
              </h3>
              <p
                style={{
                  fontSize: "12.5px",
                  color: "#64748b",
                  margin: "3px 0 0 0",
                  fontWeight: 400,
                }}
              >
                If you have any questions about the requested changes, please contact the sender directly or reach out to our support team.
              </p>
            </div>
          </div>

          {/* Right Side Action Button */}
          <button
            type="button"
            onClick={() => setIsSupportOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "9px 20px",
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
            <span>Contact Support →</span>
          </button>
        </div>
      </div>

      {/* ================= MODAL: VIEW DETAILS ================= */}
      {selectedRequest && (
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
              maxWidth: "520px",
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
                Change Request Details
              </h3>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                style={{ border: "none", backgroundColor: "transparent", cursor: "pointer", color: "#94a3b8" }}
              >
                <X style={{ width: "18px", height: "18px" }} />
              </button>
            </div>
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                    {selectedRequest.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                    {selectedRequest.pages} pages • {selectedRequest.type}
                  </div>
                </div>
                <span
                  style={{
                    padding: "4px 12px",
                    borderRadius: "9999px",
                    fontSize: "11.5px",
                    fontWeight: 700,
                    backgroundColor:
                      selectedRequest.status === "Pending"
                        ? "#fffbeb"
                        : selectedRequest.status === "In Review"
                        ? "#eff6ff"
                        : selectedRequest.status === "Resolved"
                        ? "#f0fdf4"
                        : "#fef2f2",
                    color:
                      selectedRequest.status === "Pending"
                        ? "#b45309"
                        : selectedRequest.status === "In Review"
                        ? "#2563eb"
                        : selectedRequest.status === "Resolved"
                        ? "#15803d"
                        : "#b91c1c",
                  }}
                >
                  {selectedRequest.status}
                </span>
              </div>

              <div style={{ backgroundColor: "#f8fafc", borderRadius: "10px", padding: "14px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>
                  Sender Information
                </div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a", marginTop: "4px" }}>
                  {selectedRequest.senderName}
                </div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>
                  {selectedRequest.senderEmail}
                </div>
              </div>

              <div style={{ backgroundColor: "#eff6ff", borderRadius: "10px", padding: "14px", border: "1px solid #bfdbfe" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#2563eb", textTransform: "uppercase" }}>
                  Requested Modification
                </div>
                <div style={{ fontSize: "13.5px", fontWeight: 500, color: "#1e293b", marginTop: "4px" }}>
                  &ldquo;{selectedRequest.changeRequested}&rdquo;
                </div>
                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "6px" }}>
                  Requested on {selectedRequest.requestedDate} at {selectedRequest.requestedTime}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  style={{
                    padding: "9px 18px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#ffffff",
                    fontSize: "13px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Close
                </button>
                <Link
                  href={selectedRequest.previewUrl}
                  onClick={() => setSelectedRequest(null)}
                  style={{
                    padding: "9px 20px",
                    borderRadius: "8px",
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: 600,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Eye style={{ width: "15px", height: "15px" }} />
                  <span>Preview Document</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CONTACT SUPPORT ================= */}
      {isSupportOpen && (
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
                Contact Support
              </h3>
              <button
                type="button"
                onClick={() => setIsSupportOpen(false)}
                style={{ border: "none", backgroundColor: "transparent", cursor: "pointer", color: "#94a3b8" }}
              >
                <X style={{ width: "18px", height: "18px" }} />
              </button>
            </div>
            <div style={{ padding: "24px" }}>
              <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px 0" }}>
                Our 24/7 dedicated support desk is available to assist with contract revisions and questions.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ padding: "12px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>Support Email</div>
                  <div style={{ fontSize: "13px", color: "#2563eb" }}>support@vorldx.com</div>
                </div>
                <div style={{ padding: "12px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>Toll-Free Helpline</div>
                  <div style={{ fontSize: "13px", color: "#0f172a", fontWeight: 600 }}>+91 1800 200 4567</div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
                <button
                  type="button"
                  onClick={() => setIsSupportOpen(false)}
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
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </RecipientLayout>
  );
}
