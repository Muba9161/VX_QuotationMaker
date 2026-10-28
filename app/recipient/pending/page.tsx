"use client";

import React, { useState } from "react";
import RecipientLayout from "@/components/RecipientLayout";
import Link from "next/link";
import {
  FileText,
  Clock,
  ArrowRight,
  MoreVertical,
} from "lucide-react";

export default function PendingSignaturePage() {
  const pendingDocs = [
    {
      id: "doc-1",
      name: "Quotation - Q-001",
      pages: 2,
      fromName: "ACME Technologies Pvt Ltd",
      fromEmail: "john.doe@email.com",
      type: "Quotation",
      receivedDate: "28 Oct 2026",
      receivedTime: "10:30 AM",
      signUrl: "/sign/doc-1",
    },
    {
      id: "doc-2",
      name: "Partnership Agreement - PA-002",
      pages: 4,
      fromName: "Global Systems",
      fromEmail: "contracts@globalsystems.com",
      type: "Agreement",
      receivedDate: "27 Oct 2026",
      receivedTime: "11:45 AM",
      signUrl: "/sign/doc-2",
    },
  ];

  return (
    <RecipientLayout activePath="/recipient/pending">
      <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Pending Signature
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Documents waiting for your review and digital signature.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-slate-900 font-bold">
                <tr>
                  <th className="py-3 px-3">Document</th>
                  <th className="py-3 px-3">From</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Received On</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {pendingDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{doc.name}</div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {doc.pages} pages
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-800 text-[11px]">
                        {doc.fromName}
                      </div>
                      <div className="text-[10px] text-slate-400">{doc.fromEmail}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="inline-block px-2.5 py-0.5 rounded-md font-medium text-[11px] bg-blue-50 text-blue-600">
                        {doc.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-medium text-slate-800 text-[11px]">
                        {doc.receivedDate}
                      </div>
                      <div className="text-[10px] text-slate-400">{doc.receivedTime}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Pending Signature</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <Link
                        href={doc.signUrl}
                        className="inline-block px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                      >
                        Review & Sign
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RecipientLayout>
  );
}
