"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import OrgLayout from "@/components/OrgLayout";
import ConfirmModal from "@/components/ConfirmModal";
import {
  Plus,
  Upload,
  Layers,
  Loader2,
  FileCheck2,
} from "lucide-react";
import TemplateCard, { TemplateDisplayItem } from "@/components/templates/TemplateCard";
import TemplatePreviewModal from "@/components/templates/TemplatePreviewModal";
import TemplateUploadModal from "@/components/templates/TemplateUploadModal";
import VisualAssetLibraryModal from "@/components/templates/VisualAssetLibraryModal";
import TemplateCategoryTabs from "@/components/templates/TemplateCategoryTabs";
import TemplateImageModal from "@/components/templates/TemplateImageModal";
import ShareModal from "@/components/sharing/ShareModal";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateDisplayItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedScope, setSelectedScope] = useState<"all" | "sample" | "org">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [previewTemplate, setPreviewTemplate] = useState<TemplateDisplayItem | null>(null);
  const [shareCandidate, setShareCandidate] = useState<TemplateDisplayItem | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAssetLibOpen, setIsAssetLibOpen] = useState(false);
  const [imageModalTemplate, setImageModalTemplate] = useState<{ id: string; title: string; imageUrl?: string | null } | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<TemplateDisplayItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/v1/templates?includeSamples=true");
      const json = await res.json();
      if (res.ok && Array.isArray(json.data)) {
        setTemplates(json.data);
      }
    } catch {
      // Graceful fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const counts = useMemo(() => {
    return {
      all: templates.length,
      quotation: templates.filter((t) => (t.category || t.type) === "QUOTATION").length,
      mou: templates.filter((t) => (t.category || t.type) === "MOU").length,
      letterhead: templates.filter((t) => (t.category || t.type) === "LETTERHEAD").length,
    };
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const cat = (t.category || t.type || "QUOTATION").toUpperCase();

      // Category filter
      if (selectedCategory !== "ALL" && cat !== selectedCategory) {
        return false;
      }

      // Scope filter
      if (selectedScope === "sample" && !t.isSample) return false;
      if (selectedScope === "org" && t.isSample) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(query);
        const matchDesc = t.description?.toLowerCase().includes(query) || false;
        const matchStyle = t.styleTag?.toLowerCase().includes(query) || false;
        return matchTitle || matchDesc || matchStyle;
      }

      return true;
    });
  }, [templates, selectedCategory, selectedScope, searchQuery]);

  const handleDuplicate = async (template: TemplateDisplayItem) => {
    try {
      const res = await fetch(`/api/v1/templates/${template.id}/duplicate`, {
        method: "POST",
      });
      if (res.ok) {
        await fetchTemplates();
        setSelectedScope("org");
      }
    } catch {
      // Error handling
    }
  };

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/v1/templates/${deleteCandidate.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTemplates((prev) => prev.filter((t) => t.id !== deleteCandidate.id));
        setDeleteCandidate(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <OrgLayout>
      <div className="flex flex-col gap-6">
        {/* Header with Title and Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight sm:text-2xl">
              Template Library
            </h1>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Explore professionally designed templates or manage your organization&apos;s custom templates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAssetLibOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
            >
              <Layers className="h-4 w-4 text-slate-500" /> Visual Assets
            </button>

            <button
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
            >
              <Upload className="h-4 w-4 text-blue-600" /> Upload Template
            </button>

            <Link
              href="/templates/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" /> Create Template
            </Link>
          </div>
        </div>

        {/* Category Tabs & Scope Filters */}
        <TemplateCategoryTabs
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedScope={selectedScope}
          onSelectScope={setSelectedScope}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          counts={counts}
        />

        {/* Content Area */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 px-4 text-center">
            <FileCheck2 className="h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-sm font-semibold text-slate-800">No templates found</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm">
              {searchQuery
                ? `No templates matched "${searchQuery}". Try a different keyword.`
                : "No templates in this category yet. Upload a template or create one from scratch."}
            </p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  setSelectedCategory("ALL");
                  setSelectedScope("all");
                  setSearchQuery("");
                }}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Reset Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onPreview={setPreviewTemplate}
                onDuplicate={handleDuplicate}
                onShare={setShareCandidate}
                onDelete={(t) => setDeleteCandidate(t)}
                onManageImage={(t) => setImageModalTemplate({ id: t.id, title: t.title, imageUrl: t.imageUrl })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Share Template Modal */}
      {shareCandidate && (
        <ShareModal
          isOpen={Boolean(shareCandidate)}
          onClose={() => setShareCandidate(null)}
          documentId={shareCandidate.id}
          docNumber=""
          docTitle={shareCandidate.title}
          docType="TEMPLATE"
        />
      )}

      {/* Preview Modal */}
      <TemplatePreviewModal
        template={previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onDuplicate={handleDuplicate}
        onShare={setShareCandidate}
      />

      {/* Upload Modal */}
      <TemplateUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={fetchTemplates}
      />

      {/* Visual Asset Library Modal */}
      <VisualAssetLibraryModal
        isOpen={isAssetLibOpen}
        onClose={() => setIsAssetLibOpen(false)}
      />

      {/* Manage Image Modal */}
      {imageModalTemplate && (
        <TemplateImageModal
          template={imageModalTemplate}
          isOpen={true}
          onClose={() => setImageModalTemplate(null)}
          onSuccess={() => {
            setImageModalTemplate(null);
            fetchTemplates();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteCandidate)}
        title="Delete Template"
        description={`Are you sure you want to delete "${deleteCandidate?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isConfirming={isDeleting}
        onClose={() => setDeleteCandidate(null)}
        onConfirm={confirmDelete}
      />
    </OrgLayout>
  );
}
