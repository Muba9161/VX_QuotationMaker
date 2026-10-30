"use client";

import React, { useState } from "react";
import { X, Loader2, UserPlus, AlertCircle } from "lucide-react";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string, emailDelivery?: { delivered: boolean; error?: string }) => void;
}

export default function AddMemberModal({
  isOpen,
  onClose,
  onSuccess,
}: AddMemberModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"Org Admin" | "Editor" | "Viewer">("Editor");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      setError("Please provide the member's full name.");
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setError("Please provide a valid email address.");
      return;
    }

    const backendRole =
      role === "Org Admin" ? "ORG_ADMIN" : role === "Viewer" ? "VIEWER" : "EDITOR";

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/v1/organization/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: trimmedEmail, role: backendRole }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const errorMsg =
          data?.error?.message ||
          "Failed to invite member. Please verify authorization and try again.";
        setError(errorMsg);
        setIsSubmitting(false);
        return;
      }

      setName("");
      setEmail("");
      setRole("Editor");
      setError(null);
      setIsSubmitting(false);
      onSuccess(trimmedEmail, data?.data?.emailDelivery);
      onClose();
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
          maxWidth: "460px",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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
              Add Team Member
            </h3>
            <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0 0 0" }}>
              Invite a member to your organization workspace
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

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
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

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
              Full Name <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Sarah Jenkins"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                outline: "none",
                boxSizing: "border-box",
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
              Email Address <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="email"
              placeholder="sarah@acme.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                outline: "none",
                boxSizing: "border-box",
              }}
              required
            />
            <p style={{ fontSize: "11px", color: "#64748b", margin: "4px 0 0 0" }}>
              The user can redeem via the invite link or sign in directly with Google.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
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
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  backgroundColor: "#ffffff",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              >
                <option value="Org Admin">Org Admin</option>
                <option value="Editor">Editor</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                Status
              </label>
              <input
                type="text"
                value="Invited (Pending)"
                disabled
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#f8fafc",
                  color: "#64748b",
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div
            style={{
              paddingTop: "16px",
              borderTop: "1px solid #f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "10px",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: "9px 18px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#f1f5f9",
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
                padding: "9px 20px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#2563eb",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 700,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 2px 6px rgba(37,99,235,0.25)",
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 style={{ width: "14px", height: "14px" }} />
                  <span>Inviting...</span>
                </>
              ) : (
                <>
                  <UserPlus style={{ width: "14px", height: "14px" }} />
                  <span>Send Invitation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
