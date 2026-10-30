"use client";

import React, { useState } from "react";
import {
  X,
  Loader2,
  Mail,
  Copy,
  Check,
  AlertCircle,
  Save,
  Lock,
} from "lucide-react";
import type { TeamMemberItem } from "./TeamTable";

interface EditMemberModalProps {
  isOpen: boolean;
  member: TeamMemberItem | null;
  onClose: () => void;
  onSuccess: (updatedName?: string) => void;
  onResendInvite?: (id: string, email: string) => void;
  onCopyInviteLink?: (token: string) => void;
}

export default function EditMemberModal({
  isOpen,
  member,
  onClose,
  onSuccess,
  onResendInvite,
  onCopyInviteLink,
}: EditMemberModalProps) {
  const [name, setName] = useState(member?.name || "");
  const [role, setRole] = useState<"Org Admin" | "Editor" | "Viewer">(member?.role || "Editor");
  const [status, setStatus] = useState<"Active" | "Inactive" | "Suspended" | "Invited">(
    member?.status || "Active"
  );
  const [title, setTitle] = useState(member?.title || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !member) return null;

  const isInvited = member.status === "Invited";

  const getInitials = (val: string) =>
    val
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  const handleCopy = () => {
    if (member.inviteToken) {
      if (onCopyInviteLink) {
        onCopyInviteLink(member.inviteToken);
      } else {
        const url = `${window.location.origin}/invite?token=${member.inviteToken}`;
        navigator.clipboard?.writeText(url);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isInvited) {
        // Update pending invitation role
        const backendRole =
          role === "Org Admin" ? "ORG_ADMIN" : role === "Viewer" ? "VIEWER" : "EDITOR";

        const res = await fetch(`/api/v1/organization/team/invite/${member.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ role: backendRole }),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          setError(data?.error?.message || "Failed to update invitation role.");
          setIsSubmitting(false);
          return;
        }

        setIsSubmitting(false);
        onSuccess(name);
        onClose();
      } else {
        // Update active / existing member
        const backendRole =
          role === "Org Admin" ? "ORG_ADMIN" : role === "Viewer" ? "VIEWER" : "EDITOR";
        const backendStatus =
          status === "Inactive" ? "INACTIVE" : status === "Suspended" ? "SUSPENDED" : "ACTIVE";

        const res = await fetch(`/api/v1/organization/team/${member.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: name.trim(),
            role: backendRole,
            status: backendStatus,
            title: title.trim() || null,
          }),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          setError(data?.error?.message || "Failed to update team member.");
          setIsSubmitting(false);
          return;
        }

        setIsSubmitting(false);
        onSuccess(name.trim());
        onClose();
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Network error. Please try again.";
      setError(errorMsg);
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15,23,42,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "480px",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Edit Member Details
            </h3>
            <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0 0 0" }}>
              {isInvited
                ? "Update pending invitation role and invite actions"
                : "Manage permissions, title, and access status"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <X style={{ width: "18px", height: "18px" }} />
          </button>
        </div>

        {/* Member Profile Summary Strip */}
        <div
          style={{
            padding: "16px 24px",
            backgroundColor: "#f8fafc",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              backgroundColor: "#eff6ff",
              color: "#2563eb",
              fontWeight: 800,
              fontSize: "15px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {getInitials(member.name || member.email)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
              {member.name || member.email.split("@")[0]}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                marginTop: "2px",
              }}
            >
              <Lock style={{ width: "11px", height: "11px", color: "#94a3b8" }} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {member.email}
              </span>
            </div>
          </div>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: "9999px",
              backgroundColor: isInvited ? "#fffbeb" : status === "Active" ? "#ecfdf5" : "#fef2f2",
              color: isInvited ? "#d97706" : status === "Active" ? "#059669" : "#dc2626",
            }}
          >
            {member.status}
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {error && (
            <div
              style={{
                padding: "12px 14px",
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "10px",
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                fontSize: "12px",
                color: "#dc2626",
              }}
            >
              <AlertCircle style={{ width: "16px", height: "16px", flexShrink: 0, marginTop: "2px" }} />
              <span>{error}</span>
            </div>
          )}

          {/* Full Name (for active users) */}
          {!isInvited ? (
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                Full Name <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                required
              />
            </div>
          ) : (
            <div
              style={{
                padding: "10px 14px",
                backgroundColor: "#fffbeb",
                border: "1px solid #fde68a",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#92400e",
                lineHeight: 1.5,
              }}
            >
              <strong>Pending Invitation:</strong> The recipient will set or confirm their display name when accepting the invitation via email or Google sign-in.
            </div>
          )}

          {/* Optional Title (for active members) */}
          {!isInvited && (
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                Job Title / Position <span style={{ color: "#94a3b8", fontWeight: 400 }}>(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Account Executive, Sales Lead"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          )}

          {/* Role & Status Row */}
          <div style={{ display: "grid", gridTemplateColumns: isInvited ? "1fr" : "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "Org Admin" | "Editor" | "Viewer")}
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  backgroundColor: "#ffffff",
                  outline: "none",
                  boxSizing: "border-box",
                  cursor: "pointer",
                }}
              >
                <option value="Org Admin">Org Admin (Full Access)</option>
                <option value="Editor">Editor (Create & Edit)</option>
                <option value="Viewer">Viewer (Read-Only)</option>
              </select>
              <p style={{ fontSize: "11px", color: "#64748b", margin: "4px 0 0 0" }}>
                {role === "Org Admin" && "Can manage team, billing, branding & all documents."}
                {role === "Editor" && "Can draft, edit, and send quotations & MOUs."}
                {role === "Viewer" && "Can view quotations, MOUs, and audit logs."}
              </p>
            </div>

            {!isInvited && (
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as "Active" | "Inactive" | "Suspended")
                  }
                  disabled={isSubmitting}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    backgroundColor: "#ffffff",
                    outline: "none",
                    boxSizing: "border-box",
                    cursor: "pointer",
                  }}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </select>
                <p style={{ fontSize: "11px", color: "#64748b", margin: "4px 0 0 0" }}>
                  {status === "Active" ? "Account has normal access." : "Access is temporarily disabled."}
                </p>
              </div>
            )}
          </div>

          {/* Quick Invitation Actions for Invited Members */}
          {isInvited && (
            <div
              style={{
                padding: "14px",
                backgroundColor: "#f8fafc",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Invitation Actions
              </span>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {member.inviteToken && (
                  <button
                    type="button"
                    onClick={handleCopy}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      backgroundColor: copiedLink ? "#ecfdf5" : "#ffffff",
                      color: copiedLink ? "#059669" : "#334155",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {copiedLink ? (
                      <Check style={{ width: "13px", height: "13px" }} />
                    ) : (
                      <Copy style={{ width: "13px", height: "13px" }} />
                    )}
                    <span>{copiedLink ? "Link Copied!" : "Copy Direct Link"}</span>
                  </button>
                )}

                {onResendInvite && (
                  <button
                    type="button"
                    onClick={() => onResendInvite(member.id, member.email)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      backgroundColor: "#ffffff",
                      color: "#334155",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <Mail style={{ width: "13px", height: "13px", color: "#2563eb" }} />
                    <span>Resend Email</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "8px",
              paddingTop: "16px",
              borderTop: "1px solid #f1f5f9",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: "9px 16px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                backgroundColor: "#ffffff",
                color: "#475569",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: "9px 18px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#2563eb",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 700,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.7 : 1,
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 2px 4px rgba(37,99,235,0.2)",
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 style={{ width: "14px", height: "14px" }} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save style={{ width: "14px", height: "14px" }} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
