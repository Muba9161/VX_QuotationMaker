"use client";
import React, { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Search, ChevronDown } from "lucide-react";
import { getSupportTickets, SupportTicket } from "@/lib/adminStorage";

export default function AdminSupportTicketsPage() {
  const [tickets] = useState<SupportTicket[]>(getSupportTickets());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch = t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.organization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All Status" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout activePath="/admin/support-tickets">
      <div className="space-y-6 max-w-7xl mx-auto font-sans">
        {/* Header matching Image 3 */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Support Tickets</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage user support requests</p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="relative w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none w-full sm:w-auto px-3.5 py-1.5 pr-8 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="All Status">All Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100 text-[10px]">
              <tr>
                <th className="py-3.5 px-5">#</th>
                <th className="py-3.5 px-5">Subject</th>
                <th className="py-3.5 px-5">Organization</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredTickets.map((ticket, index) => (
                <tr key={ticket.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-5 text-slate-400">{index + 1}</td>
                  <td className="py-4 px-5 font-bold text-slate-900">{ticket.subject}</td>
                  <td className="py-4 px-5 text-slate-600">{ticket.organization}</td>
                  <td className="py-4 px-5">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        ticket.status === "Open"
                          ? "bg-rose-50 text-rose-600 border-rose-200"
                          : ticket.status === "In Progress"
                          ? "bg-blue-50 text-blue-600 border-blue-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${
                        ticket.priority === "High"
                          ? "bg-rose-50 text-rose-600"
                          : ticket.priority === "Medium"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      {ticket.priority}
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
