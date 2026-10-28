"use client";

import React, { useState, useMemo } from "react";
import RecipientLayout from "@/components/RecipientLayout";
import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle2,
  MessageSquare,
  X,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  ArrowUpDown,
  FileCheck,
  Eye,
  Download,
  Share2,
} from "lucide-react";

interface SharedDoc {
  id: string;
  name: string;
  pages: number;
  fromName: string;
  fromEmail: string;
  type: "Quotation" | "MOU" | "Agreement" | "NDA";
  receivedDate: string;
  receivedTime: string;
  status: "Pending Signature" | "Changes Requested" | "Signed" | "Declined";
  signUrl: string;
  previewUrl: string;
}

const SEED_SHARED_DOCS: SharedDoc[] = [
  {
    id: "doc-1",
    name: "Quotation - Q-001",
    pages: 2,
    fromName: "ACME Technologies Pvt Ltd",
    fromEmail: "john.doe@email.com",
    type: "Quotation",
    receivedDate: "28 Oct 2026",
    receivedTime: "10:30 AM",
    status: "Pending Signature",
    signUrl: "/sign/doc-1",
    previewUrl: "/preview/doc-1",
  },
  {
    id: "doc-2",
    name: "MOU - M-014",
    pages: 5,
    fromName: "BrightPath Solutions",
    fromEmail: "sarah@brightpath.com",
    type: "MOU",
    receivedDate: "26 Oct 2026",
    receivedTime: "02:15 PM",
    status: "Changes Requested",
    signUrl: "/sign/doc-2",
    previewUrl: "/preview/doc-2",
  },
  {
    id: "doc-3",
    name: "Service Agreement - SA-003",
    pages: 4,
    fromName: "Northstar Systems",
    fromEmail: "contact@northstar.com",
    type: "Agreement",
    receivedDate: "22 Oct 2026",
    receivedTime: "11:20 AM",
    status: "Signed",
    signUrl: "/sign/doc-3",
    previewUrl: "/preview/doc-3",
  },
  {
    id: "doc-4",
    name: "Quotation - Q-008",
    pages: 3,
    fromName: "ACME Technologies Pvt Ltd",
    fromEmail: "john.doe@email.com",
    type: "Quotation",
    receivedDate: "20 Oct 2026",
    receivedTime: "09:45 AM",
    status: "Signed",
    signUrl: "/sign/doc-4",
    previewUrl: "/preview/doc-4",
  },
  {
    id: "doc-5",
    name: "NDA - NDA-006",
    pages: 3,
    fromName: "Zenith Innovations",
    fromEmail: "info@zenith.com",
    type: "NDA",
    receivedDate: "18 Oct 2026",
    receivedTime: "04:10 PM",
    status: "Declined",
    signUrl: "/sign/doc-5",
    previewUrl: "/preview/doc-5",
  },
];

export default function SharedWithMePage() {
  const [documents, setDocuments] = useState<SharedDoc[]>(SEED_SHARED_DOCS);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Document Types");
  const [senderFilter, setSenderFilter] = useState("All Senders");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sortBy, setSortBy] = useState<"Newest" | "Oldest" | "Name">("Newest");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Stats calculation
  const totalDocs = documents.length;
  const pendingCount = documents.filter((d) => d.status === "Pending Signature").length;
  const signedCount = documents.filter((d) => d.status === "Signed").length;
  const declinedCount = documents.filter((d) => d.status === "Declined").length;

  // Filtered & Sorted documents
  const filteredDocs = useMemo(() => {
    let result = documents.filter((doc) => {
      const matchSearch =
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.fromName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.fromEmail.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType =
        typeFilter === "All Document Types" || doc.type === typeFilter;
      const matchSender =
        senderFilter === "All Senders" || doc.fromName === senderFilter;
      const matchStatus =
        statusFilter === "All Status" || doc.status === statusFilter;
      return matchSearch && matchType && matchSender && matchStatus;
    });

    if (sortBy === "Oldest") {
      result.reverse();
    } else if (sortBy === "Name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }
    return result;
  }, [documents, searchTerm, typeFilter, senderFilter, statusFilter, sortBy]);

  // Company logo renderer matching Image
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
    if (name.includes("Zenith")) {
      return (
        <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center shrink-0 text-white font-black text-xs">
          Z
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
    <RecipientLayout activePath="/recipient/shared">
      <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
        {/* Header Area with Decorative Graphic matching Image */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 relative z-10">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Shared with Me
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Documents shared with you for review and signature.
            </p>
          </div>

          {/* Decorative Document Illustration matching Image */}
          <div className="hidden md:flex items-center justify-center relative w-48 h-20 shrink-0">
            {/* Background glow circle */}
            <div className="w-28 h-28 rounded-full bg-blue-50/80 absolute -top-4 -right-4 blur-xs" />
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
            <div className="w-24 h-16 bg-white/90 rounded-xl border border-blue-150 shadow-sm p-2 absolute -rotate-6 right-16 top-2 flex flex-col justify-between">
              <div className="w-6 h-1 bg-blue-300 rounded-full" />
              <div className="w-10 h-1 bg-slate-200 rounded-full" />
              <div className="w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center">
                <FileCheck className="w-2.5 h-2.5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* 4 Stat Cards Row matching Image */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Card 1: Total Documents */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 leading-tight">
                {totalDocs}
              </div>
              <div className="text-xs font-bold text-slate-800 mt-0.5">
                Total Documents
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                Shared with you
              </div>
            </div>
          </div>

          {/* Card 2: Pending Signature */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 leading-tight">
                {pendingCount}
              </div>
              <div className="text-xs font-bold text-slate-800 mt-0.5">
                Pending Signature
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                Need your action
              </div>
            </div>
          </div>

          {/* Card 3: Signed */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 leading-tight">
                {signedCount}
              </div>
              <div className="text-xs font-bold text-slate-800 mt-0.5">
                Signed
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                Completed
              </div>
            </div>
          </div>

          {/* Card 4: Declined */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <X className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 leading-tight">
                {declinedCount}
              </div>
              <div className="text-xs font-bold text-slate-800 mt-0.5">
                Declined
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                Not signed
              </div>
            </div>
          </div>
        </div>

        {/* Main Table Card matching Image */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          {/* Filter Bar with 4 Dropdowns + Sort */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search documents..."
                className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 font-medium bg-white"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Document Type Filter */}
              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="appearance-none bg-white border border-slate-200 text-slate-700 text-xs font-medium py-2 pl-3.5 pr-8 rounded-xl focus:outline-hidden focus:border-blue-500 cursor-pointer shadow-2xs"
                >
                  <option value="All Document Types">All Document Types</option>
                  <option value="Quotation">Quotation</option>
                  <option value="MOU">MOU</option>
                  <option value="Agreement">Agreement</option>
                  <option value="NDA">NDA</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Senders Filter */}
              <div className="relative">
                <select
                  value={senderFilter}
                  onChange={(e) => setSenderFilter(e.target.value)}
                  className="appearance-none bg-white border border-slate-200 text-slate-700 text-xs font-medium py-2 pl-3.5 pr-8 rounded-xl focus:outline-hidden focus:border-blue-500 cursor-pointer shadow-2xs"
                >
                  <option value="All Senders">All Senders</option>
                  <option value="ACME Technologies Pvt Ltd">ACME Technologies Pvt Ltd</option>
                  <option value="BrightPath Solutions">BrightPath Solutions</option>
                  <option value="Northstar Systems">Northstar Systems</option>
                  <option value="Zenith Innovations">Zenith Innovations</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-slate-200 text-slate-700 text-xs font-medium py-2 pl-3.5 pr-8 rounded-xl focus:outline-hidden focus:border-blue-500 cursor-pointer shadow-2xs"
                >
                  <option value="All Status">All Status</option>
                  <option value="Pending Signature">Pending Signature</option>
                  <option value="Changes Requested">Changes Requested</option>
                  <option value="Signed">Signed</option>
                  <option value="Declined">Declined</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Sort By Dropdown */}
              <div className="relative">
                <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-3 py-2 bg-white text-xs text-slate-700 font-medium cursor-pointer shadow-2xs">
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  <span className="font-semibold text-slate-800">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="appearance-none bg-transparent pr-4 focus:outline-hidden cursor-pointer font-medium"
                  >
                    <option value="Newest">Newest</option>
                    <option value="Oldest">Oldest</option>
                    <option value="Name">Name</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none -ml-3" />
                </div>
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
                  <th className="py-3 px-3">Received On</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-center">Action</th>
                  <th className="py-3 px-2 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredDocs.map((doc) => {
                  const isMenuOpen = activeMenuId === doc.id;

                  // Document icon color
                  const docIconColor =
                    doc.type === "Quotation"
                      ? "bg-blue-50 text-blue-600"
                      : doc.type === "MOU"
                      ? "bg-rose-50 text-rose-600"
                      : doc.type === "Agreement"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-rose-50 text-rose-600";

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

                      {/* From Company + Contact Email */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          {renderCompanyLogo(doc.fromName)}
                          <div>
                            <div className="font-semibold text-slate-800 text-[11px] leading-tight">
                              {doc.fromName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium">
                              {doc.fromEmail}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-md font-medium text-[11px] ${
                            doc.type === "Quotation"
                              ? "bg-blue-50 text-blue-600"
                              : doc.type === "MOU"
                              ? "bg-purple-50 text-purple-600"
                              : doc.type === "Agreement"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-rose-50 text-rose-600"
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

                      {/* Status Badge */}
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
                        {doc.status === "Declined" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/60">
                            <X className="w-3 h-3 text-rose-600" />
                            <span>Declined</span>
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
                            Review & Sign
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
                            className="inline-block px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-blue-600 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                          >
                            View PDF
                          </Link>
                        )}
                        {doc.status === "Declined" && (
                          <Link
                            href={doc.previewUrl}
                            className="inline-block px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-blue-600 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                          >
                            View
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
            <div>Showing 1 to 5 of 5 documents</div>
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
    </RecipientLayout>
  );
}
