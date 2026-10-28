"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import OrgLayout from "@/components/OrgLayout";
import {
  FileText,
  Clock,
  CheckCircle2,
  PenTool,
  Plus,
  Search,
  Calendar,
  MoreVertical,
  Maximize2,
  Download,
  Edit,
  Share2,
  Trash2,
  Send,
  Eye,
  ChevronDown,
  X,
  Copy,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface DocumentRow {
  id: string;
  docNumber: string;
  title: string;
  type: "Quotation" | "MOU" | "Contract" | "Proposal";
  recipient: string;
  recipientAddress: string;
  status: "Sent" | "Signed" | "Pending" | "Draft" | "Expired";
  lastUpdated: string;
  validTill: string;
  iconColor: string;
  items: {
    description: string;
    qty: number;
    rate: string;
    amount: string;
  }[];
  subtotal: string;
  gst: string;
  total: string;
  paymentTerms: string;
  notes: string;
}

const INITIAL_DOCUMENTS: DocumentRow[] = [
  {
    id: "q-001",
    docNumber: "Q-001",
    title: "Website Development",
    type: "Quotation",
    recipient: "Tech Solutions Pvt Ltd",
    recipientAddress: "A-45, Block B, Sector 62, Noida, U.P. 201301",
    status: "Sent",
    lastUpdated: "28 Oct 2026",
    validTill: "15-11-2026",
    iconColor: "#2563eb",
    items: [
      { description: "Website Development", qty: 1, rate: "25,000", amount: "25,000" },
      { description: "Hosting Setup", qty: 1, rate: "5,000", amount: "5,000" },
    ],
    subtotal: "30,000",
    gst: "5,400",
    total: "₹35,400",
    paymentTerms: "50% advance, 50% on delivery",
    notes: "Thank you for your business.",
  },
  {
    id: "mou-001",
    docNumber: "MOU-001",
    title: "Partnership Agreement",
    type: "MOU",
    recipient: "Global Systems",
    recipientAddress: "Tower C, Cyber City, Gurugram, Haryana 122002",
    status: "Signed",
    lastUpdated: "26 Oct 2026",
    validTill: "26-10-2027",
    iconColor: "#0d9488",
    items: [
      { description: "Strategic Partnership Framework", qty: 1, rate: "Included", amount: "Included" },
      { description: "Joint GTM Technology Integration", qty: 1, rate: "Included", amount: "Included" },
    ],
    subtotal: "Mutual",
    gst: "N/A",
    total: "Mutual Agreement",
    paymentTerms: "Annual performance review",
    notes: "Executed in duplicate originals.",
  },
  {
    id: "q-002",
    docNumber: "Q-002",
    title: "IT Support Services",
    type: "Quotation",
    recipient: "NextGen Digital",
    recipientAddress: "Brigade Road, Bengaluru, Karnataka 560025",
    status: "Pending",
    lastUpdated: "25 Oct 2026",
    validTill: "20-11-2026",
    iconColor: "#f59e0b",
    items: [
      { description: "Monthly 24/7 Remote IT Support", qty: 3, rate: "25,000", amount: "75,000" },
      { description: "On-site Server Maintenance", qty: 1, rate: "11,000", amount: "11,000" },
    ],
    subtotal: "86,000",
    gst: "15,480",
    total: "₹1,01,480",
    paymentTerms: "Monthly billing in advance",
    notes: "Response SLA guaranteed within 1 hour.",
  },
  {
    id: "mou-002",
    docNumber: "MOU-002",
    title: "Strategic Collaboration",
    type: "MOU",
    recipient: "Innovate India",
    recipientAddress: "Hitec City, Madhapur, Hyderabad 500081",
    status: "Draft",
    lastUpdated: "24 Oct 2026",
    validTill: "31-12-2026",
    iconColor: "#0d9488",
    items: [
      { description: "Collaborative R&D Engagement", qty: 1, rate: "Sponsored", amount: "Sponsored" },
      { description: "Incubation & Mentorship", qty: 1, rate: "Mutual", amount: "Mutual" },
    ],
    subtotal: "Grant",
    gst: "0",
    total: "Collaborative Grant",
    paymentTerms: "Disbursed per project phase",
    notes: "Subject to steering board review.",
  },
  {
    id: "con-001",
    docNumber: "CON-001",
    title: "Service Agreement",
    type: "Contract",
    recipient: "BrightTech Ltd",
    recipientAddress: "BKC, Bandra East, Mumbai 400051",
    status: "Signed",
    lastUpdated: "22 Oct 2026",
    validTill: "22-10-2027",
    iconColor: "#9333ea",
    items: [
      { description: "Enterprise SaaS License", qty: 1, rate: "1,50,000", amount: "1,50,000" },
      { description: "Dedicated Technical Manager", qty: 1, rate: "50,000", amount: "50,000" },
    ],
    subtotal: "2,00,000",
    gst: "36,000",
    total: "₹2,36,000",
    paymentTerms: "Quarterly payments net 15 days",
    notes: "Annual auto-renewing contract.",
  },
  {
    id: "q-003",
    docNumber: "Q-003",
    title: "UI/UX Design",
    type: "Quotation",
    recipient: "EduVision",
    recipientAddress: "Salt Lake Sector V, Kolkata 700091",
    status: "Sent",
    lastUpdated: "20 Oct 2026",
    validTill: "15-11-2026",
    iconColor: "#2563eb",
    items: [
      { description: "Design System & Figma Prototypes", qty: 1, rate: "60,000", amount: "60,000" },
      { description: "User Research & Usability Testing", qty: 1, rate: "35,000", amount: "35,000" },
    ],
    subtotal: "95,000",
    gst: "17,100",
    total: "₹1,12,100",
    paymentTerms: "Milestone-based delivery",
    notes: "Includes up to 3 revision cycles.",
  },
  {
    id: "pro-001",
    docNumber: "PRO-001",
    title: "Project Proposal",
    type: "Proposal",
    recipient: "AI Research Hub",
    recipientAddress: "IIT Delhi Technopark, New Delhi 110016",
    status: "Draft",
    lastUpdated: "18 Oct 2026",
    validTill: "30-11-2026",
    iconColor: "#db2777",
    items: [
      { description: "Deep Learning Pipeline Architecture", qty: 1, rate: "1,20,000", amount: "1,20,000" },
      { description: "Cloud GPU Cluster Provisioning", qty: 1, rate: "60,000", amount: "60,000" },
    ],
    subtotal: "1,80,000",
    gst: "32,400",
    total: "₹2,12,400",
    paymentTerms: "30% upfront, 70% upon completion",
    notes: "Confidential research proposal.",
  },
  {
    id: "nda-001",
    docNumber: "NDA-001",
    title: "Confidentiality Agreement",
    type: "Contract",
    recipient: "Future Labs",
    recipientAddress: "Viman Nagar, Pune, Maharashtra 411014",
    status: "Expired",
    lastUpdated: "15 Oct 2026",
    validTill: "15-10-2026",
    iconColor: "#ea580c",
    items: [
      { description: "Proprietary Trade Secret Protection", qty: 1, rate: "Standard", amount: "Standard" },
      { description: "Mutual Non-Disclosure Terms", qty: 1, rate: "Binding", amount: "Binding" },
    ],
    subtotal: "Legal",
    gst: "0",
    total: "Legal Binding",
    paymentTerms: "N/A",
    notes: "Term expired. Please request a renewed agreement.",
  },
  {
    id: "q-004",
    docNumber: "Q-004",
    title: "Maintenance Support",
    type: "Quotation",
    recipient: "Global Systems",
    recipientAddress: "Tower C, Cyber City, Gurugram, Haryana 122002",
    status: "Signed",
    lastUpdated: "12 Oct 2026",
    validTill: "31-10-2026",
    iconColor: "#2563eb",
    items: [
      { description: "Quarterly Comprehensive Hardware AMC", qty: 1, rate: "40,000", amount: "40,000" },
      { description: "Critical Software Patch Updates", qty: 1, rate: "15,000", amount: "15,000" },
    ],
    subtotal: "55,000",
    gst: "9,900",
    total: "₹64,900",
    paymentTerms: "Net 30 days upon sign-off",
    notes: "Standard warranty terms included.",
  },
  {
    id: "mou-003",
    docNumber: "MOU-003",
    title: "Research Collaboration",
    type: "MOU",
    recipient: "Tech Innovators",
    recipientAddress: "Electronic City Phase 1, Bengaluru 560100",
    status: "Pending",
    lastUpdated: "10 Oct 2026",
    validTill: "10-11-2026",
    iconColor: "#0d9488",
    items: [
      { description: "Joint Academic Whitepaper Publication", qty: 1, rate: "Joint", amount: "Joint" },
      { description: "Open Source Tooling Development", qty: 1, rate: "Joint", amount: "Joint" },
    ],
    subtotal: "Non-monetary",
    gst: "0",
    total: "Mutual Commitment",
    paymentTerms: "Bi-annual review milestone",
    notes: "Signatures pending from external counsel.",
  },
];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentRow[]>(INITIAL_DOCUMENTS);
  const [selectedDocId, setSelectedDocId] = useState<string>("q-001");
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const selectedDoc =
    documents.find((d) => d.id === selectedDocId) || documents[0];

  const filteredDocs = documents.filter((doc) => {
    const matchesTab =
      activeTab === "All"
        ? true
        : activeTab === "Quotations"
        ? doc.type === "Quotation"
        : activeTab === "MOUs"
        ? doc.type === "MOU"
        : activeTab === "Contracts"
        ? doc.type === "Contract"
        : activeTab === "Proposals"
        ? doc.type === "Proposal"
        : true;

    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.docNumber.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const handleSelectAll = () => {
    if (checkedIds.length === filteredDocs.length) {
      setCheckedIds([]);
    } else {
      setCheckedIds(filteredDocs.map((d) => d.id));
    }
  };

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDownloadPDF = (doc: DocumentRow) => {
    showToast(`Downloading PDF for ${doc.docNumber}...`);
    if (typeof window !== "undefined") {
      const w = window.open(`/preview/${doc.id}?autoPrint=true`, "_blank");
      if (w) w.focus();
    }
  };

  const handleDelete = (doc: DocumentRow) => {
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    if (selectedDocId === doc.id && documents.length > 1) {
      setSelectedDocId(documents[0].id);
    }
    setActiveMenuId(null);
    showToast(`Deleted ${doc.docNumber}`);
  };

  const getStatusBadgeStyle = (status: DocumentRow["status"]) => {
    switch (status) {
      case "Sent":
        return { backgroundColor: "#eff6ff", color: "#2563eb" };
      case "Signed":
        return { backgroundColor: "#dcfce7", color: "#16a34a" };
      case "Pending":
        return { backgroundColor: "#fef3c7", color: "#d97706" };
      case "Draft":
        return { backgroundColor: "#f1f5f9", color: "#475569" };
      case "Expired":
        return { backgroundColor: "#fee2e2", color: "#dc2626" };
    }
  };

  const getTypeBadgeStyle = (type: DocumentRow["type"]) => {
    switch (type) {
      case "Quotation":
        return { backgroundColor: "#eff6ff", color: "#2563eb" };
      case "MOU":
        return { backgroundColor: "#dcfce7", color: "#16a34a" };
      case "Contract":
        return { backgroundColor: "#f3e8ff", color: "#9333ea" };
      case "Proposal":
        return { backgroundColor: "#fce7f3", color: "#db2777" };
    }
  };

  return (
    <OrgLayout activePath="/my-documents">
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
              Documents
            </h1>
            <p
              style={{
                fontSize: "13.5px",
                fontWeight: 400,
                color: "#64748b",
                margin: "4px 0 0 0",
              }}
            >
              Manage all your documents in one place. Create, view, share and track document status.
            </p>
          </div>

          {/* Create Document Button with Dropdown */}
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setIsCreateDropdownOpen(!isCreateDropdownOpen)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
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
              <span>Create Document</span>
              <ChevronDown style={{ width: "15px", height: "15px" }} />
            </button>

            {isCreateDropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "46px",
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                  border: "1px solid #e2e8f0",
                  width: "180px",
                  zIndex: 50,
                  padding: "6px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                <Link
                  href="/quotations/new"
                  onClick={() => setIsCreateDropdownOpen(false)}
                  style={{
                    padding: "9px 12px",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#0f172a",
                    textDecoration: "none",
                    borderRadius: "8px",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f1f5f9")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  New Quotation
                </Link>
                <Link
                  href="/mou/new"
                  onClick={() => setIsCreateDropdownOpen(false)}
                  style={{
                    padding: "9px 12px",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#0f172a",
                    textDecoration: "none",
                    borderRadius: "8px",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f1f5f9")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  New MOU
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ================= 2. FOUR STAT CARDS IN A ROW ================= */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "18px",
          }}
        >
          {/* Card 1: Total Documents (24) */}
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
                24
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
                Total Documents
              </span>
            </div>
          </div>

          {/* Card 2: Pending for Signature (12) */}
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
              <PenTool style={{ width: "22px", height: "22px" }} />
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
                  fontSize: "12.5px",
                  fontWeight: 500,
                  color: "#64748b",
                  marginTop: "5px",
                  display: "block",
                }}
              >
                Pending for Signature
              </span>
            </div>
          </div>

          {/* Card 3: Signed (10) */}
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
                10
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
                Signed
              </span>
            </div>
          </div>

          {/* Card 4: Expired (2) */}
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
                2
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
          {/* Filter Pills */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            {["All", "Quotations", "MOUs", "Contracts", "Proposals", "Others"].map(
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
                placeholder="Search documents..."
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

        {/* ================= 4. SPLIT AREA: TABLE + PREVIEW ================= */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.65fr 1fr",
            gap: "20px",
            alignItems: "start",
          }}
        >
          {/* LEFT: Documents Table with Pagination */}
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
                    <th style={{ padding: "12px 12px 12px 16px", width: "32px" }}>
                      <input
                        type="checkbox"
                        checked={
                          checkedIds.length === filteredDocs.length &&
                          filteredDocs.length > 0
                        }
                        onChange={handleSelectAll}
                        style={{ cursor: "pointer", accentColor: "#2563eb" }}
                      />
                    </th>
                    <th
                      style={{
                        padding: "12px 10px",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#64748b",
                        width: "80px",
                      }}
                    >
                      #
                    </th>
                    <th
                      style={{
                        padding: "12px 12px",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#64748b",
                      }}
                    >
                      Document Title
                    </th>
                    <th
                      style={{
                        padding: "12px 10px",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#64748b",
                      }}
                    >
                      Type
                    </th>
                    <th
                      style={{
                        padding: "12px 12px",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#64748b",
                      }}
                    >
                      Recipient
                    </th>
                    <th
                      style={{
                        padding: "12px 10px",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#64748b",
                      }}
                    >
                      Status
                    </th>
                    <th
                      style={{
                        padding: "12px 12px",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#64748b",
                      }}
                    >
                      Last Updated
                    </th>
                    <th
                      style={{
                        padding: "12px 16px",
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
                  {filteredDocs.map((doc, idx) => {
                    const isSelected = selectedDocId === doc.id;
                    const isChecked = checkedIds.includes(doc.id);
                    const isMenuOpen = activeMenuId === doc.id;
                    const statusBadge = getStatusBadgeStyle(doc.status);
                    const typeBadge = getTypeBadgeStyle(doc.type);
                    const isBottom = idx >= filteredDocs.length - 3;

                    return (
                      <tr
                        key={doc.id}
                        onClick={() => setSelectedDocId(doc.id)}
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
                          style={{ padding: "13px 12px 13px 16px" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleCheck(doc.id)}
                            style={{ cursor: "pointer", accentColor: "#2563eb" }}
                          />
                        </td>

                        {/* Doc Number + Icon */}
                        <td style={{ padding: "13px 10px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <FileText
                              style={{
                                width: "15px",
                                height: "15px",
                                color: doc.iconColor,
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                fontSize: "12px",
                                fontWeight: 600,
                                color: "#0f172a",
                              }}
                            >
                              {doc.docNumber}
                            </span>
                          </div>
                        </td>

                        {/* Title */}
                        <td
                          style={{
                            padding: "13px 12px",
                            fontSize: "12.5px",
                            fontWeight: 600,
                            color: "#0f172a",
                          }}
                        >
                          {doc.title}
                        </td>

                        {/* Type Badge */}
                        <td style={{ padding: "13px 10px" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "2px 8px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 600,
                              ...typeBadge,
                            }}
                          >
                            {doc.type}
                          </span>
                        </td>

                        {/* Recipient */}
                        <td
                          style={{
                            padding: "13px 12px",
                            fontSize: "12.5px",
                            color: "#334155",
                          }}
                        >
                          {doc.recipient}
                        </td>

                        {/* Status Badge */}
                        <td style={{ padding: "13px 10px" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "2px 10px",
                              borderRadius: "9999px",
                              fontSize: "11px",
                              fontWeight: 600,
                              ...statusBadge,
                            }}
                          >
                            {doc.status}
                          </span>
                        </td>

                        {/* Last Updated */}
                        <td
                          style={{
                            padding: "13px 12px",
                            fontSize: "12px",
                            color: "#64748b",
                          }}
                        >
                          {doc.lastUpdated}
                        </td>

                        {/* Actions */}
                        <td
                          style={{
                            padding: "13px 16px",
                            textAlign: "right",
                            position: "relative",
                          }}
                          data-doc-menu="true"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(isMenuOpen ? null : doc.id);
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

                          {isMenuOpen && (
                            <div
                              data-doc-menu="true"
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                position: "absolute",
                                right: "16px",
                                top: isBottom ? "auto" : "38px",
                                bottom: isBottom ? "38px" : "auto",
                                backgroundColor: "#ffffff",
                                borderRadius: "12px",
                                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.18)",
                                border: "1px solid #e2e8f0",
                                width: "175px",
                                zIndex: 9999,
                                padding: "6px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "2px",
                                textAlign: "left",
                              }}
                            >
                              <Link
                                href={`/preview/${doc.id}`}
                                onClick={() => setActiveMenuId(null)}
                                style={{
                                  padding: "7px 10px",
                                  fontSize: "12px",
                                  fontWeight: 500,
                                  color: "#0f172a",
                                  textDecoration: "none",
                                  borderRadius: "6px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                <Eye style={{ width: "13px", height: "13px", color: "#475569" }} />
                                <span>View Document</span>
                              </Link>

                              <button
                                type="button"
                                onClick={() => {
                                  handleDownloadPDF(doc);
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
                                <Download style={{ width: "13px", height: "13px", color: "#475569" }} />
                                <span>Download PDF</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(doc)}
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

            {/* Pagination Footer */}
            <div
              style={{
                padding: "14px 20px",
                borderTop: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
                fontSize: "12px",
                color: "#64748b",
              }}
            >
              <span>Showing 1 to 10 of 24 documents</span>

              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <button
                    type="button"
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "6px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#ffffff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#64748b",
                    }}
                  >
                    <ChevronsLeft style={{ width: "13px", height: "13px" }} />
                  </button>
                  <button
                    type="button"
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "6px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#ffffff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#64748b",
                    }}
                  >
                    <ChevronLeft style={{ width: "13px", height: "13px" }} />
                  </button>
                  <button
                    type="button"
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "6px",
                      border: "none",
                      backgroundColor: "#2563eb",
                      color: "#ffffff",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    1
                  </button>
                  <button
                    type="button"
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "6px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#ffffff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#64748b",
                    }}
                  >
                    2
                  </button>
                  <button
                    type="button"
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "6px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#ffffff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#64748b",
                    }}
                  >
                    3
                  </button>
                  <button
                    type="button"
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "6px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#ffffff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#64748b",
                    }}
                  >
                    <ChevronRight style={{ width: "13px", height: "13px" }} />
                  </button>
                  <button
                    type="button"
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "6px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#ffffff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#64748b",
                    }}
                  >
                    <ChevronsRight style={{ width: "13px", height: "13px" }} />
                  </button>
                </div>

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 10px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "12px",
                    color: "#475569",
                  }}
                >
                  <span>10 / page</span>
                  <ChevronDown style={{ width: "12px", height: "12px" }} />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Document Preview Panel */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "18px",
              border: "1px solid #eef2f6",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              boxSizing: "border-box",
            }}
          >
            {/* Header: Title + Expand Button */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
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
                Document Preview
              </h2>
              <button
                type="button"
                onClick={() => setIsFullscreenPreview(true)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748b",
                  padding: "4px",
                  borderRadius: "4px",
                }}
              >
                <Maximize2 style={{ width: "15px", height: "15px" }} />
              </button>
            </div>

            {/* Miniature Document Sheet */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
                padding: "18px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                boxSizing: "border-box",
              }}
            >
              {/* Header: ACME Logo + Company Info */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  paddingBottom: "10px",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2L2 22H22L12 2Z"
                      fill="#2563eb"
                      stroke="#1d4ed8"
                      strokeWidth="1.5"
                    />
                    <path d="M12 7L6 19H18L12 7Z" fill="#ffffff" />
                  </svg>
                  <span
                    style={{
                      fontSize: "15px",
                      fontWeight: 900,
                      color: "#0f172a",
                      letterSpacing: "0.5px",
                    }}
                  >
                    ACME
                  </span>
                </div>

                <div
                  style={{
                    textAlign: "right",
                    fontSize: "9px",
                    color: "#64748b",
                    lineHeight: 1.35,
                  }}
                >
                  <div style={{ fontWeight: 700, color: "#1e293b" }}>
                    Acme Technologies Pvt Ltd
                  </div>
                  <div>A-45, Sector 62, Noida, U.P. 201301</div>
                  <div>www.acme.com | info@acme.com</div>
                </div>
              </div>

              {/* Centered Document Title */}
              <div style={{ textAlign: "center" }}>
                <h3
                  style={{
                    fontSize: "13px",
                    fontWeight: 900,
                    color: "#0f172a",
                    letterSpacing: "1px",
                    margin: 0,
                  }}
                >
                  {selectedDoc.type === "Quotation"
                    ? "QUOTATION"
                    : selectedDoc.type === "MOU"
                    ? "MEMORANDUM OF UNDERSTANDING"
                    : "SERVICE AGREEMENT"}
                </h3>
              </div>

              {/* Meta: Quotation No & Bill To */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "9.5px",
                  color: "#64748b",
                  lineHeight: 1.35,
                }}
              >
                <div>
                  <div>
                    <span style={{ fontWeight: 700, color: "#1e293b" }}>Quotation No:</span>{" "}
                    {selectedDoc.docNumber}
                  </div>
                  <div>
                    <span style={{ fontWeight: 700, color: "#1e293b" }}>Date:</span>{" "}
                    {selectedDoc.lastUpdated}
                  </div>
                  <div>
                    <span style={{ fontWeight: 700, color: "#1e293b" }}>Valid Till:</span>{" "}
                    {selectedDoc.validTill}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700, color: "#1e293b" }}>Bill To:</div>
                  <div style={{ fontWeight: 600, color: "#0f172a" }}>
                    {selectedDoc.recipient}
                  </div>
                  <div style={{ maxWidth: "150px" }}>{selectedDoc.recipientAddress}</div>
                </div>
              </div>

              {/* Mini Items Table */}
              <div style={{ width: "100%", overflow: "hidden" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "9px",
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: "1px solid #cbd5e1" }}>
                      <th style={{ padding: "4px 2px", color: "#64748b", fontWeight: 700, width: "14px" }}>
                        #
                      </th>
                      <th style={{ padding: "4px 6px", color: "#64748b", fontWeight: 700, textAlign: "left" }}>
                        Description
                      </th>
                      <th style={{ padding: "4px 6px", color: "#64748b", fontWeight: 700, textAlign: "center" }}>
                        Qty
                      </th>
                      <th style={{ padding: "4px 6px", color: "#64748b", fontWeight: 700, textAlign: "right" }}>
                        Rate (₹)
                      </th>
                      <th style={{ padding: "4px 2px", color: "#64748b", fontWeight: 700, textAlign: "right" }}>
                        Amount (₹)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDoc.items.map((it, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "4px 2px", color: "#64748b" }}>{idx + 1}</td>
                        <td style={{ padding: "4px 6px", color: "#0f172a", fontWeight: 600 }}>
                          {it.description}
                        </td>
                        <td style={{ padding: "4px 6px", color: "#334155", textAlign: "center" }}>
                          {it.qty}
                        </td>
                        <td style={{ padding: "4px 6px", color: "#334155", textAlign: "right" }}>
                          {it.rate}
                        </td>
                        <td style={{ padding: "4px 2px", color: "#0f172a", fontWeight: 700, textAlign: "right" }}>
                          {it.amount}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={4} style={{ padding: "3px 6px", textAlign: "right", color: "#64748b", fontWeight: 600 }}>
                        Subtotal
                      </td>
                      <td style={{ padding: "3px 2px", textAlign: "right", fontWeight: 700, color: "#1e293b" }}>
                        {selectedDoc.subtotal}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={4} style={{ padding: "3px 6px", textAlign: "right", color: "#64748b", fontWeight: 600 }}>
                        GST (18%)
                      </td>
                      <td style={{ padding: "3px 2px", textAlign: "right", fontWeight: 700, color: "#1e293b" }}>
                        {selectedDoc.gst}
                      </td>
                    </tr>
                    {/* Blue Highlighted Total Bar matching screenshot */}
                    <tr style={{ backgroundColor: "#eff6ff" }}>
                      <td colSpan={4} style={{ padding: "5px 6px", textAlign: "right", fontWeight: 800, color: "#1e293b" }}>
                        Total
                      </td>
                      <td style={{ padding: "5px 4px", textAlign: "right", fontWeight: 900, color: "#2563eb" }}>
                        {selectedDoc.total}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Notes & Terms */}
              <div
                style={{
                  paddingTop: "6px",
                  borderTop: "1px solid #f1f5f9",
                  fontSize: "8.5px",
                  color: "#64748b",
                  lineHeight: 1.35,
                }}
              >
                <div>
                  <strong style={{ color: "#334155" }}>Payment Terms:</strong>{" "}
                  {selectedDoc.paymentTerms}
                </div>
                <div>
                  <strong style={{ color: "#334155" }}>Notes:</strong>{" "}
                  {selectedDoc.notes}
                </div>
              </div>
            </div>

            {/* Action Buttons below preview sheet */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button
                type="button"
                onClick={() => handleDownloadPDF(selectedDoc)}
                style={{
                  width: "100%",
                  height: "38px",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(37,99,235,0.25)",
                }}
              >
                <Download style={{ width: "15px", height: "15px" }} />
                <span>Download PDF</span>
              </button>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "8px",
                }}
              >
                <Link
                  href={`/preview/${selectedDoc.id}`}
                  style={{
                    height: "36px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: "#334155",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    textDecoration: "none",
                    cursor: "pointer",
                  }}
                >
                  <Edit style={{ width: "13px", height: "13px" }} />
                  <span>Edit</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(true)}
                  style={{
                    height: "36px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: "#334155",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    cursor: "pointer",
                  }}
                >
                  <Share2 style={{ width: "13px", height: "13px" }} />
                  <span>Share</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setActiveMenuId(activeMenuId === "panel" ? null : "panel")
                  }
                  style={{
                    height: "36px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: "#334155",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  <MoreVertical style={{ width: "13px", height: "13px" }} />
                  <span>More</span>
                  <ChevronDown style={{ width: "11px", height: "11px" }} />

                  {activeMenuId === "panel" && (
                    <div
                      style={{
                        position: "absolute",
                        right: 0,
                        bottom: "40px",
                        backgroundColor: "#ffffff",
                        borderRadius: "10px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                        border: "1px solid #e2e8f0",
                        width: "150px",
                        zIndex: 60,
                        padding: "4px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                        textAlign: "left",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          showToast(`Duplicated ${selectedDoc.docNumber}`);
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
                        <Copy style={{ width: "13px", height: "13px" }} />
                        <span>Duplicate</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(selectedDoc)}
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
                        <Trash2 style={{ width: "13px", height: "13px" }} />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= SHARE MODAL ================= */}
      {isShareModalOpen && (
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
              maxWidth: "440px",
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
              <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0, color: "#0f172a" }}>
                Share {selectedDoc.docNumber}
              </h3>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
              >
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>
                Public Document Link
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  readOnly
                  value={`https://app.worldx.com/preview/${selectedDoc.id}`}
                  style={{
                    flex: 1,
                    height: "38px",
                    padding: "0 10px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "12px",
                    backgroundColor: "#f8fafc",
                    color: "#475569",
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(
                      `https://app.worldx.com/preview/${selectedDoc.id}`
                    );
                    showToast("Link copied to clipboard!");
                    setIsShareModalOpen(false);
                  }}
                  style={{
                    padding: "0 14px",
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= FULLSCREEN PREVIEW MODAL ================= */}
      {isFullscreenPreview && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(6px)",
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
              maxWidth: "680px",
              boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
              padding: "28px",
              boxSizing: "border-box",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <h3 style={{ fontSize: "18px", fontWeight: 800, margin: 0, color: "#0f172a" }}>
                {selectedDoc.title} ({selectedDoc.docNumber})
              </h3>
              <button
                type="button"
                onClick={() => setIsFullscreenPreview(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
              >
                <X style={{ width: "22px", height: "22px" }} />
              </button>
            </div>

            <div
              style={{
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "20px", fontWeight: 800, color: "#2563eb" }}>
                    {selectedDoc.docNumber}
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#0f172a" }}>
                    {selectedDoc.title}
                  </div>
                </div>
                <span
                  style={{
                    padding: "4px 12px",
                    borderRadius: "9999px",
                    fontSize: "12px",
                    fontWeight: 700,
                    ...getStatusBadgeStyle(selectedDoc.status),
                    height: "fit-content",
                  }}
                >
                  {selectedDoc.status}
                </span>
              </div>

              <div>
                <strong>Client:</strong> {selectedDoc.recipient} ({selectedDoc.recipientAddress})
              </div>

              <div>
                <strong>Total Amount:</strong> {selectedDoc.total}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setIsFullscreenPreview(false)}
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
              <button
                type="button"
                onClick={() => handleDownloadPDF(selectedDoc)}
                style={{
                  padding: "8px 18px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#2563eb",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#ffffff",
                  cursor: "pointer",
                }}
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </OrgLayout>
  );
}
