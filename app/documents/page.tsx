"use client";
import React from "react";
import Link from "next/link";
import OrgLayout from "@/components/OrgLayout";
import { FileText, FileSignature, ArrowRight, Sparkles, FileCheck, Copy } from "lucide-react";

export default function CreateNewDocumentPage() {
  const templates = [
    { title: "Standard Quotation", type: "Quotation", desc: "Standard goods & services with taxes", href: "/quotations/new?tmpl=standard" },
    { title: "Service Quotation", type: "Quotation", desc: "Retainer & hourly service engagement", href: "/quotations/new?tmpl=service" },
    { title: "Partnership MOU", type: "MOU", desc: "Strategic partnership & joint venture clauses", href: "/mou/new?tmpl=partnership" },
    { title: "Confidentiality MOU", type: "MOU", desc: "Non-disclosure and IP protection agreement", href: "/mou/new?tmpl=nda" },
  ];

  return (
    <OrgLayout activePath="/documents">
      <div className="space-y-8 max-w-5xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create New Document</h1>
          <p className="text-sm text-slate-500 mt-1">Choose the document type and start creating</p>
        </div>

        {/* 2 Big Choice Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quotation Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center group">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Quotation</h3>
            <p className="text-sm text-slate-500 mt-2 mb-6 max-w-xs">
              Create a professional quotation with items, pricing, taxes and terms.
            </p>
            <Link
              href="/quotations/new"
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors mt-auto flex items-center justify-center gap-2"
            >
              <span>Create Quotation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* MOU Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center group">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <FileSignature className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Memorandum of Understanding</h3>
            <p className="text-sm text-slate-500 mt-2 mb-6 max-w-xs">
              Create an MOU with customizable clauses and signatories.
            </p>
            <Link
              href="/mou/new"
              className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors mt-auto flex items-center justify-center gap-2"
            >
              <span>Create MOU</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Or Use a Template Section */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Or use a template</h3>
            <span className="text-xs font-semibold text-blue-600 cursor-pointer hover:underline">View All Templates</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {templates.map((t, idx) => (
              <Link
                key={idx}
                href={t.href}
                className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 mb-3">
                  <Copy className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">{t.title}</h4>
                <p className="text-xs text-slate-400 mt-1 mb-4 flex-1">{t.desc}</p>
                <span className="text-[11px] font-semibold text-blue-600 flex items-center gap-1">
                  Use Template &rarr;
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </OrgLayout>
  );
}
