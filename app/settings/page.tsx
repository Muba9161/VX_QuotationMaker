"use client";

import React, { useState, useEffect } from "react";
import OrgLayout from "@/components/OrgLayout";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
  CheckCircle2,
  Settings as SettingsIcon,
  Check,
  FileText,
  Bell,
  Percent,
  DollarSign,
  Shield,
} from "lucide-react";
import { getOrgBranding, saveOrgBranding, OrgBranding } from "@/lib/orgStorage";

export default function OrgSettingsPage() {
  const [branding, setBranding] = useState<OrgBranding>(() => getOrgBranding());
  const [activeTab, setActiveTab] = useState<"General" | "Document Settings" | "Notifications">(
    "General"
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Additional document preferences state
  const [docPrefs, setDocPrefs] = useState({
    defaultTaxRate: 18,
    currency: "INR (₹)",
    paymentTerms: "50% advance, 50% on milestone delivery",
    notes: "Thank you for your business. Valid for 30 days.",
    enableWatermark: false,
    autoReminders: true,
  });

  // Notification toggles
  const [notifPrefs, setNotifPrefs] = useState({
    docViewed: true,
    docSigned: true,
    docExpired: true,
    memberJoined: false,
  });

  useEffect(() => {
    const loaded = getOrgBranding();
    if (loaded) {
      setBranding(loaded);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    saveOrgBranding(branding);
    showToast("Settings updated successfully!");
  };

  return (
    <OrgLayout activePath="/settings">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="space-y-6 max-w-[1400px] mx-auto font-sans pb-16">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Organization Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure your workspace settings and preferences.
          </p>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-8 border-b border-slate-200 text-sm font-semibold">
          {(["General", "Document Settings", "Notifications"] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 transition-colors relative cursor-pointer ${
                  isActive ? "text-blue-600" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <span>{tab}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Main Content Box matching Image 2 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
          {activeTab === "General" && (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Form Column (7-8 cols) */}
                <div className="lg:col-span-8 space-y-5">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Organization Details
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Manage your organization information and preferences.
                    </p>
                  </div>

                  {/* Organization Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Organization Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-slate-400 pointer-events-none">
                        <Mail className="w-4 h-4 text-slate-400" />
                      </span>
                      <input
                        type="email"
                        required
                        value={branding.email}
                        onChange={(e) => setBranding({ ...branding, email: e.target.value })}
                        placeholder="contact@acme.com"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Phone
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-slate-400 pointer-events-none">
                        <Phone className="w-4 h-4 text-slate-400" />
                      </span>
                      <input
                        type="text"
                        value={branding.phone}
                        onChange={(e) => setBranding({ ...branding, phone: e.target.value })}
                        placeholder="+91 9876543210"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Address
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-slate-400 pointer-events-none">
                        <MapPin className="w-4 h-4 text-slate-400" />
                      </span>
                      <textarea
                        rows={3}
                        value={branding.address}
                        onChange={(e) => setBranding({ ...branding, address: e.target.value })}
                        placeholder="A-123, Sector 62, Noida, U.P. 201301"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium resize-none leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Checkbox 1: Allow member registration */}
                  <div className="pt-1">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <div
                        onClick={() =>
                          setBranding({
                            ...branding,
                            allowRegistration: !branding.allowRegistration,
                          })
                        }
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors shrink-0 mt-0.5 cursor-pointer ${
                          branding.allowRegistration
                            ? "bg-blue-600 text-white"
                            : "border-2 border-slate-300 bg-white"
                        }`}
                      >
                        {branding.allowRegistration && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-800">
                          Allow member registration
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Allow new users to register and join your organization.
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Checkbox 2: Require admin approval */}
                  <div>
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <div
                        onClick={() =>
                          setBranding({
                            ...branding,
                            requireApproval: !branding.requireApproval,
                          })
                        }
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors shrink-0 mt-0.5 cursor-pointer ${
                          branding.requireApproval
                            ? "bg-blue-600 text-white"
                            : "border-2 border-slate-300 bg-white"
                        }`}
                      >
                        {branding.requireApproval && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-800">
                          Require admin approval
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          New members will require admin approval to join.
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Default document expiry */}
                  <div className="pt-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Default document expiry (days)
                    </label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="relative w-44">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                          <Calendar className="w-4 h-4 text-slate-400" />
                        </span>
                        <input
                          type="number"
                          min={1}
                          max={365}
                          value={branding.defaultExpiryDays}
                          onChange={(e) =>
                            setBranding({
                              ...branding,
                              defaultExpiryDays: Number(e.target.value) || 30,
                            })
                          }
                          className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Set default expiry period for quotations, MOUs and other documents.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Illustration Column (4 cols) matching Image 2 */}
                <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-6 sm:p-8 rounded-2xl bg-blue-50/30 border border-blue-100/60 mt-4 lg:mt-0">
                  {/* Triple Gear Illustration */}
                  <div className="w-32 h-32 rounded-full bg-blue-100/40 flex items-center justify-center relative mb-2">
                    {/* Main Blue Gear */}
                    <svg
                      className="w-16 h-16 text-blue-600 animate-[spin_20s_linear_infinite]"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 15.5C10.07 15.5 8.5 13.93 8.5 12C8.5 10.07 10.07 8.5 12 8.5C13.93 8.5 15.5 10.07 15.5 12C15.5 13.93 13.93 15.5 12 15.5ZM19.43 12.97C19.47 12.65 19.5 12.33 19.5 12C19.5 11.67 19.47 11.34 19.43 11.03L21.54 9.37C21.73 9.22 21.78 8.95 21.66 8.73L19.66 5.27C19.54 5.05 19.27 4.97 19.05 5.05L16.56 6.05C16.04 5.65 15.48 5.32 14.87 5.07L14.49 2.42C14.46 2.18 14.25 2 14 2H10C9.75 2 9.54 2.18 9.51 2.42L9.13 5.07C8.52 5.32 7.96 5.66 7.44 6.05L4.95 5.05C4.73 4.96 4.46 5.05 4.34 5.27L2.34 8.73C2.21 8.95 2.27 9.22 2.46 9.37L4.57 11.03C4.53 11.34 4.5 11.67 4.5 12C4.5 12.33 4.53 12.65 4.57 12.97L2.46 14.63C2.27 14.78 2.21 15.05 2.34 15.27L4.34 18.73C4.46 18.95 4.73 19.03 4.95 18.95L7.44 17.95C7.96 18.35 8.52 18.68 9.13 18.93L9.51 21.58C9.54 21.82 9.75 22 10 22H14C14.25 22 14.46 21.82 14.49 21.58L14.87 18.93C15.48 18.68 16.04 18.34 16.56 17.95L19.05 18.95C19.27 19.04 19.54 18.95 19.66 18.73L21.66 15.27C21.78 15.05 21.73 14.78 21.54 14.63L19.43 12.97Z" />
                    </svg>

                    {/* Secondary Accent Gear */}
                    <svg
                      className="w-9 h-9 text-blue-400 absolute top-2 right-2 animate-[spin_15s_linear_infinite_reverse]"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 15.5C10.07 15.5 8.5 13.93 8.5 12C8.5 10.07 10.07 8.5 12 8.5C13.93 8.5 15.5 10.07 15.5 12C15.5 13.93 13.93 15.5 12 15.5ZM19.43 12.97C19.47 12.65 19.5 12.33 19.5 12C19.5 11.67 19.47 11.34 19.43 11.03L21.54 9.37C21.73 9.22 21.78 8.95 21.66 8.73L19.66 5.27C19.54 5.05 19.27 4.97 19.05 5.05L16.56 6.05C16.04 5.65 15.48 5.32 14.87 5.07L14.49 2.42C14.46 2.18 14.25 2 14 2H10C9.75 2 9.54 2.18 9.51 2.42L9.13 5.07C8.52 5.32 7.96 5.66 7.44 6.05L4.95 5.05C4.73 4.96 4.46 5.05 4.34 5.27L2.34 8.73C2.21 8.95 2.27 9.22 2.46 9.37L4.57 11.03C4.53 11.34 4.5 11.67 4.5 12C4.5 12.33 4.53 12.65 4.57 12.97L2.46 14.63C2.27 14.78 2.21 15.05 2.34 15.27L4.34 18.73C4.46 18.95 4.73 19.03 4.95 18.95L7.44 17.95C7.96 18.35 8.52 18.68 9.13 18.93L9.51 21.58C9.54 21.82 9.75 22 10 22H14C14.25 22 14.46 21.82 14.49 21.58L14.87 18.93C15.48 18.68 16.04 18.34 16.56 17.95L19.05 18.95C19.27 19.04 19.54 18.95 19.66 18.73L21.66 15.27C21.78 15.05 21.73 14.78 21.54 14.63L19.43 12.97Z" />
                    </svg>

                    {/* Smaller Light Blue Gear */}
                    <svg
                      className="w-6 h-6 text-blue-300 absolute bottom-3 right-5 animate-[spin_12s_linear_infinite]"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 15.5C10.07 15.5 8.5 13.93 8.5 12C8.5 10.07 10.07 8.5 12 8.5C13.93 8.5 15.5 10.07 15.5 12C15.5 13.93 13.93 15.5 12 15.5ZM19.43 12.97C19.47 12.65 19.5 12.33 19.5 12C19.5 11.67 19.47 11.34 19.43 11.03L21.54 9.37C21.73 9.22 21.78 8.95 21.66 8.73L19.66 5.27C19.54 5.05 19.27 4.97 19.05 5.05L16.56 6.05C16.04 5.65 15.48 5.32 14.87 5.07L14.49 2.42C14.46 2.18 14.25 2 14 2H10C9.75 2 9.54 2.18 9.51 2.42L9.13 5.07C8.52 5.32 7.96 5.66 7.44 6.05L4.95 5.05C4.73 4.96 4.46 5.05 4.34 5.27L2.34 8.73C2.21 8.95 2.27 9.22 2.46 9.37L4.57 11.03C4.53 11.34 4.5 11.67 4.5 12C4.5 12.33 4.53 12.65 4.57 12.97L2.46 14.63C2.27 14.78 2.21 15.05 2.34 15.27L4.34 18.73C4.46 18.95 4.73 19.03 4.95 18.95L7.44 17.95C7.96 18.35 8.52 18.68 9.13 18.93L9.51 21.58C9.54 21.82 9.75 22 10 22H14C14.25 22 14.46 21.82 14.49 21.58L14.87 18.93C15.48 18.68 16.04 18.34 16.56 17.95L19.05 18.95C19.27 19.04 19.54 18.95 19.66 18.73L21.66 15.27C21.78 15.05 21.73 14.78 21.54 14.63L19.43 12.97Z" />
                    </svg>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-2">
                    General Settings
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                    These settings control your organization's basic information and member
                    access preferences.
                  </p>
                </div>
              </div>

              {/* Bottom Right Save Button */}
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          )}

          {/* Document Settings Tab */}
          {activeTab === "Document Settings" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Document Defaults & Compliance
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure default tax rates, currency formatting, and standard terms.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Default Tax / GST Rate (%)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Percent className="w-4 h-4" />
                    </span>
                    <input
                      type="number"
                      value={docPrefs.defaultTaxRate}
                      onChange={(e) =>
                        setDocPrefs({ ...docPrefs, defaultTaxRate: Number(e.target.value) })
                      }
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Currency Symbol & Format
                  </label>
                  <select
                    value={docPrefs.currency}
                    onChange={(e) => setDocPrefs({ ...docPrefs, currency: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium bg-white"
                  >
                    <option value="INR (₹)">INR (₹) - Indian Rupee</option>
                    <option value="USD ($)">USD ($) - US Dollar</option>
                    <option value="EUR (€)">EUR (€) - Euro</option>
                    <option value="GBP (£)">GBP (£) - British Pound</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Default Payment Terms
                </label>
                <input
                  type="text"
                  value={docPrefs.paymentTerms}
                  onChange={(e) => setDocPrefs({ ...docPrefs, paymentTerms: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Standard Notes & Disclaimer
                </label>
                <textarea
                  rows={3}
                  value={docPrefs.notes}
                  onChange={(e) => setDocPrefs({ ...docPrefs, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium resize-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => showToast("Document settings updated successfully!")}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "Notifications" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Notification Preferences
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose which alerts and emails you want to receive.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    key: "docViewed" as const,
                    title: "Document Viewed Notification",
                    desc: "Receive an email alert whenever a recipient opens a quotation or MOU link.",
                  },
                  {
                    key: "docSigned" as const,
                    title: "Document Signed Notification",
                    desc: "Get immediate notification when all required parties complete digital signatures.",
                  },
                  {
                    key: "docExpired" as const,
                    title: "Document Expiry Alerts",
                    desc: "Get reminded 3 days before a quotation or agreement expires.",
                  },
                  {
                    key: "memberJoined" as const,
                    title: "Team Member Activity",
                    desc: "Notify when a new team member accepts invitation or creates documents.",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-start justify-between p-4 rounded-xl border border-slate-150 hover:bg-slate-50/60 transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{item.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifPrefs[item.key]}
                      onChange={(e) =>
                        setNotifPrefs({ ...notifPrefs, [item.key]: e.target.checked })
                      }
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer mt-1"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => showToast("Notification preferences updated successfully!")}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </OrgLayout>
  );
}
