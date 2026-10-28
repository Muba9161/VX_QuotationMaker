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
  Search,
  Bell,
  LogOut,
  ChevronDown,
} from "lucide-react";

interface OrgLayoutProps {
  children: ReactNode;
  activePath?: string;
  forcedRole?: "Org Admin" | "Editor";
}

const editorNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Documents", href: "/my-documents", icon: FileText },
  { label: "Quotations", href: "/quotations/new", icon: FileCheck2 },
  { label: "MOUs", href: "/mou/new", icon: FileSignature },
  { label: "Templates", href: "/templates", icon: BookTemplate },
  { label: "Contacts", href: "/contacts", icon: Contact },
];

function OrgLayoutInner({ children, activePath }: OrgLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const currentPath = activePath || pathname;

  const [currentUser] = useState({
    name: "Priya Singh",
    role: "Editor1",
    email: "priya@acme.com",
    avatar: "PS",
  });

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
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 6px rgba(2, 132, 199, 0.35)",
              flexShrink: 0,
              position: "relative",
            }}
          >
            <svg viewBox="0 0 48 48" style={{ width: "24px", height: "24px" }} fill="none">
              <circle cx="24" cy="19" r="14" fill="#0284c7" />
              <circle cx="24" cy="19" r="12" fill="#0ea5e9" />
              <path d="M18 23L15 37L24 32L33 37L30 23" fill="#0369a1" />
              <circle cx="24" cy="19" r="3" fill="#ffffff" />
            </svg>
          </div>
          <div>
            <h1
              style={{
                fontSize: "17px",
                fontWeight: 900,
                color: "#0f172a",
                letterSpacing: "-0.4px",
                margin: 0,
                lineHeight: 1,
              }}
            >
              VorldX
            </h1>
            <p
              style={{
                fontSize: "10.5px",
                fontWeight: 500,
                color: "#64748b",
                margin: "3px 0 0 0",
                lineHeight: 1,
              }}
            >
              Seamless Quotes, Simplified.
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
          {editorNavItems.map((item) => {
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
                  transition: "all 0.15s ease",
                }}
              >
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
              width: "360px",
            }}
          >
            <Search
              style={{
                width: "16px",
                height: "16px",
                color: "#94a3b8",
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
            <input
              type="text"
              placeholder="Search documents, templates, contacts..."
              style={{
                width: "100%",
                height: "36px",
                padding: "0 12px 0 38px",
                backgroundColor: "#f8fafc",
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
