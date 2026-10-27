"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import OrgLayout from "@/components/OrgLayout";
import { ArrowLeft, Plus, MoreVertical, Save, Eye, FileDown, Trash2 } from "lucide-react";
import { saveOrgDocument, OrgDocument, OrgMOUClause } from "@/lib/orgStorage";

export default function MOUBuilderPage() {
  const router = useRouter();

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
      createdAt: "Today",
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
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Link href="/documents" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Create MOU</h1>
              <p className="text-xs text-slate-400">Configure agreement clauses, parties, and signatories</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleSave("Draft")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 rounded-lg shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>
            <button
              onClick={() => handleSave("Draft")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 rounded-lg shadow-xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => handleSave("Sent")}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Generate PDF</span>
            </button>
          </div>
        </div>

        {/* Agreement Clauses Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Agreement Clauses</h3>

          <div className="space-y-3">
            {clauses.map((clause, idx) => (
              <div key={clause.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={clause.title}
                      onChange={(e) => {
                        const copy = [...clauses];
                        copy[idx].title = e.target.value;
                        setClauses(copy);
                      }}
                      className="font-bold text-sm text-slate-900 bg-transparent border-b border-transparent focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => removeClause(clause.id)}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={clause.content}
                  onChange={(e) => {
                    const copy = [...clauses];
                    copy[idx].content = e.target.value;
                    setClauses(copy);
                  }}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-white"
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addClause}
            className="w-full py-2.5 border-2 border-dashed border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/50 rounded-xl text-xs font-semibold text-indigo-600 transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Clause</span>
          </button>
        </div>
      </div>
    </OrgLayout>
  );
}
