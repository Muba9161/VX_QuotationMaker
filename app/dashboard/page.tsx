"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import OrgLayout from "@/components/OrgLayout";
import {
  FileCheck2,
  FileText,
  Users,
  Plus,
  KeyRound,
  Lock,
  X,
  TrendingUp,
} from "lucide-react";
import SetPasswordModal from "@/components/SetPasswordModal";

interface DashboardStats {
  clients: {
    total: number;
    active: number;
    recent: number;
  };
  quotations: {
    total: number;
    draft: number;
    sent: number;
    accepted: number;
    rejected: number;
    expired: number;
    totalValue: number;
  };
  mous: {
    total: number;
    draft: number;
    ready: number;
    sent: number;
    signed: number;
    expiring: number;
    cancelled: number;
  };
}

interface ActivityItem {
  id: string;
  action: string;
  title: string;
  description: string;
  userName: string | null;
  timestamp: string;
  iconType: string;
}

interface RecentDocument {
  id: string;
  docNumber: string;
  title: string;
  clientName: string | null;
  clientCompany?: string | null;
  contact?: {
    name?: string | null;
    companyName?: string | null;
  } | null;
  total?: number | string | null;
  status: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [userName, setUserName] = useState<string | null>(null);
  const [hasPassword, setHasPassword] = useState<boolean | undefined>(undefined);
  const [showPasswordBanner, setShowPasswordBanner] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [recentQuotes, setRecentQuotes] = useState<RecentDocument[]>([]);
  const [recentMous, setRecentMous] = useState<RecentDocument[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData<T>(url: string): Promise<T> {
      const response = await fetch(url, {
        credentials: "include",
        cache: "no-store",
        signal: controller.signal,
      });
      const payload = await response.json();
      if (!response.ok || payload?.success !== true || payload.data === undefined) {
        throw new Error(payload?.error?.message || "Unable to load dashboard data.");
      }
      return payload.data as T;
    }

    async function loadDashboard() {
      setDashboardLoading(true);
      setDashboardError(null);
      try {
        const [profile, dashboardStats, activityItems, quotations, mous] = await Promise.all([
          fetchData<{ user: { name?: string | null; hasPassword?: boolean } }>("/api/v1/auth/me"),
          fetchData<DashboardStats>("/api/v1/dashboard/stats"),
          fetchData<ActivityItem[]>("/api/v1/dashboard/activity?limit=8"),
          fetchData<RecentDocument[]>("/api/v1/quotations?limit=4"),
          fetchData<RecentDocument[]>("/api/v1/mous?limit=4"),
        ]);
        if (
          !Array.isArray(activityItems) ||
          !Array.isArray(quotations) ||
          !Array.isArray(mous) ||
          !dashboardStats?.clients ||
          !dashboardStats?.quotations ||
          !dashboardStats?.mous ||
          !profile?.user
        ) {
          throw new Error("The dashboard API returned an invalid response.");
        }

        const firstName = profile.user.name?.trim().split(/\s+/)[0] || null;
        const userHasPassword =
          typeof profile.user.hasPassword === "boolean"
            ? profile.user.hasPassword
            : undefined;

        setUserName(firstName);
        setHasPassword(userHasPassword);
        setShowPasswordBanner(
          userHasPassword === false &&
            !sessionStorage.getItem("vx_dismiss_pwd_banner")
        );
        setStats(dashboardStats);
        setActivities(activityItems);
        setRecentQuotes(quotations);
        setRecentMous(mous);
      } catch (error) {
        if (!controller.signal.aborted) {
          setStats(null);
          setActivities([]);
          setRecentQuotes([]);
          setRecentMous([]);
          setDashboardError(
            error instanceof Error ? error.message : "Unable to load dashboard data."
          );
        }
      } finally {
        if (!controller.signal.aborted) setDashboardLoading(false);
      }
    }

    void loadDashboard();
    return () => controller.abort();
  }, [reloadKey]);

  return (
    <OrgLayout activePath="/dashboard">
      <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px", paddingBottom: "40px" }}>
        {/* Onboarding Password Setup Banner for Google OAuth Users */}
        {showPasswordBanner && (
          <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "14px", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb", flexShrink: 0 }}>
                <KeyRound style={{ width: "18px", height: "18px" }} />
              </div>
              <div>
                <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#1e3a8a" }}>Enable Direct Password Sign-In</div>
                <div style={{ fontSize: "12.5px", color: "#1e40af", marginTop: "2px" }}>
                  You signed in via Google OAuth. Set a password to log in directly using your email and password as well.
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px", backgroundColor: "#2563eb", color: "#ffffff", borderRadius: "8px", border: "none", fontSize: "12.5px", fontWeight: 600, cursor: "pointer" }}
              >
                <Lock style={{ width: "14px", height: "14px" }} />
                <span>Set Password</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordBanner(false);
                  sessionStorage.setItem("vx_dismiss_pwd_banner", "true");
                }}
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "30px", height: "30px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff", color: "#64748b", cursor: "pointer" }}
                title="Dismiss"
              >
                <X style={{ width: "16px", height: "16px" }} />
              </button>
            </div>
          </div>
        )}

        <SetPasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          onSuccess={() => {
            setShowPasswordBanner(false);
            setHasPassword(true);
          }}
          hasExistingPassword={hasPassword}
        />

        {/* Greeting & Quick Actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.4px" }}>
              Welcome back{userName ? `, ${userName}` : ""}! 👋
            </h1>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0 0" }}>
              Here is your live organization overview, commercial pipeline, and document activity.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <Link
              href="/quotations/new"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 18px", backgroundColor: "#2563eb", color: "#ffffff", borderRadius: "10px", fontSize: "12.5px", fontWeight: 700, textDecoration: "none", boxShadow: "0 2px 6px rgba(37,99,235,0.2)" }}
            >
              <Plus style={{ width: "15px", height: "15px" }} />
              <span>New Quotation</span>
            </Link>
            <Link
              href="/mou/new"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 18px", backgroundColor: "#0f172a", color: "#ffffff", borderRadius: "10px", fontSize: "12.5px", fontWeight: 700, textDecoration: "none" }}
            >
              <Plus style={{ width: "15px", height: "15px" }} />
              <span>New MOU</span>
            </Link>
          </div>
        </div>

        {dashboardError && (
          <div
            role="alert"
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "10px",
              padding: "12px 16px",
              color: "#b91c1c",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <span>{dashboardError}</span>
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              style={{
                border: 0,
                background: "none",
                color: "#2563eb",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Primary KPI Metrics Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "18px" }}>
          {/* Total Quotation Value Card */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "20px 22px", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#64748b" }}>Total Quotation Pipeline</span>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <TrendingUp style={{ width: "16px", height: "16px" }} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a" }}>
                {dashboardLoading
                  ? "Loading..."
                  : dashboardError
                  ? "Unavailable"
                  : `₹${(stats?.quotations.totalValue ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
              </div>
              <div style={{ fontSize: "12px", color: "#16a34a", marginTop: "4px", fontWeight: 600 }}>
                {dashboardLoading
                  ? "Loading dashboard data..."
                  : dashboardError
                  ? "Dashboard data unavailable"
                  : `${stats?.quotations.accepted ?? 0} accepted • ${stats?.quotations.sent ?? 0} active proposals`}
              </div>
            </div>
          </div>

          {/* Quotations Status Card */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "20px 22px", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#64748b" }}>Quotations Lifecycle</span>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#f0fdf4", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FileCheck2 style={{ width: "16px", height: "16px" }} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a" }}>
                {dashboardLoading ? "Loading..." : dashboardError ? "Unavailable" : `${stats?.quotations.total ?? 0} Proposals`}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", fontSize: "11.5px", color: "#64748b", marginTop: "6px" }}>
                {dashboardLoading || dashboardError ? (
                  <span>{dashboardLoading ? "Loading dashboard data..." : "Dashboard data unavailable"}</span>
                ) : (
                  <>
                    <span>{stats?.quotations.draft ?? 0} Draft</span> •
                    <span>{stats?.quotations.sent ?? 0} Sent</span> •
                    <span style={{ color: "#16a34a", fontWeight: 700 }}>{stats?.quotations.accepted ?? 0} Accepted</span> •
                    <span>{stats?.quotations.rejected ?? 0} Rejected</span> •
                    <span>{stats?.quotations.expired ?? 0} Expired</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* MOUs Status Card */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "20px 22px", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#64748b" }}>MOU Agreements</span>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#eef2ff", color: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FileText style={{ width: "16px", height: "16px" }} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a" }}>
                {dashboardLoading ? "Loading..." : dashboardError ? "Unavailable" : `${stats?.mous.total ?? 0} Agreements`}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", fontSize: "11.5px", color: "#64748b", marginTop: "6px" }}>
                {dashboardLoading || dashboardError ? (
                  <span>{dashboardLoading ? "Loading dashboard data..." : "Dashboard data unavailable"}</span>
                ) : (
                  <>
                    <span>{stats?.mous.draft ?? 0} Draft</span> •
                    <span>{stats?.mous.ready ?? 0} Ready</span> •
                    <span>{stats?.mous.sent ?? 0} Sent</span> •
                    <span style={{ color: "#16a34a", fontWeight: 700 }}>{stats?.mous.signed ?? 0} Executed</span> •
                    <span>{stats?.mous.cancelled ?? 0} Cancelled</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Clients Directory Card */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "20px 22px", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#64748b" }}>Clients & Partners</span>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#fff7ed", color: "#ea580c", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Users style={{ width: "16px", height: "16px" }} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a" }}>
                {dashboardLoading ? "Loading..." : dashboardError ? "Unavailable" : `${stats?.clients.total ?? 0} Counterparties`}
              </div>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                {dashboardLoading
                  ? "Loading dashboard data..."
                  : dashboardError
                  ? "Dashboard data unavailable"
                  : `${stats?.clients.active ?? 0} active • ${stats?.clients.recent ?? 0} added this month`}
              </div>
            </div>
          </div>
        </div>

        {/* 2-Columns: Recent Documents & Live Activity Feed */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "24px" }}>
          {/* Left Column: Recent Documents */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Recent Quotations */}
            <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "20px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Recent Quotations</h3>
                <Link href="/quotations" style={{ fontSize: "12.5px", fontWeight: 600, color: "#2563eb", textDecoration: "none" }}>
                  View All &rarr;
                </Link>
              </div>

              {dashboardLoading ? (
                <p role="status" style={{ fontSize: "13px", color: "#94a3b8", margin: "14px 0" }}>Loading quotations...</p>
              ) : dashboardError ? (
                <p role="alert" style={{ fontSize: "13px", color: "#b91c1c", margin: "14px 0" }}>Quotations are unavailable.</p>
              ) : recentQuotes.length === 0 ? (
                <p style={{ fontSize: "13px", color: "#94a3b8", margin: "14px 0" }}>No quotations created yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {recentQuotes.map((q) => (
                    <div key={q.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: "8px", border: "1px solid #f1f5f9", backgroundColor: "#f8fafc" }}>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{q.docNumber}</div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>{q.title} • {q.clientName || q.clientCompany || q.contact?.name || q.contact?.companyName || "—"}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{q.total != null && Number.isFinite(Number(q.total)) ? `₹${Number(q.total).toLocaleString()}` : "—"}</div>
                        <span style={{ fontSize: "10.5px", fontWeight: 700, color: q.status === "APPROVED" ? "#16a34a" : "#2563eb" }}>{q.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent MOUs */}
            <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "20px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Recent MOUs</h3>
                <Link href="/mou" style={{ fontSize: "12.5px", fontWeight: 600, color: "#2563eb", textDecoration: "none" }}>
                  View All &rarr;
                </Link>
              </div>

              {dashboardLoading ? (
                <p role="status" style={{ fontSize: "13px", color: "#94a3b8", margin: "14px 0" }}>Loading MOUs...</p>
              ) : dashboardError ? (
                <p role="alert" style={{ fontSize: "13px", color: "#b91c1c", margin: "14px 0" }}>MOUs are unavailable.</p>
              ) : recentMous.length === 0 ? (
                <p style={{ fontSize: "13px", color: "#94a3b8", margin: "14px 0" }}>No MOUs created yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {recentMous.map((m) => (
                    <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: "8px", border: "1px solid #f1f5f9", backgroundColor: "#f8fafc" }}>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{m.docNumber}</div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>{m.title} • {m.clientName || m.clientCompany || m.contact?.name || m.contact?.companyName || "—"}</div>
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: m.status === "SIGNED" ? "#16a34a" : "#4f46e5" }}>{m.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Audit Activity Timeline */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "20px 22px", height: "fit-content" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", margin: "0 0 16px 0" }}>Recent Activity Log</h3>

            {dashboardLoading ? (
              <p role="status" style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>Loading activity...</p>
            ) : dashboardError ? (
              <p role="alert" style={{ fontSize: "13px", color: "#b91c1c", margin: 0 }}>Activity is unavailable.</p>
            ) : activities.length === 0 ? (
              <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>No recent activity recorded.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {activities.map((act) => (
                  <div key={act.id} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "12.5px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#2563eb", marginTop: "5px", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: "#0f172a" }}>{act.title}</div>
                      <div style={{ color: "#64748b", marginTop: "1px", lineHeight: 1.35 }}>{act.description}</div>
                      <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                        {Number.isNaN(new Date(act.timestamp).getTime())
                          ? "—"
                          : new Date(act.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {act.userName ? ` • ${act.userName}` : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </OrgLayout>
  );
}
