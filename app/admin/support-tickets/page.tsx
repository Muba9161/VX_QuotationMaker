"use client";
import React, { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { getSupportTickets, updateSupportTicketStatus, SupportTicket } from "@/lib/adminStorage";

export default function AdminSupportTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>(getSupportTickets());
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = tickets.filter(t => statusFilter === "All" || t.status === statusFilter);

  const handleStatusChange = (id: string, s: SupportTicket['status']) => {
    updateSupportTicketStatus(id, s);
    setTickets(getSupportTickets());
  };

  return (
    <AdminLayout activePath="/admin/support-tickets">
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Support Tickets</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage user support requests and inquiries</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-xs"
            >
              <option value="All">All Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">#</th>
                <th className="py-3.5 px-5">Subject</th>
                <th className="py-3.5 px-5">Organization</th>
                <th className="py-3.5 px-5">Priority</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((t, i) => (
                <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-5 text-slate-400 font-medium">{i + 1}</td>
                  <td className="py-4 px-5 font-semibold text-slate-900">{t.subject}</td>
                  <td className="py-4 px-5 text-slate-600">{t.organization}</td>
                  <td className="py-4 px-5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      t.priority === 'High'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : t.priority === 'Medium'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      t.status === 'Resolved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : t.status === 'In Progress'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <select
                      value={t.status}
                      onChange={(e) => handleStatusChange(t.id, e.target.value as any)}
                      className="text-xs px-2 py-1 rounded border border-slate-200 bg-white"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
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
