"use client";
import React from "react";
import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";
import {
  Building2,
  Users2,
  FileText,
  Shield,
  Calendar,
  ChevronDown,
} from "lucide-react";

export default function AdminDashboardPage() {
  const stats = [
    {
      title: "Total Organizations",
      value: "24",
      change: "+12% this month",
      icon: Building2,
      iconColor: "#10b981",
      iconBg: "#dcfce7",
      border: "#bbf7d0",
    },
    {
      title: "Total Users",
      value: "156",
      change: "+18% this month",
      icon: Users2,
      iconColor: "#2563eb",
      iconBg: "#dbeafe",
      border: "#bfdbfe",
    },
    {
      title: "Total Documents",
      value: "1,245",
      change: "+20% this month",
      icon: FileText,
      iconColor: "#9333ea",
      iconBg: "#f3e8ff",
      border: "#e9d5ff",
    },
    {
      title: "Active Subscriptions",
      value: "20",
      change: "+5% this month",
      icon: Shield,
      iconColor: "#d97706",
      iconBg: "#fef3c7",
      border: "#fde68a",
    },
  ];

  const activityData = [
    { date: "1 Oct", quotes: 140, mous: 70 },
    { date: "5 Oct", quotes: 185, mous: 95 },
    { date: "10 Oct", quotes: 240, mous: 110 },
    { date: "15 Oct", quotes: 175, mous: 85 },
    { date: "20 Oct", quotes: 285, mous: 130 },
    { date: "25 Oct", quotes: 220, mous: 105 },
    { date: "31 Oct", quotes: 260, mous: 120 },
  ];

  const recentOrgs = [
    {
      id: "org-1",
      name: "VorldX Technologies Pvt Ltd",
      plan: "Pro",
      users: 12,
      documents: 145,
      joinedOn: "28 Oct 2026",
      status: "Active",
    },
    {
      id: "org-2",
      name: "NextGen Digital",
      plan: "Basic",
      users: 5,
      documents: 32,
      joinedOn: "25 Oct 2026",
      status: "Active",
    },
    {
      id: "org-3",
      name: "Global Systems",
      plan: "Pro",
      users: 18,
      documents: 210,
      joinedOn: "20 Oct 2026",
      status: "Active",
    },
    {
      id: "org-4",
      name: "Tech Solutions",
      plan: "Basic",
      users: 8,
      documents: 64,
      joinedOn: "18 Oct 2026",
      status: "Active",
    },
  ];

  return (
    <AdminLayout activePath="/admin/dashboard">
      <div
        style={{
          width: "100%",
          maxWidth: "1400px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          boxSizing: "border-box",
        }}
      >
        {/* ================= HEADER: DASHBOARD & DATE PICKER ================= */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "26px",
                fontWeight: "900",
                color: "#0f172a",
                letterSpacing: "-0.5px",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Dashboard
            </h1>
            <p
              style={{
                fontSize: "13px",
                color: "#64748b",
                margin: "4px 0 0 0",
                fontWeight: "400",
              }}
            >
              Overview of all organizations, usage, and platform activity
            </p>
          </div>

          {/* Date Picker Button */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "7px 14px",
              borderRadius: "10px",
              backgroundColor: "#ffffff",
              border: "1px solid #cbd5e1",
              fontSize: "12px",
              fontWeight: "600",
              color: "#334155",
              boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
              cursor: "pointer",
            }}
          >
            <Calendar style={{ width: "15px", height: "15px", color: "#64748b" }} />
            <span>01 Oct 2026 - 31 Oct 2026</span>
            <ChevronDown style={{ width: "14px", height: "14px", color: "#94a3b8" }} />
          </div>
        </div>

        {/* ================= ROW 1: 4 STAT CARDS ================= */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "18px",
            boxSizing: "border-box",
          }}
        >
          {stats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0",
                  padding: "20px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxSizing: "border-box",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      backgroundColor: s.iconBg,
                      border: `1px solid ${s.border}`,
                      color: s.iconColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon style={{ width: "22px", height: "22px" }} />
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#64748b",
                        display: "block",
                        marginBottom: "4px",
                      }}
                    >
                      {s.title}
                    </span>
                    <span
                      style={{
                        fontSize: "26px",
                        fontWeight: "900",
                        color: "#0f172a",
                        letterSpacing: "-0.5px",
                        lineHeight: 1,
                        display: "block",
                      }}
                    >
                      {s.value}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "16px",
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#10b981",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span>{s.change}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ================= ROW 2: DUAL CHARTS ================= */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.9fr 1.1fr",
            gap: "20px",
            boxSizing: "border-box",
          }}
        >
          {/* Document Activity Chart */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              padding: "22px 24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
              display: "flex",
              flexDirection: "column",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                Document Activity
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "11px", fontWeight: "700" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "3px", backgroundColor: "#2563eb" }} />
                  <span style={{ color: "#475569" }}>Quotations</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "3px", backgroundColor: "#38bdf8" }} />
                  <span style={{ color: "#475569" }}>MOUs</span>
                </div>
              </div>
            </div>

            {/* Dual Bar Chart with Y-Axis */}
            <div style={{ display: "flex", alignItems: "stretch", height: "220px", paddingTop: "10px" }}>
              {/* Y-Axis scale */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  fontSize: "11px",
                  color: "#94a3b8",
                  paddingRight: "14px",
                  textAlign: "right",
                  width: "36px",
                  userSelect: "none",
                }}
              >
                <span>250</span>
                <span>200</span>
                <span>150</span>
                <span>100</span>
                <span>50</span>
                <span>0</span>
              </div>

              {/* Bars container */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  gap: "12px",
                  borderBottom: "1px solid #f1f5f9",
                  paddingBottom: "4px",
                  paddingLeft: "8px",
                  paddingRight: "8px",
                }}
              >
                {activityData.map((d, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                      height: "100%",
                      justifyContent: "flex-end",
                    }}
                  >
                    <div style={{ width: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "4px", height: "175px" }}>
                      <div
                        style={{
                          height: `${(d.quotes / 300) * 100}%`,
                          width: "12px",
                          backgroundColor: "#2563eb",
                          borderRadius: "3px 3px 0 0",
                          transition: "all 0.2s ease",
                          cursor: "pointer",
                        }}
                        title={`${d.quotes} Quotations on ${d.date}`}
                      />
                      <div
                        style={{
                          height: `${(d.mous / 300) * 100}%`,
                          width: "12px",
                          backgroundColor: "#38bdf8",
                          borderRadius: "3px 3px 0 0",
                          transition: "all 0.2s ease",
                          cursor: "pointer",
                        }}
                        title={`${d.mous} MOUs on ${d.date}`}
                      />
                    </div>
                    <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", whiteSpace: "nowrap" }}>
                      {d.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Document Status Donut Card */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              padding: "22px 24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxSizing: "border-box",
            }}
          >
            <h3 style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a", margin: "0 0 12px 0" }}>
              Document Status
            </h3>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", flex: 1, padding: "8px 0" }}>
              {/* Donut graphic */}
              <div style={{ position: "relative", width: "140px", height: "140px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }} viewBox="0 0 36 36">
                  {/* Background Track */}
                  <path
                    style={{ color: "#f1f5f9" }}
                    strokeWidth="4.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Signed 62% (Blue) */}
                  <path
                    style={{ color: "#2563eb" }}
                    strokeDasharray="62, 100"
                    strokeWidth="4.2"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Pending 24% (Amber) */}
                  <path
                    style={{ color: "#f59e0b" }}
                    strokeDasharray="24, 100"
                    strokeDashoffset="-62"
                    strokeWidth="4.2"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Expired 8% (Red) */}
                  <path
                    style={{ color: "#ef4444" }}
                    strokeDasharray="8, 100"
                    strokeDashoffset="-86"
                    strokeWidth="4.2"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Draft 6% (Green/Teal) */}
                  <path
                    style={{ color: "#10b981" }}
                    strokeDasharray="6, 100"
                    strokeDashoffset="-94"
                    strokeWidth="4.2"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ fontSize: "22px", fontWeight: "900", color: "#0f172a", lineHeight: 1 }}>
                    1,245
                  </span>
                  <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", marginTop: "2px" }}>
                    Total
                  </span>
                </div>
              </div>

              {/* Exact Legend on right side */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: "120px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "9px", height: "9px", borderRadius: "2px", backgroundColor: "#2563eb" }} />
                    <span style={{ fontSize: "12px", color: "#475569", fontWeight: "600" }}>Signed</span>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: "800", color: "#0f172a" }}>62%</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "9px", height: "9px", borderRadius: "2px", backgroundColor: "#f59e0b" }} />
                    <span style={{ fontSize: "12px", color: "#475569", fontWeight: "600" }}>Pending</span>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: "800", color: "#0f172a" }}>24%</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "9px", height: "9px", borderRadius: "2px", backgroundColor: "#ef4444" }} />
                    <span style={{ fontSize: "12px", color: "#475569", fontWeight: "600" }}>Expired</span>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: "800", color: "#0f172a" }}>8%</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "9px", height: "9px", borderRadius: "2px", backgroundColor: "#10b981" }} />
                    <span style={{ fontSize: "12px", color: "#475569", fontWeight: "600" }}>Draft</span>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: "800", color: "#0f172a" }}>6%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= ROW 3: RECENT ORGANIZATIONS TABLE ================= */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <h3 style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
              Recent Organizations
            </h3>
            <Link
              href="/admin/organizations"
              style={{
                fontSize: "12px",
                fontWeight: "700",
                color: "#2563eb",
                textDecoration: "none",
              }}
            >
              View All
            </Link>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                fontSize: "12.5px",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#f8fafc",
                    borderBottom: "1px solid #f1f5f9",
                    color: "#64748b",
                    fontSize: "11px",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  <th style={{ padding: "12px 24px", width: "40px" }}>#</th>
                  <th style={{ padding: "12px 24px" }}>Organization Name</th>
                  <th style={{ padding: "12px 24px" }}>Plan</th>
                  <th style={{ padding: "12px 24px" }}>Users</th>
                  <th style={{ padding: "12px 24px" }}>Documents</th>
                  <th style={{ padding: "12px 24px" }}>Joined On</th>
                  <th style={{ padding: "12px 24px", textAlign: "right" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrgs.map((org, idx) => (
                  <tr
                    key={org.id}
                    style={{
                      borderBottom: idx !== recentOrgs.length - 1 ? "1px solid #f1f5f9" : "none",
                      transition: "background-color 0.15s ease",
                    }}
                  >
                    <td style={{ padding: "14px 24px", color: "#94a3b8", fontWeight: "600" }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: "14px 24px", fontWeight: "700", color: "#0f172a" }}>
                      <Link
                        href={`/admin/organizations/${org.id}`}
                        style={{ color: "#0f172a", textDecoration: "none" }}
                      >
                        {org.name}
                      </Link>
                    </td>
                    <td style={{ padding: "14px 24px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 10px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: "700",
                          backgroundColor: org.plan === "Pro" ? "#f1f5f9" : "#f8fafc",
                          color: "#334155",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        {org.plan}
                      </span>
                    </td>
                    <td style={{ padding: "14px 24px", color: "#475569", fontWeight: "600" }}>
                      {org.users}
                    </td>
                    <td style={{ padding: "14px 24px", color: "#475569", fontWeight: "600" }}>
                      {org.documents}
                    </td>
                    <td style={{ padding: "14px 24px", color: "#64748b", fontWeight: "500" }}>
                      {org.joinedOn}
                    </td>
                    <td style={{ padding: "14px 24px", textAlign: "right" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 10px",
                          borderRadius: "9999px",
                          fontSize: "11px",
                          fontWeight: "700",
                          backgroundColor: "#dcfce7",
                          color: "#15803d",
                          border: "1px solid #bbf7d0",
                        }}
                      >
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
