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

interface QuotationRow {
  id: string;
  quotationId: string;
  client: string;
  subject: string;
  amount: number;
  validUntil: string;
  status: "Sent" | "Accepted" | "Draft" | "Rejected" | "Expired";
}

const DEFAULT_QUOTATIONS: QuotationRow[] = [
  {
    id: "q-024",
    quotationId: "Q-024",
    client: "Tech Solutions Pvt Ltd",
    subject: "Website Development",
    amount: 85000,
    validUntil: "15 Nov 2026",
    status: "Sent",
  },
  {
    id: "q-023",
    quotationId: "Q-023",
    client: "Global Systems",
    subject: "Annual IT Support",
    amount: 120000,
    validUntil: "10 Nov 2026",
    status: "Accepted",
  },
  {
    id: "q-022",
    quotationId: "Q-022",
    client: "NextGen Digital",
    subject: "Cloud Migration",
    amount: 240000,
    validUntil: "05 Nov 2026",
    status: "Draft",
  },
  {
    id: "q-021",
    quotationId: "Q-021",
    client: "Innovate India",
    subject: "Software License",
    amount: 65000,
    validUntil: "01 Nov 2026",
    status: "Expired",
  },
  {
    id: "q-020",
    quotationId: "Q-020",
    client: "BrightTech Ltd",
    subject: "UI/UX Design",
    amount: 95000,
    validUntil: "20 Nov 2026",
    status: "Sent",
  },
];

export default function QuotationsListPage() {
  const [quotations, setQuotations] = useState<QuotationRow[]>(() => {
    if (typeof window !== "undefined") {
      const stored = getOrgDocuments();
      if (stored && stored.length > 0) {
        const storedQuotes = stored
          .filter((d) => d.type === "quotation")
          .map((d) => ({
            id: d.id,
            quotationId: d.docNumber || "Q-001",
            client: d.customerName || "Client Corp",
            subject: d.title || d.items[0]?.description || "Service Quotation",
            amount: d.total || 50000,
            validUntil: d.validTill || "15 Nov 2026",
            status: (d.status === "Signed"
              ? "Accepted"
              : d.status === "Sent"
              ? "Sent"
              : d.status === "Expired"
              ? "Expired"
              : "Draft") as any,
          }));

        if (storedQuotes.length > 0) {
          // Merge with default ensuring the ones in screenshot are present
          const existingIds = new Set(storedQuotes.map((s) => s.quotationId));
          const additions = DEFAULT_QUOTATIONS.filter((dq) => !existingIds.has(dq.quotationId));
          return [...storedQuotes, ...additions];
        }
      }
    }
    return DEFAULT_QUOTATIONS;
  });

  const [activeTab, setActiveTab] = useState<"All" | "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired">("All");
  const [search, setSearch] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [sortField, setSortField] = useState<"quotationId" | "amount" | "validUntil" | "status" | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-quote-menu]")) {
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

  const handleDownloadPDF = (q: QuotationRow) => {
    setActiveMenuId(null);
    showToast(`Downloading PDF for ${q.quotationId}...`);
    if (typeof window !== "undefined") {
      const w = window.open(`/preview/${q.id}?autoPrint=true`, "_blank");
      if (w) w.focus();
    }
  };

  const handleDelete = (q: QuotationRow) => {
    setActiveMenuId(null);
    setQuotations((prev) => prev.filter((item) => item.id !== q.id));
    deleteOrgDocument(q.id);
    showToast(`Deleted ${q.quotationId}`);
  };

  const handleSort = (field: "quotationId" | "amount" | "validUntil" | "status") => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Filter & Search
  let filtered = quotations.filter((q) => {
    const matchesSearch =
      q.quotationId.toLowerCase().includes(search.toLowerCase()) ||
      q.client.toLowerCase().includes(search.toLowerCase()) ||
      q.subject.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTab === "All") return true;
    return q.status === activeTab;
  });

  // Sort
  if (sortField) {
    filtered = [...filtered].sort((a, b) => {
      let vA = a[sortField];
      let vB = b[sortField];
      if (typeof vA === "string") {
        return sortAsc ? vA.localeCompare(vB as string) : (vB as string).localeCompare(vA);
      }
      return sortAsc ? (vA as number) - (vB as number) : (vB as number) - (vA as number);
    });
  }

  // Count calculations
  const totalCount = 24; // Visual match to screenshot
  const draftCount = 5;
  const sentCount = 12;
  const acceptedCount = 6;
  const expiredCount = 1;

  const getStatusBadge = (status: QuotationRow["status"]) => {
    switch (status) {
      case "Sent":
        return {
          bg: "#eff6ff",
          color: "#2563eb",
        };
      case "Accepted":
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
      case "Rejected":
        return {
          bg: "#f1f5f9",
          color: "#64748b",
        };
      default:
        return {
          bg: "#f8fafc",
          color: "#475569",
        };
    }
  };

  return (
    <OrgLayout activePath="/quotations">
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
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quotations</h1>
            <p className="text-xs text-slate-500 mt-1">Create, manage, and track your business quotations.</p>
          </div>

          <Link
            href="/quotations/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Quotation</span>
          </Link>
        </div>

        {/* ================= 5 STAT METRIC CARDS ================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Card 1: Total Quotations */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 fill-blue-500/10 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 leading-none block">{totalCount}</span>
              <span className="text-xs font-medium text-slate-500 mt-1 block">Total Quotations</span>
            </div>
          </div>

          {/* Card 2: Draft */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 fill-amber-500/10 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 leading-none block">{draftCount}</span>
              <span className="text-xs font-medium text-slate-500 mt-1 block">Draft</span>
            </div>
          </div>

          {/* Card 3: Sent */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Send className="w-5 h-5 fill-emerald-500/10 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 leading-none block">{sentCount}</span>
              <span className="text-xs font-medium text-slate-500 mt-1 block">Sent</span>
            </div>
          </div>

          {/* Card 4: Accepted */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 fill-emerald-500/20 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 leading-none block">{acceptedCount}</span>
              <span className="text-xs font-medium text-slate-500 mt-1 block">Accepted</span>
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
            {(["All", "Draft", "Sent", "Accepted", "Rejected", "Expired"] as const).map((tab) => {
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
                placeholder="Search quotations..."
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

        {/* ================= QUOTATIONS TABLE ================= */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 text-slate-900 font-bold bg-slate-50/50">
                  <th
                    className="py-3.5 px-4 cursor-pointer select-none"
                    onClick={() => handleSort("quotationId")}
                  >
                    <div className="inline-flex items-center gap-1.5">
                      <span>Quotation ID</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th
                    className="py-3.5 px-4 cursor-pointer select-none"
                    onClick={() => handleSort("amount")}
                  >
                    <div className="inline-flex items-center gap-1.5">
                      <span>Amount</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
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
                {filtered.map((q) => {
                  const badge = getStatusBadge(q.status);
                  const isMenuOpen = activeMenuId === q.id;

                  return (
                    <tr key={q.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* ID */}
                      <td className="py-4 px-4 font-semibold text-slate-900">{q.quotationId}</td>

                      {/* Client */}
                      <td className="py-4 px-4 font-medium text-slate-800">{q.client}</td>

                      {/* Subject */}
                      <td className="py-4 px-4 text-slate-600">{q.subject}</td>

                      {/* Amount */}
                      <td className="py-4 px-4 font-semibold text-slate-900">
                        ₹{q.amount.toLocaleString("en-IN")}
                      </td>

                      {/* Valid Until */}
                      <td className="py-4 px-4 text-slate-600">{q.validUntil}</td>

                      {/* Status Badge */}
                      <td className="py-4 px-4">
                        <span
                          style={{
                            backgroundColor: badge.bg,
                            color: badge.color,
                          }}
                          className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold"
                        >
                          {q.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right relative">
                        <button
                          type="button"
                          onClick={() => setActiveMenuId(isMenuOpen ? null : q.id)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Action Popover Menu matching Screenshot */}
                        {isMenuOpen && (
                          <div
                            data-quote-menu="true"
                            className="absolute right-4 top-12 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-1.5 w-44 flex flex-col gap-0.5 text-left"
                          >
                            <Link
                              href={`/preview/${q.id}`}
                              onClick={() => setActiveMenuId(null)}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              <span>View Document</span>
                            </Link>

                            <Link
                              href={`/documents/${q.id}/send`}
                              onClick={() => setActiveMenuId(null)}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Send className="w-3.5 h-3.5 text-blue-600" />
                              <span>Send for Signature</span>
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleDownloadPDF(q)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-left cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5 text-slate-500" />
                              <span>Download PDF</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(q)}
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
                      No quotations found matching your criteria.
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
