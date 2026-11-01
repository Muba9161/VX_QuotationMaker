"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  FileCheck2,
  Bookmark,
  Copy,
  Eye,
  Trash2,
  Image as ImageIcon,
  CheckCircle,
  Sparkles,
  Share2,
} from "lucide-react";

export interface TemplateDisplayItem {
  id: string;
  title: string;
  type: "QUOTATION" | "MOU" | "LETTERHEAD";
  category?: string;
  description?: string | null;
  isDefault?: boolean;
  isSample?: boolean;
  styleTag?: string;
  accentColor?: string;
  imageUrl?: string | null;
  fileUrl?: string | null;
  fileSource?: string;
  paymentTerms?: string;
  notes?: string;
  termsConditions?: string;
  lineItems?: Array<{ description: string; defaultQuantity: number; unit: string; defaultRate: number }>;
  items?: Array<{ id?: string; description: string; defaultQuantity: number; unit: string; defaultRate: number }>;
  clauses?: Array<{ id?: string; title: string; content: string; sortOrder?: number }>;
  letterheadConfig?: {
    layout: string;
    accentColor: string;
    headerTagline?: string;
    footerNote?: string;
  };
}

interface TemplateCardProps {
  template: TemplateDisplayItem;
  onPreview: (template: TemplateDisplayItem) => void;
  onDuplicate: (template: TemplateDisplayItem) => void;
  onShare?: (template: TemplateDisplayItem) => void;
  onDelete?: (template: TemplateDisplayItem) => void;
  onManageImage?: (template: TemplateDisplayItem) => void;
}

export default function TemplateCard({
  template,
  onPreview,
  onDuplicate,
  onShare,
  onDelete,
  onManageImage,
}: TemplateCardProps) {
  const isSample = Boolean(template.isSample);
  const accent = template.accentColor || "#2563EB";
  const category = (template.category || template.type || "QUOTATION").toUpperCase();

  const getActionUrl = () => {
    if (category === "MOU") {
      return `/mou/new?templateId=${encodeURIComponent(template.id)}`;
    }
    if (category === "LETTERHEAD") {
      return `/branding?letterheadId=${encodeURIComponent(template.id)}`;
    }
    return `/quotations/new?templateId=${encodeURIComponent(template.id)}`;
  };

  const getCategoryBadge = () => {
    switch (category) {
      case "MOU":
        return { label: "MOU", color: "bg-purple-100 text-purple-700 border-purple-200" };
      case "LETTERHEAD":
        return { label: "Letterhead", color: "bg-amber-100 text-amber-700 border-amber-200" };
      default:
        return { label: "Quotation", color: "bg-blue-100 text-blue-700 border-blue-200" };
    }
  };

  const catBadge = getCategoryBadge();

  // Extract real preview sample items
  const quoteItems = template.lineItems || template.items || [];
  const firstItem = quoteItems[0]?.description || "Strategic Consulting & System Setup";
  const secondItem = quoteItems[1]?.description || "Implementation & Deliverables";
  const firstRate = quoteItems[0]?.defaultRate ? `₹${quoteItems[0].defaultRate.toLocaleString()}` : "₹45,000";
  const secondRate = quoteItems[1]?.defaultRate ? `₹${quoteItems[1].defaultRate.toLocaleString()}` : "₹25,000";
  const totalVal = quoteItems.reduce((acc, it) => acc + (it.defaultRate * (it.defaultQuantity || 1)), 0);
  const displayTotal = totalVal > 0 ? `₹${totalVal.toLocaleString()}` : "₹70,000";

  // Extract real preview clauses
  const sampleClauses = template.clauses || [];
  const clause1 = sampleClauses[0]?.title || "1. Purpose & Scope of Engagement";
  const clause2 = sampleClauses[1]?.title || "2. Confidentiality & IP Rights";

  return (
    <div className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md overflow-hidden">
      {/* Top Accent Strip */}
      <div className="h-1.5 w-full" style={{ backgroundColor: accent }} />

      {/* Card Header: Category & Scope Badges with clear breathing room */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-white border-b border-slate-100">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${catBadge.color} shadow-2xs`}
        >
          {category === "MOU" ? (
            <FileCheck2 className="h-3 w-3" />
          ) : category === "LETTERHEAD" ? (
            <Bookmark className="h-3 w-3" />
          ) : (
            <FileText className="h-3 w-3" />
          )}
          {catBadge.label}
        </span>

        {isSample ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 shadow-2xs">
            <Sparkles className="h-3 w-3 text-indigo-500" />
            Platform Sample
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 shadow-2xs">
            <CheckCircle className="h-3 w-3 text-emerald-500" />
            My Organization
          </span>
        )}
      </div>

      {/* Mini Mockup Preview Area: Properly Scaled A4 Document Sheet */}
      <div
        onClick={() => onPreview(template)}
        className="relative h-56 w-full cursor-pointer bg-slate-50 border-b border-slate-200/90 flex items-end justify-center overflow-hidden group-hover:bg-slate-100/70 transition-colors pt-3"
        style={{
          backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
          backgroundSize: "14px 14px",
        }}
      >
        {/* Centered A4 Proportion Document Sheet */}
        <div className="w-[90%] max-w-[260px] h-[210px] bg-white rounded-t-lg shadow-sm border border-slate-200 border-b-0 p-3.5 flex flex-col justify-between pointer-events-none select-none transition-transform duration-200 group-hover:-translate-y-1 group-hover:shadow-md">
          {category === "QUOTATION" ? (
            /* Real Quotation Invoice Preview with High Visibility */
            <div className="flex flex-col justify-between h-full text-[9.5px] text-slate-700">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <div>
                  <span className="font-extrabold text-[11px] tracking-tight block leading-tight" style={{ color: accent }}>
                    QUOTATION
                  </span>
                  <span className="text-[8px] text-slate-400 font-mono">#VX-QTN-2026</span>
                </div>
                <div className="text-right">
                  <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    Estimate
                  </span>
                </div>
              </div>

              {/* Realistic Deliverables Schedule Table */}
              <div className="space-y-1.5 my-1">
                <div className="flex justify-between font-bold text-[8px] text-slate-400 border-b border-slate-100 pb-0.5 uppercase tracking-wider">
                  <span className="truncate max-w-[140px]">Deliverable / Service</span>
                  <span>Rate</span>
                </div>
                <div className="flex justify-between items-center text-slate-900">
                  <span className="truncate max-w-[150px] font-semibold text-[9px]">{firstItem}</span>
                  <span className="font-mono text-[9px] font-medium text-slate-600">{firstRate}</span>
                </div>
                <div className="flex justify-between items-center text-slate-900">
                  <span className="truncate max-w-[150px] font-semibold text-[9px]">{secondItem}</span>
                  <span className="font-mono text-[9px] font-medium text-slate-600">{secondRate}</span>
                </div>
              </div>

              {/* Authorized Total Box */}
              <div className="flex justify-between items-center pt-1.5 border-t border-slate-100">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Authorized Total</span>
                <span
                  className="px-2 py-0.5 rounded font-bold font-mono text-[9.5px] text-white shadow-2xs"
                  style={{ backgroundColor: accent }}
                >
                  {displayTotal}
                </span>
              </div>
            </div>
          ) : category === "MOU" ? (
            /* Real MOU Legal Agreement Preview with High Visibility */
            <div className="flex flex-col justify-between h-full text-[9.5px] text-slate-700">
              <div className="text-center border-b border-slate-100 pb-1">
                <span className="font-extrabold text-[10px] uppercase tracking-wider text-slate-900 block leading-tight">
                  Memorandum of Understanding
                </span>
                <span className="text-[7.5px] text-slate-400 uppercase tracking-wide">Mutual Cooperation Agreement</span>
              </div>

              <div className="space-y-1.5 my-1">
                <div className="rounded bg-purple-50/50 p-1.5 border border-purple-100 border-l-2 border-l-purple-500">
                  <span className="font-bold text-slate-900 block text-[8px] truncate">{clause1}</span>
                  <span className="text-[7.5px] text-slate-500 line-clamp-1">
                    Mutual terms for collaboration and project delivery.
                  </span>
                </div>
                <div className="rounded bg-purple-50/50 p-1.5 border border-purple-100 border-l-2 border-l-purple-500">
                  <span className="font-bold text-slate-900 block text-[8px] truncate">{clause2}</span>
                  <span className="text-[7.5px] text-slate-500 line-clamp-1">
                    Protection of proprietary information and covenants.
                  </span>
                </div>
              </div>

              {/* Dual Signature Lines */}
              <div className="flex justify-between items-center pt-1 border-t border-slate-100 text-[7.5px]">
                <div className="border-t border-slate-400 w-16 pt-0.5 text-center text-slate-700 font-bold">
                  Party A (Org)
                </div>
                <div className="border-t border-slate-400 w-16 pt-0.5 text-center text-slate-700 font-bold">
                  Party B (Client)
                </div>
              </div>
            </div>
          ) : (
            /* Real Letterhead Preview with High Visibility */
            <div className="flex flex-col justify-between h-full text-[9.5px] text-slate-700">
              <div className="flex items-center justify-between border-b-2 pb-1.5" style={{ borderColor: accent }}>
                <div>
                  <span className="font-extrabold text-[10.5px] text-slate-900 block tracking-tight leading-tight">
                    VORLDX ENTERPRISE
                  </span>
                  <span className="text-[7.5px] text-slate-400">Official Corporate Letterhead</span>
                </div>
                <div className="w-5 h-5 rounded-md flex items-center justify-center text-white font-bold text-[8.5px] shadow-2xs" style={{ backgroundColor: accent }}>
                  VX
                </div>
              </div>

              <div className="space-y-1.5 my-auto px-1">
                <span className="block text-[8px] text-slate-400 font-mono">Ref: VX-CORP-2026</span>
                <div className="h-1.5 w-full bg-slate-100 rounded" />
                <div className="h-1.5 w-5/6 bg-slate-100 rounded" />
                <div className="h-1.5 w-4/6 bg-slate-100 rounded" />
              </div>

              <div className="border-t border-slate-100 pt-1 text-[7px] text-slate-400 flex justify-between">
                <span>Registered Office • Cyber City</span>
                <span>www.vorldx.com</span>
              </div>
            </div>
          )}
        </div>

        {/* Hover Eye Overlay */}
        <div className="absolute inset-0 bg-slate-900/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-md">
            <Eye className="h-3.5 w-3.5 text-blue-600" /> Click to Preview
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3
              onClick={() => onPreview(template)}
              className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer text-sm line-clamp-1 transition-colors"
              title={template.title}
            >
              {template.title}
            </h3>
            {template.isDefault && (
              <span className="shrink-0 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200">
                Default
              </span>
            )}
          </div>

          <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 min-h-[32px]">
            {template.description || "Reusable template ready for document creation."}
          </p>

          {/* Meta Details */}
          <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
            {template.styleTag && (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 font-semibold text-slate-600">
                {template.styleTag}
              </span>
            )}
            {quoteItems.length > 0 && (
              <span>{quoteItems.length} items</span>
            )}
            {sampleClauses.length > 0 && (
              <span>{sampleClauses.length} clauses</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "6px" }}>
          <Link
            href={getActionUrl()}
            style={{
              flex: 1,
              height: "36px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "9px",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Use Template
          </Link>

          <button
            type="button"
            onClick={() => onPreview(template)}
            style={{
              width: "34px",
              height: "34px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "9px",
              border: "1.5px solid #cbd5e1",
              backgroundColor: "#ffffff",
              color: "#475569",
              cursor: "pointer",
            }}
            title="Preview Template Details"
          >
            <Eye style={{ width: "15px", height: "15px" }} />
          </button>

          <button
            type="button"
            onClick={() => onDuplicate(template)}
            style={{
              width: "34px",
              height: "34px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "9px",
              border: "1.5px solid #cbd5e1",
              backgroundColor: "#ffffff",
              color: "#475569",
              cursor: "pointer",
            }}
            title="Duplicate to My Templates"
          >
            <Copy style={{ width: "15px", height: "15px" }} />
          </button>

          {onShare && (
            <button
              type="button"
              onClick={() => onShare(template)}
              style={{
                width: "34px",
                height: "34px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "9px",
                border: "1.5px solid #cbd5e1",
                backgroundColor: "#ffffff",
                color: "#475569",
                cursor: "pointer",
              }}
              title="Share Template with Colleagues or Clients"
            >
              <Share2 style={{ width: "15px", height: "15px" }} />
            </button>
          )}

          {!isSample && onManageImage && (
            <button
              type="button"
              onClick={() => onManageImage(template)}
              style={{
                width: "34px",
                height: "34px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "9px",
                border: "1.5px solid #cbd5e1",
                backgroundColor: "#ffffff",
                color: "#475569",
                cursor: "pointer",
              }}
              title="Manage Thumbnail Image"
            >
              <ImageIcon style={{ width: "15px", height: "15px" }} />
            </button>
          )}

          {!isSample && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(template)}
              style={{
                width: "34px",
                height: "34px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "9px",
                border: "1.5px solid #fecaca",
                backgroundColor: "#fff5f5",
                color: "#dc2626",
                cursor: "pointer",
              }}
              title="Delete Template"
            >
              <Trash2 style={{ width: "15px", height: "15px" }} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
