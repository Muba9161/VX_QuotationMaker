"use client";

import React from "react";
import RecipientLayout from "@/components/RecipientLayout";
import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  Download,
  Eye,
} from "lucide-react";

export default function SignedDocumentsPage() {
  const signedDocs = [
    {
      id: "doc-3",
      name: "Service Agreement - SA-003",
      pages: 4,
      fromName: "Northstar Systems",
      type: "Agreement",
      signedDate: "22 Oct 2026",
      previewUrl: "/preview/doc-3",
    },
    {
      id: "doc-4",
      name: "Quotation - Q-008",
      pages: 3,
      fromName: "ACME Technologies Pvt Ltd",
      type: "Quotation",
      signedDate: "20 Oct 2026",
      previewUrl: "/preview/doc-4",
    },
  ];

  return (
    <RecipientLayout activePath="/recipient/signed">
      <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Signed Documents
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Documents you have successfully reviewed and signed.
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
                  <th className="py-3 px-3">Signed On</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {signedDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
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
                    <td className="py-3.5 px-3 font-semibold text-slate-800 text-[11px]">
                      {doc.fromName}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="inline-block px-2.5 py-0.5 rounded-md font-medium text-[11px] bg-emerald-50 text-emerald-600">
                        {doc.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-700 text-[11px]">
                      {doc.signedDate}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Signed</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <Link
                        href={doc.previewUrl}
                        className="inline-block px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-blue-600 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                      >
                        View PDF
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
