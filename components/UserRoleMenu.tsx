"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Check, LogOut, Settings, KeyRound } from "lucide-react";
import SetPasswordModal from "@/components/SetPasswordModal";

export interface SystemRoleItem {
  id: "org_admin" | "editor" | "viewer" | "super_admin" | "support_admin" | "recipient";
  name: string;
  badge: string;
  badgeBg: string;
  badgeColor: string;
  description: string;
  targetUrl: string;
}

export const ALL_SYSTEM_ROLES: SystemRoleItem[] = [
  {
    id: "org_admin",
    name: "Org Admin",
    badge: "OA",
    badgeBg: "#eff6ff",
    badgeColor: "#2563eb",
    description: "Full organization & team administration",
    targetUrl: "/dashboard",
  },
  {
    id: "editor",
    name: "Editor",
    badge: "ED",
    badgeBg: "#f5f3ff",
    badgeColor: "#7c3aed",
    description: "Create & edit quotations and MOUs",
    targetUrl: "/dashboard",
  },
  {
    id: "viewer",
    name: "Viewer",
    badge: "VW",
    badgeBg: "#fff1f2",
    badgeColor: "#e11d48",
    description: "Read-only access to workspace documents",
    targetUrl: "/dashboard",
  },
  {
    id: "super_admin",
    name: "Super Admin",
    badge: "SA",
    badgeBg: "#f8fafc",
    badgeColor: "#0f172a",
    description: "Platform-wide tenancy & system control",
    targetUrl: "/admin/dashboard",
  },
  {
    id: "support_admin",
    name: "Support Admin",
    badge: "SP",
    badgeBg: "#fefce8",
    badgeColor: "#854d0e",
    description: "Cross-tenant support & diagnostics",
    targetUrl: "/admin/dashboard",
  },
  {
    id: "recipient",
    name: "Recipient",
    badge: "RC",
    badgeBg: "#ecfdf5",
    badgeColor: "#059669",
    description: "Client document signing & review portal",
    targetUrl: "/recipient/dashboard",
  },
];

const actionBtnStyle: React.CSSProperties = {
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
};

interface UserRoleMenuProps {
  forcedRole?: "Org Admin" | "Editor" | "Viewer" | "Super Admin" | "Support Admin" | "Recipient";
  showRoleSubtitle?: boolean;
}

export default function UserRoleMenu({
  forcedRole,
  showRoleSubtitle = true,
}: UserRoleMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Authenticated user profile state
  const [profile, setProfile] = useState<{
    name: string;
    email: string;
    role: string;
    avatar: string;
    organization: string;
  }>(() => {
    if (typeof window !== "undefined") {
      const orgAuth = localStorage.getItem("vorldx_org_auth");
      if (orgAuth) {
        try {
          const parsed = JSON.parse(orgAuth);
          return {
            name: parsed.name || "User",
            email: parsed.email || "user@acme.com",
            role: forcedRole || parsed.role || "Org Admin",
            avatar: parsed.avatar || (parsed.name ? parsed.name[0].toUpperCase() : "U"),
            organization: "Acme Technologies",
          };
        } catch {}
      }
    }
    return {
      name: "Siya",
      email: "pandeysia21@gmail.com",
      role: forcedRole || "Editor",
      avatar: "S",
      organization: "Acme Technologies",
    };
  });

  // Authoritative server session profile sync
  useEffect(() => {
    let isMounted = true;
    async function syncAuth() {
      try {
        const res = await fetch("/api/v1/auth/me", { credentials: "include" });
        if (res.ok) {
          const json = await res.json();
          if (json?.data?.user && isMounted) {
            const u = json.data.user;
            const org = json.data.organization;
            const name = u.name || u.email.split("@")[0];
            const initials = name
              .split(" ")
              .map((p: string) => p[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            const roleMapping: Record<string, string> = {
              ORG_ADMIN: "Org Admin",
              EDITOR: "Editor",
              VIEWER: "Viewer",
              SUPER_ADMIN: "Super Admin",
              SUPPORT_ADMIN: "Support Admin",
              RECIPIENT: "Recipient",
            };

            const authoritativeRole = roleMapping[u.role] || "Editor";

            setProfile((prev) => ({
              ...prev,
              name,
              email: u.email,
              role: forcedRole || authoritativeRole,
              avatar: initials || "U",
              organization: org?.name || "Acme Technologies",
            }));
          }
        }
      } catch {}
    }
    syncAuth();
    return () => {
      isMounted = false;
    };
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

  const handleSelectRole = (roleItem: SystemRoleItem) => {
    setProfile((prev) => ({ ...prev, role: roleItem.name }));
    setIsOpen(false);

    if (typeof window !== "undefined") {
      if (roleItem.id === "super_admin" || roleItem.id === "support_admin") {
        localStorage.setItem(
          "vorldx_admin_auth",
          JSON.stringify({
            name: profile.name,
            role: roleItem.name,
            email: profile.email,
            avatar: profile.avatar,
          })
        );
      } else if (roleItem.id === "recipient") {
        localStorage.setItem("vorldx_signer_name", profile.name);
        localStorage.setItem("vorldx_user_role", "recipient");
      } else {
        localStorage.setItem(
          "vorldx_org_auth",
          JSON.stringify({
            name: profile.name,
            email: profile.email,
            role: roleItem.name,
            avatar: profile.avatar,
          })
        );
      }

      if (window.location.pathname === roleItem.targetUrl) {
        window.location.reload();
      } else {
        router.push(roleItem.targetUrl);
      }
    } else {
      router.push(roleItem.targetUrl);
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST", credentials: "include" });
    } catch {}
    if (typeof window !== "undefined") {
      localStorage.removeItem("vorldx_org_auth");
      localStorage.removeItem("vorldx_admin_auth");
      localStorage.removeItem("vorldx_user_role");
      localStorage.removeItem("vorldx_signer_name");
    }
    router.push("/login");
    setIsOpen(false);
  };

  const isRecipient = profile.role === "Recipient";
  const displayRoleSubtitle = showRoleSubtitle && !isRecipient;

  return (
    <div ref={menuRef} style={{ position: "relative", display: "inline-block" }}>
      {/* User Pill Trigger */}
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
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 4px rgba(37,99,235,0.25)",
            flexShrink: 0,
          }}
        >
          {profile.avatar}
        </div>
        <div style={{ textAlign: "left", lineHeight: displayRoleSubtitle ? 1.2 : 1.1 }}>
          <span style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a", display: "block" }}>
            {profile.name}
          </span>
          {displayRoleSubtitle && (
            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 500, display: "block" }}>
              {profile.role}
            </span>
          )}
        </div>
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

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "46px",
            width: "290px",
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            boxShadow: "0 12px 36px rgba(15,23,42,0.12)",
            zIndex: 999,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header Section: Real Authenticated User Profile */}
          <div style={{ padding: "16px", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                backgroundColor: "#2563eb",
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {profile.avatar}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {profile.name}
              </div>
              <div style={{ fontSize: "11px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {profile.email}
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
                {profile.role}
              </div>
            </div>
          </div>

          {/* All System Roles List */}
          <div style={{ padding: "10px 8px 6px 8px" }}>
            <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", padding: "4px 10px 6px 10px" }}>
              Switch Role / View As
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px", maxHeight: "260px", overflowY: "auto" }}>
              {ALL_SYSTEM_ROLES.map((r) => {
                const isSelected = profile.role.toLowerCase() === r.name.toLowerCase();
                return (
                  <button
                    id={`switch-role-${r.id}`}
                    key={r.id}
                    type="button"
                    onClick={() => handleSelectRole(r)}
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
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                      <div
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "8px",
                          backgroundColor: r.badgeBg,
                          color: r.badgeColor,
                          fontSize: "11px",
                          fontWeight: 800,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {r.badge}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: "12px", fontWeight: 700, color: isSelected ? "#1d4ed8" : "#1e293b" }}>
                          {r.name}
                        </div>
                        <div style={{ fontSize: "10px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {r.description}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check style={{ width: "15px", height: "15px", color: "#2563eb", strokeWidth: 3, flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ borderTop: "1px solid #f1f5f9", padding: "6px 8px 8px 8px", display: "flex", flexDirection: "column", gap: "2px" }}>
            <button
              type="button"
              onClick={() => { setIsOpen(false); setShowSecurityModal(true); }}
              style={actionBtnStyle}
            >
              <KeyRound style={{ width: "14px", height: "14px", color: "#64748b" }} />
              <span>Account Security & Password</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push(profile.role === "Super Admin" || profile.role === "Support Admin" ? "/admin/system-settings" : "/settings");
              }}
              style={actionBtnStyle}
            >
              <Settings style={{ width: "14px", height: "14px", color: "#64748b" }} />
              <span>Workspace Settings</span>
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              style={{ ...actionBtnStyle, color: "#dc2626" }}
            >
              <LogOut style={{ width: "14px", height: "14px", color: "#dc2626" }} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Account Security Modal */}
      <SetPasswordModal
        isOpen={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
      />
    </div>
  );
}
