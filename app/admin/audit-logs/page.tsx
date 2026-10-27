"use client";
import React, { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Calendar, ChevronDown } from "lucide-react";
import { getAuditLogs, PlatformAuditLog } from "@/lib/adminStorage";

export default function AdminAuditLogsPage() {
  const [logs] = useState<PlatformAuditLog[]>(getAuditLogs());
  const [actionFilter, setActionFilter] = useState("All Actions");

  const filteredLogs = logs.filter((log) => {
    if (actionFilter === "All Actions") return true;
    return log.action === actionFilter;
  });

  return (
    <AdminLayout activePath="/admin/audit-logs">
      <div className="space-y-6 max-w-7xl mx-auto font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Audit Logs</h1>
            <p className="text-xs text-slate-400 mt-0.5">Track important platform activities</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="appearance-none px-3.5 py-1.5 pr-8 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                <option value="All Actions">All Actions</option>
                <option value="Created Organization">Created Organization</option>
                <option value="Updated Plan">Updated Plan</option>
                <option value="Suspended Organization">Suspended Organization</option>
                <option value="Deleted Key">Deleted Key</option>
                <option value="Login Success">Login Success</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs select-none">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>01 Oct 2026 - 31 Oct 2026</span>
            </div>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100 text-[10px]">
              <tr>
                <th className="py-3.5 px-5">#</th>
                <th className="py-3.5 px-5">User</th>
                <th className="py-3.5 px-5">Action</th>
                <th className="py-3.5 px-5">Details</th>
                <th className="py-3.5 px-5">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredLogs.map((log, index) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-5 text-slate-400">{index + 1}</td>
                  <td className="py-4 px-5 font-bold text-slate-900">{log.user}</td>
                  <td className="py-4 px-5 text-slate-700 font-medium">{log.action}</td>
                  <td className="py-4 px-5 text-slate-500">{log.details}</td>
                  <td className="py-4 px-5 text-slate-400">{log.dateTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
