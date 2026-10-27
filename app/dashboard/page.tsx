"use client";
import React, { useState } from "react";
import Link from "next/link";
import OrgLayout from "@/components/OrgLayout";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Eye,
  MoreVertical,
  ChevronRight
} from "lucide-react";
import { getOrgDocuments, OrgDocument } from "@/lib/orgStorage";

export default function OrgDashboardPage() {
  const [documents] = useState<OrgDocument[]>(getOrgDocuments());

  const stats = [
    { title: "Total Documents", value: "24", icon: FileText, color: "bg-blue-50 text-blue-600 border-blue-100" },
    { title: "Pending for Signature", value: "12", icon: Clock, color: "bg-amber-50 text-amber-600 border-amber-100" },
    { title: "Signed", value: "10", icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
    { title: "Expired", value: "2", icon: AlertCircle, color: "bg-rose-50 text-rose-600 border-rose-100" },
  ];

  const activityData = [
    { date: "1 Oct", quotes: 140, mous: 70 },
    { date: "5 Oct", quotes: 190, mous: 95 },
    { date: "10 Oct", quotes: 240, mous: 110 },
    { date: "15 Oct", quotes: 180, mous: 85 },
    { date: "20 Oct", quotes: 290, mous: 130 },
    { date: "25 Oct", quotes: 220, mous: 105 },
    { date: "31 Oct", quotes: 260, mous: 120 },
  ];

  return (
    <OrgLayout activePath="/dashboard">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Good Morning, Rahul! 👋</h1>
            <p className="text-sm text-slate-500 mt-0.5">Here's what's happening in Acme Technologies</p>
          </div>
          <Link
            href="/documents"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Document</span>
          </Link>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-400">{s.title}</span>
                  <div className="text-2xl font-bold text-slate-900 mt-1">{s.value}</div>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${s.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Document Activity Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Document Activity</h3>
                <p className="text-xs text-slate-400">Created documents trend</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-blue-600"></span>
                  <span className="text-slate-600">Quotations</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-indigo-300"></span>
                  <span className="text-slate-600">MOUs</span>
                </div>
              </div>
            </div>

            <div className="h-56 w-full flex items-end justify-between gap-3 pt-6 pb-2 px-2">
              {activityData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1 h-44">
                    <div
                      style={{ height: `${(d.quotes / 300) * 100}%` }}
                      className="w-1/2 max-w-[18px] bg-blue-600 rounded-t-sm group-hover:bg-blue-700 transition-all"
                    ></div>
                    <div
                      style={{ height: `${(d.mous / 300) * 100}%` }}
                      className="w-1/2 max-w-[18px] bg-indigo-300 rounded-t-sm group-hover:bg-indigo-400 transition-all"
                    ></div>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">{d.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Document Status Donut */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Document Status</h3>
            <p className="text-xs text-slate-400 mb-4">Overall completion status</p>

            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-emerald-500" strokeDasharray="42, 100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-blue-500" strokeDasharray="33, 100" strokeDashoffset="-42" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-amber-500" strokeDasharray="17, 100" strokeDashoffset="-75" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-rose-500" strokeDasharray="8, 100" strokeDashoffset="-92" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-xl font-bold text-slate-800">24</span>
                  <span className="text-[10px] text-slate-400 font-medium">Total</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 w-full text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    <span className="text-slate-600">Draft</span>
                  </div>
                  <span className="font-semibold text-slate-900">6</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span className="text-slate-600">Sent</span>
                  </div>
                  <span className="font-semibold text-slate-900">6</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-slate-600">Signed</span>
                  </div>
                  <span className="font-semibold text-slate-900">10</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span className="text-slate-600">Expired</span>
                  </div>
                  <span className="font-semibold text-slate-900">2</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Documents Table */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 flex items-center justify-between border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Documents</h3>
              <p className="text-xs text-slate-400 mt-0.5">Quick access to latest quotations and MOUs</p>
            </div>
            <Link href="/documents" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">#</th>
                <th className="py-3.5 px-5">Document Title</th>
                <th className="py-3.5 px-5">Type</th>
                <th className="py-3.5 px-5">Recipient</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Created On</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {documents.map((doc, idx) => (
                <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-5 text-slate-400 font-mono text-xs">{doc.docNumber}</td>
                  <td className="py-4 px-5 font-semibold text-slate-900">
                    <Link href={`/preview/${doc.id}`} className="hover:text-blue-600">
                      {doc.title}
                    </Link>
                  </td>
                  <td className="py-4 px-5">
                    <span className="capitalize text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {doc.type}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-slate-600">{doc.customerName}</td>
                  <td className="py-4 px-5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      doc.status === 'Signed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : doc.status === 'Sent'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-xs text-slate-500">{doc.createdAt}</td>
                  <td className="py-4 px-5 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        href={`/preview/${doc.id}`}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/documents/${doc.id}/send`}
                        className="text-xs px-2.5 py-1 rounded-md border border-blue-200 text-blue-600 hover:bg-blue-50 font-medium"
                      >
                        Send
                      </Link>
                    </div>
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
