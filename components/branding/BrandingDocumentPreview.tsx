"use client";

import React, { useState } from "react";
import { FileText, FileCheck2, Bookmark, Building2 } from "lucide-react";

interface BrandingDocumentPreviewProps {
  name: string;
  tagline: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string | null;
  signatoryName: string;
  signatoryTitle: string;
  letterheadUrl?: string | null;
}

export default function BrandingDocumentPreview({
  name,
  tagline,
  website,
  email,
  phone,
  address,
  primaryColor,
  secondaryColor,
  accentColor,
  logoUrl,
  signatoryName,
  signatoryTitle,
  letterheadUrl,
}: BrandingDocumentPreviewProps) {
  const [docType, setDocType] = useState<"QUOTATION" | "MOU" | "LETTERHEAD">("QUOTATION");

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Live Document Simulation</h3>
          <p className="text-xs text-slate-500">Preview how your branding renders across client-facing documents</p>
        </div>

        {/* Toggle Pills */}
        <div className="flex items-center rounded-xl bg-slate-100 p-1 self-start sm:self-auto border border-slate-200/80">
          <button
            type="button"
            onClick={() => setDocType("QUOTATION")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
              docType === "QUOTATION" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="h-3.5 w-3.5 text-blue-600" /> Quotation
          </button>
          <button
            type="button"
            onClick={() => setDocType("MOU")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
              docType === "MOU" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileCheck2 className="h-3.5 w-3.5 text-purple-600" /> MOU
          </button>
          <button
            type="button"
            onClick={() => setDocType("LETTERHEAD")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
              docType === "LETTERHEAD" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Bookmark className="h-3.5 w-3.5 text-amber-600" /> Letterhead
          </button>
        </div>
      </div>

      {/* Simulated A4 Container */}
      <div className="rounded-xl border border-slate-200 bg-slate-100/60 p-4 sm:p-6 flex justify-center">
        <div className="w-full max-w-xl rounded-lg bg-white shadow-md border border-slate-200 p-6 sm:p-8 flex flex-col justify-between min-h-[500px] text-slate-800 relative overflow-hidden">
          {/* Top Decorative Stripe */}
          <div className="absolute top-0 inset-x-0 h-1.5" style={{ backgroundColor: primaryColor }} />

          {/* Document Header */}
          <div>
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="Logo" className="h-10 w-auto object-contain max-w-[180px]" />
                ) : (
                  <div className="flex items-center gap-2">
                    <div
                      className="h-9 w-9 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {(name || "C").charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{name || "Company Legal Name"}</h4>
                      {tagline && <p className="text-[10px] text-slate-400">{tagline}</p>}
                    </div>
                  </div>
                )}
                <div className="mt-2 text-[10px] text-slate-500 space-y-0.5">
                  {address && <p>{address}</p>}
                  <p>
                    {[email, phone, website].filter(Boolean).join(" • ")}
                  </p>
                </div>
              </div>

              <div className="text-right text-[11px] text-slate-500">
                <span
                  className="font-bold uppercase tracking-wider text-xs block"
                  style={{ color: primaryColor }}
                >
                  {docType === "QUOTATION" ? "Commercial Quotation" : docType === "MOU" ? "Memorandum of Understanding" : "Official Letterhead"}
                </span>
                <p className="mt-1">Ref: {docType.substring(0, 3)}-2026-0042</p>
                <p>Date: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* Document Content Based on Selected Tab */}
            {docType === "QUOTATION" && (
              <div className="mt-5 space-y-3">
                <div className="rounded bg-slate-50 p-2.5 text-[11px] flex justify-between">
                  <div>
                    <span className="font-semibold text-slate-600 block">Billed To:</span>
                    <span className="font-bold text-slate-800">Acme Global Technologies Inc.</span>
                    <p className="text-slate-500">Karnataka, India</p>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-slate-600 block">Valid Until:</span>
                    <span className="text-slate-800">30 Calendar Days</span>
                  </div>
                </div>

                {/* Table */}
                <table className="w-full text-left text-[11px] border border-slate-200 rounded overflow-hidden">
                  <thead style={{ backgroundColor: primaryColor }} className="text-white font-semibold">
                    <tr>
                      <th className="p-2">Description</th>
                      <th className="p-2 text-center">Unit</th>
                      <th className="p-2 text-center">Qty</th>
                      <th className="p-2 text-right">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2 font-medium text-slate-800">Enterprise Cloud Architecture</td>
                      <td className="p-2 text-center text-slate-500">Phase</td>
                      <td className="p-2 text-center text-slate-600">1</td>
                      <td className="p-2 text-right font-medium text-slate-900">₹1,50,000</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium text-slate-800">API Gateway Integration</td>
                      <td className="p-2 text-center text-slate-500">Modules</td>
                      <td className="p-2 text-center text-slate-600">2</td>
                      <td className="p-2 text-right font-medium text-slate-900">₹90,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {docType === "MOU" && (
              <div className="mt-5 space-y-3 text-[11px]">
                <p className="text-slate-700 leading-relaxed font-serif italic text-center">
                  &ldquo;This Memorandum of Understanding (&lsquo;MOU&rsquo;) sets forth the collaborative terms between {name || "The Company"} and the Partner Organization.&rdquo;
                </p>
                <div className="space-y-2 pt-2">
                  <div className="rounded border border-slate-100 bg-slate-50/60 p-2">
                    <span className="font-bold text-slate-800 block text-[10px]">1. PURPOSE & SCOPE</span>
                    <span className="text-slate-600 text-[10px]">Parties collaborate in good faith on joint technical evaluations.</span>
                  </div>
                  <div className="rounded border border-slate-100 bg-slate-50/60 p-2">
                    <span className="font-bold text-slate-800 block text-[10px]">2. CONFIDENTIALITY</span>
                    <span className="text-slate-600 text-[10px]">Shared proprietary data remains protected for 36 months.</span>
                  </div>
                </div>
              </div>
            )}

            {docType === "LETTERHEAD" && (
              <div className="mt-8 flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-center text-xs">
                <Bookmark className="h-8 w-8 mb-2" style={{ color: primaryColor }} />
                <span className="font-semibold text-slate-700">Official Document Content Zone</span>
                <span className="text-[10px] text-slate-400 mt-1">
                  Your customized headers and footers frame the document body seamlessly.
                </span>
              </div>
            )}
          </div>

          {/* Document Footer & Signatory Block */}
          <div className="pt-6 border-t border-slate-100 flex items-end justify-between text-[10px] text-slate-500">
            <div>
              <p className="font-medium text-slate-700">{name || "Company Name"}</p>
              <p>Confidential • For Authorized Recipient</p>
            </div>

            <div className="text-right">
              <div className="h-6 border-b border-slate-300 w-32 mb-1 ml-auto" />
              <p className="font-bold text-slate-800">{signatoryName || "Authorized Signatory"}</p>
              <p className="text-slate-500">{signatoryTitle || "Executive Officer"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

