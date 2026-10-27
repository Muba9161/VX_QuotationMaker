"use client";
import React, { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Users2,
  FileText,
  BookOpen,
  Palette,
  LifeBuoy,
  ShieldCheck,
  Settings,
  Search,
  Bell,
  LogOut,
  ChevronDown
} from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
  activePath?: string;
}

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Organizations", href: "/admin/organizations", icon: Building2 },
  { label: "Subscription Plans", href: "/admin/subscription-plans", icon: CreditCard },
  { label: "Users", href: "/admin/users", icon: Users2 },
  { label: "Documents", href: "/admin/documents", icon: FileText },
  { label: "Templates", href: "/admin/templates", icon: BookOpen },
  { label: "Branding Requests", href: "/admin/branding-requests", icon: Palette },
  { label: "Support Tickets", href: "/admin/support-tickets", icon: LifeBuoy },
  { label: "Audit Logs", href: "/admin/audit-logs", icon: ShieldCheck },
  { label: "System Settings", href: "/admin/system-settings", icon: Settings },
];

function AdminLayoutInner({ children, activePath }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const currentPath = activePath || pathname;

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("vorldx_admin_auth");
    }
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex text-slate-800 font-sans antialiased">
      {/* Sidebar matching screenshot 1-5 */}
      <aside className="w-60 shrink-0 bg-white border-r border-slate-200/90 flex flex-col sticky top-0 h-screen z-30 shadow-xs">
        {/* Brand Header with Ribbon Seal Badge */}
        <div className="h-16 flex items-center px-5 border-b border-slate-100 gap-2.5">
          <div className="w-8 h-8 relative flex items-center justify-center shrink-0">
            <svg viewBox="0 0 48 48" className="w-8 h-8 drop-shadow-xs" fill="none">
              <circle cx="24" cy="19" r="14" fill="#1e3a8a" />
              <circle cx="24" cy="19" r="12" fill="#2563eb" />
              <path d="M18 23L15 37L24 32L33 37L30 23" fill="#1d4ed8" />
              <path d="M16 24L15 37L24 32" fill="#1e40af" />
              <path d="M32 24L33 37L24 32" fill="#1e3a8a" />
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
            <p className="text-[10px] font-medium text-slate-400 mt-0.5">Platform Admin</p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.href || (item.href !== "/admin/dashboard" && currentPath.startsWith(item.href));
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
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-rose-600 hover:bg-rose-50 font-medium transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/90 sticky top-0 z-20 px-8 flex items-center justify-between shadow-2xs">
          {/* Search bar matching screenshot */}
          <div className="relative w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search organizations, documents, users..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs text-slate-800 placeholder:text-slate-400 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Right Header: Notification, Avatar & Platform Admin Super Admin */}
          <div className="flex items-center gap-4">
            <button className="relative p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
            </button>

            <div className="h-6 w-[1px] bg-slate-200"></div>

            <div className="flex items-center gap-2.5 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                PA
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-tight">Platform Admin</p>
                <p className="text-[10px] text-slate-400 font-normal">Super Admin</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
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

export default function AdminLayout(props: AdminLayoutProps) {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-slate-400">Loading...</div>}>
      <AdminLayoutInner {...props} />
    </React.Suspense>
  );
}
