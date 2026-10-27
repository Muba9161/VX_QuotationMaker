"use client";
import React, { useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";
import {
  Search,
  Plus,
  MoreVertical,
  Building2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
  Check,
  X
} from "lucide-react";
import { getOrganizations, saveOrganization, PlatformOrg } from "@/lib/adminStorage";

export default function AdminOrganizationsPage() {
  const [orgs, setOrgs] = useState<PlatformOrg[]>(getOrganizations());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Org Form State
  const [newOrg, setNewOrg] = useState({
    name: "",
    displayName: "",
    domain: "",
    email: "",
    phone: "",
    plan: "Pro" as "Basic" | "Pro" | "Enterprise",
  });

  const filteredOrgs = orgs.filter((org) => {
    const matchesSearch =
      org.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = selectedPlan === "All" || org.plan === selectedPlan;
    const matchesStatus = selectedStatus === "All" || org.status === selectedStatus;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrg.displayName || !newOrg.domain) return;
    const created: PlatformOrg = {
      id: "org-" + Date.now(),
      name: newOrg.displayName.toLowerCase().replace(/\s+/g, ""),
      displayName: newOrg.displayName,
      domain: newOrg.domain,
      plan: newOrg.plan,
      usersCount: 1,
      maxUsers: newOrg.plan === "Enterprise" ? 200 : newOrg.plan === "Pro" ? 50 : 5,
      documentsCount: 0,
      maxDocuments: newOrg.plan === "Enterprise" ? 999999 : newOrg.plan === "Pro" ? 5000 : 200,
      status: "Active",
      joinedOn: "Today",
      validTill: "28 Oct 2027",
      email: newOrg.email || `contact@${newOrg.domain}`,
      phone: newOrg.phone || "+91 9800000000",
      address: "India",
      storageLimit: newOrg.plan === "Enterprise" ? "50 GB" : newOrg.plan === "Pro" ? "10 GB" : "1 GB",
      logoUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${newOrg.displayName}`,
    };
    saveOrganization(created);
    setOrgs(getOrganizations());
    setIsModalOpen(false);
    setNewOrg({ name: "", displayName: "", domain: "", email: "", phone: "", plan: "Pro" });
  };

  const toggleStatus = (id: string) => {
    const org = orgs.find(o => o.id === id);
    if (!org) return;
    const updated = { ...org, status: org.status === "Active" ? "Suspended" : "Active" } as PlatformOrg;
    saveOrganization(updated);
    setOrgs(getOrganizations());
  };

  return (
    <AdminLayout activePath="/admin/organizations">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Organizations</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage all registered organizations</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Organization</span>
          </button>
        </div>

        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, domain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All">All Plans</option>
              <option value="Basic">Basic</option>
              <option value="Pro">Pro</option>
              <option value="Enterprise">Enterprise</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Organizations Table */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-5">#</th>
                  <th className="py-3.5 px-5">Logo</th>
                  <th className="py-3.5 px-5">Organisation Name</th>
                  <th className="py-3.5 px-5">Domain</th>
                  <th className="py-3.5 px-5">Plan</th>
                  <th className="py-3.5 px-5">Users</th>
                  <th className="py-3.5 px-5">Documents</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredOrgs.map((org, index) => (
                  <tr key={org.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-5 text-slate-400 font-medium">{index + 1}</td>
                    <td className="py-4 px-5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center overflow-hidden">
                        {org.logoUrl ? (
                          <img src={org.logoUrl} alt={org.displayName} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <Link
                        href={`/admin/organizations/${org.id}`}
                        className="font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                      >
                        {org.displayName}
                      </Link>
                    </td>
                    <td className="py-4 px-5 text-slate-500 text-xs font-mono">{org.domain}</td>
                    <td className="py-4 px-5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        org.plan === 'Enterprise'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : org.plan === 'Pro'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {org.plan}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-medium">{org.usersCount}</td>
                    <td className="py-4 px-5 font-medium">{org.documentsCount}</td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        org.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${org.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        {org.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => toggleStatus(org.id)}
                          className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-colors ${
                            org.status === 'Active'
                              ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                              : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {org.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>
                        <Link
                          href={`/admin/organizations/${org.id}`}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Showing 1-{filteredOrgs.length} of {orgs.length}</span>
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-7 h-7 rounded bg-blue-600 text-white font-medium">1</button>
              <button className="w-7 h-7 rounded hover:bg-slate-50 font-medium">2</button>
              <button className="w-7 h-7 rounded hover:bg-slate-50 font-medium">3</button>
              <span>...</span>
              <button className="w-7 h-7 rounded hover:bg-slate-50 font-medium">5</button>
              <button className="p-1.5 rounded border border-slate-200 hover:bg-slate-50">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal: Add Organization */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Add New Organization</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateOrg} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Organization Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Technologies Pvt Ltd"
                    value={newOrg.displayName}
                    onChange={(e) => setNewOrg({ ...newOrg, displayName: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Domain *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. acme.com"
                    value={newOrg.domain}
                    onChange={(e) => setNewOrg({ ...newOrg, domain: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email</label>
                    <input
                      type="email"
                      placeholder="contact@acme.com"
                      value={newOrg.email}
                      onChange={(e) => setNewOrg({ ...newOrg, email: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Subscription Plan</label>
                    <select
                      value={newOrg.plan}
                      onChange={(e) => setNewOrg({ ...newOrg, plan: e.target.value as any })}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="Basic">Basic (Free)</option>
                      <option value="Pro">Pro (₹2,599/mo)</option>
                      <option value="Enterprise">Enterprise (₹9,999/mo)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm"
                  >
                    Create Organization
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
