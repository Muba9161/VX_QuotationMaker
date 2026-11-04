"use client";

import React, { useRef, useState } from "react";
import { notifySuccess } from "@/lib/ui/success-notification";
import {
  Upload,
  X,
  RefreshCw,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";

interface TemplateImageModalProps {
  template: {
    id: string;
    title: string;
    imageUrl?: string | null;
    imageFilename?: string | null;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function TemplateImageModal({
  template,
  isOpen,
  onClose,
  onSuccess,
}: TemplateImageModalProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccessMsg(null);

    const mime = file.type.toLowerCase();
    if (!ALLOWED_MIME_TYPES.includes(mime)) {
      setError("Unsupported format. Allowed: PNG, JPG, JPEG, WebP.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds 5MB limit.`);
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/v1/templates/${template.id}/image`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.success) {
        setError(json?.error?.message || "Failed to upload template image.");
        return;
      }

      notifySuccess("Template image uploaded successfully.");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 900);
    } catch {
      setError("Network error uploading template image.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = async () => {
    if (!confirm("Are you sure you want to remove this template image?")) return;

    try {
      setUploading(true);
      setError(null);
      const res = await fetch(`/api/v1/templates/${template.id}/image`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        setError("Failed to remove template image.");
        return;
      }

      setSuccessMsg("Template image removed.");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 700);
    } catch {
      setError("Network error removing template image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-blue-600" />
              Template Image Branding
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Template: <span className="font-semibold text-slate-700">{template.title}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Current Image or Upload Zone */}
        {template.imageUrl ? (
          <div className="space-y-3">
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 p-3 flex items-center justify-center min-h-[160px] max-h-[220px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={template.imageUrl}
                alt="Template header preview"
                className="max-h-[180px] max-w-full object-contain rounded-lg shadow-2xs"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 truncate" title={template.imageFilename || "template-image"}>
                {template.imageFilename || "Header Image Attached"}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-medium cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Replace</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={uploading}
                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-red-200 hover:bg-red-50 text-red-600 rounded-lg font-medium cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
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
                {uploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {uploading ? "Uploading image..." : "Click to upload template image"}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  PNG, JPG, JPEG, or WebP up to 5MB
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
