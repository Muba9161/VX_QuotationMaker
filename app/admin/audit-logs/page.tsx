"use client";
import React, { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Calendar } from "lucide-react";
import { getAuditLogs, PlatformAuditLog } from "@/lib/adminStorage";

export default function AdminAuditLogsPage() {
  const [logs] = useState<PlatformAuditLog[]>(getAuditLogs());
  const [actionFilter, setActionFilter] = useState("All");

  const filtered = logs.filter(l => actionFilter === "All" || l.action.toLowerCase().includes(actionFilter.toLowerCase()));

  return (
    <AdminLayout activePath="/admin/audit-logs">
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Audit Logs</h1>
            <p className="text-sm text-slate-500 mt-0.5">Track important platform activities and security events</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-xs"
            >
              <option value="All">All Actions</option>
              <option value="Organization">Organizations</option>
              <option value="Plan">Plan Updates</option>
              <option value="Login">Logins</option>
            </select>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-600 shadow-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>01 Oct 2026 - 31 Oct 2026</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">#</th>
                <th className="py-3.5 px-5">User</th>
                <th className="py-3.5 px-5">Action</th>
                <th className="py-3.5 px-5">Details</th>
                <th className="py-3.5 px-5">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((l, i) => (
                <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-5 text-slate-400 font-medium">{i + 1}</td>
                  <td className="py-4 px-5 font-semibold text-slate-900">{l.user}</td>
                  <td className="py-4 px-5">
                    <span className="font-medium text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md text-xs border border-blue-100">
                      {l.action}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-slate-600">{l.details}</td>
                  <td className="py-4 px-5 text-slate-400 font-mono text-xs">{l.dateTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
