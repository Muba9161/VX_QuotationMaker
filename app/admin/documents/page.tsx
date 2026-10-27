"use client";
import React, { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { FileText, Search, Eye, Filter } from "lucide-react";

export default function AdminDocumentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const docs = [
    { id: "1", number: "Q-001", org: "Acme Technologies Pvt Ltd", title: "Website Development", type: "Quotation", amount: "₹35,400", status: "Sent", date: "28 Oct 2026" },
    { id: "2", number: "MOU-001", org: "Global Systems", title: "Partnership Agreement", type: "MOU", amount: "—", status: "Signed", date: "26 Oct 2026" },
    { id: "3", number: "Q-002", org: "NextGen Digital", title: "IT Support Services", type: "Quotation", amount: "₹86,000", status: "Pending", date: "25 Oct 2026" },
    { id: "4", number: "MOU-002", org: "Innovate India", title: "Strategic Collaboration", type: "MOU", amount: "—", status: "Draft", date: "24 Oct 2026" },
    { id: "5", number: "Q-003", org: "CodeCraft Solutions", title: "Mobile App Development", type: "Quotation", amount: "₹1,45,000", status: "Signed", date: "22 Oct 2026" },
  ];

  return (
    <AdminLayout activePath="/admin/documents">
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Documents</h1>
            <p className="text-sm text-slate-500 mt-0.5">Global audit and monitoring of all issued Quotations and MOUs</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">#</th>
                <th className="py-3.5 px-5">Organization</th>
                <th className="py-3.5 px-5">Document Title</th>
                <th className="py-3.5 px-5">Type</th>
                <th className="py-3.5 px-5">Value</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {docs.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-5 text-slate-400 font-mono text-xs">{d.number}</td>
                  <td className="py-4 px-5 font-semibold text-slate-900">{d.org}</td>
                  <td className="py-4 px-5 text-slate-600">{d.title}</td>
                  <td className="py-4 px-5">
                    <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {d.type}
                    </span>
                  </td>
                  <td className="py-4 px-5 font-bold text-slate-900">{d.amount}</td>
                  <td className="py-4 px-5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      d.status === 'Signed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : d.status === 'Sent'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-slate-500 text-xs">{d.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
