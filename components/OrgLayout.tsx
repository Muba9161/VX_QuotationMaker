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
  Image as ImageIcon,
  Settings,
  BarChart2,
  Mail,
  Building2,
} from "lucide-react";
import UserRoleMenu from "@/components/UserRoleMenu";
import Footer from "@/components/Footer";
import ConfirmModal from "@/components/ConfirmModal";
import { logoutAndRedirect } from "@/components/auth/logout";
import { editorNavItems, orgAdminNavItems } from "@/components/navigation/org-nav-items";

const PersistentOrgShellContext = React.createContext(false);

interface OrgLayoutProps {
  children: ReactNode;
  activePath?: string;
  forcedRole?: "Org Admin" | "Editor";
  persistent?: boolean;
}

function OrgLayoutInner({ children, activePath, forcedRole }: OrgLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const currentPath = activePath || pathname;

  const [currentUser, setCurrentUser] = useState({
    name: "User",
    role: "Org Admin",
    email: "",
    avatar: "U",
  });
  const [orgName, setOrgName] = useState("Organization Workspace");
  const [orgLogoUrl, setOrgLogoUrl] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function syncAuth(initial = false) {
      if (initial) setIsAuthenticated(false);
      try {
        const res = await fetch("/api/v1/auth/me", {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) {
          if (isMounted) {
            setIsAuthenticated(false);
            router.replace("/login");
          }
          return;
        }

        const json = await res.json();
        const user = json?.data?.user;
        if (!json?.success || !user) {
          if (isMounted) {
            setIsAuthenticated(false);
            router.replace("/login");
          }
          return;
        }

        if (!isMounted) return;

        const organization = json.data.organization;
        if (organization) {
          setOrgName(organization.name || organization.displayName || "Organization Workspace");
          setOrgLogoUrl(organization.logoUrl || null);
        }

        const name = user.name?.trim() || "Team Member";
        const initials = name
          .split(" ")
          .map((part: string) => part[0])
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
        setCurrentUser({
          name,
          role: roleMapping[user.role] || "Editor",
          email: user.email,
          avatar: initials || "U",
        });
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Unable to validate the current session.", error);
        if (isMounted) router.replace("/login");
      }
    }

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) void syncAuth();
    };

    void syncAuth(true);
    window.addEventListener("pageshow", handlePageShow);
    return () => {
      isMounted = false;
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [router]);

  const effectiveRole = forcedRole || currentUser.role;
  const navItems = effectiveRole === "Editor" || effectiveRole === "Viewer" ? editorNavItems : orgAdminNavItems;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logoutAndRedirect();
  };

  if (!isAuthenticated) return null;

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
        {/* Organization Brand Header */}
        <div
          style={{
            height: "64px",
            display: "flex",
            alignItems: "center",
            padding: "0 18px",
            borderBottom: "1px solid #f1f5f9",
            gap: "10px",
            boxSizing: "border-box",
          }}
        >
          {orgLogoUrl ? (
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                backgroundColor: "#ffffff",
                padding: "2px",
                flexShrink: 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={orgLogoUrl}
                alt="Organization Logo"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            </div>
          ) : (
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "8px",
                backgroundColor: "#eff6ff",
                border: "1px solid #dbeafe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                color: "#2563eb",
              }}
            >
              <Building2 style={{ width: "18px", height: "18px" }} />
            </div>
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1
              style={{
                fontSize: "14px",
                fontWeight: 800,
                color: "#0f172a",
                letterSpacing: "-0.2px",
                margin: 0,
                lineHeight: 1.2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "155px",
              }}
              title={orgName}
            >
              {orgName}
            </h1>
            <p
              style={{
                fontSize: "10.5px",
                fontWeight: 500,
                color: "#64748b",
                margin: "2px 0 0 0",
                lineHeight: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "155px",
              }}
            >
              Workspace
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
              (item.href !== "/dashboard" && currentPath.startsWith(item.href)) ||
              (item.href === "/clients" && currentPath.startsWith("/contacts")) ||
              (item.href === "/contacts" && currentPath.startsWith("/clients"));

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
            onClick={() => setShowLogoutConfirmation(true)}
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

            <div style={{ height: "24px", width: "1px", backgroundColor: "#e2e8f0" }} />

            <UserRoleMenu forcedRole={forcedRole} />
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

        <Footer organizationName={orgName} />
      </div>
      <ConfirmModal
        isOpen={showLogoutConfirmation}
        onClose={() => setShowLogoutConfirmation(false)}
        onConfirm={handleLogout}
        title="Sign out?"
        description="Are you sure you want to sign out of your account?"
        confirmLabel="Sign Out"
        variant="warning"
        isConfirming={isLoggingOut}
      />
    </div>
  );
}

export default function OrgLayout({ persistent = false, ...props }: OrgLayoutProps) {
  const isInsidePersistentShell = React.useContext(PersistentOrgShellContext);

  if (isInsidePersistentShell && !persistent) {
    return <>{props.children}</>;
  }

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
      <PersistentOrgShellContext.Provider value={persistent}>
        <OrgLayoutInner {...props} />
      </PersistentOrgShellContext.Provider>
    </React.Suspense>
  );
}
