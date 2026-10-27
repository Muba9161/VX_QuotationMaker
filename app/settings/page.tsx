"use client";
import React, { useState } from "react";
import OrgLayout from "@/components/OrgLayout";
import { Save, Check } from "lucide-react";
import { getOrgBranding, saveOrgBranding, OrgBranding } from "@/lib/orgStorage";

export default function OrgSettingsPage() {
  const [branding, setBranding] = useState<OrgBranding>(getOrgBranding());
  const [activeTab, setActiveTab] = useState("General");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveOrgBranding(branding);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <OrgLayout activePath="/settings">
      <div className="space-y-6 max-w-4xl mx-auto font-sans">
        {/* Header matching Screen 10 */}
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Organization Settings</h1>
          <p className="text-xs text-slate-400 mt-0.5">Configure your workspace settings</p>
        </div>

        {/* Tabs: General | Document Settings | Notifications */}
        <div className="flex items-center gap-6 border-b border-slate-200 text-xs font-semibold">
          {["General", "Document Settings", "Notifications"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`pb-2.5 transition-colors relative ${
                activeTab === t ? "text-blue-600" : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <span>{t}</span>
              {activeTab === t && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"></span>
              )}
            </button>
          ))}
        </div>

        {/* Content Box matching Screen 10 */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200/80 shadow-xs">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Organization Email</label>
              <input
                type="email"
                value={branding.email}
                onChange={(e) => setBranding({ ...branding, email: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                value={branding.phone}
                onChange={(e) => setBranding({ ...branding, phone: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Address</label>
              <input
                type="text"
                value={branding.address}
                onChange={(e) => setBranding({ ...branding, address: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="pt-2 space-y-3">
              <label className="flex items-center justify-between cursor-pointer py-1">
                <span className="text-xs text-slate-700 font-medium">Allow member registration</span>
                <input
                  type="checkbox"
                  checked={branding.allowRegistration}
                  onChange={(e) => setBranding({ ...branding, allowRegistration: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1">
                <span className="text-xs text-slate-700 font-medium">Require admin approval</span>
                <input
                  type="checkbox"
                  checked={branding.requireApproval}
                  onChange={(e) => setBranding({ ...branding, requireApproval: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </label>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Default document expiry (days)</label>
                <input
                  type="number"
                  value={branding.defaultExpiryDays}
                  onChange={(e) => setBranding({ ...branding, defaultExpiryDays: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                {saved ? "Saved Changes" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </OrgLayout>
  );
}
