"use client";

import React, { useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { SUCCESS_NOTIFICATION_EVENT } from "@/lib/ui/success-notification";

interface SuccessNotification {
  message: string;
}

export default function SuccessPopup() {
  const [notification, setNotification] = useState<SuccessNotification | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleSuccess = (event: Event) => {
      const message = (event as CustomEvent<SuccessNotification>).detail?.message;
      if (!message) return;

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setNotification({ message });
      timeoutRef.current = setTimeout(() => {
        setNotification(null);
        timeoutRef.current = null;
      }, 2400);
    };

    window.addEventListener(SUCCESS_NOTIFICATION_EVENT, handleSuccess);
    return () => {
      window.removeEventListener(SUCCESS_NOTIFICATION_EVENT, handleSuccess);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!notification) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 20000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          width: "fit-content",
          maxWidth: "min(100%, 440px)",
          padding: "18px 22px",
          border: "1px solid #bbf7d0",
          borderRadius: "16px",
          backgroundColor: "#ffffff",
          boxShadow: "0 20px 60px rgba(15, 23, 42, 0.2)",
          color: "#166534",
          fontSize: "15px",
          fontWeight: 650,
          lineHeight: 1.5,
          overflowWrap: "anywhere",
        }}
      >
        <CheckCircle2
          aria-hidden="true"
          style={{ width: "26px", height: "26px", flexShrink: 0, color: "#16a34a" }}
        />
        <span>{notification.message}</span>
      </div>
    </div>
  );
}
