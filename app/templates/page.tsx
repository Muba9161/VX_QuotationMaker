"use client";
import React, { useState } from "react";
import Link from "next/link";
import OrgLayout from "@/components/OrgLayout";
import { Plus, FileText, FileSignature, ArrowRight } from "lucide-react";

export default function DocumentTemplatesPage() {
  const [activeTab, setActiveTab] = useState<"quotation" | "mou">("quotation");

  const quotationTemplates = [
    {
      id: "std-quote",
      name: "Standard Quotation",
      desc: "Default company quotation template.",
      type: "Quotation",
      href: "/quotations/new",
    },
    {
      id: "srv-quote",
      name: "Service Quotation",
      desc: "Template for service-based quotations.",
      type: "Quotation",
      href: "/quotations/new",
    },
    {
      id: "it-quote",
      name: "IT Project Quotation",
      desc: "Template for IT and software projects.",
      type: "Quotation",
      href: "/quotations/new",
    },
  ];

  const mouTemplates = [
    {
      id: "part-mou",
      name: "Partnership MOU",
      desc: "Standard agreement for strategic business collaboration.",
      type: "MOU",
      href: "/mou/new",
    },
    {
      id: "conf-mou",
      name: "Confidentiality MOU",
      desc: "Non-disclosure and information protection agreement.",
      type: "MOU",
      href: "/mou/new",
    },
    {
      id: "vendor-mou",
      name: "Vendor MOU",
      desc: "Supplier engagement and delivery framework MOU.",
      type: "MOU",
      href: "/mou/new",
    },
  ];

  const templates = activeTab === "quotation" ? quotationTemplates : mouTemplates;

  return (
    <OrgLayout activePath="/templates">
      <div className="space-y-6 max-w-7xl mx-auto font-sans">
        {/* Header matching Screen 9 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Document Templates</h1>
            <p className="text-xs text-slate-400 mt-0.5">Browse pre-approved company templates to speed up creation</p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Template</span>
          </button>
        </div>

        {/* Tabs: Quotation Templates / MOU Templates matching Screen 9 */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("quotation")}
            className={`px-4 py-2 text-xs font-bold transition-colors relative cursor-pointer ${
              activeTab === "quotation"
                ? "text-blue-600"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Quotation Templates</span>
            {activeTab === "quotation" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("mou")}
            className={`px-4 py-2 text-xs font-bold transition-colors relative cursor-pointer ${
              activeTab === "mou"
                ? "text-blue-600"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>MOU Templates</span>
            {activeTab === "mou" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"></span>
            )}
          </button>
        </div>

        {/* Templates List matching Screen 9 */}
        <div className="space-y-3">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs flex items-center justify-between gap-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-14 bg-slate-50 rounded-lg border border-slate-200 flex flex-col items-center justify-center p-1 shrink-0">
                  <div className="w-6 h-1 bg-slate-300 rounded-full mb-1"></div>
                  <div className="w-8 h-1 bg-slate-200 rounded-full mb-1"></div>
                  <div className="w-7 h-1 bg-slate-200 rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{tpl.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{tpl.desc}</p>
                </div>
              </div>

              <Link
                href={tpl.href}
                className="px-4 py-1.5 border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-blue-600 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 shrink-0"
              >
                <span>Use</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </OrgLayout>
  );
}
