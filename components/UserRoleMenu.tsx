"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Settings, KeyRound } from "lucide-react";
import SetPasswordModal from "@/components/SetPasswordModal";

const actionBtnStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "9px",
  padding: "9px 12px",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "transparent",
  color: "#334155",
  fontSize: "12.5px",
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
  }>({
    name: "User",
    email: "user@vorldx.com",
    role: forcedRole || "Org Admin",
    avatar: "U",
    organization: "VorldXnologies",
  });

  // Authoritative server session profile sync from /api/v1/auth/me
  useEffect(() => {
    let isMounted = true;

    async function syncAuth() {
      if (typeof window !== "undefined") {
        const orgAuth = localStorage.getItem("vorldx_org_auth");
        if (orgAuth) {
          try {
            const parsed = JSON.parse(orgAuth);
            if (parsed && isMounted) {
              setProfile({
                name: parsed.name || "User",
                email: parsed.email || "user@vorldx.com",
                role: forcedRole || parsed.role || "Org Admin",
                avatar: parsed.avatar || (parsed.name ? parsed.name[0].toUpperCase() : "U"),
                organization: "VorldXnologies",
              });
            }
          } catch {}
        }
      }

      try {
        const res = await fetch("/api/v1/auth/me", { credentials: "include" });
        if (res.ok) {
          const json = await res.json();
          if (json?.data?.user && isMounted) {
            const u = json.data.user;
            const org = json.data.organization;
            const name = u.name?.trim() || "Team Member";
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

            setProfile({
              name,
              email: u.email,
              role: forcedRole || authoritativeRole,
              avatar: initials || "U",
              organization: org?.name || "VorldXnologies",
            });

            // Keep localStorage updated with real profile
            if (typeof window !== "undefined") {
              localStorage.setItem(
                "vorldx_org_auth",
                JSON.stringify({
                  name,
                  email: u.email,
                  role: forcedRole || authoritativeRole,
                  avatar: initials || "U",
                })
              );
            }
          }
        }
      } catch {}
    }
    syncAuth();
    return () => {
      isMounted = false;
    };
  }, [forcedRole]);

  // Click outside to close dropdown
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
          transition: "all 0.15s ease",
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
            width: "270px",
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
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  color: "#0f172a",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {profile.name}
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

          {/* Quick Actions & Sign Out */}
          <div
            style={{
              padding: "8px",
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
              style={actionBtnStyle}
            >
              <KeyRound style={{ width: "15px", height: "15px", color: "#64748b" }} />
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
              <Settings style={{ width: "15px", height: "15px", color: "#64748b" }} />
              <span>Workspace Settings</span>
            </button>
            <div style={{ height: "1px", backgroundColor: "#f1f5f9", margin: "4px 0" }} />
            <button
              type="button"
              onClick={handleSignOut}
              style={{ ...actionBtnStyle, color: "#dc2626" }}
            >
              <LogOut style={{ width: "15px", height: "15px", color: "#dc2626" }} />
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
