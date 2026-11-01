"use client";

import React from "react";

interface QuotationTermsSectionProps {
  paymentTerms: string;
  onPaymentTermsChange: (val: string) => void;
  deliveryTerms: string;
  onDeliveryTermsChange: (val: string) => void;
  notes: string;
  onNotesChange: (val: string) => void;
}

export default function QuotationTermsSection({
  paymentTerms,
  onPaymentTermsChange,
  deliveryTerms,
  onDeliveryTermsChange,
  notes,
  onNotesChange,
}: QuotationTermsSectionProps) {
  return (
    <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "22px 24px" }}>
      <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", margin: "0 0 16px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>
        3. Commercial Terms & Notes
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div>
          <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Payment Terms</label>
          <input
            type="text"
            value={paymentTerms}
            onChange={(e) => onPaymentTermsChange(e.target.value)}
            style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
          />
        </div>
        <div>
          <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Delivery / SLA Terms</label>
          <input
            type="text"
            value={deliveryTerms}
            onChange={(e) => onDeliveryTermsChange(e.target.value)}
            style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
          />
        </div>
      </div>

      <div style={{ marginTop: "14px" }}>
        <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Notes & Commercial Remarks</label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
        />
      </div>
    </div>
  );
}

