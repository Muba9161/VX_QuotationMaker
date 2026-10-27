"use client";
import React, { useState } from "react";
import Link from "next/link";
import OrgLayout from "@/components/OrgLayout";
import { Search, MoreVertical, Plus } from "lucide-react";
import { getOrgDocuments, OrgDocument } from "@/lib/orgStorage";

export default function MyDocumentsPage() {
  const [documents] = useState<OrgDocument[]>(getOrgDocuments());
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const tabs = ["All", "Quotations", "MOUs", "Drafts", "Sent", "Signed", "Expired"];

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.customerName.toLowerCase().includes(search.toLowerCase()) ||
      doc.docNumber.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "All") return true;
    if (activeTab === "Quotations") return doc.type.toLowerCase() === "quotation";
    if (activeTab === "MOUs") return doc.type.toLowerCase() === "mou";
    if (activeTab === "Drafts") return doc.status === "Draft";
    if (activeTab === "Sent") return doc.status === "Sent";
    if (activeTab === "Signed") return doc.status === "Signed";
    if (activeTab === "Expired") return doc.status === "Expired";
    return true;
  });

  return (
    <OrgLayout activePath="/my-documents">
      <div className="space-y-5 max-w-7xl mx-auto font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Documents</h1>
            <p className="text-xs text-slate-400 mt-0.5">Manage and track all your created documents</p>
          </div>
          <Link
            href="/documents"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Document</span>
          </Link>
        </div>

        {/* Filter Bar with Search and Tabs matching Screen 8 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 border-t border-slate-100 pt-3 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === tab
                    ? "bg-blue-600 text-white"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Documents Table matching Screen 8 */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100 text-[10px]">
              <tr>
                <th className="py-3 px-5">#</th>
                <th className="py-3 px-5">Title</th>
                <th className="py-3 px-5">Type</th>
                <th className="py-3 px-5">Recipient</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Date</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredDocs.map((doc, idx) => (
                <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-5 text-slate-400 font-mono">{doc.docNumber || `DOC-00${idx + 1}`}</td>
                  <td className="py-3.5 px-5 font-bold text-slate-900">
                    <Link href={`/preview/${doc.id}`} className="hover:text-blue-600 transition-colors">
                      {doc.title}
                    </Link>
                  </td>
                  <td className="py-3.5 px-5 capitalize text-slate-600">{doc.type}</td>
                  <td className="py-3.5 px-5 text-slate-600">{doc.customerName}</td>
                  <td className="py-3.5 px-5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                      doc.status === 'Signed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : doc.status === 'Sent'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : doc.status === 'Draft'
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-slate-400">{doc.createdAt}</td>
                  <td className="py-3.5 px-5 text-right">
                    <button className="p-1 text-slate-400 hover:text-slate-600">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </OrgLayout>
  );
}
