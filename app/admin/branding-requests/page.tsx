"use client";
import React, { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Paintbrush, Check, X } from "lucide-react";

export default function AdminBrandingRequestsPage() {
  const [requests, setRequests] = useState([
    { id: "1", org: "Innovate India", domain: "innovate.com", submitted: "27 Oct 2026", status: "Pending Approval" },
    { id: "2", org: "CodeCraft Solutions", domain: "codecraft.com", submitted: "25 Oct 2026", status: "Approved" },
  ]);

  return (
    <AdminLayout activePath="/admin/branding-requests">
      <div className="space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Branding Requests</h1>
          <p className="text-sm text-slate-500 mt-0.5">Review and approve tenant letterheads, logos, and custom domain requests</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">Organization</th>
                <th className="py-3.5 px-5">Domain</th>
                <th className="py-3.5 px-5">Date Submitted</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-5 font-bold text-slate-900">{r.org}</td>
                  <td className="py-4 px-5 text-slate-500 font-mono text-xs">{r.domain}</td>
                  <td className="py-4 px-5 text-slate-400 text-xs">{r.submitted}</td>
                  <td className="py-4 px-5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      r.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button className="text-xs px-2.5 py-1 rounded bg-blue-600 text-white font-medium hover:bg-blue-700">
                      Review Assets
                    </button>
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
