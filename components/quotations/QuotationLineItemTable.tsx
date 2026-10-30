"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";

export interface LineItemForm {
  name: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  discount: number;
  taxPercent: number;
}

interface QuotationLineItemTableProps {
  items: LineItemForm[];
  calculatedItems: Array<{ lineSub: number; taxable: number }>;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onItemChange: (index: number, field: keyof LineItemForm, value: string | number) => void;
}

export default function QuotationLineItemTable({
  items,
  calculatedItems,
  onAddItem,
  onRemoveItem,
  onItemChange,
}: QuotationLineItemTableProps) {
  return (
    <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "22px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          2. Itemized Pricing Table
        </h2>
        <button
          type="button"
          onClick={onAddItem}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", backgroundColor: "#eff6ff", color: "#2563eb", borderRadius: "8px", border: "1px solid #bfdbfe", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
        >
          <Plus style={{ width: "14px", height: "14px" }} />
          <span>Add Item</span>
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {items.map((item, idx) => {
          const itemCalc = calculatedItems[idx];
          return (
            <div
              key={idx}
              style={{ display: "grid", gridTemplateColumns: "1.5fr 70px 75px 100px 90px 100px 32px", gap: "10px", alignItems: "center", padding: "10px 12px", backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}
            >
              <div>
                <input
                  type="text"
                  required
                  value={item.description}
                  onChange={(e) => onItemChange(idx, "description", e.target.value)}
                  placeholder="Item description / deliverable"
                  style={{ width: "100%", padding: "7px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12.5px", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  required
                  value={item.quantity}
                  onChange={(e) => onItemChange(idx, "quantity", parseFloat(e.target.value) || 0)}
                  placeholder="Qty"
                  style={{ width: "100%", padding: "7px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12.5px", textAlign: "right", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <input
                  type="text"
                  value={item.unit}
                  onChange={(e) => onItemChange(idx, "unit", e.target.value)}
                  placeholder="Unit"
                  style={{ width: "100%", padding: "7px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12.5px", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={item.rate}
                  onChange={(e) => onItemChange(idx, "rate", parseFloat(e.target.value) || 0)}
                  placeholder="Price"
                  style={{ width: "100%", padding: "7px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12.5px", textAlign: "right", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={item.discount}
                  onChange={(e) => onItemChange(idx, "discount", parseFloat(e.target.value) || 0)}
                  placeholder="Disc (₹)"
                  style={{ width: "100%", padding: "7px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12.5px", textAlign: "right", boxSizing: "border-box" }}
                />
              </div>
              <div style={{ textAlign: "right", fontWeight: 700, color: "#0f172a", fontSize: "13px" }}>
                ₹{(itemCalc?.taxable || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
              <div style={{ textAlign: "center" }}>
                <button
                  type="button"
                  onClick={() => onRemoveItem(idx)}
                  disabled={items.length <= 1}
                  style={{ background: "none", border: "none", color: items.length <= 1 ? "#cbd5e1" : "#ef4444", cursor: items.length <= 1 ? "not-allowed" : "pointer", padding: "4px" }}
                >
                  <Trash2 style={{ width: "15px", height: "15px" }} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

