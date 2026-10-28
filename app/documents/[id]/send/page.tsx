"use client";

import React, { useState } from "react";
import Link from "next/link";
import OrgLayout from "@/components/OrgLayout";
import {
  User,
  Trash2,
  Plus,
  Calendar,
  Send,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

interface Recipient {
  id: string;
  name: string;
  email: string;
  role: "Signer" | "CC (View only)";
}

export default function SendForSignaturePage() {
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
        {/* ================= HEADER & STEPPER ================= */}
        <div
          style={{
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
              fontWeight: 700,
              color: "#0f172a",
              margin: 0,
              letterSpacing: "-0.3px",
            }}
          >
            Send for Signature
          </h1>

          {/* Stepper matching screenshot */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            {/* Step 1: Active */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                1
              </div>
              <span
                style={{
                  fontSize: "12.5px",
                  fontWeight: 600,
                  color: "#2563eb",
                }}
              >
                Recipients
              </span>
            </div>

            {/* Connecting line */}
            <div
              style={{
                width: "36px",
                height: "1px",
                backgroundColor: "#cbd5e1",
              }}
            />

            {/* Step 2: Inactive */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  backgroundColor: "#e2e8f0",
                  color: "#64748b",
                  fontSize: "12px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                2
              </div>
              <span
                style={{
                  fontSize: "12.5px",
                  fontWeight: 500,
                  color: "#64748b",
                }}
              >
                Settings
              </span>
            </div>

            {/* Connecting line */}
            <div
              style={{
                width: "36px",
                height: "1px",
                backgroundColor: "#cbd5e1",
              }}
            />

            {/* Step 3: Inactive */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  backgroundColor: "#e2e8f0",
                  color: "#64748b",
                  fontSize: "12px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                3
              </div>
              <span
                style={{
                  fontSize: "12.5px",
                  fontWeight: 500,
                  color: "#64748b",
                }}
              >
                Review
              </span>
            </div>
          </div>
        </div>

        {/* ================= SUCCESS BANNER OR FORM ================= */}
        {sentSuccess ? (
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #eef2f6",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
              padding: "48px 32px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "#dcfce7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#16a34a",
              }}
            >
              <CheckCircle2 style={{ width: "32px", height: "32px" }} />
            </div>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#0f172a",
                margin: 0,
              }}
            >
              Document Sent Successfully!
            </h2>
            <p
              style={{
                fontSize: "13px",
                color: "#64748b",
                maxWidth: "420px",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Invitations to sign have been securely dispatched to John Doe and Priya Mehta.
            </p>
            <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
              <Link
                href="/my-documents"
                style={{
                  padding: "9px 20px",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Go to My Documents
              </Link>
              <button
                onClick={() => setSentSuccess(false)}
                style={{
                  padding: "9px 20px",
                  backgroundColor: "#f1f5f9",
                  color: "#334155",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Send Another
              </button>
            </div>
          </div>
        ) : (
          /* ================= TWO COLUMN FORM ================= */
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.4fr 1fr",
              gap: "28px",
              alignItems: "start",
            }}
          >
            {/* LEFT COLUMN: Recipients & Message */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "22px",
              }}
            >
              {/* Recipients Block */}
              <div>
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#0f172a",
                    margin: "0 0 12px 0",
                  }}
                >
                  Recipients
                </h3>

                {/* Recipient Rows */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {recipients.map((rec, idx) => (
                    <div
                      key={rec.id}
                      style={{
                        backgroundColor: "#ffffff",
                        borderRadius: "10px",
                        border: "1px solid #eef2f6",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                        padding: "12px 14px",
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
                          fontWeight: 600,
                          color: "#64748b",
                          width: "14px",
                          textAlign: "center",
                        }}
                      >
                        {idx + 1}
                      </span>

                      {/* User Icon Circle */}
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
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

                      {/* Name & Email Inputs */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <input
                          type="text"
                          value={rec.name}
                          placeholder="Recipient Name"
                          onChange={(e) => {
                            const updated = [...recipients];
                            updated[idx].name = e.target.value;
                            setRecipients(updated);
                          }}
                          style={{
                            border: "none",
                            outline: "none",
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#0f172a",
                            width: "100%",
                            padding: 0,
                            margin: 0,
                            backgroundColor: "transparent",
                          }}
                        />
                        <input
                          type="email"
                          value={rec.email}
                          placeholder="recipient@example.com"
                          onChange={(e) => {
                            const updated = [...recipients];
                            updated[idx].email = e.target.value;
                            setRecipients(updated);
                          }}
                          style={{
                            border: "none",
                            outline: "none",
                            fontSize: "11.5px",
                            color: "#64748b",
                            width: "100%",
                            padding: 0,
                            marginTop: "2px",
                            backgroundColor: "transparent",
                          }}
                        />
                      </div>

                      {/* Role Pill Dropdown */}
                      <div style={{ position: "relative" }}>
                        <select
                          value={rec.role}
                          onChange={(e) => {
                            const updated = [...recipients];
                            updated[idx].role = e.target.value as any;
                            setRecipients(updated);
                          }}
                          style={{
                            appearance: "none",
                            backgroundColor: "#ffffff",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            padding: "6px 28px 6px 12px",
                            fontSize: "12px",
                            color: "#334155",
                            fontWeight: 500,
                            cursor: "pointer",
                            outline: "none",
                          }}
                        >
                          <option value="Signer">Signer</option>
                          <option value="CC (View only)">CC (View only)</option>
                        </select>
                        <ChevronDown
                          style={{
                            width: "13px",
                            height: "13px",
                            color: "#64748b",
                            position: "absolute",
                            right: "8px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            pointerEvents: "none",
                          }}
                        />
                      </div>

                      {/* Delete Icon */}
                      <button
                        type="button"
                        onClick={() => removeRecipient(idx)}
                        style={{
                          border: "none",
                          backgroundColor: "transparent",
                          color: "#ef4444",
                          cursor: "pointer",
                          padding: "4px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "4px",
                        }}
                      >
                        <Trash2 style={{ width: "15px", height: "15px" }} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* + Add Recipient */}
                <button
                  type="button"
                  onClick={addRecipient}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    marginTop: "12px",
                    backgroundColor: "transparent",
                    border: "none",
                    color: "#2563eb",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <Plus style={{ width: "14px", height: "14px" }} />
                  <span>Add Recipient</span>
                </button>
              </div>

              {/* Message (optional) Block */}
              <div>
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#0f172a",
                    margin: "0 0 10px 0",
                  }}
                >
                  Message (optional)
                </h3>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12.5px",
                    color: "#334155",
                    lineHeight: "1.5",
                    outline: "none",
                    boxSizing: "border-box",
                    resize: "none",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                  }}
                />
              </div>
            </div>

            {/* RIGHT COLUMN: Signing Settings */}
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "14px",
                border: "1px solid #eef2f6",
                boxShadow: "0 1px 4px rgba(15, 23, 42, 0.03)",
                padding: "22px 24px",
                display: "flex",
                flexDirection: "column",
                gap: "18px",
                boxSizing: "border-box",
              }}
            >
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#0f172a",
                  margin: 0,
                }}
              >
                Signing Settings
              </h3>

              {/* Toggle 1: Require recipients to sign in */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                <span
                  style={{
                    fontSize: "12.5px",
                    fontWeight: 500,
                    color: "#334155",
                  }}
                >
                  Require recipients to sign in
                </span>
                <button
                  type="button"
                  onClick={() => setRequireSignIn(!requireSignIn)}
                  style={{
                    width: "36px",
                    height: "20px",
                    borderRadius: "10px",
                    backgroundColor: requireSignIn ? "#2563eb" : "#cbd5e1",
                    border: "none",
                    cursor: "pointer",
                    position: "relative",
                    transition: "background-color 0.15s ease",
                    padding: "2px",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      backgroundColor: "#ffffff",
                      position: "absolute",
                      top: "2px",
                      left: requireSignIn ? "18px" : "2px",
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
                }}
              >
                <span
                  style={{
                    fontSize: "12.5px",
                    fontWeight: 500,
                    color: "#334155",
                  }}
                >
                  Allow download before signing
                </span>
                <button
                  type="button"
                  onClick={() => setAllowDownload(!allowDownload)}
                  style={{
                    width: "36px",
                    height: "20px",
                    borderRadius: "10px",
                    backgroundColor: allowDownload ? "#2563eb" : "#cbd5e1",
                    border: "none",
                    cursor: "pointer",
                    position: "relative",
                    transition: "background-color 0.15s ease",
                    padding: "2px",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      backgroundColor: "#ffffff",
                      position: "absolute",
                      top: "2px",
                      left: allowDownload ? "18px" : "2px",
                      transition: "left 0.15s ease",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                    }}
                  />
                </button>
              </div>

              {/* Set expiry date */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12.5px",
                    fontWeight: 500,
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
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    backgroundColor: "#ffffff",
                  }}
                >
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    style={{
                      border: "none",
                      outline: "none",
                      fontSize: "12.5px",
                      color: "#1e293b",
                      width: "100%",
                      backgroundColor: "transparent",
                    }}
                  />
                  <Calendar
                    style={{
                      width: "15px",
                      height: "15px",
                      color: "#64748b",
                      flexShrink: 0,
                    }}
                  />
                </div>
              </div>

              {/* Send Document Action Button */}
              <button
                type="button"
                onClick={handleSend}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "11px 20px",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(37,99,235,0.25)",
                  transition: "background-color 0.15s ease",
                  marginTop: "6px",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#1d4ed8")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#2563eb")
                }
              >
                <Send style={{ width: "15px", height: "15px" }} />
                <span>Send Document</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </OrgLayout>
  );
}
