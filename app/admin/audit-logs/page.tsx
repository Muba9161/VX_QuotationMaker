"use client";
import React, { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Calendar, ChevronDown } from "lucide-react";

interface AuditLogItem {
  id: string;
  user: string;
  action: string;
  details: string;
  dateTime: string;
}

const AUDIT_LOGS_DATA: AuditLogItem[] = [
  {
    id: "log-1",
    user: "Rahul Sharma",
    action: "Created Organization",
    details: "VorldXnologies",
    dateTime: "28 Oct 2026 10:30",
  },
  {
    id: "log-2",
    user: "Priya Singh",
    action: "Updated Plan",
    details: "NextGen Digital",
    dateTime: "27 Oct 2026 16:20",
  },
  {
    id: "log-3",
    user: "Amit Verma",
    action: "Suspended Organization",
    details: "Innovate India",
    dateTime: "27 Oct 2026 11:45",
  },
  {
    id: "log-4",
    user: "Rahul Sharma",
    action: "Deleted Key",
    details: "Soft Solutions",
    dateTime: "26 Oct 2026 14:10",
  },
  {
    id: "log-5",
    user: "Priya Singh",
    action: "Login Success",
    details: "Web",
    dateTime: "26 Oct 2026 09:30",
  },
];

export default function AdminAuditLogsPage() {
  const [actionFilter, setActionFilter] = useState("All Actions");

  const filteredLogs = AUDIT_LOGS_DATA.filter((log) => {
    if (actionFilter === "All Actions") return true;
    return log.action === actionFilter;
  });

  return (
    <AdminLayout activePath="/admin/audit-logs">
      <div
        style={{
          width: "100%",
          maxWidth: "1400px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          boxSizing: "border-box",
        }}
      >
        {/* ================= PAGE HEADER ================= */}
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
                fontSize: "24px",
                fontWeight: "900",
                color: "#0f172a",
                letterSpacing: "-0.5px",
                margin: 0,
              }}
            >
              Audit Logs
            </h1>
            <p
              style={{
                fontSize: "13px",
                color: "#64748b",
                margin: "4px 0 0 0",
              }}
            >
              Track important platform activities
            </p>
          </div>

          {/* Right Controls: Filter & Date Range */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Actions Filter Dropdown */}
            <div style={{ position: "relative" }}>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                style={{
                  height: "38px",
                  padding: "0 32px 0 14px",
                  backgroundColor: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "10px",
                  fontSize: "12.5px",
                  fontWeight: "600",
                  color: "#334155",
                  outline: "none",
                  cursor: "pointer",
                  appearance: "none",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                  boxSizing: "border-box",
                }}
              >
                <option value="All Actions">All Actions</option>
                <option value="Created Organization">Created Organization</option>
                <option value="Updated Plan">Updated Plan</option>
                <option value="Suspended Organization">Suspended Organization</option>
                <option value="Deleted Key">Deleted Key</option>
                <option value="Login Success">Login Success</option>
              </select>
              <ChevronDown
                style={{
                  width: "14px",
                  height: "14px",
                  color: "#94a3b8",
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              />
            </div>

            {/* Date Range Picker Pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                height: "38px",
                padding: "0 14px",
                backgroundColor: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                fontSize: "12.5px",
                fontWeight: "600",
                color: "#334155",
                boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                userSelect: "none",
                cursor: "pointer",
                boxSizing: "border-box",
              }}
            >
              <Calendar
                style={{ width: "15px", height: "15px", color: "#64748b" }}
              />
              <span>01 Oct 2026 - 31 Oct 2026</span>
            </div>
          </div>
        </div>

        {/* ================= AUDIT LOGS TABLE CARD ================= */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#f8fafc",
                    borderBottom: "1px solid #e2e8f0",
                    color: "#64748b",
                    fontSize: "11px",
                    fontWeight: "800",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  <th style={{ padding: "14px 24px", width: "50px" }}>#</th>
                  <th style={{ padding: "14px 24px" }}>User</th>
                  <th style={{ padding: "14px 24px" }}>Action</th>
                  <th style={{ padding: "14px 24px" }}>Details</th>
                  <th style={{ padding: "14px 24px" }}>Date &amp; Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, index) => (
                  <tr
                    key={log.id}
                    style={{
                      borderBottom:
                        index !== filteredLogs.length - 1
                          ? "1px solid #f1f5f9"
                          : "none",
                      transition: "background 0.15s ease",
                    }}
                  >
                    {/* Index */}
                    <td
                      style={{
                        padding: "16px 24px",
                        color: "#94a3b8",
                        fontWeight: "600",
                      }}
                    >
                      {index + 1}
                    </td>

                    {/* User */}
                    <td
                      style={{
                        padding: "16px 24px",
                        fontWeight: "800",
                        color: "#0f172a",
                      }}
                    >
                      {log.user}
                    </td>

                    {/* Action */}
                    <td
                      style={{
                        padding: "16px 24px",
                        fontWeight: "600",
                        color: "#334155",
                      }}
                    >
                      {log.action}
                    </td>

                    {/* Details */}
                    <td
                      style={{
                        padding: "16px 24px",
                        color: "#475569",
                        fontWeight: "500",
                      }}
                    >
                      {log.details}
                    </td>

                    {/* Date & Time */}
                    <td
                      style={{
                        padding: "16px 24px",
                        color: "#64748b",
                        fontWeight: "500",
                      }}
                    >
                      {log.dateTime}
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
