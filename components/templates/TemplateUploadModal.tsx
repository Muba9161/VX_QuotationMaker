"use client";

import React, { useState } from "react";
import { X, UploadCloud, Loader2, FileCheck, AlertCircle } from "lucide-react";

interface TemplateUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TemplateUploadModal({
  isOpen,
  onClose,
  onSuccess,
}: TemplateUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"QUOTATION" | "MOU" | "LETTERHEAD">("QUOTATION");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit.");
        return;
      }
      setFile(selected);
      if (!title) {
        // Auto-populate title without extension
        const cleanName = selected.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a template document file.");
      return;
    }
    if (!title.trim()) {
      setError("Please enter a template title.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title.trim());
      formData.append("category", category);
      formData.append("description", description.trim());
      if (tags.trim()) {
        formData.append("tags", tags.trim());
      }

      const res = await fetch("/api/v1/templates/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to upload template.");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Upload failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Upload Organization Template</h2>
            <p className="text-xs text-slate-500">
              Upload custom reference templates (PDF, DOCX, PNG, JPG)
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* File Upload Zone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Template File <span className="text-red-500">*</span>
            </label>
            <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-colors">
              <UploadCloud className="h-8 w-8 text-slate-400 mb-1" />
              <span className="text-xs font-semibold text-slate-700">
                {file ? file.name : "Click to select or drag and drop file"}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                PDF, Word (.docx), PNG, JPG up to 5MB
              </span>
              <input
                type="file"
                accept=".pdf,.docx,.doc,image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Template Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Master Services Agreement 2026"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="QUOTATION">Quotation Template</option>
              <option value="MOU">MOU / Agreement Template</option>
              <option value="LETTERHEAD">Letterhead Template</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief overview of clauses, scope or standard terms..."
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tags (Comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="consulting, engineering, retainer"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !file || !title.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <FileCheck className="h-3.5 w-3.5" /> Save Template
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

