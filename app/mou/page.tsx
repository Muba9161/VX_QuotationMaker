"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import OrgLayout from "@/components/OrgLayout";
import {
  FileText,
  Send,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Calendar,
  ChevronDown,
  MoreVertical,
  Eye,
  Download,
  Trash2,
  ArrowUpDown,
} from "lucide-react";
import { getOrgDocuments, deleteOrgDocument, OrgDocument } from "@/lib/orgStorage";

interface MOURow {
  id: string;
  mouId: string;
  organization: string;
  title: string;
  purpose: string;
  validUntil: string;
  status: "Sent" | "Executed" | "Draft" | "Expired";
}

const DEFAULT_MOUS: MOURow[] = [
  {
    id: "mou-001",
    mouId: "MOU-001",
    organization: "Tech Solutions Pvt Ltd",
    title: "Strategic Partnership",
    purpose: "Collaboration in AI Research",
    validUntil: "25 Dec 2026",
    status: "Sent",
  },
  {
    id: "mou-002",
    mouId: "MOU-002",
    organization: "Global Systems",
    title: "Technology Exchange",
    purpose: "Knowledge Sharing",
    validUntil: "10 Jan 2027",
    status: "Executed",
  },
  {
    id: "mou-003",
    mouId: "MOU-003",
    organization: "NextGen Digital",
    title: "Business Collaboration",
    purpose: "Joint Product Development",
    validUntil: "15 Feb 2027",
    status: "Draft",
  },
  {
    id: "mou-004",
    mouId: "MOU-004",
    organization: "Innovate India",
    title: "Academic Partnership",
    purpose: "Training & Internship",
    validUntil: "05 Mar 2027",
    status: "Sent",
  },
  {
    id: "mou-005",
    mouId: "MOU-005",
    organization: "BrightTech Ltd",
    title: "Research Agreement",
    purpose: "R&D Collaboration",
    validUntil: "20 Apr 2027",
    status: "Expired",
  },
];

export default function MOUsListPage() {
  const [mous, setMous] = useState<MOURow[]>(() => {
    if (typeof window !== "undefined") {
      const stored = getOrgDocuments();
      if (stored && stored.length > 0) {
        const storedMOUs = stored
          .filter((d) => d.type === "mou")
          .map((d) => ({
            id: d.id,
            mouId: d.docNumber || "MOU-001",
            organization: d.customerName || "Partner Org",
            title: d.title || "Partnership Agreement",
            purpose: d.clauses?.[0]?.content || d.notes || "Joint Collaboration",
            validUntil: d.validTill || "25 Dec 2026",
            status: (d.status === "Signed"
              ? "Executed"
              : d.status === "Sent"
              ? "Sent"
              : d.status === "Expired"
              ? "Expired"
              : "Draft") as any,
          }));

        if (storedMOUs.length > 0) {
          const existingIds = new Set(storedMOUs.map((s) => s.mouId));
          const additions = DEFAULT_MOUS.filter((dm) => !existingIds.has(dm.mouId));
          return [...storedMOUs, ...additions];
        }
      }
    }
    return DEFAULT_MOUS;
  });

  const [activeTab, setActiveTab] = useState<"All" | "Draft" | "Sent" | "Executed" | "Expired">("All");
  const [search, setSearch] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [sortField, setSortField] = useState<"mouId" | "organization" | "validUntil" | "status" | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-mou-menu]")) {
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

  const handleDownloadPDF = (m: MOURow) => {
    setActiveMenuId(null);
    showToast(`Downloading PDF for ${m.mouId}...`);
    if (typeof window !== "undefined") {
      const w = window.open(`/preview/${m.id}?autoPrint=true`, "_blank");
      if (w) w.focus();
    }
  };

  const handleDelete = (m: MOURow) => {
    setActiveMenuId(null);
    setMous((prev) => prev.filter((item) => item.id !== m.id));
    deleteOrgDocument(m.id);
    showToast(`Deleted ${m.mouId}`);
  };

  const handleSort = (field: "mouId" | "organization" | "validUntil" | "status") => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Filter & Search
  let filtered = mous.filter((m) => {
    const matchesSearch =
      m.mouId.toLowerCase().includes(search.toLowerCase()) ||
      m.organization.toLowerCase().includes(search.toLowerCase()) ||
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.purpose.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTab === "All") return true;
    return m.status === activeTab;
  });

  // Sort
  if (sortField) {
    filtered = [...filtered].sort((a, b) => {
      let vA = a[sortField];
      let vB = b[sortField];
      return sortAsc ? vA.localeCompare(vB) : vB.localeCompare(vA);
    });
  }

  // Count calculations
  const totalCount = 18; // Matching screenshot
  const draftsCount = 6;
  const sentCount = 8;
  const executedCount = 3;
  const expiredCount = 1;

  const getStatusBadge = (status: MOURow["status"]) => {
    switch (status) {
      case "Sent":
        return {
          bg: "#eff6ff",
          color: "#2563eb",
        };
      case "Executed":
        return {
          bg: "#ecfdf5",
          color: "#059669",
        };
      case "Draft":
        return {
          bg: "#fef3c7",
          color: "#d97706",
        };
      case "Expired":
        return {
          bg: "#fee2e2",
          color: "#dc2626",
        };
      default:
        return {
          bg: "#f8fafc",
          color: "#475569",
        };
    }
  };

  return (
    <OrgLayout activePath="/mou">
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

      <div className="max-w-[1300px] mx-auto p-4 sm:p-6 space-y-6 font-sans">
        {/* ================= PAGE HEADER ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">MOUs</h1>
            <p className="text-xs text-slate-500 mt-1">Create, manage, and track Memorandum of Understanding documents.</p>
          </div>

          <Link
            href="/mou/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create MOU</span>
          </Link>
        </div>

        {/* ================= 5 STAT METRIC CARDS ================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Card 1: Total MOUs */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 fill-blue-500/10 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 leading-none block">{totalCount}</span>
              <span className="text-xs font-medium text-slate-500 mt-1 block">Total MOUs</span>
            </div>
          </div>

          {/* Card 2: Drafts */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 fill-amber-500/10 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 leading-none block">{draftsCount}</span>
              <span className="text-xs font-medium text-slate-500 mt-1 block">Drafts</span>
            </div>
          </div>

          {/* Card 3: Sent for Signature */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Send className="w-5 h-5 fill-emerald-500/10 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 leading-none block">{sentCount}</span>
              <span className="text-xs font-medium text-slate-500 mt-1 block">Sent for Signature</span>
            </div>
          </div>

          {/* Card 4: Executed */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 fill-emerald-500/20 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 leading-none block">{executedCount}</span>
              <span className="text-xs font-medium text-slate-500 mt-1 block">Executed</span>
            </div>
          </div>

          {/* Card 5: Expired */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-xs flex items-center gap-3.5 col-span-2 sm:col-span-1">
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 leading-none block">{expiredCount}</span>
              <span className="text-xs font-medium text-slate-500 mt-1 block">Expired</span>
            </div>
          </div>
        </div>

        {/* ================= FILTER & SEARCH BAR ================= */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(["All", "Draft", "Sent", "Executed", "Expired"] as const).map((tab) => {
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

          {/* Search & Date Filter */}
          <div className="flex items-center gap-3">
            {/* Search Box */}
            <div className="relative min-w-[220px] sm:min-w-[260px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search MOUs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
              />
            </div>

            {/* Date Filter Dropdown */}
            <button
              type="button"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shrink-0 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>All Dates</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>
          </div>
        </div>

        {/* ================= MOUS TABLE ================= */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 text-slate-900 font-bold bg-slate-50/50">
                  <th
                    className="py-3.5 px-4 cursor-pointer select-none"
                    onClick={() => handleSort("mouId")}
                  >
                    <div className="inline-flex items-center gap-1.5">
                      <span>MOU ID</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    className="py-3.5 px-4 cursor-pointer select-none"
                    onClick={() => handleSort("organization")}
                  >
                    <div className="inline-flex items-center gap-1.5">
                      <span>Organization</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4">Title</th>
                  <th className="py-3.5 px-4">Purpose</th>
                  <th
                    className="py-3.5 px-4 cursor-pointer select-none"
                    onClick={() => handleSort("validUntil")}
                  >
                    <div className="inline-flex items-center gap-1.5">
                      <span>Valid Until</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    className="py-3.5 px-4 cursor-pointer select-none"
                    onClick={() => handleSort("status")}
                  >
                    <div className="inline-flex items-center gap-1.5">
                      <span>Status</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((m, idx) => {
                  const badge = getStatusBadge(m.status);
                  const isMenuOpen = activeMenuId === m.id;
                  const isBottom = idx >= filtered.length - 2;

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* ID */}
                      <td className="py-4 px-4 font-semibold text-slate-900">{m.mouId}</td>

                      {/* Organization */}
                      <td className="py-4 px-4 font-medium text-slate-800">{m.organization}</td>

                      {/* Title */}
                      <td className="py-4 px-4 text-slate-700 font-medium">{m.title}</td>

                      {/* Purpose */}
                      <td className="py-4 px-4 text-slate-600">{m.purpose}</td>

                      {/* Valid Until */}
                      <td className="py-4 px-4 text-slate-600">{m.validUntil}</td>

                      {/* Status Badge */}
                      <td className="py-4 px-4">
                        <span
                          style={{
                            backgroundColor: badge.bg,
                            color: badge.color,
                          }}
                          className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold"
                        >
                          {m.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td
                        className="py-4 px-4 text-right relative"
                        data-mou-menu="true"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(isMenuOpen ? null : m.id);
                          }}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isMenuOpen
                              ? "text-blue-600 bg-blue-50"
                              : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                          }`}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Action Popover Menu matching Screenshot */}
                        {isMenuOpen && (
                          <div
                            data-mou-menu="true"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              position: "absolute",
                              right: "1rem",
                              top: isBottom ? "auto" : "2.75rem",
                              bottom: isBottom ? "2.75rem" : "auto",
                              zIndex: 9999,
                            }}
                            className="bg-white rounded-xl shadow-2xl border border-slate-200 p-1.5 w-44 flex flex-col gap-0.5 text-left"
                          >
                            <Link
                              href={`/preview/${m.id}`}
                              onClick={() => setActiveMenuId(null)}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              <span>View Document</span>
                            </Link>

                            <Link
                              href={`/documents/${m.id}/send`}
                              onClick={() => setActiveMenuId(null)}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Send className="w-3.5 h-3.5 text-blue-600" />
                              <span>Send for Signature</span>
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleDownloadPDF(m)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-left cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5 text-slate-500" />
                              <span>Download PDF</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(m)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-600" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No MOUs found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </OrgLayout>
  );
}
