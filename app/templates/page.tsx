"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import OrgLayout from "@/components/OrgLayout";
import {
  FileText,
  Folder,
  LayoutGrid,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Check,
  Eye,
  Edit,
  Copy,
  Trash2,
  X,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

interface TemplateItem {
  id: string;
  name: string;
  category: "Quotation" | "MOU" | "Proposal" | "Report" | "Other";
  lastUpdated: string;
  updatedBy: string;
  iconColor: string;
  docTitle: string;
  docNumber: string;
  validTill: string;
  recipientName: string;
  recipientAddress: string;
  items: {
    description: string;
    qty: number;
    rate: string;
    amount: string;
  }[];
  totalAmount: string;
  terms: string[];
}

const INITIAL_TEMPLATES: TemplateItem[] = [
  {
    id: "tpl-1",
    name: "Standard Quotation",
    category: "Quotation",
    lastUpdated: "28 Oct 2026",
    updatedBy: "Priya Singh",
    iconColor: "#2563eb",
    docTitle: "QUOTATION",
    docNumber: "Q-001",
    validTill: "15 Nov 2026",
    recipientName: "Tech Solutions Pvt Ltd",
    recipientAddress: "Lucknow, India",
    items: [
      { description: "Website Development", qty: 1, rate: "₹50,000", amount: "₹50,000" },
      { description: "Support & Maintenance", qty: 1, rate: "₹20,000", amount: "₹20,000" },
    ],
    totalAmount: "₹70,000",
    terms: [
      "Payment within 30 days.",
      "This is a system generated quotation.",
    ],
  },
  {
    id: "tpl-2",
    name: "IT Services Quotation",
    category: "Quotation",
    lastUpdated: "26 Oct 2026",
    updatedBy: "Rahul Verma",
    iconColor: "#2563eb",
    docTitle: "QUOTATION",
    docNumber: "Q-002",
    validTill: "20 Nov 2026",
    recipientName: "NextGen Digital",
    recipientAddress: "Bengaluru, India",
    items: [
      { description: "Cloud Infrastructure Setup", qty: 1, rate: "₹85,000", amount: "₹85,000" },
      { description: "DevOps & CI/CD Pipeline", qty: 1, rate: "₹45,000", amount: "₹45,000" },
    ],
    totalAmount: "₹1,30,000",
    terms: [
      "50% advance before project commencement.",
      "Scope changes subject to additional cost.",
    ],
  },
  {
    id: "tpl-3",
    name: "Partnership MOU",
    category: "MOU",
    lastUpdated: "24 Oct 2026",
    updatedBy: "Priya Singh",
    iconColor: "#f59e0b",
    docTitle: "MEMORANDUM OF UNDERSTANDING",
    docNumber: "MOU-001",
    validTill: "31 Dec 2027",
    recipientName: "Global Systems Inc.",
    recipientAddress: "New Delhi, India",
    items: [
      { description: "Strategic Joint Collaboration", qty: 1, rate: "Included", amount: "Included" },
      { description: "Technology Sharing & IP Rights", qty: 1, rate: "Mutual", amount: "Mutual" },
    ],
    totalAmount: "Mutual Agreement",
    terms: [
      "Binding for a duration of two years from execution date.",
      "Non-disclosure and confidential terms apply.",
    ],
  },
  {
    id: "tpl-4",
    name: "Research Collaboration MOU",
    category: "MOU",
    lastUpdated: "20 Oct 2026",
    updatedBy: "Ankit Sharma",
    iconColor: "#f59e0b",
    docTitle: "COLLABORATION AGREEMENT",
    docNumber: "MOU-002",
    validTill: "30 Oct 2027",
    recipientName: "Innovate India Labs",
    recipientAddress: "Hyderabad, India",
    items: [
      { description: "Academic & Industrial Research", qty: 1, rate: "Sponsored", amount: "Sponsored" },
      { description: "Patent & Publication Sharing", qty: 1, rate: "50/50", amount: "50/50" },
    ],
    totalAmount: "Research Grant",
    terms: [
      "Quarterly milestone reviews by steering committee.",
      "Applicable under jurisdiction of Indian Law.",
    ],
  },
  {
    id: "tpl-5",
    name: "Project Proposal",
    category: "Proposal",
    lastUpdated: "18 Oct 2026",
    updatedBy: "Neha Gupta",
    iconColor: "#9333ea",
    docTitle: "PROJECT PROPOSAL",
    docNumber: "PROP-001",
    validTill: "15 Dec 2026",
    recipientName: "Alpha Retailers Pvt Ltd",
    recipientAddress: "Mumbai, India",
    items: [
      { description: "E-Commerce App Redesign", qty: 1, rate: "₹1,20,000", amount: "₹1,20,000" },
      { description: "Payment Gateway Integration", qty: 1, rate: "₹30,000", amount: "₹30,000" },
    ],
    totalAmount: "₹1,50,000",
    terms: [
      "Deliverables completed within 6 weeks.",
      "3 months post-launch bug fixing warranty.",
    ],
  },
  {
    id: "tpl-6",
    name: "NDA Template",
    category: "Other",
    lastUpdated: "15 Oct 2026",
    updatedBy: "Priya Singh",
    iconColor: "#ef4444",
    docTitle: "NON-DISCLOSURE AGREEMENT",
    docNumber: "NDA-001",
    validTill: "Indefinite",
    recipientName: "Confidential Counterparty",
    recipientAddress: "Pune, India",
    items: [
      { description: "Proprietary IP Protection", qty: 1, rate: "Standard", amount: "Standard" },
      { description: "Confidentiality Obligation", qty: 1, rate: "Binding", amount: "Binding" },
    ],
    totalAmount: "Legal Instrument",
    terms: [
      "Term extends 3 years post termination.",
      "Strict financial damages for unauthorized disclosures.",
    ],
  },
  {
    id: "tpl-7",
    name: "Service Agreement",
    category: "Other",
    lastUpdated: "10 Oct 2026",
    updatedBy: "Rahul Verma",
    iconColor: "#2563eb",
    docTitle: "MASTER SERVICE AGREEMENT",
    docNumber: "MSA-001",
    validTill: "10 Oct 2027",
    recipientName: "Apex Logistics",
    recipientAddress: "Gurugram, India",
    items: [
      { description: "Monthly Dedicated SLA Support", qty: 12, rate: "₹15,000", amount: "₹1,80,000" },
      { description: "24/7 Server Uptime Guarantee", qty: 1, rate: "₹25,000", amount: "₹25,000" },
    ],
    totalAmount: "₹2,05,000",
    terms: [
      "99.9% uptime SLA guarantee.",
      "Monthly invoices payable net 15 days.",
    ],
  },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateItem[]>(INITIAL_TEMPLATES);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("tpl-1");
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Modals & toast
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-tpl-menu]")) {
        setActiveMenuId(null);
      }
    };
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  // New Template Form State
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<TemplateItem["category"]>("Quotation");
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newTotal, setNewTotal] = useState("₹50,000");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter templates
  const filteredTemplates = templates.filter((tpl) => {
    const matchesCategory =
      selectedCategory === "All"
        ? true
        : selectedCategory === "Quotation"
        ? tpl.category === "Quotation"
        : selectedCategory === "MOU"
        ? tpl.category === "MOU"
        : selectedCategory === "Proposals"
        ? tpl.category === "Proposal"
        : selectedCategory === "Reports"
        ? tpl.category === "Report"
        : selectedCategory === "Others"
        ? tpl.category === "Other"
        : true;

    const matchesSearch =
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.updatedBy.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const selectedTemplate =
    templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const handleSelectAll = () => {
    if (checkedIds.length === filteredTemplates.length) {
      setCheckedIds([]);
    } else {
      setCheckedIds(filteredTemplates.map((t) => t.id));
    }
  };

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDuplicate = (tpl: TemplateItem) => {
    const duplicated: TemplateItem = {
      ...tpl,
      id: `tpl-${Date.now()}`,
      name: `${tpl.name} (Copy)`,
      lastUpdated: "Just now",
      updatedBy: "Priya Singh",
    };
    setTemplates([duplicated, ...templates]);
    setSelectedTemplateId(duplicated.id);
    setActiveMenuId(null);
    showToast(`Duplicated "${tpl.name}" successfully!`);
  };

  const handleDelete = (id: string) => {
    const tpl = templates.find((t) => t.id === id);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    if (selectedTemplateId === id && templates.length > 1) {
      setSelectedTemplateId(templates[0].id);
    }
    setActiveMenuId(null);
    showToast(`Deleted "${tpl?.name || "Template"}"`);
  };

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    const created: TemplateItem = {
      id: `tpl-${Date.now()}`,
      name: newName,
      category: newCategory,
      lastUpdated: "Just now",
      updatedBy: "Priya Singh",
      iconColor:
        newCategory === "Quotation"
          ? "#2563eb"
          : newCategory === "MOU"
          ? "#f59e0b"
          : newCategory === "Proposal"
          ? "#9333ea"
          : "#ef4444",
      docTitle: newDocTitle || (newCategory === "MOU" ? "MEMORANDUM OF UNDERSTANDING" : "QUOTATION"),
      docNumber: newCategory === "MOU" ? "MOU-009" : "Q-009",
      validTill: "30 Days from issue",
      recipientName: "Client Organization",
      recipientAddress: "Corporate Office",
      items: [
        { description: "Primary Deliverable", qty: 1, rate: newTotal, amount: newTotal },
      ],
      totalAmount: newTotal,
      terms: ["Standard corporate terms and conditions apply."],
    };

    setTemplates([created, ...templates]);
    setSelectedTemplateId(created.id);
    setIsCreateOpen(false);
    setNewName("");
    setNewDocTitle("");
    showToast(`Created template "${created.name}" successfully!`);
  };

  const getCategoryBadgeStyle = (category: TemplateItem["category"]) => {
    switch (category) {
      case "Quotation":
        return {
          backgroundColor: "#eff6ff",
          color: "#2563eb",
        };
      case "MOU":
        return {
          backgroundColor: "#dcfce7",
          color: "#16a34a",
        };
      case "Proposal":
        return {
          backgroundColor: "#f3e8ff",
          color: "#9333ea",
        };
      case "Report":
        return {
          backgroundColor: "#e0e7ff",
          color: "#4f46e5",
        };
      case "Other":
        return {
          backgroundColor: "#fee2e2",
          color: "#ef4444",
        };
    }
  };

  return (
    <OrgLayout activePath="/templates">
      {/* Toast */}
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
        {/* ================= 1. HEADER ================= */}
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
              Templates
            </h1>
            <p
              style={{
                fontSize: "13.5px",
                fontWeight: 400,
                color: "#64748b",
                margin: "4px 0 0 0",
              }}
            >
              Create, manage and reuse document templates for quotations, MOUs and other documents.
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
            <span>Create Template</span>
          </button>
        </div>

        {/* ================= 2. FOUR METRIC CARDS ================= */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "18px",
          }}
        >
          {/* Card 1: Total Templates (16) */}
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
                16
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
                Total Templates
              </span>
            </div>
          </div>

          {/* Card 2: Quotation Templates (8) */}
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
              <Folder style={{ width: "24px", height: "24px", fill: "#fef3c7" }} />
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
                  fontSize: "12.5px",
                  fontWeight: 500,
                  color: "#64748b",
                  marginTop: "5px",
                  display: "block",
                }}
              >
                Quotation Templates
              </span>
            </div>
          </div>

          {/* Card 3: MOU Templates (5) */}
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
                  fontSize: "12.5px",
                  fontWeight: 500,
                  color: "#64748b",
                  marginTop: "5px",
                  display: "block",
                }}
              >
                MOU Templates
              </span>
            </div>
          </div>

          {/* Card 4: Other Templates (3) */}
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
                backgroundColor: "#f3e8ff",
                color: "#9333ea",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <LayoutGrid style={{ width: "24px", height: "24px" }} />
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
                  fontSize: "12.5px",
                  fontWeight: 500,
                  color: "#64748b",
                  marginTop: "5px",
                  display: "block",
                }}
              >
                Other Templates
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
          {/* Category Tabs */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            {["All", "Quotation", "MOU", "Proposals", "Reports", "Others"].map(
              (category) => {
                const isActive = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    style={{
                      padding: "8px 18px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: isActive ? 700 : 500,
                      backgroundColor: isActive ? "#2563eb" : "#ffffff",
                      color: isActive ? "#ffffff" : "#475569",
                      border: isActive ? "none" : "1px solid #e2e8f0",
                      cursor: "pointer",
                      boxShadow: isActive
                        ? "0 2px 6px rgba(37,99,235,0.25)"
                        : "0 1px 2px rgba(0,0,0,0.02)",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {category}
                  </button>
                );
              }
            )}
          </div>

          {/* Search & All Categories Dropdown */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            {/* Search Input */}
            <div style={{ position: "relative", width: "220px" }}>
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
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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

            {/* All Categories Dropdown */}
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
              <Filter style={{ width: "14px", height: "14px", color: "#64748b" }} />
              <span>All Categories</span>
              <ChevronDown style={{ width: "13px", height: "13px", color: "#64748b" }} />
            </div>
          </div>
        </div>

        {/* ================= 4. SPLIT AREA: TABLE + PREVIEW ================= */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.65fr 1fr",
            gap: "20px",
            alignItems: "start",
          }}
        >
          {/* LEFT: Templates Table */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "18px",
              border: "1px solid #eef2f6",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
              overflow: "hidden",
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
                      backgroundColor: "#f8fafc",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    <th style={{ padding: "12px 14px 12px 18px", width: "36px" }}>
                      <input
                        type="checkbox"
                        checked={
                          checkedIds.length === filteredTemplates.length &&
                          filteredTemplates.length > 0
                        }
                        onChange={handleSelectAll}
                        style={{ cursor: "pointer", accentColor: "#2563eb" }}
                      />
                    </th>
                    <th
                      style={{
                        padding: "12px 14px",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#64748b",
                      }}
                    >
                      Template Name ⇅
                    </th>
                    <th
                      style={{
                        padding: "12px 14px",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#64748b",
                      }}
                    >
                      Category ⇅
                    </th>
                    <th
                      style={{
                        padding: "12px 14px",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#64748b",
                      }}
                    >
                      Last Updated ⇅
                    </th>
                    <th
                      style={{
                        padding: "12px 14px",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#64748b",
                      }}
                    >
                      Updated By ⇅
                    </th>
                    <th
                      style={{
                        padding: "12px 18px",
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
                  {filteredTemplates.map((tpl, idx) => {
                    const isSelected = selectedTemplateId === tpl.id;
                    const isChecked = checkedIds.includes(tpl.id);
                    const isMenuOpen = activeMenuId === tpl.id;
                    const badgeStyle = getCategoryBadgeStyle(tpl.category);
                    const isBottom = idx >= filteredTemplates.length - 2;

                    return (
                      <tr
                        key={tpl.id}
                        onClick={() => setSelectedTemplateId(tpl.id)}
                        style={{
                          borderBottom: "1px solid #f8fafc",
                          backgroundColor: isSelected ? "#f8fafc" : "transparent",
                          cursor: "pointer",
                          transition: "background-color 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = "#fafafa";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        {/* Checkbox */}
                        <td
                          style={{ padding: "14px 14px 14px 18px" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleCheck(tpl.id)}
                            style={{ cursor: "pointer", accentColor: "#2563eb" }}
                          />
                        </td>

                        {/* Name + Icon */}
                        <td style={{ padding: "14px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div
                              style={{
                                width: "24px",
                                height: "24px",
                                borderRadius: "6px",
                                backgroundColor:
                                  tpl.iconColor === "#2563eb"
                                    ? "#eff6ff"
                                    : tpl.iconColor === "#f59e0b"
                                    ? "#fef3c7"
                                    : tpl.iconColor === "#9333ea"
                                    ? "#f3e8ff"
                                    : "#fee2e2",
                                color: tpl.iconColor,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <FileText style={{ width: "14px", height: "14px" }} />
                            </div>
                            <span
                              style={{
                                fontSize: "13px",
                                fontWeight: 600,
                                color: "#0f172a",
                              }}
                            >
                              {tpl.name}
                            </span>
                          </div>
                        </td>

                        {/* Category */}
                        <td style={{ padding: "14px 14px" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "3px 12px",
                              borderRadius: "6px",
                              fontSize: "11.5px",
                              fontWeight: 600,
                              ...badgeStyle,
                            }}
                          >
                            {tpl.category}
                          </span>
                        </td>

                        {/* Last Updated */}
                        <td
                          style={{
                            padding: "14px 14px",
                            fontSize: "12.5px",
                            color: "#475569",
                          }}
                        >
                          {tpl.lastUpdated}
                        </td>

                        {/* Updated By */}
                        <td
                          style={{
                            padding: "14px 14px",
                            fontSize: "12.5px",
                            color: "#0f172a",
                            fontWeight: 500,
                          }}
                        >
                          {tpl.updatedBy}
                        </td>

                        {/* Actions */}
                        <td
                          style={{
                            padding: "14px 18px",
                            textAlign: "right",
                            position: "relative",
                          }}
                          data-tpl-menu="true"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(isMenuOpen ? null : tpl.id);
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

                          {/* Popover Menu */}
                          {isMenuOpen && (
                            <div
                              data-tpl-menu="true"
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                position: "absolute",
                                right: "18px",
                                top: isBottom ? "auto" : "38px",
                                bottom: isBottom ? "38px" : "auto",
                                backgroundColor: "#ffffff",
                                borderRadius: "12px",
                                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.18)",
                                border: "1px solid #e2e8f0",
                                width: "160px",
                                zIndex: 9999,
                                padding: "6px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "2px",
                                textAlign: "left",
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedTemplateId(tpl.id);
                                  setIsPreviewModalOpen(true);
                                  setActiveMenuId(null);
                                }}
                                style={{
                                  padding: "7px 10px",
                                  fontSize: "12px",
                                  fontWeight: 500,
                                  color: "#0f172a",
                                  border: "none",
                                  backgroundColor: "transparent",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                <Eye style={{ width: "13px", height: "13px", color: "#475569" }} />
                                <span>Preview</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDuplicate(tpl)}
                                style={{
                                  padding: "7px 10px",
                                  fontSize: "12px",
                                  fontWeight: 500,
                                  color: "#0f172a",
                                  border: "none",
                                  backgroundColor: "transparent",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                <Copy style={{ width: "13px", height: "13px", color: "#475569" }} />
                                <span>Duplicate</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(tpl.id)}
                                style={{
                                  padding: "7px 10px",
                                  fontSize: "12px",
                                  fontWeight: 500,
                                  color: "#ef4444",
                                  border: "none",
                                  backgroundColor: "transparent",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                <Trash2 style={{ width: "13px", height: "13px", color: "#ef4444" }} />
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

          {/* RIGHT: Template Preview Panel */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "18px",
              border: "1px solid #eef2f6",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              boxSizing: "border-box",
            }}
          >
            <h2
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#0f172a",
                margin: 0,
              }}
            >
              Template Preview
            </h2>

            {/* Miniature Document Sheet */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
                padding: "20px 22px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                boxSizing: "border-box",
              }}
            >
              {/* Header: Logo + Company Info */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg viewBox="0 0 32 32" style={{ width: "24px", height: "24px" }} fill="none">
                      <path
                        d="M7 6C9.2 3.8 12.8 5.6 14.8 9.5C16.8 5.6 20.4 3.8 22.6 6C24.8 8.2 23 11.8 19.1 13.8C23 15.8 24.8 19.4 22.6 21.6C20.4 23.8 16.8 22 14.8 18.1C12.8 22 9.2 23.8 7 21.6C4.8 19.4 6.6 15.8 10.5 13.8C6.6 11.8 4.8 8.2 7 6Z"
                        fill="#0284c7"
                      />
                      <path
                        d="M14.8 9.5C16.8 5.6 20.4 3.8 22.6 6C24.8 8.2 23 11.8 19.1 13.8C16.5 15.1 14.2 12 14.8 9.5Z"
                        fill="#2563eb"
                      />
                      <path
                        d="M7 21.6C4.8 19.4 6.6 15.8 10.5 13.8C13.1 12.5 15.4 15.6 14.8 18.1C12.8 22 9.2 23.8 7 21.6Z"
                        fill="#38bdf8"
                      />
                    </svg>
                  </div>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 800,
                      color: "#0f172a",
                      letterSpacing: "-0.2px",
                    }}
                  >
                    WorldX
                  </span>
                </div>

                <div
                  style={{
                    textAlign: "right",
                    fontSize: "9.5px",
                    color: "#64748b",
                    lineHeight: 1.35,
                  }}
                >
                  <div style={{ fontWeight: 600, color: "#334155" }}>WorldX Pvt. Ltd.</div>
                  <div>Lucknow, India</div>
                  <div>info@worldx.com</div>
                  <div>+91 98765 43210</div>
                </div>
              </div>

              {/* Document Title */}
              <div>
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: 800,
                    color: "#0f172a",
                    letterSpacing: "0.5px",
                    margin: "0 0 8px 0",
                  }}
                >
                  {selectedTemplate.docTitle}
                </h3>
                <div
                  style={{
                    fontSize: "10px",
                    color: "#64748b",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600, color: "#334155" }}>Quote No:</span>{" "}
                    {selectedTemplate.docNumber}
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, color: "#334155" }}>Date:</span>{" "}
                    {selectedTemplate.lastUpdated}
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, color: "#334155" }}>Valid Till:</span>{" "}
                    {selectedTemplate.validTill}
                  </div>
                </div>
              </div>

              {/* Bill To */}
              <div style={{ fontSize: "10px", color: "#64748b" }}>
                <span style={{ fontWeight: 700, color: "#334155" }}>Bill To:</span>
                <div style={{ fontWeight: 600, color: "#0f172a" }}>
                  {selectedTemplate.recipientName}
                </div>
                <div>{selectedTemplate.recipientAddress}</div>
              </div>

              {/* Mini Items Table */}
              <div style={{ width: "100%", overflow: "hidden" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "9.5px",
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <th style={{ padding: "4px 2px", color: "#64748b", fontWeight: 600, width: "16px" }}>
                        #
                      </th>
                      <th style={{ padding: "4px 6px", color: "#64748b", fontWeight: 600, textAlign: "left" }}>
                        Description
                      </th>
                      <th style={{ padding: "4px 6px", color: "#64748b", fontWeight: 600, textAlign: "center" }}>
                        Qty
                      </th>
                      <th style={{ padding: "4px 6px", color: "#64748b", fontWeight: 600, textAlign: "right" }}>
                        Rate
                      </th>
                      <th style={{ padding: "4px 2px", color: "#64748b", fontWeight: 600, textAlign: "right" }}>
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTemplate.items.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "5px 2px", color: "#64748b" }}>{idx + 1}</td>
                        <td style={{ padding: "5px 6px", color: "#0f172a", fontWeight: 500 }}>
                          {item.description}
                        </td>
                        <td style={{ padding: "5px 6px", color: "#334155", textAlign: "center" }}>
                          {item.qty}
                        </td>
                        <td style={{ padding: "5px 6px", color: "#334155", textAlign: "right" }}>
                          {item.rate}
                        </td>
                        <td style={{ padding: "5px 2px", color: "#0f172a", fontWeight: 600, textAlign: "right" }}>
                          {item.amount}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={4} style={{ padding: "6px 6px", textAlign: "right", fontWeight: 700, color: "#0f172a" }}>
                        Total
                      </td>
                      <td style={{ padding: "6px 2px", textAlign: "right", fontWeight: 800, color: "#0f172a" }}>
                        {selectedTemplate.totalAmount}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Terms */}
              <div
                style={{
                  paddingTop: "8px",
                  borderTop: "1px solid #f1f5f9",
                  fontSize: "9px",
                  color: "#64748b",
                  lineHeight: 1.35,
                }}
              >
                <div style={{ fontWeight: 700, color: "#334155", marginBottom: "2px" }}>
                  Terms & Conditions:
                </div>
                {selectedTemplate.terms.map((t, idx) => (
                  <div key={idx}>
                    {idx + 1}. {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom 3 Action Buttons */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr 1.1fr",
                gap: "8px",
              }}
            >
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "9px 12px",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(37,99,235,0.25)",
                }}
              >
                <Eye style={{ width: "14px", height: "14px" }} />
                <span>Preview</span>
              </button>

              <Link
                href={
                  selectedTemplate.category === "MOU"
                    ? "/mou/new"
                    : "/quotations/new"
                }
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "9px 12px",
                  backgroundColor: "#ffffff",
                  color: "#334155",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                <Edit style={{ width: "14px", height: "14px" }} />
                <span>Edit</span>
              </Link>

              <button
                type="button"
                onClick={() => handleDuplicate(selectedTemplate)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "9px 12px",
                  backgroundColor: "#ffffff",
                  color: "#334155",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <Copy style={{ width: "14px", height: "14px" }} />
                <span>Duplicate</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= CREATE TEMPLATE MODAL ================= */}
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
                Create New Template
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
              onSubmit={handleCreateTemplate}
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
                  Template Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Standard Quotation"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
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
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) =>
                    setNewCategory(e.target.value as TemplateItem["category"])
                  }
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
                  <option value="Proposal">Proposal</option>
                  <option value="Report">Report</option>
                  <option value="Other">Other</option>
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
                  Document Title Banner
                </label>
                <input
                  type="text"
                  placeholder="e.g. QUOTATION"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
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
                  Sample Total / Value
                </label>
                <input
                  type="text"
                  placeholder="e.g. ₹50,000"
                  value={newTotal}
                  onChange={(e) => setNewTotal(e.target.value)}
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
                  Create Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= FULL PREVIEW MODAL ================= */}
      {isPreviewModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "24px",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "18px",
              width: "100%",
              maxWidth: "540px",
              boxShadow: "0 25px 50px rgba(0,0,0,0.2)",
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
              <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0, color: "#0f172a" }}>
                {selectedTemplate.name}
              </h3>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
              >
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>

            <div
              style={{
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                fontSize: "12px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "16px", fontWeight: 800, color: "#2563eb" }}>
                  {selectedTemplate.docTitle}
                </span>
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 700,
                    ...getCategoryBadgeStyle(selectedTemplate.category),
                  }}
                >
                  {selectedTemplate.category}
                </span>
              </div>

              <div>
                <strong>Document #:</strong> {selectedTemplate.docNumber} | <strong>Valid Till:</strong>{" "}
                {selectedTemplate.validTill}
              </div>

              <div>
                <strong>Recipient:</strong> {selectedTemplate.recipientName} ({selectedTemplate.recipientAddress})
              </div>

              <div style={{ marginTop: "6px" }}>
                <strong>Deliverables / Items:</strong>
                <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                  {selectedTemplate.items.map((it, idx) => (
                    <li key={idx}>
                      {it.description} — {it.rate}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", marginTop: "4px" }}>
                Total: {selectedTemplate.totalAmount}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#475569",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
              <Link
                href={selectedTemplate.category === "MOU" ? "/mou/new" : "/quotations/new"}
                style={{
                  padding: "8px 18px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#2563eb",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#ffffff",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                Use Template
              </Link>
            </div>
          </div>
        </div>
      )}
    </OrgLayout>
  );
}
