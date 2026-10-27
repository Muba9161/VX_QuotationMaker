"use client";
import React, { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  Search,
  Plus,
  Upload,
  Download,
  MoreVertical,
  ChevronDown,
  Calendar,
  Check,
  FileText,
  FileSpreadsheet,
  FileCheck,
  FileCode,
  ArrowRight,
  MoreHorizontal,
  X,
  Eye,
  Clock,
  History,
  Info,
} from "lucide-react";

interface DocItem {
  id: string;
  docNumber: string;
  type: "Quotation" | "Proposal" | "Invoice" | "Agreement" | "Others";
  organization: string;
  status: "Sent" | "Viewed" | "Paid" | "Draft" | "Accepted" | "Overdue" | "Rejected" | "Expired";
  createdOn: string;
  iconColor: string;
  amount: string;
  recipient: string;
}

const INITIAL_DOCUMENTS: DocItem[] = [
  {
    id: "doc-1",
    docNumber: "QTN-2026-001",
    type: "Quotation",
    organization: "Acme Technologies",
    status: "Sent",
    createdOn: "28 Oct 2026",
    iconColor: "#2563eb",
    amount: "₹94,400",
    recipient: "Global Systems Ltd",
  },
  {
    id: "doc-2",
    docNumber: "PROP-2026-015",
    type: "Proposal",
    organization: "NextGen Digital",
    status: "Viewed",
    createdOn: "27 Oct 2026",
    iconColor: "#f59e0b",
    amount: "₹1,85,000",
    recipient: "Apex Logistics Ltd",
  },
  {
    id: "doc-3",
    docNumber: "INV-2026-032",
    type: "Invoice",
    organization: "Global Systems",
    status: "Paid",
    createdOn: "26 Oct 2026",
    iconColor: "#10b981",
    amount: "₹42,500",
    recipient: "Blue Horizon Corp",
  },
  {
    id: "doc-4",
    docNumber: "AG-2026-004",
    type: "Agreement",
    organization: "Tech Solutions",
    status: "Draft",
    createdOn: "25 Oct 2026",
    iconColor: "#8b5cf6",
    amount: "₹3,20,000",
    recipient: "Vanguard Dynamics",
  },
  {
    id: "doc-5",
    docNumber: "QTN-2026-002",
    type: "Quotation",
    organization: "Innovate India",
    status: "Accepted",
    createdOn: "24 Oct 2026",
    iconColor: "#2563eb",
    amount: "₹76,000",
    recipient: "Zenith Enterprises",
  },
  {
    id: "doc-6",
    docNumber: "PROP-2026-014",
    type: "Proposal",
    organization: "Bright Future",
    status: "Sent",
    createdOn: "24 Oct 2026",
    iconColor: "#f59e0b",
    amount: "₹2,10,000",
    recipient: "Nova Retail Network",
  },
  {
    id: "doc-7",
    docNumber: "INV-2026-031",
    type: "Invoice",
    organization: "CodeCraft Solutions",
    status: "Overdue",
    createdOn: "22 Oct 2026",
    iconColor: "#10b981",
    amount: "₹18,200",
    recipient: "Silverline Ventures",
  },
  {
    id: "doc-8",
    docNumber: "QTN-2026-003",
    type: "Quotation",
    organization: "DataMind Analytics",
    status: "Viewed",
    createdOn: "20 Oct 2026",
    iconColor: "#2563eb",
    amount: "₹88,000",
    recipient: "Nexus Global Group",
  },
  {
    id: "doc-9",
    docNumber: "AG-2026-003",
    type: "Agreement",
    organization: "Acme Technologies",
    status: "Draft",
    createdOn: "18 Oct 2026",
    iconColor: "#f59e0b",
    amount: "₹5,00,000",
    recipient: "Summit Tech Works",
  },
  {
    id: "doc-10",
    docNumber: "PROP-2026-013",
    type: "Proposal",
    organization: "NextGen Digital",
    status: "Rejected",
    createdOn: "16 Oct 2026",
    iconColor: "#8b5cf6",
    amount: "₹1,40,000",
    recipient: "InfraCorp Asia",
  },
];

export default function AdminDocumentsPage() {
  const [topTab, setTopTab] = useState("All Documents");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedOrg, setSelectedOrg] = useState("All Organizations");
  const [createdBy, setCreatedBy] = useState("All Users");
  const [sortOption, setSortOption] = useState("Last Modified");

  const [selectedDocId, setSelectedDocId] = useState<string>("doc-1");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [previewSubTab, setPreviewSubTab] = useState("Preview");
  const [activePage, setActivePage] = useState(1);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newDocNumber, setNewDocNumber] = useState("QTN-2026-010");
  const [newDocType, setNewDocType] = useState<
    "Quotation" | "Proposal" | "Invoice" | "Agreement" | "Others"
  >("Quotation");
  const [newOrg, setNewOrg] = useState("Acme Technologies");

  const topTabs = [
    "All Documents",
    "Quotations",
    "Proposals",
    "Invoices",
    "Agreements",
    "Others",
  ];

  // Filtering documents
  const filteredDocs = INITIAL_DOCUMENTS.filter((doc) => {
    // Top tab filtering
    if (topTab === "Quotations" && doc.type !== "Quotation") return false;
    if (topTab === "Proposals" && doc.type !== "Proposal") return false;
    if (topTab === "Invoices" && doc.type !== "Invoice") return false;
    if (topTab === "Agreements" && doc.type !== "Agreement") return false;
    if (
      topTab === "Others" &&
      (doc.type === "Quotation" ||
        doc.type === "Proposal" ||
        doc.type === "Invoice" ||
        doc.type === "Agreement")
    )
      return false;

    // Search query
    if (
      searchQuery &&
      !doc.docNumber.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !doc.organization.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Type filter
    if (selectedTypes.length > 0 && !selectedTypes.includes(doc.type)) {
      return false;
    }

    // Status filter
    if (selectedStatuses.length > 0 && !selectedStatuses.includes(doc.status)) {
      return false;
    }

    // Org filter
    if (selectedOrg !== "All Organizations" && doc.organization !== selectedOrg) {
      return false;
    }

    return true;
  });

  const selectedDoc =
    INITIAL_DOCUMENTS.find((d) => d.id === selectedDocId) ||
    INITIAL_DOCUMENTS[0];

  const toggleSelectRow = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((r) => r !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === filteredDocs.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredDocs.map((d) => d.id));
    }
  };

  const toggleType = (t: string) => {
    if (selectedTypes.includes(t)) {
      setSelectedTypes(selectedTypes.filter((x) => x !== t));
    } else {
      setSelectedTypes([...selectedTypes, t]);
    }
  };

  const toggleStatus = (s: string) => {
    if (selectedStatuses.includes(s)) {
      setSelectedStatuses(selectedStatuses.filter((x) => x !== s));
    } else {
      setSelectedStatuses([...selectedStatuses, s]);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Sent":
        return { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" };
      case "Viewed":
        return { bg: "#fef3c7", text: "#d97706", border: "#fde68a" };
      case "Paid":
        return { bg: "#dcfce7", text: "#166534", border: "#bbf7d0" };
      case "Accepted":
        return { bg: "#d1fae5", text: "#065f46", border: "#a7f3d0" };
      case "Overdue":
        return { bg: "#fee2e2", text: "#dc2626", border: "#fecaca" };
      case "Rejected":
        return { bg: "#fee2e2", text: "#b91c1c", border: "#fecaca" };
      case "Draft":
      default:
        return { bg: "#f1f5f9", text: "#475569", border: "#e2e8f0" };
    }
  };

  return (
    <AdminLayout activePath="/admin/documents">
      <div
        style={{
          width: "100%",
          maxWidth: "1650px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          boxSizing: "border-box",
        }}
      >
        {/* ================= PAGE HEADER ================= */}
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
                fontSize: "26px",
                fontWeight: "900",
                color: "#0f172a",
                letterSpacing: "-0.5px",
                margin: 0,
              }}
            >
              Documents
            </h1>
            <p
              style={{
                fontSize: "13px",
                color: "#64748b",
                margin: "4px 0 0 0",
              }}
            >
              Manage all created documents, quotations, proposals, invoices and
              agreements
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={() => setIsCreateOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                backgroundColor: "#2563eb",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
                transition: "background 0.15s ease",
              }}
            >
              <Plus style={{ width: "16px", height: "16px" }} />
              <span>Create Document</span>
            </button>

            <button
              onClick={() => alert("Document import wizard initialized.")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                backgroundColor: "#ffffff",
                color: "#334155",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
              }}
            >
              <Upload style={{ width: "16px", height: "16px", color: "#64748b" }} />
              <span>Import Document</span>
            </button>
          </div>
        </div>

        {/* ================= TOP TABS BAR ================= */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "28px",
            borderBottom: "1px solid #e2e8f0",
            padding: "0 4px",
            overflowX: "auto",
          }}
        >
          {topTabs.map((tab) => {
            const isActive = topTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setTopTab(tab)}
                style={{
                  padding: "10px 4px",
                  fontSize: "13.5px",
                  fontWeight: isActive ? "800" : "600",
                  color: isActive ? "#2563eb" : "#64748b",
                  backgroundColor: "transparent",
                  border: "none",
                  borderBottom: isActive
                    ? "2.5px solid #2563eb"
                    : "2.5px solid transparent",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease",
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* ================= 3-COLUMN MAIN WORKSPACE ================= */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "240px 580px 1fr",
            gap: "20px",
            alignItems: "start",
            boxSizing: "border-box",
          }}
        >
          {/* ================= COLUMN 1: FILTERS ================= */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              padding: "20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              boxSizing: "border-box",
            }}
          >
            {/* Filters Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "800",
                  color: "#0f172a",
                }}
              >
                Filters
              </span>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedTypes([]);
                  setSelectedStatuses([]);
                  setSelectedOrg("All Organizations");
                  setCreatedBy("All Users");
                }}
                style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#2563eb",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Clear All
              </button>
            </div>

            {/* Search */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#64748b",
                  marginBottom: "6px",
                }}
              >
                Search
              </label>
              <div style={{ position: "relative" }}>
                <Search
                  style={{
                    width: "14px",
                    height: "14px",
                    color: "#94a3b8",
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    height: "38px",
                    padding: "0 10px 0 34px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "12.5px",
                    color: "#0f172a",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            {/* Document Type Checkboxes */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#64748b",
                  marginBottom: "8px",
                }}
              >
                Document Type
              </label>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "7px",
                  fontSize: "12.5px",
                }}
              >
                {[
                  "Quotation",
                  "Proposal",
                  "Invoice",
                  "Agreement",
                  "Others",
                ].map((type) => {
                  const isChecked = selectedTypes.includes(type);
                  return (
                    <label
                      key={type}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                        color: isChecked ? "#0f172a" : "#475569",
                        fontWeight: isChecked ? "700" : "500",
                      }}
                      onClick={() => toggleType(type)}
                    >
                      <div
                        style={{
                          width: "16px",
                          height: "16px",
                          borderRadius: "4px",
                          border: `1.5px solid ${
                            isChecked ? "#2563eb" : "#cbd5e1"
                          }`,
                          backgroundColor: isChecked ? "#2563eb" : "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#ffffff",
                          flexShrink: 0,
                        }}
                      >
                        {isChecked && (
                          <Check
                            style={{
                              width: "12px",
                              height: "12px",
                              strokeWidth: 3,
                            }}
                          />
                        )}
                      </div>
                      <span>{type}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Status Checkboxes */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#64748b",
                  marginBottom: "8px",
                }}
              >
                Status
              </label>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "7px",
                  fontSize: "12.5px",
                }}
              >
                {[
                  "Draft",
                  "Sent",
                  "Viewed",
                  "Accepted",
                  "Rejected",
                  "Expired",
                ].map((st) => {
                  const isChecked = selectedStatuses.includes(st);
                  return (
                    <label
                      key={st}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                        color: isChecked ? "#0f172a" : "#475569",
                        fontWeight: isChecked ? "700" : "500",
                      }}
                      onClick={() => toggleStatus(st)}
                    >
                      <div
                        style={{
                          width: "16px",
                          height: "16px",
                          borderRadius: "4px",
                          border: `1.5px solid ${
                            isChecked ? "#2563eb" : "#cbd5e1"
                          }`,
                          backgroundColor: isChecked ? "#2563eb" : "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#ffffff",
                          flexShrink: 0,
                        }}
                      >
                        {isChecked && (
                          <Check
                            style={{
                              width: "12px",
                              height: "12px",
                              strokeWidth: 3,
                            }}
                          />
                        )}
                      </div>
                      <span>{st}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Organization Dropdown */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#64748b",
                  marginBottom: "6px",
                }}
              >
                Organization
              </label>
              <div style={{ position: "relative" }}>
                <select
                  value={selectedOrg}
                  onChange={(e) => setSelectedOrg(e.target.value)}
                  style={{
                    width: "100%",
                    height: "38px",
                    padding: "0 28px 0 10px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#0f172a",
                    fontWeight: "600",
                    appearance: "none",
                    outline: "none",
                    cursor: "pointer",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="All Organizations">All Organizations</option>
                  <option value="Acme Technologies">Acme Technologies</option>
                  <option value="NextGen Digital">NextGen Digital</option>
                  <option value="Global Systems">Global Systems</option>
                  <option value="Tech Solutions">Tech Solutions</option>
                  <option value="Innovate India">Innovate India</option>
                </select>
                <ChevronDown
                  style={{
                    width: "14px",
                    height: "14px",
                    color: "#94a3b8",
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>

            {/* Created By Dropdown */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#64748b",
                  marginBottom: "6px",
                }}
              >
                Created By
              </label>
              <div style={{ position: "relative" }}>
                <select
                  value={createdBy}
                  onChange={(e) => setCreatedBy(e.target.value)}
                  style={{
                    width: "100%",
                    height: "38px",
                    padding: "0 28px 0 10px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#0f172a",
                    fontWeight: "600",
                    appearance: "none",
                    outline: "none",
                    cursor: "pointer",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="All Users">All Users</option>
                  <option value="Platform Admin">Platform Admin</option>
                  <option value="Rahul Sharma">Rahul Sharma</option>
                  <option value="Priya Singh">Priya Singh</option>
                </select>
                <ChevronDown
                  style={{
                    width: "14px",
                    height: "14px",
                    color: "#94a3b8",
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#64748b",
                  marginBottom: "6px",
                }}
              >
                Date Range
              </label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  height: "38px",
                  padding: "0 10px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#94a3b8",
                  cursor: "pointer",
                }}
              >
                <Calendar style={{ width: "14px", height: "14px" }} />
                <span>Select date range</span>
              </div>
            </div>
          </div>

          {/* ================= COLUMN 2: DOCUMENTS TABLE (10 ROWS + PAGINATION) ================= */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              padding: "16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              boxSizing: "border-box",
            }}
          >
            {/* Top Table Bar: Count & Sort */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: "8px",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <span
                style={{
                  fontSize: "13.5px",
                  fontWeight: "800",
                  color: "#0f172a",
                }}
              >
                Documents (24)
              </span>

              <div style={{ position: "relative" }}>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  style={{
                    height: "30px",
                    padding: "0 22px 0 8px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "11.5px",
                    color: "#475569",
                    fontWeight: "600",
                    appearance: "none",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="Last Modified">Last Modified</option>
                  <option value="Newest First">Newest First</option>
                  <option value="Amount: High to Low">Amount: High to Low</option>
                </select>
                <ChevronDown
                  style={{
                    width: "12px",
                    height: "12px",
                    color: "#94a3b8",
                    position: "absolute",
                    right: "6px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "11.5px",
                  textAlign: "left",
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid #e2e8f0",
                      color: "#64748b",
                      fontSize: "10.5px",
                      textTransform: "uppercase",
                      letterSpacing: "0.4px",
                      backgroundColor: "#f8fafc",
                    }}
                  >
                    <th style={{ padding: "8px 6px", width: "24px" }}>
                      <input
                        type="checkbox"
                        checked={
                          selectedRows.length === filteredDocs.length &&
                          filteredDocs.length > 0
                        }
                        onChange={toggleSelectAll}
                        style={{ cursor: "pointer", accentColor: "#2563eb" }}
                      />
                    </th>
                    <th style={{ padding: "8px 4px", width: "16px" }}>#</th>
                    <th style={{ padding: "8px 8px" }}>Document Name</th>
                    <th style={{ padding: "8px 8px" }}>Type</th>
                    <th style={{ padding: "8px 8px" }}>Organization</th>
                    <th style={{ padding: "8px 8px" }}>Status</th>
                    <th style={{ padding: "8px 8px" }}>Created On</th>
                    <th style={{ padding: "8px 6px", textAlign: "right" }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocs.map((doc, index) => {
                    const isSelected = selectedDocId === doc.id;
                    const isChecked = selectedRows.includes(doc.id);
                    const statusStyle = getStatusStyle(doc.status);

                    return (
                      <tr
                        key={doc.id}
                        onClick={() => setSelectedDocId(doc.id)}
                        style={{
                          borderBottom: "1px solid #f1f5f9",
                          backgroundColor: isSelected
                            ? "#eff6ff"
                            : isChecked
                            ? "#f8fafc"
                            : "#ffffff",
                          cursor: "pointer",
                          transition: "background 0.15s ease",
                        }}
                      >
                        <td
                          style={{ padding: "10px 6px" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectRow(doc.id);
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            style={{ cursor: "pointer", accentColor: "#2563eb" }}
                          />
                        </td>
                        <td style={{ padding: "10px 4px", color: "#94a3b8" }}>
                          {index + 1}
                        </td>
                        <td style={{ padding: "10px 8px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <div
                              style={{
                                width: "18px",
                                height: "20px",
                                backgroundColor: doc.iconColor,
                                borderRadius: "3px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#ffffff",
                                flexShrink: 0,
                              }}
                            >
                              <FileText
                                style={{ width: "11px", height: "11px" }}
                              />
                            </div>
                            <span
                              style={{
                                fontWeight: "800",
                                color: isSelected ? "#1d4ed8" : "#0f172a",
                                fontFamily: "monospace",
                              }}
                            >
                              {doc.docNumber}
                            </span>
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "10px 8px",
                            color: "#475569",
                            fontWeight: "500",
                          }}
                        >
                          {doc.type}
                        </td>
                        <td
                          style={{
                            padding: "10px 8px",
                            color: "#0f172a",
                            fontWeight: "600",
                            maxWidth: "110px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {doc.organization}
                        </td>
                        <td style={{ padding: "10px 8px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "2px 8px",
                              borderRadius: "9999px",
                              fontSize: "10px",
                              fontWeight: "700",
                              backgroundColor: statusStyle.bg,
                              color: statusStyle.text,
                              border: `1px solid ${statusStyle.border}`,
                            }}
                          >
                            {doc.status}
                          </span>
                        </td>
                        <td style={{ padding: "10px 8px", color: "#64748b" }}>
                          {doc.createdOn}
                        </td>
                        <td
                          style={{
                            padding: "10px 6px",
                            textAlign: "right",
                            color: "#94a3b8",
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            style={{
                              background: "none",
                              border: "none",
                              color: "#94a3b8",
                              cursor: "pointer",
                              padding: "2px",
                            }}
                          >
                            <MoreVertical
                              style={{ width: "14px", height: "14px" }}
                            />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Pagination */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: "10px",
                borderTop: "1px solid #f1f5f9",
                fontSize: "11.5px",
                color: "#64748b",
              }}
            >
              <span>Showing 1-10 of 24</span>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <button
                  style={{
                    width: "26px",
                    height: "26px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    fontSize: "11px",
                    fontWeight: "800",
                    cursor: "pointer",
                  }}
                >
                  1
                </button>
                <button
                  style={{
                    width: "26px",
                    height: "26px",
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                    backgroundColor: "#ffffff",
                    color: "#475569",
                    fontSize: "11px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  2
                </button>
                <button
                  style={{
                    width: "26px",
                    height: "26px",
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                    backgroundColor: "#ffffff",
                    color: "#475569",
                    fontSize: "11px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  3
                </button>
                <span style={{ color: "#94a3b8", padding: "0 2px" }}>&hellip;</span>
                <button
                  style={{
                    width: "26px",
                    height: "26px",
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                    backgroundColor: "#ffffff",
                    color: "#475569",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <ArrowRight style={{ width: "12px", height: "12px" }} />
                </button>
              </div>
            </div>
          </div>

          {/* ================= COLUMN 3: DOCUMENT PREVIEW & ACTION STRIP ================= */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              boxSizing: "border-box",
            }}
          >
            {/* Header: Document Title, Status Pill, Download & More Buttons */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
                borderBottom: "1px solid #f1f5f9",
                paddingBottom: "14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h2
                  style={{
                    fontSize: "19px",
                    fontWeight: "900",
                    color: "#0f172a",
                    letterSpacing: "-0.5px",
                    margin: 0,
                    fontFamily: "monospace",
                  }}
                >
                  {selectedDoc.docNumber}
                </h2>
                <span
                  style={{
                    display: "inline-block",
                    padding: "2px 10px",
                    borderRadius: "9999px",
                    fontSize: "11px",
                    fontWeight: "700",
                    ...getStatusStyle(selectedDoc.status),
                  }}
                >
                  {selectedDoc.status}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  onClick={() =>
                    alert(`Downloading ${selectedDoc.docNumber} as PDF.`)
                  }
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 16px",
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(37,99,235,0.2)",
                  }}
                >
                  <Download style={{ width: "13px", height: "13px" }} />
                  <span>Download</span>
                  <ChevronDown style={{ width: "12px", height: "12px" }} />
                </button>

                <button
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "8px 12px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#334155",
                    cursor: "pointer",
                  }}
                >
                  <span>More</span>
                  <ChevronDown style={{ width: "12px", height: "12px" }} />
                </button>
              </div>
            </div>

            {/* Sub-tabs: Preview, Details, Activity, Versions */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "24px",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              {["Preview", "Details", "Activity", "Versions"].map((subTab) => {
                const isActive = previewSubTab === subTab;
                return (
                  <button
                    key={subTab}
                    onClick={() => setPreviewSubTab(subTab)}
                    style={{
                      padding: "8px 2px",
                      fontSize: "13px",
                      fontWeight: isActive ? "800" : "600",
                      color: isActive ? "#2563eb" : "#64748b",
                      backgroundColor: "transparent",
                      border: "none",
                      borderBottom: isActive
                        ? "2.5px solid #2563eb"
                        : "2.5px solid transparent",
                      cursor: "pointer",
                    }}
                  >
                    {subTab}
                  </button>
                );
              })}
            </div>

            {/* Main Preview Container */}
            {previewSubTab === "Preview" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* A4 Sheet */}
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: "10px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
                    position: "relative",
                    overflow: "hidden",
                    padding: "36px",
                    minHeight: "680px",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  {/* Top-Left Blue Geometric Cut */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "110px",
                      height: "110px",
                      pointerEvents: "none",
                      clipPath: "polygon(0 0, 100% 0, 0 100%)",
                      backgroundColor: "#2563eb",
                    }}
                  />

                  {/* Bottom-Right Blue Geometric Cut */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: "130px",
                      height: "130px",
                      pointerEvents: "none",
                      clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
                      background: "linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)",
                    }}
                  />

                  {/* Document Body */}
                  <div style={{ position: "relative", zIndex: 1 }}>
                    {/* Header Row */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        marginBottom: "28px",
                      }}
                    >
                      {/* Logo and Org */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          marginLeft: "24px",
                        }}
                      >
                        <svg
                          viewBox="0 0 40 32"
                          style={{ width: "38px", height: "30px" }}
                        >
                          <path d="M20 2 L4 30 L16 30 Z" fill="#2563eb" />
                          <path d="M20 2 L36 30 L24 30 Z" fill="#38bdf8" />
                          <path d="M16 20 L24 20 L20 12 Z" fill="#ffffff" />
                        </svg>
                        <h3
                          style={{
                            fontSize: "18px",
                            fontWeight: "900",
                            color: "#0f172a",
                            letterSpacing: "1px",
                            margin: 0,
                          }}
                        >
                          ACME
                        </h3>
                      </div>

                      {/* Doc Title & Meta */}
                      <div style={{ textAlign: "right" }}>
                        <h3
                          style={{
                            fontSize: "18px",
                            fontWeight: "900",
                            color: "#0f172a",
                            margin: 0,
                          }}
                        >
                          {selectedDoc.type}
                        </h3>
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: "800",
                            color: "#0f172a",
                            display: "block",
                            marginTop: "2px",
                            fontFamily: "monospace",
                          }}
                        >
                          #{selectedDoc.docNumber}
                        </span>
                        <span
                          style={{
                            fontSize: "10.5px",
                            color: "#64748b",
                            display: "block",
                            marginTop: "2px",
                          }}
                        >
                          Date: 28 Oct 2026
                        </span>
                        <span
                          style={{
                            fontSize: "10.5px",
                            color: "#64748b",
                            display: "block",
                          }}
                        >
                          Valid Till: 28 Nov 2026
                        </span>
                      </div>
                    </div>

                    {/* From & To Addresses */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1.2fr 1fr",
                        gap: "20px",
                        fontSize: "10.5px",
                        color: "#475569",
                        lineHeight: "1.5",
                        marginBottom: "24px",
                      }}
                    >
                      <div>
                        <strong
                          style={{
                            color: "#0f172a",
                            display: "block",
                            marginBottom: "2px",
                            fontSize: "11px",
                          }}
                        >
                          From:
                        </strong>
                        <strong style={{ color: "#0f172a", display: "block" }}>
                          Acme Technologies Pvt Ltd
                        </strong>
                        <span>A-123, Sector 62, Noida, UP 201309</span>
                        <br />
                        <span>+91 98765 43210</span>
                        <br />
                        <span>contact@acme.com</span>
                        <br />
                        <span>www.acme.com</span>
                      </div>

                      <div>
                        <strong
                          style={{
                            color: "#0f172a",
                            display: "block",
                            marginBottom: "2px",
                            fontSize: "11px",
                          }}
                        >
                          To:
                        </strong>
                        <strong style={{ color: "#0f172a", display: "block" }}>
                          {selectedDoc.recipient}
                        </strong>
                        <span>B-45, IT Park, Bangalore</span>
                        <br />
                        <span>+91 98765 67890</span>
                        <br />
                        <span>info@globalsystems.com</span>
                      </div>
                    </div>

                    {/* Financial Line Items Table */}
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "11px",
                        textAlign: "left",
                        marginBottom: "22px",
                      }}
                    >
                      <thead>
                        <tr
                          style={{
                            backgroundColor: "#f1f5f9",
                            color: "#0f172a",
                            fontWeight: "800",
                            borderBottom: "1.5px solid #cbd5e1",
                          }}
                        >
                          <th style={{ padding: "8px 10px", width: "24px" }}>
                            #
                          </th>
                          <th style={{ padding: "8px 10px" }}>Description</th>
                          <th style={{ padding: "8px 10px", textAlign: "center" }}>
                            Quantity
                          </th>
                          <th style={{ padding: "8px 10px", textAlign: "right" }}>
                            Unit Price
                          </th>
                          <th style={{ padding: "8px 10px", textAlign: "right" }}>
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "8px 10px" }}>1</td>
                          <td style={{ padding: "8px 10px", fontWeight: "700" }}>
                            Website Development
                          </td>
                          <td style={{ padding: "8px 10px", textAlign: "center" }}>
                            1
                          </td>
                          <td style={{ padding: "8px 10px", textAlign: "right" }}>
                            ₹50,000
                          </td>
                          <td
                            style={{
                              padding: "8px 10px",
                              textAlign: "right",
                              fontWeight: "700",
                            }}
                          >
                            ₹50,000
                          </td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "8px 10px" }}>2</td>
                          <td style={{ padding: "8px 10px", fontWeight: "700" }}>
                            UI/UX Design
                          </td>
                          <td style={{ padding: "8px 10px", textAlign: "center" }}>
                            1
                          </td>
                          <td style={{ padding: "8px 10px", textAlign: "right" }}>
                            ₹20,000
                          </td>
                          <td
                            style={{
                              padding: "8px 10px",
                              textAlign: "right",
                              fontWeight: "700",
                            }}
                          >
                            ₹20,000
                          </td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td style={{ padding: "8px 10px" }}>3</td>
                          <td style={{ padding: "8px 10px", fontWeight: "700" }}>
                            Maintenance (1 Year)
                          </td>
                          <td style={{ padding: "8px 10px", textAlign: "center" }}>
                            1
                          </td>
                          <td style={{ padding: "8px 10px", textAlign: "right" }}>
                            ₹10,000
                          </td>
                          <td
                            style={{
                              padding: "8px 10px",
                              textAlign: "right",
                              fontWeight: "700",
                            }}
                          >
                            ₹10,000
                          </td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={3} />
                          <td
                            style={{
                              padding: "5px 10px",
                              textAlign: "right",
                              color: "#64748b",
                            }}
                          >
                            Subtotal
                          </td>
                          <td
                            style={{
                              padding: "5px 10px",
                              textAlign: "right",
                              fontWeight: "700",
                            }}
                          >
                            ₹80,000
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={3} />
                          <td
                            style={{
                              padding: "5px 10px",
                              textAlign: "right",
                              color: "#64748b",
                            }}
                          >
                            GST (18%)
                          </td>
                          <td
                            style={{
                              padding: "5px 10px",
                              textAlign: "right",
                              fontWeight: "700",
                            }}
                          >
                            ₹14,400
                          </td>
                        </tr>
                        <tr style={{ backgroundColor: "#eff6ff" }}>
                          <td colSpan={3} />
                          <td
                            style={{
                              padding: "6px 10px",
                              textAlign: "right",
                              fontWeight: "900",
                              color: "#1e3a8a",
                            }}
                          >
                            Total
                          </td>
                          <td
                            style={{
                              padding: "6px 10px",
                              textAlign: "right",
                              fontWeight: "900",
                              color: "#1e3a8a",
                              fontSize: "12px",
                            }}
                          >
                            {selectedDoc.amount}
                          </td>
                        </tr>
                      </tfoot>
                    </table>

                    {/* Terms & Conditions */}
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#475569",
                        lineHeight: "1.6",
                      }}
                    >
                      <strong
                        style={{
                          color: "#0f172a",
                          display: "block",
                          marginBottom: "2px",
                        }}
                      >
                        Terms &amp; Conditions:
                      </strong>
                      <span>1. Payment: 50% advance, 50% on delivery.</span>
                      <br />
                      <span>
                        2. Validity: This quotation is valid for 30 days.
                      </span>
                      <br />
                      <span>3. Support: 1 year free support.</span>
                    </div>

                    <p
                      style={{
                        fontSize: "10.5px",
                        fontStyle: "italic",
                        color: "#64748b",
                        marginTop: "12px",
                      }}
                    >
                      Thank you for your business!
                    </p>
                  </div>

                  {/* Signature Section */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "space-between",
                      marginTop: "16px",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "9.5px", color: "#94a3b8" }}>
                        Authorized System Document &bull; Verified
                      </span>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span
                        style={{
                          fontFamily: "cursive",
                          fontSize: "18px",
                          color: "#1e3a8a",
                          display: "block",
                        }}
                      >
                        Rahul Sharma
                      </span>
                      <span
                        style={{
                          fontSize: "10.5px",
                          fontWeight: "800",
                          color: "#0f172a",
                          display: "block",
                        }}
                      >
                        Rahul Sharma
                      </span>
                      <span style={{ fontSize: "9.5px", color: "#64748b" }}>
                        Authorized Signatory
                      </span>
                      <br />
                      <span style={{ fontSize: "9.5px", color: "#64748b" }}>
                        Acme Technologies Pvt Ltd
                      </span>
                    </div>
                  </div>
                </div>

                {/* Horizontal Pages Carousel (Page 1, Page 2, Page 3, + Add Page) */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    overflowX: "auto",
                    paddingBottom: "4px",
                  }}
                >
                  {[1, 2, 3].map((page) => {
                    const isPageActive = activePage === page;
                    return (
                      <div
                        key={page}
                        onClick={() => setActivePage(page)}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "4px",
                          cursor: "pointer",
                        }}
                      >
                        <div
                          style={{
                            width: "68px",
                            height: "90px",
                            backgroundColor: "#ffffff",
                            border: `2px solid ${
                              isPageActive ? "#2563eb" : "#cbd5e1"
                            }`,
                            borderRadius: "6px",
                            boxShadow: isPageActive
                              ? "0 4px 12px rgba(37,99,235,0.2)"
                              : "0 1px 3px rgba(0,0,0,0.05)",
                            padding: "6px",
                            boxSizing: "border-box",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            position: "relative",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "16px",
                              height: "16px",
                              clipPath: "polygon(0 0, 100% 0, 0 100%)",
                              backgroundColor: "#2563eb",
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              bottom: 0,
                              right: 0,
                              width: "18px",
                              height: "18px",
                              clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
                              backgroundColor: "#2563eb",
                            }}
                          />

                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "3px",
                              marginTop: "6px",
                            }}
                          >
                            <div
                              style={{
                                height: "3px",
                                backgroundColor: "#94a3b8",
                                width: "50%",
                              }}
                            />
                            <div
                              style={{
                                height: "2px",
                                backgroundColor: "#cbd5e1",
                                width: "80%",
                              }}
                            />
                            <div
                              style={{
                                height: "2px",
                                backgroundColor: "#e2e8f0",
                                width: "100%",
                              }}
                            />
                            <div
                              style={{
                                height: "2px",
                                backgroundColor: "#e2e8f0",
                                width: "70%",
                              }}
                            />
                          </div>

                          <div
                            style={{
                              height: "2px",
                              backgroundColor: "#94a3b8",
                              width: "35%",
                              alignSelf: "flex-end",
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: isPageActive ? "800" : "600",
                            color: isPageActive ? "#2563eb" : "#64748b",
                          }}
                        >
                          Page {page}
                        </span>
                      </div>
                    );
                  })}

                  {/* + Add Page Button */}
                  <div
                    onClick={() => alert("New page added to document")}
                    style={{
                      width: "68px",
                      height: "90px",
                      borderRadius: "6px",
                      border: "1.5px dashed #cbd5e1",
                      backgroundColor: "#f8fafc",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                      cursor: "pointer",
                      color: "#64748b",
                      transition: "border-color 0.15s ease",
                    }}
                  >
                    <Plus style={{ width: "18px", height: "18px" }} />
                    <span style={{ fontSize: "10.5px", fontWeight: "700" }}>
                      Add Page
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Other Sub-Tabs: Details, Activity, Versions */}
            {previewSubTab === "Details" && (
              <div
                style={{
                  padding: "18px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  fontSize: "12.5px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748b" }}>Document Title:</span>
                  <strong>Website Development Quotation</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748b" }}>Created By:</span>
                  <strong>Rahul Sharma (Super Admin)</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748b" }}>Recipient Email:</span>
                  <strong>info@globalsystems.com</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748b" }}>Security:</span>
                  <strong>SMS OTP Required</strong>
                </div>
              </div>
            )}

            {previewSubTab === "Activity" && (
              <div
                style={{
                  padding: "18px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  fontSize: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#2563eb" }} />
                  <span>Document dispatched via email &bull; 28 Oct 2026, 10:30 AM</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10b981" }} />
                  <span>Document generated with SHA-256 seal &bull; 28 Oct 2026, 10:28 AM</span>
                </div>
              </div>
            )}

            {previewSubTab === "Versions" && (
              <div
                style={{
                  padding: "18px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  fontSize: "12px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong>Version 1.0 (Current Sent Version)</strong>
                  <span style={{ color: "#64748b" }}>28 Oct 2026</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= MODAL: CREATE DOCUMENT ================= */}
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
              zIndex: 50,
              padding: "16px",
            }}
          >
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "18px",
                width: "100%",
                maxWidth: "480px",
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
                  marginBottom: "18px",
                }}
              >
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "800",
                    color: "#0f172a",
                    margin: 0,
                  }}
                >
                  Create New Document
                </h3>
                <button
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
                onSubmit={(e) => {
                  e.preventDefault();
                  alert(`Created new document: ${newDocNumber}`);
                  setIsCreateOpen(false);
                }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#334155",
                      marginBottom: "6px",
                    }}
                  >
                    Document Identifier
                  </label>
                  <input
                    type="text"
                    required
                    value={newDocNumber}
                    onChange={(e) => setNewDocNumber(e.target.value)}
                    style={{
                      width: "100%",
                      height: "40px",
                      padding: "0 12px",
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
                      fontWeight: "700",
                      color: "#334155",
                      marginBottom: "6px",
                    }}
                  >
                    Document Type
                  </label>
                  <select
                    value={newDocType}
                    onChange={(e) => setNewDocType(e.target.value as any)}
                    style={{
                      width: "100%",
                      height: "40px",
                      padding: "0 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      fontSize: "13px",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="Quotation">Quotation</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Invoice">Invoice</option>
                    <option value="Agreement">Agreement</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#334155",
                      marginBottom: "6px",
                    }}
                  >
                    Organization
                  </label>
                  <select
                    value={newOrg}
                    onChange={(e) => setNewOrg(e.target.value)}
                    style={{
                      width: "100%",
                      height: "40px",
                      padding: "0 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      fontSize: "13px",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="Acme Technologies">Acme Technologies</option>
                    <option value="NextGen Digital">NextGen Digital</option>
                    <option value="Global Systems">Global Systems</option>
                    <option value="Tech Solutions">Tech Solutions</option>
                    <option value="Innovate India">Innovate India</option>
                  </select>
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
                      height: "40px",
                      border: "1px solid #cbd5e1",
                      backgroundColor: "#ffffff",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "700",
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
                      height: "40px",
                      border: "none",
                      backgroundColor: "#2563eb",
                      color: "#ffffff",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "700",
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
      </div>
    </AdminLayout>
  );
}
