"use client";
import React, { useState } from "react";
import Link from "next/link";
import OrgLayout from "@/components/OrgLayout";
import { ArrowLeft, Plus, Trash2, Send, CheckCircle2, Shield, Calendar, UserCheck } from "lucide-react";

export default function SendDocumentPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [recipients, setRecipients] = useState([
    { id: "1", name: "John Doe", email: "john@techsolutions.com", role: "Signer" },
    { id: "2", name: "Priya Mehta", email: "priya@techsolutions.com", role: "CC (View only)" },
  ]);

  const [requireSignIn, setRequireSignIn] = useState(false);
  const [allowDownload, setAllowDownload] = useState(true);
  const [expiryDate, setExpiryDate] = useState("28-11-2026");
  const [message, setMessage] = useState("Please review and sign the document. Let us know if you have any questions.");
  const [sent, setSent] = useState(false);

  const addRecipient = () => {
    setRecipients([
      ...recipients,
      { id: "r-" + Date.now(), name: "", email: "", role: "Signer" },
    ]);
  };

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  return (
    <OrgLayout activePath="/quotations/new">
      <div className="space-y-6 max-w-5xl mx-auto font-sans">
        {/* Header & Stepper matching Screen 7 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Send for Signature</h1>
          </div>

          {/* Stepper matching Screen 7 */}
          <div className="flex items-center gap-3 text-xs font-semibold">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white rounded-full">
              <span className="w-4 h-4 rounded-full bg-white text-blue-600 text-[10px] flex items-center justify-center font-bold">1</span>
              <span>Recipients</span>
            </div>
            <div className="w-6 h-[1px] bg-slate-200"></div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-slate-400">
              <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 text-[10px] flex items-center justify-center font-bold">2</span>
              <span>Settings</span>
            </div>
            <div className="w-6 h-[1px] bg-slate-200"></div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-slate-400">
              <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 text-[10px] flex items-center justify-center font-bold">3</span>
              <span>Review</span>
            </div>
          </div>
        </div>

        {sent ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Document Sent Successfully!</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Recipients have received a secure digital link to review and electronically sign this document.
            </p>
            <div className="pt-4 flex items-center justify-center gap-3">
              <Link
                href="/sign/token-q-001"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm"
              >
                Open Recipient Sign View
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7 Cols: Recipients & Message */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Recipients</h3>

                <div className="space-y-3">
                  {recipients.map((rec, idx) => (
                    <div key={rec.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div className="flex-1 space-y-1">
                        <input
                          type="text"
                          value={rec.name}
                          placeholder="Full Name"
                          onChange={(e) => {
                            const copy = [...recipients];
                            copy[idx].name = e.target.value;
                            setRecipients(copy);
                          }}
                          className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded text-xs font-medium"
                        />
                        <input
                          type="email"
                          value={rec.email}
                          placeholder="Email"
                          onChange={(e) => {
                            const copy = [...recipients];
                            copy[idx].email = e.target.value;
                            setRecipients(copy);
                          }}
                          className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded text-xs text-slate-500"
                        />
                      </div>
                      <select
                        value={rec.role}
                        onChange={(e) => {
                          const copy = [...recipients];
                          copy[idx].role = e.target.value;
                          setRecipients(copy);
                        }}
                        className="text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-700"
                      >
                        <option value="Signer">Signer</option>
                        <option value="CC (View only)">CC (View only)</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removeRecipient(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addRecipient}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Recipient</span>
                </button>
              </div>

              {/* Message */}
              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-2">
                <label className="text-xs font-bold text-slate-900 block">Message (optional)</label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Right 5 Cols: Signing Settings matching Screen 7 */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Signing Settings</h3>

                <label className="flex items-center justify-between cursor-pointer py-1">
                  <span className="text-xs text-slate-700 font-medium">Require recipients to sign in</span>
                  <input
                    type="checkbox"
                    checked={requireSignIn}
                    onChange={(e) => setRequireSignIn(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer py-1">
                  <span className="text-xs text-slate-700 font-medium">Allow download before signing</span>
                  <input
                    type="checkbox"
                    checked={allowDownload}
                    onChange={(e) => setAllowDownload(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Set expiry date</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50"
                    />
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSent(true)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all mt-4"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Document</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </OrgLayout>
  );
}
