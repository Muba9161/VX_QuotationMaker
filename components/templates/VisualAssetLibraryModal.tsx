"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  UploadCloud,
  Trash2,
  Copy,
  Check,
  Loader2,
  Image as ImageIcon,
  Sparkles,
  Layers,
  AlertCircle,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="h-5 w-5 text-blue-600" /> Organization Visual Asset Library
            </h2>
            <p className="text-xs text-slate-500">
              Manage logos, watermarks, signatures, headers, and visual media with tenant isolation
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Upload Drawer / Strip */}
        <div className="border-b border-slate-200 bg-blue-50/40 p-4">
          <form onSubmit={handleUpload} className="flex flex-wrap items-center gap-3">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setUploadFile(e.target.files[0]);
                  if (!uploadName) {
                    setUploadName(e.target.files[0].name.replace(/\.[^/.]+$/, ""));
                  }
                }
              }}
              className="text-xs text-slate-600 file:mr-2 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-blue-700"
            />
            <input
              type="text"
              placeholder="Asset Name (optional)"
              value={uploadName}
              onChange={(e) => setUploadName(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[160px]"
            />
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            <button
              type="submit"
              disabled={isUploading || !uploadFile}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <UploadCloud className="h-3.5 w-3.5" /> Upload Asset
                </>
              )}
            </button>
          </form>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 px-6 py-2.5 bg-slate-50">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Assets Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ImageIcon className="h-12 w-12 text-slate-300 mb-2" />
              <h3 className="text-sm font-semibold text-slate-700">No assets found in this category</h3>
              <p className="text-xs text-slate-400 mt-1">
                Upload your company logos, alternate logos, header graphics, or signatures above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="group relative flex flex-col rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative h-28 w-full rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset.fileUrl}
                      alt={asset.name}
                      className="max-h-full max-w-full object-contain"
                    />
                    <span className="absolute top-1.5 left-1.5 rounded bg-slate-900/70 px-1.5 py-0.5 text-[9px] font-semibold text-white uppercase">
                      {asset.category}
                    </span>
                  </div>

                  <div className="mt-2 flex-1">
                    <p className="text-xs font-semibold text-slate-800 line-clamp-1" title={asset.name}>
                      {asset.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {(asset.sizeBytes / 1024).toFixed(0)} KB • {asset.mimeType.split("/")[1]?.toUpperCase()}
                    </p>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => handleCopyUrl(asset)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700"
                    >
                      {copiedId === asset.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-600" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" /> Copy URL
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(asset.id)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded"
                      title="Delete asset"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-200 px-6 py-3 bg-slate-50">
          <button
            onClick={onClose}
            className="rounded-lg bg-white border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

