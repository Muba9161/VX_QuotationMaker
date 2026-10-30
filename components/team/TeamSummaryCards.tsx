"use client";

import React from "react";
import { Users, Shield, Edit3, Eye } from "lucide-react";

interface TeamSummaryCardsProps {
  total: number;
  admins: number;
  editors: number;
  viewers: number;
}

export default function TeamSummaryCards({
  total,
  admins,
  editors,
  viewers,
}: TeamSummaryCardsProps) {
  const cards = [
    {
      title: "Total Members",
      count: total,
      icon: Users,
      bg: "#eff6ff",
      color: "#2563eb",
    },
    {
      title: "Organization Admin",
      count: admins,
      icon: Shield,
      bg: "#ecfdf5",
      color: "#059669",
    },
    {
      title: "Editors",
      count: editors,
      icon: Edit3,
      bg: "#f5f3ff",
      color: "#7c3aed",
    },
    {
      title: "Viewers",
      count: viewers,
      icon: Eye,
      bg: "#fffbeb",
      color: "#d97706",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "16px",
        width: "100%",
      }}
    >
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                backgroundColor: card.bg,
                color: card.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon style={{ width: "22px", height: "22px" }} />
            </div>
            <div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: 1.1,
                }}
              >
                {card.count}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  fontWeight: 600,
                  marginTop: "3px",
                }}
              >
                {card.title}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
