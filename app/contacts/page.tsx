"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import OrgLayout from "@/components/OrgLayout";
import {
  Users,
  Building2,
  User,
  Plus,
  Search,
  Filter,
  ChevronDown,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  FileText,
  Edit2,
  X,
  CheckCircle2,
  ArrowUpDown,
  Send,
  Trash2,
  Eye,
} from "lucide-react";

interface ContactRecord {
  id: string;
  initials: string;
  avatarColor: { bg: string; text: string };
  name: string;
  organization: string;
  email: string;
  phone: string;
  type: "Client" | "Partner" | "Internal";
  location: string;
  tags: string;
  notes: string;
  recentActivity: {
    event: string;
    date: string;
    type: "blue" | "gray";
  }[];
}

const INITIAL_CONTACTS: ContactRecord[] = [
  {
    id: "cnt-1",
    initials: "RS",
    avatarColor: { bg: "#2563eb", text: "#ffffff" },
    name: "Rohan Sharma",
    organization: "Tech Solutions Pvt Ltd",
    email: "rohan@techsol.com",
    phone: "+91 98765 43210",
    type: "Client",
    location: "Lucknow, India",
    tags: "IT Services, Software Development",
    notes: "Key client for web development projects.",
    recentActivity: [
      { event: "Quotation sent", date: "28 Oct 2026", type: "blue" },
      { event: "MOU executed", date: "15 Oct 2026", type: "blue" },
      { event: "Contact added", date: "10 Oct 2026", type: "gray" },
    ],
  },
  {
    id: "cnt-2",
    initials: "AP",
    avatarColor: { bg: "#9333ea", text: "#ffffff" },
    name: "Ananya Patel",
    organization: "Global Systems",
    email: "ananya@globalsys.com",
    phone: "+91 87654 32109",
    type: "Partner",
    location: "Bengaluru, India",
    tags: "Cloud Infrastructure, DevOps",
    notes: "Strategic technical partner for enterprise cloud migration.",
    recentActivity: [
      { event: "MOU executed", date: "20 Oct 2026", type: "blue" },
      { event: "Document viewed", date: "18 Oct 2026", type: "blue" },
      { event: "Contact added", date: "05 Oct 2026", type: "gray" },
    ],
  },
  {
    id: "cnt-3",
    initials: "VK",
    avatarColor: { bg: "#f59e0b", text: "#ffffff" },
    name: "Vikram Kumar",
    organization: "NextGen Digital",
    email: "vikram@nextgen.com",
    phone: "+91 76543 21098",
    type: "Client",
    location: "Gurugram, India",
    tags: "Cybersecurity, Networking",
    notes: "Quarterly contract renewals and annual audit client.",
    recentActivity: [
      { event: "Quotation sent", date: "25 Oct 2026", type: "blue" },
      { event: "Proposal review", date: "14 Oct 2026", type: "blue" },
      { event: "Contact added", date: "01 Oct 2026", type: "gray" },
    ],
  },
  {
    id: "cnt-4",
    initials: "PS",
    avatarColor: { bg: "#ec4899", text: "#ffffff" },
    name: "Priya Singh",
    organization: "Innovate India",
    email: "priya@innovate.com",
    phone: "+91 65432 10987",
    type: "Internal",
    location: "New Delhi, India",
    tags: "Operations, Signatory",
    notes: "Internal organization administrator and authorized signer.",
    recentActivity: [
      { event: "Signed MOU", date: "26 Oct 2026", type: "blue" },
      { event: "Approved branding", date: "22 Oct 2026", type: "blue" },
      { event: "Account created", date: "01 Jan 2026", type: "gray" },
    ],
  },
  {
    id: "cnt-5",
    initials: "AR",
    avatarColor: { bg: "#2563eb", text: "#ffffff" },
    name: "Amit Rastogi",
    organization: "BrightTech Ltd",
    email: "amit@brighttech.com",
    phone: "+91 98760 12345",
    type: "Client",
    location: "Mumbai, India",
    tags: "Product Design, UI/UX",
    notes: "Design retainership and mobile app consultancy.",
    recentActivity: [
      { event: "Quotation sent", date: "22 Oct 2026", type: "blue" },
      { event: "Contact added", date: "12 Oct 2026", type: "gray" },
    ],
  },
  {
    id: "cnt-6",
    initials: "NS",
    avatarColor: { bg: "#eab308", text: "#ffffff" },
    name: "Neha Sharma",
    organization: "EduVision",
    email: "neha@eduvision.com",
    phone: "+91 91234 56789",
    type: "Partner",
    location: "Pune, India",
    tags: "EdTech, Content Partner",
    notes: "Educational materials exchange partner.",
    recentActivity: [
      { event: "MOU sent", date: "19 Oct 2026", type: "blue" },
      { event: "Contact added", date: "08 Oct 2026", type: "gray" },
    ],
  },
  {
    id: "cnt-7",
    initials: "MK",
    avatarColor: { bg: "#0284c7", text: "#ffffff" },
    name: "Mohit Kumar",
    organization: "Future Labs",
    email: "mohit@futurelabs.com",
    phone: "+91 99887 66554",
    type: "Client",
    location: "Hyderabad, India",
    tags: "AI, Data Analytics",
    notes: "Enterprise license client for AI research platform.",
    recentActivity: [
      { event: "Quotation accepted", date: "16 Oct 2026", type: "blue" },
      { event: "Contact added", date: "04 Oct 2026", type: "gray" },
    ],
  },
  {
    id: "cnt-8",
    initials: "SP",
    avatarColor: { bg: "#10b981", text: "#ffffff" },
    name: "Sakshi Pandey",
    organization: "AI Research Hub",
    email: "sakshi@airhub.com",
    phone: "+91 90987 65432",
    type: "Partner",
    location: "Chennai, India",
    tags: "Academic Partner, Research",
    notes: "Joint research and conference collaboration partner.",
    recentActivity: [
      { event: "MOU executed", date: "11 Oct 2026", type: "blue" },
      { event: "Contact added", date: "02 Oct 2026", type: "gray" },
    ],
  },
];

export default function ContactsManagementPage() {
  const [contacts, setContacts] = useState<ContactRecord[]>(INITIAL_CONTACTS);
  const [selectedId, setSelectedId] = useState<string>("cnt-1");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<
    "All" | "Organizations" | "Clients" | "Partners" | "Internal"
  >("All");
  const [search, setSearch] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [sortField, setSortField] = useState<
    "name" | "organization" | "email" | "phone" | "type" | null
  >(null);
  const [sortAsc, setSortAsc] = useState(true);

  // New Contact Form
  const [newForm, setNewForm] = useState({
    name: "",
    organization: "",
    email: "",
    phone: "",
    type: "Client" as ContactRecord["type"],
    location: "",
    notes: "",
  });

  // Edit Contact Form
  const [editForm, setEditForm] = useState({
    name: "",
    organization: "",
    email: "",
    phone: "",
    type: "Client" as ContactRecord["type"],
    location: "",
    notes: "",
  });

  const selectedContact =
    contacts.find((c) => c.id === selectedId) || contacts[0];

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-contact-menu]")) {
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

  const handleToggleSelectAll = () => {
    if (selectedRows.size === filteredContacts.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredContacts.map((c) => c.id)));
    }
  };

  const handleToggleRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = new Set(selectedRows);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedRows(updated);
  };

  const handleSort = (
    field: "name" | "organization" | "email" | "phone" | "type"
  ) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.name || !newForm.email) return;

    const parts = newForm.name.trim().split(" ");
    const initials =
      parts.length > 1
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : parts[0].slice(0, 2).toUpperCase();

    const created: ContactRecord = {
      id: `cnt-${Date.now()}`,
      initials,
      avatarColor: { bg: "#2563eb", text: "#ffffff" },
      name: newForm.name,
      organization: newForm.organization || "Independent",
      email: newForm.email,
      phone: newForm.phone || "+91 90000 00000",
      type: newForm.type,
      location: newForm.location || "India",
      tags: "Enterprise, Client",
      notes: newForm.notes || "Newly created contact profile.",
      recentActivity: [
        { event: "Contact added", date: "Just now", type: "gray" },
      ],
    };

    setContacts([created, ...contacts]);
    setSelectedId(created.id);
    setIsAddModalOpen(false);
    setNewForm({
      name: "",
      organization: "",
      email: "",
      phone: "",
      type: "Client",
      location: "",
      notes: "",
    });
    showToast(`Added ${created.name} successfully!`);
  };

  const openEditModal = () => {
    if (!selectedContact) return;
    setEditForm({
      name: selectedContact.name,
      organization: selectedContact.organization,
      email: selectedContact.email,
      phone: selectedContact.phone,
      type: selectedContact.type,
      location: selectedContact.location,
      notes: selectedContact.notes,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact) return;

    const parts = editForm.name.trim().split(" ");
    const initials =
      parts.length > 1
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : parts[0].slice(0, 2).toUpperCase();

    setContacts((prev) =>
      prev.map((c) =>
        c.id === selectedContact.id
          ? {
              ...c,
              name: editForm.name,
              initials,
              organization: editForm.organization,
              email: editForm.email,
              phone: editForm.phone,
              type: editForm.type,
              location: editForm.location,
              notes: editForm.notes,
            }
          : c
      )
    );
    setIsEditModalOpen(false);
    showToast(`Updated ${editForm.name} successfully!`);
  };

  const handleDelete = (c: ContactRecord, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveMenuId(null);
    setContacts((prev) => prev.filter((item) => item.id !== c.id));
    if (selectedId === c.id) {
      const remaining = contacts.filter((item) => item.id !== c.id);
      if (remaining.length > 0) setSelectedId(remaining[0].id);
    }
    showToast(`Deleted ${c.name}`);
  };

  // Filter
  let filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.organization.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTab === "All") return true;
    if (activeTab === "Clients") return c.type === "Client";
    if (activeTab === "Partners") return c.type === "Partner";
    if (activeTab === "Internal") return c.type === "Internal";
    if (activeTab === "Organizations") return true;
    return true;
  });

  // Sort
  if (sortField) {
    filteredContacts = [...filteredContacts].sort((a, b) => {
      const vA = a[sortField];
      const vB = b[sortField];
      return sortAsc ? vA.localeCompare(vB) : vB.localeCompare(vA);
    });
  }

  const getTypeBadgeStyle = (type: ContactRecord["type"]) => {
    switch (type) {
      case "Client":
        return { bg: "#eff6ff", color: "#2563eb" };
      case "Partner":
        return { bg: "#ecfdf5", color: "#10b981" };
      case "Internal":
        return { bg: "#f3e8ff", color: "#9333ea" };
      default:
        return { bg: "#f1f5f9", color: "#475569" };
    }
  };

  return (
    <OrgLayout activePath="/contacts">
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
          <CheckCircle2
            style={{ width: "16px", height: "16px", color: "#4ade80" }}
          />
          <span>{toastMessage}</span>
        </div>
      )}

      <div
        style={{
          width: "100%",
          maxWidth: "1320px",
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
              Contacts
            </h1>
            <p
              style={{
                fontSize: "13.5px",
                fontWeight: 400,
                color: "#64748b",
                margin: "4px 0 0 0",
              }}
            >
              Manage your clients, partners and other contacts for quotations,
              MOUs and documents.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
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
            <span>Add Contact</span>
          </button>
        </div>

        {/* ================= 2. FOUR STAT METRIC CARDS ================= */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
          }}
        >
          {/* Card 1: Total Contacts (48) */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #eef2f6",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "14px",
                backgroundColor: "#eff6ff",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Users style={{ width: "22px", height: "22px" }} />
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
                48
              </span>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#64748b",
                  marginTop: "4px",
                  display: "block",
                }}
              >
                Total Contacts
              </span>
            </div>
          </div>

          {/* Card 2: Organizations (32) */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #eef2f6",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "14px",
                backgroundColor: "#fef3c7",
                color: "#f59e0b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Building2 style={{ width: "22px", height: "22px" }} />
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
                32
              </span>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#64748b",
                  marginTop: "4px",
                  display: "block",
                }}
              >
                Organizations
              </span>
            </div>
          </div>

          {/* Card 3: Individual Contacts (12) */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #eef2f6",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "14px",
                backgroundColor: "#ecfdf5",
                color: "#10b981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <User style={{ width: "22px", height: "22px" }} />
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
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#64748b",
                  marginTop: "4px",
                  display: "block",
                }}
              >
                Individual Contacts
              </span>
            </div>
          </div>

          {/* Card 4: Partner Contacts (8) */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #eef2f6",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "14px",
                backgroundColor: "#f3e8ff",
                color: "#9333ea",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Users style={{ width: "22px", height: "22px" }} />
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
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#64748b",
                  marginTop: "4px",
                  display: "block",
                }}
              >
                Partner Contacts
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
          {/* Status Tabs */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              flexWrap: "wrap",
            }}
          >
            {(
              [
                "All",
                "Organizations",
                "Clients",
                "Partners",
                "Internal",
              ] as const
            ).map((tab) => {
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
                    backgroundColor: isActive ? "#2563eb" : "transparent",
                    color: isActive ? "#ffffff" : "#475569",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: isActive
                      ? "0 2px 6px rgba(37,99,235,0.25)"
                      : "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Search Box & All Groups Filter */}
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
                placeholder="Search contacts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
              <Filter
                style={{ width: "14px", height: "14px", color: "#64748b" }}
              />
              <span>All Groups</span>
              <ChevronDown
                style={{ width: "13px", height: "13px", color: "#64748b" }}
              />
            </div>
          </div>
        </div>

        {/* ================= 4. MAIN SPLIT: TABLE (LEFT) + DETAILS (RIGHT) ================= */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 340px",
            gap: "20px",
            alignItems: "start",
          }}
        >
          {/* Left Table Section */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "18px",
              border: "1px solid #eef2f6",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
              boxSizing: "border-box",
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
                      backgroundColor: "#ffffff",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    <th
                      style={{
                        padding: "16px 14px 16px 18px",
                        width: "36px",
                        textAlign: "center",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={
                          selectedRows.size > 0 &&
                          selectedRows.size === filteredContacts.length
                        }
                        onChange={handleToggleSelectAll}
                        style={{ cursor: "pointer", accentColor: "#2563eb" }}
                      />
                    </th>
                    <th
                      style={{
                        padding: "16px 14px",
                        fontSize: "12.5px",
                        fontWeight: 700,
                        color: "#0f172a",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                      onClick={() => handleSort("name")}
                    >
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span>Name</span>
                        <ArrowUpDown
                          style={{
                            width: "13px",
                            height: "13px",
                            color: "#94a3b8",
                          }}
                        />
                      </div>
                    </th>
                    <th
                      style={{
                        padding: "16px 14px",
                        fontSize: "12.5px",
                        fontWeight: 700,
                        color: "#0f172a",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                      onClick={() => handleSort("organization")}
                    >
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span>Organization</span>
                        <ArrowUpDown
                          style={{
                            width: "13px",
                            height: "13px",
                            color: "#94a3b8",
                          }}
                        />
                      </div>
                    </th>
                    <th
                      style={{
                        padding: "16px 14px",
                        fontSize: "12.5px",
                        fontWeight: 700,
                        color: "#0f172a",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                      onClick={() => handleSort("email")}
                    >
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span>Email</span>
                        <ArrowUpDown
                          style={{
                            width: "13px",
                            height: "13px",
                            color: "#94a3b8",
                          }}
                        />
                      </div>
                    </th>
                    <th
                      style={{
                        padding: "16px 14px",
                        fontSize: "12.5px",
                        fontWeight: 700,
                        color: "#0f172a",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                      onClick={() => handleSort("phone")}
                    >
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span>Phone</span>
                        <ArrowUpDown
                          style={{
                            width: "13px",
                            height: "13px",
                            color: "#94a3b8",
                          }}
                        />
                      </div>
                    </th>
                    <th
                      style={{
                        padding: "16px 14px",
                        fontSize: "12.5px",
                        fontWeight: 700,
                        color: "#0f172a",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                      onClick={() => handleSort("type")}
                    >
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span>Type</span>
                        <ArrowUpDown
                          style={{
                            width: "13px",
                            height: "13px",
                            color: "#94a3b8",
                          }}
                        />
                      </div>
                    </th>
                    <th
                      style={{
                        padding: "16px 18px",
                        fontSize: "12.5px",
                        fontWeight: 700,
                        color: "#0f172a",
                        textAlign: "right",
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((c, idx) => {
                    const badge = getTypeBadgeStyle(c.type);
                    const isSelected = selectedId === c.id;
                    const isChecked = selectedRows.has(c.id);
                    const isMenuOpen = activeMenuId === c.id;
                    const isBottom = idx >= filteredContacts.length - 2;

                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedId(c.id)}
                        style={{
                          borderBottom: "1px solid #f8fafc",
                          backgroundColor: isSelected
                            ? "#f0f7ff"
                            : "transparent",
                          cursor: "pointer",
                          transition: "background-color 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = "#fafafa";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }
                        }}
                      >
                        {/* Checkbox */}
                        <td
                          style={{
                            padding: "14px 14px 14px 18px",
                            textAlign: "center",
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => handleToggleRow(c.id, e as any)}
                            style={{ cursor: "pointer", accentColor: "#2563eb" }}
                          />
                        </td>

                        {/* Name + Solid Avatar */}
                        <td style={{ padding: "14px 14px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            <div
                              style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "50%",
                                backgroundColor: c.avatarColor.bg,
                                color: c.avatarColor.text,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 700,
                                fontSize: "11px",
                                flexShrink: 0,
                              }}
                            >
                              {c.initials}
                            </div>
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: "13px",
                                color: "#0f172a",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {c.name}
                            </span>
                          </div>
                        </td>

                        {/* Organization */}
                        <td
                          style={{
                            padding: "14px 14px",
                            fontSize: "13px",
                            fontWeight: 500,
                            color: "#1e293b",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {c.organization}
                        </td>

                        {/* Email */}
                        <td
                          style={{
                            padding: "14px 14px",
                            fontSize: "13px",
                            color: "#475569",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {c.email}
                        </td>

                        {/* Phone */}
                        <td
                          style={{
                            padding: "14px 14px",
                            fontSize: "13px",
                            color: "#475569",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {c.phone}
                        </td>

                        {/* Type Badge */}
                        <td style={{ padding: "14px 14px" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "3px 12px",
                              borderRadius: "9999px",
                              fontSize: "11px",
                              fontWeight: 600,
                              backgroundColor: badge.bg,
                              color: badge.color,
                            }}
                          >
                            {c.type}
                          </span>
                        </td>

                        {/* Actions */}
                        <td
                          style={{
                            padding: "14px 18px",
                            textAlign: "right",
                            position: "relative",
                          }}
                          data-contact-menu="true"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(isMenuOpen ? null : c.id);
                            }}
                            style={{
                              backgroundColor: isMenuOpen
                                ? "#eff6ff"
                                : "transparent",
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
                            <MoreVertical
                              style={{ width: "16px", height: "16px" }}
                            />
                          </button>

                          {/* Popover */}
                          {isMenuOpen && (
                            <div
                              data-contact-menu="true"
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                position: "absolute",
                                right: "16px",
                                ...(isBottom
                                  ? { bottom: "42px" }
                                  : { top: "42px" }),
                                backgroundColor: "#ffffff",
                                borderRadius: "14px",
                                border: "1px solid #e2e8f0",
                                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
                                padding: "8px",
                                minWidth: "185px",
                                zIndex: 100,
                                display: "flex",
                                flexDirection: "column",
                                gap: "2px",
                                textAlign: "left",
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedId(c.id);
                                  setActiveMenuId(null);
                                  setIsViewModalOpen(true);
                                  showToast(`Viewing details for ${c.name}`);
                                }}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "12px",
                                  padding: "9px 12px",
                                  fontSize: "13.5px",
                                  fontWeight: 500,
                                  color: "#1e293b",
                                  backgroundColor: "transparent",
                                  border: "none",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  width: "100%",
                                  textAlign: "left",
                                  transition: "background-color 0.15s ease",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "#f8fafc")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "transparent")
                                }
                              >
                                <Eye
                                  style={{
                                    width: "17px",
                                    height: "17px",
                                    color: "#64748b",
                                    flexShrink: 0,
                                  }}
                                />
                                <span>View Details</span>
                              </button>

                              <Link
                                href="/quotations/new"
                                onClick={() => setActiveMenuId(null)}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "12px",
                                  padding: "9px 12px",
                                  fontSize: "13.5px",
                                  fontWeight: 500,
                                  color: "#2563eb",
                                  textDecoration: "none",
                                  borderRadius: "8px",
                                  transition: "background-color 0.15s ease",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "#eff6ff")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "transparent")
                                }
                              >
                                <FileText
                                  style={{
                                    width: "17px",
                                    height: "17px",
                                    color: "#2563eb",
                                    flexShrink: 0,
                                  }}
                                />
                                <span>Create Quotation</span>
                              </Link>

                              <Link
                                href="/mou/new"
                                onClick={() => setActiveMenuId(null)}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "12px",
                                  padding: "9px 12px",
                                  fontSize: "13.5px",
                                  fontWeight: 500,
                                  color: "#1e293b",
                                  textDecoration: "none",
                                  borderRadius: "8px",
                                  transition: "background-color 0.15s ease",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "#f8fafc")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "transparent")
                                }
                              >
                                <Send
                                  style={{
                                    width: "17px",
                                    height: "17px",
                                    color: "#64748b",
                                    flexShrink: 0,
                                  }}
                                />
                                <span>Create MOU</span>
                              </Link>

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedId(c.id);
                                  setActiveMenuId(null);
                                  openEditModal();
                                }}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "12px",
                                  padding: "9px 12px",
                                  fontSize: "13.5px",
                                  fontWeight: 500,
                                  color: "#1e293b",
                                  backgroundColor: "transparent",
                                  border: "none",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  width: "100%",
                                  textAlign: "left",
                                  transition: "background-color 0.15s ease",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "#f8fafc")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "transparent")
                                }
                              >
                                <Edit2
                                  style={{
                                    width: "17px",
                                    height: "17px",
                                    color: "#64748b",
                                    flexShrink: 0,
                                  }}
                                />
                                <span>Edit Contact</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => handleDelete(c, e)}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "12px",
                                  padding: "9px 12px",
                                  fontSize: "13.5px",
                                  fontWeight: 500,
                                  color: "#ef4444",
                                  backgroundColor: "transparent",
                                  border: "none",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  width: "100%",
                                  textAlign: "left",
                                  transition: "background-color 0.15s ease",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "#fee2e2")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "transparent")
                                }
                              >
                                <Trash2
                                  style={{
                                    width: "17px",
                                    height: "17px",
                                    color: "#ef4444",
                                    flexShrink: 0,
                                  }}
                                />
                                <span>Delete Contact</span>
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

          {/* Right Details Card Section */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "18px",
              border: "1px solid #eef2f6",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
              padding: "20px 22px",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            {/* Header: Title + Edit button */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: "12px",
                borderBottom: "1px solid #f1f5f9",
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
                Contact Details
              </h2>
              <button
                type="button"
                onClick={openEditModal}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 10px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#475569",
                  backgroundColor: "#ffffff",
                  cursor: "pointer",
                }}
              >
                <Edit2 style={{ width: "12px", height: "12px", color: "#64748b" }} />
                <span>Edit</span>
              </button>
            </div>

            {/* Profile Avatar & Info matching Screenshot */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    backgroundColor: "#eff6ff",
                    color: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  {selectedContact.initials}
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: "15px",
                      fontWeight: 800,
                      color: "#0f172a",
                      margin: 0,
                    }}
                  >
                    {selectedContact.name}
                  </h3>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      margin: "2px 0 0 0",
                    }}
                  >
                    {selectedContact.organization}
                  </p>
                </div>
              </div>

              <span
                style={{
                  padding: "3px 12px",
                  borderRadius: "9999px",
                  fontSize: "11px",
                  fontWeight: 600,
                  backgroundColor: getTypeBadgeStyle(selectedContact.type).bg,
                  color: getTypeBadgeStyle(selectedContact.type).color,
                }}
              >
                {selectedContact.type}
              </span>
            </div>

            {/* Contact Details List */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                fontSize: "12.5px",
                color: "#475569",
                paddingTop: "6px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <Mail
                  style={{
                    width: "14px",
                    height: "14px",
                    color: "#94a3b8",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontWeight: 500,
                    color: "#1e293b",
                    wordBreak: "break-all",
                  }}
                >
                  {selectedContact.email}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <Phone
                  style={{
                    width: "14px",
                    height: "14px",
                    color: "#94a3b8",
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontWeight: 500, color: "#1e293b" }}>
                  {selectedContact.phone}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <Building2
                  style={{
                    width: "14px",
                    height: "14px",
                    color: "#94a3b8",
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontWeight: 500, color: "#1e293b" }}>
                  {selectedContact.organization}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <MapPin
                  style={{
                    width: "14px",
                    height: "14px",
                    color: "#94a3b8",
                    flexShrink: 0,
                  }}
                />
                <span>{selectedContact.location}</span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <Briefcase
                  style={{
                    width: "14px",
                    height: "14px",
                    color: "#94a3b8",
                    flexShrink: 0,
                  }}
                />
                <span>{selectedContact.tags}</span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                <FileText
                  style={{
                    width: "14px",
                    height: "14px",
                    color: "#94a3b8",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                />
                <span style={{ lineHeight: 1.4 }}>{selectedContact.notes}</span>
              </div>
            </div>

            {/* Recent Activity */}
            <div
              style={{
                paddingTop: "12px",
                borderTop: "1px solid #f1f5f9",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <h4
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#0f172a",
                  margin: 0,
                }}
              >
                Recent Activity
              </h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  paddingTop: "4px",
                }}
              >
                {selectedContact.recentActivity.map((act, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{
                          width: "7px",
                          height: "7px",
                          borderRadius: "50%",
                          backgroundColor:
                            act.type === "blue" ? "#2563eb" : "#cbd5e1",
                        }}
                      />
                      <span style={{ color: "#334155", fontWeight: 500 }}>
                        {act.event}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#94a3b8",
                      }}
                    >
                      {act.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* View All Documents Button */}
            <div style={{ paddingTop: "6px" }}>
              <Link
                href="/my-documents"
                style={{
                  width: "100%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "9px 0",
                  backgroundColor: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "10px",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  color: "#2563eb",
                  textDecoration: "none",
                  transition: "all 0.15s ease",
                  boxSizing: "border-box",
                }}
              >
                <FileText style={{ width: "15px", height: "15px" }} />
                <span>View All Documents</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL: ADD CONTACT ================= */}
      {isAddModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15,23,42,0.45)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              maxWidth: "480px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: "12px",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#0f172a",
                  margin: 0,
                }}
              >
                Add New Contact
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                  padding: "4px",
                }}
              >
                <X style={{ width: "18px", height: "18px" }} />
              </button>
            </div>

            <form
              onSubmit={handleAddSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                marginTop: "16px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: "4px",
                  }}
                >
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rohan Sharma"
                  value={newForm.name}
                  onChange={(e) =>
                    setNewForm({ ...newForm, name: e.target.value })
                  }
                  style={{
                    width: "100%",
                    height: "38px",
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
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: "4px",
                  }}
                >
                  Organization
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tech Solutions Pvt Ltd"
                  value={newForm.organization}
                  onChange={(e) =>
                    setNewForm({ ...newForm, organization: e.target.value })
                  }
                  style={{
                    width: "100%",
                    height: "38px",
                    padding: "0 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "13px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#334155",
                      marginBottom: "4px",
                    }}
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={newForm.email}
                    onChange={(e) =>
                      setNewForm({ ...newForm, email: e.target.value })
                    }
                    style={{
                      width: "100%",
                      height: "38px",
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
                      fontWeight: 600,
                      color: "#334155",
                      marginBottom: "4px",
                    }}
                  >
                    Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={newForm.phone}
                    onChange={(e) =>
                      setNewForm({ ...newForm, phone: e.target.value })
                    }
                    style={{
                      width: "100%",
                      height: "38px",
                      padding: "0 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      fontSize: "13px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#334155",
                      marginBottom: "4px",
                    }}
                  >
                    Contact Type
                  </label>
                  <select
                    value={newForm.type}
                    onChange={(e) =>
                      setNewForm({
                        ...newForm,
                        type: e.target.value as ContactRecord["type"],
                      })
                    }
                    style={{
                      width: "100%",
                      height: "38px",
                      padding: "0 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      fontSize: "13px",
                      backgroundColor: "#ffffff",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="Client">Client</option>
                    <option value="Partner">Partner</option>
                    <option value="Internal">Internal</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#334155",
                      marginBottom: "4px",
                    }}
                  >
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lucknow, India"
                    value={newForm.location}
                    onChange={(e) =>
                      setNewForm({ ...newForm, location: e.target.value })
                    }
                    style={{
                      width: "100%",
                      height: "38px",
                      padding: "0 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      fontSize: "13px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: "4px",
                  }}
                >
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional notes about this contact..."
                  value={newForm.notes}
                  onChange={(e) =>
                    setNewForm({ ...newForm, notes: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "13px",
                    boxSizing: "border-box",
                    resize: "vertical",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "8px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#f1f5f9",
                    color: "#475569",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "8px 20px",
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT CONTACT ================= */}
      {isEditModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15,23,42,0.45)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              maxWidth: "480px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: "12px",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#0f172a",
                  margin: 0,
                }}
              >
                Edit Contact
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                  padding: "4px",
                }}
              >
                <X style={{ width: "18px", height: "18px" }} />
              </button>
            </div>

            <form
              onSubmit={handleEditSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                marginTop: "16px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: "4px",
                  }}
                >
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  style={{
                    width: "100%",
                    height: "38px",
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
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: "4px",
                  }}
                >
                  Organization
                </label>
                <input
                  type="text"
                  value={editForm.organization}
                  onChange={(e) =>
                    setEditForm({ ...editForm, organization: e.target.value })
                  }
                  style={{
                    width: "100%",
                    height: "38px",
                    padding: "0 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "13px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#334155",
                      marginBottom: "4px",
                    }}
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    style={{
                      width: "100%",
                      height: "38px",
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
                      fontWeight: 600,
                      color: "#334155",
                      marginBottom: "4px",
                    }}
                  >
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                    style={{
                      width: "100%",
                      height: "38px",
                      padding: "0 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      fontSize: "13px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#334155",
                      marginBottom: "4px",
                    }}
                  >
                    Contact Type
                  </label>
                  <select
                    value={editForm.type}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        type: e.target.value as ContactRecord["type"],
                      })
                    }
                    style={{
                      width: "100%",
                      height: "38px",
                      padding: "0 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      fontSize: "13px",
                      backgroundColor: "#ffffff",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="Client">Client</option>
                    <option value="Partner">Partner</option>
                    <option value="Internal">Internal</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#334155",
                      marginBottom: "4px",
                    }}
                  >
                    Location
                  </label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) =>
                      setEditForm({ ...editForm, location: e.target.value })
                    }
                    style={{
                      width: "100%",
                      height: "38px",
                      padding: "0 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      fontSize: "13px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: "4px",
                  }}
                >
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm({ ...editForm, notes: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "13px",
                    boxSizing: "border-box",
                    resize: "vertical",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "8px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#f1f5f9",
                    color: "#475569",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "8px 20px",
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Update Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contact Details View Modal (Triggered by "View Details") */}
      {isViewModalOpen && selectedContact && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.55)",
            backdropFilter: "blur(4px)",
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setIsViewModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              boxShadow: "0 20px 40px -10px rgba(15, 23, 42, 0.25)",
              width: "100%",
              maxWidth: "520px",
              boxSizing: "border-box",
              overflow: "hidden",
              border: "1px solid #e2e8f0",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 24px",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Eye style={{ width: "18px", height: "18px", color: "#2563eb" }} />
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#0f172a",
                    margin: 0,
                  }}
                >
                  Contact Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                style={{
                  border: "none",
                  backgroundColor: "transparent",
                  color: "#64748b",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <X style={{ width: "18px", height: "18px" }} />
              </button>
            </div>

            {/* Profile banner */}
            <div
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    backgroundColor: "#eff6ff",
                    color: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "19px",
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  {selectedContact.initials}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h2
                      style={{
                        fontSize: "18px",
                        fontWeight: 800,
                        color: "#0f172a",
                        margin: 0,
                      }}
                    >
                      {selectedContact.name}
                    </h2>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: "9999px",
                        backgroundColor:
                          selectedContact.type === "Client"
                            ? "#dcfce7"
                            : selectedContact.type === "Partner"
                            ? "#eff6ff"
                            : "#f1f5f9",
                        color:
                          selectedContact.type === "Client"
                            ? "#16a34a"
                            : selectedContact.type === "Partner"
                            ? "#2563eb"
                            : "#475569",
                      }}
                    >
                      {selectedContact.type}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#64748b",
                      margin: "3px 0 0 0",
                    }}
                  >
                    {selectedContact.organization}
                  </p>
                </div>
              </div>

              {/* Info Grid */}
              <div
                style={{
                  backgroundColor: "#f8fafc",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "13px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#64748b" }}>
                    <Mail style={{ width: "15px", height: "15px", color: "#94a3b8" }} />
                    <span>Email:</span>
                  </div>
                  <a
                    href={`mailto:${selectedContact.email}`}
                    style={{ color: "#2563eb", textDecoration: "none", fontWeight: 600 }}
                  >
                    {selectedContact.email}
                  </a>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "13px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#64748b" }}>
                    <Phone style={{ width: "15px", height: "15px", color: "#94a3b8" }} />
                    <span>Phone:</span>
                  </div>
                  <a
                    href={`tel:${selectedContact.phone}`}
                    style={{ color: "#1e293b", textDecoration: "none", fontWeight: 600 }}
                  >
                    {selectedContact.phone}
                  </a>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "13px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#64748b" }}>
                    <MapPin style={{ width: "15px", height: "15px", color: "#94a3b8" }} />
                    <span>Location:</span>
                  </div>
                  <span style={{ color: "#1e293b", fontWeight: 600 }}>
                    {selectedContact.location}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "13px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#64748b" }}>
                    <Briefcase style={{ width: "15px", height: "15px", color: "#94a3b8" }} />
                    <span>Tags:</span>
                  </div>
                  <span style={{ color: "#475569", fontWeight: 500 }}>
                    {selectedContact.tags}
                  </span>
                </div>

                {selectedContact.notes && (
                  <div
                    style={{
                      borderTop: "1px solid #e2e8f0",
                      paddingTop: "10px",
                      fontSize: "12px",
                      color: "#64748b",
                    }}
                  >
                    <strong style={{ color: "#334155" }}>Notes:</strong> {selectedContact.notes}
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                  paddingTop: "8px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", gap: "8px" }}>
                  <Link
                    href="/quotations/new"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 14px",
                      backgroundColor: "#eff6ff",
                      color: "#2563eb",
                      border: "1px solid #bfdbfe",
                      borderRadius: "8px",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    <FileText style={{ width: "13px", height: "13px" }} />
                    <span>New Quotation</span>
                  </Link>

                  <Link
                    href="/mou/new"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 14px",
                      backgroundColor: "#f8fafc",
                      color: "#334155",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    <Send style={{ width: "13px", height: "13px" }} />
                    <span>New MOU</span>
                  </Link>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsViewModalOpen(false);
                      openEditModal();
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 14px",
                      backgroundColor: "#ffffff",
                      color: "#334155",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <Edit2 style={{ width: "13px", height: "13px" }} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsViewModalOpen(false)}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#2563eb",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </OrgLayout>
  );
}
