"use client";

import React from "react";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";

export interface ClauseForm {
  title: string;
  content: string;
  sortOrder: number;
}

interface MouClauseListProps {
  clauses: ClauseForm[];
  onAddClause: () => void;
  onRemoveClause: (index: number) => void;
  onMoveClause: (index: number, direction: "up" | "down") => void;
  onClauseChange: (index: number, field: "title" | "content", value: string) => void;
}

export default function MouClauseList({
  clauses,
  onAddClause,
  onRemoveClause,
  onMoveClause,
  onClauseChange,
}: MouClauseListProps) {
  return (
    <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "22px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            2. Structured Sections & Clauses ({clauses.length})
          </h2>
          <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
            Customize, reorder, or add clauses. All sections are formatted in the exported PDF.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddClause}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 14px", backgroundColor: "#eff6ff", color: "#2563eb", borderRadius: "8px", border: "1px solid #bfdbfe", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
        >
          <Plus style={{ width: "14px", height: "14px" }} />
          <span>Add Section</span>
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {clauses.map((clause, idx) => (
          <div
            key={idx}
            style={{ backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <input
                type="text"
                required
                value={clause.title}
                onChange={(e) => onClauseChange(idx, "title", e.target.value)}
                style={{ flex: 1, padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: 700, color: "#0f172a" }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: "4px", marginLeft: "12px" }}>
                <button
                  type="button"
                  onClick={() => onMoveClause(idx, "up")}
                  disabled={idx === 0}
                  title="Move Up"
                  style={{ padding: "4px 6px", background: "none", border: "1px solid #cbd5e1", borderRadius: "4px", color: idx === 0 ? "#cbd5e1" : "#475569", cursor: idx === 0 ? "not-allowed" : "pointer" }}
                >
                  <ChevronUp style={{ width: "14px", height: "14px" }} />
                </button>
                <button
                  type="button"
                  onClick={() => onMoveClause(idx, "down")}
                  disabled={idx === clauses.length - 1}
                  title="Move Down"
                  style={{ padding: "4px 6px", background: "none", border: "1px solid #cbd5e1", borderRadius: "4px", color: idx === clauses.length - 1 ? "#cbd5e1" : "#475569", cursor: idx === clauses.length - 1 ? "not-allowed" : "pointer" }}
                >
                  <ChevronDown style={{ width: "14px", height: "14px" }} />
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveClause(idx)}
                  disabled={clauses.length <= 1}
                  title="Delete Section"
                  style={{ padding: "4px 6px", background: "none", border: "1px solid #fecaca", borderRadius: "4px", color: clauses.length <= 1 ? "#cbd5e1" : "#ef4444", cursor: clauses.length <= 1 ? "not-allowed" : "pointer", marginLeft: "4px" }}
                >
                  <Trash2 style={{ width: "14px", height: "14px" }} />
                </button>
              </div>
            </div>

            <textarea
              rows={3}
              required
              value={clause.content}
              onChange={(e) => onClauseChange(idx, "content", e.target.value)}
              style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12.5px", lineHeight: "1.5", color: "#334155", boxSizing: "border-box" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

