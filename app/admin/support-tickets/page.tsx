"use client";

import React, { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Search, ChevronDown } from "lucide-react";

interface TicketItem {
  id: number;
  subject: string;
  organization: string;
  status: "Open" | "In Progress" | "Resolved";
  statusColor: "rose" | "blue" | "green";
  priority: "High" | "Medium" | "Low";
  priorityColor: "rose" | "amber" | "green";
}

const INITIAL_TICKETS: TicketItem[] = [
  {
    id: 1,
    subject: "Unable to generate PDF",
    organization: "VorldXnologies",
    status: "Open",
    statusColor: "rose",
    priority: "High",
    priorityColor: "rose",
  },
  {
    id: 2,
    subject: "Letterhead not showing",
    organization: "NextGen Digital",
    status: "In Progress",
    statusColor: "blue",
    priority: "Medium",
    priorityColor: "amber",
  },
  {
    id: 3,
    subject: "Need plan upgrade",
    organization: "Global Systems",
    status: "Open",
    statusColor: "blue", // exactly as seen in reference image
    priority: "High",
    priorityColor: "rose",
  },
  {
    id: 4,
    subject: "Login issue",
    organization: "Tech Solutions",
    status: "Resolved",
    statusColor: "green",
    priority: "Low",
    priorityColor: "green",
  },
  {
    id: 5,
    subject: "Signature not saving",
    organization: "Bright Future",
    status: "Open",
    statusColor: "rose",
    priority: "Medium",
    priorityColor: "amber",
  },
];

export default function AdminSupportTicketsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const filteredTickets = INITIAL_TICKETS.filter((t) => {
    const matchesSearch =
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.organization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All Status" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getPillStyle = (colorType: "rose" | "blue" | "green" | "amber") => {
    switch (colorType) {
      case "rose":
        return {
          backgroundColor: "#fee2e2",
          color: "#ef4444",
        };
      case "blue":
        return {
          backgroundColor: "#dbeafe",
          color: "#2563eb",
        };
      case "green":
        return {
          backgroundColor: "#dcfce7",
          color: "#16a34a",
        };
      case "amber":
        return {
          backgroundColor: "#fef3c7",
          color: "#d97706",
        };
    }
  };

  return (
    <AdminLayout activePath="/admin/support-tickets">
      <div
        style={{
          width: "100%",
          maxWidth: "1080px",
          margin: "0 auto",
          padding: "24px 20px 48px 20px",
          boxSizing: "border-box",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        }}
      >
        {/* Outer White Card matching exact reference design */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            border: "1px solid #eef2f6",
            boxShadow: "0 4px 24px -2px rgba(15, 23, 42, 0.05)",
            padding: "28px 32px 36px 32px",
            boxSizing: "border-box",
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: "24px" }}>
            <h1
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "#0f172a",
                margin: 0,
                letterSpacing: "-0.3px",
              }}
            >
              Support Tickets
            </h1>
            <p
              style={{
                fontSize: "13px",
                fontWeight: 400,
                color: "#64748b",
                margin: "4px 0 0 0",
              }}
            >
              Manage user support requests
            </p>
          </div>

          {/* Filter Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              marginBottom: "24px",
              flexWrap: "wrap",
            }}
          >
            {/* Search Input Box */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "8px 14px",
                width: "300px",
                maxWidth: "100%",
                boxSizing: "border-box",
                boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
              }}
            >
              <Search
                style={{
                  width: "15px",
                  height: "15px",
                  color: "#94a3b8",
                  flexShrink: 0,
                }}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by subject..."
                style={{
                  border: "none",
                  outline: "none",
                  backgroundColor: "transparent",
                  fontSize: "13px",
                  color: "#1e293b",
                  width: "100%",
                }}
              />
            </div>

            {/* Status Select Dropdown */}
            <div
              style={{
                position: "relative",
                display: "inline-block",
              }}
            >
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  appearance: "none",
                  WebkitAppearance: "none",
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "8px 36px 8px 14px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#334155",
                  cursor: "pointer",
                  outline: "none",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                }}
              >
                <option value="All Status">All Status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
              <ChevronDown
                style={{
                  width: "14px",
                  height: "14px",
                  color: "#64748b",
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              />
            </div>
          </div>

          {/* Table */}
          <div
            style={{
              width: "100%",
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <th
                    style={{
                      padding: "12px 14px",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#64748b",
                      width: "48px",
                    }}
                  >
                    #
                  </th>
                  <th
                    style={{
                      padding: "12px 14px",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#64748b",
                    }}
                  >
                    Subject
                  </th>
                  <th
                    style={{
                      padding: "12px 14px",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#64748b",
                    }}
                  >
                    Organization
                  </th>
                  <th
                    style={{
                      padding: "12px 14px",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#0d9488", // Distinctive teal/green header matching screenshot
                    }}
                  >
                    Status
                  </th>
                  <th
                    style={{
                      padding: "12px 14px",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#64748b",
                    }}
                  >
                    Priority
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    style={{
                      borderBottom: "1px solid #f8fafc",
                      transition: "background-color 0.15s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#fafafa")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    {/* Index */}
                    <td
                      style={{
                        padding: "15px 14px",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "#64748b",
                      }}
                    >
                      {ticket.id}
                    </td>

                    {/* Subject */}
                    <td
                      style={{
                        padding: "15px 14px",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "#0f172a",
                      }}
                    >
                      {ticket.subject}
                    </td>

                    {/* Organization */}
                    <td
                      style={{
                        padding: "15px 14px",
                        fontSize: "13px",
                        fontWeight: 400,
                        color: "#64748b",
                      }}
                    >
                      {ticket.organization}
                    </td>

                    {/* Status Badge */}
                    <td
                      style={{
                        padding: "15px 14px",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "4px 14px",
                          borderRadius: "9999px",
                          fontSize: "11px",
                          fontWeight: 600,
                          letterSpacing: "0.1px",
                          ...getPillStyle(ticket.statusColor),
                        }}
                      >
                        {ticket.status}
                      </span>
                    </td>

                    {/* Priority Badge */}
                    <td
                      style={{
                        padding: "15px 14px",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "4px 14px",
                          borderRadius: "9999px",
                          fontSize: "11px",
                          fontWeight: 600,
                          letterSpacing: "0.1px",
                          ...getPillStyle(ticket.priorityColor),
                        }}
                      >
                        {ticket.priority}
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
