"use client";

import React, { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Share2,
  Clock,
  CheckCircle2,
  MessageSquare,
  XCircle,
  Download,
  HelpCircle,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  ShieldCheck,
  FolderInput,
  Award,
} from "lucide-react";

interface RecipientLayoutProps {
  children: ReactNode;
  activePath?: string;
}

export default function RecipientLayout({ children, activePath }: RecipientLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const currentPath = activePath || pathname;
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { label: "Overview", href: "/recipient/dashboard", icon: Home },
    { label: "Shared with Me", href: "/recipient/shared", icon: FolderInput },
    {
      label: "Pending Signature",
      href: "/recipient/pending",
      icon: Clock,
      badge: 2,
      badgeColor: "bg-red-500 text-white",
    },
    { label: "Signed Documents", href: "/recipient/signed", icon: CheckCircle2 },
    {
      label: "Change Requests",
      href: "/recipient/changes",
      icon: MessageSquare,
      badge: 1,
      badgeColor: "bg-amber-500 text-white",
    },
    { label: "Declined", href: "/recipient/declined", icon: XCircle },
    { label: "Downloads", href: "/recipient/downloads", icon: Download },
  ];

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("vorldx_signer_name");
      localStorage.removeItem("vorldx_user_role");
    }
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col font-sans">
      {/* Top Navbar matching Recipient Dashboard */}
      <header className="h-16 bg-white border-b border-slate-200/90 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-40">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-4 w-64 shrink-0">
          <Link href="/recipient/dashboard" className="flex items-center gap-3">
            {/* Medal/Award Icon in Blue */}
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-lg font-black text-slate-900 tracking-tight leading-tight">
                WorldX
              </div>
              <div className="text-[10px] text-slate-400 font-medium leading-none">
                Secure Document Signing
              </div>
            </div>
          </Link>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-xl mx-4 hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search documents, senders, or document types..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 bg-slate-50/70 focus:bg-white focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
            />
          </div>
        </div>

        {/* Right: Notification Bell & User Profile */}
        <div className="flex items-center gap-4">
          {/* Bell Icon with Red Dot */}
          <button
            type="button"
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-red-500 absolute top-1.5 right-1.5 ring-2 ring-white" />
          </button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-xs flex items-center justify-center shadow-2xs">
                JD
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-900 leading-tight">John Doe</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-11 z-50 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 text-xs font-medium animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2 border-b border-slate-100">
                  <div className="font-bold text-slate-900">John Doe</div>
                  <div className="text-[11px] text-slate-400">recipient@techsolutions.com</div>
                </div>
                <Link
                  href="/recipient/dashboard"
                  onClick={() => setShowUserMenu(false)}
                  className="block px-4 py-2 hover:bg-slate-50 text-slate-700"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 border-t border-slate-100 mt-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex flex-row">
        {/* Left Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200/90 shrink-0 p-4 hidden lg:flex flex-col justify-between">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.href || (item.href === "/recipient/dashboard" && currentPath === "/recipient");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all relative ${
                    isActive
                      ? "text-blue-600 bg-blue-50/70"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {/* Active Indicator Bar on Left */}
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-r-full" />
                  )}

                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Profile & Help dropdown item */}
            <div className="pt-2">
              <button
                type="button"
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                  <span>Profile & Help</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </nav>

          {/* Bottom Sign Out */}
          <div className="pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
