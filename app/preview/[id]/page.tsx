"use client";
import React, { use, useState, Suspense } from "react";
import Link from "next/link";
import OrgLayout from "@/components/OrgLayout";
import { Edit3, Download, Send, CheckCircle2 } from "lucide-react";
import { getOrgDocumentById, getOrgBranding, OrgDocument } from "@/lib/orgStorage";

function PreviewContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const docId = resolvedParams.id;
  const branding = getOrgBranding();

  const foundDoc = getOrgDocumentById(docId);
  const doc: OrgDocument = foundDoc || {
    id: docId,
    docNumber: "Q-001",
    title: "Website Development",
    type: "quotation",
    customerName: "Tech Solutions Pvt Ltd",
    customerAddress: "A-123, Sector 62, Noida, U.P. 201301",
    date: "28-10-2026",
    validTill: "28-11-2026",
    items: [
      { id: "1", description: "Website Development", quantity: 1, unit: "Nos", rate: 25000, amount: 25000 },
      { id: "2", description: "Hosting Setup", quantity: 1, unit: "Nos", rate: 5000, amount: 5000 },
    ],
    clauses: [],
    subtotal: 30000,
    taxRate: 18,
    taxAmount: 5400,
    discount: 0,
    total: 35400,
    paymentTerms: "50% advance, 50% on delivery",
    notes: "Thank you for your business.",
    status: "Sent",
    createdAt: "28 Oct 2026",
    recipients: [],
  };

  const handleDownload = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <OrgLayout activePath="/documents">
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Document Preview</h1>
            <p className="text-xs text-slate-400">Review document exactly as the recipient will view it</p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href={`/documents/${doc.id}/send`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold rounded-lg transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send for Signature</span>
            </Link>
            <Link
              href="/quotations/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 rounded-lg shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </Link>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          <div className="lg:col-span-3 bg-white border border-slate-200 shadow-lg rounded-xl p-8 sm:p-12 space-y-8 font-sans">
            <div className="flex items-start justify-between border-b border-slate-200 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-md shadow-blue-500/20">
                  ▲
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">ACME</h2>
                  <p className="text-xs font-semibold text-slate-600">{branding.name}</p>
                </div>
              </div>

              <div className="text-right text-xs text-slate-500 space-y-0.5">
                <p className="font-semibold text-slate-800">{branding.name}</p>
                <p>{branding.address}</p>
                <p>{branding.website} | {branding.email}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">{doc.type}</span>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mt-0.5">QUOTATION</h3>
              </div>
              <div className="text-right text-xs">
                <p><span className="text-slate-400 font-medium">Quotation No:</span> <strong className="text-slate-800">{doc.docNumber}</strong></p>
                <p><span className="text-slate-400 font-medium">Date:</span> <strong className="text-slate-800">{doc.date}</strong></p>
                <p><span className="text-slate-400 font-medium">Valid Till:</span> <strong className="text-slate-800">{doc.validTill}</strong></p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 text-xs space-y-1">
              <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Bill To:</span>
              <p className="font-bold text-slate-900 text-sm">{doc.customerName}</p>
              <p className="text-slate-600">{doc.customerAddress || "A-123, Sector 62, Noida, U.P. 201301"}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-8">#</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-center">Unit</th>
                    <th className="py-2.5 px-3 text-right">Rate (₹)</th>
                    <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {doc.items.map((it, idx) => (
                    <tr key={it.id}>
                      <td className="py-3 px-3 text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-3 font-semibold">{it.description}</td>
                      <td className="py-3 px-3 text-center">{it.quantity}</td>
                      <td className="py-3 px-3 text-center">{it.unit}</td>
                      <td className="py-3 px-3 text-right">{it.rate.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-3 text-right font-bold">{it.amount.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <div className="w-64 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">₹{doc.subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST ({doc.taxRate}%)</span>
                  <span className="font-semibold text-slate-900">₹{doc.taxAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-extrabold text-slate-900">
                  <span>Total</span>
                  <span className="text-blue-600 font-black">₹{doc.total.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-bold text-slate-700 block mb-1">Payment Terms:</span>
                <p className="text-slate-500">{doc.paymentTerms}</p>
              </div>
              <div>
                <span className="font-bold text-slate-700 block mb-1">Notes:</span>
                <p className="text-slate-500">{doc.notes}</p>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6 flex items-end justify-between text-xs">
              <div>
                <div className="w-40 border-b border-slate-400 pb-1 mb-1 font-serif text-slate-800 text-sm italic">
                  Rahul Sharma
                </div>
                <span className="text-slate-400 font-medium">Authorized Signatory (Acme Technologies)</span>
              </div>
              <div className="text-right">
                <div className="w-40 border-b border-slate-400 pb-1 mb-1 font-serif text-slate-400 text-sm italic">
                  Pending Signature
                </div>
                <span className="text-slate-400 font-medium">Client Acceptance Signatory</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs text-xs space-y-3">
              <h4 className="font-bold text-slate-900">Document Pages</h4>
              <div className="p-2 border-2 border-blue-600 rounded-lg bg-slate-50 text-center cursor-pointer shadow-xs">
                <div className="aspect-3/4 bg-white border border-slate-200 rounded p-1.5 flex flex-col justify-between text-[7px] text-slate-300">
                  <div className="flex justify-between border-b pb-0.5">
                    <span>ACME</span>
                    <span>Q-001</span>
                  </div>
                  <div className="space-y-1">
                    <div className="h-1 bg-slate-200 rounded"></div>
                    <div className="h-1 bg-slate-200 rounded"></div>
                  </div>
                  <div className="text-right font-bold text-slate-400">Total: ₹35,400</div>
                </div>
                <span className="block mt-2 font-bold text-slate-700 text-xs">Page 1</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </OrgLayout>
  );
}

export default function DocumentPreviewPage(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading document preview...</div>}>
      <PreviewContent params={props.params} />
    </Suspense>
  );
}
