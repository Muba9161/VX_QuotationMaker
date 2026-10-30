"use client";

import React, { useState } from "react";
import { X, Send, Link as LinkIcon, Check, ShieldCheck, Mail, AlertCircle } from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  docNumber: string;
  docTitle: string;
  docType: "QUOTATION" | "MOU";
  defaultRecipientName?: string;
  defaultRecipientEmail?: string;
  onShareCreated?: () => void;
}

export default function ShareModal({
  isOpen,
  onClose,
  documentId,
  docNumber,
  docTitle,
  docType,
  defaultRecipientName = "",
  defaultRecipientEmail = "",
  onShareCreated,
}: ShareModalProps) {
  const [recipientName, setRecipientName] = useState(defaultRecipientName);
  const [recipientEmail, setRecipientEmail] = useState(defaultRecipientEmail);
  const [recipientRole, setRecipientRole] = useState("CLIENT");
  const [signingOrder, setSigningOrder] = useState(1);
  const [customMessage, setCustomMessage] = useState("");
  const [requireOtp, setRequireOtp] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [sendEmail, setSendEmail] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdShareUrl, setCreatedShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/v1/documents/${documentId}/shares`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName,
          recipientEmail,
          recipientRole,
          signingOrder,
          customMessage: customMessage || null,
          requireOtp,
          expiresInDays,
          sendEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.message || data.message || "Failed to create share link.");
      } else {
        setCreatedShareUrl(data.data?.shareUrl || null);
        if (onShareCreated) onShareCreated();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (createdShareUrl) {
      navigator.clipboard.writeText(createdShareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setCreatedShareUrl(null);
    onClose();
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
          maxWidth: "520px",
          overflow: "hidden",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
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
                backgroundColor: "#eff6ff",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Send style={{ width: "18px", height: "18px" }} />
            </div>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                Share {docType} {docNumber}
              </h3>
              <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
                {docTitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleReset}
            style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
          >
            <X style={{ width: "20px", height: "20px" }} />
          </button>
        </div>

        {/* Success View */}
        {createdShareUrl ? (
          <div style={{ padding: "28px 24px", textAlign: "center" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: "#ecfdf5",
                color: "#16a34a",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "14px",
              }}
            >
              <Check style={{ width: "24px", height: "24px" }} />
            </div>
            <h4 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0" }}>
              Secure Share Link Created!
            </h4>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 20px 0" }}>
              {sendEmail
                ? `An invitation email has been sent to ${recipientEmail}. You can also copy the direct link below.`
                : "You can copy and send the secure direct link below to your client."}
            </p>

            <div
              style={{
                display: "flex",
                gap: "8px",
                backgroundColor: "#f8fafc",
                border: "1px solid #cbd5e1",
                padding: "8px 10px",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            >
              <input
                type="text"
                readOnly
                value={createdShareUrl}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: "12.5px",
                  color: "#0f172a",
                }}
              />
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "6px 14px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: copied ? "#16a34a" : "#2563eb",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {copied ? <Check style={{ width: "13px", height: "13px" }} /> : <LinkIcon style={{ width: "13px", height: "13px" }} />}
                <span>{copied ? "Copied!" : "Copy Link"}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleReset}
              style={{
                padding: "9px 24px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#0f172a",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Done
            </button>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit} style={{ padding: "20px 22px" }}>
            {error && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#dc2626",
                  fontSize: "13px",
                  marginBottom: "16px",
                }}
              >
                <AlertCircle style={{ width: "16px", height: "16px", flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                  Recipient Name *
                </label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. John Doe"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", outline: "none" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                  Recipient Email *
                </label>
                <input
                  type="email"
                  required
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="client@example.com"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", outline: "none" }}
                />
              </div>
            </div>

            {docType === "MOU" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                    Signer Role
                  </label>
                  <select
                    value={recipientRole}
                    onChange={(e) => setRecipientRole(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", outline: "none", backgroundColor: "#ffffff" }}
                  >
                    <option value="CLIENT">Client Representative (Party B)</option>
                    <option value="ORGANIZATION">Organization Representative (Party A)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                    Signing Order
                  </label>
                  <select
                    value={signingOrder}
                    onChange={(e) => setSigningOrder(Number(e.target.value))}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", outline: "none", backgroundColor: "#ffffff" }}
                  >
                    <option value={1}>1 (First Signer)</option>
                    <option value={2}>2 (Second Signer)</option>
                  </select>
                </div>
              </div>
            )}

            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                Personal Message (optional)
              </label>
              <textarea
                rows={2}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Add a friendly note to your client..."
                style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", outline: "none", resize: "vertical" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                  Link Expiry
                </label>
                <select
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(Number(e.target.value))}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", outline: "none", backgroundColor: "#ffffff" }}
                >
                  <option value={7}>7 Days</option>
                  <option value={14}>14 Days</option>
                  <option value={30}>30 Days (Recommended)</option>
                  <option value={60}>60 Days</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#334155", fontWeight: 600, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={requireOtp}
                    onChange={(e) => setRequireOtp(e.target.checked)}
                  />
                  <span>Require Email OTP Code</span>
                </label>
                <span style={{ fontSize: "11px", color: "#94a3b8", marginLeft: "22px" }}>
                  Recipient must enter a 6-digit code sent to their email
                </span>
              </div>
            </div>

            <div style={{ padding: "10px 14px", borderRadius: "8px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Mail style={{ width: "16px", height: "16px", color: "#2563eb" }} />
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#334155" }}>
                  Send Email Invitation via Gmail SMTP
                </span>
              </div>
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                style={{ cursor: "pointer" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                style={{ padding: "9px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff", color: "#475569", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 20px", borderRadius: "8px", border: "none", backgroundColor: "#2563eb", color: "#ffffff", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
              >
                <ShieldCheck style={{ width: "15px", height: "15px" }} />
                <span>{loading ? "Generating Link..." : "Generate & Share"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

