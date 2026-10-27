"use client";
import React from "react";
import Link from "next/link";
import { Shield, Building2, FileCheck2, ArrowRight, ExternalLink, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col justify-between p-6 sm:p-12">
      <div className="max-w-5xl mx-auto w-full space-y-10 my-auto py-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>VorldX White-Label Platform</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
            Quotation & MOU Maker
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Complete enterprise multi-tenant system with Platform Admin Console, Organization Workspace, and Recipient Digital Signatures.
          </p>
        </div>

        {/* 2 Big Choice Portals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Platform Admin */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-8 hover:border-blue-500 transition-all flex flex-col justify-between group shadow-xl">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white">Platform Admin</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Super Admin console to manage all registered organizations, subscription plans, platform users, support tickets, and audit logs.
              </p>
            </div>

            <div className="pt-6">
              <Link
                href="/admin/dashboard"
                className="w-full py-3 px-5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-600/30"
              >
                <span>Open Platform Admin</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Organisation Admin */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-8 hover:border-emerald-500 transition-all flex flex-col justify-between group shadow-xl">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white">Organisation Admin</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Acme Technologies workspace to create quotations, MOUs, customize brand letterheads, manage team members, and dispatch for digital signing.
              </p>
            </div>

            <div className="pt-6">
              <Link
                href="/dashboard"
                className="w-full py-3 px-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-600/30"
              >
                <span>Open Org Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Direct Link to Recipient Signing */}
        <div className="text-center pt-2">
          <Link
            href="/sign/token-q-001"
            className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <FileCheck2 className="w-4 h-4 text-blue-400" />
            <span>Test Recipient Digital Signing Portal &rarr;</span>
          </Link>
        </div>
      </div>

      <div className="text-center text-xs text-slate-500">
        VorldX White-Label Platform &bull; Built with Next.js, TypeScript & Tailwind CSS
      </div>
    </div>
  );
}
