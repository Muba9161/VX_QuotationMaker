"use client";

import React, { useEffect, useCallback } from "react";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "primary";
  isConfirming?: boolean;
}

/**
 * Reusable Confirmation Dialog
 *
 * Replaces native browser window.confirm() / alert() with an accessible,
 * styled application modal featuring loading feedback and click protection.
 */
export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  isConfirming = false,
}: ConfirmModalProps) {
  // Handle ESC key press
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isConfirming) {
        onClose();
      }
    },
    [isConfirming, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const isDanger = variant === "danger";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "rgba(15, 23, 42, 0.55)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isConfirming) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        style={{
          width: "100%",
          maxWidth: "460px",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
          overflow: "hidden",
          animation: "fadeInScale 0.15s ease-out",
          border: "1px solid #e2e8f0",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: "24px 28px" }}>
          {/* Top row: Icon and Close */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: isDanger ? "#fef2f2" : "#eff6ff",
                color: isDanger ? "#dc2626" : "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {isDanger ? (
                <Trash2 style={{ width: "22px", height: "22px" }} />
              ) : (
                <AlertTriangle style={{ width: "22px", height: "22px" }} />
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isConfirming}
              style={{
                background: "none",
                border: "none",
                color: "#94a3b8",
                cursor: isConfirming ? "not-allowed" : "pointer",
                padding: "6px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.12s",
              }}
            >
              <X style={{ width: "18px", height: "18px" }} />
            </button>
          </div>

          {/* Title and Description */}
          <h3
            id="confirm-modal-title"
            style={{
              fontSize: "17px",
              fontWeight: 800,
              color: "#0f172a",
              margin: "0 0 8px 0",
              letterSpacing: "-0.2px",
            }}
          >
            {title}
          </h3>
          <p
            style={{
              fontSize: "13.5px",
              color: "#64748b",
              lineHeight: "1.5",
              margin: 0,
            }}
          >
            {description}
          </p>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: "16px 28px",
            backgroundColor: "#f8fafc",
            borderTop: "1px solid #f1f5f9",
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isConfirming}
            style={{
              padding: "9px 18px",
              fontSize: "13px",
              fontWeight: 600,
              color: "#475569",
              backgroundColor: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              cursor: isConfirming ? "not-allowed" : "pointer",
              transition: "all 0.12s",
            }}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirming}
            style={{
              padding: "9px 20px",
              fontSize: "13px",
              fontWeight: 700,
              color: "#ffffff",
              backgroundColor: isDanger ? "#dc2626" : "#2563eb",
              border: "none",
              borderRadius: "10px",
              cursor: isConfirming ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: isDanger
                ? "0 2px 6px rgba(220, 38, 38, 0.3)"
                : "0 2px 6px rgba(37, 99, 235, 0.3)",
              opacity: isConfirming ? 0.75 : 1,
              transition: "all 0.12s",
            }}
          >
            {isConfirming && (
              <Loader2
                style={{
                  width: "14px",
                  height: "14px",
                  animation: "spin 1s linear infinite",
                }}
              />
            )}
            <span>{isConfirming ? "Processing..." : confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

