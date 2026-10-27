"use client";
import React, { useState } from "react";
import OrgLayout from "@/components/OrgLayout";
import { Plus, Search, MoreVertical, X } from "lucide-react";

interface ContactItem {
  id: string;
  name: string;
  email: string;
  type: "Customer" | "Partner";
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<ContactItem[]>([
    { id: "c1", name: "Tech Solutions Pvt Ltd", email: "contact@techsolutions.com", type: "Customer" },
    { id: "c2", name: "Global Systems", email: "demo@globalsystems.com", type: "Partner" },
    { id: "c3", name: "NextGen Digital", email: "info@nextgen.com", type: "Customer" },
    { id: "c4", name: "Innovate India", email: "contact@innovate.com", type: "Partner" },
    { id: "c5", name: "Bright Future", email: "hello@brightfuture.com", type: "Customer" },
  ]);

  const [activeTab, setActiveTab] = useState<"All Contacts" | "Customers" | "Partners">("All Contacts");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", email: "", type: "Customer" as "Customer" | "Partner" });

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === "Customers") return c.type === "Customer";
    if (activeTab === "Partners") return c.type === "Partner";
    return true;
  });

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name || !newContact.email) return;
    setContacts([...contacts, { id: "c-" + Date.now(), ...newContact }]);
    setIsModalOpen(false);
    setNewContact({ name: "", email: "", type: "Customer" });
  };

  return (
    <OrgLayout activePath="/contacts">
      <div className="space-y-6 max-w-7xl mx-auto font-sans">
        {/* Header matching Screen 10 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Contacts</h1>
            <p className="text-xs text-slate-400 mt-0.5">Manage clients, signatories and partner contacts</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
        </div>

        {/* Filter Bar with Tabs and Search matching Screen 10 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            {(["All Contacts", "Customers", "Partners"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === tab
                    ? "bg-blue-600 text-white"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Contacts Table matching Screen 10 */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100 text-[10px]">
              <tr>
                <th className="py-3 px-5">Name</th>
                <th className="py-3 px-5">Email</th>
                <th className="py-3 px-5">Type</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-slate-900">{contact.name}</td>
                  <td className="py-3.5 px-5 text-slate-500">{contact.email}</td>
                  <td className="py-3.5 px-5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                        contact.type === "Customer"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-purple-50 text-purple-700 border border-purple-200"
                      }`}
                    >
                      {contact.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal: Add Contact */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Add New Contact</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddContact} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Full Name</label>
                  <input
                    type="text"
                    required
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-xs"
                    placeholder="e.g. Acme Tech Solutions"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-xs"
                    placeholder="e.g. contact@domain.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Type</label>
                  <select
                    value={newContact.type}
                    onChange={(e) => setNewContact({ ...newContact, type: e.target.value as any })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-xs text-slate-700"
                  >
                    <option value="Customer">Customer</option>
                    <option value="Partner">Partner</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3.5 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                  >
                    Save Contact
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </OrgLayout>
  );
}
