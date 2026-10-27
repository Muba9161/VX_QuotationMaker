"use client";
import React from "react";
import OrgLayout from "@/components/OrgLayout";
import { Contact, Plus } from "lucide-react";

export default function OrgContactsPage() {
  const contacts = [
    { name: "Tech Solutions Pvt Ltd", person: "John Doe", email: "john@techsolutions.com", phone: "+91 9876543210", address: "A-123, Sector 62, Noida" },
    { name: "Global Systems", person: "Rajesh Gupta", email: "rajesh@globalsystems.com", phone: "+91 9811223344", address: "Whitefield, Bengaluru" },
    { name: "NextGen Digital", person: "Alok Nath", email: "alok@nextgen.com", phone: "+91 9988776655", address: "Cyber City, Gurugram" },
  ];

  return (
    <OrgLayout activePath="/contacts">
      <div className="space-y-6 max-w-7xl mx-auto font-sans">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Contacts Directory</h1>
            <p className="text-xs text-slate-400 mt-0.5">Frequently used customer and partner accounts</p>
          </div>
          <button className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold">
            + Add Contact
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b">
              <tr>
                <th className="py-3 px-5">Organization</th>
                <th className="py-3 px-5">Contact Person</th>
                <th className="py-3 px-5">Email</th>
                <th className="py-3 px-5">Phone</th>
                <th className="py-3 px-5">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {contacts.map((c, i) => (
                <tr key={i} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-5 font-bold text-slate-900">{c.name}</td>
                  <td className="py-3.5 px-5 font-medium">{c.person}</td>
                  <td className="py-3.5 px-5 text-slate-500">{c.email}</td>
                  <td className="py-3.5 px-5 text-slate-500">{c.phone}</td>
                  <td className="py-3.5 px-5 text-slate-400">{c.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </OrgLayout>
  );
}
