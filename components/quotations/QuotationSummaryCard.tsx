"use client";

import React from "react";

interface QuotationSummaryCardProps {
  subtotal: number;
  totalDiscount: number;
  taxableAmount?: number;
  calculatedTax: number;
  grandTotal: number;
  discountType: "none" | "percentage" | "fixed";
  discountValue: number;
  taxRate: number;
  onDiscountTypeChange: (val: "none" | "percentage" | "fixed") => void;
  onDiscountValueChange: (val: number) => void;
  onTaxRateChange: (val: number) => void;
}

export default function QuotationSummaryCard({
  subtotal,
  totalDiscount,
  taxableAmount,
  calculatedTax,
  grandTotal,
  discountType,
  discountValue,
  taxRate,
  onDiscountTypeChange,
  onDiscountValueChange,
  onTaxRateChange,
}: QuotationSummaryCardProps) {
  const effectiveTaxable = typeof taxableAmount === "number"
    ? taxableAmount
    : Math.max(0, subtotal - totalDiscount);

  const handleDiscountChange = (val: number) => {
    if (isNaN(val) || val < 0) {
      onDiscountValueChange(0);
      return;
    }
    if (discountType === "percentage") {
      onDiscountValueChange(Math.min(100, Math.max(0, val)));
    } else if (discountType === "fixed") {
      onDiscountValueChange(Math.min(subtotal, Math.max(0, val)));
    } else {
      onDiscountValueChange(0);
    }
  };

  const handleTaxChange = (val: number) => {
    if (isNaN(val) || val < 0) {
      onTaxRateChange(0);
      return;
    }
    onTaxRateChange(Math.min(100, Math.max(0, val)));
  };
  return (
    <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
      <div style={{ width: "320px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", color: "#475569" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Subtotal:</span>
          <span style={{ fontWeight: 600, color: "#0f172a" }}>₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
        </div>

        {/* Overall Discount Controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
          <span>Discount:</span>
          <div style={{ display: "flex", gap: "4px" }}>
            <select
              value={discountType}
              onChange={(e) => onDiscountTypeChange(e.target.value as "none" | "percentage" | "fixed")}
              style={{ padding: "4px 6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "11.5px" }}
            >
              <option value="none">None</option>
              <option value="percentage">%</option>
              <option value="fixed">Fixed ₹</option>
            </select>
            {discountType !== "none" && (
              <input
                type="number"
                min="0"
                value={discountValue}
                onChange={(e) => handleDiscountChange(parseFloat(e.target.value) || 0)}
                style={{ width: "65px", padding: "4px 6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "11.5px", textAlign: "right" }}
              />
            )}
          </div>
        </div>

        {totalDiscount > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", color: "#dc2626" }}>
            <span>Total Discount:</span>
            <span>- ₹{totalDiscount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>
        )}

        {/* Taxable Amount */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Taxable Amount:</span>
          <span style={{ fontWeight: 600, color: "#0f172a" }}>₹{effectiveTaxable.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Tax Rate:</span>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <input
              type="number"
              min="0"
              max="100"
              value={taxRate}
              onChange={(e) => handleTaxChange(parseFloat(e.target.value) || 0)}
              style={{ width: "50px", padding: "4px 6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "11.5px", textAlign: "right" }}
            />
            <span>%</span>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Tax Amount:</span>
          <span>₹{calculatedTax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "2px solid #0f172a", fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>
          <span>Grand Total:</span>
          <span>₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>
  );
}

