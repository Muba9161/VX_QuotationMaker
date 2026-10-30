"use client";

import React, { useState } from "react";
import {
  MoreVertical,
  Mail,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export interface TeamMemberItem {
  id: string;
  name: string;
  email: string;
  role: "Org Admin" | "Editor" | "Viewer";
  status: "Active" | "Invited";
  inviteToken?: string;
}

interface TeamTableProps {
  members: TeamMemberItem[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onResendInvite: (id: string, email: string) => void;
  onCopyInviteLink: (token: string) => void;
  onRequestDelete: (member: TeamMemberItem) => void;
}

export default function TeamTable({
  members,
  currentPage,
  totalPages,
  onPageChange,
  onResendInvite,
  onCopyInviteLink,
  onRequestDelete,
}: TeamTableProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case "Org Admin":
        return { backgroundColor: "#eff6ff", color: "#2563eb" };
      case "Viewer":
        return { backgroundColor: "#fff1f2", color: "#e11d48" };
      default:
        return { backgroundColor: "#f5f3ff", color: "#7c3aed" };
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "Active":
        return { backgroundColor: "#ecfdf5", color: "#059669" };
      case "Invited":
        return { backgroundColor: "#fffbeb", color: "#d97706" };
      default:
        return { backgroundColor: "#f1f5f9", color: "#475569" };
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
      }}
    >
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <th style={{ padding: "12px 18px", width: "48px", textAlign: "center", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>#</th>
              <th style={{ padding: "12px 18px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Name</th>
              <th style={{ padding: "12px 18px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Email</th>
              <th style={{ padding: "12px 18px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Role</th>
              <th style={{ padding: "12px 18px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Status</th>
              <th style={{ padding: "12px 18px", textAlign: "right", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "48px 18px", textAlign: "center", color: "#94a3b8" }}>
                  No team members found matching your search.
                </td>
              </tr>
            ) : (
              members.map((member, index) => {
                const isMenuOpen = activeMenuId === member.id;
                const roleStyle = getRoleBadgeStyle(member.role);
                const statusStyle = getStatusBadgeStyle(member.status);

                return (
                  <tr
                    key={member.id}
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                  >
                    <td style={{ padding: "14px 18px", textAlign: "center", fontWeight: 500, color: "#94a3b8" }}>
                      {(currentPage - 1) * 5 + index + 1}
                    </td>

                    {/* Member Name + Avatar */}
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            backgroundColor: "#eff6ff",
                            color: "#2563eb",
                            fontWeight: 800,
                            fontSize: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {getInitials(member.name)}
                        </div>
                        <span style={{ fontWeight: 700, color: "#0f172a" }}>
                          {member.name}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td style={{ padding: "14px 18px", color: "#475569" }}>
                      {member.email}
                    </td>

                    {/* Role Badge */}
                    <td style={{ padding: "14px 18px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 10px",
                          borderRadius: "9999px",
                          fontSize: "11px",
                          fontWeight: 700,
                          ...roleStyle,
                        }}
                      >
                        {member.role}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: "14px 18px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 10px",
                          borderRadius: "9999px",
                          fontSize: "11px",
                          fontWeight: 700,
                          ...statusStyle,
                        }}
                      >
                        {member.status}
                      </span>
                    </td>

                    {/* Actions Menu */}
                    <td style={{ padding: "14px 18px", textAlign: "right", position: "relative" }}>
                      <div style={{ display: "inline-block", position: "relative" }}>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMenuId(isMenuOpen ? null : member.id)
                          }
                          style={{
                            padding: "6px 8px",
                            borderRadius: "8px",
                            border: "none",
                            backgroundColor: isMenuOpen ? "#f1f5f9" : "transparent",
                            color: "#64748b",
                            cursor: "pointer",
                          }}
                        >
                          <MoreVertical style={{ width: "16px", height: "16px" }} />
                        </button>

                        {isMenuOpen && (
                          <div
                            style={{
                              position: "absolute",
                              right: 0,
                              top: "100%",
                              marginTop: "4px",
                              width: "170px",
                              backgroundColor: "#ffffff",
                              borderRadius: "12px",
                              border: "1px solid #e2e8f0",
                              boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
                              zIndex: 40,
                              padding: "4px",
                              textAlign: "left",
                            }}
                            onClick={() => setActiveMenuId(null)}
                          >
                            {member.status === "Invited" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    onResendInvite(member.id, member.email)
                                  }
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    width: "100%",
                                    padding: "8px 10px",
                                    borderRadius: "8px",
                                    border: "none",
                                    backgroundColor: "transparent",
                                    color: "#334155",
                                    fontSize: "12px",
                                    fontWeight: 500,
                                    cursor: "pointer",
                                  }}
                                >
                                  <Mail style={{ width: "14px", height: "14px", color: "#64748b" }} />
                                  <span>Resend Invite</span>
                                </button>
                                {member.inviteToken && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onCopyInviteLink(member.inviteToken!)
                                    }
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                      width: "100%",
                                      padding: "8px 10px",
                                      borderRadius: "8px",
                                      border: "none",
                                      backgroundColor: "transparent",
                                      color: "#334155",
                                      fontSize: "12px",
                                      fontWeight: 500,
                                      cursor: "pointer",
                                    }}
                                  >
                                    <Copy style={{ width: "14px", height: "14px", color: "#64748b" }} />
                                    <span>Copy Invite Link</span>
                                  </button>
                                )}
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => onRequestDelete(member)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                width: "100%",
                                padding: "8px 10px",
                                borderRadius: "8px",
                                border: "none",
                                backgroundColor: "transparent",
                                color: "#dc2626",
                                fontSize: "12px",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              <Trash2 style={{ width: "14px", height: "14px", color: "#dc2626" }} />
                              <span>Remove Member</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div
        style={{
          padding: "12px 18px",
          borderTop: "1px solid #e2e8f0",
          backgroundColor: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "12px",
          color: "#64748b",
        }}
      >
        <div>
          Showing {members.length > 0 ? (currentPage - 1) * 5 + 1 : 0} to{" "}
          {Math.min(currentPage * 5, (currentPage - 1) * 5 + members.length)}{" "}
          members
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            style={{
              padding: "6px 8px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              cursor: currentPage <= 1 ? "not-allowed" : "pointer",
              opacity: currentPage <= 1 ? 0.4 : 1,
            }}
          >
            <ChevronLeft style={{ width: "14px", height: "14px" }} />
          </button>
          <span style={{ padding: "0 8px", fontWeight: 600, color: "#1e293b" }}>
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            style={{
              padding: "6px 8px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
              opacity: currentPage >= totalPages ? 0.4 : 1,
            }}
          >
            <ChevronRight style={{ width: "14px", height: "14px" }} />
          </button>
        </div>
      </div>
    </div>
  );
}
