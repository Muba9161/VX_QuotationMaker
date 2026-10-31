"use client";

import React, { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  Search,
  ChevronDown,
  Sparkles,
  Globe,
  Palette,
  ShieldCheck,
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Filter,
  Check,
  X,
  ExternalLink,
  AlertCircle,
  FileText,
} from "lucide-react";

interface BrandingRequest {
  id: string;
  requestCode: string;
  organization: string;
  logoInitial: string;
  logoBg: string;
  type: "Custom Domain" | "Logo & Theme" | "Full White-Label" | "Email Branding";
  details: string;
  domain?: string;
  primaryColor?: string;
  submittedDate: string;
  status: "Pending Review" | "Approved" | "Rejected";
  cnameVerified?: boolean;
  notes?: string;
}

const INITIAL_REQUESTS: BrandingRequest[] = [
  {
    id: "req-1",
    requestCode: "REQ-2026-001",
    organization: "Innovate India",
    logoInitial: "II",
    logoBg: "#3b82f6",
    type: "Custom Domain",
    details: "quotes.innovateindia.com",
    domain: "quotes.innovateindia.com",
    primaryColor: "#2563eb",
    submittedDate: "27 Oct 2026",
    status: "Pending Review",
    cnameVerified: true,
    notes: "Requires custom SSL certificate provisioning on tenant domain.",
  },
  {
    id: "req-2",
    requestCode: "REQ-2026-002",
    organization: "CodeCraft Solutions",
    logoInitial: "CC",
    logoBg: "#6366f1",
    type: "Logo & Theme",
    details: "Indigo Brand Theme & High-Res SVG Logo",
    primaryColor: "#6366f1",
    submittedDate: "25 Oct 2026",
    status: "Approved",
    notes: "High resolution SVG and dark mode variants verified.",
  },
  {
    id: "req-3",
    requestCode: "REQ-2026-003",
    organization: "VorldXnologies",
    logoInitial: "AT",
    logoBg: "#0284c7",
    type: "Full White-Label",
    details: "portal.acmetech.com + Custom Favicon & Footer",
    domain: "portal.acmetech.com",
    primaryColor: "#0284c7",
    submittedDate: "24 Oct 2026",
    status: "Approved",
    cnameVerified: true,
    notes: "Removed 'Powered by VorldX' badge as per Enterprise SLA.",
  },
  {
    id: "req-4",
    requestCode: "REQ-2026-004",
    organization: "Tech Solutions Pvt Ltd",
    logoInitial: "TS",
    logoBg: "#0d9488",
    type: "Email Branding",
    details: "mail.techsolutions.com (Custom SMTP & Sender)",
    domain: "mail.techsolutions.com",
    primaryColor: "#0d9488",
    submittedDate: "23 Oct 2026",
    status: "Pending Review",
    cnameVerified: true,
    notes: "DKIM and SPF records verification in progress.",
  },
  {
    id: "req-5",
    requestCode: "REQ-2026-005",
    organization: "Global Systems Inc",
    logoInitial: "GS",
    logoBg: "#e11d48",
    type: "Custom Domain",
    details: "docs.globalsystems.io (DNS Misconfigured)",
    domain: "docs.globalsystems.io",
    primaryColor: "#e11d48",
    submittedDate: "22 Oct 2026",
    status: "Rejected",
    cnameVerified: false,
    notes: "CNAME record points to incorrect cloud IP instead of cname.vorldx.com.",
  },
  {
    id: "req-6",
    requestCode: "REQ-2026-006",
    organization: "Bright Future Education",
    logoInitial: "BF",
    logoBg: "#8b5cf6",
    type: "Logo & Theme",
    details: "Official Crest Letterhead & Watermark",
    primaryColor: "#8b5cf6",
    submittedDate: "21 Oct 2026",
    status: "Approved",
    notes: "Letterhead meets 300 DPI print standards.",
  },
  {
    id: "req-7",
    requestCode: "REQ-2026-007",
    organization: "Nexus Global Consulting",
    logoInitial: "NG",
    logoBg: "#059669",
    type: "Full White-Label",
    details: "quotations.nexusglobal.com + Royal Emerald Theme",
    domain: "quotations.nexusglobal.com",
    primaryColor: "#059669",
    submittedDate: "20 Oct 2026",
    status: "Pending Review",
    cnameVerified: true,
    notes: "Full white label portal package request pending final approval.",
  },
];

export default function AdminBrandingRequestsPage() {
  const [requests, setRequests] = useState<BrandingRequest[]>(INITIAL_REQUESTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All Status");
  const [typeFilter, setTypeFilter] = useState<string>("All Types");
  const [selectedRequest, setSelectedRequest] = useState<BrandingRequest | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleApprove = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Approved" } : r))
    );
    if (selectedRequest && selectedRequest.id === id) {
      setSelectedRequest({ ...selectedRequest, status: "Approved" });
    }
    showToast("Branding request approved and deployed successfully!");
  };

  const handleReject = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Rejected" } : r))
    );
    if (selectedRequest && selectedRequest.id === id) {
      setSelectedRequest({ ...selectedRequest, status: "Rejected" });
    }
    showToast("Branding request marked as rejected.");
  };

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.requestCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.domain && r.domain.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "All Status" || r.status === statusFilter;

    const matchesType =
      typeFilter === "All Types" || r.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const totalCount = requests.length;
  const pendingCount = requests.filter((r) => r.status === "Pending Review").length;
  const approvedCount = requests.filter((r) => r.status === "Approved").length;
  const rejectedCount = requests.filter((r) => r.status === "Rejected").length;

  const getTypeIcon = (type: BrandingRequest["type"]) => {
    switch (type) {
      case "Custom Domain":
        return <Globe style={{ width: "13px", height: "13px", color: "#7c3aed" }} />;
      case "Logo & Theme":
        return <Palette style={{ width: "13px", height: "13px", color: "#2563eb" }} />;
      case "Full White-Label":
        return <Sparkles style={{ width: "13px", height: "13px", color: "#059669" }} />;
      case "Email Branding":
        return <Mail style={{ width: "13px", height: "13px", color: "#d97706" }} />;
    }
  };

  const getTypeBadgeStyle = (type: BrandingRequest["type"]) => {
    switch (type) {
      case "Custom Domain":
        return { backgroundColor: "#f5f3ff", color: "#7c3aed", border: "1px solid #ddd6fe" };
      case "Logo & Theme":
        return { backgroundColor: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe" };
      case "Full White-Label":
        return { backgroundColor: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0" };
      case "Email Branding":
        return { backgroundColor: "#fffbeb", color: "#b45309", border: "1px solid #fde68a" };
    }
  };

  const getStatusBadgeStyle = (status: BrandingRequest["status"]) => {
    switch (status) {
      case "Pending Review":
        return { backgroundColor: "#fef3c7", color: "#d97706" };
      case "Approved":
        return { backgroundColor: "#dcfce7", color: "#16a34a" };
      case "Rejected":
        return { backgroundColor: "#fee2e2", color: "#ef4444" };
    }
  };

  return (
    <AdminLayout activePath="/admin/branding-requests">
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
            fontWeight: 600,
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
          maxWidth: "1120px",
          margin: "0 auto",
          padding: "24px 20px 48px 20px",
          boxSizing: "border-box",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        }}
      >
        {/* Outer White Card matching exact reference design */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            border: "1px solid #eef2f6",
            boxShadow: "0 4px 24px -2px rgba(15, 23, 42, 0.05)",
            padding: "28px 32px 36px 32px",
            boxSizing: "border-box",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    backgroundColor: "#eff6ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Sparkles style={{ width: "20px", height: "20px", color: "#2563eb" }} />
                </div>
                <div>
                  <h1
                    style={{
                      fontSize: "22px",
                      fontWeight: 700,
                      color: "#0f172a",
                      margin: 0,
                      letterSpacing: "-0.3px",
                    }}
                  >
                    Branding Requests
                  </h1>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 400,
                      color: "#64748b",
                      margin: "2px 0 0 0",
                    }}
                  >
                    Review and approve tenant custom domains, logos, and white-label requests
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stat Counter Pills */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                onClick={() => setStatusFilter("All Status")}
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  backgroundColor: statusFilter === "All Status" ? "#eff6ff" : "#f8fafc",
                  border: statusFilter === "All Status" ? "1px solid #bfdbfe" : "1px solid #e2e8f0",
                  color: statusFilter === "All Status" ? "#2563eb" : "#475569",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                All: {totalCount}
              </div>

              <div
                onClick={() => setStatusFilter("Pending Review")}
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  backgroundColor: statusFilter === "Pending Review" ? "#fef3c7" : "#fffbeb",
                  border: statusFilter === "Pending Review" ? "1px solid #fde68a" : "1px solid #fef3c7",
                  color: "#d97706",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                Pending: {pendingCount}
              </div>

              <div
                onClick={() => setStatusFilter("Approved")}
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  backgroundColor: statusFilter === "Approved" ? "#dcfce7" : "#f0fdf4",
                  border: statusFilter === "Approved" ? "1px solid #bbf7d0" : "1px solid #dcfce7",
                  color: "#16a34a",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                Approved: {approvedCount}
              </div>

              <div
                onClick={() => setStatusFilter("Rejected")}
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  backgroundColor: statusFilter === "Rejected" ? "#fee2e2" : "#fef2f2",
                  border: statusFilter === "Rejected" ? "1px solid #fecaca" : "1px solid #fee2e2",
                  color: "#ef4444",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                Rejected: {rejectedCount}
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "14px",
              marginBottom: "20px",
              flexWrap: "wrap",
            }}
          >
            {/* Search Input Box */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "8px 14px",
                width: "320px",
                maxWidth: "100%",
                boxSizing: "border-box",
                boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
              }}
            >
              <Search
                style={{
                  width: "16px",
                  height: "16px",
                  color: "#94a3b8",
                  flexShrink: 0,
                }}
              />
              <input
                type="text"
                placeholder="Search organization or domain..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  fontSize: "13px",
                  color: "#0f172a",
                  width: "100%",
                  backgroundColor: "transparent",
                }}
              />
              {searchTerm && (
                <X
                  onClick={() => setSearchTerm("")}
                  style={{
                    width: "14px",
                    height: "14px",
                    color: "#94a3b8",
                    cursor: "pointer",
                  }}
                />
              )}
            </div>

            {/* Filter Dropdowns */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
                    fontSize: "13px",
                    color: "#334155",
                    cursor: "pointer",
                    outline: "none",
                    fontWeight: 500,
                  }}
                >
                  <option value="All Types">All Types</option>
                  <option value="Custom Domain">Custom Domain</option>
                  <option value="Logo & Theme">Logo & Theme</option>
                  <option value="Full White-Label">Full White-Label</option>
                  <option value="Email Branding">Email Branding</option>
                </select>
                <ChevronDown
                  style={{
                    width: "14px",
                    height: "14px",
                    color: "#64748b",
                    position: "absolute",
                    right: "12px",
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
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "8px 32px 8px 14px",
                    fontSize: "13px",
                    color: "#334155",
                    cursor: "pointer",
                    outline: "none",
                    fontWeight: 500,
                  }}
                >
                  <option value="All Status">All Status</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <ChevronDown
                  style={{
                    width: "14px",
                    height: "14px",
                    color: "#64748b",
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

          {/* Table Container */}
          <div
            style={{
              overflowX: "auto",
              width: "100%",
            }}
          >
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
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <th
                    style={{
                      padding: "12px 14px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748b",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                    }}
                  >
                    ORGANIZATION
                  </th>
                  <th
                    style={{
                      padding: "12px 14px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748b",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                    }}
                  >
                    REQUEST TYPE
                  </th>
                  <th
                    style={{
                      padding: "12px 14px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748b",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                    }}
                  >
                    DETAILS / DOMAIN
                  </th>
                  <th
                    style={{
                      padding: "12px 14px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748b",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                    }}
                  >
                    SUBMITTED
                  </th>
                  <th
                    style={{
                      padding: "12px 14px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748b",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                    }}
                  >
                    STATUS
                  </th>
                  <th
                    style={{
                      padding: "12px 14px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748b",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      textAlign: "right",
                    }}
                  >
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => {
                  const typeBadge = getTypeBadgeStyle(req.type);
                  const statusBadge = getStatusBadgeStyle(req.status);

                  return (
                    <tr
                      key={req.id}
                      style={{
                        borderBottom: "1px solid #f8fafc",
                        transition: "background-color 0.15s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#f8fafc")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      {/* Organization with Avatar */}
                      <td style={{ padding: "14px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "8px",
                              backgroundColor: req.logoBg,
                              color: "#ffffff",
                              fontSize: "11px",
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            {req.logoInitial}
                          </div>
                          <div>
                            <div
                              style={{
                                fontSize: "13px",
                                fontWeight: 600,
                                color: "#0f172a",
                                lineHeight: 1.2,
                              }}
                            >
                              {req.organization}
                            </div>
                            <span
                              style={{
                                fontSize: "11px",
                                color: "#94a3b8",
                                fontFamily: "monospace",
                              }}
                            >
                              {req.requestCode}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Request Type */}
                      <td style={{ padding: "14px 14px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "4px 9px",
                            borderRadius: "6px",
                            fontSize: "11.5px",
                            fontWeight: 600,
                            backgroundColor: typeBadge.backgroundColor,
                            color: typeBadge.color,
                            border: typeBadge.border,
                          }}
                        >
                          {getTypeIcon(req.type)}
                          <span>{req.type}</span>
                        </span>
                      </td>

                      {/* Details / Domain */}
                      <td style={{ padding: "14px 14px" }}>
                        <div
                          style={{
                            fontSize: "12.5px",
                            color: "#334155",
                            fontWeight: 500,
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <span>{req.details}</span>
                          {req.cnameVerified && (
                            <span
                              title="CNAME DNS Verified"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                color: "#16a34a",
                              }}
                            >
                              <CheckCircle2 style={{ width: "13px", height: "13px" }} />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Submitted Date */}
                      <td style={{ padding: "14px 14px" }}>
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#64748b",
                          }}
                        >
                          {req.submittedDate}
                        </span>
                      </td>

                      {/* Status Pill */}
                      <td style={{ padding: "14px 14px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 10px",
                            borderRadius: "12px",
                            fontSize: "11.5px",
                            fontWeight: 600,
                            backgroundColor: statusBadge.backgroundColor,
                            color: statusBadge.color,
                          }}
                        >
                          {req.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "14px 14px", textAlign: "right" }}>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <button
                            onClick={() => setSelectedRequest(req)}
                            style={{
                              padding: "6px 12px",
                              backgroundColor: req.status === "Pending Review" ? "#2563eb" : "#f1f5f9",
                              color: req.status === "Pending Review" ? "#ffffff" : "#334155",
                              border: "none",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              transition: "background-color 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              if (req.status === "Pending Review") {
                                e.currentTarget.style.backgroundColor = "#1d4ed8";
                              } else {
                                e.currentTarget.style.backgroundColor = "#e2e8f0";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (req.status === "Pending Review") {
                                e.currentTarget.style.backgroundColor = "#2563eb";
                              } else {
                                e.currentTarget.style.backgroundColor = "#f1f5f9";
                              }
                            }}
                          >
                            <Eye style={{ width: "13px", height: "13px" }} />
                            <span>{req.status === "Pending Review" ? "Review" : "View"}</span>
                          </button>

                          {req.status === "Pending Review" && (
                            <button
                              onClick={() => handleApprove(req.id)}
                              title="Quick Approve"
                              style={{
                                padding: "6px 8px",
                                backgroundColor: "#dcfce7",
                                color: "#16a34a",
                                border: "1px solid #bbf7d0",
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor = "#bbf7d0")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor = "#dcfce7")
                              }
                            >
                              <Check style={{ width: "13px", height: "13px" }} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredRequests.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        padding: "36px",
                        textAlign: "center",
                        color: "#94a3b8",
                        fontSize: "13px",
                      }}
                    >
                      No branding requests match your current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================= REVIEW ASSETS MODAL ================= */}
      {selectedRequest && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            padding: "20px",
            boxSizing: "border-box",
          }}
          onClick={() => setSelectedRequest(null)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "18px",
              width: "100%",
              maxWidth: "600px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              border: "1px solid #e2e8f0",
              overflow: "hidden",
              boxSizing: "border-box",
            }}
            onClick={(e) => e.stopPropagation()}
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
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "8px",
                    backgroundColor: selectedRequest.logoBg,
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {selectedRequest.logoInitial}
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "#0f172a",
                      margin: 0,
                    }}
                  >
                    {selectedRequest.organization}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                    <span style={{ fontSize: "11.5px", color: "#64748b" }}>
                      {selectedRequest.requestCode}
                    </span>
                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>•</span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: "10px",
                        ...getStatusBadgeStyle(selectedRequest.status),
                      }}
                    >
                      {selectedRequest.status}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedRequest(null)}
                style={{
                  border: "none",
                  backgroundColor: "transparent",
                  color: "#64748b",
                  cursor: "pointer",
                  padding: "6px",
                  borderRadius: "6px",
                }}
              >
                <X style={{ width: "18px", height: "18px" }} />
              </button>
            </div>

            {/* Modal Body */}
            <div
              style={{
                padding: "22px 24px",
                display: "flex",
                flexDirection: "column",
                gap: "18px",
                maxHeight: "70vh",
                overflowY: "auto",
              }}
            >
              {/* Request Type & Details */}
              <div
                style={{
                  backgroundColor: "#f8fafc",
                  borderRadius: "12px",
                  padding: "14px 16px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                  Submitted Configuration
                </div>
                <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#0f172a", marginTop: "4px" }}>
                  {selectedRequest.details}
                </div>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                  Requested on {selectedRequest.submittedDate}
                </div>
              </div>

              {/* DNS Verification Check if Domain */}
              {selectedRequest.domain && (
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    padding: "14px 16px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#0f172a" }}>
                      Custom Domain DNS Check
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: selectedRequest.cnameVerified ? "#16a34a" : "#ef4444",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      {selectedRequest.cnameVerified ? (
                        <>
                          <CheckCircle2 style={{ width: "13px", height: "13px" }} />
                          <span>CNAME Validated</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle style={{ width: "13px", height: "13px" }} />
                          <span>CNAME Mismatched</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div style={{ marginTop: "10px", fontSize: "12px", color: "#475569", lineHeight: 1.6 }}>
                    <div>
                      <strong>Host:</strong>{" "}
                      <code style={{ backgroundColor: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>
                        {selectedRequest.domain}
                      </code>
                    </div>
                    <div>
                      <strong>Target:</strong>{" "}
                      <code style={{ backgroundColor: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>
                        cname.vorldx.com
                      </code>
                    </div>
                    <div>
                      <strong>SSL Certificate:</strong> Automated Let&apos;s Encrypt wildcard issued.
                    </div>
                  </div>
                </div>
              )}

              {/* Live Quotation Preview with proposed branding */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  padding: "14px 16px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#0f172a", marginBottom: "10px" }}>
                  Live Document Header Preview
                </div>
                {/* Mini Document Top Bar */}
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    padding: "12px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "6px",
                        backgroundColor: selectedRequest.primaryColor || "#2563eb",
                        color: "#ffffff",
                        fontSize: "10px",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {selectedRequest.logoInitial}
                    </div>
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>
                        {selectedRequest.organization}
                      </div>
                      <div style={{ fontSize: "9.5px", color: "#64748b" }}>
                        {selectedRequest.domain || "acme.vorldx.com"}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "4px 10px",
                      borderRadius: "4px",
                      backgroundColor: selectedRequest.primaryColor || "#2563eb",
                      color: "#ffffff",
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                    }}
                  >
                    QUOTATION
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              {selectedRequest.notes && (
                <div style={{ fontSize: "12px", color: "#64748b" }}>
                  <strong>Admin Audit Notes:</strong> {selectedRequest.notes}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "10px",
                backgroundColor: "#f8fafc",
              }}
            >
              <button
                onClick={() => setSelectedRequest(null)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  backgroundColor: "#ffffff",
                  border: "1px solid #cbd5e1",
                  color: "#475569",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Close
              </button>

              {selectedRequest.status !== "Rejected" && (
                <button
                  onClick={() => handleReject(selectedRequest.id)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    backgroundColor: "#fee2e2",
                    border: "1px solid #fecaca",
                    color: "#dc2626",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Reject Request
                </button>
              )}

              {selectedRequest.status !== "Approved" && (
                <button
                  onClick={() => handleApprove(selectedRequest.id)}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "8px",
                    backgroundColor: "#16a34a",
                    border: "none",
                    color: "#ffffff",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(22,163,74,0.25)",
                  }}
                >
                  Approve & Deploy
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
