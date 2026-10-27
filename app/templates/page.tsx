"use client";
import React from "react";
import OrgLayout from "@/components/OrgLayout";
import { BookTemplate, Copy } from "lucide-react";
import Link from "next/link";

export default function OrgTemplatesPage() {
  const templates = [
    { title: "Standard Quotation", type: "Quotation", desc: "Standard goods & services with taxes", href: "/quotations/new" },
    { title: "Service Quotation", type: "Quotation", desc: "Retainer & hourly service engagement", href: "/quotations/new" },
    { title: "Partnership MOU", type: "MOU", desc: "Strategic partnership & joint venture clauses", href: "/mou/new" },
    { title: "Confidentiality MOU", type: "MOU", desc: "Non-disclosure and IP protection agreement", href: "/mou/new" },
  ];

  return (
    <OrgLayout activePath="/templates">
      <div className="space-y-6 max-w-7xl mx-auto font-sans">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Document Templates</h1>
          <p className="text-xs text-slate-400 mt-0.5">Reusable standard templates configured for Acme Technologies</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {templates.map((t, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                  <Copy className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">{t.title}</h4>
                <p className="text-xs text-slate-400 mt-1">{t.desc}</p>
              </div>
              <Link href={t.href} className="mt-4 text-xs font-semibold text-blue-600 hover:underline">
                Create from Template &rarr;
              </Link>
            </div>
          ))}
        </div>
      </div>
    </OrgLayout>
  );
}
