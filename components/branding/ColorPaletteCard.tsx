"use client";

import React from "react";
import { Palette } from "lucide-react";

interface ColorPaletteCardProps {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  onChange: (field: "primaryColor" | "secondaryColor" | "accentColor", value: string) => void;
}

const PRESET_PALETTES = [
  { name: "Corporate Blue", primary: "#2563EB", secondary: "#10B981", accent: "#06B6D4" },
  { name: "Modern Emerald", primary: "#059669", secondary: "#3B82F6", accent: "#10B981" },
  { name: "Executive Slate", primary: "#1E293B", secondary: "#475569", accent: "#B45309" },
  { name: "Creative Violet", primary: "#7C3AED", secondary: "#EC4899", accent: "#F59E0B" },
];

export default function ColorPaletteCard({
  primaryColor,
  secondaryColor,
  accentColor,
  onChange,
}: ColorPaletteCardProps) {
  const applyPreset = (preset: typeof PRESET_PALETTES[0]) => {
    onChange("primaryColor", preset.primary);
    onChange("secondaryColor", preset.secondary);
    onChange("accentColor", preset.accent);
  };

  const textInputStyle: React.CSSProperties = {
    width: "115px",
    height: "38px",
    borderRadius: "8px",
    border: "1.5px solid #cbd5e1",
    backgroundColor: "#ffffff",
    padding: "0 10px",
    fontSize: "12.5px",
    fontFamily: "monospace",
    textTransform: "uppercase",
    color: "#0f172a",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        backgroundColor: "#ffffff",
        padding: "24px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        display: "flex",
        flexDirection: "column",
        gap: "18px",
      }}
    >
      <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
            <Palette style={{ width: "16px", height: "16px", color: "#2563eb" }} /> Brand Color Palette
          </h3>
          <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
            Colors applied across document headers, table titles, highlights, and signing UI
          </p>
        </div>
      </div>

      {/* Preset Palettes */}
      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "8px" }}>
          Preset Themes
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
          {PRESET_PALETTES.map((preset) => {
            const isSelected =
              primaryColor.toLowerCase() === preset.primary.toLowerCase() &&
              secondaryColor.toLowerCase() === preset.secondary.toLowerCase();
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  borderRadius: "10px",
                  padding: "8px 12px",
                  border: isSelected ? "2px solid #2563eb" : "1.5px solid #e2e8f0",
                  backgroundColor: isSelected ? "#eff6ff" : "#ffffff",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  textAlign: "left",
                }}
              >
                <div style={{ display: "flex", marginLeft: "4px" }}>
                  <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: "2px solid #ffffff", backgroundColor: preset.primary, marginLeft: "-4px" }} />
                  <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: "2px solid #ffffff", backgroundColor: preset.secondary, marginLeft: "-4px" }} />
                  <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: "2px solid #ffffff", backgroundColor: preset.accent, marginLeft: "-4px" }} />
                </div>
                <span style={{ fontSize: "12px", fontWeight: isSelected ? 800 : 600, color: isSelected ? "#1e40af" : "#334155" }}>
                  {preset.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Individual Custom Pickers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
        {/* Primary Color */}
        <div style={{ padding: "12px", borderRadius: "10px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155" }}>
              Primary Color
            </label>
            <span style={{ fontSize: "10px", color: "#64748b", fontWeight: 600 }}>Headers & Totals</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => onChange("primaryColor", e.target.value)}
              style={{ width: "38px", height: "38px", borderRadius: "8px", border: "1.5px solid #cbd5e1", padding: "2px", cursor: "pointer", backgroundColor: "#ffffff", flexShrink: 0 }}
            />
            <input
              type="text"
              value={primaryColor}
              onChange={(e) => onChange("primaryColor", e.target.value)}
              style={textInputStyle}
            />
          </div>
        </div>

        {/* Secondary Color */}
        <div style={{ padding: "12px", borderRadius: "10px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155" }}>
              Secondary Color
            </label>
            <span style={{ fontSize: "10px", color: "#64748b", fontWeight: 600 }}>Badges & Sections</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="color"
              value={secondaryColor}
              onChange={(e) => onChange("secondaryColor", e.target.value)}
              style={{ width: "38px", height: "38px", borderRadius: "8px", border: "1.5px solid #cbd5e1", padding: "2px", cursor: "pointer", backgroundColor: "#ffffff", flexShrink: 0 }}
            />
            <input
              type="text"
              value={secondaryColor}
              onChange={(e) => onChange("secondaryColor", e.target.value)}
              style={textInputStyle}
            />
          </div>
        </div>

        {/* Accent Color */}
        <div style={{ padding: "12px", borderRadius: "10px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155" }}>
              Accent Color
            </label>
            <span style={{ fontSize: "10px", color: "#64748b", fontWeight: 600 }}>Borders & Highlights</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="color"
              value={accentColor}
              onChange={(e) => onChange("accentColor", e.target.value)}
              style={{ width: "38px", height: "38px", borderRadius: "8px", border: "1.5px solid #cbd5e1", padding: "2px", cursor: "pointer", backgroundColor: "#ffffff", flexShrink: 0 }}
            />
            <input
              type="text"
              value={accentColor}
              onChange={(e) => onChange("accentColor", e.target.value)}
              style={textInputStyle}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
