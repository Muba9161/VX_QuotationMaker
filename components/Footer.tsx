"use client";

import React from "react";

interface FooterProps {
  organizationName?: string;
}

/**
 * Shared Application Footer
 *
 * Exclusively displays the platform attribution: "Powered by VorldX"
 * along with the authenticated organization's legal/registered identity.
 */
export default function Footer({ organizationName }: FooterProps) {
  return (
    <footer
      style={{
        width: "100%",
        padding: "16px 36px",
        borderTop: "1px solid #e2e8f0",
        backgroundColor: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "8px",
        fontSize: "12px",
        color: "#94a3b8",
        fontWeight: 500,
        boxSizing: "border-box",
      }}
    >
      <div>
        {organizationName && (
          <span style={{ fontWeight: 600, color: "#64748b" }}>
            {organizationName}
          </span>
        )}
      </div>
      <div style={{ fontSize: "11.5px", color: "#94a3b8" }}>
        Powered by VorldX
      </div>
    </footer>
  );
}

