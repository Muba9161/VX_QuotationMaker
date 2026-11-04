"use client";

import React from "react";
import { Search, X, Building2, Layers } from "lucide-react";

interface CategoryCounts {
  all: number;
  quotation: number;
  mou: number;
  letterhead: number;
}

interface TemplateCategoryTabsProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedScope: "all" | "org";
  onSelectScope: (scope: "all" | "org") => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  counts: CategoryCounts;
}

export default function TemplateCategoryTabs({
  selectedCategory,
  onSelectCategory,
  selectedScope,
  onSelectScope,
  searchQuery,
  onSearchChange,
  counts,
}: TemplateCategoryTabsProps) {
  const categories = [
    { id: "ALL", label: "All Templates", count: counts.all },
    { id: "QUOTATION", label: "Quotations", count: counts.quotation },
    { id: "MOU", label: "MOUs & Agreements", count: counts.mou },
    { id: "LETTERHEAD", label: "Letterheads", count: counts.letterhead },
  ];

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "14px",
        border: "1px solid #e2e8f0",
        padding: "12px 16px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        boxSizing: "border-box",
      }}
    >
      {/* 1. Top Compact Search Bar */}
      <div style={{ position: "relative", width: "100%" }}>
        <Search
          style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "15px",
            height: "15px",
            color: "#64748b",
            pointerEvents: "none",
          }}
        />
        <input
          type="text"
          placeholder="Search templates by title, style, tag or description..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: "100%",
            height: "38px",
            padding: "0 36px 0 38px",
            borderRadius: "9px",
            border: "1.5px solid #cbd5e1",
            backgroundColor: "#ffffff",
            fontSize: "12.5px",
            color: "#0f172a",
            outline: "none",
            boxSizing: "border-box",
            transition: "all 0.15s ease",
          }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              padding: "2px",
            }}
            title="Clear search"
          >
            <X style={{ width: "15px", height: "15px" }} />
          </button>
        )}
      </div>

      {/* 2. Compact Filter Row: Category Tabs (Left) & Source Switcher (Right) */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
        }}
      >
        {/* Category Pills */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", overflowX: "auto", paddingBottom: "1px" }}>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  height: "32px",
                  padding: "0 12px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: isActive ? "none" : "1px solid #e2e8f0",
                  backgroundColor: isActive ? "#2563eb" : "#f8fafc",
                  color: isActive ? "#ffffff" : "#475569",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                }}
              >
                <span>{cat.label}</span>
                <span
                  style={{
                    borderRadius: "9999px",
                    padding: "1px 6px",
                    fontSize: "9.5px",
                    fontWeight: 800,
                    backgroundColor: isActive ? "rgba(255,255,255,0.25)" : "#e2e8f0",
                    color: isActive ? "#ffffff" : "#64748b",
                  }}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Source Toggle: All | My Organization */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            borderRadius: "8px",
            backgroundColor: "#f1f5f9",
            padding: "2.5px",
            border: "1px solid #e2e8f0",
          }}
        >
          <button
            type="button"
            onClick={() => onSelectScope("all")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "5px 10px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: selectedScope === "all" ? "#ffffff" : "transparent",
              color: selectedScope === "all" ? "#0f172a" : "#64748b",
              fontSize: "11.5px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: selectedScope === "all" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
            }}
          >
            <Layers style={{ width: "12px", height: "12px" }} />
            All
          </button>
          <button
            type="button"
            onClick={() => onSelectScope("org")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "5px 10px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: selectedScope === "org" ? "#ffffff" : "transparent",
              color: selectedScope === "org" ? "#059669" : "#64748b",
              fontSize: "11.5px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: selectedScope === "org" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
            }}
          >
            <Building2 style={{ width: "12px", height: "12px", color: "#10b981" }} />
            My Organization
          </button>
        </div>
      </div>
    </div>
  );
}
