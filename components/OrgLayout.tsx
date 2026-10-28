"use client";

import React, { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  FileText,
  FileCheck2,
  LayoutGrid,
  Users,
  Search,
  Bell,
  LogOut,
  ChevronDown,
  Image as ImageIcon,
  Settings,
  BarChart2,
} from "lucide-react";

interface OrgLayoutProps {
  children: ReactNode;
  activePath?: string;
  forcedRole?: "Org Admin" | "Editor";
}

const editorNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "My Documents", href: "/my-documents", icon: FileText },
  { label: "Quotations", href: "/quotations", icon: FileCheck2 },
  { label: "MOUs", href: "/mou", icon: FileText },
  { label: "Templates", href: "/templates", icon: LayoutGrid },
  { label: "Contacts", href: "/contacts", icon: Users },
];

const orgAdminNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Documents", href: "/my-documents", icon: FileText },
  { label: "Quotations", href: "/quotations", icon: FileCheck2 },
  { label: "MOUs", href: "/mou", icon: FileText },
  { label: "Templates", href: "/templates", icon: LayoutGrid },
  { label: "Contacts", href: "/contacts", icon: Users },
  { label: "Team Members", href: "/team", icon: Users },
  { label: "Branding & Letterhead", href: "/branding", icon: ImageIcon },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Reports", href: "/reports", icon: BarChart2 },
];

function OrgLayoutInner({ children, activePath, forcedRole }: OrgLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const currentPath = activePath || pathname;

  const [currentUser, setCurrentUser] = useState(() => {
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem("vorldx_org_auth");
      if (auth) {
        try {
          return JSON.parse(auth);
        } catch {}
      }
    }
    return {
      name: "Rahul Sharma",
      role: "Org Admin",
      email: "admin@acme.com",
      avatar: "RS",
    };
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem("vorldx_org_auth");
      if (auth) {
        try {
          setCurrentUser(JSON.parse(auth));
        } catch {}
      }
    }
  }, []);

  const effectiveRole = forcedRole || currentUser.role;
  const navItems = effectiveRole === "Editor" ? editorNavItems : orgAdminNavItems;

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("vorldx_org_auth");
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
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
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
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg viewBox="0 0 32 32" style={{ width: "32px", height: "32px" }} fill="none">
              <path
                d="M7 6C9.2 3.8 12.8 5.6 14.8 9.5C16.8 5.6 20.4 3.8 22.6 6C24.8 8.2 23 11.8 19.1 13.8C23 15.8 24.8 19.4 22.6 21.6C20.4 23.8 16.8 22 14.8 18.1C12.8 22 9.2 23.8 7 21.6C4.8 19.4 6.6 15.8 10.5 13.8C6.6 11.8 4.8 8.2 7 6Z"
                fill="#0284c7"
              />
              <path
                d="M14.8 9.5C16.8 5.6 20.4 3.8 22.6 6C24.8 8.2 23 11.8 19.1 13.8C16.5 15.1 14.2 12 14.8 9.5Z"
                fill="#2563eb"
              />
              <path
                d="M7 21.6C4.8 19.4 6.6 15.8 10.5 13.8C13.1 12.5 15.4 15.6 14.8 18.1C12.8 22 9.2 23.8 7 21.6Z"
                fill="#38bdf8"
              />
            </svg>
          </div>
          <div>
            <h1
              style={{
                fontSize: "18px",
                fontWeight: 900,
                color: "#0f172a",
                letterSpacing: "-0.4px",
                margin: 0,
                lineHeight: 1,
              }}
            >
              WorldX
            </h1>
            <p
              style={{
                fontSize: "11px",
                fontWeight: 500,
                color: "#64748b",
                margin: "4px 0 0 0",
                lineHeight: 1,
              }}
            >
              Acme Technologies
            </p>
          </div>
        </div>

        {/* Navigation items */}
        <nav
          style={{
            flex: 1,
            padding: "16px 12px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            overflowY: "auto",
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentPath === item.href ||
              (item.href !== "/dashboard" && currentPath.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "9px 14px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#2563eb" : "#475569",
                  backgroundColor: isActive ? "#eff6ff" : "transparent",
                  textDecoration: "none",
                  position: "relative",
                  transition: "all 0.15s ease",
                }}
              >
                {isActive && (
                  <span
                    style={{
                      position: "absolute",
                      left: "-12px",
                      top: "6px",
                      bottom: "6px",
                      width: "3.5px",
                      backgroundColor: "#2563eb",
                      borderRadius: "0 4px 4px 0",
                    }}
                  />
                )}
                <Icon
                  style={{
                    width: "17px",
                    height: "17px",
                    color: isActive ? "#2563eb" : "#64748b",
                    flexShrink: 0,
                  }}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sign Out Button */}
        <div
          style={{
            padding: "16px 14px",
            borderTop: "1px solid #f1f5f9",
          }}
        >
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "100%",
              padding: "9px 12px",
              borderRadius: "8px",
              fontSize: "12.5px",
              fontWeight: 600,
              color: "#dc2626",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              transition: "background-color 0.15s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#fee2e2")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <LogOut style={{ width: "16px", height: "16px" }} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT WRAPPER ================= */}
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
          {/* Search bar */}
          <div
            style={{
              position: "relative",
              width: "440px",
            }}
          >
            <Search
              style={{
                width: "16px",
                height: "16px",
                color: "#94a3b8",
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
            <input
              type="text"
              placeholder="Search documents, templates, contacts..."
              style={{
                width: "100%",
                height: "38px",
                padding: "0 14px 0 42px",
                backgroundColor: "#f1f5f9",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                fontSize: "13px",
                color: "#1e293b",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Right Header: Notification & User Pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <div style={{ position: "relative" }}>
              <Bell
                style={{
                  width: "18px",
                  height: "18px",
                  color: "#64748b",
                  cursor: "pointer",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  top: "-2px",
                  right: "-2px",
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  backgroundColor: "#ef4444",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  fontSize: "12.5px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 4px rgba(37,99,235,0.2)",
                }}
              >
                {currentUser.avatar}
              </div>
              <div style={{ lineHeight: 1.2 }}>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#0f172a",
                    display: "block",
                  }}
                >
                  {currentUser.name}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#64748b",
                    display: "block",
                  }}
                >
                  {currentUser.role}
                </span>
              </div>
              <ChevronDown
                style={{
                  width: "14px",
                  height: "14px",
                  color: "#64748b",
                }}
              />
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main
          style={{
            flex: 1,
            padding: "28px 36px 48px 36px",
            boxSizing: "border-box",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default function OrgLayout(props: OrgLayoutProps) {
  return (
    <React.Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            backgroundColor: "#f4f7fb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#64748b",
          }}
        >
          Loading...
        </div>
      }
    >
      <OrgLayoutInner {...props} />
    </React.Suspense>
  );
}
