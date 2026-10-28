"use client";

import React, { useState, useRef, useEffect } from "react";
import OrgLayout from "@/components/OrgLayout";
import {
  Link2,
  ChevronDown,
  RotateCcw,
  Save,
  CheckCircle2,
  Upload,
  Sparkles,
  Palette,
  FileText,
} from "lucide-react";
import { getOrgBranding, saveOrgBranding, OrgBranding } from "@/lib/orgStorage";

export default function BrandingLetterheadPage() {
  const [branding, setBranding] = useState<OrgBranding>(() => getOrgBranding());
  const [activeTab, setActiveTab] = useState<"Branding" | "Letterhead">("Branding");
  const [previewDoc, setPreviewDoc] = useState<"Quotation" | "MOU" | "Letterhead">("Quotation");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loaded = getOrgBranding();
    if (loaded) {
      setBranding(loaded);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    saveOrgBranding(branding);
    setIsSaved(true);
    showToast("Branding settings saved successfully!");
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleReset = () => {
    const defaultData: OrgBranding = {
      name: "Acme Technologies Pvt Ltd",
      tagline: "Innovating for a Better Tomorrow",
      website: "https://www.acme.com",
      email: "contact@acme.com",
      phone: "+91 98765 43210",
      address: "A-123, Sector 62, Noida, U.P. 201301",
      primaryColor: "#2563EB",
      secondaryColor: "#10B981",
      logoUrl: "",
      allowRegistration: true,
      requireApproval: true,
      defaultExpiryDays: 30,
    };
    setBranding(defaultData);
    saveOrgBranding(defaultData);
    showToast("Branding settings reset to default!");
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        setBranding((prev) => ({ ...prev, logoUrl: url }));
        showToast("Organization logo updated!");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <OrgLayout activePath="/branding">
      {/* Hidden Logo File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleLogoUpload}
        className="hidden"
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 right-8 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="space-y-6 pb-28 max-w-[1400px] mx-auto font-sans">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Branding & Letterhead
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Customize your organization's branding and default letterhead.
          </p>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-8 border-b border-slate-200 text-sm font-semibold">
          {(["Branding", "Letterhead"] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === "Letterhead") setPreviewDoc("Letterhead");
                  else setPreviewDoc("Quotation");
                }}
                className={`pb-3 transition-colors relative ${
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

        {/* Main Content Grid: 2 Columns */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left Column: Organization Branding Card */}
          <div className="xl:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Organization Branding
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Set up your organization details, logo and brand colors. These will be used in
                quotations, MOUs and all documents.
              </p>
            </div>

            {/* Top Subgrid: Fields on Left, Logo on Right */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              {/* Fields */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Organization Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={branding.name}
                    onChange={(e) => setBranding({ ...branding, name: e.target.value })}
                    placeholder="Acme Technologies Pvt Ltd"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Tagline (optional)
                  </label>
                  <input
                    type="text"
                    value={branding.tagline}
                    onChange={(e) => setBranding({ ...branding, tagline: e.target.value })}
                    placeholder="Innovating for a Better Tomorrow"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Website
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-slate-400 pointer-events-none">
                      <Link2 className="w-3.5 h-3.5 text-slate-400" />
                    </span>
                    <input
                      type="text"
                      value={branding.website}
                      onChange={(e) => setBranding({ ...branding, website: e.target.value })}
                      placeholder="https://www.acme.com"
                      className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-blue-600 font-medium placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Organization Logo Box */}
              <div className="md:col-span-5 flex flex-col space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Organization Logo
                </label>
                <div className="border border-dashed border-blue-200/80 bg-blue-50/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3 min-h-[190px]">
                  {branding.logoUrl && !branding.logoUrl.includes("dicebear") ? (
                    <div className="w-20 h-20 rounded-xl border border-slate-200 bg-white p-2 shadow-xs flex items-center justify-center overflow-hidden">
                      <img
                        src={branding.logoUrl}
                        alt="Organization Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      {/* Stylized Acme Geometric Triangle Logo from Image 2 */}
                      <svg
                        className="w-12 h-12"
                        viewBox="0 0 48 48"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M24 6L6 38H18L24 26L30 38H42L24 6Z"
                          fill={branding.primaryColor || "#2563EB"}
                        />
                      </svg>
                      <span className="text-xs font-black tracking-widest text-slate-900 mt-1">
                        ACME
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200/60 rounded-lg text-xs font-semibold transition-colors shadow-2xs"
                  >
                    Change Logo
                  </button>
                  <p className="text-[10px] text-slate-400 font-medium">PNG, JPG (max 2MB)</p>
                </div>
              </div>
            </div>

            {/* Colors Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              {/* Primary Color */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Primary Color
                </label>
                <div className="flex items-center gap-2 border border-slate-200 rounded-xl p-2 bg-white hover:border-slate-300 transition-colors">
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 shadow-2xs cursor-pointer border border-black/10">
                    <input
                      type="color"
                      value={branding.primaryColor || "#2563EB"}
                      onChange={(e) =>
                        setBranding({ ...branding, primaryColor: e.target.value })
                      }
                      className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer border-0 p-0"
                    />
                    <div
                      className="w-full h-full pointer-events-none"
                      style={{ backgroundColor: branding.primaryColor || "#2563EB" }}
                    />
                  </div>
                  <input
                    type="text"
                    value={branding.primaryColor}
                    onChange={(e) =>
                      setBranding({ ...branding, primaryColor: e.target.value })
                    }
                    className="w-full text-xs font-mono font-semibold text-slate-800 uppercase focus:outline-hidden px-1"
                  />
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Used for headers, buttons and highlights.
                </p>
              </div>

              {/* Secondary Color */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Secondary Color
                </label>
                <div className="flex items-center gap-2 border border-slate-200 rounded-xl p-2 bg-white hover:border-slate-300 transition-colors">
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 shadow-2xs cursor-pointer border border-black/10">
                    <input
                      type="color"
                      value={branding.secondaryColor || "#10B981"}
                      onChange={(e) =>
                        setBranding({ ...branding, secondaryColor: e.target.value })
                      }
                      className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer border-0 p-0"
                    />
                    <div
                      className="w-full h-full pointer-events-none"
                      style={{ backgroundColor: branding.secondaryColor || "#10B981" }}
                    />
                  </div>
                  <input
                    type="text"
                    value={branding.secondaryColor}
                    onChange={(e) =>
                      setBranding({ ...branding, secondaryColor: e.target.value })
                    }
                    className="w-full text-xs font-mono font-semibold text-slate-800 uppercase focus:outline-hidden px-1"
                  />
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Used for secondary elements and accents.
                </p>
              </div>
            </div>

            {/* Brand Color Preview Card */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-800 mb-2">
                Brand Color Preview
              </label>
              <div className="border border-slate-200/90 rounded-2xl p-4 sm:p-5 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Buttons & Dots */}
                <div className="flex items-center gap-3.5 flex-wrap">
                  <button
                    type="button"
                    style={{ backgroundColor: branding.primaryColor || "#2563EB" }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-2xs transition-opacity hover:opacity-95"
                  >
                    Primary Button
                  </button>

                  <button
                    type="button"
                    style={{
                      borderColor: branding.secondaryColor || "#10B981",
                      color: branding.secondaryColor || "#10B981",
                      backgroundColor: `${branding.secondaryColor || "#10B981"}10`,
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border transition-colors"
                  >
                    Secondary Button
                  </button>

                  {/* Palette dots */}
                  <div className="flex items-center gap-1.5 pl-1">
                    <span
                      className="w-3.5 h-3.5 rounded-full inline-block shadow-2xs"
                      style={{ backgroundColor: branding.primaryColor || "#2563EB" }}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full inline-block shadow-2xs"
                      style={{ backgroundColor: "#06B6D4" }}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full inline-block shadow-2xs"
                      style={{ backgroundColor: branding.secondaryColor || "#10B981" }}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full inline-block shadow-2xs"
                      style={{ backgroundColor: "#A7F3D0" }}
                    />
                  </div>
                </div>

                {/* Typography Preview */}
                <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-200/80 pt-3 md:pt-0 md:pl-5 text-left w-full md:w-auto">
                  <span
                    className="text-2xl font-black shrink-0 tracking-tight"
                    style={{ color: branding.primaryColor || "#2563EB" }}
                  >
                    Aa
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      This is a sample text with your brand colors.
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                      Quotations • MOUs • Documents • Letterhead
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Brand Preview Card */}
          <div className="xl:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            {/* Header + Segmented Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Live Brand Preview
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  See how your branding looks in documents.
                </p>
              </div>

              {/* Segmented Pills */}
              <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-medium self-start sm:self-auto">
                {(["Quotation", "MOU", "Letterhead"] as const).map((docType) => {
                  const isSelected = previewDoc === docType;
                  return (
                    <button
                      key={docType}
                      onClick={() => setPreviewDoc(docType)}
                      style={{
                        backgroundColor: isSelected
                          ? branding.primaryColor || "#2563EB"
                          : "transparent",
                        color: isSelected ? "#ffffff" : "#64748b",
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-2xs ${
                        !isSelected && "hover:text-slate-900"
                      }`}
                    >
                      {docType}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rendered Document Sheet (A4 Styled Box) */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-md p-5 sm:p-6 text-[11px] text-slate-700 min-h-[560px] flex flex-col justify-between">
              {/* QUOTATION PREVIEW (Matching Image 2 pixel-by-pixel) */}
              {previewDoc === "Quotation" && (
                <div className="space-y-4">
                  {/* Top Company Header */}
                  <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      {branding.logoUrl && !branding.logoUrl.includes("dicebear") ? (
                        <img
                          src={branding.logoUrl}
                          alt="Logo"
                          className="w-9 h-9 object-contain"
                        />
                      ) : (
                        <div className="w-8 h-8 flex items-center justify-center shrink-0">
                          <svg
                            className="w-8 h-8"
                            viewBox="0 0 48 48"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M24 6L6 38H18L24 26L30 38H42L24 6Z"
                              fill={branding.primaryColor || "#2563EB"}
                            />
                          </svg>
                        </div>
                      )}
                      <div>
                        <div className="font-black text-slate-900 text-xs tracking-wider">
                          ACME
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {branding.name || "Acme Technologies Pvt Ltd"}
                        </div>
                      </div>
                    </div>

                    <div className="text-[9.5px] text-slate-400 text-right leading-tight font-medium">
                      <div>A-123, Sector 62, Noida, U.P. 201301</div>
                      <div className="text-blue-600">
                        {branding.website ? branding.website.replace(/^https?:\/\//, "") : "www.acme.com"}
                      </div>
                      <div>+91 98765 43210</div>
                    </div>
                  </div>

                  {/* Title & Metadata */}
                  <div className="pt-1">
                    <div className="text-sm font-black text-slate-900 tracking-wide uppercase">
                      QUOTATION
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-[10px]">
                    <div>
                      <span className="font-bold text-slate-400 block text-[9px] uppercase tracking-wider">
                        BILL TO:
                      </span>
                      <div className="font-bold text-slate-800 text-[11px] mt-0.5">
                        Innovate India
                      </div>
                      <div className="text-slate-500">BKC, Mumbai, Maharashtra</div>
                    </div>

                    <div className="text-right space-y-0.5 text-slate-600">
                      <div>
                        <span className="text-slate-400 font-medium">Quotation No:</span>{" "}
                        <span className="font-bold text-slate-800">QUO-001</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Date:</span>{" "}
                        <span>24-10-2026</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Valid Till:</span>{" "}
                        <span>24-11-2026</span>
                      </div>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="border border-slate-150 rounded-lg overflow-hidden mt-3">
                    <table className="w-full text-left text-[9.5px]">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                        <tr>
                          <th className="py-2 px-2 text-center w-6">#</th>
                          <th className="py-2 px-2">DESCRIPTION</th>
                          <th className="py-2 px-2 text-center">QTY</th>
                          <th className="py-2 px-2 text-center">UNIT</th>
                          <th className="py-2 px-2 text-right">RATE (₹)</th>
                          <th className="py-2 px-2 text-right">AMOUNT (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        <tr>
                          <td className="py-1.5 px-2 text-center text-slate-400">1</td>
                          <td className="py-1.5 px-2 font-medium">Web Development</td>
                          <td className="py-1.5 px-2 text-center">1</td>
                          <td className="py-1.5 px-2 text-center text-slate-400">Nos</td>
                          <td className="py-1.5 px-2 text-right font-mono">50,000</td>
                          <td className="py-1.5 px-2 text-right font-mono font-medium">50,000</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-2 text-center text-slate-400">2</td>
                          <td className="py-1.5 px-2 font-medium">UI/UX Design</td>
                          <td className="py-1.5 px-2 text-center">1</td>
                          <td className="py-1.5 px-2 text-center text-slate-400">Nos</td>
                          <td className="py-1.5 px-2 text-right font-mono">30,000</td>
                          <td className="py-1.5 px-2 text-right font-mono font-medium">30,000</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-2 text-center text-slate-400">3</td>
                          <td className="py-1.5 px-2 font-medium">Maintenance Support</td>
                          <td className="py-1.5 px-2 text-center">1</td>
                          <td className="py-1.5 px-2 text-center text-slate-400">Nos</td>
                          <td className="py-1.5 px-2 text-right font-mono">20,000</td>
                          <td className="py-1.5 px-2 text-right font-mono font-medium">20,000</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Calculations */}
                  <div className="flex flex-col items-end space-y-1 text-[10px] pt-1">
                    <div className="flex justify-between w-48 text-slate-600">
                      <span>Subtotal</span>
                      <span className="font-mono font-medium">₹1,00,000</span>
                    </div>
                    <div className="flex justify-between w-48 text-slate-600">
                      <span>GST (18%)</span>
                      <span className="font-mono font-medium">₹18,000</span>
                    </div>
                    <div
                      style={{
                        backgroundColor: `${branding.primaryColor || "#2563EB"}15`,
                      }}
                      className="flex justify-between w-48 px-2 py-1.5 rounded-lg border border-blue-100"
                    >
                      <span className="font-bold text-slate-900">Total</span>
                      <span
                        style={{ color: branding.primaryColor || "#2563EB" }}
                        className="font-bold font-mono text-xs"
                      >
                        ₹1,18,000
                      </span>
                    </div>
                  </div>

                  {/* Bottom: Terms & Authorized Signatory */}
                  <div className="pt-4 grid grid-cols-2 gap-4 items-end border-t border-slate-100 text-[9.5px]">
                    <div>
                      <div className="font-bold text-slate-800 mb-1">Terms & Conditions:</div>
                      <div className="text-slate-500 leading-relaxed">
                        • Payment within 30 days.
                        <br />• This quotation is valid for 30 days.
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[9px] text-slate-400 mb-1">Authorized Signatory</div>
                      <div className="font-serif italic text-base text-slate-800 font-semibold my-0.5">
                        Rahul Sharma
                      </div>
                      <div className="font-bold text-slate-800 text-[10px]">Rahul Sharma</div>
                      <div className="text-[9px] text-slate-400">
                        {branding.name || "Acme Technologies Pvt Ltd"}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MOU PREVIEW */}
              {previewDoc === "MOU" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="font-black text-slate-900 text-xs">
                        {branding.name || "Acme Technologies Pvt Ltd"}
                      </div>
                    </div>
                    <div className="text-[9.5px] text-slate-400">Doc Ref: MOU-001</div>
                  </div>

                  <div className="text-center py-2">
                    <div
                      style={{ color: branding.primaryColor || "#2563EB" }}
                      className="font-black text-xs uppercase tracking-wider"
                    >
                      MEMORANDUM OF UNDERSTANDING
                    </div>
                    <div className="text-[9px] text-slate-400 mt-0.5">
                      Effective Date: 24th October 2026
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-600 leading-relaxed space-y-2">
                    <p>
                      This Memorandum of Understanding is entered into between{" "}
                      <strong className="text-slate-800">{branding.name || "Acme Technologies Pvt Ltd"}</strong>{" "}
                      and <strong className="text-slate-800">Innovate India</strong>.
                    </p>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-150 space-y-1">
                      <div className="font-bold text-slate-800 text-[10px]">
                        1. Scope of Collaboration
                      </div>
                      <p className="text-slate-500 text-[9px]">
                        Both parties agree to collaborate on technology research, enterprise
                        digital transformation, and joint market ventures.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-150 space-y-1">
                      <div className="font-bold text-slate-800 text-[10px]">
                        2. Confidentiality & IP
                      </div>
                      <p className="text-slate-500 text-[9px]">
                        Proprietary information shared during the engagement shall remain protected
                        under standard non-disclosure terms.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 grid grid-cols-2 gap-4 border-t border-slate-100 text-[9.5px]">
                    <div>
                      <div className="text-slate-400 text-[9px]">First Party:</div>
                      <div className="font-serif italic text-sm text-slate-800">Rahul Sharma</div>
                      <div className="font-bold text-slate-700">{branding.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-400 text-[9px]">Second Party:</div>
                      <div className="font-serif italic text-sm text-slate-800">Vikram Malhotra</div>
                      <div className="font-bold text-slate-700">Innovate India</div>
                    </div>
                  </div>
                </div>
              )}

              {/* LETTERHEAD PREVIEW */}
              {previewDoc === "Letterhead" && (
                <div className="space-y-4">
                  <div
                    style={{ backgroundColor: branding.primaryColor || "#2563EB" }}
                    className="h-1.5 w-full rounded-full"
                  />

                  <div className="flex items-start justify-between pb-3 border-b border-slate-150">
                    <div>
                      <div className="font-black text-slate-900 text-sm">
                        {branding.name || "Acme Technologies Pvt Ltd"}
                      </div>
                      <div className="text-[10px] text-slate-400 italic">
                        {branding.tagline || "Innovating for a Better Tomorrow"}
                      </div>
                    </div>

                    <div className="text-[9.5px] text-slate-400 text-right leading-tight">
                      <div>A-123, Sector 62, Noida, UP 201301</div>
                      <div className="text-blue-600 font-medium">{branding.website}</div>
                      <div>contact@acme.com</div>
                    </div>
                  </div>

                  <div className="py-2 text-[10px] text-slate-600 space-y-3 leading-relaxed">
                    <div className="text-slate-400 text-[9.5px]">Date: 24 October 2026</div>
                    <div className="font-bold text-slate-800">
                      Subject: Official Communication & Document Proof
                    </div>
                    <p>To Whom It May Concern,</p>
                    <p>
                      This official letterhead is generated using the standardized corporate
                      branding guidelines of{" "}
                      <strong className="text-slate-800">{branding.name}</strong>. All formal
                      proposals, letters, and statements are authenticated through this system.
                    </p>
                    <p>
                      For verification or queries, please reach out to our administration desk at{" "}
                      <span className="text-blue-600 font-medium">{branding.website}</span>.
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-150">
                    <div className="font-serif italic text-sm text-slate-800">Rahul Sharma</div>
                    <div className="font-bold text-slate-800 text-[10px]">Rahul Sharma</div>
                    <div className="text-[9px] text-slate-400">Chief Executive Officer</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar matching Image 2 */}
      <div
        style={{ left: "240px" }}
        className="fixed bottom-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-3.5 px-6 sm:px-10 z-40 flex items-center justify-end gap-3 shadow-lg"
      >
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset Changes</span>
        </button>

        <button
          type="button"
          onClick={() => handleSave()}
          style={{ backgroundColor: branding.primaryColor || "#2563EB" }}
          className="flex items-center gap-2 px-5 py-2 rounded-xl text-white text-xs font-semibold shadow-sm hover:opacity-95 transition-all cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Branding</span>
        </button>
      </div>
    </OrgLayout>
  );
}
