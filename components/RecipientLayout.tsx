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
  FolderInput,
  Award,
  User,
  ChevronRight,
} from "lucide-react";
import UserRoleMenu from "@/components/UserRoleMenu";

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
      badgeColor: "#ef4444",
    },
    { label: "Signed Documents", href: "/recipient/signed", icon: CheckCircle2 },
    {
      label: "Change Requests",
      href: "/recipient/changes",
      icon: MessageSquare,
      badge: 1,
      badgeColor: "#f59e0b",
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
      {/* ================= FIXED LEFT SIDEBAR (240px) ================= */}
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
        {/* Brand Header */}
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
              borderRadius: "8px",
              backgroundColor: "#eff6ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Award style={{ width: "20px", height: "20px", color: "#2563eb" }} />
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
              Secure Document Signing
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
              (item.href === "/recipient/dashboard" && (currentPath === "/recipient" || currentPath === "/recipient/dashboard"));

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
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
                {/* Active Indicator Bar on Left */}
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

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Icon
                    style={{
                      width: "17px",
                      height: "17px",
                      color: isActive ? "#2563eb" : "#64748b",
                      flexShrink: 0,
                    }}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    style={{
                      padding: "1px 6px",
                      borderRadius: "9999px",
                      fontSize: "10px",
                      fontWeight: 700,
                      color: "#ffffff",
                      backgroundColor: item.badgeColor,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Profile & Help Link */}
          <div style={{ paddingTop: "8px" }}>
            {(() => {
              const isProfileActive = currentPath === "/recipient/profile";
              return (
                <Link
                  href="/recipient/profile"
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "9px 14px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: isProfileActive ? 700 : 500,
                    color: isProfileActive ? "#2563eb" : "#475569",
                    backgroundColor: isProfileActive ? "#eff6ff" : "transparent",
                    textDecoration: "none",
                    position: "relative",
                    transition: "all 0.15s ease",
                    boxSizing: "border-box",
                  }}
                >
                  {isProfileActive && (
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
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <User
                      style={{
                        width: "17px",
                        height: "17px",
                        color: isProfileActive ? "#2563eb" : "#64748b",
                        flexShrink: 0,
                      }}
                    />
                    <span>Profile & Help</span>
                  </div>
                  <ChevronRight
                    style={{
                      width: "14px",
                      height: "14px",
                      color: isProfileActive ? "#2563eb" : "#94a3b8",
                    }}
                  />
                </Link>
              );
            })()}
          </div>
        </nav>

        {/* Bottom Sign Out */}
        <div style={{ padding: "16px 12px", borderTop: "1px solid #f1f5f9" }}>
          <button
            type="button"
            onClick={handleSignOut}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "9px 14px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 600,
              color: "#ef4444",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <LogOut style={{ width: "16px", height: "16px" }} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ================= RIGHT MAIN AREA ================= */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          boxSizing: "border-box",
        }}
      >
        {/* Top Navbar */}
        <header
          style={{
            height: "64px",
            backgroundColor: "#ffffff",
            borderBottom: "1px solid #e2e8f0",
            padding: "0 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 20,
            boxSizing: "border-box",
          }}
        >
          {/* Search Bar */}
          <div style={{ flex: 1, maxWidth: "480px" }}>
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Search
                style={{
                  width: "15px",
                  height: "15px",
                  color: "#94a3b8",
                  position: "absolute",
                  left: "14px",
                  pointerEvents: "none",
                }}
              />
              <input
                type="text"
                placeholder="Search documents, senders..."
                style={{
                  width: "100%",
                  height: "38px",
                  paddingLeft: "38px",
                  paddingRight: "14px",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#f8fafc",
                  fontSize: "13px",
                  color: "#0f172a",
                  outline: "none",
                  transition: "all 0.15s ease",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Right: Notification Bell & User Profile */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Bell Icon with Red Dot */}
            <button
              type="button"
              style={{
                position: "relative",
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                border: "none",
                backgroundColor: "transparent",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <Bell style={{ width: "18px", height: "18px" }} />
              <span
                style={{
                  position: "absolute",
                  top: "7px",
                  right: "7px",
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  backgroundColor: "#ef4444",
                  border: "1.5px solid #ffffff",
                }}
              />
            </button>

            {/* User Profile Dropdown */}
            <UserRoleMenu forcedRole="Recipient" showRoleSubtitle={false} />
          </div>
        </header>

        {/* Page Content */}
        <main
          style={{
            flex: 1,
            padding: "28px",
            boxSizing: "border-box",
            overflowY: "auto",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
