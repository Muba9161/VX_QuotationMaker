"use client";

import React, { useState, useEffect } from "react";
import { KeyRound, ShieldAlert, ArrowRight, RefreshCw } from "lucide-react";

interface PublicOtpGateProps {
  token: string;
  recipientName: string;
  recipientEmailMasked: string;
  organizationName: string;
  docNumber: string;
  onVerified: () => void;
}

export default function PublicOtpGate({
  token,
  recipientName,
  recipientEmailMasked,
  organizationName,
  docNumber,
  onVerified,
}: PublicOtpGateProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/public/shares/${token}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Invalid verification code.");
      } else {
        onVerified();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async () => {
    setResending(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/public/shares/${token}/otp`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to send code.");
        if (data.cooldownRemainingSeconds) setCooldown(data.cooldownRemainingSeconds);
      } else {
        setCooldown(60);
      }
    } catch {
      setError("Failed to request code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
          padding: "32px 28px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "50%",
            backgroundColor: "#eff6ff",
            color: "#2563eb",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px",
          }}
        >
          <KeyRound style={{ width: "24px", height: "24px" }} />
        </div>

        <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: "0 0 8px 0" }}>
          Security Verification
        </h2>
        <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 24px 0", lineHeight: 1.5 }}>
          <strong>{organizationName}</strong> requires verification before viewing document{" "}
          <strong>{docNumber}</strong>. Enter the 6-digit code sent to{" "}
          <span style={{ color: "#0f172a", fontWeight: 700 }}>{recipientEmailMasked}</span>.
        </p>

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
              textAlign: "left",
              marginBottom: "20px",
            }}
          >
            <ShieldAlert style={{ width: "16px", height: "16px", flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleVerify}>
          <div style={{ marginBottom: "20px" }}>
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              autoFocus
              style={{
                width: "220px",
                letterSpacing: "8px",
                textAlign: "center",
                fontSize: "26px",
                fontWeight: 800,
                padding: "12px",
                borderRadius: "10px",
                border: "2px solid #cbd5e1",
                outline: "none",
                color: "#0f172a",
                backgroundColor: "#f8fafc",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: code.length === 6 ? "#2563eb" : "#94a3b8",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 700,
              cursor: code.length === 6 ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <span>{loading ? "Verifying..." : "Verify & View Document"}</span>
            <ArrowRight style={{ width: "16px", height: "16px" }} />
          </button>
        </form>

        <div style={{ marginTop: "24px", borderTop: "1px solid #f1f5f9", paddingTop: "16px" }}>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 8px 0" }}>
            Didn&apos;t receive the code?
          </p>
          <button
            type="button"
            onClick={handleRequestOtp}
            disabled={resending || cooldown > 0}
            style={{
              background: "none",
              border: "none",
              color: cooldown > 0 ? "#94a3b8" : "#2563eb",
              fontSize: "13px",
              fontWeight: 600,
              cursor: cooldown > 0 ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <RefreshCw style={{ width: "13px", height: "13px" }} />
            <span>{cooldown > 0 ? `Resend code in ${cooldown}s` : resending ? "Sending..." : "Send code now"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

