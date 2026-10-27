"use client";
import React, { useState } from "react";
import OrgLayout from "@/components/OrgLayout";
import { Upload, Check, Save } from "lucide-react";
import { getOrgBranding, saveOrgBranding, OrgBranding } from "@/lib/orgStorage";

export default function BrandingLetterheadPage() {
  const [branding, setBranding] = useState<OrgBranding>(getOrgBranding());
  const [activeTab, setActiveTab] = useState("Branding");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveOrgBranding(branding);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <OrgLayout activePath="/branding">
      <div className="space-y-6 max-w-5xl mx-auto font-sans">
        {/* Header matching Screen 9 */}
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Branding & Letterhead</h1>
          <p className="text-xs text-slate-400 mt-0.5">Customize your organization's branding and default letterhead.</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-slate-200 text-xs font-semibold">
          {["Branding", "Letterhead"].map((t) => (
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

        {/* Form Container matching Screen 9 */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200/80 shadow-xs">
          <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 Cols: Inputs */}
            <div className="lg:col-span-8 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Organization Name</label>
                <input
                  type="text"
                  value={branding.name}
                  onChange={(e) => setBranding({ ...branding, name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Tagline (optional)</label>
                <input
                  type="text"
                  value={branding.tagline}
                  onChange={(e) => setBranding({ ...branding, tagline: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Website</label>
                <input
                  type="text"
                  value={branding.website}
                  onChange={(e) => setBranding({ ...branding, website: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-xs text-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-[#2563EB] shadow-xs inline-block"></span>
                    <input
                      type="text"
                      value={branding.primaryColor}
                      onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Secondary Color</label>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-[#10B981] shadow-xs inline-block"></span>
                    <input
                      type="text"
                      value={branding.secondaryColor}
                      onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Logo Box matching Screen 9 */}
            <div className="lg:col-span-4 space-y-2">
              <label className="block text-xs font-medium text-slate-700">Logo</label>
              <div className="border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3 bg-slate-50/50">
                <div className="w-20 h-20 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col items-center justify-center p-2">
                  <span className="text-blue-600 font-black text-2xl tracking-tighter">▲</span>
                  <span className="text-[10px] font-black tracking-widest text-slate-800">ACME</span>
                </div>

                <button
                  type="button"
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-blue-600 rounded-lg shadow-xs"
                >
                  Upload New Logo
                </button>
                <p className="text-[10px] text-slate-400">PNG, JPG (max 2MB)</p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </OrgLayout>
  );
}
