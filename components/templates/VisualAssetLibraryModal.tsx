"use client";

import React, { useState, useEffect, useRef } from "react";
import { notifySuccess } from "@/lib/ui/success-notification";
import {
  X,
  UploadCloud,
  Trash2,
  Copy,
  Check,
  Loader2,
  Image as ImageIcon,
  Layers,
  AlertCircle,
  FileCheck,
} from "lucide-react";

interface VisualAsset {
  id: string;
  name: string;
  category: string;
  fileUrl: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  dimensions?: string | null;
  createdAt: string;
}

interface VisualAssetLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { id: "ALL", label: "All Assets" },
  { id: "LOGO", label: "Logos" },
  { id: "ALT_LOGO", label: "Alternate Logos" },
  { id: "HEADER", label: "Headers" },
  { id: "FOOTER", label: "Footers" },
  { id: "WATERMARK", label: "Watermarks" },
  { id: "SIGNATURE", label: "Signatures" },
  { id: "DECORATIVE", label: "Decorative" },
];

export default function VisualAssetLibraryModal({
  isOpen,
  onClose,
}: VisualAssetLibraryModalProps) {
  const [assets, setAssets] = useState<VisualAsset[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState("LOGO");
  const [uploadName, setUploadName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAssets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const url =
        selectedCategory === "ALL"
          ? "/api/v1/organization/assets"
          : `/api/v1/organization/assets?category=${selectedCategory}`;

      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setAssets(data.data.assets || []);
      }
    } catch {
      setError("Failed to load visual assets.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAssets();
    }
  }, [isOpen, selectedCategory]);

  if (!isOpen) return null;

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    try {
      setIsUploading(true);
      setError(null);
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("category", uploadCategory);
      formData.append("name", uploadName.trim() || uploadFile.name);

      const res = await fetch("/api/v1/organization/assets", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to upload asset.");
      }

      setUploadFile(null);
      setUploadName("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      notifySuccess("File uploaded successfully.");
      fetchAssets();
    } catch (err: any) {
      setError(err.message || "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this asset?")) return;
    try {
      const res = await fetch(`/api/v1/organization/assets/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setAssets((prev) => prev.filter((a) => a.id !== id));
      }
    } catch {
      setError("Failed to delete asset.");
    }
  };

  const handleCopyUrl = (asset: VisualAsset) => {
    navigator.clipboard.writeText(asset.fileUrl);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        padding: "16px",
        backdropFilter: "blur(4px)",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
          width: "100%",
          maxWidth: "860px",
          borderRadius: "16px",
          backgroundColor: "#ffffff",
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
          border: "1px solid #cbd5e1",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 22px",
            borderBottom: "1px solid #e2e8f0",
            backgroundColor: "#f8fafc",
            boxSizing: "border-box",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "16px",
                fontWeight: 800,
                color: "#0f172a",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Layers style={{ width: "18px", height: "18px", color: "#2563eb" }} />
              Organization Visual Asset Library
            </h2>
            <p style={{ fontSize: "12px", color: "#64748b", margin: "3px 0 0 0" }}>
              Manage logos, watermarks, signatures, headers, and visual media with tenant isolation
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "6px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "transparent",
              color: "#94a3b8",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background-color 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#e2e8f0";
              e.currentTarget.style.color = "#0f172a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#94a3b8";
            }}
            title="Close"
          >
            <X style={{ width: "20px", height: "20px" }} />
          </button>
        </div>

        {/* Upload Drawer / Strip */}
        <div
          style={{
            borderBottom: "1px solid #e2e8f0",
            backgroundColor: "#f8fafc",
            padding: "14px 22px",
            boxSizing: "border-box",
          }}
        >
          <form
            onSubmit={handleUpload}
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "10px",
            }}
          >
            {/* Custom file button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  const f = e.target.files[0];
                  setUploadFile(f);
                  if (!uploadName) {
                    setUploadName(f.name.replace(/\.[^/.]+$/, ""));
                  }
                }
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                height: "36px",
                padding: "0 14px",
                borderRadius: "8px",
                border: "1.5px solid #cbd5e1",
                backgroundColor: "#ffffff",
                color: "#1e293b",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
              }}
            >
              <UploadCloud style={{ width: "15px", height: "15px", color: "#2563eb" }} />
              <span>{uploadFile ? uploadFile.name : "Choose File"}</span>
            </button>

            {/* Asset Name input */}
            <input
              type="text"
              placeholder="Asset Name (e.g. Primary Dark Logo)"
              value={uploadName}
              onChange={(e) => setUploadName(e.target.value)}
              style={{
                height: "36px",
                flex: "1 1 180px",
                minWidth: "160px",
                padding: "0 12px",
                borderRadius: "8px",
                border: "1.5px solid #cbd5e1",
                backgroundColor: "#ffffff",
                fontSize: "12px",
                color: "#0f172a",
                outline: "none",
                boxSizing: "border-box",
              }}
            />

            {/* Category select */}
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              style={{
                height: "36px",
                padding: "0 12px",
                borderRadius: "8px",
                border: "1.5px solid #cbd5e1",
                backgroundColor: "#ffffff",
                fontSize: "12px",
                color: "#0f172a",
                outline: "none",
                cursor: "pointer",
                boxSizing: "border-box",
              }}
            >
              <option value="LOGO">Logo</option>
              <option value="ALT_LOGO">Alternate Logo</option>
              <option value="HEADER">Header Graphic</option>
              <option value="FOOTER">Footer Graphic</option>
              <option value="WATERMARK">Watermark</option>
              <option value="SIGNATURE">Authorized Signature</option>
              <option value="DECORATIVE">Decorative Element</option>
              <option value="OTHER">Other</option>
            </select>

            {/* Upload Button */}
            <button
              type="submit"
              disabled={isUploading || !uploadFile}
              style={{
                height: "36px",
                padding: "0 16px",
                borderRadius: "8px",
                backgroundColor: isUploading || !uploadFile ? "#94a3b8" : "#2563eb",
                color: "#ffffff",
                fontSize: "12px",
                fontWeight: 700,
                border: "none",
                cursor: isUploading || !uploadFile ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 1px 3px rgba(37,99,235,0.25)",
                transition: "background-color 0.15s ease",
              }}
            >
              {isUploading ? (
                <>
                  <Loader2 style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <FileCheck style={{ width: "14px", height: "14px" }} />
                  <span>Upload Asset</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Category Pills Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            overflowX: "auto",
            borderBottom: "1px solid #e2e8f0",
            padding: "10px 22px",
            backgroundColor: "#f8fafc",
            boxSizing: "border-box",
          }}
        >
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  height: "30px",
                  padding: "0 12px",
                  borderRadius: "9999px",
                  fontSize: "11.5px",
                  fontWeight: isActive ? 700 : 500,
                  cursor: "pointer",
                  border: isActive ? "none" : "1px solid #e2e8f0",
                  backgroundColor: isActive ? "#2563eb" : "#ffffff",
                  color: isActive ? "#ffffff" : "#475569",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease",
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Assets Grid Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "22px",
            backgroundColor: "#ffffff",
            boxSizing: "border-box",
          }}
        >
          {error && (
            <div
              style={{
                marginBottom: "16px",
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

          {isLoading ? (
            <div style={{ display: "flex", height: "200px", alignItems: "center", justifyContent: "center" }}>
              <Loader2 style={{ width: "24px", height: "24px", color: "#2563eb", animation: "spin 1s linear infinite" }} />
            </div>
          ) : assets.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "48px 16px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  backgroundColor: "#f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#94a3b8",
                  marginBottom: "12px",
                }}
              >
                <ImageIcon style={{ width: "28px", height: "28px" }} />
              </div>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                No assets found in this category
              </h3>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0 0 0", maxWidth: "340px" }}>
                Upload your company logos, alternate logos, header graphics, or signatures using the form above.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: "14px",
              }}
            >
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    backgroundColor: "#ffffff",
                    padding: "10px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      height: "110px",
                      width: "100%",
                      borderRadius: "8px",
                      backgroundColor: "#f8fafc",
                      border: "1px solid #f1f5f9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      padding: "8px",
                      boxSizing: "border-box",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset.fileUrl}
                      alt={asset.name}
                      style={{
                        maxHeight: "100%",
                        maxWidth: "100%",
                        objectFit: "contain",
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        top: "6px",
                        left: "6px",
                        borderRadius: "4px",
                        backgroundColor: "rgba(15, 23, 42, 0.75)",
                        padding: "2px 5px",
                        fontSize: "8.5px",
                        fontWeight: 700,
                        color: "#ffffff",
                        textTransform: "uppercase",
                      }}
                    >
                      {asset.category}
                    </span>
                  </div>

                  <div style={{ marginTop: "8px", flex: 1 }}>
                    <p
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#0f172a",
                        margin: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={asset.name}
                    >
                      {asset.name}
                    </p>
                    <p style={{ fontSize: "10px", color: "#64748b", margin: "2px 0 0 0" }}>
                      {(asset.sizeBytes / 1024).toFixed(0)} KB • {asset.mimeType.split("/")[1]?.toUpperCase()}
                    </p>
                  </div>

                  <div
                    style={{
                      marginTop: "8px",
                      paddingTop: "8px",
                      borderTop: "1px solid #f1f5f9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(asset)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#2563eb",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      {copiedId === asset.id ? (
                        <>
                          <Check style={{ width: "12px", height: "12px", color: "#059669" }} />
                          <span style={{ color: "#059669" }}>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy style={{ width: "12px", height: "12px" }} />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(asset.id)}
                      style={{
                        color: "#94a3b8",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "4px",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#dc2626")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                      title="Delete asset"
                    >
                      <Trash2 style={{ width: "14px", height: "14px" }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            borderTop: "1px solid #e2e8f0",
            padding: "12px 22px",
            backgroundColor: "#f8fafc",
            boxSizing: "border-box",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              height: "36px",
              padding: "0 18px",
              borderRadius: "8px",
              backgroundColor: "#ffffff",
              border: "1.5px solid #cbd5e1",
              fontSize: "12px",
              fontWeight: 600,
              color: "#475569",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
