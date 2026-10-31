"use client";
import React, { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  Search,
  Plus,
  MoreVertical,
  MoreHorizontal,
  Edit3,
  Copy,
  Calendar,
  ChevronDown,
  Check,
  FileText,
  SlidersHorizontal,
  Layers,
  Palette,
  Code2,
  Settings2,
  X,
  ExternalLink,
  Download,
} from "lucide-react";

interface TemplateItem {
  id: string;
  title: string;
  category: "Quotation" | "Proposal" | "Invoice" | "Agreement" | "Others";
  status: "Active" | "Draft" | "Archived";
  accentColor: string;
  createdOn: string;
  modifiedOn: string;
  docNumber: string;
  recipient: string;
  totalAmount: string;
}

const INITIAL_TEMPLATES: TemplateItem[] = [
  {
    id: "tpl-1",
    title: "Modern Quotation Template",
    category: "Quotation",
    status: "Active",
    accentColor: "#2563eb",
    createdOn: "12 Oct 2026",
    modifiedOn: "28 Oct 2026",
    docNumber: "#QTN-2026-001",
    recipient: "Global Systems Ltd",
    totalAmount: "₹94,400",
  },
  {
    id: "tpl-2",
    title: "Professional Proposal",
    category: "Proposal",
    status: "Active",
    accentColor: "#8b5cf6",
    createdOn: "10 Oct 2026",
    modifiedOn: "26 Oct 2026",
    docNumber: "#PRP-2026-014",
    recipient: "Tech Solutions Pvt Ltd",
    totalAmount: "₹1,85,000",
  },
  {
    id: "tpl-3",
    title: "Minimal Invoice",
    category: "Invoice",
    status: "Active",
    accentColor: "#f59e0b",
    createdOn: "08 Oct 2026",
    modifiedOn: "24 Oct 2026",
    docNumber: "#INV-2026-089",
    recipient: "Blue Horizon Corp",
    totalAmount: "₹42,500",
  },
  {
    id: "tpl-4",
    title: "Service Agreement",
    category: "Agreement",
    status: "Draft",
    accentColor: "#64748b",
    createdOn: "05 Oct 2026",
    modifiedOn: "22 Oct 2026",
    docNumber: "#MOU-2026-003",
    recipient: "Apex Logistics Ltd",
    totalAmount: "₹3,20,000",
  },
  {
    id: "tpl-5",
    title: "Corporate Quotation",
    category: "Quotation",
    status: "Active",
    accentColor: "#0f172a",
    createdOn: "01 Oct 2026",
    modifiedOn: "20 Oct 2026",
    docNumber: "#QTN-2026-052",
    recipient: "Vanguard Dynamics",
    totalAmount: "₹2,45,000",
  },
  {
    id: "tpl-6",
    title: "Classic Proposal",
    category: "Proposal",
    status: "Active",
    accentColor: "#10b981",
    createdOn: "28 Sep 2026",
    modifiedOn: "18 Oct 2026",
    docNumber: "#PRP-2026-009",
    recipient: "Zenith Enterprises",
    totalAmount: "₹1,15,000",
  },
  {
    id: "tpl-7",
    title: "Basic Invoice",
    category: "Invoice",
    status: "Active",
    accentColor: "#06b6d4",
    createdOn: "25 Sep 2026",
    modifiedOn: "15 Oct 2026",
    docNumber: "#INV-2026-041",
    recipient: "Nova Retail Network",
    totalAmount: "₹18,200",
  },
  {
    id: "tpl-8",
    title: "Elegant Quotation",
    category: "Quotation",
    status: "Archived",
    accentColor: "#ec4899",
    createdOn: "20 Sep 2026",
    modifiedOn: "12 Oct 2026",
    docNumber: "#QTN-2026-019",
    recipient: "Silverline Ventures",
    totalAmount: "₹88,000",
  },
  {
    id: "tpl-9",
    title: "Partnership MOU Framework",
    category: "Agreement",
    status: "Active",
    accentColor: "#3b82f6",
    createdOn: "18 Sep 2026",
    modifiedOn: "10 Oct 2026",
    docNumber: "#MOU-2026-008",
    recipient: "Nexus Global Group",
    totalAmount: "₹5,00,000",
  },
  {
    id: "tpl-10",
    title: "Executive Sales Proposal",
    category: "Proposal",
    status: "Active",
    accentColor: "#6366f1",
    createdOn: "15 Sep 2026",
    modifiedOn: "08 Oct 2026",
    docNumber: "#PRP-2026-022",
    recipient: "Summit Tech Works",
    totalAmount: "₹4,60,000",
  },
  {
    id: "tpl-11",
    title: "Tax Compliant Invoice",
    category: "Invoice",
    status: "Active",
    accentColor: "#14b8a6",
    createdOn: "12 Sep 2026",
    modifiedOn: "05 Oct 2026",
    docNumber: "#INV-2026-095",
    recipient: "InfraCorp Asia",
    totalAmount: "₹65,800",
  },
  {
    id: "tpl-12",
    title: "NDA Non-Disclosure Agreement",
    category: "Agreement",
    status: "Active",
    accentColor: "#475569",
    createdOn: "10 Sep 2026",
    modifiedOn: "01 Oct 2026",
    docNumber: "#NDA-2026-012",
    recipient: "Quant Dynamics",
    totalAmount: "₹0",
  },
];

export default function TemplatesPage() {
  const [topTab, setTopTab] = useState("All Templates");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [createdBy, setCreatedBy] = useState("All Users");
  const [sortOption, setSortOption] = useState("Last Modified");

  const [dateRange, setDateRange] = useState("01 Oct 2026 - 31 Oct 2026");
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("tpl-1");
  const [previewSubTab, setPreviewSubTab] = useState("Preview");
  const [activePageNumber, setActivePageNumber] = useState(1);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<
    "Quotation" | "Proposal" | "Invoice" | "Agreement" | "Others"
  >("Quotation");

  const topTabs = [
    "All Templates",
    "Quotation Templates",
    "Proposal Templates",
    "Invoice Templates",
    "Others",
  ];

  // Filtering templates
  const filteredTemplates = INITIAL_TEMPLATES.filter((tpl) => {
    // Top tab filter
    if (topTab === "Quotation Templates" && tpl.category !== "Quotation")
      return false;
    if (topTab === "Proposal Templates" && tpl.category !== "Proposal")
      return false;
    if (topTab === "Invoice Templates" && tpl.category !== "Invoice")
      return false;
    if (
      topTab === "Others" &&
      (tpl.category === "Quotation" ||
        tpl.category === "Proposal" ||
        tpl.category === "Invoice")
    )
      return false;

    // Search query
    if (
      searchQuery &&
      !tpl.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Category filter
    if (
      selectedCategories.length > 0 &&
      !selectedCategories.includes(tpl.category)
    ) {
      return false;
    }

    // Status filter
    if (
      selectedStatuses.length > 0 &&
      !selectedStatuses.includes(tpl.status)
    ) {
      return false;
    }

    return true;
  });

  const selectedTemplate =
    INITIAL_TEMPLATES.find((t) => t.id === selectedTemplateId) ||
    INITIAL_TEMPLATES[0];

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const toggleStatus = (st: string) => {
    if (selectedStatuses.includes(st)) {
      setSelectedStatuses(selectedStatuses.filter((s) => s !== st));
    } else {
      setSelectedStatuses([...selectedStatuses, st]);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedStatuses([]);
    setCreatedBy("All Users");
  };

  return (
    <AdminLayout activePath="/admin/templates">
      <div
        style={{
          width: "100%",
          maxWidth: "1600px",
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
              Templates
            </h1>
            <p
              style={{
                fontSize: "13px",
                color: "#64748b",
                margin: "4px 0 0 0",
              }}
            >
              Create and manage document templates for quotations, proposals and
              other documents
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
              <span>Create Template</span>
            </button>

            <button
              style={{
                width: "40px",
                height: "40px",
                backgroundColor: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#64748b",
              }}
            >
              <MoreVertical style={{ width: "18px", height: "18px" }} />
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
            gridTemplateColumns: "250px 320px 1fr",
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
              gap: "20px",
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
                onClick={handleClearFilters}
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
                  placeholder="Search templates..."
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

            {/* Category Checkboxes */}
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
                Category
              </label>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  fontSize: "12.5px",
                }}
              >
                {[
                  "Quotation",
                  "Proposal",
                  "Invoice",
                  "Agreement",
                  "Others",
                ].map((cat) => {
                  const isChecked = selectedCategories.includes(cat);
                  return (
                    <label
                      key={cat}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                        color: isChecked ? "#0f172a" : "#475569",
                        fontWeight: isChecked ? "700" : "500",
                      }}
                      onClick={() => toggleCategory(cat)}
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
                      <span>{cat}</span>
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
                  gap: "8px",
                  fontSize: "12.5px",
                }}
              >
                {["Active", "Draft", "Archived"].map((st) => {
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

            {/* Date Range (Snippets 1 & 2) */}
            <div style={{ position: "relative" }}>
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
                onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  height: "38px",
                  padding: "0 10px",
                  backgroundColor: "#ffffff",
                  border: `1px solid ${
                    isDateDropdownOpen ? "#2563eb" : "#cbd5e1"
                  }`,
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: dateRange === "Select date range" ? "500" : "700",
                  color: dateRange === "Select date range" ? "#94a3b8" : "#0f172a",
                  cursor: "pointer",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                  userSelect: "none",
                }}
              >
                <Calendar
                  style={{
                    width: "14px",
                    height: "14px",
                    color: dateRange === "Select date range" ? "#94a3b8" : "#2563eb",
                  }}
                />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {dateRange}
                </span>
              </div>

              {/* Date Presets Dropdown */}
              {isDateDropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: "62px",
                    backgroundColor: "#ffffff",
                    borderRadius: "10px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                    border: "1px solid #e2e8f0",
                    zIndex: 50,
                    padding: "6px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                  }}
                >
                  {[
                    "01 Oct 2026 - 31 Oct 2026",
                    "Today (28 Oct 2026)",
                    "Last 7 Days (21 Oct - 28 Oct)",
                    "Last Month (Sep 2026)",
                    "Select date range",
                  ].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setDateRange(option);
                        setIsDateDropdownOpen(false);
                      }}
                      style={{
                        padding: "8px 10px",
                        fontSize: "12px",
                        fontWeight: dateRange === option ? "700" : "500",
                        color: dateRange === option ? "#2563eb" : "#334155",
                        backgroundColor:
                          dateRange === option ? "#eff6ff" : "transparent",
                        border: "none",
                        borderRadius: "6px",
                        textAlign: "left",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>{option}</span>
                      {dateRange === option && (
                        <Check style={{ width: "13px", height: "13px" }} />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ================= COLUMN 2: TEMPLATES LIST ================= */}
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
            {/* Header: Count and Sort Dropdown */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: "10px",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "800",
                  color: "#0f172a",
                }}
              >
                Templates ({filteredTemplates.length})
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
                  <option value="Name A-Z">Name A-Z</option>
                  <option value="Most Used">Most Used</option>
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

            {/* List of Templates */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                maxHeight: "780px",
                overflowY: "auto",
                paddingRight: "4px",
              }}
            >
              {filteredTemplates.map((t) => {
                const isSelected = t.id === selectedTemplateId;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTemplateId(t.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px",
                      borderRadius: "12px",
                      backgroundColor: isSelected ? "#eff6ff" : "#ffffff",
                      border: `1.5px solid ${
                        isSelected ? "#bfdbfe" : "#f1f5f9"
                      }`,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      boxSizing: "border-box",
                    }}
                  >
                    {/* Thumbnail Icon */}
                    <div
                      style={{
                        width: "42px",
                        height: "54px",
                        backgroundColor: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                        padding: "4px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: "6px",
                          backgroundColor: t.accentColor,
                          borderRadius: "2px",
                        }}
                      />
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "2px",
                        }}
                      >
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
                            width: "60%",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          height: "2px",
                          backgroundColor: t.accentColor,
                          width: "40%",
                        }}
                      />
                    </div>

                    {/* Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span
                        style={{
                          fontSize: "12.5px",
                          fontWeight: "800",
                          color: isSelected ? "#1d4ed8" : "#0f172a",
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {t.title}
                      </span>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginTop: "4px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "11px",
                            color: "#64748b",
                            fontWeight: "500",
                          }}
                        >
                          {t.category}
                        </span>

                        <span
                          style={{
                            display: "inline-block",
                            padding: "1px 7px",
                            borderRadius: "9999px",
                            fontSize: "10px",
                            fontWeight: "700",
                            backgroundColor:
                              t.status === "Active"
                                ? "#dcfce7"
                                : t.status === "Draft"
                                ? "#f1f5f9"
                                : "#fee2e2",
                            color:
                              t.status === "Active"
                                ? "#15803d"
                                : t.status === "Draft"
                                ? "#475569"
                                : "#dc2626",
                          }}
                        >
                          {t.status}
                        </span>
                      </div>
                    </div>

                    {/* Actions ⋮ */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#94a3b8",
                        cursor: "pointer",
                        padding: "4px",
                      }}
                    >
                      <MoreVertical style={{ width: "15px", height: "15px" }} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ================= COLUMN 3: TEMPLATE PREVIEW & DETAILS ================= */}
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
            {/* Top Details & Action Buttons Header */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "14px",
                borderBottom: "1px solid #f1f5f9",
                paddingBottom: "16px",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "20px",
                      fontWeight: "900",
                      color: "#0f172a",
                      margin: 0,
                    }}
                  >
                    {selectedTemplate.title}
                  </h2>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 10px",
                      borderRadius: "9999px",
                      fontSize: "11px",
                      fontWeight: "700",
                      backgroundColor:
                        selectedTemplate.status === "Active"
                          ? "#dcfce7"
                          : "#f1f5f9",
                      color:
                        selectedTemplate.status === "Active"
                          ? "#15803d"
                          : "#475569",
                    }}
                  >
                    {selectedTemplate.status}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: "11.5px",
                    color: "#64748b",
                    margin: "6px 0 0 0",
                  }}
                >
                  Category: <strong>{selectedTemplate.category}</strong> &bull;
                  Created: {selectedTemplate.createdOn} &bull; Last Modified:{" "}
                  {selectedTemplate.modifiedOn}
                </p>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <button
                  onClick={() =>
                    alert(`Editing template: ${selectedTemplate.title}`)
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
                    fontSize: "12.5px",
                    fontWeight: "700",
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(37,99,235,0.2)",
                  }}
                >
                  <Edit3 style={{ width: "14px", height: "14px" }} />
                  <span>Edit Template</span>
                </button>

                <button
                  onClick={() =>
                    alert(`Duplicated: ${selectedTemplate.title} (Copy)`)
                  }
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 14px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "12.5px",
                    fontWeight: "700",
                    color: "#334155",
                    cursor: "pointer",
                  }}
                >
                  <Copy style={{ width: "14px", height: "14px" }} />
                  <span>Duplicate</span>
                </button>

                <button
                  style={{
                    width: "34px",
                    height: "34px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "#64748b",
                  }}
                >
                  <MoreHorizontal style={{ width: "16px", height: "16px" }} />
                </button>
              </div>
            </div>

            {/* Sub-tabs: Preview, Content, Branding, Variables, Settings */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "24px",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              {[
                "Preview",
                "Content",
                "Branding",
                "Variables",
                "Settings",
              ].map((subTab) => {
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

            {/* Preview Subtab Content: Document Sheet + Right Thumbnails */}
            {previewSubTab === "Preview" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 100px",
                  gap: "20px",
                  alignItems: "start",
                }}
              >
                {/* Main A4 Document Sheet */}
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: "10px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
                    position: "relative",
                    overflow: "hidden",
                    padding: "40px",
                    minHeight: "720px",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  {/* Geometric Blue Polygonal Cut in Top-Left */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "120px",
                      height: "120px",
                      pointerEvents: "none",
                      clipPath: "polygon(0 0, 100% 0, 0 100%)",
                      backgroundColor: selectedTemplate.accentColor,
                    }}
                  />

                  {/* Geometric Blue Polygonal Cut in Bottom-Right */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: "140px",
                      height: "140px",
                      pointerEvents: "none",
                      clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
                      background: `linear-gradient(135deg, ${selectedTemplate.accentColor} 0%, #60a5fa 100%)`,
                    }}
                  />

                  {/* Document Content */}
                  <div style={{ position: "relative", zIndex: 1 }}>
                    {/* Header Row: Logo & Org Details on Left, Quotation Meta on Right */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        marginBottom: "32px",
                      }}
                    >
                      {/* Logo and Org */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          marginLeft: "30px",
                        }}
                      >
                        <svg
                          viewBox="0 0 40 32"
                          style={{ width: "42px", height: "34px" }}
                        >
                          <path
                            d="M20 2 L4 30 L16 30 Z"
                            fill={selectedTemplate.accentColor}
                          />
                          <path d="M20 2 L36 30 L24 30 Z" fill="#38bdf8" />
                          <path d="M16 20 L24 20 L20 12 Z" fill="#ffffff" />
                        </svg>
                        <div>
                          <h3
                            style={{
                              fontSize: "20px",
                              fontWeight: "900",
                              color: "#0f172a",
                              letterSpacing: "1px",
                              margin: 0,
                            }}
                          >
                            VorldX
                          </h3>
                        </div>
                      </div>

                      {/* Document Type & Number */}
                      <div style={{ textAlign: "right" }}>
                        <h3
                          style={{
                            fontSize: "20px",
                            fontWeight: "900",
                            color: "#0f172a",
                            margin: 0,
                          }}
                        >
                          {selectedTemplate.category}
                        </h3>
                        <span
                          style={{
                            fontSize: "12.5px",
                            fontWeight: "800",
                            color: "#0f172a",
                            display: "block",
                            marginTop: "2px",
                            fontFamily: "monospace",
                          }}
                        >
                          {selectedTemplate.docNumber}
                        </span>
                        <span
                          style={{
                            fontSize: "11px",
                            color: "#64748b",
                            display: "block",
                            marginTop: "2px",
                          }}
                        >
                          Date: 28 Oct 2026
                        </span>
                        <span
                          style={{
                            fontSize: "11px",
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
                        gap: "24px",
                        fontSize: "11px",
                        color: "#475569",
                        lineHeight: "1.5",
                        marginBottom: "28px",
                      }}
                    >
                      <div>
                        <strong
                          style={{
                            color: "#0f172a",
                            display: "block",
                            marginBottom: "2px",
                            fontSize: "11.5px",
                          }}
                        >
                          From:
                        </strong>
                        <strong
                          style={{ color: "#0f172a", display: "block" }}
                        >
                          VorldXnologies Pvt Ltd
                        </strong>
                        <span>A-123, Sector 62, Noida, UP 201301</span>
                        <br />
                        <span>+91 98765 43210</span>
                        <br />
                        <span>contact@vorldx.com</span>
                        <br />
                        <span>www.vorldx.com</span>
                      </div>

                      <div>
                        <strong
                          style={{
                            color: "#0f172a",
                            display: "block",
                            marginBottom: "2px",
                            fontSize: "11.5px",
                          }}
                        >
                          To:
                        </strong>
                        <strong
                          style={{ color: "#0f172a", display: "block" }}
                        >
                          {selectedTemplate.recipient}
                        </strong>
                        <span>B-45, IT Park, Bangalore, KA 560100</span>
                        <br />
                        <span>+91 98765 67890</span>
                        <br />
                        <span>info@globalsystems.com</span>
                      </div>
                    </div>

                    {/* Line Items Table */}
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "11.5px",
                        textAlign: "left",
                        marginBottom: "24px",
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
                          <th style={{ padding: "8px 10px", width: "30px" }}>
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
                          <td style={{ padding: "10px" }}>1</td>
                          <td style={{ padding: "10px", fontWeight: "700" }}>
                            Website Development
                          </td>
                          <td style={{ padding: "10px", textAlign: "center" }}>
                            1
                          </td>
                          <td style={{ padding: "10px", textAlign: "right" }}>
                            ₹50,000
                          </td>
                          <td
                            style={{
                              padding: "10px",
                              textAlign: "right",
                              fontWeight: "700",
                            }}
                          >
                            ₹50,000
                          </td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "10px" }}>2</td>
                          <td style={{ padding: "10px", fontWeight: "700" }}>
                            UI/UX Design
                          </td>
                          <td style={{ padding: "10px", textAlign: "center" }}>
                            1
                          </td>
                          <td style={{ padding: "10px", textAlign: "right" }}>
                            ₹20,000
                          </td>
                          <td
                            style={{
                              padding: "10px",
                              textAlign: "right",
                              fontWeight: "700",
                            }}
                          >
                            ₹20,000
                          </td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td style={{ padding: "10px" }}>3</td>
                          <td style={{ padding: "10px", fontWeight: "700" }}>
                            Maintenance (1 Year)
                          </td>
                          <td style={{ padding: "10px", textAlign: "center" }}>
                            1
                          </td>
                          <td style={{ padding: "10px", textAlign: "right" }}>
                            ₹10,000
                          </td>
                          <td
                            style={{
                              padding: "10px",
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
                              padding: "6px 10px",
                              textAlign: "right",
                              color: "#64748b",
                            }}
                          >
                            Subtotal
                          </td>
                          <td
                            style={{
                              padding: "6px 10px",
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
                              padding: "6px 10px",
                              textAlign: "right",
                              color: "#64748b",
                            }}
                          >
                            GST (18%)
                          </td>
                          <td
                            style={{
                              padding: "6px 10px",
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
                              padding: "8px 10px",
                              textAlign: "right",
                              fontWeight: "900",
                              color: "#1e3a8a",
                            }}
                          >
                            Total
                          </td>
                          <td
                            style={{
                              padding: "8px 10px",
                              textAlign: "right",
                              fontWeight: "900",
                              color: "#1e3a8a",
                              fontSize: "13px",
                            }}
                          >
                            {selectedTemplate.totalAmount}
                          </td>
                        </tr>
                      </tfoot>
                    </table>

                    {/* Terms & Conditions */}
                    <div
                      style={{
                        fontSize: "10.5px",
                        color: "#475569",
                        lineHeight: "1.6",
                      }}
                    >
                      <strong
                        style={{
                          color: "#0f172a",
                          display: "block",
                          marginBottom: "4px",
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
                        fontSize: "11px",
                        fontStyle: "italic",
                        color: "#64748b",
                        marginTop: "16px",
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
                      marginTop: "20px",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "10px", color: "#94a3b8" }}>
                        Powered by VorldX White-Label Engine
                      </span>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span
                        style={{
                          fontFamily: "cursive",
                          fontSize: "20px",
                          color: "#1e3a8a",
                          display: "block",
                          marginBottom: "2px",
                        }}
                      >
                        Rahul Sharma
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "800",
                          color: "#0f172a",
                          display: "block",
                        }}
                      >
                        Rahul Sharma
                      </span>
                      <span style={{ fontSize: "10px", color: "#64748b" }}>
                        Authorized Signatory
                      </span>
                      <br />
                      <span style={{ fontSize: "10px", color: "#64748b" }}>
                        VorldXnologies Pvt Ltd
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Thumbnails Column (Page 1, Page 2, Page 3) */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                  }}
                >
                  {[1, 2, 3].map((page) => {
                    const isPageActive = activePageNumber === page;
                    return (
                      <div
                        key={page}
                        onClick={() => setActivePageNumber(page)}
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
                            width: "72px",
                            height: "96px",
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
                          {/* Corner triangle on thumbnail */}
                          <div
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "18px",
                              height: "18px",
                              clipPath: "polygon(0 0, 100% 0, 0 100%)",
                              backgroundColor: selectedTemplate.accentColor,
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              bottom: 0,
                              right: 0,
                              width: "20px",
                              height: "20px",
                              clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
                              backgroundColor: selectedTemplate.accentColor,
                            }}
                          />

                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "3px",
                              marginTop: "8px",
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
                </div>
              </div>
            )}

            {/* Other Subtabs (Content, Branding, Variables, Settings) */}
            {previewSubTab === "Content" && (
              <div
                style={{
                  padding: "20px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <h4
                  style={{
                    fontSize: "14px",
                    fontWeight: "800",
                    color: "#0f172a",
                    margin: 0,
                  }}
                >
                  Section Structure &amp; Clauses
                </h4>
                <p style={{ fontSize: "12.5px", color: "#64748b", margin: 0 }}>
                  Customize header blocks, itemized tables, payment terms, and
                  annexures included in this template.
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {[
                    "Header & Logo Layout",
                    "Client Information (From / To)",
                    "Itemized Financial Table",
                    "Terms & Conditions",
                    "Digital Signature & Seal Block",
                  ].map((sec, i) => (
                    <div
                      key={sec}
                      style={{
                        padding: "10px 14px",
                        backgroundColor: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        fontSize: "12.5px",
                        fontWeight: "700",
                        color: "#334155",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>
                        {i + 1}. {sec}
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#16a34a",
                          fontWeight: "700",
                        }}
                      >
                        Included
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {previewSubTab === "Branding" && (
              <div
                style={{
                  padding: "20px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <h4
                  style={{
                    fontSize: "14px",
                    fontWeight: "800",
                    color: "#0f172a",
                    margin: 0,
                  }}
                >
                  Brand Geometry &amp; Palette
                </h4>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    Primary Accent:
                  </span>
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "6px",
                      backgroundColor: selectedTemplate.accentColor,
                    }}
                  />
                  <span style={{ fontSize: "12.5px", fontWeight: "700" }}>
                    {selectedTemplate.accentColor}
                  </span>
                </div>
              </div>
            )}

            {previewSubTab === "Variables" && (
              <div
                style={{
                  padding: "20px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <h4
                  style={{
                    fontSize: "14px",
                    fontWeight: "800",
                    color: "#0f172a",
                    margin: 0,
                  }}
                >
                  Dynamic Field Variables
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                    fontSize: "12px",
                    fontFamily: "monospace",
                  }}
                >
                  {[
                    "{{document_number}}",
                    "{{issue_date}}",
                    "{{recipient_name}}",
                    "{{total_amount}}",
                    "{{tax_gst_amount}}",
                    "{{validity_period}}",
                  ].map((v) => (
                    <div
                      key={v}
                      style={{
                        padding: "8px",
                        backgroundColor: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        color: "#2563eb",
                      }}
                    >
                      {v}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {previewSubTab === "Settings" && (
              <div
                style={{
                  padding: "20px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  fontSize: "12.5px",
                }}
              >
                <h4
                  style={{
                    fontSize: "14px",
                    fontWeight: "800",
                    color: "#0f172a",
                    margin: 0,
                  }}
                >
                  Template Rules &amp; Defaults
                </h4>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Default Expiry:</span>
                  <strong>30 Days</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Currency Format:</span>
                  <strong>INR (₹) - Indian Lakhs</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Audit Trail Included:</span>
                  <strong>Yes (SHA-256 Stamp)</strong>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= MODAL: CREATE TEMPLATE ================= */}
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
                  Create New Template
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
                  alert(`Created new template: ${newTitle}`);
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
                    Template Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Modern Software Proposal"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
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
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
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
                    Create Template
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
