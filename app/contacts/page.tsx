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
  Tag,
  FileText,
  Edit2,
  X,
  CheckCircle2,
  ArrowUpDown,
  Download,
  Trash2,
  Eye,
  Send,
} from "lucide-react";

interface ContactRecord {
  id: string;
  initials: string;
  avatarColor: { bg: string; text: string };
  name: string;
  organization: string;
  email: string;
  phone: string;
  type: "Client" | "Partner" | "Internal" | "Organization";
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
    avatarColor: { bg: "#eff6ff", text: "#2563eb" },
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
    avatarColor: { bg: "#f5f3ff", text: "#7c3aed" },
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
    avatarColor: { bg: "#fffbeb", text: "#d97706" },
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
    avatarColor: { bg: "#fdf2f8", text: "#db2777" },
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
    avatarColor: { bg: "#eff6ff", text: "#2563eb" },
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
    avatarColor: { bg: "#fefce8", text: "#ca8a04" },
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
    avatarColor: { bg: "#ecfeff", text: "#0891b2" },
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
    avatarColor: { bg: "#ecfdf5", text: "#059669" },
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
  const [activeTab, setActiveTab] = useState<"All" | "Organizations" | "Clients" | "Partners" | "Internal">("All");
  const [search, setSearch] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [sortField, setSortField] = useState<"name" | "organization" | "email" | "phone" | "type" | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  // New Contact Form
  const [newForm, setNewForm] = useState({
    name: "",
    organization: "",
    email: "",
    phone: "",
    type: "Client" as ContactRecord["type"],
    location: "",
  });

  const selectedContact = contacts.find((c) => c.id === selectedId) || contacts[0];

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

  const handleSort = (field: "name" | "organization" | "email" | "phone" | "type") => {
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
    const initials = parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].slice(0, 2).toUpperCase();

    const created: ContactRecord = {
      id: `cnt-${Date.now()}`,
      initials,
      avatarColor: { bg: "#eff6ff", text: "#2563eb" },
      name: newForm.name,
      organization: newForm.organization || "Independent",
      email: newForm.email,
      phone: newForm.phone || "+91 90000 00000",
      type: newForm.type,
      location: newForm.location || "India",
      tags: "Enterprise, Client",
      notes: "Newly created contact profile.",
      recentActivity: [{ event: "Contact added", date: "Just now", type: "gray" }],
    };

    setContacts([created, ...contacts]);
    setSelectedId(created.id);
    setIsAddModalOpen(false);
    setNewForm({ name: "", organization: "", email: "", phone: "", type: "Client", location: "" });
    showToast(`Added ${created.name} successfully!`);
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
        return { bg: "#ecfdf5", color: "#059669" };
      case "Internal":
        return { bg: "#f5f3ff", color: "#7c3aed" };
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
            bottom: "24px",
            right: "24px",
            backgroundColor: "#0f172a",
            color: "#ffffff",
            padding: "10px 18px",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            zIndex: 9999,
          }}
        >
          <CheckCircle2 style={{ width: "16px", height: "16px", color: "#4ade80" }} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-[1360px] mx-auto p-4 sm:p-6 space-y-6 font-sans">
        {/* ================= PAGE HEADER ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Contacts</h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage your clients, partners and other contacts for quotations, MOUs and documents.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Contact</span>
          </button>
        </div>

        {/* ================= 4 STAT METRIC CARDS ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Contacts */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 leading-none block">48</span>
              <span className="text-xs font-medium text-slate-500 mt-1 block">Total Contacts</span>
            </div>
          </div>

          {/* Card 2: Organizations */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 leading-none block">32</span>
              <span className="text-xs font-medium text-slate-500 mt-1 block">Organizations</span>
            </div>
          </div>

          {/* Card 3: Individual Contacts */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 leading-none block">12</span>
              <span className="text-xs font-medium text-slate-500 mt-1 block">Individual Contacts</span>
            </div>
          </div>

          {/* Card 4: Partner Contacts */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 leading-none block">8</span>
              <span className="text-xs font-medium text-slate-500 mt-1 block">Partner Contacts</span>
            </div>
          </div>
        </div>

        {/* ================= FILTER & SEARCH BAR ================= */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(["All", "Organizations", "Clients", "Partners", "Internal"] as const).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-blue-600 text-white shadow-xs font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Search Box & Groups Filter */}
          <div className="flex items-center gap-3">
            <div className="relative min-w-[220px] sm:min-w-[260px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
              />
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shrink-0 cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>All Groups</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>
          </div>
        </div>

        {/* ================= MAIN SPLIT: TABLE (LEFT) + DETAILS (RIGHT) ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Table Section (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 text-slate-900 font-bold bg-slate-50/50">
                    <th className="py-3.5 px-3.5 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedRows.size > 0 && selectedRows.size === filteredContacts.length}
                        onChange={handleToggleSelectAll}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </th>
                    <th
                      className="py-3.5 px-3 cursor-pointer select-none"
                      onClick={() => handleSort("name")}
                    >
                      <div className="inline-flex items-center gap-1.5">
                        <span>Name</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th
                      className="py-3.5 px-3 cursor-pointer select-none"
                      onClick={() => handleSort("organization")}
                    >
                      <div className="inline-flex items-center gap-1.5">
                        <span>Organization</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th
                      className="py-3.5 px-3 cursor-pointer select-none"
                      onClick={() => handleSort("email")}
                    >
                      <div className="inline-flex items-center gap-1.5">
                        <span>Email</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th
                      className="py-3.5 px-3 cursor-pointer select-none"
                      onClick={() => handleSort("phone")}
                    >
                      <div className="inline-flex items-center gap-1.5">
                        <span>Phone</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th
                      className="py-3.5 px-3 cursor-pointer select-none"
                      onClick={() => handleSort("type")}
                    >
                      <div className="inline-flex items-center gap-1.5">
                        <span>Type</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="py-3.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredContacts.map((c) => {
                    const badge = getTypeBadgeStyle(c.type);
                    const isSelected = selectedId === c.id;
                    const isChecked = selectedRows.has(c.id);
                    const isMenuOpen = activeMenuId === c.id;

                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedId(c.id)}
                        className={`transition-colors cursor-pointer ${
                          isSelected ? "bg-blue-50/40" : "hover:bg-slate-50/60"
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3.5 px-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => handleToggleRow(c.id, e as any)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>

                        {/* Name + Avatar */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              style={{
                                backgroundColor: c.avatarColor.bg,
                                color: c.avatarColor.text,
                              }}
                              className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0"
                            >
                              {c.initials}
                            </div>
                            <span className="font-semibold text-slate-900 whitespace-nowrap">{c.name}</span>
                          </div>
                        </td>

                        {/* Organization */}
                        <td className="py-3.5 px-3 font-medium text-slate-700 whitespace-nowrap">
                          {c.organization}
                        </td>

                        {/* Email */}
                        <td className="py-3.5 px-3 text-slate-600 font-medium whitespace-nowrap">{c.email}</td>

                        {/* Phone */}
                        <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">{c.phone}</td>

                        {/* Type Badge */}
                        <td className="py-3.5 px-3">
                          <span
                            style={{
                              backgroundColor: badge.bg,
                              color: badge.color,
                            }}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                          >
                            {c.type}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-3 text-right relative" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setActiveMenuId(isMenuOpen ? null : c.id)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Popover */}
                          {isMenuOpen && (
                            <div
                              data-contact-menu="true"
                              className="absolute right-3 top-10 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-1.5 w-44 flex flex-col gap-0.5 text-left"
                            >
                              <Link
                                href="/quotations/new"
                                onClick={() => setActiveMenuId(null)}
                                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Create Quotation</span>
                              </Link>
                              <Link
                                href="/mou/new"
                                onClick={() => setActiveMenuId(null)}
                                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Create MOU</span>
                              </Link>
                              <button
                                type="button"
                                onClick={(e) => handleDelete(c, e)}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                <span>Delete Contact</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {filteredContacts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No contacts found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Details Card Section (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-5">
            {/* Header: Title + Edit button */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Contact Details</h2>
              <button
                type="button"
                onClick={() => showToast(`Editing ${selectedContact.name}`)}
                className="inline-flex items-center gap-1.5 px-3 py-1 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3 h-3 text-slate-500" />
                <span>Edit</span>
              </button>
            </div>

            {/* Profile Avatar & Info matching Screenshot */}
            <div className="flex items-center gap-3.5">
              <div
                style={{
                  backgroundColor: selectedContact.avatarColor.bg,
                  color: selectedContact.avatarColor.text,
                }}
                className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg shrink-0"
              >
                {selectedContact.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-slate-900 truncate">{selectedContact.name}</h3>
                  <span
                    style={{
                      backgroundColor: getTypeBadgeStyle(selectedContact.type).bg,
                      color: getTypeBadgeStyle(selectedContact.type).color,
                    }}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0"
                  >
                    {selectedContact.type}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{selectedContact.organization}</p>
              </div>
            </div>

            {/* Contact Details List matching Screenshot */}
            <div className="space-y-3 pt-2 text-xs text-slate-700 border-t border-slate-100">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span className="font-medium text-slate-800 break-all">{selectedContact.email}</span>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span className="font-medium text-slate-800">{selectedContact.phone}</span>
              </div>
              <div className="flex items-start gap-3">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span className="font-medium text-slate-800">{selectedContact.organization}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span className="text-slate-600">{selectedContact.location}</span>
              </div>
              <div className="flex items-start gap-3">
                <Tag className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span className="text-slate-600">{selectedContact.tags}</span>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span className="text-slate-600 leading-relaxed">{selectedContact.notes}</span>
              </div>
            </div>

            {/* Recent Activity Timeline matching Screenshot */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <h4 className="text-xs font-bold text-slate-900">Recent Activity</h4>
              <div className="space-y-2.5 pt-1">
                {selectedContact.recentActivity.map((act, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          act.type === "blue" ? "bg-blue-600" : "bg-slate-300"
                        }`}
                      ></span>
                      <span className="font-medium text-slate-700">{act.event}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">{act.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* View All Documents Button matching Screenshot */}
            <div className="pt-2">
              <Link
                href="/my-documents"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                <span>View All Documents</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL: ADD CONTACT ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add New Contact</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-4 font-sans text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rohan Sharma"
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Organization *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tech Solutions Pvt Ltd"
                  value={newForm.organization}
                  onChange={(e) => setNewForm({ ...newForm, organization: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={newForm.email}
                    onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={newForm.phone}
                    onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Type</label>
                  <select
                    value={newForm.type}
                    onChange={(e) => setNewForm({ ...newForm, type: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Client">Client</option>
                    <option value="Partner">Partner</option>
                    <option value="Internal">Internal</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Lucknow, India"
                    value={newForm.location}
                    onChange={(e) => setNewForm({ ...newForm, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </OrgLayout>
  );
}
