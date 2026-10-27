"use client";
import React, { useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";
import {
  Building2,
  Users,
  FileText,
  CreditCard,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ChevronRight
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
      color: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      title: "Total Users",
      value: "156",
      change: "+18% this month",
      icon: Users,
      color: "bg-indigo-50 text-indigo-600 border-indigo-100",
    },
    {
      title: "Total Documents",
      value: "1,245",
      change: "+20% this month",
      icon: FileText,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    {
      title: "Active Subscriptions",
      value: "20",
      change: "+5% this month",
      icon: CreditCard,
      color: "bg-amber-50 text-amber-600 border-amber-100",
    },
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
    <AdminLayout activePath="/admin/dashboard">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-0.5">Overview of all organizations, usage, and platform activity</p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-600 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>01 Oct 2026 - 31 Oct 2026</span>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">{s.title}</span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${s.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-bold text-slate-900 tracking-tight">{s.value}</div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600 font-medium">
                    <TrendingUp className="w-3 h-3" />
                    <span>{s.change}</span>
                  </div>
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
                <p className="text-xs text-slate-400">Monthly breakdown of created documents</p>
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

            {/* Custom SVG Bar Chart */}
            <div className="h-56 w-full flex items-end justify-between gap-3 pt-6 pb-2 px-2">
              {activityData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1 h-44">
                    <div
                      style={{ height: `${(d.quotes / 300) * 100}%` }}
                      className="w-1/2 max-w-[18px] bg-blue-600 rounded-t-sm group-hover:bg-blue-700 transition-all relative"
                    >
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded pointer-events-none transition-opacity whitespace-nowrap z-10">
                        {d.quotes} Q
                      </span>
                    </div>
                    <div
                      style={{ height: `${(d.mous / 300) * 100}%` }}
                      className="w-1/2 max-w-[18px] bg-indigo-300 rounded-t-sm group-hover:bg-indigo-400 transition-all relative"
                    >
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded pointer-events-none transition-opacity whitespace-nowrap z-10">
                        {d.mous} M
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">{d.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Document Status Donut/Progress */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Document Status</h3>
            <p className="text-xs text-slate-400 mb-4">Overall completion status</p>

            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background Circle */}
                  <path
                    className="text-slate-100"
                    strokeWidth="3.8"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Signed 62% */}
                  <path
                    className="text-emerald-500"
                    strokeDasharray="62, 100"
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Pending 24% */}
                  <path
                    className="text-blue-500"
                    strokeDasharray="24, 100"
                    strokeDashoffset="-62"
                    strokeWidth="3.8"
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
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Draft 6% */}
                  <path
                    className="text-slate-400"
                    strokeDasharray="6, 100"
                    strokeDashoffset="-94"
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-xl font-bold text-slate-800">1,245</span>
                  <span className="text-[10px] text-slate-400 font-medium">Total</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 w-full text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-slate-600">Signed</span>
                  </div>
                  <span className="font-semibold text-slate-900">62%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <span className="text-slate-600">Pending</span>
                  </div>
                  <span className="font-semibold text-slate-900">24%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <span className="text-slate-600">Expired</span>
                  </div>
                  <span className="font-semibold text-slate-900">8%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                    <span className="text-slate-600">Draft</span>
                  </div>
                  <span className="font-semibold text-slate-900">6%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Organizations Table */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 flex items-center justify-between border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Organizations</h3>
              <p className="text-xs text-slate-400 mt-0.5">Recently registered organizations on the platform</p>
            </div>
            <Link
              href="/admin/organizations"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-5">#</th>
                  <th className="py-3 px-5">Organization Name</th>
                  <th className="py-3 px-5">Plan</th>
                  <th className="py-3 px-5">Users</th>
                  <th className="py-3 px-5">Documents</th>
                  <th className="py-3 px-5">Joined On</th>
                  <th className="py-3 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {orgs.slice(0, 4).map((org, index) => (
                  <tr key={org.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 text-slate-400 font-medium">{index + 1}</td>
                    <td className="py-3.5 px-5">
                      <Link href={`/admin/organizations/${org.id}`} className="font-semibold text-slate-900 hover:text-blue-600 flex items-center gap-2">
                        <span>{org.displayName}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-300" />
                      </Link>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        org.plan === 'Enterprise'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : org.plan === 'Pro'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {org.plan}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-medium">{org.usersCount}</td>
                    <td className="py-3.5 px-5 font-medium">{org.documentsCount}</td>
                    <td className="py-3.5 px-5 text-slate-500 text-xs">{org.joinedOn}</td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        org.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${org.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        {org.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
