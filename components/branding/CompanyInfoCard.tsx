"use client";

import React from "react";
import { Building2, Globe, Mail, Phone, MapPin, UserCheck } from "lucide-react";

interface CompanyInfoCardProps {
  name: string;
  tagline: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  signatoryName: string;
  signatoryTitle: string;
  onChange: (field: string, value: string) => void;
}

export default function CompanyInfoCard({
  name,
  tagline,
  website,
  email,
  phone,
  address,
  signatoryName,
  signatoryTitle,
  onChange,
}: CompanyInfoCardProps) {
  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: "40px",
    borderRadius: "10px",
    border: "1.5px solid #cbd5e1",
    backgroundColor: "#ffffff",
    padding: "0 14px",
    fontSize: "13px",
    color: "#0f172a",
    outline: "none",
    boxSizing: "border-box",
  };

  const inputWithIconStyle: React.CSSProperties = {
    ...inputStyle,
    paddingLeft: "38px",
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
        gap: "20px",
      }}
    >
      <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
            <Building2 style={{ width: "16px", height: "16px", color: "#2563eb" }} /> Organization & Legal Information
          </h3>
          <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
            Company credentials appearing on quotations, contracts, headers and signing blocks
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
        {/* Legal Name */}
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
            Company Legal Name <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="e.g. Acme Innovations Pvt. Ltd."
            style={inputStyle}
            required
          />
        </div>

        {/* Tagline */}
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
            Tagline / Motto
          </label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => onChange("tagline", e.target.value)}
            placeholder="e.g. Enterprise Cloud & Software Solutions"
            style={inputStyle}
          />
        </div>

        {/* Website */}
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
            Official Website
          </label>
          <div style={{ position: "relative" }}>
            <Globe style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#94a3b8" }} />
            <input
              type="text"
              value={website}
              onChange={(e) => onChange("website", e.target.value)}
              placeholder="https://example.com"
              style={inputWithIconStyle}
            />
          </div>
        </div>

        {/* Official Email */}
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
            Official Email
          </label>
          <div style={{ position: "relative" }}>
            <Mail style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#94a3b8" }} />
            <input
              type="email"
              value={email}
              onChange={(e) => onChange("email", e.target.value)}
              placeholder="contact@example.com"
              style={inputWithIconStyle}
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
            Official Contact Phone
          </label>
          <div style={{ position: "relative" }}>
            <Phone style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#94a3b8" }} />
            <input
              type="text"
              value={phone}
              onChange={(e) => onChange("phone", e.target.value)}
              placeholder="+91 9876543210"
              style={inputWithIconStyle}
            />
          </div>
        </div>

        {/* Registered Address */}
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
            Registered Address
          </label>
          <div style={{ position: "relative" }}>
            <MapPin style={{ position: "absolute", left: "12px", top: "12px", width: "16px", height: "16px", color: "#94a3b8" }} />
            <textarea
              value={address}
              onChange={(e) => onChange("address", e.target.value)}
              placeholder="Full registered office address, building, city, pin code..."
              rows={3}
              style={{
                width: "100%",
                padding: "10px 14px 10px 38px",
                borderRadius: "10px",
                border: "1.5px solid #cbd5e1",
                backgroundColor: "#ffffff",
                fontSize: "13px",
                color: "#0f172a",
                outline: "none",
                resize: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>
      </div>

      {/* Authorized Signatory Block */}
      <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "18px" }}>
        <h4 style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "6px", margin: "0 0 12px 0" }}>
          <UserCheck style={{ width: "16px", height: "16px", color: "#059669" }} /> Authorized Signatory Baseline
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
              Default Signatory Name
            </label>
            <input
              type="text"
              value={signatoryName}
              onChange={(e) => onChange("signatoryName", e.target.value)}
              placeholder="e.g. Rajesh Sharma"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
              Signatory Title / Designation
            </label>
            <input
              type="text"
              value={signatoryTitle}
              onChange={(e) => onChange("signatoryTitle", e.target.value)}
              placeholder="e.g. Managing Director & CEO"
              style={inputStyle}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
