"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import OrgLayout from "@/components/OrgLayout";
import {
  User,
  Trash2,
  Plus,
  Calendar,
  Send,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Shield,
  Check,
} from "lucide-react";

interface Recipient {
  id: string;
  name: string;
  email: string;
  role: "Signer" | "CC (View only)";
}

export default function SendForSignaturePage() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [recipients, setRecipients] = useState<Recipient[]>([
    {
      id: "1",
      name: "John Doe",
      email: "johnd@techsolutions.com",
      role: "Signer",
    },
    {
      id: "2",
      name: "Priya Mehta",
      email: "priya@techsolutions.com",
      role: "CC (View only)",
    },
  ]);

  const [subject, setSubject] = useState("Website Development Proposal for signature");
  const [requireSignIn, setRequireSignIn] = useState(false);
  const [allowDownload, setAllowDownload] = useState(true);
  const [expiryDate, setExpiryDate] = useState("28-11-2026");
  const [message, setMessage] = useState(
    "Please review and sign the quotation. Let us know if you have any questions."
  );
  const [sentSuccess, setSentSuccess] = useState(false);

  const addRecipient = () => {
    setRecipients([
      ...recipients,
      {
        id: `rec-${Date.now()}`,
        name: "",
        email: "",
        role: "Signer",
      },
    ]);
  };

  const removeRecipient = (index: number) => {
    if (recipients.length <= 1) return;
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    setSentSuccess(true);
  };

  return (
    <OrgLayout activePath="/my-documents">
      <div
        style={{
          width: "100%",
          maxWidth: "1040px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          boxSizing: "border-box",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        }}
      >
        {/* ================= TOP BREADCRUMB / BACK ================= */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              color: "#64748b",
            }}
          >
            <Link
              href="/my-documents"
              style={{
                color: "#2563eb",
                textDecoration: "none",
                fontWeight: 500,
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <ArrowLeft style={{ width: "14px", height: "14px" }} />
              <span>Back to Documents</span>
            </Link>
            <span>/</span>
            <span style={{ color: "#0f172a", fontWeight: 600 }}>
              Website Development Proposal
            </span>
          </div>

          <span
            style={{
              fontSize: "11.5px",
              fontWeight: 600,
              padding: "4px 10px",
              borderRadius: "6px",
              backgroundColor: "#fef3c7",
              color: "#b45309",
            }}
          >
            Ready to Send
          </span>
        </div>

        {/* ================= STEPPER HEADER (MATCHING IMAGE 3) ================= */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "14px",
            border: "1px solid #eef2f6",
            boxShadow: "0 1px 4px rgba(15, 23, 42, 0.03)",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <h1
            style={{
              fontSize: "20px",
              fontWeight: 800,
              color: "#0f172a",
              margin: 0,
              letterSpacing: "-0.3px",
            }}
          >
            Send for Signature
          </h1>

          {/* Stepper matching screenshot Image 3 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            {/* Step 1: Recipients */}
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              style={{
                border: "none",
                background: "transparent",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  backgroundColor:
                    currentStep === 1
                      ? "#2563eb"
                      : currentStep > 1
                      ? "#10b981"
                      : "#e0e7ff",
                  color: currentStep >= 1 ? "#ffffff" : "#475569",
                  fontSize: "12px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s ease",
                }}
              >
                {currentStep > 1 ? (
                  <Check style={{ width: "13px", height: "13px", strokeWidth: 3 }} />
                ) : (
                  "1"
                )}
              </div>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: currentStep === 1 ? 600 : 500,
                  color: currentStep === 1 ? "#2563eb" : "#475569",
                }}
              >
                Recipients
              </span>
            </button>

            {/* Connecting line */}
            <div
              style={{
                width: "40px",
                height: "1px",
                backgroundColor: currentStep >= 2 ? "#2563eb" : "#cbd5e1",
                transition: "background-color 0.15s ease",
              }}
            />

            {/* Step 2: Settings */}
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              style={{
                border: "none",
                background: "transparent",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  backgroundColor:
                    currentStep === 2
                      ? "#2563eb"
                      : currentStep > 2
                      ? "#10b981"
                      : "#e2e8f0",
                  color: currentStep >= 2 ? "#ffffff" : "#475569",
                  fontSize: "12px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s ease",
                }}
              >
                {currentStep > 2 ? (
                  <Check style={{ width: "13px", height: "13px", strokeWidth: 3 }} />
                ) : (
                  "2"
                )}
              </div>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: currentStep === 2 ? 600 : 500,
                  color: currentStep === 2 ? "#2563eb" : "#475569",
                }}
              >
                Settings
              </span>
            </button>

            {/* Connecting line */}
            <div
              style={{
                width: "40px",
                height: "1px",
                backgroundColor: currentStep >= 3 ? "#2563eb" : "#cbd5e1",
                transition: "background-color 0.15s ease",
              }}
            />

            {/* Step 3: Review */}
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              style={{
                border: "none",
                background: "transparent",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  backgroundColor:
                    currentStep === 3
                      ? "#2563eb"
                      : "#e2e8f0",
                  color: currentStep === 3 ? "#ffffff" : "#475569",
                  fontSize: "12px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s ease",
                }}
              >
                3
              </div>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: currentStep === 3 ? 600 : 500,
                  color: currentStep === 3 ? "#2563eb" : "#475569",
                }}
              >
                Review
              </span>
            </button>
          </div>
        </div>

        {/* ================= MAIN CONTENT AREA ================= */}
        {sentSuccess ? (
          /* ================= SUCCESS BANNER ================= */
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "14px",
              border: "1px solid #bbf7d0",
              boxShadow: "0 2px 8px rgba(16, 185, 129, 0.08)",
              padding: "40px 32px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: "#dcfce7",
                color: "#16a34a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle2 style={{ width: "34px", height: "34px" }} />
            </div>
            <div>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#0f172a",
                  margin: "0 0 6px 0",
                }}
              >
                Document Sent Successfully!
              </h2>
              <p
                style={{
                  fontSize: "13.5px",
                  color: "#64748b",
                  margin: 0,
                  maxWidth: "460px",
                }}
              >
                Invitations with secure signing links have been dispatched to {recipients.length} recipients. You can track progress in real-time.
              </p>
            </div>
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "12px",
              }}
            >
              <Link
                href="/my-documents"
                style={{
                  padding: "10px 22px",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  textDecoration: "none",
                  borderRadius: "8px",
                  fontSize: "13.5px",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                Go to My Documents
              </Link>
              <button
                onClick={() => {
                  setSentSuccess(false);
                  setCurrentStep(1);
                }}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#f1f5f9",
                  color: "#334155",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13.5px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Send Another
              </button>
            </div>
          </div>
        ) : (
          /* ================= STEP-BASED WIZARD ================= */
          <div>
            {/* STEP 1: RECIPIENTS */}
            {currentStep === 1 && (
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "14px",
                  border: "1px solid #eef2f6",
                  boxShadow: "0 1px 4px rgba(15, 23, 42, 0.03)",
                  padding: "24px 28px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: "16px",
                        fontWeight: 700,
                        color: "#0f172a",
                        margin: "0 0 4px 0",
                      }}
                    >
                      Step 1: Add Recipients
                    </h3>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#64748b",
                        margin: 0,
                      }}
                    >
                      Specify people who need to sign or receive a carbon copy (CC) of this document.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addRecipient}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 14px",
                      backgroundColor: "#eff6ff",
                      color: "#2563eb",
                      border: "1px solid #bfdbfe",
                      borderRadius: "8px",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#dbeafe")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#eff6ff")
                    }
                  >
                    <Plus style={{ width: "14px", height: "14px" }} />
                    <span>Add recipient</span>
                  </button>
                </div>

                {/* Recipient Rows */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {recipients.map((rec, idx) => (
                    <div
                      key={rec.id}
                      style={{
                        backgroundColor: "#f8fafc",
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                        padding: "14px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        boxSizing: "border-box",
                      }}
                    >
                      {/* Index */}
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#64748b",
                          width: "18px",
                          textAlign: "center",
                        }}
                      >
                        {idx + 1}
                      </span>

                      {/* User Icon Circle */}
                      <div
                        style={{
                          width: "34px",
                          height: "34px",
                          borderRadius: "50%",
                          backgroundColor: "#eff6ff",
                          color: "#2563eb",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <User style={{ width: "16px", height: "16px" }} />
                      </div>

                      {/* Name input */}
                      <div style={{ flex: 1.2 }}>
                        <label
                          style={{
                            display: "block",
                            fontSize: "11px",
                            fontWeight: 600,
                            color: "#64748b",
                            marginBottom: "4px",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={rec.name}
                          onChange={(e) => {
                            const updated = [...recipients];
                            updated[idx].name = e.target.value;
                            setRecipients(updated);
                          }}
                          placeholder="Recipient name"
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            borderRadius: "7px",
                            border: "1px solid #cbd5e1",
                            fontSize: "13px",
                            color: "#1e293b",
                            backgroundColor: "#ffffff",
                            outline: "none",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>

                      {/* Email input */}
                      <div style={{ flex: 1.4 }}>
                        <label
                          style={{
                            display: "block",
                            fontSize: "11px",
                            fontWeight: 600,
                            color: "#64748b",
                            marginBottom: "4px",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={rec.email}
                          onChange={(e) => {
                            const updated = [...recipients];
                            updated[idx].email = e.target.value;
                            setRecipients(updated);
                          }}
                          placeholder="email@example.com"
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            borderRadius: "7px",
                            border: "1px solid #cbd5e1",
                            fontSize: "13px",
                            color: "#1e293b",
                            backgroundColor: "#ffffff",
                            outline: "none",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>

                      {/* Role Selector */}
                      <div style={{ width: "160px" }}>
                        <label
                          style={{
                            display: "block",
                            fontSize: "11px",
                            fontWeight: 600,
                            color: "#64748b",
                            marginBottom: "4px",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Role
                        </label>
                        <select
                          value={rec.role}
                          onChange={(e) => {
                            const updated = [...recipients];
                            updated[idx].role = e.target.value as Recipient["role"];
                            setRecipients(updated);
                          }}
                          style={{
                            width: "100%",
                            padding: "8px 10px",
                            borderRadius: "7px",
                            border: "1px solid #cbd5e1",
                            fontSize: "12.5px",
                            color: "#1e293b",
                            backgroundColor: "#ffffff",
                            outline: "none",
                            cursor: "pointer",
                          }}
                        >
                          <option value="Signer">Signer</option>
                          <option value="CC (View only)">CC (View only)</option>
                        </select>
                      </div>

                      {/* Remove Button */}
                      <div style={{ paddingTop: "18px" }}>
                        <button
                          type="button"
                          onClick={() => removeRecipient(idx)}
                          disabled={recipients.length <= 1}
                          title="Remove recipient"
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "7px",
                            border: "none",
                            backgroundColor: "transparent",
                            color: recipients.length <= 1 ? "#cbd5e1" : "#94a3b8",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: recipients.length <= 1 ? "not-allowed" : "pointer",
                          }}
                          onMouseEnter={(e) => {
                            if (recipients.length > 1) {
                              e.currentTarget.style.color = "#ef4444";
                              e.currentTarget.style.backgroundColor = "#fee2e2";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (recipients.length > 1) {
                              e.currentTarget.style.color = "#94a3b8";
                              e.currentTarget.style.backgroundColor = "transparent";
                            }
                          }}
                        >
                          <Trash2 style={{ width: "15px", height: "15px" }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Action */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: "12px",
                    paddingTop: "16px",
                    borderTop: "1px solid #f1f5f9",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 22px",
                      backgroundColor: "#2563eb",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "13.5px",
                      fontWeight: 600,
                      cursor: "pointer",
                      boxShadow: "0 2px 6px rgba(37,99,235,0.25)",
                      transition: "background-color 0.15s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#1d4ed8")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#2563eb")
                    }
                  >
                    <span>Continue to Settings</span>
                    <ArrowRight style={{ width: "15px", height: "15px" }} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: SETTINGS */}
            {currentStep === 2 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1fr",
                  gap: "24px",
                  alignItems: "start",
                }}
              >
                {/* Left Card: Signing & Expiry Settings */}
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "14px",
                    border: "1px solid #eef2f6",
                    boxShadow: "0 1px 4px rgba(15, 23, 42, 0.03)",
                    padding: "24px 26px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "#0f172a",
                        margin: "0 0 4px 0",
                      }}
                    >
                      Signing Settings
                    </h3>
                    <p style={{ fontSize: "12.5px", color: "#64748b", margin: 0 }}>
                      Configure access controls and expiration parameters.
                    </p>
                  </div>

                  {/* Toggle 1: Require recipients to sign in */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      padding: "12px 14px",
                      borderRadius: "8px",
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#1e293b",
                        }}
                      >
                        Require recipients to sign in
                      </div>
                      <div style={{ fontSize: "11.5px", color: "#64748b" }}>
                        Signers must verify their email or login before viewing.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRequireSignIn(!requireSignIn)}
                      style={{
                        width: "40px",
                        height: "22px",
                        borderRadius: "11px",
                        backgroundColor: requireSignIn ? "#2563eb" : "#cbd5e1",
                        border: "none",
                        cursor: "pointer",
                        position: "relative",
                        transition: "background-color 0.15s ease",
                        padding: "2px",
                        boxSizing: "border-box",
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          backgroundColor: "#ffffff",
                          position: "absolute",
                          top: "2px",
                          left: requireSignIn ? "20px" : "2px",
                          transition: "left 0.15s ease",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                        }}
                      />
                    </button>
                  </div>

                  {/* Toggle 2: Allow download before signing */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      padding: "12px 14px",
                      borderRadius: "8px",
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#1e293b",
                        }}
                      >
                        Allow download before signing
                      </div>
                      <div style={{ fontSize: "11.5px", color: "#64748b" }}>
                        Enable signers to review and print an offline PDF copy.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAllowDownload(!allowDownload)}
                      style={{
                        width: "40px",
                        height: "22px",
                        borderRadius: "11px",
                        backgroundColor: allowDownload ? "#2563eb" : "#cbd5e1",
                        border: "none",
                        cursor: "pointer",
                        position: "relative",
                        transition: "background-color 0.15s ease",
                        padding: "2px",
                        boxSizing: "border-box",
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          backgroundColor: "#ffffff",
                          position: "absolute",
                          top: "2px",
                          left: allowDownload ? "20px" : "2px",
                          transition: "left 0.15s ease",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                        }}
                      />
                    </button>
                  </div>

                  {/* Set expiry date - EXACT MATCH TO IMAGE 2 */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#334155",
                        marginBottom: "6px",
                      }}
                    >
                      Set expiry date
                    </label>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "9px 14px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        backgroundColor: "#ffffff",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                        position: "relative",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        try {
                          dateInputRef.current?.showPicker?.();
                        } catch {
                          dateInputRef.current?.focus();
                        }
                      }}
                    >
                      <input
                        type="text"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        style={{
                          border: "none",
                          outline: "none",
                          fontSize: "13px",
                          color: "#1e293b",
                          fontWeight: 500,
                          width: "100%",
                          backgroundColor: "transparent",
                          cursor: "text",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Calendar
                        style={{
                          width: "16px",
                          height: "16px",
                          color: "#64748b",
                          flexShrink: 0,
                        }}
                      />
                      {/* Hidden native date picker */}
                      <input
                        ref={dateInputRef}
                        type="date"
                        style={{
                          position: "absolute",
                          opacity: 0,
                          width: "1px",
                          height: "1px",
                          bottom: 0,
                          right: 0,
                          pointerEvents: "none",
                        }}
                        onChange={(e) => {
                          if (e.target.value) {
                            const [year, month, day] = e.target.value.split("-");
                            setExpiryDate(`${day}-${month}-${year}`);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Card: Message */}
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "14px",
                    border: "1px solid #eef2f6",
                    boxShadow: "0 1px 4px rgba(15, 23, 42, 0.03)",
                    padding: "24px 26px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#0f172a",
                      margin: 0,
                    }}
                  >
                    Notification Message
                  </h3>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#64748b",
                        marginBottom: "6px",
                      }}
                    >
                      Email Subject
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "13px",
                        color: "#1e293b",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#64748b",
                        marginBottom: "6px",
                      }}
                    >
                      Custom Message
                    </label>
                    <textarea
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "13px",
                        color: "#1e293b",
                        lineHeight: "1.5",
                        outline: "none",
                        boxSizing: "border-box",
                        resize: "none",
                      }}
                    />
                  </div>
                </div>

                {/* Footer Navigation */}
                <div
                  style={{
                    gridColumn: "1 / -1",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: "8px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "10px 18px",
                      backgroundColor: "#ffffff",
                      color: "#475569",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f8fafc")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#ffffff")
                    }
                  >
                    <ArrowLeft style={{ width: "15px", height: "15px" }} />
                    <span>Back to Recipients</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 22px",
                      backgroundColor: "#2563eb",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "13.5px",
                      fontWeight: 600,
                      cursor: "pointer",
                      boxShadow: "0 2px 6px rgba(37,99,235,0.25)",
                      transition: "background-color 0.15s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#1d4ed8")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#2563eb")
                    }
                  >
                    <span>Continue to Review</span>
                    <ArrowRight style={{ width: "15px", height: "15px" }} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW & SEND */}
            {currentStep === 3 && (
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "14px",
                  border: "1px solid #eef2f6",
                  boxShadow: "0 1px 4px rgba(15, 23, 42, 0.03)",
                  padding: "26px 30px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "22px",
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "#0f172a",
                      margin: "0 0 4px 0",
                    }}
                  >
                    Step 3: Review & Send
                  </h3>
                  <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                    Please verify the recipient details, signing policies, and expiration deadline.
                  </p>
                </div>

                {/* Review Cards Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr 1fr",
                    gap: "20px",
                  }}
                >
                  {/* Recipients Summary */}
                  <div
                    style={{
                      backgroundColor: "#f8fafc",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      padding: "16px 18px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#0f172a",
                        marginBottom: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <User style={{ width: "15px", height: "15px", color: "#2563eb" }} />
                      <span>Recipients ({recipients.length})</span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      {recipients.map((rec) => (
                        <div
                          key={rec.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            backgroundColor: "#ffffff",
                            padding: "8px 12px",
                            borderRadius: "7px",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: "13px",
                                fontWeight: 600,
                                color: "#1e293b",
                              }}
                            >
                              {rec.name || "Untitled"}
                            </div>
                            <div style={{ fontSize: "11.5px", color: "#64748b" }}>
                              {rec.email || "No email provided"}
                            </div>
                          </div>
                          <span
                            style={{
                              fontSize: "11.5px",
                              fontWeight: 600,
                              padding: "3px 8px",
                              borderRadius: "6px",
                              backgroundColor:
                                rec.role === "Signer" ? "#eff6ff" : "#f1f5f9",
                              color:
                                rec.role === "Signer" ? "#2563eb" : "#475569",
                            }}
                          >
                            {rec.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Settings & Expiry Summary */}
                  <div
                    style={{
                      backgroundColor: "#f8fafc",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      padding: "16px 18px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#0f172a",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Shield style={{ width: "15px", height: "15px", color: "#2563eb" }} />
                      <span>Security & Expiry</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "12.5px",
                        }}
                      >
                        <span style={{ color: "#64748b" }}>Expiry Date:</span>
                        <strong style={{ color: "#0f172a" }}>{expiryDate}</strong>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "12.5px",
                        }}
                      >
                        <span style={{ color: "#64748b" }}>Sign-in Required:</span>
                        <span
                          style={{
                            fontWeight: 600,
                            color: requireSignIn ? "#16a34a" : "#64748b",
                          }}
                        >
                          {requireSignIn ? "Yes" : "No"}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "12.5px",
                        }}
                      >
                        <span style={{ color: "#64748b" }}>Download Before Signing:</span>
                        <span
                          style={{
                            fontWeight: 600,
                            color: allowDownload ? "#16a34a" : "#64748b",
                          }}
                        >
                          {allowDownload ? "Allowed" : "Disabled"}
                        </span>
                      </div>
                    </div>

                    <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "10px" }}>
                      <div style={{ fontSize: "11.5px", color: "#64748b", marginBottom: "4px" }}>
                        Subject: <strong>{subject}</strong>
                      </div>
                      <div
                        style={{
                          fontSize: "11.5px",
                          color: "#475569",
                          fontStyle: "italic",
                          backgroundColor: "#ffffff",
                          padding: "8px 10px",
                          borderRadius: "6px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        &ldquo;{message}&rdquo;
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: "12px",
                    borderTop: "1px solid #f1f5f9",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "10px 18px",
                      backgroundColor: "#ffffff",
                      color: "#475569",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f8fafc")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#ffffff")
                    }
                  >
                    <ArrowLeft style={{ width: "15px", height: "15px" }} />
                    <span>Back to Settings</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSend}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "11px 26px",
                      backgroundColor: "#2563eb",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                      boxShadow: "0 2px 6px rgba(37,99,235,0.3)",
                      transition: "background-color 0.15s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#1d4ed8")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#2563eb")
                    }
                  >
                    <Send style={{ width: "16px", height: "16px" }} />
                    <span>Send Document</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </OrgLayout>
  );
}
