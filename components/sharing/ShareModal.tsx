"use client";

import React, { useState } from "react";
import {
  X,
  ShieldCheck,
  Mail,
  AlertCircle,
  FileText,
  FileCheck2,
  Bookmark,
  Sparkles,
} from "lucide-react";
import MultiEmailInput, { RecipientEntry } from "@/components/sharing/MultiEmailInput";
import ShareSuccessView from "@/components/sharing/ShareSuccessView";

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  docNumber: string;
  docTitle: string;
  docType: "QUOTATION" | "MOU" | "TEMPLATE";
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
  const initialRecipients: RecipientEntry[] = defaultRecipientEmail
    ? [{ email: defaultRecipientEmail, name: defaultRecipientName || undefined }]
    : [];

  const [recipients, setRecipients] = useState<RecipientEntry[]>(initialRecipients);
  const [recipientRole, setRecipientRole] = useState("CLIENT");
  const [signingOrder, setSigningOrder] = useState(1);
  const [customMessage, setCustomMessage] = useState("");
  const [requireOtp, setRequireOtp] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [sendEmail, setSendEmail] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdShareUrl, setCreatedShareUrl] = useState<string | null>(null);
  const [sentCount, setSentCount] = useState<number>(0);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (recipients.length === 0) {
      setError("Please add at least one recipient email address.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (docType === "TEMPLATE") {
        const res = await fetch(`/api/v1/templates/${documentId}/share`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipients,
            customMessage: customMessage || null,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error?.message || data.message || "Failed to share template.");
        } else {
          setCreatedShareUrl(data.data?.templateUrl || null);
          setSentCount(recipients.length);
          if (onShareCreated) onShareCreated();
        }
      } else {
        const res = await fetch(`/api/v1/documents/${documentId}/shares`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipients,
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
          setSentCount(recipients.length);
          if (onShareCreated) onShareCreated();
        }
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCreatedShareUrl(null);
    setSentCount(0);
    onClose();
  };

  const getDocTypeIcon = () => {
    if (docType === "MOU") return <FileCheck2 style={{ width: "18px", height: "18px", color: "#9333ea" }} />;
    if (docType === "TEMPLATE") return <Bookmark style={{ width: "18px", height: "18px", color: "#4f46e5" }} />;
    return <FileText style={{ width: "18px", height: "18px", color: "#2563eb" }} />;
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px 16px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "520px",
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          border: "1px solid #cbd5e1",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#f8fafc",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "#eff6ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #dbeafe",
                flexShrink: 0,
              }}
            >
              {getDocTypeIcon()}
            </div>
            <div>
              <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a", margin: 0, lineHeight: 1.3 }}>
                Share {docType} {docNumber ? `• ${docNumber}` : ""}
              </h3>
              <p style={{ fontSize: "11.5px", color: "#64748b", margin: "2px 0 0 0", maxWidth: "320px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {docTitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleReset}
            style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}
            title="Close dialog"
          >
            <X style={{ width: "20px", height: "20px" }} />
          </button>
        </div>

        {/* Success View */}
        {createdShareUrl ? (
          <ShareSuccessView
            createdShareUrl={createdShareUrl}
            sentCount={sentCount}
            recipients={recipients}
            onDone={handleReset}
          />
        ) : (
          /* Form View with rock-solid flex layout: minHeight: 0 guarantees no clipping */
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden" }}>
            <div style={{ padding: "18px 22px", overflowY: "auto", flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
              {error && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    backgroundColor: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "#dc2626",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  <AlertCircle style={{ width: "15px", height: "15px", flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              {/* Multiple Email Input */}
              <MultiEmailInput
                recipients={recipients}
                onChange={setRecipients}
                disabled={loading}
              />

              {docType === "MOU" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                      Signer Role
                    </label>
                    <select
                      value={recipientRole}
                      onChange={(e) => setRecipientRole(e.target.value)}
                      style={{ width: "100%", height: "38px", padding: "0 10px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "12.5px", outline: "none", backgroundColor: "#ffffff" }}
                    >
                      <option value="CLIENT">Client Representative (Party B)</option>
                      <option value="ORGANIZATION">Organization Representative (Party A)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                      Signing Order
                    </label>
                    <select
                      value={signingOrder}
                      onChange={(e) => setSigningOrder(Number(e.target.value))}
                      style={{ width: "100%", height: "38px", padding: "0 10px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "12.5px", outline: "none", backgroundColor: "#ffffff" }}
                    >
                      <option value={1}>1 (First Signer)</option>
                      <option value={2}>2 (Second Signer)</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                  Personal Message (optional)
                </label>
                <textarea
                  rows={2}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Add a friendly note to your recipients..."
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "12.5px", outline: "none", resize: "none", boxSizing: "border-box" }}
                />
              </div>

              {docType !== "TEMPLATE" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                      Link Expiry
                    </label>
                    <select
                      value={expiresInDays}
                      onChange={(e) => setExpiresInDays(Number(e.target.value))}
                      style={{ width: "100%", height: "38px", padding: "0 10px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "12.5px", outline: "none", backgroundColor: "#ffffff" }}
                    >
                      <option value={7}>7 Days</option>
                      <option value={14}>14 Days</option>
                      <option value={30}>30 Days (Recommended)</option>
                      <option value={60}>60 Days</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: 600, color: "#334155", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={requireOtp}
                        onChange={(e) => setRequireOtp(e.target.checked)}
                        style={{ cursor: "pointer", width: "15px", height: "15px" }}
                      />
                      <span>Require Email OTP Code</span>
                    </label>
                    <span style={{ fontSize: "10.5px", color: "#64748b", marginLeft: "23px" }}>
                      Recipients must enter 6-digit OTP
                    </span>
                  </div>
                </div>
              )}

              <div
                style={{
                  padding: "9px 12px",
                  borderRadius: "8px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Mail style={{ width: "15px", height: "15px", color: "#2563eb" }} />
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>
                    Send Email Invitation via Gmail SMTP
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  style={{ cursor: "pointer", width: "15px", height: "15px" }}
                />
              </div>
            </div>

            {/* Solid Fixed Footer - Always Fully Visible with Clear Margins */}
            <div
              style={{
                padding: "14px 22px",
                borderTop: "1px solid #e2e8f0",
                backgroundColor: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "10px",
                flexShrink: 0,
                boxShadow: "0 -2px 8px rgba(0,0,0,0.03)",
              }}
            >
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                style={{
                  height: "38px",
                  padding: "0 18px",
                  borderRadius: "8px",
                  border: "1.5px solid #cbd5e1",
                  backgroundColor: "#ffffff",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  color: "#475569",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || recipients.length === 0}
                style={{
                  height: "38px",
                  padding: "0 20px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: recipients.length === 0 ? "#94a3b8" : "#2563eb",
                  fontSize: "12.5px",
                  fontWeight: 700,
                  color: "#ffffff",
                  cursor: recipients.length === 0 ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: recipients.length === 0 ? "none" : "0 2px 4px rgba(37,99,235,0.25)",
                }}
              >
                {docType === "TEMPLATE" ? <Sparkles style={{ width: "14px", height: "14px" }} /> : <ShieldCheck style={{ width: "14px", height: "14px" }} />}
                <span>
                  {loading
                    ? "Sharing..."
                    : `Share to ${recipients.length > 0 ? recipients.length : ""} Recipient${recipients.length === 1 ? "" : "s"}`}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
