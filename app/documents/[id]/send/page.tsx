"use client";
import React, { useState } from "react";
import Link from "next/link";
import OrgLayout from "@/components/OrgLayout";
import { ArrowLeft, Plus, Trash2, Send, CheckCircle2, Shield, Calendar } from "lucide-react";

export default function SendDocumentPage() {
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

  const handleSend = () => {
    setSent(true);
  };

  return (
    <OrgLayout activePath="/documents">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Send for Signature</h1>
            <p className="text-xs text-slate-400">Configure signers, verification settings, and dispatch invitations</p>
          </div>
        </div>

        {sent ? (
          <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left 2 Cols: Recipients & Message */}
            <div className="md:col-span-2 space-y-6">
              {/* Recipients Card */}
              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">Recipients</h3>
                  <button
                    type="button"
                    onClick={addRecipient}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Recipient</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {recipients.map((rec, idx) => (
                    <div key={rec.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={rec.name}
                          placeholder="Full Name"
                          onChange={(e) => {
                            const copy = [...recipients];
                            copy[idx].name = e.target.value;
                            setRecipients(copy);
                          }}
                          className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs"
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
                          className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs"
                        />
                      </div>
                      <select
                        value={rec.role}
                        onChange={(e) => {
                          const copy = [...recipients];
                          copy[idx].role = e.target.value;
                          setRecipients(copy);
                        }}
                        className="text-xs px-2 py-1.5 bg-white border border-slate-200 rounded"
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
              </div>

              {/* Message Box */}
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

            {/* Right 1 Col: Signing Settings */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Signing Settings</h3>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs text-slate-700">Require recipients to sign in</span>
                  <input
                    type="checkbox"
                    checked={requireSignIn}
                    onChange={(e) => setRequireSignIn(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs text-slate-700">Allow download before signing</span>
                  <input
                    type="checkbox"
                    checked={allowDownload}
                    onChange={(e) => setAllowDownload(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Set expiry date</label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSend}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all mt-4"
                >
                  <Send className="w-4 h-4" />
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
