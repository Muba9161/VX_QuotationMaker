"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Check,
  LogOut,
  Settings,
  Shield,
  Briefcase,
  User,
  PenTool,
  KeyRound,
} from "lucide-react";
import SetPasswordModal from "@/components/SetPasswordModal";

export interface UserAccount {
  id: "org_admin" | "editor" | "platform_admin" | "recipient";
  name: string;
  role: string;
  email: string;
  avatar: string;
  organization?: string;
  avatarBg?: string;
  targetUrl: string;
}

export const SYSTEM_ACCOUNTS: UserAccount[] = [
  {
    id: "org_admin",
    name: "Rahul Sharma",
    role: "Org Admin",
    email: "admin@acme.com",
    avatar: "RS",
    organization: "Acme Technologies",
    avatarBg: "#2563eb",
    targetUrl: "/dashboard",
  },
  {
    id: "editor",
    name: "Priya Singh",
    role: "Editor",
    email: "priya@acme.com",
    avatar: "PS",
    organization: "Acme Technologies",
    avatarBg: "#2563eb",
    targetUrl: "/dashboard",
  },
  {
    id: "platform_admin",
    name: "Platform Admin",
    role: "Super Admin",
    email: "admin@vorldx.com",
    avatar: "PA",
    organization: "VorldX Platform",
    avatarBg: "#2563eb",
    targetUrl: "/admin/dashboard",
  },
  {
    id: "recipient",
    name: "John Doe",
    role: "Recipient",
    email: "recipient@techsolutions.com",
    avatar: "JD",
    organization: "Tech Solutions",
    avatarBg: "#2563eb",
    targetUrl: "/recipient/dashboard",
  },
];

interface UserRoleMenuProps {
  currentAccount?: Partial<UserAccount>;
  forcedRole?: "Org Admin" | "Editor" | "Super Admin" | "Recipient";
  showRoleSubtitle?: boolean;
}

export default function UserRoleMenu({
  currentAccount,
  forcedRole,
  showRoleSubtitle = true,
}: UserRoleMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Determine current active account
  const [activeAccount, setActiveAccount] = useState<UserAccount>(() => {
    if (typeof window !== "undefined") {
      const pathname = window.location.pathname;
      if (pathname.startsWith("/admin")) return SYSTEM_ACCOUNTS[2];
      if (pathname.startsWith("/recipient")) return SYSTEM_ACCOUNTS[3];
      const orgAuth = localStorage.getItem("vorldx_org_auth");
      if (orgAuth) {
        try {
          const parsed = JSON.parse(orgAuth);
          if (parsed.role === "Editor" || parsed.name === "Priya Singh") return SYSTEM_ACCOUNTS[1];
          if (parsed.role === "Org Admin" || parsed.name === "Rahul Sharma") return SYSTEM_ACCOUNTS[0];
        } catch {}
      }
    }

    if (forcedRole === "Editor") return SYSTEM_ACCOUNTS[1];
    if (forcedRole === "Super Admin") return SYSTEM_ACCOUNTS[2];
    if (forcedRole === "Recipient") return SYSTEM_ACCOUNTS[3];
    if (forcedRole === "Org Admin") return SYSTEM_ACCOUNTS[0];

    if (currentAccount?.id) {
      const found = SYSTEM_ACCOUNTS.find((a) => a.id === currentAccount.id);
      if (found) return found;
    }

    return SYSTEM_ACCOUNTS[0];
  });

  // Keep activeAccount updated if forcedRole or route changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const pathname = window.location.pathname;
      if (pathname.startsWith("/admin")) {
        setActiveAccount(SYSTEM_ACCOUNTS[2]);
        return;
      }
      if (pathname.startsWith("/recipient")) {
        setActiveAccount(SYSTEM_ACCOUNTS[3]);
        return;
      }
      const orgAuth = localStorage.getItem("vorldx_org_auth");
      if (orgAuth) {
        try {
          const parsed = JSON.parse(orgAuth);
          if (parsed.role === "Editor" || parsed.name === "Priya Singh") {
            setActiveAccount(SYSTEM_ACCOUNTS[1]);
            return;
          }
          setActiveAccount(SYSTEM_ACCOUNTS[0]);
          return;
        } catch {}
      }
    }

    if (forcedRole === "Org Admin") setActiveAccount(SYSTEM_ACCOUNTS[0]);
    else if (forcedRole === "Editor") setActiveAccount(SYSTEM_ACCOUNTS[1]);
    else if (forcedRole === "Super Admin") setActiveAccount(SYSTEM_ACCOUNTS[2]);
    else if (forcedRole === "Recipient") setActiveAccount(SYSTEM_ACCOUNTS[3]);
  }, [forcedRole]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSwitchAccount = (account: UserAccount) => {
    setActiveAccount(account);
    setIsOpen(false);

    if (typeof window !== "undefined") {
      if (account.id === "platform_admin") {
        localStorage.setItem(
          "vorldx_admin_auth",
          JSON.stringify({
            name: "Platform Admin",
            role: "Super Admin",
            email: "admin@vorldx.com",
            avatar: "PA",
          })
        );
      } else if (account.id === "recipient") {
        localStorage.setItem("vorldx_signer_name", "John Doe");
        localStorage.setItem("vorldx_user_role", "recipient");
      } else {
        localStorage.setItem(
          "vorldx_org_auth",
          JSON.stringify({
            email: account.email,
            name: account.name,
            role: account.role,
            avatar: account.avatar,
          })
        );
      }

      if (window.location.pathname === account.targetUrl) {
        window.location.reload();
      } else {
        window.location.href = account.targetUrl;
      }
    } else {
      router.push(account.targetUrl);
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
    } catch {}

    if (typeof window !== "undefined") {
      localStorage.removeItem("vorldx_org_auth");
      localStorage.removeItem("vorldx_admin_auth");
      localStorage.removeItem("vorldx_user_role");
      localStorage.removeItem("vorldx_signer_name");
      window.location.href = "/login";
    } else {
      router.push("/login");
    }
    setIsOpen(false);
  };

  const isRecipient = activeAccount.id === "recipient";
  const displayRoleSubtitle = showRoleSubtitle && !isRecipient;

  return (
    <div ref={menuRef} style={{ position: "relative", display: "inline-block" }}>
      {/* ================= USER PILL TRIGGER ================= */}
      <button
        id="user-profile-menu-button"
        data-testid="user-profile-menu-button"
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          backgroundColor: isOpen ? "#f1f5f9" : "transparent",
          border: "none",
          padding: "4px 8px",
          borderRadius: "10px",
          cursor: "pointer",
          outline: "none",
          transition: "all 0.15s ease",
        }}
        onMouseEnter={(e) => {
          if (!isOpen) e.currentTarget.style.backgroundColor = "#f8fafc";
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        {/* Avatar Circle */}
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            backgroundColor: "#2563eb",
            color: "#ffffff",
            fontSize: "12.5px",
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 4px rgba(37,99,235,0.25)",
            flexShrink: 0,
          }}
        >
          {activeAccount.avatar}
        </div>

        {/* User Name & Role Subtitle */}
        <div style={{ textAlign: "left", lineHeight: displayRoleSubtitle ? 1.2 : 1.1 }}>
          <span
            style={{
              fontSize: "13px",
              fontWeight: 800,
              color: "#0f172a",
              display: "block",
            }}
          >
            {activeAccount.name}
          </span>
          {displayRoleSubtitle && (
            <span
              style={{
                fontSize: "11px",
                color: "#64748b",
                fontWeight: 500,
                display: "block",
              }}
            >
              {activeAccount.role}
            </span>
          )}
        </div>

        {/* Chevron Icon */}
        <ChevronDown
          style={{
            width: "14px",
            height: "14px",
            color: "#64748b",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s ease",
            marginLeft: "2px",
          }}
        />
      </button>

      {/* ================= INTERACTIVE DROPDOWN MENU ================= */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "46px",
            width: "280px",
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            boxShadow: "0 12px 36px rgba(15,23,42,0.12)",
            zIndex: 999,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            animation: "fadeIn 0.15s ease",
          }}
        >
          {/* Header Section: Active Account Profile */}
          <div
            style={{
              padding: "16px",
              backgroundColor: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "#2563eb",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {activeAccount.avatar}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: "13.5px",
                  fontWeight: 800,
                  color: "#0f172a",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {activeAccount.name}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {activeAccount.email}
              </div>
              <div
                style={{
                  display: "inline-block",
                  padding: "2px 8px",
                  borderRadius: "9999px",
                  fontSize: "10px",
                  fontWeight: 700,
                  backgroundColor: "#eff6ff",
                  color: "#2563eb",
                  marginTop: "4px",
                }}
              >
                {activeAccount.role}
              </div>
            </div>
          </div>

          {/* Section: Switch Role / Account */}
          <div style={{ padding: "10px 8px 6px 8px" }}>
            <div
              style={{
                fontSize: "10.5px",
                fontWeight: 700,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                padding: "4px 10px 6px 10px",
              }}
            >
              Switch Role / Account
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {SYSTEM_ACCOUNTS.map((acc) => {
                const isSelected = activeAccount.id === acc.id;
                const Icon =
                  acc.id === "platform_admin"
                    ? User
                    : acc.id === "org_admin"
                    ? Shield
                    : acc.id === "editor"
                    ? Briefcase
                    : PenTool;

                return (
                  <button
                    id={`switch-role-${acc.id}`}
                    key={acc.id}
                    type="button"
                    onClick={() => handleSwitchAccount(acc)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 10px",
                      borderRadius: "10px",
                      backgroundColor: isSelected ? "#eff6ff" : "transparent",
                      border: isSelected ? "1px solid #bfdbfe" : "1px solid transparent",
                      cursor: "pointer",
                      width: "100%",
                      textAlign: "left",
                      transition: "all 0.12s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                      <div
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "50%",
                          backgroundColor: isSelected ? "#2563eb" : "#e2e8f0",
                          color: isSelected ? "#ffffff" : "#475569",
                          fontSize: "11px",
                          fontWeight: 800,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {acc.avatar}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            color: isSelected ? "#1d4ed8" : "#1e293b",
                          }}
                        >
                          {acc.name}
                        </div>
                        <div
                          style={{
                            fontSize: "10.5px",
                            color: "#64748b",
                          }}
                        >
                          {acc.role}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <Check
                        style={{
                          width: "15px",
                          height: "15px",
                          color: "#2563eb",
                          strokeWidth: 3,
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Settings & Sign Out */}
          <div
            style={{
              borderTop: "1px solid #f1f5f9",
              padding: "6px 8px 8px 8px",
              display: "flex",
              flexDirection: "column",
              gap: "2px",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setShowSecurityModal(true);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 10px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "transparent",
                color: "#334155",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <KeyRound style={{ width: "14px", height: "14px", color: "#64748b" }} />
              <span>Account Security & Password</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push(activeAccount.id === "platform_admin" ? "/admin/system-settings" : "/settings");
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 10px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "transparent",
                color: "#334155",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <Settings style={{ width: "14px", height: "14px", color: "#64748b" }} />
              <span>Workspace Settings</span>
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 10px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "transparent",
                color: "#dc2626",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fee2e2")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <LogOut style={{ width: "14px", height: "14px", color: "#dc2626" }} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Account Security & Password Modal */}
      <SetPasswordModal
        isOpen={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
      />
    </div>
  );
}
