"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  id: string;
  docName: string;
  type: "Quotation" | "MOU";
  client: string;
  status: string;
  signTime: number | null;
  createdOn: string;
}

interface ReportsData {
  metrics: {
    averageSignDays: number | null;
    signedDocuments: number;
    acceptanceRate: number | null;
    acceptedQuotations: number;
    eligibleQuotations: number;
    pipelineByCurrency: {
      currency: string;
      currencySymbol: string;
      amount: number;
    }[];
    activeQuotations: number;
  };
  quotationStatus: {
    accepted: number;
    pending: number;
    declined: number;
    expired: number;
    total: number;
  };
  signTrend: {
    key: string;
    label: string;
    averageDays: number | null;
    documentCount: number;
  }[];
  recentActivities: RecentActivity[];
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { message?: string };
}

const STATUS_SEGMENTS = [
  { key: "accepted", label: "Accepted", color: "#2563EB" },
  { key: "pending", label: "Pending", color: "#10B981" },
  { key: "declined", label: "Declined", color: "#F59E0B" },
  { key: "expired", label: "Expired", color: "#EF4444" },
] as const;

function formatStatus(status: string, type?: RecentActivity["type"]): string {
  switch (status) {
    case "APPROVED":
      return "Accepted";
    case "SIGNED":
      return type === "MOU" ? "Signed" : "Accepted";
    case "PENDING_APPROVAL":
    case "PENDING_SIGNATURE":
      return "Pending";
    case "CHANGES_REQUESTED":
      return "Changes Requested";
    default:
      return status.charAt(0) + status.slice(1).toLowerCase();
  }
}

function formatSignTime(days: number | null): string {
  return days === null ? "-" : `${days.toFixed(1)} days`;
}

export default function OrgReportsPage() {
  const [timeRange, setTimeRange] = useState("Last 30 Days");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [reports, setReports] = useState<ReportsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const timeRanges = [
    "Last 7 Days",
    "Last 30 Days",
    "Last 90 Days",
    "This Month",
    "This Year",
  ];

  useEffect(() => {
    const controller = new AbortController();

    async function loadReports() {
      setIsLoading(true);
      setError(null);
      setReports(null);
      try {
        const response = await fetch(
          `/api/v1/reports?range=${encodeURIComponent(timeRange)}`,
          {
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
          }
        );
        const payload = (await response.json()) as ApiResponse<ReportsData>;
        if (!response.ok || payload.success !== true || !payload.data) {
          throw new Error(payload.error?.message || "Unable to load reports.");
        }
        setReports(payload.data);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setReports(null);
          setError(
            loadError instanceof Error ? loadError.message : "Unable to load reports."
          );
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadReports();
    return () => controller.abort();
  }, [timeRange, reloadKey]);

  const pipelineValue =
    reports?.metrics.pipelineByCurrency.length
      ? reports.metrics.pipelineByCurrency
          .map(({ currency, currencySymbol, amount }) => {
            const formattedAmount = new Intl.NumberFormat("en-IN", {
              maximumFractionDigits: 2,
            }).format(amount);
            return `${currencySymbol}${formattedAmount}${
              reports.metrics.pipelineByCurrency.length > 1 ? ` ${currency}` : ""
            }`;
          })
          .join(" · ")
      : reports
        ? "0"
        : "—";

  const quotationSegments = STATUS_SEGMENTS.map((segment) => ({
    ...segment,
    count: reports?.quotationStatus[segment.key] ?? 0,
  }));
  const chartCircumference = 2 * Math.PI * 38;
  const chartArcs = quotationSegments.reduce<{
    arcs: (typeof quotationSegments[number] & {
      dashArray: string;
      dashOffset: number;
      percentage: number;
    })[];
    offset: number;
  }>(
    (state, segment) => {
      const length =
        reports && reports.quotationStatus.total > 0
          ? (segment.count / reports.quotationStatus.total) * chartCircumference
          : 0;
      return {
        arcs: [
          ...state.arcs,
          {
            ...segment,
            dashArray: `${length} ${chartCircumference - length}`,
            dashOffset: -state.offset,
            percentage:
              reports && reports.quotationStatus.total > 0
                ? (segment.count / reports.quotationStatus.total) * 100
                : 0,
          },
        ],
        offset: state.offset + length,
      };
    },
    { arcs: [], offset: 0 }
  ).arcs;

  const trendGeometry = useMemo(() => {
    const values = reports?.signTrend ?? [];
    const maxDays = Math.max(1, ...values.map((month) => month.averageDays ?? 0));
    const axisMax = Math.max(1, Math.ceil(maxDays));
    const points = values.map((month, index) => {
      const x =
        values.length <= 1
          ? 238
          : 50 + (index * 390) / (values.length - 1);
      const y =
        month.averageDays === null
          ? null
          : 140 - (Math.min(month.averageDays, axisMax) / axisMax) * 120;
      return { ...month, x, y };
    });
    const segments: typeof points[] = [];
    for (const point of points) {
      if (point.y === null) continue;
      const current = segments[segments.length - 1];
      if (
        current &&
        points[points.indexOf(point) - 1]?.y !== null
      ) {
        current.push(point);
      } else {
        segments.push([point]);
      }
    }
    return { axisMax, points, segments };
  }, [reports]);

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
                      setIsLoading(true);
                      setError(null);
                      setReports(null);
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

        {error && (
          <div
            role="alert"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              padding: "10px 14px",
              border: "1px solid #fecaca",
              borderRadius: "10px",
              backgroundColor: "#fef2f2",
              color: "#b91c1c",
              fontSize: "12.5px",
            }}
          >
            <span>Unable to load reports: {error}</span>
            <button
              type="button"
              onClick={() => {
                setIsLoading(true);
                setError(null);
                setReports(null);
                setReloadKey((key) => key + 1);
              }}
              style={{
                border: "none",
                background: "transparent",
                color: "#b91c1c",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        )}

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
                {isLoading
                  ? "Loading..."
                  : reports?.metrics.averageSignDays === null ||
                      reports?.metrics.averageSignDays === undefined
                    ? "—"
                    : `${reports.metrics.averageSignDays.toFixed(1)} Days`}
              </div>
              <div
                style={{
                  fontSize: "11.5px",
                  fontWeight: 600,
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                  marginTop: "4px",
                }}
              >
                {isLoading
                  ? "Loading signing data"
                  : error
                    ? "Report data unavailable"
                    : reports?.metrics.signedDocuments
                      ? `Based on ${reports.metrics.signedDocuments} signed documents`
                      : "No signed documents in this period"}
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
                {isLoading
                  ? "Loading..."
                  : reports?.metrics.acceptanceRate === null ||
                      reports?.metrics.acceptanceRate === undefined
                    ? "—"
                    : `${reports.metrics.acceptanceRate.toFixed(1)}%`}
              </div>
              <div
                style={{
                  fontSize: "11.5px",
                  fontWeight: 600,
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                  marginTop: "4px",
                }}
              >
                {isLoading
                  ? "Loading quotation data"
                  : error
                    ? "Report data unavailable"
                    : `${reports?.metrics.acceptedQuotations ?? 0} accepted of ${
                        reports?.metrics.eligibleQuotations ?? 0
                      } eligible quotations`}
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
                {isLoading ? "Loading..." : pipelineValue}
              </div>
              <div
                style={{
                  fontSize: "11.5px",
                  color: "#64748b",
                  marginTop: "4px",
                }}
              >
                {isLoading
                  ? "Loading active quotations"
                  : error
                    ? "Report data unavailable"
                    : `${reports?.metrics.activeQuotations ?? 0} Active Quotations`}
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
                  {chartArcs.map((arc) => (
                    <circle
                      key={arc.key}
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke={arc.color}
                      strokeWidth="15"
                      strokeDasharray={arc.dashArray}
                      strokeDashoffset={arc.dashOffset}
                    />
                  ))}
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
                    {isLoading
                      ? "..."
                      : error
                        ? "—"
                        : reports?.quotationStatus.total ?? 0}
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

              {/* Chart legend */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  fontSize: "12.5px",
                  minWidth: "160px",
                }}
              >
                {chartArcs.map((arc) => (
                  <div
                    key={arc.key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          width: "9px",
                          height: "9px",
                          borderRadius: "50%",
                          backgroundColor: arc.color,
                        }}
                      />
                      <span style={{ color: "#334155", fontWeight: 500 }}>{arc.label}</span>
                    </div>
                    <span style={{ color: "#64748b", fontWeight: 600 }}>
                      {isLoading || error
                        ? "—"
                        : `${arc.count} (${arc.percentage.toFixed(0)}%)`}
                    </span>
                  </div>
                ))}
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

                {Array.from({ length: 6 }, (_, index) => {
                  const value = (trendGeometry.axisMax * (5 - index)) / 5;
                  const y = 20 + index * 24;
                  return (
                    <g key={index}>
                      <text
                        x="16"
                        y={y + 4}
                        fill="#94a3b8"
                        fontSize="10"
                        textAnchor="end"
                        fontFamily="sans-serif"
                      >
                        {value.toFixed(value % 1 === 0 ? 0 : 1)}
                      </text>
                      <line
                        x1="26"
                        y1={y}
                        x2="450"
                        y2={y}
                        stroke="#f1f5f9"
                        strokeWidth="1"
                      />
                    </g>
                  );
                })}

                {trendGeometry.segments.map((segment, index) => {
                  const linePath = segment
                    .map((point, pointIndex) =>
                      `${pointIndex === 0 ? "M" : "L"} ${point.x} ${point.y}`
                    )
                    .join(" ");
                  const first = segment[0];
                  const last = segment[segment.length - 1];
                  const areaPath = `${linePath} L ${last.x} 140 L ${first.x} 140 Z`;
                  return (
                    <g key={index}>
                      <path d={areaPath} fill="url(#trendGradient)" />
                      <path
                        d={linePath}
                        fill="none"
                        stroke="#2563EB"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                  );
                })}

                {trendGeometry.points
                  .filter((point) => point.y !== null)
                  .map((point) => (
                  <circle
                    key={point.key}
                    cx={point.x}
                    cy={point.y as number}
                    r="4"
                    fill="#2563EB"
                    stroke="#ffffff"
                    strokeWidth="2"
                    style={{ cursor: "pointer" }}
                  >
                    <title>{`${point.label}: ${point.averageDays?.toFixed(1)} days, ${point.documentCount} signed`}</title>
                  </circle>
                ))}

                {trendGeometry.points.map((month) => (
                  <text
                    key={month.key}
                    x={month.x}
                    y="158"
                    fill="#94a3b8"
                    fontSize="10"
                    textAnchor="middle"
                    fontFamily="sans-serif"
                  >
                    {month.label}
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
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        padding: "24px 14px",
                        color: "#64748b",
                        textAlign: "center",
                      }}
                    >
                      Loading recent activities...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        padding: "24px 14px",
                        color: "#64748b",
                        textAlign: "center",
                      }}
                    >
                      Recent activities are unavailable.
                    </td>
                  </tr>
                ) : reports?.recentActivities.length ? (
                  reports.recentActivities.map((act, index) => {
                  const isMenuOpen = activeMenuId === act.id;
                  const displayStatus = formatStatus(act.status, act.type);
                  const isAccepted =
                    displayStatus === "Accepted" || displayStatus === "Signed";
                  const isDeclined =
                    displayStatus === "Declined" || displayStatus === "Expired";
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
                        {index + 1}
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
                            backgroundColor: isAccepted
                              ? "#dcfce7"
                              : isDeclined
                                ? "#fee2e2"
                                : "#fef3c7",
                            color: isAccepted
                              ? "#16a34a"
                              : isDeclined
                                ? "#dc2626"
                                : "#d97706",
                          }}
                        >
                          {displayStatus}
                        </span>
                      </td>
                      <td style={{ padding: "14px 14px", color: "#475569", fontWeight: 500 }}>
                        {formatSignTime(act.signTime)}
                      </td>
                      <td style={{ padding: "14px 14px", color: "#64748b" }}>
                        {new Intl.DateTimeFormat("en", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          timeZone: "UTC",
                        }).format(new Date(act.createdOn))}
                      </td>
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
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        padding: "24px 14px",
                        color: "#64748b",
                        textAlign: "center",
                      }}
                    >
                      No quotation or MOU activities found for this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </OrgLayout>
  );
}
