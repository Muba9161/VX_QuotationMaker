"use client";

import React from "react";
import Link from "next/link";
import { X, Copy, ExternalLink, AlertCircle, FileText, CheckCircle2, Share2 } from "lucide-react";
import { TemplateDisplayItem } from "./TemplateCard";

interface TemplatePreviewModalProps {
  template: TemplateDisplayItem | null;
  onClose: () => void;
  onDuplicate: (template: TemplateDisplayItem) => void;
  onShare?: (template: TemplateDisplayItem) => void;
}

export default function TemplatePreviewModal({
  template,
  onClose,
  onDuplicate,
  onShare,
}: TemplatePreviewModalProps) {
  if (!template) return null;

  const category = (template.category || template.type || "QUOTATION").toUpperCase();
  const accent = template.accentColor || "#2563EB";

  const getActionUrl = () => {
    if (category === "MOU") {
      return `/mou/new?templateId=${encodeURIComponent(template.id)}`;
    }
    if (category === "LETTERHEAD") {
      return `/branding?letterheadId=${encodeURIComponent(template.id)}`;
    }
    return `/quotations/new?templateId=${encodeURIComponent(template.id)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
          <div className="flex items-center gap-3">
            <div
              className="h-3.5 w-3.5 rounded-full"
              style={{ backgroundColor: accent }}
            />
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                {template.title}
                {template.isSample && (
                  <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-xs font-medium text-indigo-700">
                    Platform Sample
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500">
                {template.styleTag || category} • Ready to customize and export
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable A4 Preview Simulation */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-6 flex justify-center">
          <div className="w-full max-w-2xl rounded-lg bg-white p-8 shadow-sm border border-slate-200 text-slate-800 space-y-6 min-h-[550px] flex flex-col justify-between">
            {/* Document Header */}
            <div>
              <div className="flex justify-between items-start border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: accent }}
                    >
                      {template.title.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">Your Company Name</h3>
                      <p className="text-xs text-slate-500">Official Document Header</p>
                    </div>
                  </div>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <div className="font-semibold text-slate-800 uppercase tracking-wider text-sm" style={{ color: accent }}>
                    {category}
                  </div>
                  <p>Ref: DOC-{new Date().getFullYear()}-001</p>
                  <p>Date: {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {/* Description & Overview */}
              {template.description && (
                <div className="mt-4 rounded-lg bg-slate-50 border border-slate-100 p-3 text-xs text-slate-600">
                  {template.description}
                </div>
              )}

              {/* Category-Specific Preview Content */}
              {category === "QUOTATION" && (
                <div className="mt-6 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Itemized Pricing Schedule
                  </h4>
                  <table className="w-full text-left text-xs border border-slate-200 rounded overflow-hidden">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Description</th>
                        <th className="p-2.5 text-center">Unit</th>
                        <th className="p-2.5 text-center">Qty</th>
                        <th className="p-2.5 text-right">Rate (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {((template.lineItems && template.lineItems.length > 0
                        ? template.lineItems
                        : template.items || []) as Array<{ description: string; unit?: string; defaultQuantity: number; defaultRate: number }>
                      ).map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 text-slate-800">{item.description}</td>
                          <td className="p-2.5 text-center text-slate-500">{item.unit || "Nos"}</td>
                          <td className="p-2.5 text-center text-slate-600 font-medium">{item.defaultQuantity}</td>
                          <td className="p-2.5 text-right font-medium text-slate-800">
                            ₹{Number(item.defaultRate).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Payment Terms & Notes */}
                  {template.paymentTerms && (
                    <div className="pt-2 text-xs">
                      <span className="font-semibold text-slate-700">Payment Terms: </span>
                      <span className="text-slate-600">{template.paymentTerms}</span>
                    </div>
                  )}
                  {template.notes && (
                    <div className="text-xs">
                      <span className="font-semibold text-slate-700">Notes: </span>
                      <span className="text-slate-600">{template.notes}</span>
                    </div>
                  )}
                </div>
              )}

              {category === "MOU" && (
                <div className="mt-6 space-y-4">
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-[11px] text-amber-800 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                    <span>Editable starting point — customize clauses to your specific bilateral agreement requirements.</span>
                  </div>

                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Agreement Clauses & Provisions
                  </h4>
                  <div className="space-y-3">
                    {(template.clauses || []).map((clause, idx) => (
                      <div key={idx} className="rounded-md border border-slate-100 bg-slate-50/50 p-3">
                        <div className="font-semibold text-xs text-slate-800">{clause.title}</div>
                        <div className="text-xs text-slate-600 mt-1 leading-relaxed">{clause.content}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {category === "LETTERHEAD" && (
                <div className="mt-8 space-y-6">
                  <div className="rounded-lg border-2 border-dashed border-slate-200 p-8 text-center text-xs text-slate-500">
                    <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                      <FileText className="h-6 w-6" />
                    </div>
                    <p className="font-medium text-slate-700">Sample Document Body Area</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Your quotation or MOU content flows cleanly here, bounded by the header and footer styling above and below.
                    </p>
                  </div>
                  {template.letterheadConfig && (
                    <div className="rounded bg-slate-50 p-3 text-xs text-slate-600 space-y-1">
                      <div><span className="font-semibold">Layout:</span> {template.letterheadConfig.layout}</div>
                      <div><span className="font-semibold">Tagline:</span> {template.letterheadConfig.headerTagline || "None"}</div>
                      <div><span className="font-semibold">Footer note:</span> {template.letterheadConfig.footerNote || "None"}</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Document Footer Simulation */}
            <div className="border-t border-slate-100 pt-4 text-[11px] text-slate-400 flex justify-between items-center">
              <div>Registered Office • Corporate Headquarters</div>
              <div>Page 1 of 1</div>
            </div>
          </div>
        </div>

        {/* Modal Action Bar */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-white">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDuplicate(template)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Copy className="h-4 w-4" /> Duplicate
            </button>
            {onShare && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onShare(template);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Share2 className="h-4 w-4 text-blue-600" /> Share
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
            <Link
              href={getActionUrl()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              Use This Template <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
