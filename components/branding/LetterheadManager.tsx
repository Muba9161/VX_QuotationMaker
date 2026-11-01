"use client";

import React, { useRef, useState } from "react";
import {
  Upload,
  FileText,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Calendar,
  FileCheck,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

interface LetterheadManagerProps {
  letterheadUrl: string | null;
  letterheadFilename: string | null;
  letterheadMimeType: string | null;
  letterheadUploadedAt: string | null;
  applyQuotations: boolean;
  applyMous: boolean;
  onUpdate: () => void;
  showToast: (msg: string) => void;
}

const ALLOWED_LETTERHEAD_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "application/pdf",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function LetterheadManager({
  letterheadUrl,
  letterheadFilename,
  letterheadMimeType,
  letterheadUploadedAt,
  applyQuotations,
  applyMous,
  onUpdate,
  showToast,
}: LetterheadManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forQuotes, setForQuotes] = useState(applyQuotations);
  const [forMous, setForMous] = useState(applyMous);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPdf =
    letterheadMimeType === "application/pdf" ||
    (letterheadUrl && letterheadUrl.toLowerCase().endsWith(".pdf")) ||
    (letterheadFilename && letterheadFilename.toLowerCase().endsWith(".pdf"));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const mime = file.type.toLowerCase();
    const ext = file.name.split(".").pop()?.toLowerCase();

    const isValidMime =
      ALLOWED_LETTERHEAD_TYPES.includes(mime) ||
      (ext && ["png", "jpg", "jpeg", "webp", "pdf"].includes(ext));

    if (!isValidMime) {
      setError("Unsupported file format. Please upload PNG, JPG, JPEG, WebP, or PDF.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit of 5MB.`);
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "letterhead");

      const res = await fetch("/api/v1/organization/branding/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.success) {
        setError(json?.error?.message || "Failed to upload letterhead.");
        return;
      }

      showToast("Official letterhead uploaded successfully!");
      onUpdate();
    } catch {
      setError("Network error while uploading letterhead.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveLetterhead = async () => {
    if (!confirm("Are you sure you want to remove the current organization letterhead?")) {
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const res = await fetch("/api/v1/organization/branding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          removeLetterhead: true,
        }),
      });

      if (!res.ok) {
        setError("Failed to remove letterhead.");
        return;
      }

      showToast("Letterhead removed successfully.");
      onUpdate();
    } catch {
      setError("Network error while removing letterhead.");
    } finally {
      setUploading(false);
    }
  };

  const handleTogglePreference = async (type: "quotations" | "mous", val: boolean) => {
    try {
      setSavingPrefs(true);
      setError(null);

      const payload =
        type === "quotations"
          ? { letterheadApplyQuotations: val }
          : { letterheadApplyMous: val };

      if (type === "quotations") setForQuotes(val);
      else setForMous(val);

      const res = await fetch("/api/v1/organization/branding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        showToast("Failed to save letterhead preference.");
        // Revert
        if (type === "quotations") setForQuotes(!val);
        else setForMous(!val);
        return;
      }

      showToast("Letterhead usage preference updated.");
      onUpdate();
    } catch {
      showToast("Error updating preference.");
    } finally {
      setSavingPrefs(false);
    }
  };

  const formattedDate = letterheadUploadedAt
    ? new Date(letterheadUploadedAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            Official Letterhead Document
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload an existing Image (PNG, JPG, WebP) or vector PDF letterhead to use as page background in Quotations and MOUs.
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.webp,.pdf,image/png,image/jpeg,image/webp,application/pdf"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />

        <div className="flex items-center gap-2">
          {!letterheadUrl ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{uploading ? "Uploading..." : "Upload Letterhead"}</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                title="Replace with another file"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Replace</span>
              </button>
              <button
                type="button"
                onClick={handleRemoveLetterhead}
                disabled={uploading}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                title="Remove letterhead"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Letterhead Preview & Metadata */}
      {letterheadUrl ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Metadata Card */}
            <div className="md:col-span-1 p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3 text-xs">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">File Details</p>
                <p className="font-semibold text-slate-800 text-xs mt-1 truncate" title={letterheadFilename || "letterhead"}>
                  {letterheadFilename || (isPdf ? "letterhead.pdf" : "letterhead.png")}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold text-[10.5px]">
                  {isPdf ? "PDF Document" : "Image Background"}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500 text-[11px] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Isolated
                </span>
              </div>

              {formattedDate && (
                <div className="pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Uploaded {formattedDate}</span>
                </div>
              )}

              <div className="pt-2">
                <a
                  href={letterheadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:underline font-semibold text-xs"
                >
                  <span>Open raw file in new tab</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Visual Preview Card */}
            <div className="md:col-span-2 border border-slate-200 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center min-h-[220px] max-h-[320px]">
              {isPdf ? (
                <iframe
                  src={`${letterheadUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                  title="Letterhead PDF Preview"
                  className="w-full h-[320px] border-0"
                />
              ) : (
                <div className="p-4 flex items-center justify-center w-full h-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={letterheadUrl}
                    alt="Letterhead Preview"
                    className="max-h-[280px] max-w-full object-contain rounded-lg shadow-xs bg-white"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Usage Preference Toggles */}
          <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-slate-800">Apply Letterhead to Generated Documents</p>
              <p className="text-[11px] text-slate-500">Select which document types automatically embed this official letterhead.</p>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={forQuotes}
                  disabled={savingPrefs}
                  onChange={(e) => handleTogglePreference("quotations", e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                />
                <span>Quotations</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={forMous}
                  disabled={savingPrefs}
                  onChange={(e) => handleTogglePreference("mous", e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                />
                <span>MOUs & Agreements</span>
              </label>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/20"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Click to browse or drop official letterhead file
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Supports vector PDF or high-resolution PNG, JPG, WebP (up to 5MB)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

