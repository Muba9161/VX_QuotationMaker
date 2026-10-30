"use client";

import React, { useState } from "react";
import { X, AlertTriangle } from "lucide-react";

interface PublicDeclineModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  docNumber: string;
  onDeclinedSuccessfully: () => void;
}

export default function PublicDeclineModal({
  isOpen,
  onClose,
  token,
  docNumber,
  onDeclinedSuccessfully,
}: PublicDeclineModalProps) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDecline = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/v1/public/shares/${token}/decline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to decline document.");
      } else {
        onDeclinedSuccessfully();
        onClose();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "16px",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "460px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#dc2626" }}>
            <AlertTriangle style={{ width: "20px", height: "20px" }} />
            <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0, color: "#0f172a" }}>
              Decline Document {docNumber}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
          >
            <X style={{ width: "20px", height: "20px" }} />
          </button>
        </div>

        <form onSubmit={handleDecline} style={{ padding: "20px" }}>
          {error && (
            <div
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#dc2626",
                fontSize: "13px",
                marginBottom: "14px",
              }}
            >
              {error}
            </div>
          )}

          <p style={{ fontSize: "13.5px", color: "#475569", margin: "0 0 14px 0", lineHeight: 1.5 }}>
            Are you sure you want to decline this document? The sender will be notified of your decision.
          </p>

          <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
            Reason for declining (optional):
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Scope needs adjustment or terms require discussion..."
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "13px",
              outline: "none",
              marginBottom: "18px",
              resize: "vertical",
            }}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                padding: "8px 16px",
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
              disabled={submitting}
              style={{
                padding: "8px 18px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#dc2626",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {submitting ? "Declining..." : "Decline Document"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

