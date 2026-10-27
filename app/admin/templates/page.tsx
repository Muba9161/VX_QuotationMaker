"use client";
import React from "react";
import AdminLayout from "@/components/AdminLayout";
import { FileCheck, Plus, Copy } from "lucide-react";

export default function AdminTemplatesPage() {
  const templates = [
    { title: "Standard Goods Quotation", type: "Quotation", uses: 450, status: "Active" },
    { title: "Software Development Retainer", type: "Quotation", uses: 320, status: "Active" },
    { title: "Bilateral Partnership MOU", type: "MOU", uses: 180, status: "Active" },
    { title: "Mutual NDA & Confidentiality", type: "MOU", uses: 290, status: "Active" },
  ];

  return (
    <AdminLayout activePath="/admin/templates">
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Templates Master</h1>
            <p className="text-sm text-slate-500 mt-0.5">System-wide standard templates available to tenant organizations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {templates.map((t, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-3">
                  <FileCheck className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">{t.title}</h4>
                <p className="text-xs text-slate-400 mt-1">{t.type} &bull; {t.uses} times used</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-emerald-600 font-semibold">{t.status}</span>
                <span className="text-blue-600 font-medium cursor-pointer hover:underline">Preview</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
