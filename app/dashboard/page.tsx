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
  MoreVertical,
  ChevronRight
} from "lucide-react";
import { getOrgDocuments, OrgDocument } from "@/lib/orgStorage";

export default function OrgDashboardPage() {
  const [documents] = useState<OrgDocument[]>(getOrgDocuments());

  const stats = [
    { title: "Total Documents", value: "24", iconBg: "bg-blue-50 text-blue-600 border-blue-100", icon: FileText },
    { title: "Pending for Signature", value: "12", iconBg: "bg-amber-50 text-amber-600 border-amber-100", icon: Clock },
    { title: "Signed", value: "10", iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: CheckCircle2 },
    { title: "Expired", value: "2", iconBg: "bg-rose-50 text-rose-600 border-rose-100", icon: AlertCircle },
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
      <div className="space-y-6 max-w-7xl mx-auto font-sans">
        {/* Top Header matching Screen 2 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Good Morning, Rahul! 👏</h1>
            <p className="text-xs text-slate-400 mt-0.5">Here's what's happening in Acme Technologies</p>
          </div>
          <Link
            href="/documents"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Document</span>
          </Link>
        </div>

        {/* 4 Stat Cards matching Screen 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${s.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900 leading-none">{s.value}</div>
                  <span className="text-[11px] font-medium text-slate-400 mt-1 block">{s.title}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Grid matching Screen 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Document Activity Bar Chart (7 Cols) */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-900">Document Activity</h3>
              <div className="flex items-center gap-4 text-[11px] font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-blue-600"></span>
                  <span className="text-slate-600">Quotations</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-sky-300"></span>
                  <span className="text-slate-600">MOUs</span>
                </div>
              </div>
            </div>

            {/* Bar chart with Y-axis matching Screen 2 */}
            <div className="flex items-stretch h-52 pt-4">
              <div className="flex flex-col justify-between text-[10px] text-slate-400 pr-3 pb-6 text-right w-8">
                <span>300</span>
                <span>200</span>
                <span>100</span>
                <span>0</span>
              </div>
              <div className="flex-1 flex items-end justify-between gap-3 border-b border-slate-100 pb-1 px-2">
                {activityData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-1 h-36">
                      <div
                        style={{ height: `${(d.quotes / 300) * 100}%` }}
                        className="w-1/2 max-w-[14px] bg-blue-600 rounded-t-xs transition-all"
                      ></div>
                      <div
                        style={{ height: `${(d.mous / 300) * 100}%` }}
                        className="w-1/2 max-w-[14px] bg-sky-300 rounded-t-xs transition-all"
                      ></div>
                    </div>
                    <span className="text-[10px] text-slate-400">{d.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Document Status Donut (4 Cols) matching Screen 2 */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs flex flex-col">
            <h3 className="text-xs font-bold text-slate-900 mb-2">Document Status</h3>

            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-emerald-500" strokeDasharray="42, 100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-blue-500" strokeDasharray="25, 100" strokeDashoffset="-42" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-amber-500" strokeDasharray="25, 100" strokeDashoffset="-67" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-rose-500" strokeDasharray="8, 100" strokeDashoffset="-92" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-xl font-bold text-slate-800">24</span>
                  <span className="text-[10px] text-slate-400 font-medium">Total</span>
                </div>
              </div>

              {/* Exact Legend on right matching Screen 2 */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mt-4 w-full text-xs px-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    <span className="text-slate-600">Draft</span>
                  </div>
                  <span className="font-bold text-slate-900">6</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span className="text-slate-600">Sent</span>
                  </div>
                  <span className="font-bold text-slate-900">6</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-slate-600">Signed</span>
                  </div>
                  <span className="font-bold text-slate-900">10</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span className="text-slate-600">Expired</span>
                  </div>
                  <span className="font-bold text-slate-900">2</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Documents Table matching Screen 2 */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900">Recent Documents</h3>
            <Link href="/documents" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              View All
            </Link>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-5">#</th>
                <th className="py-3 px-5">Document Title</th>
                <th className="py-3 px-5">Type</th>
                <th className="py-3 px-5">Recipient</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Created On</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-5 text-slate-400 font-mono">{doc.docNumber}</td>
                  <td className="py-3.5 px-5 font-bold text-slate-900">
                    <Link href={`/preview/${doc.id}`} className="hover:text-blue-600">
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
