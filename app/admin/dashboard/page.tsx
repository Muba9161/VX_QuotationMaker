"use client";
import React, { useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";
import {
  Building2,
  Users2,
  FileText,
  Shield,
  Calendar,
  ChevronDown,
  ArrowUpRight
} from "lucide-react";
import { getOrganizations } from "@/lib/adminStorage";

export default function AdminDashboardPage() {
  const [orgs] = useState(getOrganizations());

  const stats = [
    {
      title: "Total Organizations",
      value: "24",
      change: "+12% this month",
      icon: Building2,
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    {
      title: "Total Users",
      value: "156",
      change: "+18% this month",
      icon: Users2,
      iconBg: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      title: "Total Documents",
      value: "1,245",
      change: "+20% this month",
      icon: FileText,
      iconBg: "bg-purple-50 text-purple-600 border-purple-100",
    },
    {
      title: "Active Subscriptions",
      value: "20",
      change: "+5% this month",
      icon: Shield,
      iconBg: "bg-amber-50 text-amber-600 border-amber-100",
    },
  ];

  const activityData = [
    { date: "1 Oct", quotes: 140, mous: 70 },
    { date: "5 Oct", quotes: 185, mous: 95 },
    { date: "10 Oct", quotes: 240, mous: 110 },
    { date: "15 Oct", quotes: 175, mous: 85 },
    { date: "20 Oct", quotes: 285, mous: 130 },
    { date: "25 Oct", quotes: 220, mous: 105 },
    { date: "31 Oct", quotes: 260, mous: 120 },
  ];

  return (
    <AdminLayout activePath="/admin/dashboard">
      <div className="space-y-6 max-w-7xl mx-auto font-sans">
        {/* Top Header matching Image 1 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-xs text-slate-400 mt-0.5">Overview of all organizations, usage, and platform activity</p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs cursor-pointer hover:bg-slate-50 transition-colors">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>01 Oct 2026 - 31 Oct 2026</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </div>
        </div>

        {/* 4 Stat Cards matching Image 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${s.iconBg} shadow-2xs shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block">{s.title}</span>
                    <span className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight block">{s.value}</span>
                  </div>
                </div>
                <div className="mt-3 text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <span>{s.change}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Section: Document Activity & Document Status matching Image 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Document Activity (8 Cols) */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-900">Document Activity</h3>
              <div className="flex items-center gap-4 text-[11px] font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-blue-600"></span>
                  <span className="text-slate-600">Quotations</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-sky-400"></span>
                  <span className="text-slate-600">MOUs</span>
                </div>
              </div>
            </div>

            {/* Grouped Bar Chart with Y-axis matching Image 1 */}
            <div className="flex items-stretch h-56 pt-4">
              <div className="flex flex-col justify-between text-[10px] text-slate-400 pr-3 pb-6 text-right w-8 select-none">
                <span>200</span>
                <span>150</span>
                <span>100</span>
                <span>50</span>
                <span>0</span>
              </div>
              <div className="flex-1 flex items-end justify-between gap-3 border-b border-slate-100 pb-1 px-2">
                {activityData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-1.5 h-44">
                      <div
                        style={{ height: `${(d.quotes / 300) * 100}%` }}
                        className="w-1/2 max-w-[14px] bg-blue-600 rounded-t-xs hover:bg-blue-700 transition-all cursor-pointer"
                        title={`${d.quotes} Quotations`}
                      ></div>
                      <div
                        style={{ height: `${(d.mous / 300) * 100}%` }}
                        className="w-1/2 max-w-[14px] bg-sky-400 rounded-t-xs hover:bg-sky-500 transition-all cursor-pointer"
                        title={`${d.mous} MOUs`}
                      ></div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{d.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Document Status Donut (4 Cols) matching Image 1 */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
            <h3 className="text-xs font-bold text-slate-900 mb-2">Document Status</h3>

            <div className="flex-1 flex flex-col items-center justify-center py-2">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <path
                    className="text-slate-100"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Signed 62% */}
                  <path
                    className="text-emerald-500"
                    strokeDasharray="62, 100"
                    strokeWidth="4"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Pending 24% */}
                  <path
                    className="text-amber-500"
                    strokeDasharray="24, 100"
                    strokeDashoffset="-62"
                    strokeWidth="4"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Expired 8% */}
                  <path
                    className="text-rose-500"
                    strokeDasharray="8, 100"
                    strokeDashoffset="-86"
                    strokeWidth="4"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Draft 6% */}
                  <path
                    className="text-blue-500"
                    strokeDasharray="6, 100"
                    strokeDashoffset="-94"
                    strokeWidth="4"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-xl font-black text-slate-900 leading-none">1,245</span>
                  <span className="text-[10px] text-slate-400 font-semibold mt-0.5">Total</span>
                </div>
              </div>

              {/* Exact Legend on right matching Image 1 */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mt-5 w-full text-xs px-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-blue-600"></span>
                    <span className="text-slate-600 text-[11px] font-medium">Signed</span>
                  </div>
                  <span className="font-bold text-slate-900 text-[11px]">62%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-amber-500"></span>
                    <span className="text-slate-600 text-[11px] font-medium">Pending</span>
                  </div>
                  <span className="font-bold text-slate-900 text-[11px]">24%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-rose-500"></span>
                    <span className="text-slate-600 text-[11px] font-medium">Expired</span>
                  </div>
                  <span className="font-bold text-slate-900 text-[11px]">8%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-sky-400"></span>
                    <span className="text-slate-600 text-[11px] font-medium">Draft</span>
                  </div>
                  <span className="font-bold text-slate-900 text-[11px]">6%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Organizations Table matching Image 1 */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900">Recent Organizations</h3>
            <Link href="/admin/organizations" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              View All
            </Link>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100 text-[10px]">
              <tr>
                <th className="py-3 px-5">#</th>
                <th className="py-3 px-5">Organization Name</th>
                <th className="py-3 px-5">Plan</th>
                <th className="py-3 px-5">Users</th>
                <th className="py-3 px-5">Documents</th>
                <th className="py-3 px-5">Joined On</th>
                <th className="py-3 px-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {orgs.slice(0, 4).map((org, index) => (
                <tr key={org.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-5 text-slate-400">{index + 1}</td>
                  <td className="py-3.5 px-5 font-bold text-slate-900">
                    <Link href={`/admin/organizations/${org.id}`} className="hover:text-blue-600 transition-colors">
                      {org.displayName}
                    </Link>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="text-slate-600 font-semibold">{org.plan}</span>
                  </td>
                  <td className="py-3.5 px-5 text-slate-600">{org.usersCount}</td>
                  <td className="py-3.5 px-5 text-slate-600">{org.documentsCount}</td>
                  <td className="py-3.5 px-5 text-slate-400">{org.joinedOn}</td>
                  <td className="py-3.5 px-5 text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
