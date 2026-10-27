"use client";
import React, { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { getSystemSettings, saveSystemSettings, SystemSettings } from "@/lib/adminStorage";

export default function AdminSystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(getSystemSettings());
  const [saved, setSaved] = useState(false);

  const handleToggle = (key: keyof SystemSettings) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    saveSystemSettings(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChange = (key: keyof SystemSettings, val: any) => {
    const updated = { ...settings, [key]: val };
    setSettings(updated);
    saveSystemSettings(updated);
  };

  return (
    <AdminLayout activePath="/admin/system-settings">
      <div className="space-y-6 max-w-2xl mx-auto font-sans">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings</h1>
            <p className="text-xs text-slate-400 mt-0.5">Configure global platform settings</p>
          </div>
          {saved && (
            <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 animate-in fade-in">
              Changes Saved!
            </span>
          )}
        </div>

        {/* General Settings Card matching Image 4 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            General Settings
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Platform Name
              </label>
              <input
                type="text"
                value={settings.platformName}
                onChange={(e) => handleChange("platformName", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Support Email
              </label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => handleChange("supportEmail", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Max File Upload Size (MB)
              </label>
              <input
                type="number"
                value={settings.maxUploadSizeMb}
                onChange={(e) => handleChange("maxUploadSizeMb", Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
              />
            </div>

            {/* Toggle 1: Allow Organization Registration */}
            <div className="pt-2 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-800">Allow Organization Registration</p>
                <p className="text-[11px] text-slate-400">Allow new tenants to sign up directly</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle("allowRegistration")}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                  settings.allowRegistration ? "bg-blue-600 justify-end" : "bg-slate-200 justify-start"
                }`}
              >
                <span className="w-4 h-4 bg-white rounded-full shadow-md"></span>
              </button>
            </div>

            {/* Toggle 2: Email Notifications */}
            <div className="pt-2 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-800">Email Notifications</p>
                <p className="text-[11px] text-slate-400">Send system email alerts and updates</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle("emailNotifications")}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                  settings.emailNotifications ? "bg-blue-600 justify-end" : "bg-slate-200 justify-start"
                }`}
              >
                <span className="w-4 h-4 bg-white rounded-full shadow-md"></span>
              </button>
            </div>

            {/* Toggle 3: Maintenance Mode */}
            <div className="pt-2 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-800">Maintenance Mode</p>
                <p className="text-[11px] text-slate-400">Temporarily restrict tenant access</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle("maintenanceMode")}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                  settings.maintenanceMode ? "bg-blue-600 justify-end" : "bg-slate-200 justify-start"
                }`}
              >
                <span className="w-4 h-4 bg-white rounded-full shadow-md"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
