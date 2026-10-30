"use client";

import React, { useState, useEffect } from "react";
import { X, RefreshCw, Slash, Check, Clock, ShieldAlert, History } from "lucide-react";

interface ShareItem {
  id: string;
  recipientName: string;
  recipientEmail: string;
  recipientRole: string;
  signingOrder: number;
  requireOtp: boolean;
  status: string;
  expiresAt: string;
  viewedAt?: string | null;
  revokedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  customMessage?: string | null;
  signatures?: Array<{
    id: string;
    signerName: string;
    signerEmail: string;
    createdAt: string;
  }>;
}

interface ShareHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  docNumber: string;
}

export default function ShareHistoryModal({
  isOpen,
  onClose,
  documentId,
  docNumber,
}: ShareHistoryModalProps) {
  const [shares, setShares] = useState<ShareItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchShares = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/documents/${documentId}/shares`);
      const data = await res.json();
      if (res.ok) {
        setShares(data.data?.shares || []);
      }
    } catch {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchShares();
      setMessage(null);
    }
  }, [isOpen, documentId]);

  const handleRevoke = async (shareId: string) => {
    setActionLoadingId(shareId);
    try {
      const res = await fetch(`/api/v1/shares/${shareId}/revoke`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setMessage("Share link has been revoked.");
        fetchShares();
      } else {
        setMessage(data.message || "Failed to revoke link.");
      }
    } catch {
      setMessage("Error revoking share link.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleResend = async (shareId: string) => {
    setActionLoadingId(shareId);
    try {
      const res = await fetch(`/api/v1/shares/${shareId}/resend`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setMessage("Invitation link resent successfully!");
        fetchShares();
      } else {
        setMessage(data.message || "Failed to resend invite.");
      }
    } catch {
      setMessage("Error resending invitation.");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (!isOpen) return null;

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
          maxWidth: "680px",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 22px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                backgroundColor: "#f1f5f9",
                color: "#0f172a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <History style={{ width: "18px", height: "18px" }} />
            </div>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                Sharing History — {docNumber}
              </h3>
              <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
                Manage active links, resend invitations, and view audit statuses
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
          >
            <X style={{ width: "20px", height: "20px" }} />
          </button>
        </div>

        {/* Message Banner */}
        {message && (
          <div style={{ padding: "10px 22px", backgroundColor: "#eff6ff", color: "#1e40af", fontSize: "13px", fontWeight: 600 }}>
            {message}
          </div>
        )}

        {/* Content list */}
        <div style={{ padding: "20px 22px", overflowY: "auto", flex: 1 }}>
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
              Loading share history...
            </div>
          ) : shares.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
              No share links have been generated yet for this document.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {shares.map((item) => {
                const isCompleted = item.status === "COMPLETED";
                const isRevoked = item.status === "REVOKED";
                const isExpired = item.status === "EXPIRED" || new Date(item.expiresAt) < new Date();

                return (
                  <div
                    key={item.id}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      padding: "14px 16px",
                      backgroundColor: isRevoked ? "#fafafa" : "#ffffff",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
                            {item.recipientName}
                          </span>
                          <span style={{ fontSize: "12px", color: "#64748b" }}>({item.recipientEmail})</span>
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: "9999px",
                              fontSize: "10.5px",
                              fontWeight: 700,
                              backgroundColor: isCompleted ? "#ecfdf5" : isRevoked ? "#fef2f2" : isExpired ? "#fefce8" : "#eff6ff",
                              color: isCompleted ? "#065f46" : isRevoked ? "#991b1b" : isExpired ? "#854d0e" : "#1e40af",
                            }}
                          >
                            {isCompleted ? "Signed" : isRevoked ? "Revoked" : isExpired ? "Expired" : "Active"}
                          </span>
                        </div>
                        <div style={{ fontSize: "11.5px", color: "#94a3b8", marginTop: "4px" }}>
                          Created: {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · Expires: {new Date(item.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          {item.requireOtp && " · OTP Protected"}
                        </div>
                      </div>

                      {/* Action buttons */}
                      {!isCompleted && !isRevoked && (
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            type="button"
                            onClick={() => handleResend(item.id)}
                            disabled={actionLoadingId === item.id}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "5px 10px",
                              borderRadius: "6px",
                              border: "1px solid #cbd5e1",
                              backgroundColor: "#ffffff",
                              color: "#334155",
                              fontSize: "11.5px",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            <RefreshCw style={{ width: "12px", height: "12px" }} />
                            <span>Resend</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRevoke(item.id)}
                            disabled={actionLoadingId === item.id}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "5px 10px",
                              borderRadius: "6px",
                              border: "1px solid #fecaca",
                              backgroundColor: "#ffffff",
                              color: "#dc2626",
                              fontSize: "11.5px",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            <Slash style={{ width: "12px", height: "12px" }} />
                            <span>Revoke</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {isCompleted && item.signatures && item.signatures[0] && (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px", fontSize: "11.5px", color: "#16a34a", fontWeight: 600 }}>
                        <Check style={{ width: "13px", height: "13px" }} />
                        <span>Signed by {item.signatures[0].signerName} on {new Date(item.signatures[0].createdAt).toUTCString()}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

