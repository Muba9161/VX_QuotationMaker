"use client";
import React, { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Save, Check } from "lucide-react";
import { getSystemSettings, saveSystemSettings, SystemSettings } from "@/lib/adminStorage";

export default function AdminSystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(getSystemSettings());
  const [activeTab, setActiveTab] = useState("General");
  const [saved, setSaved] = useState(false);

  const tabs = ["General", "Email Settings", "Security", "Storage", "Audit Logs", "API Keys"];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSystemSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <AdminLayout activePath="/admin/system-settings">
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings</h1>
            <p className="text-sm text-slate-500 mt-0.5">Configure platform-wide settings and integrations</p>
          </div>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{saved ? "Saved Successfully" : "Save Changes"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="md:col-span-3 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4">{activeTab} Settings</h3>

            {activeTab === "General" ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Platform Name</label>
                  <input
                    type="text"
                    value={settings.platformName}
                    onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Support Email</label>
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max File Upload Size (MB)</label>
                  <input
                    type="number"
                    value={settings.maxUploadSizeMB}
                    onChange={(e) => setSettings({ ...settings, maxUploadSizeMB: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>

                <div className="pt-2 space-y-3">
                  <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <div>
                      <p className="text-sm font-medium text-slate-800">Allow Organization Registration</p>
                      <p className="text-xs text-slate-400">Let organizations register self-service</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.allowOrgRegistration}
                      onChange={(e) => setSettings({ ...settings, allowOrgRegistration: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <div>
                      <p className="text-sm font-medium text-slate-800">Email Notifications</p>
                      <p className="text-xs text-slate-400">Send email alerts on sign requests and completions</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <div>
                      <p className="text-sm font-medium text-slate-800">Maintenance Mode</p>
                      <p className="text-xs text-slate-400">Disable access for non-admin users</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                      className="w-4 h-4 text-rose-600 rounded"
                    />
                  </label>
                </div>
              </form>
            ) : (
              <div className="py-8 text-center text-slate-400 text-sm">
                Configuration options for {activeTab} will load here. Default values are active.
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
