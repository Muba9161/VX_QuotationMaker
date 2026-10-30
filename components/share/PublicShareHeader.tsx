"use client";

import React from "react";
import { ShieldCheck, Download, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface PublicShareHeaderProps {
  organizationName: string;
  logoUrl?: string | null;
  primaryColor?: string;
  docNumber: string;
  docTitle: string;
  docType: string;
  status: string;
  allowDownload: boolean;
  onDownload: () => void;
  onOpenSignModal: () => void;
  onOpenDeclineModal: () => void;
  isFullySigned: boolean;
  hasAlreadySigned: boolean;
}

export default function PublicShareHeader({
  organizationName,
  logoUrl,
  primaryColor = "#2563eb",
  docNumber,
  docTitle,
  docType,
  status,
  allowDownload,
  onDownload,
  onOpenSignModal,
  onOpenDeclineModal,
  isFullySigned,
  hasAlreadySigned,
}: PublicShareHeaderProps) {
  const getBadgeStyle = () => {
    if (isFullySigned || status === "SIGNED") {
      return { bg: "#ecfdf5", border: "#a7f3d0", text: "#065f46", label: "Executed & Signed" };
    }
    if (status === "PENDING_SIGNATURE" || status === "PARTIALLY_SIGNED") {
      return { bg: "#eff6ff", border: "#bfdbfe", text: "#1e40af", label: "Partially Signed" };
    }
    if (status === "DECLINED") {
      return { bg: "#fef2f2", border: "#fecaca", text: "#991b1b", label: "Declined" };
    }
    if (status === "EXPIRED") {
      return { bg: "#fefce8", border: "#fef08a", text: "#854d0e", label: "Expired" };
    }
    return { bg: "#f8fafc", border: "#e2e8f0", text: "#334155", label: "Awaiting Signature" };
  };

  const badge = getBadgeStyle();

  return (
    <header
      style={{
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        position: "sticky",
        top: 0,
        zIndex: 40,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        {/* Left: Organization & Document Info */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={organizationName}
              style={{ height: "36px", maxWidth: "120px", objectFit: "contain" }}
            />
          ) : (
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                backgroundColor: primaryColor,
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "14px",
              }}
            >
              {organizationName[0]?.toUpperCase() || "V"}
            </div>
          )}

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                {organizationName}
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "2px 8px",
                  borderRadius: "9999px",
                  fontSize: "11px",
                  fontWeight: 600,
                  backgroundColor: badge.bg,
                  border: `1px solid ${badge.border}`,
                  color: badge.text,
                }}
              >
                {isFullySigned ? <CheckCircle style={{ width: "12px", height: "12px" }} /> : <Clock style={{ width: "12px", height: "12px" }} />}
                {badge.label}
              </span>
            </div>
            <div style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", marginTop: "1px" }}>
              {docNumber} — {docTitle}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {allowDownload && (
            <button
              type="button"
              onClick={onDownload}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                backgroundColor: "#ffffff",
                color: "#334155",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Download style={{ width: "15px", height: "15px", color: "#64748b" }} />
              <span>Download PDF</span>
            </button>
          )}

          {!hasAlreadySigned && status !== "DECLINED" && status !== "EXPIRED" && status !== "REVOKED" && (
            <>
              <button
                type="button"
                onClick={onOpenDeclineModal}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "1px solid #fecaca",
                  backgroundColor: "#ffffff",
                  color: "#dc2626",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <AlertTriangle style={{ width: "15px", height: "15px" }} />
                <span>Decline</span>
              </button>

              <button
                type="button"
                onClick={onOpenSignModal}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 18px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: primaryColor,
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(37,99,235,0.25)",
                }}
              >
                <ShieldCheck style={{ width: "16px", height: "16px" }} />
                <span>Review & Sign</span>
              </button>
            </>
          )}

          {hasAlreadySigned && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "8px",
                backgroundColor: "#ecfdf5",
                color: "#065f46",
                fontSize: "13px",
                fontWeight: 700,
              }}
            >
              <CheckCircle style={{ width: "15px", height: "15px" }} />
              <span>Your Signature Recorded</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

