"use client";

import React, { useState, KeyboardEvent, ClipboardEvent } from "react";
import { Plus, X, Mail, Users, AlertCircle } from "lucide-react";

export interface RecipientEntry {
  email: string;
  name?: string;
}

interface MultiEmailInputProps {
  recipients: RecipientEntry[];
  onChange: (recipients: RecipientEntry[]) => void;
  disabled?: boolean;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function MultiEmailInput({
  recipients,
  onChange,
  disabled = false,
}: MultiEmailInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);

  const addEmails = (rawInput: string) => {
    setInputError(null);
    if (!rawInput.trim()) return;

    // Split by comma, semicolon, space, or newline
    const tokens = rawInput
      .split(/[,;\s]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    const validNewRecipients: RecipientEntry[] = [];
    const invalidEmails: string[] = [];

    tokens.forEach((token) => {
      const lower = token.toLowerCase();
      if (!EMAIL_REGEX.test(lower)) {
        invalidEmails.push(token);
        return;
      }
      // Check for duplicates
      const alreadyExists = recipients.some((r) => r.email.toLowerCase() === lower);
      const inCurrentBatch = validNewRecipients.some((r) => r.email === lower);
      if (!alreadyExists && !inCurrentBatch) {
        const localPart = lower.split("@")[0].replace(/[._-]/g, " ");
        const formattedName = localPart.charAt(0).toUpperCase() + localPart.slice(1);
        validNewRecipients.push({ email: lower, name: formattedName });
      }
    });

    if (invalidEmails.length > 0) {
      setInputError(`Invalid email format: ${invalidEmails.slice(0, 2).join(", ")}`);
    }

    if (validNewRecipients.length > 0) {
      onChange([...recipients, ...validNewRecipients]);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
      e.preventDefault();
      addEmails(inputValue);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    addEmails(pasted);
  };

  const removeRecipient = (indexToRemove: number) => {
    onChange(recipients.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <label
          style={{
            fontSize: "12.5px",
            fontWeight: 700,
            color: "#1e293b",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Users style={{ width: "15px", height: "15px", color: "#2563eb" }} />
          <span>Recipient Emails</span>
          <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: recipients.length > 0 ? "#2563eb" : "#64748b",
            backgroundColor: recipients.length > 0 ? "#eff6ff" : "#f1f5f9",
            padding: "2px 8px",
            borderRadius: "6px",
          }}
        >
          {recipients.length} {recipients.length === 1 ? "recipient" : "recipients"} added
        </span>
      </div>

      {/* Recipient Chips Container */}
      <div
        style={{
          minHeight: "72px",
          padding: "8px 10px",
          borderRadius: "10px",
          border: "1.5px solid #cbd5e1",
          backgroundColor: "#ffffff",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          alignContent: "flex-start",
          gap: "6px",
          boxSizing: "border-box",
        }}
      >
        {recipients.map((recipient, idx) => (
          <span
            key={`${recipient.email}-${idx}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              borderRadius: "7px",
              backgroundColor: "#dbeafe",
              border: "1px solid #93c5fd",
              padding: "4px 8px",
              fontSize: "12px",
              fontWeight: 600,
              color: "#1e40af",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            <Mail style={{ width: "12px", height: "12px", color: "#2563eb", flexShrink: 0 }} />
            <span style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={recipient.email}>
              {recipient.email}
            </span>
            {!disabled && (
              <button
                type="button"
                onClick={() => removeRecipient(idx)}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  color: "#3b82f6",
                  display: "flex",
                  alignItems: "center",
                }}
                title="Remove recipient"
              >
                <X style={{ width: "13px", height: "13px" }} />
              </button>
            )}
          </span>
        ))}

        {/* Text Input */}
        <div style={{ flex: 1, minWidth: "220px", display: "flex", alignItems: "center", gap: "6px" }}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setInputError(null);
            }}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onBlur={() => {
              if (inputValue.trim()) addEmails(inputValue);
            }}
            placeholder={
              recipients.length === 0
                ? "Type email(s) & press Enter or comma..."
                : "Add another email..."
            }
            disabled={disabled}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: "13px",
              color: "#0f172a",
              padding: "4px 0",
            }}
          />
          {inputValue.trim() && (
            <button
              type="button"
              onClick={() => addEmails(inputValue)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                borderRadius: "6px",
                backgroundColor: "#2563eb",
                padding: "4px 10px",
                fontSize: "11px",
                fontWeight: 700,
                color: "#ffffff",
                border: "none",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <Plus style={{ width: "12px", height: "12px" }} /> Add
            </button>
          )}
        </div>
      </div>

      {/* Helper text or error */}
      {inputError ? (
        <p style={{ margin: "2px 0 0 0", fontSize: "11.5px", fontWeight: 600, color: "#dc2626", display: "flex", alignItems: "center", gap: "4px" }}>
          <AlertCircle style={{ width: "13px", height: "13px" }} /> {inputError}
        </p>
      ) : (
        <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#64748b" }}>
          Tip: You can paste multiple emails separated by commas, semicolons, or spaces.
        </p>
      )}
    </div>
  );
}
