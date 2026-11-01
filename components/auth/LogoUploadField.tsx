"use client";

import React, { useRef, useState } from "react";
import { Upload, X, RefreshCw, AlertCircle, Image as ImageIcon } from "lucide-react";

interface LogoUploadFieldProps {
  onLogoChange: (data: {
    base64: string | null;
    filename: string | null;
    mimeType: string | null;
  }) => void;
  disabled?: boolean;
}

const ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export default function LogoUploadField({ onLogoChange, disabled }: LogoUploadFieldProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setError(null);

    const normalizedMime = file.type.toLowerCase();
    if (!ALLOWED_MIME_TYPES.includes(normalizedMime)) {
      setError("Unsupported file format. Please upload a PNG, JPG, JPEG, or WebP image.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit of 5MB.`);
      return;
    }

    if (file.size === 0) {
      setError("Cannot upload an empty file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      setFileName(file.name);
      setFileSize(file.size);
      onLogoChange({
        base64: result,
        filename: file.name,
        mimeType: normalizedMime,
      });
    };
    reader.onerror = () => {
      setError("Failed to read image file. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setFileName(null);
    setFileSize(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onLogoChange({ base64: null, filename: null, mimeType: null });
  };

  const handleReplaceClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block font-semibold text-slate-700 text-xs">
          Organization Logo <span className="text-slate-400 font-normal">(Optional)</span>
        </label>
        {preview && (
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            Logo attached
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
        onChange={handleInputChange}
        disabled={disabled}
        className="hidden"
      />

      {error && (
        <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-[11px] flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!preview ? (
        <div
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-3.5 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/20 ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700">
                Upload Organization Logo
              </p>
              <p className="text-[10.5px] text-slate-400">
                PNG, JPG, JPEG, or WebP (max 5MB)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-2.5 border border-slate-200 rounded-xl bg-slate-50/60">
          <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 p-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Logo preview"
              className="max-w-full max-h-full object-contain"
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">
              {fileName || "organization-logo"}
            </p>
            <p className="text-[10.5px] text-slate-500">
              {fileSize ? `${(fileSize / 1024).toFixed(0)} KB` : "Image preview"}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleReplaceClick}
              disabled={disabled}
              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer text-[11px] font-medium flex items-center gap-1"
              title="Replace Logo"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Replace</span>
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Remove Logo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

