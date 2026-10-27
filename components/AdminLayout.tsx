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
    router.push("/login");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "row",
        backgroundColor: "#f4f7fb",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: "#1e293b",
        boxSizing: "border-box",
      }}
    >
      {/* ================= FIXED SIDEBAR (240px) ================= */}
      <aside
        style={{
          width: "240px",
          minWidth: "240px",
          maxWidth: "240px",
          flexShrink: 0,
          backgroundColor: "#ffffff",
          borderRight: "1px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
          zIndex: 30,
          boxShadow: "1px 0 3px rgba(0,0,0,0.02)",
          boxSizing: "border-box",
        }}
      >
        {/* Brand Header with Ribbon Seal Badge */}
        <div
          style={{
            height: "64px",
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
            borderBottom: "1px solid #f1f5f9",
            gap: "12px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: "34px",
              height: "34px",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg viewBox="0 0 48 48" style={{ width: "34px", height: "34px" }} fill="none">
              <circle cx="24" cy="19" r="14" fill="#1e40af" />
              <circle cx="24" cy="19" r="12" fill="#2563eb" />
              <path d="M18 23L15 37L24 32L33 37L30 23" fill="#1d4ed8" />
              <path d="M16 24L15 37L24 32" fill="#1e3a8a" />
              <path d="M32 24L33 37L24 32" fill="#1e40af" />
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
            <h1 style={{ fontSize: "17px", fontWeight: "900", color: "#0f172a", margin: 0, lineHeight: 1 }}>
              VorldX
            </h1>
            <p style={{ fontSize: "10px", fontWeight: "600", color: "#94a3b8", margin: "3px 0 0 0" }}>
              Platform Admin
            </p>
          </div>
        </div>

        {/* 10 Navigation Items */}
        <nav
          style={{
            flex: 1,
            padding: "16px 10px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            overflowY: "auto",
            boxSizing: "border-box",
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentPath === item.href ||
              (item.href !== "/admin/dashboard" && currentPath.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "9px 12px",
                  borderRadius: "10px",
                  fontSize: "12.5px",
                  fontWeight: isActive ? "700" : "500",
                  color: isActive ? "#2563eb" : "#475569",
                  backgroundColor: isActive ? "#eff6ff" : "transparent",
                  textDecoration: "none",
                  transition: "all 0.15s ease",
                  boxSizing: "border-box",
                }}
              >
                <Icon
                  style={{
                    width: "17px",
                    height: "17px",
                    color: isActive ? "#2563eb" : "#94a3b8",
                    flexShrink: 0,
                  }}
                />
                <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer / Sign Out */}
        <div style={{ padding: "12px", borderTop: "1px solid #f1f5f9" }}>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "600",
              color: "#e11d48",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              transition: "background 0.15s ease",
            }}
          >
            <LogOut style={{ width: "15px", height: "15px" }} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
        }}
      >
        {/* Top Navbar */}
        <header
          style={{
            height: "64px",
            backgroundColor: "#ffffff",
            borderBottom: "1px solid #e2e8f0",
            position: "sticky",
            top: 0,
            zIndex: 20,
            padding: "0 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
            boxSizing: "border-box",
          }}
        >
          {/* Search bar matching screenshot */}
          <div style={{ position: "relative", width: "340px" }}>
            <Search
              style={{
                width: "16px",
                height: "16px",
                color: "#94a3b8",
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              placeholder="Search organizations, documents, users..."
              style={{
                width: "100%",
                height: "36px",
                padding: "0 12px 0 36px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                fontSize: "12px",
                color: "#1e293b",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Right Header: Notification, Avatar & Platform Admin Super Admin */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              style={{
                position: "relative",
                padding: "8px",
                borderRadius: "8px",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#64748b",
              }}
            >
              <Bell style={{ width: "17px", height: "17px" }} />
              <span
                style={{
                  position: "absolute",
                  top: "6px",
                  right: "6px",
                  width: "7px",
                  height: "7px",
                  backgroundColor: "#ef4444",
                  borderRadius: "50%",
                  border: "1.5px solid #ffffff",
                }}
              />
            </button>

            <div style={{ height: "24px", width: "1px", backgroundColor: "#e2e8f0" }} />

            <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  fontWeight: "800",
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 6px rgba(37,99,235,0.2)",
                }}
              >
                PA
              </div>
              <div style={{ textAlign: "left" }}>
                <p style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a", margin: 0, lineHeight: 1.2 }}>
                  Platform Admin
                </p>
                <p style={{ fontSize: "10px", color: "#94a3b8", margin: 0, fontWeight: "500" }}>
                  Super Admin
                </p>
              </div>
              <ChevronDown style={{ width: "14px", height: "14px", color: "#94a3b8" }} />
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main style={{ flex: 1, padding: "28px 32px", boxSizing: "border-box" }}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout(props: AdminLayoutProps) {
  return (
    <React.Suspense fallback={<div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>Loading...</div>}>
      <AdminLayoutInner {...props} />
    </React.Suspense>
  );
}
