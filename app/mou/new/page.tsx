"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import OrgLayout from "@/components/OrgLayout";
import {
  ArrowLeft,
  Plus,
  MoreVertical,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Quote,
  List,
  Maximize2
} from "lucide-react";
import { saveOrgDocument, OrgDocument, OrgMOUClause } from "@/lib/orgStorage";

export default function MOUBuilderPage() {
  const router = useRouter();

  const [activeSubStep, setActiveSubStep] = useState("Basic Details");
  const subSteps = ["Basic Details", "Parties", "Clauses", "Terms & Conditions", "Notes & Attachments"];

  // Form State matching Screen 5
  const [title, setTitle] = useState("Partnership Agreement");
  const [date, setDate] = useState("28-10-2026");
  const [effectiveDate, setEffectiveDate] = useState("01-11-2026");
  const [validTill, setValidTill] = useState("31-10-2027");
  const [partyA, setPartyA] = useState("Acme Technologies Pvt Ltd");
  const [partyB, setPartyB] = useState("Global Systems");
  const [introPurpose, setIntroPurpose] = useState(
    "This Memorandum of Understanding (MOU) sets forth the terms of collaboration between the parties for joint technological exploration and integration."
  );

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

  const handleSave = (status: "Draft" | "Sent") => {
    const docId = "doc-" + Date.now();
    const doc: OrgDocument = {
      id: docId,
      docNumber: "MOU-" + Math.floor(100 + Math.random() * 900),
      title: title || "Partnership Agreement",
      type: "mou",
      customerName: partyB || "Global Systems",
      date,
      validTill,
      items: [],
      clauses,
      subtotal: 0,
      taxRate: 0,
      taxAmount: 0,
      discount: 0,
      total: 0,
      paymentTerms: "Mutual agreement",
      notes: "Executed under applicable jurisdiction.",
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
      <div className="space-y-6 max-w-7xl mx-auto font-sans">
        {/* Top Header matching Screen 5 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Link>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Create MOU</h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleSave("Draft")}
              className="px-3.5 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSave("Draft")}
              className="px-3.5 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              Preview
            </button>
            <button
              onClick={() => handleSave("Sent")}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              Generate PDF
            </button>
          </div>
        </div>

        {/* Builder Layout: Sub-steps on Left + Center Editor Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Mini-Nav Sub-steps matching Screen 5 */}
          <div className="md:col-span-3 space-y-1">
            {subSteps.map((step) => {
              const isActive = activeSubStep === step;
              return (
                <button
                  key={step}
                  onClick={() => setActiveSubStep(step)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    isActive
                      ? "bg-blue-50 text-blue-700 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/60"
                  }`}
                >
                  <span>{step}</span>
                </button>
              );
            })}
          </div>

          {/* Center Form Section matching Screen 5 */}
          <div className="md:col-span-9 bg-white rounded-xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
            {activeSubStep === "Basic Details" && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">MOU Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50/70 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Date</label>
                    <input
                      type="text"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50/70 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Effective Date</label>
                    <input
                      type="text"
                      value={effectiveDate}
                      onChange={(e) => setEffectiveDate(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50/70 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Valid Till</label>
                    <input
                      type="text"
                      value={validTill}
                      onChange={(e) => setValidTill(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50/70 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium"
                    />
                  </div>
                </div>

                {/* Parties section matching Screen 5 */}
                <div>
                  <h3 className="text-xs font-bold text-slate-900 mb-2">Parties</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Party A (Your Company)</label>
                      <input
                        type="text"
                        value={partyA}
                        onChange={(e) => setPartyA(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-50/70 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Party B (Collaborator)</label>
                      <input
                        type="text"
                        value={partyB}
                        onChange={(e) => setPartyB(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-50/70 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Introduction / Purpose with rich toolbar matching Screen 5 */}
                <div>
                  <h3 className="text-xs font-bold text-slate-900 mb-2">Introduction / Purpose</h3>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-3 py-1.5 flex items-center gap-3 text-slate-600">
                      <button type="button" className="p-1 hover:bg-slate-200/60 rounded cursor-pointer"><Bold className="w-3.5 h-3.5" /></button>
                      <button type="button" className="p-1 hover:bg-slate-200/60 rounded cursor-pointer"><Italic className="w-3.5 h-3.5" /></button>
                      <button type="button" className="p-1 hover:bg-slate-200/60 rounded cursor-pointer"><Underline className="w-3.5 h-3.5" /></button>
                      <button type="button" className="p-1 hover:bg-slate-200/60 rounded cursor-pointer"><Strikethrough className="w-3.5 h-3.5" /></button>
                      <span className="w-[1px] h-4 bg-slate-300"></span>
                      <button type="button" className="p-1 hover:bg-slate-200/60 rounded cursor-pointer"><Quote className="w-3.5 h-3.5" /></button>
                      <button type="button" className="p-1 hover:bg-slate-200/60 rounded cursor-pointer"><List className="w-3.5 h-3.5" /></button>
                      <button type="button" className="p-1 hover:bg-slate-200/60 rounded cursor-pointer ml-auto"><Maximize2 className="w-3.5 h-3.5" /></button>
                    </div>
                    <textarea
                      rows={5}
                      value={introPurpose}
                      onChange={(e) => setIntroPurpose(e.target.value)}
                      className="w-full p-3.5 text-xs text-slate-800 focus:outline-none leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Clauses Section matching Org Admin / Editor Screen 5 */}
            {activeSubStep === "Clauses" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Agreement Clauses</h3>
                  <button
                    onClick={addClause}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Clause</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {clauses.map((clause, idx) => (
                    <div
                      key={clause.id}
                      className="flex items-center justify-between p-3.5 bg-slate-50/70 border border-slate-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 text-xs font-bold text-slate-400">{idx + 1}</span>
                        <span className="text-xs font-bold text-slate-800">{clause.title}</span>
                      </div>
                      <button className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(activeSubStep === "Parties" || activeSubStep === "Terms & Conditions" || activeSubStep === "Notes & Attachments") && (
              <div className="py-8 text-center text-slate-400 text-xs">
                Configure {activeSubStep} parameters for this agreement.
              </div>
            )}
          </div>
        </div>
      </div>
    </OrgLayout>
  );
}
