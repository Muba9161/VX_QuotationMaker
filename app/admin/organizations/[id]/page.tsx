"use client";
import React, { useState, use, Suspense } from "react";
import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";
import {
  ArrowLeft,
  Building2,
  Edit3,
  PauseCircle,
  PlayCircle,
  FileText,
  Users,
  CreditCard,
  KeyRound,
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { getOrganizationById, saveOrganization, PlatformOrg } from "@/lib/adminStorage";

function OrgDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orgId = resolvedParams.id;
  const initialOrg = getOrganizationById(orgId) || {
    id: orgId,
    name: "acme",
    displayName: "Acme Technologies Pvt Ltd",
    domain: "acme.com",
    plan: "Pro" as const,
    usersCount: 12,
    maxUsers: 50,
    documentsCount: 145,
    maxDocuments: 5000,
    status: "Active" as const,
    joinedOn: "28 Oct 2026",
    validTill: "28 Oct 2027",
    tagline: "Innovating for a Better Tomorrow",
    email: "contact@acme.com",
    phone: "+91 9876543210",
    address: "A-123, Sector 62, Noida, UP 201301",
    storageLimit: "10 GB",
  };

  const [org, setOrg] = useState<PlatformOrg>(initialOrg);
  const [activeTab, setActiveTab] = useState("Overview");

  const tabs = ["Overview", "Members", "Branding", "Templates", "Documents", "Settings", "Billing"];

  const toggleStatus = () => {
    const updated = {
      ...org,
      status: org.status === "Active" ? "Suspended" : "Active",
    } as PlatformOrg;
    saveOrganization(updated);
    setOrg(updated);
  };

  return (
    <AdminLayout activePath="/admin/organizations">
      <div className="space-y-6 max-w-7xl mx-auto">
        <Link
          href="/admin/organizations"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Organizations</span>
        </Link>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl overflow-hidden shadow-xs">
              <span className="text-blue-700 tracking-wider">ACME</span>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-900">{org.displayName}</h1>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  org.status === 'Active'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${org.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                  {org.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{org.tagline || "Enterprise Quotations & Digital Signatures"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit</span>
            </button>
            <button
              onClick={toggleStatus}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                org.status === 'Active'
                  ? 'border border-rose-200 text-rose-600 hover:bg-rose-50'
                  : 'border border-emerald-200 text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              {org.status === 'Active' ? (
                <>
                  <PauseCircle className="w-3.5 h-3.5" />
                  <span>Suspend</span>
                </>
              ) : (
                <>
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>Activate</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-semibold transition-colors relative ${
                activeTab === tab
                  ? "text-blue-600"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>{tab}</span>
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"></span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "Overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Organization Information</h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <label className="text-xs text-slate-400 font-medium block">Organization Name</label>
                    <p className="font-semibold text-slate-800 mt-0.5">{org.displayName}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium block">Tagline</label>
                    <p className="text-slate-700 mt-0.5">{org.tagline || "Innovating for a Better Tomorrow"}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium block">Website</label>
                    <a href={`https://${org.domain}`} target="_blank" className="text-blue-600 hover:underline mt-0.5 inline-block">
                      https://www.{org.domain}
                    </a>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="text-xs text-slate-400 font-medium block">Email</label>
                      <p className="text-slate-800 font-medium mt-0.5">{org.email}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-medium block">Phone</label>
                      <p className="text-slate-800 font-medium mt-0.5">{org.phone}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium block">Address</label>
                    <p className="text-slate-700 mt-0.5">{org.address}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Logo & Letterhead</h3>
                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-24 h-24 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center p-2">
                    <div className="text-center">
                      <div className="text-blue-600 font-black text-2xl tracking-tighter">▲</div>
                      <div className="text-xs font-black tracking-widest text-slate-800">ACME</div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-semibold text-slate-800">Official Brand Letterhead Configured</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Auto-applied on all issued Quotations, MOUs and digital verification certificates.
                    </p>
                    <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs inline-flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>View Letterhead</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Plan Details</h3>
                <div className="space-y-3.5 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500">Current Plan</span>
                    <span className="font-bold text-blue-600 text-sm">{org.plan}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500">Valid Till</span>
                    <span className="font-medium text-slate-800">{org.validTill}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500">Max Users</span>
                    <span className="font-medium text-slate-800">{org.maxUsers}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500">Storage Limit</span>
                    <span className="font-medium text-slate-800">{org.storageLimit}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-500">Documents This Month</span>
                    <span className="font-bold text-slate-900">{org.documentsCount} / {org.maxDocuments}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200/80 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      Manage Members
                    </span>
                    <span className="text-slate-400">12</span>
                  </button>
                  <button className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200/80 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      View Documents
                    </span>
                    <span className="text-slate-400">145</span>
                  </button>
                  <button className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200/80 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                    <span className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-purple-600" />
                      Change Plan
                    </span>
                    <span className="text-blue-600">Upgrade</span>
                  </button>
                  <button className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200/80 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                    <span className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-amber-600" />
                      Reset Password
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default function AdminOrgDetailPage(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading organization details...</div>}>
      <OrgDetailContent params={props.params} />
    </Suspense>
  );
}
