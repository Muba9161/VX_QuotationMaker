"use client";

import React, { useState } from "react";
import OrgLayout from "@/components/OrgLayout";
import {
  Clock,
  FileText,
  FileCheck2,
  Database,
  Calendar,
  ChevronDown,
  ArrowDown,
  ArrowUp,
  MoreVertical,
  Eye,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface RecentActivity {
  id: number;
  docName: string;
  type: "Quotation" | "MOU";
  client: string;
  status: "Accepted" | "Pending" | "Declined";
  signTime: string;
  createdOn: string;
}

const ACTIVITIES: RecentActivity[] = [
  {
    id: 1,
    docName: "Web Development Proposal",
    type: "Quotation",
    client: "Innovate India",
    status: "Accepted",
    signTime: "1.2 days",
    createdOn: "24 Oct 2026",
  },
  {
    id: 2,
    docName: "IT Support Services",
    type: "Quotation",
    client: "Tech Solutions",
    status: "Pending",
    signTime: "-",
    createdOn: "22 Oct 2026",
  },
  {
    id: 3,
    docName: "Maintenance Agreement",
    type: "MOU",
    client: "Global Systems",
    status: "Accepted",
    signTime: "2.1 days",
    createdOn: "18 Oct 2026",
  },
  {
    id: 4,
    docName: "Consulting Services",
    type: "Quotation",
    client: "Future Tech",
    status: "Declined",
    signTime: "-",
    createdOn: "14 Oct 2026",
  },
];

export default function OrgReportsPage() {
  const [timeRange, setTimeRange] = useState("Last 30 Days");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  const timeRanges = ["Last 7 Days", "Last 30 Days", "Last 90 Days", "This Year"];

  // Metrics based on range
  const metrics =
    timeRange === "Last 7 Days"
      ? { signTime: "1.4 Days", signChange: "28% faster", rate: "82.0%", rateChange: "6.1%", pipeline: "₹4,20,000", quotes: "6" }
      : timeRange === "Last 90 Days"
      ? { signTime: "2.1 Days", signChange: "18% faster", rate: "76.0%", rateChange: "4.2%", pipeline: "₹38,50,000", quotes: "58" }
      : timeRange === "This Year"
      ? { signTime: "2.4 Days", signChange: "15% faster", rate: "74.8%", rateChange: "3.8%", pipeline: "₹85,00,000", quotes: "142" }
      : { signTime: "1.8 Days", signChange: "24% faster", rate: "78.5%", rateChange: "5.2%", pipeline: "₹14,50,000", quotes: "24" };

  return (
    <OrgLayout activePath="/reports">
      <div className="space-y-6 max-w-[1400px] mx-auto font-sans pb-16">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Reports & Analytics
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Quotation conversion rates and MOU signing velocity
            </p>
          </div>

          {/* Time Filter Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{timeRange}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-11 z-30 w-40 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 text-xs font-medium animate-in fade-in zoom-in-95 duration-100">
                {timeRanges.map((range) => (
                  <button
                    key={range}
                    onClick={() => {
                      setTimeRange(range);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 cursor-pointer ${
                      timeRange === range ? "text-blue-600 font-bold bg-blue-50/50" : "text-slate-700"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3 Top Metric Cards matching Image 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Average Sign Time */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4">
            <div className="w-13 h-13 rounded-full bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Average Sign Time</div>
              <div className="text-2xl font-bold text-slate-900 leading-tight mt-0.5">
                {metrics.signTime}
              </div>
              <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                <span>↓</span>
                <span>{metrics.signChange} than last month</span>
              </div>
            </div>
          </div>

          {/* Card 2: Quotation Acceptance Rate */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4">
            <div className="w-13 h-13 rounded-full bg-emerald-100/70 text-emerald-600 flex items-center justify-center shrink-0">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Quotation Acceptance Rate</div>
              <div className="text-2xl font-bold text-slate-900 leading-tight mt-0.5">
                {metrics.rate}
              </div>
              <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                <span>↑</span>
                <span>{metrics.rateChange} improvement</span>
              </div>
            </div>
          </div>

          {/* Card 3: Total Pipeline Value */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4">
            <div className="w-13 h-13 rounded-full bg-purple-100/70 text-purple-600 flex items-center justify-center shrink-0">
              {/* Stacked Disk/Database Icon matching Image 2 */}
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
              </svg>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Total Pipeline Value</div>
              <div className="text-2xl font-bold text-blue-600 leading-tight mt-0.5">
                {metrics.pipeline}
              </div>
              <div className="text-[11px] font-medium text-slate-400 mt-1">
                {metrics.quotes} Active Quotations
              </div>
            </div>
          </div>
        </div>

        {/* Middle Charts Grid: 2 Columns matching Image 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Chart Card: Quotation Status (Donut) */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Quotation Status</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Overview of all quotations</p>
            </div>

            <div className="py-6 flex flex-col sm:flex-row items-center justify-around gap-6">
              {/* SVG Donut Chart with Exact Matching Colors */}
              <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
                <svg className="w-44 h-44 -rotate-90" viewBox="0 0 100 100">
                  {/* Background Circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#f1f5f9"
                    strokeWidth="16"
                  />
                  {/* Accepted Segment: 75% -> strokeDasharray="179 239" */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#2563EB"
                    strokeWidth="16"
                    strokeDasharray="179 239"
                    strokeDashoffset="0"
                  />
                  {/* Pending Segment: 17% -> strokeDasharray="40 239" offset="-179" */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#10B981"
                    strokeWidth="16"
                    strokeDasharray="40 239"
                    strokeDashoffset="-179"
                  />
                  {/* Declined Segment: 8% -> strokeDasharray="20 239" offset="-219" */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#F59E0B"
                    strokeWidth="16"
                    strokeDasharray="20 239"
                    strokeDashoffset="-219"
                  />
                </svg>

                {/* Inner Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-900 tracking-tight">24</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Total
                  </span>
                </div>
              </div>

              {/* Legend matching Image 2 */}
              <div className="space-y-3 w-full sm:w-48 text-xs font-medium">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] shrink-0" />
                    <span className="text-slate-700">Accepted</span>
                  </div>
                  <span className="text-slate-500 font-semibold">18 (75%)</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0" />
                    <span className="text-slate-700">Pending</span>
                  </div>
                  <span className="text-slate-500 font-semibold">4 (17%)</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shrink-0" />
                    <span className="text-slate-700">Declined</span>
                  </div>
                  <span className="text-slate-500 font-semibold">2 (8%)</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] shrink-0" />
                    <span className="text-slate-700">Expired</span>
                  </div>
                  <span className="text-slate-500 font-semibold">0 (0%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Chart Card: Sign Time Trend (Line Chart) matching Image 2 */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Sign Time Trend</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Average time to sign quotations and MOUs
              </p>
            </div>

            <div className="py-4 relative">
              <svg className="w-full h-44 overflow-visible" viewBox="0 0 460 160">
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Y-Axis Gridlines & Labels */}
                {[
                  { val: "5", y: 20 },
                  { val: "4", y: 44 },
                  { val: "3", y: 68 },
                  { val: "2", y: 92 },
                  { val: "1", y: 116 },
                  { val: "0", y: 140 },
                ].map((g) => (
                  <g key={g.val}>
                    <text
                      x="16"
                      y={g.y + 4}
                      fill="#94a3b8"
                      fontSize="10"
                      textAnchor="end"
                      fontFamily="sans-serif"
                    >
                      {g.val}
                    </text>
                    <line
                      x1="28"
                      y1={g.y}
                      x2="450"
                      y2={g.y}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                    />
                  </g>
                ))}

                {/* Shaded Area Below Line */}
                <path
                  d="M 50 40 L 125 58 L 205 82 L 285 96 L 365 102 L 440 108 L 440 140 L 50 140 Z"
                  fill="url(#trendGradient)"
                />

                {/* Connected Trend Line */}
                <path
                  d="M 50 40 L 125 58 L 205 82 L 285 96 L 365 102 L 440 108"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points */}
                {[
                  { cx: 50, cy: 40 },
                  { cx: 125, cy: 58 },
                  { cx: 205, cy: 82 },
                  { cx: 285, cy: 96 },
                  { cx: 365, cy: 102 },
                  { cx: 440, cy: 108 },
                ].map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.cx}
                    cy={pt.cy}
                    r="4"
                    fill="#2563EB"
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="transition-transform hover:scale-125 cursor-pointer"
                  />
                ))}

                {/* X-Axis Labels */}
                {[
                  { label: "May", x: 50 },
                  { label: "Jun", x: 125 },
                  { label: "Jul", x: 205 },
                  { label: "Aug", x: 285 },
                  { label: "Sep", x: 365 },
                  { label: "Oct", x: 440 },
                ].map((m) => (
                  <text
                    key={m.label}
                    x={m.x}
                    y="158"
                    fill="#94a3b8"
                    fontSize="10"
                    textAnchor="middle"
                    fontFamily="sans-serif"
                  >
                    {m.label}
                  </text>
                ))}
              </svg>
            </div>
          </div>
        </div>

        {/* Bottom Card: Recent Activities matching Image 2 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recent Activities</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Latest quotation and MOU activities
              </p>
            </div>

            <Link
              href="/my-documents"
              className="px-3.5 py-1.5 text-xs font-semibold text-blue-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
            >
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-slate-900 font-bold">
                <tr>
                  <th className="py-3 px-3 w-8 text-slate-500">#</th>
                  <th className="py-3 px-4">Document Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Sign Time</th>
                  <th className="py-3 px-4">Created On</th>
                  <th className="py-3 px-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {ACTIVITIES.map((act) => {
                  const isMenuOpen = activeMenuId === act.id;
                  return (
                    <tr
                      key={act.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="py-3.5 px-3 text-slate-400 font-medium">{act.id}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {act.docName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-md font-medium text-xs ${
                            act.type === "Quotation"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-purple-50 text-purple-600"
                          }`}
                        >
                          {act.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {act.client}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-md font-semibold text-xs ${
                            act.status === "Accepted"
                              ? "bg-emerald-50 text-emerald-600"
                              : act.status === "Pending"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-rose-50 text-rose-600"
                          }`}
                        >
                          {act.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {act.signTime}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{act.createdOn}</td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="relative inline-block">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveMenuId(isMenuOpen ? null : act.id)
                            }
                            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {isMenuOpen && (
                            <div className="absolute right-0 top-8 z-30 w-36 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 text-xs font-medium animate-in fade-in zoom-in-95 duration-100">
                              <Link
                                href="/my-documents"
                                className="block px-3 py-1.5 hover:bg-slate-50 text-slate-700"
                              >
                                View Document
                              </Link>
                              <Link
                                href="/contacts"
                                className="block px-3 py-1.5 hover:bg-slate-50 text-slate-700"
                              >
                                View Client
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
        </div>
      </div>
    </OrgLayout>
  );
}
