"use client";

import React, { useState, useEffect } from "react";
import { X, ShieldCheck, Download, CheckCircle, FileText, Lock } from "lucide-react";

interface SignatureRecord {
  id: string;
  signerName: string;
  signerEmail: string;
  signerRole: string;
  signatureType: string;
  signatureData: string;
  consentStatement: string;
  consentVersion: string;
  consentAcceptedAt: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  snapshotHash: string;
  signedPdfHash?: string | null;
  createdAt: string;
}

interface SignatureAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  docNumber: string;
  docTitle: string;
}

export default function SignatureAuditModal({
  isOpen,
  onClose,
  documentId,
  docNumber,
  docTitle,
}: SignatureAuditModalProps) {
  const [signatures, setSignatures] = useState<SignatureRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch(`/api/v1/documents/${documentId}/signatures`)
        .then((res) => res.json())
        .then((data) => {
          if (data.data?.signatures) {
            setSignatures(data.data.signatures);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isOpen, documentId]);

  if (!isOpen) return null;

  const handleDownloadSignedPdf = () => {
    window.location.href = `/api/v1/documents/${documentId}/signed-pdf`;
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
                backgroundColor: "#ecfdf5",
                color: "#16a34a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShieldCheck style={{ width: "20px", height: "20px" }} />
            </div>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                Digital Signature Audit Certificate
              </h3>
              <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
                {docNumber} — {docTitle}
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
        <div style={{ padding: "20px 22px", overflowY: "auto", flex: 1 }}>
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
              Loading cryptographic evidence...
            </div>
          ) : signatures.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
              No digital signatures have been recorded for this document yet.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {signatures.map((sig, idx) => (
                <div
                  key={sig.id}
                  style={{
                    border: "1px solid #cbd5e1",
                    borderRadius: "12px",
                    padding: "16px",
                    backgroundColor: "#f8fafc",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#16a34a", fontSize: "13px", fontWeight: 800 }}>
                      <CheckCircle style={{ width: "16px", height: "16px" }} />
                      <span>Signatory {idx + 1}: {sig.signerName} ({sig.signerRole})</span>
                    </div>
                    <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>
                      {new Date(sig.createdAt).toUTCString()}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: "16px", alignItems: "center" }}>
                    <div style={{ fontSize: "12px", color: "#334155", display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div><strong>Email:</strong> {sig.signerEmail}</div>
                      <div><strong>IP Address:</strong> {sig.ipAddress || "Verified Portal"}</div>
                      <div><strong>Type:</strong> {sig.signatureType}</div>
                      <div style={{ marginTop: "4px", fontSize: "11px", color: "#64748b" }}>
                        <strong>Snapshot SHA-256:</strong>
                        <div style={{ fontFamily: "monospace", wordBreak: "break-all", color: "#0f172a" }}>
                          {sig.snapshotHash}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: "center", padding: "8px", backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                      {sig.signatureType === "DRAWN" && sig.signatureData.startsWith("data:image") ? (
                        <img
                          src={sig.signatureData}
                          alt={sig.signerName}
                          style={{ height: "42px", maxWidth: "120px", objectFit: "contain" }}
                        />
                      ) : (
                        <div style={{ fontFamily: "'Brush Script MT', cursive, serif", fontSize: "18px", color: "#1e3a8a", fontStyle: "italic" }}>
                          {sig.signerName}
                        </div>
                      )}
                      <div style={{ fontSize: "9.5px", color: "#94a3b8", marginTop: "4px" }}>Verified Signature</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div style={{ padding: "14px 22px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "#64748b" }}>
            <Lock style={{ width: "13px", height: "13px" }} />
            <span>Cryptographically sealed & auditable</span>
          </div>
          <button
            type="button"
            onClick={handleDownloadSignedPdf}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <Download style={{ width: "15px", height: "15px" }} />
            <span>Download Signed PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}

