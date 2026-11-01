"use client";

import React from "react";
import { ClientData } from "@/components/clients/ClientModal";

interface QuotationClientSectionProps {
  clients: ClientData[];
  selectedClientId: string;
  onSelectClient: (clientId: string) => void;
  onOpenClientModal: () => void;
  clientName: string;
  onClientNameChange: (val: string) => void;
  clientCompany: string;
  onClientCompanyChange: (val: string) => void;
  clientEmail: string;
  onClientEmailChange: (val: string) => void;
  clientPhone: string;
  onClientPhoneChange: (val: string) => void;
  clientAddress: string;
  onClientAddressChange: (val: string) => void;
  title: string;
  onTitleChange: (val: string) => void;
  issueDate: string;
  onIssueDateChange: (val: string) => void;
  validTill: string;
  onValidTillChange: (val: string) => void;
}

export default function QuotationClientSection({
  clients,
  selectedClientId,
  onSelectClient,
  onOpenClientModal,
  clientName,
  onClientNameChange,
  clientCompany,
  onClientCompanyChange,
  clientEmail,
  onClientEmailChange,
  clientPhone,
  onClientPhoneChange,
  clientAddress,
  onClientAddressChange,
  title,
  onTitleChange,
  issueDate,
  onIssueDateChange,
  validTill,
  onValidTillChange,
}: QuotationClientSectionProps) {
  return (
    <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "22px 24px" }}>
      <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", margin: "0 0 16px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>
        1. Client & Document Details
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
        {/* Client Selection & Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Choose Client / Counterparty</label>
              <button
                type="button"
                onClick={onOpenClientModal}
                style={{ background: "none", border: "none", color: "#2563eb", fontSize: "11.5px", fontWeight: 600, cursor: "pointer" }}
              >
                + New Client
              </button>
            </div>
            <select
              value={selectedClientId}
              onChange={(e) => onSelectClient(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
            >
              <option value="">-- Choose from client directory or enter below --</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.companyName ? `(${c.companyName})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Contact Person *</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => onClientNameChange(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Company / Business Name</label>
              <input
                type="text"
                value={clientCompany}
                onChange={(e) => onClientCompanyChange(e.target.value)}
                placeholder="e.g. VorldX Solutions"
                style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Email Address</label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => onClientEmailChange(e.target.value)}
                placeholder="contact@client.com"
                style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Phone Number</label>
              <input
                type="text"
                value={clientPhone}
                onChange={(e) => onClientPhoneChange(e.target.value)}
                placeholder="+91 98765 43210"
                style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Billing Address</label>
            <input
              type="text"
              value={clientAddress}
              onChange={(e) => onClientAddressChange(e.target.value)}
              placeholder="e.g. 402 Tech Park, Outer Ring Road, Bengaluru"
              style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
            />
          </div>
        </div>

        {/* Quotation Metadata Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", backgroundColor: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Quotation Subject / Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="e.g. Custom SaaS Platform Development"
              style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Issue Date</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => onIssueDateChange(e.target.value)}
                style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Valid Till (Expiry)</label>
              <input
                type="date"
                value={validTill}
                onChange={(e) => onValidTillChange(e.target.value)}
                style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

