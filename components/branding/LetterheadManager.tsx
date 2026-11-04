"use client";

import React, { useRef, useState } from "react";
import { notifySuccess } from "@/lib/ui/success-notification";
import {
  Upload,
  FileText,
  Trash2,
  RefreshCw,
  AlertCircle,
  Calendar,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  FileCode,
  Layers,
  Sparkles,
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
  const [isDragging, setIsDragging] = useState(false);
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

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to upload letterhead.");
      }

      notifySuccess("Official letterhead uploaded successfully.");
      onUpdate();
    } catch (err: any) {
      setError(err.message || "Upload failed. Please check network connection.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveLetterhead = async () => {
    if (!window.confirm("Are you sure you want to remove the current letterhead?")) {
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
        throw new Error("Failed to update letterhead preferences.");
      }

      showToast(`Letterhead preference updated.`);
      onUpdate();
    } catch (err: any) {
      setError(err.message || "Failed to save preferences.");
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
    <div
      style={{
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        backgroundColor: "#ffffff",
        padding: "24px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        boxSizing: "border-box",
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          borderBottom: "1px solid #f1f5f9",
          paddingBottom: "16px",
        }}
      >
        <div>
          <h3
            style={{
              fontSize: "15px",
              fontWeight: 800,
              color: "#0f172a",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FileText style={{ width: "18px", height: "18px", color: "#2563eb" }} />
            Official Letterhead Document
          </h3>
          <p style={{ fontSize: "12px", color: "#64748b", margin: "3px 0 0 0" }}>
            Upload an existing Image (PNG, JPG, WebP) or vector PDF letterhead to use as page background in Quotations and MOUs.
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.webp,.pdf,image/png,image/jpeg,image/webp,application/pdf"
          onChange={handleFileChange}
          disabled={uploading}
          style={{ display: "none" }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {!letterheadUrl ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                height: "36px",
                padding: "0 18px",
                borderRadius: "9px",
                backgroundColor: uploading ? "#94a3b8" : "#2563eb",
                color: "#ffffff",
                fontSize: "12px",
                fontWeight: 700,
                border: "none",
                cursor: uploading ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                boxShadow: "0 1px 3px rgba(37,99,235,0.25)",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (!uploading) e.currentTarget.style.backgroundColor = "#1d4ed8";
              }}
              onMouseLeave={(e) => {
                if (!uploading) e.currentTarget.style.backgroundColor = "#2563eb";
              }}
            >
              <Upload style={{ width: "14px", height: "14px" }} />
              <span>{uploading ? "Uploading..." : "Upload Letterhead"}</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  height: "36px",
                  padding: "0 14px",
                  borderRadius: "8px",
                  border: "1.5px solid #cbd5e1",
                  backgroundColor: "#ffffff",
                  color: "#334155",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
                title="Replace with another file"
              >
                <RefreshCw style={{ width: "13px", height: "13px" }} />
                <span>Replace</span>
              </button>

              <button
                type="button"
                onClick={handleRemoveLetterhead}
                disabled={uploading}
                style={{
                  height: "36px",
                  padding: "0 14px",
                  borderRadius: "8px",
                  border: "1.5px solid #fecaca",
                  backgroundColor: "#fff5f5",
                  color: "#dc2626",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fee2e2")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff5f5")}
                title="Remove letterhead"
              >
                <Trash2 style={{ width: "13px", height: "13px" }} />
                <span>Remove</span>
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div
          style={{
            borderRadius: "8px",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            padding: "10px 14px",
            fontSize: "12px",
            color: "#dc2626",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <AlertCircle style={{ width: "16px", height: "16px", flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Content Area: Uploaded Preview OR Clean Dropzone */}
      {letterheadUrl ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            {/* Metadata Card */}
            <div
              style={{
                borderRadius: "12px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                padding: "18px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                fontSize: "12px",
              }}
            >
              <div>
                <span style={{ fontSize: "10.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                  Active File
                </span>
                <p style={{ fontWeight: 700, fontSize: "13px", color: "#0f172a", margin: "4px 0 0 0", wordBreak: "break-all" }}>
                  {letterheadFilename || (isPdf ? "letterhead.pdf" : "letterhead.png")}
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: "6px",
                    backgroundColor: "#eff6ff",
                    color: "#1d4ed8",
                    fontWeight: 700,
                    fontSize: "11px",
                    border: "1px solid #bfdbfe",
                  }}
                >
                  {isPdf ? "PDF Document" : "Raster Image"}
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "11px",
                    color: "#059669",
                    fontWeight: 600,
                  }}
                >
                  <ShieldCheck style={{ width: "13px", height: "13px" }} />
                  Tenant Isolated
                </span>
              </div>

              {formattedDate && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b", fontSize: "11.5px", borderTop: "1px solid #e2e8f0", paddingTop: "10px" }}>
                  <Calendar style={{ width: "13px", height: "13px", color: "#94a3b8" }} />
                  <span>Uploaded on {formattedDate}</span>
                </div>
              )}

              <div style={{ paddingTop: "4px" }}>
                <a
                  href={letterheadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#2563eb",
                    textDecoration: "none",
                  }}
                >
                  <span>Open raw file in new tab</span>
                  <ExternalLink style={{ width: "12px", height: "12px" }} />
                </a>
              </div>
            </div>

            {/* Visual Preview Card */}
            <div
              style={{
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#f1f5f9",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "220px",
                maxHeight: "320px",
              }}
            >
              {isPdf ? (
                <iframe
                  src={`${letterheadUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                  title="Letterhead PDF Preview"
                  style={{ width: "100%", height: "300px", border: "none" }}
                />
              ) : (
                <div style={{ padding: "16px", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={letterheadUrl}
                    alt="Letterhead Preview"
                    style={{
                      maxHeight: "260px",
                      maxWidth: "100%",
                      objectFit: "contain",
                      borderRadius: "8px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                      backgroundColor: "#ffffff",
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Usage Preferences */}
          <div
            style={{
              padding: "16px 20px",
              borderRadius: "12px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <div>
              <p style={{ fontSize: "12.5px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                Apply Letterhead to Generated Documents
              </p>
              <p style={{ fontSize: "11px", color: "#64748b", margin: "2px 0 0 0" }}>
                Select which document types automatically embed this official background.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "18px", fontSize: "12px", fontWeight: 600 }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", color: "#1e293b" }}>
                <input
                  type="checkbox"
                  checked={forQuotes}
                  disabled={savingPrefs}
                  onChange={(e) => handleTogglePreference("quotations", e.target.checked)}
                  style={{ width: "15px", height: "15px", accentColor: "#2563eb", cursor: "pointer" }}
                />
                <span>Quotations</span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", color: "#1e293b" }}>
                <input
                  type="checkbox"
                  checked={forMous}
                  disabled={savingPrefs}
                  onChange={(e) => handleTogglePreference("mous", e.target.checked)}
                  style={{ width: "15px", height: "15px", accentColor: "#2563eb", cursor: "pointer" }}
                />
                <span>MOUs & Agreements</span>
              </label>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State / Upload Dropzone */
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                const fakeEvent = {
                  target: { files: e.dataTransfer.files },
                } as any;
                handleFileChange(fakeEvent);
              }
            }}
            style={{
              borderRadius: "14px",
              border: isDragging ? "2px solid #2563eb" : "2px dashed #cbd5e1",
              backgroundColor: isDragging ? "#eff6ff" : "#f8fafc",
              padding: "40px 24px",
              textAlign: "center",
              cursor: uploading ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: "#eff6ff",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px auto",
              }}
            >
              <Upload style={{ width: "22px", height: "22px" }} />
            </div>

            <p style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
              {uploading ? "Uploading letterhead document..." : "Click to browse or drop official letterhead file"}
            </p>
            <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0 0 0" }}>
              Supports vector PDF or high-resolution PNG, JPG, WebP (up to 5MB)
            </p>
          </div>

          {/* Letterhead Feature Highlights */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "14px",
            }}
          >
            <div
              style={{
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#f8fafc",
                padding: "14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <CheckCircle2 style={{ width: "15px", height: "15px", color: "#2563eb" }} />
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>Vector PDF Support</span>
              </div>
              <p style={{ fontSize: "11px", color: "#64748b", margin: 0, lineHeight: 1.4 }}>
                Upload crisp vector PDFs for pixel-perfect printing and lossless document exports.
              </p>
            </div>

            <div
              style={{
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#f8fafc",
                padding: "14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <Layers style={{ width: "15px", height: "15px", color: "#7c3aed" }} />
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>Automatic Background</span>
              </div>
              <p style={{ fontSize: "11px", color: "#64748b", margin: 0, lineHeight: 1.4 }}>
                Automatically applies behind document line items and legal clauses on PDF generation.
              </p>
            </div>

            <div
              style={{
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#f8fafc",
                padding: "14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <ShieldCheck style={{ width: "15px", height: "15px", color: "#059669" }} />
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>Tenant Isolated</span>
              </div>
              <p style={{ fontSize: "11px", color: "#64748b", margin: 0, lineHeight: 1.4 }}>
                Stored in encrypted private storage accessible strictly to your organization.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
