"use client";
import React, { ReactNode, useState, useEffect } from "react";
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
  FolderOpen
} from "lucide-react";

interface OrgLayoutProps {
  children: ReactNode;
  activePath?: string;
  forcedRole?: "Org Admin" | "Editor";
}

const adminNavItems = [
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

const editorNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Documents", href: "/my-documents", icon: FolderOpen },
  { label: "Quotations", href: "/quotations/new", icon: FileCheck2 },
  { label: "MOUs", href: "/mou/new", icon: FileSignature },
  { label: "Templates", href: "/templates", icon: BookTemplate },
  { label: "Contacts", href: "/contacts", icon: Contact },
];

function OrgLayoutInner({ children, activePath, forcedRole }: OrgLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const currentPath = activePath || pathname;

  const [currentUser, setCurrentUser] = useState({
    name: "Priya Singh",
    role: "Editor" as "Org Admin" | "Editor",
    email: "priya@acme.com",
    avatar: "PS",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("vorldx_org_auth");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setCurrentUser({
            name: parsed.name || (parsed.role === "Editor" ? "Priya Singh" : "Rahul Sharma"),
            role: forcedRole || parsed.role || "Editor",
            email: parsed.email || (parsed.role === "Editor" ? "priya@acme.com" : "admin@acme.com"),
            avatar: parsed.role === "Editor" ? "PS" : "RS",
          });
        } catch {
          // ignore
        }
      } else if (forcedRole) {
        setCurrentUser({
          name: forcedRole === "Editor" ? "Priya Singh" : "Rahul Sharma",
          role: forcedRole,
          email: forcedRole === "Editor" ? "priya@acme.com" : "admin@acme.com",
          avatar: forcedRole === "Editor" ? "PS" : "RS",
        });
      }
    }
  }, [forcedRole]);

  const switchRole = (newRole: "Org Admin" | "Editor") => {
    const updated = {
      name: newRole === "Editor" ? "Priya Singh" : "Rahul Sharma",
      role: newRole,
      email: newRole === "Editor" ? "priya@acme.com" : "admin@acme.com",
      avatar: newRole === "Editor" ? "PS" : "RS",
    };
    setCurrentUser(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("vorldx_org_auth", JSON.stringify(updated));
    }
  };

  const navItems = currentUser.role === "Editor" ? editorNavItems : adminNavItems;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex text-slate-800 font-sans antialiased">
      {/* Sidebar matching screenshot */}
      <aside className="w-60 shrink-0 bg-white border-r border-slate-200/90 flex flex-col sticky top-0 h-screen z-30 shadow-xs">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-5 border-b border-slate-100 gap-2.5">
          {/* Logo with blue ribbon badge */}
          <div className="w-8 h-8 relative flex items-center justify-center shrink-0">
            <svg viewBox="0 0 48 48" className="w-8 h-8 drop-shadow-xs" fill="none">
              <circle cx="24" cy="19" r="14" fill="#0284c7" />
              <circle cx="24" cy="19" r="12" fill="#0ea5e9" />
              <path d="M18 23L15 37L24 32L33 37L30 23" fill="#0369a1" />
              <path d="M16 24L15 37L24 32" fill="#075985" />
              <path d="M32 24L33 37L24 32" fill="#0369a1" />
              <path
                d="M24 13L28 15.5V20.5L24 23L20 20.5V15.5L24 13Z"
                stroke="#ffffff"
                strokeWidth="1.8"
                strokeLinejoin="round"
                fill="none"
              />
              <circle cx="24" cy="18" r="2" fill="#ffffff" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 tracking-tight leading-none">VorldX</h1>
            <p className="text-[10px] font-normal text-slate-400 mt-0.5">Acme Technologies</p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
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

        {/* Role Switcher Pill & Sign Out */}
        <div className="p-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between px-2 py-1 bg-slate-50 rounded-lg text-[10px] text-slate-500">
            <span>View As:</span>
            <div className="flex gap-1 font-bold">
              <button
                type="button"
                onClick={() => switchRole("Editor")}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${currentUser.role === "Editor" ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-900"}`}
              >
                Editor
              </button>
              <button
                type="button"
                onClick={() => switchRole("Org Admin")}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${currentUser.role === "Org Admin" ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-900"}`}
              >
                Admin
              </button>
            </div>
          </div>

          <Link
            href="/login"
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 font-medium transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar matching screenshot */}
        <header className="h-16 bg-white border-b border-slate-200/90 sticky top-0 z-20 px-8 flex items-center justify-between shadow-2xs">
          {/* Search bar */}
          <div className="relative w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search documents, templates, contacts..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs text-slate-800 placeholder:text-slate-400 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Right Header: Notification, Avatar & User info */}
          <div className="flex items-center gap-4">
            <button className="relative p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
              <Bell className="w-4 h-4" />
            </button>

            <div className="h-6 w-[1px] bg-slate-200"></div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {currentUser.avatar}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-tight">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400 font-normal">{currentUser.role}</p>
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
