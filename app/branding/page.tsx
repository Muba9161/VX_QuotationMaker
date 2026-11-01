"use client";

import React, { useState, useEffect } from "react";
import OrgLayout from "@/components/OrgLayout";
import {
  Save,
  RotateCcw,
  Sparkles,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import DedicatedLogoManager from "@/components/branding/DedicatedLogoManager";
import CompanyInfoCard from "@/components/branding/CompanyInfoCard";
import ColorPaletteCard from "@/components/branding/ColorPaletteCard";
import BrandingDocumentPreview from "@/components/branding/BrandingDocumentPreview";
import LetterheadManager from "@/components/branding/LetterheadManager";

interface BrandingState {
  name: string;
  tagline: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string | null;
  alternateLogoUrl: string | null;
  alternateLogoFilename: string | null;
  signatoryName: string;
  signatoryTitle: string;
}

const DEFAULT_BRANDING: BrandingState = {
  name: "",
  tagline: "",
  website: "",
  email: "",
  phone: "",
  address: "",
  primaryColor: "#2563EB",
  secondaryColor: "#10B981",
  accentColor: "#06B6D4",
  logoUrl: null,
  alternateLogoUrl: null,
  alternateLogoFilename: null,
  signatoryName: "",
  signatoryTitle: "",
};

export default function BrandingPage() {
  const [activeTab, setActiveTab] = useState<"branding" | "letterhead">("branding");
  const [branding, setBranding] = useState<BrandingState>(DEFAULT_BRANDING);
  const [initialBranding, setInitialBranding] = useState<BrandingState>(DEFAULT_BRANDING);
  const [letterheadInfo, setLetterheadInfo] = useState<{
    url: string | null;
    filename: string | null;
    mimeType: string | null;
    uploadedAt: string | null;
    applyQuotations: boolean;
    applyMous: boolean;
    defaultLetterheadId?: string | null;
  }>({
    url: null,
    filename: null,
    mimeType: null,
    uploadedAt: null,
    applyQuotations: true,
    applyMous: true,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchBranding = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/v1/organization/branding");
      const json = await res.json();
      if (res.ok && json.data) {
        const { organization, branding: brand, letterhead } = json.data;
        const loaded: BrandingState = {
          name: organization.name || "",
          tagline: organization.tagline || "",
          website: organization.website || "",
          email: organization.email || "",
          phone: organization.phone || "",
          address: organization.address || "",
          primaryColor: brand.primaryColor || "#2563EB",
          secondaryColor: brand.secondaryColor || "#10B981",
          accentColor: brand.accentColor || "#06B6D4",
          logoUrl: brand.logoUrl || null,
          alternateLogoUrl: brand.alternateLogoUrl || null,
          alternateLogoFilename: brand.alternateLogoFilename || null,
          signatoryName: letterhead?.defaultSignatoryName || "",
          signatoryTitle: letterhead?.defaultSignatoryTitle || "",
        };
        setBranding(loaded);
        setInitialBranding(loaded);

        setLetterheadInfo({
          url: letterhead?.letterheadUrl || null,
          filename: letterhead?.filename || null,
          mimeType: letterhead?.mimeType || null,
          uploadedAt: letterhead?.uploadedAt || null,
          applyQuotations: letterhead?.applyQuotations ?? true,
          applyMous: letterhead?.applyMous ?? true,
          defaultLetterheadId: letterhead?.defaultLetterheadId || null,
        });
      }
    } catch {
      showToast("Failed to load branding information.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranding();
  }, []);

  const handleFieldChange = (field: string, value: string) => {
    setBranding((prev) => ({ ...prev, [field]: value }));
  };

  const handleColorChange = (
    field: "primaryColor" | "secondaryColor" | "accentColor",
    value: string
  ) => {
    setBranding((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const payload = {
        name: branding.name,
        tagline: branding.tagline,
        website: branding.website,
        email: branding.email || undefined,
        phone: branding.phone,
        address: branding.address,
        primaryColor: branding.primaryColor,
        secondaryColor: branding.secondaryColor,
        accentColor: branding.accentColor,
        defaultSignatoryName: branding.signatoryName,
        defaultSignatoryTitle: branding.signatoryTitle,
      };

      const res = await fetch("/api/v1/organization/branding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to update branding.");
      }

      setInitialBranding(branding);
      showToast("Branding settings saved successfully.");
    } catch (err: any) {
      showToast(err.message || "Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setBranding(initialBranding);
    showToast("Changes reset.");
  };

  return (
    <OrgLayout>
      <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight sm:text-2xl">
              Branding & Letterhead
            </h1>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Configure white-label branding, logos, color palette, and official letterhead layout
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {activeTab === "branding" && (
              <>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isSaving}
                  style={{
                    height: "38px",
                    padding: "0 16px",
                    borderRadius: "10px",
                    border: "1.5px solid #cbd5e1",
                    backgroundColor: "#ffffff",
                    color: "#475569",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    cursor: isSaving ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                  }}
                >
                  <RotateCcw style={{ width: "13px", height: "13px" }} />
                  Reset
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  style={{
                    height: "38px",
                    padding: "0 20px",
                    borderRadius: "10px",
                    border: "none",
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    fontSize: "12.5px",
                    fontWeight: 700,
                    cursor: isSaving ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 2px 4px rgba(37,99,235,0.25)",
                  }}
                >
                  {isSaving ? (
                    <>
                      <Loader2 style={{ width: "14px", height: "14px" }} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save style={{ width: "14px", height: "14px" }} /> Save Changes
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Dedicated Secondary Navigation Tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #e2e8f0", paddingBottom: "2px" }}>
          <button
            type="button"
            onClick={() => setActiveTab("branding")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              border: "none",
              borderBottom: activeTab === "branding" ? "2.5px solid #2563eb" : "2.5px solid transparent",
              backgroundColor: "transparent",
              color: activeTab === "branding" ? "#2563eb" : "#64748b",
              transition: "all 0.15s ease",
            }}
          >
            <Sparkles style={{ width: "15px", height: "15px", color: activeTab === "branding" ? "#2563eb" : "#94a3b8" }} />
            Identity & Visuals
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("letterhead")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              border: "none",
              borderBottom: activeTab === "letterhead" ? "2.5px solid #2563eb" : "2.5px solid transparent",
              backgroundColor: "transparent",
              color: activeTab === "letterhead" ? "#2563eb" : "#64748b",
              transition: "all 0.15s ease",
            }}
          >
            <Bookmark style={{ width: "15px", height: "15px", color: activeTab === "letterhead" ? "#d97706" : "#94a3b8" }} />
            Letterhead & PDF Background
          </button>
        </div>

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : activeTab === "branding" ? (
          <div className="flex flex-col gap-6">
            {/* 1. Dedicated Logo Manager Card */}
            <DedicatedLogoManager
              logoUrl={branding.logoUrl}
              alternateLogoUrl={branding.alternateLogoUrl}
              onLogoUpdated={(newUrl) => setBranding((prev) => ({ ...prev, logoUrl: newUrl }))}
              onAlternateLogoUpdated={(newUrl) =>
                setBranding((prev) => ({ ...prev, alternateLogoUrl: newUrl }))
              }
              showToast={showToast}
            />

            {/* 2. Brand Color Palette Card */}
            <ColorPaletteCard
              primaryColor={branding.primaryColor}
              secondaryColor={branding.secondaryColor}
              accentColor={branding.accentColor}
              onChange={handleColorChange}
            />

            {/* 3. Organization & Legal Credentials Form */}
            <CompanyInfoCard
              name={branding.name}
              tagline={branding.tagline}
              website={branding.website}
              email={branding.email}
              phone={branding.phone}
              address={branding.address}
              signatoryName={branding.signatoryName}
              signatoryTitle={branding.signatoryTitle}
              onChange={handleFieldChange}
            />

            {/* 4. Live Document Preview Simulation */}
            <BrandingDocumentPreview
              name={branding.name}
              tagline={branding.tagline}
              website={branding.website}
              email={branding.email}
              phone={branding.phone}
              address={branding.address}
              primaryColor={branding.primaryColor}
              secondaryColor={branding.secondaryColor}
              accentColor={branding.accentColor}
              logoUrl={branding.logoUrl}
              signatoryName={branding.signatoryName}
              signatoryTitle={branding.signatoryTitle}
              letterheadUrl={letterheadInfo.url}
            />

            {/* Bottom Actions Card (Non-Sticky, Proper Margin) */}
            <div className="mt-2 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div>
                <span className="text-xs font-semibold text-slate-700 block">
                  Ready to apply your changes?
                </span>
                <span className="text-[11px] text-slate-400">
                  Updated branding is immediately applied across newly created documents, quotations, and MOUs.
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-slate-400" /> Reset
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Letterhead Management Tab */}
            <LetterheadManager
              letterheadUrl={letterheadInfo.url}
              letterheadFilename={letterheadInfo.filename}
              letterheadMimeType={letterheadInfo.mimeType}
              letterheadUploadedAt={letterheadInfo.uploadedAt}
              applyQuotations={letterheadInfo.applyQuotations}
              applyMous={letterheadInfo.applyMous}
              onUpdate={fetchBranding}
              showToast={showToast}
            />
          </div>
        )}

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-medium text-white shadow-xl animate-in slide-in-from-bottom-2 duration-150">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </OrgLayout>
  );
}
