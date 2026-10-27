"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import OrgLayout from "@/components/OrgLayout";
import { ArrowLeft, Plus, MoreVertical, Save, Eye, FileDown, Trash2 } from "lucide-react";
import { saveOrgDocument, OrgDocument, OrgMOUClause } from "@/lib/orgStorage";

export default function MOUBuilderPage() {
  const router = useRouter();

  const [activeSubStep, setActiveSubStep] = useState("Clauses");
  const subSteps = ["Basic Details", "Parties", "Clauses", "Terms & Conditions", "Notes & Attachments"];

  const [clauses, setClauses] = useState<OrgMOUClause[]>([
    { id: "c-1", title: "Purpose of Agreement", content: "To formalize the technical collaboration between parties." },
    { id: "c-2", title: "Scope of Collaboration", content: "Joint delivery, API integration, and architectural review." },
    { id: "c-3", title: "Responsibilities of Parties", content: "Providing access to infrastructure and sandbox environments." },
    { id: "c-4", title: "Confidentiality", content: "Parties agree not to disclose proprietary intellectual property." },
    { id: "c-5", title: "Termination", content: "Either party may terminate with 30 days written notice." },
  ]);

  const addClause = () => {
    const newClause: OrgMOUClause = {
      id: "c-" + Date.now(),
      title: "New Clause " + (clauses.length + 1),
      content: "Details of this clause...",
    };
    setClauses([...clauses, newClause]);
  };

  const removeClause = (id: string) => {
    setClauses(clauses.filter(c => c.id !== id));
  };

  const handleSave = (status: 'Draft' | 'Sent') => {
    const docId = "doc-" + Date.now();
    const doc: OrgDocument = {
      id: docId,
      docNumber: "MOU-" + Math.floor(100 + Math.random() * 900),
      title: "Partnership Agreement",
      type: "mou",
      customerName: "Global Systems",
      date: "28-10-2026",
      validTill: "28-10-2027",
      items: [],
      clauses,
      subtotal: 0,
      taxRate: 0,
      taxAmount: 0,
      discount: 0,
      total: 0,
      paymentTerms: "Quarterly settlement",
      notes: "Executed under Indian law jurisdiction.",
      status,
      createdAt: "28 Oct 2026",
      signToken: "token-" + docId,
      recipients: [
        { id: "r-1", name: "Party Signer", email: "partner@example.com", role: "Signer" },
      ],
    };
    saveOrgDocument(doc);
    router.push(`/preview/${docId}`);
  };

  return (
    <OrgLayout activePath="/mou/new">
      <div className="space-y-6 max-w-6xl mx-auto font-sans">
        {/* Top Header matching Screen 5 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Link href="/documents" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Create MOU</h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleSave("Draft")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 rounded-lg shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>
            <button
              onClick={() => handleSave("Draft")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 rounded-lg shadow-xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => handleSave("Sent")}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Generate PDF</span>
            </button>
          </div>
        </div>

        {/* 2-Column: Left Sub-Steps Nav & Right Agreement Clauses */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Mini-Steps (Screen 5) */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200/80 p-2 shadow-xs space-y-1">
            {subSteps.map((step) => (
              <button
                key={step}
                onClick={() => setActiveSubStep(step)}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                  activeSubStep === step
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <span>{step}</span>
                {activeSubStep === step && <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
              </button>
            ))}
          </div>

          {/* Right Agreement Clauses */}
          <div className="lg:col-span-9 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Agreement Clauses</h3>

            <div className="space-y-3">
              {clauses.map((clause, idx) => (
                <div key={clause.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-400">{idx + 1}</span>
                    <span className="text-xs font-bold text-slate-800">{clause.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => removeClause(clause.id)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1 text-slate-400 hover:text-slate-600">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addClause}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1.5 pt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Clause</span>
            </button>
          </div>
        </div>
      </div>
    </OrgLayout>
  );
}
