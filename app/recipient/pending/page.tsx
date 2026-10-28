"use client";

import React, { useState, useMemo } from "react";
import RecipientLayout from "@/components/RecipientLayout";
import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle2,
  X,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  ArrowUpDown,
  FileCheck,
  ShieldCheck,
  Headphones,
  BookOpen,
} from "lucide-react";

interface PendingDoc {
  id: string;
  name: string;
  pages: number;
  fromName: string;
  fromEmail: string;
  type: "Quotation" | "MOU" | "Agreement" | "NDA";
  receivedDate: string;
  receivedTime: string;
  validTill: string;
  signUrl: string;
}

const SEED_PENDING_DOCS: PendingDoc[] = [
  {
    id: "doc-1",
    name: "Quotation - Q-001",
    pages: 2,
    fromName: "ACME Technologies Pvt Ltd",
    fromEmail: "john.doe@email.com",
    type: "Quotation",
    receivedDate: "28 Oct 2026",
    receivedTime: "10:30 AM",
    validTill: "28 Nov 2026",
    signUrl: "/sign/doc-1",
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
    validTill: "15 Nov 2026",
    signUrl: "/sign/doc-2",
  },
  {
    id: "doc-3",
    name: "Service Agreement - SA-006",
    pages: 4,
    fromName: "Northstar Systems",
    fromEmail: "contact@northstar.com",
    type: "Agreement",
    receivedDate: "24 Oct 2026",
    receivedTime: "11:20 AM",
    validTill: "30 Nov 2026",
    signUrl: "/sign/doc-3",
  },
  {
    id: "doc-4",
    name: "NDA - NDA-006",
    pages: 3,
    fromName: "Zenith Innovations",
    fromEmail: "info@zenith.com",
    type: "NDA",
    receivedDate: "22 Oct 2026",
    receivedTime: "09:45 AM",
    validTill: "15 Nov 2026",
    signUrl: "/sign/doc-4",
  },
];

export default function PendingSignaturePage() {
  const [documents, setDocuments] = useState<PendingDoc[]>(SEED_PENDING_DOCS);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Document Types");
  const [senderFilter, setSenderFilter] = useState("All Senders");
  const [sortBy, setSortBy] = useState<"Newest" | "Oldest" | "Due Soon">("Newest");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Filtered and sorted documents
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
      return matchSearch && matchType && matchSender;
    });

    if (sortBy === "Oldest") {
      result = [...result].reverse();
    } else if (sortBy === "Due Soon") {
      result = [...result].sort((a, b) => a.validTill.localeCompare(b.validTill));
    }
    return result;
  }, [documents, searchTerm, typeFilter, senderFilter, sortBy]);

  // Company logo renderer matching Image 2
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
    <RecipientLayout activePath="/recipient/pending">
      <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
        {/* Header Area with Graphic Illustration matching Image 2 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 relative z-10">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Pending Signature
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Documents waiting for your review and signature.
            </p>
          </div>

          {/* Decorative Clock + Document Illustration matching Image 2 */}
          <div className="hidden md:flex items-center justify-center relative w-56 h-20 shrink-0">
            {/* Background soft glow circle */}
            <div className="w-32 h-28 rounded-full bg-blue-100/70 absolute -top-4 -right-4 blur-xs" />

            {/* Paper airplane flying */}
            <svg
              className="w-5 h-5 text-blue-400 absolute top-1 right-2 -rotate-12"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>

            {/* Clock badge */}
            <div className="w-12 h-12 rounded-full bg-amber-50 border-2 border-amber-300 shadow-sm flex items-center justify-center absolute left-2 top-4 z-10">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>

            {/* Document card sheet */}
            <div className="w-28 h-20 bg-white/95 rounded-xl border border-blue-200 shadow-md p-2.5 absolute rotate-3 right-6 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="w-10 h-1 bg-blue-400 rounded-full" />
                <div className="w-16 h-1 bg-slate-200 rounded-full" />
                <div className="w-12 h-1 bg-slate-200 rounded-full" />
              </div>
              <div className="font-serif italic text-blue-600 text-xs text-right border-t border-slate-100 pt-1">
                John Doe
              </div>
            </div>
          </div>
        </div>

        {/* 4 Stat Cards Row matching Image 2 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Card 1: Pending Signature */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 leading-tight">
                2
              </div>
              <div className="text-xs font-bold text-slate-800 mt-0.5">
                Pending Signature
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                Need your action
              </div>
            </div>
          </div>

          {/* Card 2: Total Documents */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 leading-tight">
                5
              </div>
              <div className="text-xs font-bold text-slate-800 mt-0.5">
                Total Documents
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                Shared with you
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
                8
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
                1
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

        {/* Main Table Card matching Image 2 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          {/* Filters Bar: Search + Document Types + Senders + Sort */}
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
                    <option value="Due Soon">Due Soon</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none -ml-3" />
                </div>
              </div>
            </div>
          </div>

          {/* Table matching Image 2 */}
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-slate-900 font-bold">
                <tr>
                  <th className="py-3 px-3">Document</th>
                  <th className="py-3 px-3">From</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Received On</th>
                  <th className="py-3 px-3">Valid Till</th>
                  <th className="py-3 px-3">Pages</th>
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

                      {/* Valid Till Date */}
                      <td className="py-3.5 px-3">
                        <div className="font-medium text-slate-800 text-[11px]">
                          {doc.validTill}
                        </div>
                      </td>

                      {/* Pages Count */}
                      <td className="py-3.5 px-3 font-medium text-slate-800 text-[11px]">
                        {doc.pages}
                      </td>

                      {/* Review & Sign Action Button */}
                      <td className="py-3.5 px-3 text-center">
                        <Link
                          href={doc.signUrl}
                          className="inline-block px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                        >
                          Review & Sign
                        </Link>
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
                                href={`/preview/${doc.id}`}
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

          {/* Table Footer Pagination matching Image 2 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            <div>Showing 1 to {filteredDocs.length} of {filteredDocs.length} documents</div>
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

        {/* Bottom "Need Help Signing?" Card matching Image 2 */}
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-100/90 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Need Help Signing?
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Review the document, check the details and add your signature. If you have any questions, feel free to contact the sender.
              </p>
            </div>
          </div>

          {/* Actions on right */}
          <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
            <button
              type="button"
              className="bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 text-xs font-semibold px-4 py-2 rounded-xl shadow-2xs flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Headphones className="w-3.5 h-3.5 text-blue-600" />
              <span>Contact Sender</span>
            </button>
            <button
              type="button"
              className="bg-white hover:bg-slate-50 border border-slate-200/90 text-blue-600 text-xs font-semibold px-4 py-2 rounded-xl shadow-2xs flex items-center gap-2 cursor-pointer transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>View Signing Guide</span>
            </button>
          </div>
        </div>
      </div>
    </RecipientLayout>
  );
}
