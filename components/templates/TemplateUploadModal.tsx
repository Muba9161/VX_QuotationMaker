"use client";

import React, { useState, useRef } from "react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          width: "100%",
          maxWidth: "520px",
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
            <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Upload Organization Template
            </h2>
            <p style={{ fontSize: "12px", color: "#64748b", margin: "3px 0 0 0" }}>
              Upload custom reference templates (PDF, DOCX, PNG, JPG)
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: "20px 22px", boxSizing: "border-box" }}>
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

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* File Upload Zone */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                Template File <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "12px",
                  border: file ? "2px solid #2563eb" : "2px dashed #cbd5e1",
                  backgroundColor: file ? "#eff6ff" : "#f8fafc",
                  padding: "18px 16px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <UploadCloud style={{ width: "28px", height: "28px", color: file ? "#2563eb" : "#94a3b8", marginBottom: "6px" }} />
                <span style={{ fontSize: "12.5px", fontWeight: 700, color: file ? "#1e40af" : "#334155" }}>
                  {file ? file.name : "Click to select or drag and drop file"}
                </span>
                <span style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                  PDF, Word (.docx), PNG, JPG up to 5MB
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "5px" }}>
                Template Title <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Master Services Agreement 2026"
                required
                style={{
                  width: "100%",
                  height: "38px",
                  padding: "0 12px",
                  borderRadius: "8px",
                  border: "1.5px solid #cbd5e1",
                  backgroundColor: "#ffffff",
                  fontSize: "12.5px",
                  color: "#0f172a",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Category */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "5px" }}>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                style={{
                  width: "100%",
                  height: "38px",
                  padding: "0 12px",
                  borderRadius: "8px",
                  border: "1.5px solid #cbd5e1",
                  backgroundColor: "#ffffff",
                  fontSize: "12.5px",
                  color: "#0f172a",
                  outline: "none",
                  cursor: "pointer",
                  boxSizing: "border-box",
                }}
              >
                <option value="QUOTATION">Quotation Template</option>
                <option value="MOU">MOU / Agreement Template</option>
                <option value="LETTERHEAD">Letterhead Template</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "5px" }}>
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief overview of clauses, scope or standard terms..."
                rows={2}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1.5px solid #cbd5e1",
                  backgroundColor: "#ffffff",
                  fontSize: "12.5px",
                  color: "#0f172a",
                  outline: "none",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Tags */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "5px" }}>
                Tags (Comma-separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="consulting, engineering, retainer"
                style={{
                  width: "100%",
                  height: "38px",
                  padding: "0 12px",
                  borderRadius: "8px",
                  border: "1.5px solid #cbd5e1",
                  backgroundColor: "#ffffff",
                  fontSize: "12.5px",
                  color: "#0f172a",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Actions Footer */}
          <div
            style={{
              marginTop: "20px",
              paddingTop: "14px",
              borderTop: "1px solid #f1f5f9",
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                height: "36px",
                padding: "0 16px",
                borderRadius: "8px",
                border: "1.5px solid #cbd5e1",
                backgroundColor: "#ffffff",
                color: "#475569",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !file || !title.trim()}
              style={{
                height: "36px",
                padding: "0 18px",
                borderRadius: "8px",
                backgroundColor: isSubmitting || !file || !title.trim() ? "#94a3b8" : "#2563eb",
                color: "#ffffff",
                fontSize: "12.5px",
                fontWeight: 700,
                border: "none",
                cursor: isSubmitting || !file || !title.trim() ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 1px 3px rgba(37,99,235,0.25)",
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <FileCheck style={{ width: "14px", height: "14px" }} />
                  <span>Save Template</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
