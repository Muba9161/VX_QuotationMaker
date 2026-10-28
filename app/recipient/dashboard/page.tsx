"use client";

import React, { useState, useMemo } from "react";
import RecipientLayout from "@/components/RecipientLayout";
import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle2,
  MessageSquare,
  XCircle,
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  ArrowRight,
  Headphones,
  FileCheck,
  User,
  X,
  ExternalLink,
  Download,
} from "lucide-react";

interface RecipientDoc {
  id: string;
  docNumber: string;
  name: string;
  pages: number;
  fromName: string;
  fromLogoSeed: string;
  type: "Quotation" | "MOU" | "Agreement";
  receivedDate: string;
  receivedTime: string;
  status: "Pending Signature" | "Changes Requested" | "Signed" | "Declined";
  signUrl: string;
  previewUrl: string;
}

const SEED_DOCUMENTS: RecipientDoc[] = [
  {
    id: "doc-1",
    docNumber: "Q-001",
    name: "Quotation - Q-001",
    pages: 2,
    fromName: "ACME Technologies Pvt Ltd",
    fromLogoSeed: "acme",
    type: "Quotation",
    receivedDate: "28 Oct 2026",
    receivedTime: "10:30 AM",
    status: "Pending Signature",
    signUrl: "/sign/doc-1",
    previewUrl: "/preview/doc-1",
  },
  {
    id: "doc-2",
    docNumber: "M-014",
    name: "MOU - M-014",
    pages: 5,
    fromName: "BrightPath Solutions",
    fromLogoSeed: "brightpath",
    type: "MOU",
    receivedDate: "26 Oct 2026",
    receivedTime: "02:15 PM",
    status: "Changes Requested",
    signUrl: "/sign/doc-2",
    previewUrl: "/preview/doc-2",
  },
  {
    id: "doc-3",
    docNumber: "Q-008",
    name: "Quotation - Q-008",
    pages: 3,
    fromName: "Northstar Systems",
    fromLogoSeed: "northstar",
    type: "Quotation",
    receivedDate: "22 Oct 2026",
    receivedTime: "11:20 AM",
    status: "Signed",
    signUrl: "/sign/doc-3",
    previewUrl: "/preview/doc-3",
  },
  {
    id: "doc-4",
    docNumber: "SA-003",
    name: "Service Agreement - SA-003",
    pages: 4,
    fromName: "ACME Technologies Pvt Ltd",
    fromLogoSeed: "acme",
    type: "Agreement",
    receivedDate: "20 Oct 2026",
    receivedTime: "09:45 AM",
    status: "Signed",
    signUrl: "/sign/doc-4",
    previewUrl: "/preview/doc-4",
  },
];

export default function RecipientDashboardPage() {
  const [documents, setDocuments] = useState<RecipientDoc[]>(SEED_DOCUMENTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Filtered documents
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const matchSearch =
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.fromName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus =
        statusFilter === "All Status" || doc.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [documents, searchTerm, statusFilter]);

  // Company logo icon renderer
  const renderCompanyLogo = (name: string) => {
    if (name.includes("ACME")) {
      return (
        <div className="w-7 h-7 flex items-center justify-center shrink-0">
          <svg className="w-6 h-6" viewBox="0 0 48 48" fill="none">
            <path d="M24 6L6 38H18L24 26L30 38H42L24 6Z" fill="#2563EB" />
          </svg>
        </div>
      );
    }
    if (name.includes("BrightPath")) {
      return (
        <div className="w-7 h-7 flex items-center justify-center shrink-0">
          <div className="w-5 h-5 bg-teal-500 rounded-sm rotate-45 flex items-center justify-center">
            <span className="text-white text-[9px] font-black -rotate-45">B</span>
          </div>
        </div>
      );
    }
    if (name.includes("Northstar")) {
      return (
        <div className="w-7 h-7 flex items-center justify-center shrink-0">
          <span className="text-slate-900 font-black text-sm tracking-tighter">N</span>
        </div>
      );
    }
    return (
      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs">
        {name[0]}
      </div>
    );
  };

  return (
    <RecipientLayout activePath="/recipient/dashboard">
      <div className="space-y-6 max-w-[1400px] mx-auto">
        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left Column (8.5 cols) */}
          <div className="xl:col-span-8 space-y-6">
            {/* Header Area with Graphic matching Image */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1 relative z-10">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Recipient Dashboard
                </h1>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-lg">☀️</span>
                  <span className="text-base font-bold text-slate-800">
                    Good morning, John
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  Here's an overview of your shared documents.
                </p>
              </div>

              {/* Decorative Document Illustration matching Image */}
              <div className="hidden md:flex items-center justify-center relative w-48 h-24 shrink-0">
                {/* Background glow circle */}
                <div className="w-32 h-32 rounded-full bg-blue-50/80 absolute -top-4 -right-4 blur-xs" />
                {/* Slanted document card */}
                <div className="w-28 h-18 bg-white/95 rounded-xl border border-blue-200 shadow-md p-2.5 absolute rotate-6 right-2 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="w-8 h-1 bg-blue-400 rounded-full" />
                    <div className="w-14 h-1 bg-slate-200 rounded-full" />
                    <div className="w-10 h-1 bg-slate-200 rounded-full" />
                  </div>
                  <div className="font-serif italic text-blue-600 text-xs text-right">
                    J. Doe
                  </div>
                </div>
                {/* Foreground document card */}
                <div className="w-24 h-16 bg-white/90 rounded-xl border border-blue-150 shadow-sm p-2 absolute -rotate-6 right-16 top-3 flex flex-col justify-between">
                  <div className="w-6 h-1 bg-blue-300 rounded-full" />
                  <div className="w-10 h-1 bg-slate-200 rounded-full" />
                  <div className="w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center">
                    <FileCheck className="w-2.5 h-2.5 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Banner: Waiting for Review matching Image */}
            {!bannerDismissed && (
              <div className="bg-blue-50/70 border border-blue-150 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs relative">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">
                      You have 2 documents waiting for your review
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Please review and sign the documents shared with you.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <Link
                    href="/sign/doc-1"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                  >
                    <span>Review Documents</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => setBannerDismissed(true)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* 4 Stat Metric Cards matching Image */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Card 1: Awaiting Your Action */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 leading-tight">2</div>
                  <div className="text-xs font-bold text-slate-800 mt-0.5">
                    Awaiting Your Action
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-1">
                    Documents pending review and signature.
                  </div>
                </div>
              </div>

              {/* Card 2: Signed Documents */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 leading-tight">8</div>
                  <div className="text-xs font-bold text-slate-800 mt-0.5">
                    Signed Documents
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-1">
                    Successfully signed documents.
                  </div>
                </div>
              </div>

              {/* Card 3: Change Requests */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 leading-tight">1</div>
                  <div className="text-xs font-bold text-slate-800 mt-0.5">
                    Change Requests
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-1">
                    Documents with requested changes.
                  </div>
                </div>
              </div>

              {/* Card 4: Declined */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <XCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 leading-tight">0</div>
                  <div className="text-xs font-bold text-slate-800 mt-0.5">
                    Declined
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-1">
                    Documents you have declined to sign.
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Documents Table Card matching Image */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
              {/* Header + Search/Filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Recent Documents</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Here are the documents recently shared with you.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href="/recipient/shared"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    <span>View all</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Search & Filter Row */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-1">
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search documents..."
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 font-medium"
                  />
                </div>

                <div className="relative w-full sm:w-auto">
                  <div className="flex items-center gap-1 border border-slate-200 rounded-xl px-3 py-1.5 bg-white text-xs text-slate-700 font-medium cursor-pointer shadow-2xs">
                    <Filter className="w-3 h-3 text-slate-400 mr-1" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="appearance-none bg-transparent pr-4 focus:outline-hidden cursor-pointer"
                    >
                      <option value="All Status">All Status</option>
                      <option value="Pending Signature">Pending Signature</option>
                      <option value="Changes Requested">Changes Requested</option>
                      <option value="Signed">Signed</option>
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 pointer-events-none -ml-3" />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 text-slate-900 font-bold">
                    <tr>
                      <th className="py-3 px-3">Document</th>
                      <th className="py-3 px-3">From</th>
                      <th className="py-3 px-3">Type</th>
                      <th className="py-3 px-3">Received</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-center">Action</th>
                      <th className="py-3 px-2 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredDocs.map((doc) => {
                      const isMenuOpen = activeMenuId === doc.id;

                      // Document Icon color
                      const docIconColor =
                        doc.status === "Pending Signature"
                          ? "bg-blue-50 text-blue-600"
                          : doc.status === "Changes Requested"
                          ? "bg-rose-50 text-rose-600"
                          : "bg-emerald-50 text-emerald-600";

                      return (
                        <tr
                          key={doc.id}
                          className="hover:bg-slate-50/70 transition-colors group"
                        >
                          {/* Document Name + Pages */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-lg ${docIconColor} flex items-center justify-center shrink-0`}
                              >
                                <FileText className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 text-xs">
                                  {doc.name}
                                </div>
                                <div className="text-[10px] text-slate-400 font-medium">
                                  {doc.pages} pages
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* From Company */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2">
                              {renderCompanyLogo(doc.fromName)}
                              <span className="font-semibold text-slate-800 text-[11px] leading-tight">
                                {doc.fromName}
                              </span>
                            </div>
                          </td>

                          {/* Document Type Badge */}
                          <td className="py-3.5 px-3">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-md font-medium text-[11px] ${
                                doc.type === "Quotation"
                                  ? "bg-blue-50 text-blue-600"
                                  : doc.type === "MOU"
                                  ? "bg-purple-50 text-purple-600"
                                  : "bg-emerald-50 text-emerald-600"
                              }`}
                            >
                              {doc.type}
                            </span>
                          </td>

                          {/* Received Date & Time */}
                          <td className="py-3.5 px-3">
                            <div className="font-medium text-slate-800 text-[11px]">
                              {doc.receivedDate}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium">
                              {doc.receivedTime}
                            </div>
                          </td>

                          {/* Status Badge matching Image */}
                          <td className="py-3.5 px-3">
                            {doc.status === "Pending Signature" && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Pending Signature</span>
                              </span>
                            )}
                            {doc.status === "Changes Requested" && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-700 border border-orange-200/60">
                                <MessageSquare className="w-3 h-3 text-orange-600" />
                                <span>Changes Requested</span>
                              </span>
                            )}
                            {doc.status === "Signed" && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Signed</span>
                              </span>
                            )}
                          </td>

                          {/* Action Button matching Image */}
                          <td className="py-3.5 px-3 text-center">
                            {doc.status === "Pending Signature" && (
                              <Link
                                href={doc.signUrl}
                                className="inline-block px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                              >
                                Review
                              </Link>
                            )}
                            {doc.status === "Changes Requested" && (
                              <Link
                                href={doc.previewUrl}
                                className="inline-block px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-blue-600 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                              >
                                View
                              </Link>
                            )}
                            {doc.status === "Signed" && (
                              <Link
                                href={doc.previewUrl}
                                className="inline-block px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-blue-600 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                              >
                                View PDF
                              </Link>
                            )}
                          </td>

                          {/* 3 Dots Menu */}
                          <td className="py-3.5 px-2 text-right">
                            <div className="relative inline-block">
                              <button
                                type="button"
                                onClick={() =>
                                  setActiveMenuId(isMenuOpen ? null : doc.id)
                                }
                                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                              >
                                <MoreVertical className="w-3.5 h-3.5" />
                              </button>

                              {isMenuOpen && (
                                <div className="absolute right-0 top-8 z-30 w-36 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 text-xs font-medium animate-in fade-in zoom-in-95 duration-100">
                                  <Link
                                    href={doc.previewUrl}
                                    className="block px-3.5 py-1.5 hover:bg-slate-50 text-slate-700"
                                  >
                                    Preview Document
                                  </Link>
                                  <Link
                                    href={doc.signUrl}
                                    className="block px-3.5 py-1.5 hover:bg-slate-50 text-slate-700"
                                  >
                                    Signing Portal
                                  </Link>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Footer Pagination matching Image */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                <div>Showing 1 to 4 of 4 documents</div>
                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    disabled
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-300 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button className="px-3 py-1 rounded-lg bg-blue-600 text-white font-semibold text-xs shadow-2xs">
                    1
                  </button>
                  <button
                    disabled
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-300 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (3.5 cols) matching Image */}
          <div className="xl:col-span-4 space-y-6">
            {/* Quick Actions Card matching Image */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Quick Actions</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Common actions to help you get started.
                </p>
              </div>

              <div className="space-y-3">
                {/* Action 1 */}
                <Link
                  href="/sign/doc-1"
                  className="p-3.5 rounded-xl border border-slate-150 hover:border-blue-200 hover:bg-blue-50/30 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        Review Pending Documents
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        View and sign documents waiting for your action.
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0 ml-2" />
                </Link>

                {/* Action 2 */}
                <Link
                  href="/preview/doc-1"
                  className="p-3.5 rounded-xl border border-slate-150 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                        View Signed PDFs
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Access all your signed documents.
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0 ml-2" />
                </Link>

                {/* Action 3 */}
                <div
                  className="p-3.5 rounded-xl border border-slate-150 hover:border-purple-200 hover:bg-purple-50/30 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                        Update Profile
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Manage your personal information.
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 transition-colors shrink-0 ml-2" />
                </div>
              </div>
            </div>

            {/* Need Help? Card matching Image */}
            <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/40 rounded-2xl border border-blue-150/80 p-6 shadow-xs space-y-3 relative overflow-hidden">
              {/* Background soft circle */}
              <div className="w-24 h-24 rounded-full bg-blue-100/50 absolute -bottom-6 -right-6 pointer-events-none" />

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Headphones className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-900">Need Help?</h3>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                If you have any questions about a document or need assistance, please contact the
                sender directly or reach out to our support team.
              </p>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => alert("Support Desk: support@worldx.com / +91 98765 43210")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 shadow-2xs transition-colors cursor-pointer"
                >
                  <span>Get Support</span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RecipientLayout>
  );
}
