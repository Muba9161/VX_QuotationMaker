"use client";

import React, { useRef, useState } from "react";
import { Upload, Trash2, Image as ImageIcon, Loader2, Sparkles } from "lucide-react";

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
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
      {/* 1. Primary Company Logo Card */}
      <div
        style={{
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          backgroundColor: "#ffffff",
          padding: "22px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxSizing: "border-box",
        }}
      >
        <div>
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #f1f5f9",
              paddingBottom: "12px",
            }}
          >
            <div>
              <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                Primary Company Logo
              </h3>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
                Appears on quotations, MOUs, PDFs, and client portal
              </p>
            </div>
            <span
              style={{
                borderRadius: "9999px",
                backgroundColor: "#eff6ff",
                border: "1px solid #bfdbfe",
                padding: "2px 8px",
                fontSize: "10.5px",
                fontWeight: 700,
                color: "#1d4ed8",
              }}
            >
              Required
            </span>
          </div>

          {/* Logo Preview Canvas */}
          <div
            style={{
              marginTop: "16px",
              height: "140px",
              width: "100%",
              borderRadius: "12px",
              border: "1.5px solid #e2e8f0",
              backgroundColor: "#f8fafc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
              boxSizing: "border-box",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt="Primary Logo"
                style={{
                  maxHeight: "100px",
                  maxWidth: "90%",
                  objectFit: "contain",
                }}
              />
            ) : (
              <div style={{ textAlign: "center", color: "#94a3b8" }}>
                <ImageIcon style={{ width: "36px", height: "36px", margin: "0 auto 6px auto", color: "#cbd5e1" }} />
                <span style={{ fontSize: "12px", fontWeight: 600, display: "block" }}>No primary logo uploaded</span>
              </div>
            )}

            {uploadingPrimary && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: "rgba(255,255,255,0.85)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(2px)",
                }}
              >
                <Loader2 style={{ width: "24px", height: "24px", color: "#2563eb", animation: "spin 1s linear infinite" }} />
              </div>
            )}
          </div>

          <p style={{ marginTop: "10px", fontSize: "11px", color: "#94a3b8", lineHeight: 1.4 }}>
            Recommended: PNG or SVG with transparent background, ~400×120px. Max 5MB.
          </p>
        </div>

        {/* Buttons Bar */}
        <div
          style={{
            marginTop: "16px",
            paddingTop: "14px",
            borderTop: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <input
            ref={primaryInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={(e) => {
              if (e.target.files?.[0]) handleUpload(e.target.files[0], false);
            }}
            style={{ display: "none" }}
          />

          <button
            type="button"
            onClick={() => primaryInputRef.current?.click()}
            disabled={uploadingPrimary}
            style={{
              flex: 1,
              height: "36px",
              padding: "0 16px",
              borderRadius: "8px",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: 700,
              border: "none",
              cursor: uploadingPrimary ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              boxShadow: "0 1px 2px rgba(37,99,235,0.2)",
              transition: "background-color 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1d4ed8")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
          >
            <Upload style={{ width: "14px", height: "14px" }} />
            <span>{logoUrl ? "Replace Logo" : "Upload Logo"}</span>
          </button>

          {logoUrl && (
            <button
              type="button"
              onClick={() => handleRemove(false)}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                border: "1.5px solid #fecaca",
                backgroundColor: "#fff5f5",
                color: "#dc2626",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fee2e2")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff5f5")}
              title="Remove Primary Logo"
            >
              <Trash2 style={{ width: "15px", height: "15px" }} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Alternate / Dark Mode Logo Card */}
      <div
        style={{
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          backgroundColor: "#ffffff",
          padding: "22px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxSizing: "border-box",
        }}
      >
        <div>
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #f1f5f9",
              paddingBottom: "12px",
            }}
          >
            <div>
              <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                Alternate / Dark Mode Logo
              </h3>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
                Optional white or monochrome variant for dark headers
              </p>
            </div>
            <span
              style={{
                borderRadius: "9999px",
                backgroundColor: "#f1f5f9",
                border: "1px solid #e2e8f0",
                padding: "2px 8px",
                fontSize: "10.5px",
                fontWeight: 700,
                color: "#64748b",
              }}
            >
              Optional
            </span>
          </div>

          {/* Dark Logo Preview Canvas */}
          <div
            style={{
              marginTop: "16px",
              height: "140px",
              width: "100%",
              borderRadius: "12px",
              border: "1.5px solid #1e293b",
              backgroundColor: "#0f172a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
              boxSizing: "border-box",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {alternateLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={alternateLogoUrl}
                alt="Alternate Logo"
                style={{
                  maxHeight: "100px",
                  maxWidth: "90%",
                  objectFit: "contain",
                }}
              />
            ) : (
              <div style={{ textAlign: "center", color: "#64748b" }}>
                <Sparkles style={{ width: "36px", height: "36px", margin: "0 auto 6px auto", color: "#334155" }} />
                <span style={{ fontSize: "12px", fontWeight: 600, display: "block" }}>No alternate logo uploaded</span>
              </div>
            )}

            {uploadingAlt && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: "rgba(15, 23, 42, 0.85)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(2px)",
                }}
              >
                <Loader2 style={{ width: "24px", height: "24px", color: "#60a5fa", animation: "spin 1s linear infinite" }} />
              </div>
            )}
          </div>

          <p style={{ marginTop: "10px", fontSize: "11px", color: "#94a3b8", lineHeight: 1.4 }}>
            Best for white or inverted vector logos used on dark backgrounds or colored headers.
          </p>
        </div>

        {/* Buttons Bar */}
        <div
          style={{
            marginTop: "16px",
            paddingTop: "14px",
            borderTop: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <input
            ref={altInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={(e) => {
              if (e.target.files?.[0]) handleUpload(e.target.files[0], true);
            }}
            style={{ display: "none" }}
          />

          <button
            type="button"
            onClick={() => altInputRef.current?.click()}
            disabled={uploadingAlt}
            style={{
              flex: 1,
              height: "36px",
              padding: "0 16px",
              borderRadius: "8px",
              border: "1.5px solid #cbd5e1",
              backgroundColor: "#ffffff",
              color: "#334155",
              fontSize: "12px",
              fontWeight: 600,
              cursor: uploadingAlt ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
          >
            <Upload style={{ width: "14px", height: "14px", color: "#64748b" }} />
            <span>{alternateLogoUrl ? "Replace Alternate Logo" : "Upload Alternate Logo"}</span>
          </button>

          {alternateLogoUrl && (
            <button
              type="button"
              onClick={() => handleRemove(true)}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                border: "1.5px solid #fecaca",
                backgroundColor: "#fff5f5",
                color: "#dc2626",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fee2e2")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff5f5")}
              title="Remove Alternate Logo"
            >
              <Trash2 style={{ width: "15px", height: "15px" }} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
