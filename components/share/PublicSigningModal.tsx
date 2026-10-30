"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, CheckCircle, PenTool, Type, ShieldCheck, AlertCircle } from "lucide-react";
import SignatureCanvasPad, { SignatureCanvasPadRef } from "./SignatureCanvasPad";

interface PublicSigningModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  defaultName: string;
  defaultEmail: string;
  docNumber: string;
  onSignedSuccessfully: () => void;
}

const CONSENT_TEXT =
  "I confirm that I have reviewed this document and agree to sign it electronically. I understand that my electronic signature will be associated with this document, its cryptographic hash, and its permanent audit record.";

export default function PublicSigningModal({
  isOpen,
  onClose,
  token,
  defaultName,
  defaultEmail,
  docNumber,
  onSignedSuccessfully,
}: PublicSigningModalProps) {
  const [tab, setTab] = useState<"DRAWN" | "TYPED">("DRAWN");
  const [legalName, setLegalName] = useState(defaultName || "");
  const [typedSignature, setTypedSignature] = useState(defaultName || "");
  const [consentChecked, setConsentChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canvasPadRef = useRef<SignatureCanvasPadRef | null>(null);

  useEffect(() => {
    if (defaultName && !legalName) {
      setLegalName(defaultName);
      setTypedSignature(defaultName);
    }
  }, [defaultName, legalName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!legalName.trim()) {
      setError("Please enter your legal name.");
      return;
    }
    if (!consentChecked) {
      setError("You must review and accept the electronic signature consent.");
      return;
    }

    let sigData = "";
    if (tab === "DRAWN") {
      if (!canvasPadRef.current || !canvasPadRef.current.hasDrawn()) {
        setError("Please draw your signature in the box provided.");
        return;
      }
      sigData = canvasPadRef.current.getDataUrl();
    } else {
      if (!typedSignature.trim()) {
        setError("Please type your signature.");
        return;
      }
      sigData = typedSignature.trim();
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/v1/public/shares/${token}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signerName: legalName.trim(),
          signerEmail: defaultEmail,
          signatureType: tab,
          signatureData: sigData,
          consentAccepted: consentChecked,
          consentVersion: "1.0",
          consentStatement: CONSENT_TEXT,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to submit signature.");
      } else {
        onSignedSuccessfully();
        onClose();
      }
    } catch {
      setError("Network error while submitting signature. Please try again.");
    } finally {
      setSubmitting(false);
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
          maxWidth: "540px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          overflow: "hidden",
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
              <ShieldCheck style={{ width: "20px", height: "20px" }} />
            </div>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                Sign Document {docNumber}
              </h3>
              <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
                Legally binding electronic signature capture
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

        {/* Content */}
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

          {/* Legal Name & Email */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                Full Legal Name *
              </label>
              <input
                type="text"
                required
                value={legalName}
                onChange={(e) => {
                  setLegalName(e.target.value);
                  if (tab === "TYPED") setTypedSignature(e.target.value);
                }}
                placeholder="e.g. Rahul Sharma"
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                Signer Email
              </label>
              <input
                type="email"
                disabled
                value={defaultEmail}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#f8fafc",
                  color: "#64748b",
                  fontSize: "13px",
                }}
              />
            </div>
          </div>

          {/* Mode Tabs */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            <button
              type="button"
              onClick={() => setTab("DRAWN")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: tab === "DRAWN" ? "#2563eb" : "#f1f5f9",
                color: tab === "DRAWN" ? "#ffffff" : "#475569",
                fontSize: "12.5px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <PenTool style={{ width: "13px", height: "13px" }} />
              <span>Draw Signature</span>
            </button>
            <button
              type="button"
              onClick={() => setTab("TYPED")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: tab === "TYPED" ? "#2563eb" : "#f1f5f9",
                color: tab === "TYPED" ? "#ffffff" : "#475569",
                fontSize: "12.5px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Type style={{ width: "13px", height: "13px" }} />
              <span>Type Signature</span>
            </button>
          </div>

          {/* Signature Box */}
          {tab === "DRAWN" ? (
            <SignatureCanvasPad ref={canvasPadRef} disabled={submitting} />
          ) : (
            <div style={{ marginBottom: "16px" }}>
              <input
                type="text"
                value={typedSignature}
                onChange={(e) => setTypedSignature(e.target.value)}
                placeholder="Type your signature here..."
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  outline: "none",
                  marginBottom: "8px",
                }}
              />
              <div
                style={{
                  padding: "20px",
                  borderRadius: "10px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  textAlign: "center",
                  minHeight: "70px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Brush Script MT', 'Dancing Script', cursive, serif",
                    fontSize: "26px",
                    color: "#1e3a8a",
                    fontStyle: "italic",
                  }}
                >
                  {typedSignature || "Signature Preview"}
                </span>
              </div>
            </div>
          )}

          {/* Legal Consent Checkbox */}
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "8px",
              backgroundColor: "#f1f5f9",
              border: "1px solid #e2e8f0",
              marginBottom: "20px",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
            }}
          >
            <input
              type="checkbox"
              id="consent-check"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              style={{ marginTop: "3px", cursor: "pointer" }}
            />
            <label
              htmlFor="consent-check"
              style={{ fontSize: "12px", color: "#334155", lineHeight: 1.4, cursor: "pointer" }}
            >
              <strong>Consent to Electronic Signature:</strong> {CONSENT_TEXT}
            </label>
          </div>

          {/* Submit Action */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
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
              disabled={submitting || !consentChecked}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "9px 20px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: consentChecked && !submitting ? "#2563eb" : "#94a3b8",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 700,
                cursor: consentChecked && !submitting ? "pointer" : "not-allowed",
              }}
            >
              <CheckCircle style={{ width: "15px", height: "15px" }} />
              <span>{submitting ? "Signing & Encrypting..." : "Accept & Sign Document"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
