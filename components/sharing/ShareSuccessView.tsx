"use client";

import React, { useState } from "react";
import { Check, Link as LinkIcon } from "lucide-react";
import { RecipientEntry } from "@/components/sharing/MultiEmailInput";

interface ShareSuccessViewProps {
  createdShareUrl: string;
  sentCount: number;
  recipients: RecipientEntry[];
  onDone: () => void;
}

export default function ShareSuccessView({
  createdShareUrl,
  sentCount,
  recipients,
  onDone,
}: ShareSuccessViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (createdShareUrl) {
      navigator.clipboard.writeText(createdShareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ padding: "28px 20px", textAlign: "center", overflowY: "auto", flex: 1 }}>
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
          marginBottom: "12px",
          border: "1px solid #bbf7d0",
        }}
      >
        <Check style={{ width: "24px", height: "24px" }} />
      </div>
      <h4 style={{ fontSize: "17px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0" }}>
        Shared Successfully!
      </h4>
      <p style={{ fontSize: "12.5px", color: "#475569", margin: "0 0 16px 0", lineHeight: 1.5 }}>
        Invitation sent to <strong>{sentCount} recipient(s)</strong> via Gmail SMTP:
        <span style={{ display: "block", color: "#64748b", marginTop: "4px", fontFamily: "monospace", fontSize: "11.5px" }}>
          {recipients.map((r) => r.email).join(", ")}
        </span>
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          backgroundColor: "#f8fafc",
          border: "1.5px solid #cbd5e1",
          padding: "8px 10px",
          borderRadius: "10px",
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
            fontSize: "12px",
            color: "#0f172a",
            fontFamily: "monospace",
          }}
        />
        <button
          type="button"
          onClick={handleCopy}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: copied ? "#16a34a" : "#2563eb",
            color: "#ffffff",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          {copied ? <Check style={{ width: "13px", height: "13px" }} /> : <LinkIcon style={{ width: "13px", height: "13px" }} />}
          <span>{copied ? "Copied!" : "Copy Link"}</span>
        </button>
      </div>

      <button
        type="button"
        onClick={onDone}
        style={{
          padding: "9px 24px",
          borderRadius: "9px",
          border: "none",
          backgroundColor: "#0f172a",
          color: "#ffffff",
          fontSize: "12.5px",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Done
      </button>
    </div>
  );
}

