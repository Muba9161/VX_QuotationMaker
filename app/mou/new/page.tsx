"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import OrgLayout from "@/components/OrgLayout";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Calendar,
  Eye,
  FileDown,
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
      <div className="max-w-[1100px] mx-auto p-4 sm:p-6 space-y-6 font-sans">
        {/* Top Header matching Screenshot */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-1.5 rounded-lg hover:bg-slate-100 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </Link>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Create MOU</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSave("Draft")}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <span>Save Draft</span>
            </button>
            <button
              onClick={() => handleSave("Draft")}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-blue-600 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4 text-blue-600" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => handleSave("Sent")}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-white" />
              <span>Generate PDF</span>
            </button>
          </div>
        </div>

        {/* Vertical Stacked Cards Matching Screenshot 1:1 */}
        <div className="space-y-6">
          {/* Card 1: Basic Details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900">Basic Details</h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">MOU Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Date</label>
                <div className="relative">
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none pr-9"
                  />
                  <Calendar className="w-4 h-4 text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Valid Till</label>
                <div className="relative">
                  <input
                    type="text"
                    value={validTill}
                    onChange={(e) => setValidTill(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none pr-9"
                  />
                  <Calendar className="w-4 h-4 text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Parties */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900">Parties</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Party A (Your Company)</label>
                <input
                  type="text"
                  value={partyA}
                  onChange={(e) => setPartyA(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Party B (Collaborator)</label>
                <input
                  type="text"
                  value={partyB}
                  onChange={(e) => setPartyB(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Clauses */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900">Clauses</h2>

            <div className="space-y-3">
              {clauses.map((clause, idx) => (
                <div key={clause.id} className="flex items-center gap-3">
                  <span className="w-5 text-xs font-semibold text-slate-700 shrink-0 text-center">{idx + 1}</span>
                  <div className="w-48 sm:w-56 shrink-0">
                    <input
                      type="text"
                      value={clause.title}
                      onChange={(e) => {
                        const copy = [...clauses];
                        copy[idx].title = e.target.value;
                        setClauses(copy);
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50/50 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={clause.content}
                      onChange={(e) => {
                        const copy = [...clauses];
                        copy[idx].content = e.target.value;
                        setClauses(copy);
                      }}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-normal focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setClauses(clauses.filter((_, i) => i !== idx))}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors shrink-0"
                    title="Remove Clause"
                  >
                    <Trash2 className="w-4 h-4 stroke-[2]" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={addClause}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Clause</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </OrgLayout>
  );
}
