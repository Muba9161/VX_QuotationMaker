"use client";
import React from "react";
import OrgLayout from "@/components/OrgLayout";
import { BarChart3, TrendingUp } from "lucide-react";

export default function OrgReportsPage() {
  return (
    <OrgLayout activePath="/reports">
      <div className="space-y-6 max-w-7xl mx-auto font-sans">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Reports & Analytics</h1>
          <p className="text-xs text-slate-400 mt-0.5">Quotation conversion rates and MOU signing velocity</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
            <span className="text-xs text-slate-400 font-medium">Average Sign Time</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">1.8 Days</div>
            <span className="text-[11px] text-emerald-600 font-semibold">↑ 24% faster than last month</span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
            <span className="text-xs text-slate-400 font-medium">Quotation Acceptance Rate</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">78.5%</div>
            <span className="text-[11px] text-emerald-600 font-semibold">↑ 5.2% improvement</span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
            <span className="text-xs text-slate-400 font-medium">Total Pipeline Value</span>
            <div className="text-2xl font-bold text-blue-600 mt-1">₹14,50,000</div>
            <span className="text-[11px] text-slate-400">24 Active Quotations</span>
          </div>
        </div>
      </div>
    </OrgLayout>
  );
}
