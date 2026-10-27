"use client";
import React, { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FileCheck2,
  FileSignature,
  BookTemplate,
  Contact,
  Users2,
  Palette,
  Settings,
  BarChart3,
  Search,
  Bell,
  LogOut,
  Hexagon
} from "lucide-react";

interface OrgLayoutProps {
  children: ReactNode;
  activePath?: string;
}

const orgNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Quotations", href: "/quotations/new", icon: FileCheck2 },
  { label: "MOUs", href: "/mou/new", icon: FileSignature },
  { label: "Templates", href: "/templates", icon: BookTemplate },
  { label: "Contacts", href: "/contacts", icon: Contact },
  { label: "Team Members", href: "/team", icon: Users2 },
  { label: "Branding & Letterhead", href: "/branding", icon: Palette },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Reports", href: "/reports", icon: BarChart3 },
];

function OrgLayoutInner({ children, activePath }: OrgLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const currentPath = activePath || pathname;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex text-slate-800 font-sans antialiased">
      {/* Sidebar matching all screenshots */}
      <aside className="w-60 bg-white border-r border-slate-200/90 flex flex-col fixed inset-y-0 left-0 z-30 shadow-xs">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-5 border-b border-slate-100 gap-3">
          <div className="w-8 h-8 rounded-full bg-cyan-700 text-white flex items-center justify-center shadow-xs">
            <Hexagon className="w-4 h-4 fill-white/30 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">VorldX</h1>
            <p className="text-[11px] font-normal text-slate-400 mt-0.5">Acme Technologies</p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {orgNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.href || (item.href !== "/dashboard" && currentPath.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-100">
          <Link
            href="/(auth)/login"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-rose-600 hover:bg-rose-50 font-medium transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="pl-60 flex-1 flex flex-col min-w-0">
        {/* Top Navbar matching screenshot */}
        <header className="h-16 bg-white border-b border-slate-200/90 sticky top-0 z-20 px-8 flex items-center justify-between shadow-2xs">
          {/* Search bar with exact placeholder */}
          <div className="relative w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search documents, templates, contacts..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs text-slate-800 placeholder:text-slate-400 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Right Header: Notification, Avatar & Rahul Sharma */}
          <div className="flex items-center gap-4">
            <button className="relative p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
              <Bell className="w-4 h-4" />
            </button>

            <div className="h-6 w-[1px] bg-slate-200"></div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                RS
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-tight">Rahul Sharma</p>
                <p className="text-[10px] text-slate-400 font-normal">Org Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function OrgLayout(props: OrgLayoutProps) {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-slate-400">Loading...</div>}>
      <OrgLayoutInner {...props} />
    </React.Suspense>
  );
}
