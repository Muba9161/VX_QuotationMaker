"use client";

import React, { useState } from "react";
import OrgLayout from "@/components/OrgLayout";
import {
  Clock,
  FileCheck2,
  Calendar,
  ChevronDown,
  MoreVertical,
} from "lucide-react";
import Link from "next/link";

interface RecentActivity {
  id: number;
  docName: string;
  type: "Quotation" | "MOU";
  client: string;
  status: "Accepted" | "Pending" | "Declined";
  signTime: string;
  createdOn: string;
}

const ACTIVITIES: RecentActivity[] = [
  {
    id: 1,
    docName: "Web Development Proposal",
    type: "Quotation",
    client: "Innovate India",
    status: "Accepted",
    signTime: "1.2 days",
    createdOn: "24 Oct 2026",
  },
  {
    id: 2,
    docName: "IT Support Services",
    type: "Quotation",
    client: "Tech Solutions",
    status: "Pending",
    signTime: "-",
    createdOn: "22 Oct 2026",
  },
  {
    id: 3,
    docName: "Maintenance Agreement",
    type: "MOU",
    client: "Global Systems",
    status: "Accepted",
    signTime: "2.1 days",
    createdOn: "18 Oct 2026",
  },
  {
    id: 4,
    docName: "Consulting Services",
    type: "Quotation",
    client: "Future Tech",
    status: "Declined",
    signTime: "-",
    createdOn: "14 Oct 2026",
  },
];

export default function OrgReportsPage() {
  const [timeRange, setTimeRange] = useState("Last 30 Days");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  const timeRanges = ["Last 7 Days", "Last 30 Days", "Last 90 Days", "This Year"];

  const metrics =
    timeRange === "Last 7 Days"
      ? { signTime: "1.4 Days", signChange: "28% faster", rate: "82.0%", rateChange: "6.1%", pipeline: "₹4,20,000", quotes: "6" }
      : timeRange === "Last 90 Days"
      ? { signTime: "2.1 Days", signChange: "18% faster", rate: "76.0%", rateChange: "4.2%", pipeline: "₹38,50,000", quotes: "58" }
      : timeRange === "This Year"
      ? { signTime: "2.4 Days", signChange: "15% faster", rate: "74.8%", rateChange: "3.8%", pipeline: "₹85,00,000", quotes: "142" }
      : { signTime: "1.8 Days", signChange: "24% faster than last month", rate: "78.5%", rateChange: "5.2% improvement", pipeline: "₹14,50,000", quotes: "24" };

  return (
    <OrgLayout activePath="/reports" forcedRole="Org Admin">
      <div
        style={{
          width: "100%",
          maxWidth: "1480px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          boxSizing: "border-box",
          paddingBottom: "36px",
        }}
      >
        {/* ================= PAGE HEADER ================= */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "26px",
                fontWeight: 800,
                color: "#0f172a",
                letterSpacing: "-0.5px",
                margin: 0,
              }}
            >
              Reports & Analytics
            </h1>
            <p
              style={{
                fontSize: "13px",
                color: "#64748b",
                margin: "4px 0 0 0",
              }}
            >
              Quotation conversion rates and MOU signing velocity
            </p>
          </div>

          {/* Time Filter Dropdown */}
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 14px",
                backgroundColor: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                fontSize: "12.5px",
                fontWeight: 600,
                color: "#334155",
                cursor: "pointer",
                boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
              }}
            >
              <Calendar style={{ width: "15px", height: "15px", color: "#64748b" }} />
              <span>{timeRange}</span>
              <ChevronDown style={{ width: "14px", height: "14px", color: "#64748b" }} />
            </button>

            {isDropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "42px",
                  zIndex: 30,
                  width: "160px",
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  padding: "6px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                {timeRanges.map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => {
                      setTimeRange(range);
                      setIsDropdownOpen(false);
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: timeRange === range ? 700 : 500,
                      color: timeRange === range ? "#2563eb" : "#334155",
                      backgroundColor: timeRange === range ? "#eff6ff" : "transparent",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {range}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ================= 3 TOP METRIC CARDS ================= */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "18px",
          }}
        >
          {/* Card 1: Average Sign Time */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              padding: "20px 24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
              display: "flex",
              alignItems: "center",
              gap: "18px",
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                backgroundColor: "#e0f2fe",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Clock style={{ width: "24px", height: "24px" }} />
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
                Average Sign Time
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: 1.2,
                  marginTop: "2px",
                }}
              >
                {metrics.signTime}
              </div>
              <div
                style={{
                  fontSize: "11.5px",
                  fontWeight: 600,
                  color: "#16a34a",
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                  marginTop: "4px",
                }}
              >
                <span>↓</span>
                <span>{metrics.signChange}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Quotation Acceptance Rate */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              padding: "20px 24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
              display: "flex",
              alignItems: "center",
              gap: "18px",
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                backgroundColor: "#dcfce7",
                color: "#16a34a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <FileCheck2 style={{ width: "24px", height: "24px" }} />
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
                Quotation Acceptance Rate
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: 1.2,
                  marginTop: "2px",
                }}
              >
                {metrics.rate}
              </div>
              <div
                style={{
                  fontSize: "11.5px",
                  fontWeight: 600,
                  color: "#16a34a",
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                  marginTop: "4px",
                }}
              >
                <span>↑</span>
                <span>{metrics.rateChange}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Total Pipeline Value */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              padding: "20px 24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
              display: "flex",
              alignItems: "center",
              gap: "18px",
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                backgroundColor: "#f3e8ff",
                color: "#9333ea",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg
                viewBox="0 0 24 24"
                style={{ width: "24px", height: "24px" }}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
                Total Pipeline Value
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#2563eb",
                  lineHeight: 1.2,
                  marginTop: "2px",
                }}
              >
                {metrics.pipeline}
              </div>
              <div
                style={{
                  fontSize: "11.5px",
                  color: "#64748b",
                  marginTop: "4px",
                }}
              >
                {metrics.quotes} Active Quotations
              </div>
            </div>
          </div>
        </div>

        {/* ================= MIDDLE CHARTS GRID ================= */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.4fr",
            gap: "20px",
            alignItems: "stretch",
          }}
        >
          {/* Left Card: Quotation Status (Donut) */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h2 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                Quotation Status
              </h2>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
                Overview of all quotations
              </p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-around",
                padding: "20px 0",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              {/* Donut Chart */}
              <div
                style={{
                  position: "relative",
                  width: "170px",
                  height: "170px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg
                  viewBox="0 0 100 100"
                  style={{
                    width: "170px",
                    height: "170px",
                    transform: "rotate(-90deg)",
                  }}
                >
                  {/* Background Base Ring */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#f1f5f9"
                    strokeWidth="15"
                  />
                  {/* Accepted (75% -> 179 / 239) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#2563EB"
                    strokeWidth="15"
                    strokeDasharray="179 239"
                    strokeDashoffset="0"
                  />
                  {/* Pending (17% -> 40 / 239) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#10B981"
                    strokeWidth="15"
                    strokeDasharray="40 239"
                    strokeDashoffset="-179"
                  />
                  {/* Declined (8% -> 20 / 239) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#F59E0B"
                    strokeWidth="15"
                    strokeDasharray="20 239"
                    strokeDashoffset="-219"
                  />
                </svg>

                {/* Center Badge */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                  }}
                >
                  <span
                    style={{
                      fontSize: "24px",
                      fontWeight: 900,
                      color: "#0f172a",
                      lineHeight: 1,
                    }}
                  >
                    24
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#94a3b8",
                      marginTop: "2px",
                    }}
                  >
                    Total
                  </span>
                </div>
              </div>

              {/* Legend matching Reference Image */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  fontSize: "12.5px",
                  minWidth: "160px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "9px", height: "9px", borderRadius: "50%", backgroundColor: "#2563EB" }} />
                    <span style={{ color: "#334155", fontWeight: 500 }}>Accepted</span>
                  </div>
                  <span style={{ color: "#64748b", fontWeight: 600 }}>18 (75%)</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "9px", height: "9px", borderRadius: "50%", backgroundColor: "#10B981" }} />
                    <span style={{ color: "#334155", fontWeight: 500 }}>Pending</span>
                  </div>
                  <span style={{ color: "#64748b", fontWeight: 600 }}>4 (17%)</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "9px", height: "9px", borderRadius: "50%", backgroundColor: "#F59E0B" }} />
                    <span style={{ color: "#334155", fontWeight: 500 }}>Declined</span>
                  </div>
                  <span style={{ color: "#64748b", fontWeight: 600 }}>2 (8%)</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "9px", height: "9px", borderRadius: "50%", backgroundColor: "#EF4444" }} />
                    <span style={{ color: "#334155", fontWeight: 500 }}>Expired</span>
                  </div>
                  <span style={{ color: "#64748b", fontWeight: 600 }}>0 (0%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Card: Sign Time Trend (Line Chart) */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h2 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                Sign Time Trend
              </h2>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
                Average time to sign quotations and MOUs
              </p>
            </div>

            <div style={{ padding: "12px 0 6px 0", position: "relative" }}>
              <svg viewBox="0 0 460 170" style={{ width: "100%", height: "180px", overflow: "visible" }}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.14" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Y-Axis Gridlines & Labels */}
                {[
                  { val: "5", y: 20 },
                  { val: "4", y: 44 },
                  { val: "3", y: 68 },
                  { val: "2", y: 92 },
                  { val: "1", y: 116 },
                  { val: "0", y: 140 },
                ].map((g) => (
                  <g key={g.val}>
                    <text
                      x="16"
                      y={g.y + 4}
                      fill="#94a3b8"
                      fontSize="10"
                      textAnchor="end"
                      fontFamily="sans-serif"
                    >
                      {g.val}
                    </text>
                    <line
                      x1="26"
                      y1={g.y}
                      x2="450"
                      y2={g.y}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                    />
                  </g>
                ))}

                {/* Gradient Shaded Area */}
                <path
                  d="M 50 40 L 125 58 L 205 82 L 285 96 L 365 102 L 440 108 L 440 140 L 50 140 Z"
                  fill="url(#trendGradient)"
                />

                {/* Trend Line */}
                <path
                  d="M 50 40 L 125 58 L 205 82 L 285 96 L 365 102 L 440 108"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points */}
                {[
                  { cx: 50, cy: 40 },
                  { cx: 125, cy: 58 },
                  { cx: 205, cy: 82 },
                  { cx: 285, cy: 96 },
                  { cx: 365, cy: 102 },
                  { cx: 440, cy: 108 },
                ].map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.cx}
                    cy={pt.cy}
                    r="4"
                    fill="#2563EB"
                    stroke="#ffffff"
                    strokeWidth="2"
                    style={{ cursor: "pointer" }}
                  />
                ))}

                {/* X-Axis Labels */}
                {[
                  { label: "May", x: 50 },
                  { label: "Jun", x: 125 },
                  { label: "Jul", x: 205 },
                  { label: "Aug", x: 285 },
                  { label: "Sep", x: 365 },
                  { label: "Oct", x: 440 },
                ].map((m) => (
                  <text
                    key={m.label}
                    x={m.x}
                    y="158"
                    fill="#94a3b8"
                    fontSize="10"
                    textAnchor="middle"
                    fontFamily="sans-serif"
                  >
                    {m.label}
                  </text>
                ))}
              </svg>
            </div>
          </div>
        </div>

        {/* ================= BOTTOM CARD: RECENT ACTIVITIES ================= */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                Recent Activities
              </h2>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
                Latest quotation and MOU activities
              </p>
            </div>

            <Link
              href="/my-documents"
              style={{
                padding: "6px 14px",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#2563eb",
                backgroundColor: "#ffffff",
                textDecoration: "none",
                transition: "all 0.15s ease",
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
                fontSize: "12.5px",
                textAlign: "left",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "1.5px solid #e2e8f0",
                    color: "#0f172a",
                    fontWeight: 700,
                    fontSize: "12px",
                  }}
                >
                  <th style={{ padding: "12px 10px", width: "32px", color: "#64748b" }}>#</th>
                  <th style={{ padding: "12px 14px" }}>Document Name</th>
                  <th style={{ padding: "12px 14px" }}>Type</th>
                  <th style={{ padding: "12px 14px" }}>Client</th>
                  <th style={{ padding: "12px 14px" }}>Status</th>
                  <th style={{ padding: "12px 14px" }}>Sign Time</th>
                  <th style={{ padding: "12px 14px" }}>Created On</th>
                  <th style={{ padding: "12px 10px", textAlign: "right" }}></th>
                </tr>
              </thead>
              <tbody>
                {ACTIVITIES.map((act) => {
                  const isMenuOpen = activeMenuId === act.id;
                  return (
                    <tr
                      key={act.id}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        transition: "background-color 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "14px 10px", color: "#94a3b8", fontWeight: 500 }}>
                        {act.id}
                      </td>
                      <td style={{ padding: "14px 14px", fontWeight: 700, color: "#0f172a" }}>
                        {act.docName}
                      </td>
                      <td style={{ padding: "14px 14px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 9px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 600,
                            backgroundColor: act.type === "Quotation" ? "#eff6ff" : "#f1f5f9",
                            color: act.type === "Quotation" ? "#2563eb" : "#475569",
                          }}
                        >
                          {act.type}
                        </span>
                      </td>
                      <td style={{ padding: "14px 14px", color: "#334155", fontWeight: 500 }}>
                        {act.client}
                      </td>
                      <td style={{ padding: "14px 14px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 9px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 700,
                            backgroundColor:
                              act.status === "Accepted"
                                ? "#dcfce7"
                                : act.status === "Pending"
                                ? "#fef3c7"
                                : "#fee2e2",
                            color:
                              act.status === "Accepted"
                                ? "#16a34a"
                                : act.status === "Pending"
                                ? "#d97706"
                                : "#dc2626",
                          }}
                        >
                          {act.status}
                        </span>
                      </td>
                      <td style={{ padding: "14px 14px", color: "#475569", fontWeight: 500 }}>
                        {act.signTime}
                      </td>
                      <td style={{ padding: "14px 14px", color: "#64748b" }}>{act.createdOn}</td>
                      <td style={{ padding: "14px 10px", textAlign: "right" }}>
                        <div style={{ position: "relative", display: "inline-block" }}>
                          <button
                            type="button"
                            onClick={() => setActiveMenuId(isMenuOpen ? null : act.id)}
                            style={{
                              padding: "4px",
                              border: "none",
                              backgroundColor: "transparent",
                              color: "#94a3b8",
                              borderRadius: "6px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#0f172a")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                          >
                            <MoreVertical style={{ width: "16px", height: "16px" }} />
                          </button>

                          {isMenuOpen && (
                            <div
                              style={{
                                position: "absolute",
                                right: 0,
                                top: "28px",
                                zIndex: 30,
                                width: "140px",
                                backgroundColor: "#ffffff",
                                border: "1px solid #e2e8f0",
                                borderRadius: "8px",
                                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                                padding: "4px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "2px",
                              }}
                            >
                              <Link
                                href="/my-documents"
                                style={{
                                  padding: "8px 10px",
                                  fontSize: "12px",
                                  color: "#334155",
                                  textDecoration: "none",
                                  borderRadius: "6px",
                                  display: "block",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.backgroundColor = "#f8fafc")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.backgroundColor = "transparent")
                                }
                              >
                                View Document
                              </Link>
                              <Link
                                href="/contacts"
                                style={{
                                  padding: "8px 10px",
                                  fontSize: "12px",
                                  color: "#334155",
                                  textDecoration: "none",
                                  borderRadius: "6px",
                                  display: "block",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.backgroundColor = "#f8fafc")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.backgroundColor = "transparent")
                                }
                              >
                                View Client
                              </Link>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </OrgLayout>
  );
}
