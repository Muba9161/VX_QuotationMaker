"use client";

import React, { useRef, useState } from "react";
import { Upload, Trash2, Image as ImageIcon, Loader2, Sparkles, AlertCircle } from "lucide-react";

interface DedicatedLogoManagerProps {
  logoUrl: string | null;
  alternateLogoUrl: string | null;
  onLogoUpdated: (newUrl: string | null) => void;
  onAlternateLogoUpdated: (newUrl: string | null) => void;
  showToast: (msg: string) => void;
}

export default function DedicatedLogoManager({
  logoUrl,
  alternateLogoUrl,
  onLogoUpdated,
  onAlternateLogoUpdated,
  showToast,
}: DedicatedLogoManagerProps) {
  const [uploadingPrimary, setUploadingPrimary] = useState(false);
  const [uploadingAlt, setUploadingAlt] = useState(false);
  const primaryInputRef = useRef<HTMLInputElement>(null);
  const altInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File, isAlternate: boolean) => {
    if (file.size > 5 * 1024 * 1024) {
      showToast("File size exceeds 5MB limit.");
      return;
    }

    const setUploading = isAlternate ? setUploadingAlt : setUploadingPrimary;
    const onUpdated = isAlternate ? onAlternateLogoUpdated : onLogoUpdated;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", isAlternate ? "alternate_logo" : "logo");

      const res = await fetch("/api/v1/organization/branding/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Upload failed.");
      }

      onUpdated(data.data.assetUrl);
      showToast(isAlternate ? "Alternate logo uploaded." : "Primary logo uploaded.");
    } catch (err: any) {
      showToast(err.message || "Failed to upload logo.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (isAlternate: boolean) => {
    const onUpdated = isAlternate ? onAlternateLogoUpdated : onLogoUpdated;
    try {
      const res = await fetch("/api/v1/organization/branding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isAlternate ? { removeAlternateLogo: true } : { removeLogo: true }),
      });
      if (res.ok) {
        onUpdated(null);
        showToast(isAlternate ? "Alternate logo removed." : "Primary logo removed.");
      }
    } catch {
      showToast("Failed to remove logo.");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Primary Logo Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Primary Company Logo</h3>
              <p className="text-xs text-slate-500">Appears on quotations, MOUs, PDFs, and client portal</p>
            </div>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
              Required
            </span>
          </div>

          {/* Logo Preview Box */}
          <div className="mt-4 flex h-36 w-full items-center justify-center rounded-xl border border-slate-200 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] p-4 overflow-hidden relative group">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt="Primary Logo"
                className="max-h-full max-w-full object-contain drop-shadow-xs"
              />
            ) : (
              <div className="text-center text-slate-400">
                <ImageIcon className="mx-auto h-10 w-10 text-slate-300 mb-1" />
                <span className="text-xs font-medium">No primary logo uploaded</span>
              </div>
            )}

            {uploadingPrimary && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            )}
          </div>

          <p className="mt-2 text-[11px] text-slate-400">
            Recommended: PNG or SVG with transparent background, ~400×120px. Max 5MB.
          </p>
        </div>

        {/* Buttons */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
          <input
            ref={primaryInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={(e) => {
              if (e.target.files?.[0]) handleUpload(e.target.files[0], false);
            }}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => primaryInputRef.current?.click()}
            disabled={uploadingPrimary}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Upload className="h-3.5 w-3.5" />
            {logoUrl ? "Replace Logo" : "Upload Logo"}
          </button>

          {logoUrl && (
            <button
              type="button"
              onClick={() => handleRemove(false)}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Remove Logo"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Alternate / Dark Mode Logo Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Alternate / Dark Mode Logo</h3>
              <p className="text-xs text-slate-500">Optional white or monochrome variant for dark headers</p>
            </div>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200">
              Optional
            </span>
          </div>

          {/* Logo Preview Box */}
          <div className="mt-4 flex h-36 w-full items-center justify-center rounded-xl border border-slate-800 bg-slate-900 p-4 overflow-hidden relative group">
            {alternateLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={alternateLogoUrl}
                alt="Alternate Logo"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="text-center text-slate-600">
                <Sparkles className="mx-auto h-10 w-10 text-slate-700 mb-1" />
                <span className="text-xs font-medium">No alternate logo uploaded</span>
              </div>
            )}

            {uploadingAlt && (
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
              </div>
            )}
          </div>

          <p className="mt-2 text-[11px] text-slate-400">
            Best for white or inverted vector logos used on dark backgrounds or colored headers.
          </p>
        </div>

        {/* Buttons */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
          <input
            ref={altInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={(e) => {
              if (e.target.files?.[0]) handleUpload(e.target.files[0], true);
            }}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => altInputRef.current?.click()}
            disabled={uploadingAlt}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            <Upload className="h-3.5 w-3.5 text-slate-500" />
            {alternateLogoUrl ? "Replace Alternate Logo" : "Upload Alternate Logo"}
          </button>

          {alternateLogoUrl && (
            <button
              type="button"
              onClick={() => handleRemove(true)}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Remove Alternate Logo"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

