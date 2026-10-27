"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { saveSubscriptionPlan, SubscriptionPlan } from "@/lib/adminStorage";

export default function AddNewPlanPage() {
  const router = useRouter();
  const [name, setName] = useState("Basic");
  const [priceMonthly, setPriceMonthly] = useState<number>(0);
  const [isFree, setIsFree] = useState(true);
  const [maxUsers, setMaxUsers] = useState<number>(5);
  const [maxDocuments, setMaxDocuments] = useState<number>(200);
  const [storage, setStorage] = useState("1 GB");
  const [features, setFeatures] = useState("Basic document creation, Email support");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPlan: SubscriptionPlan = {
      id: "plan-" + Date.now(),
      name,
      priceMonthly: isFree ? 0 : Number(priceMonthly),
      isFree,
      maxUsers: Number(maxUsers),
      maxDocuments: Number(maxDocuments),
      storage,
      features: features.split(",").map((f) => f.trim()),
      status,
    };
    saveSubscriptionPlan(newPlan);
    router.push("/admin/subscription-plans");
  };

  return (
    <AdminLayout activePath="/admin/subscription-plans">
      <div
        style={{
          width: "100%",
          maxWidth: "880px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          boxSizing: "border-box",
        }}
      >
        {/* ================= TOP BAR ================= */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          {/* Left: Back + Title */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link
              href="/admin/subscription-plans"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                fontWeight: "700",
                color: "#2563eb",
                textDecoration: "none",
              }}
            >
              <ArrowLeft style={{ width: "16px", height: "16px" }} />
              <span>Back</span>
            </Link>

            <h1
              style={{
                fontSize: "24px",
                fontWeight: "900",
                color: "#0f172a",
                letterSpacing: "-0.5px",
                margin: 0,
              }}
            >
              Add New Plan
            </h1>
          </div>

          {/* Right: Save Plan Button */}
          <button
            onClick={handleSubmit}
            style={{
              padding: "10px 22px",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              fontSize: "13.5px",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
              transition: "background 0.15s ease",
            }}
          >
            Save Plan
          </button>
        </div>

        {/* ================= FORM BODY ================= */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            padding: "32px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            boxSizing: "border-box",
          }}
        >
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
            {/* 1. Plan Name */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#334155",
                  marginBottom: "8px",
                }}
              >
                Plan Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: "100%",
                  height: "44px",
                  padding: "0 14px",
                  backgroundColor: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "10px",
                  fontSize: "13.5px",
                  color: "#0f172a",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* 2. Price (₹ per month) & Free Plan Toggle */}
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "20px", alignItems: "flex-end" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#334155",
                    marginBottom: "8px",
                  }}
                >
                  Price (₹ per month)
                </label>
                <input
                  type="number"
                  disabled={isFree}
                  value={isFree ? 0 : priceMonthly}
                  onChange={(e) => setPriceMonthly(Number(e.target.value))}
                  style={{
                    width: "100%",
                    height: "44px",
                    padding: "0 14px",
                    backgroundColor: isFree ? "#f8fafc" : "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: "10px",
                    fontSize: "13.5px",
                    color: isFree ? "#94a3b8" : "#0f172a",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Toggle Switch */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingBottom: "10px" }}>
                <div
                  onClick={() => {
                    const next = !isFree;
                    setIsFree(next);
                    if (next) setPriceMonthly(0);
                  }}
                  style={{
                    width: "44px",
                    height: "24px",
                    backgroundColor: isFree ? "#2563eb" : "#cbd5e1",
                    borderRadius: "9999px",
                    padding: "2px",
                    cursor: "pointer",
                    transition: "background-color 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      backgroundColor: "#ffffff",
                      borderRadius: "50%",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                      transform: isFree ? "translateX(20px)" : "translateX(0px)",
                      transition: "transform 0.2s ease",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#334155",
                    userSelect: "none",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    const next = !isFree;
                    setIsFree(next);
                    if (next) setPriceMonthly(0);
                  }}
                >
                  Free Plan
                </span>
              </div>
            </div>

            {/* 3. Max Users & Max Documents (Side by Side) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#334155",
                    marginBottom: "8px",
                  }}
                >
                  Max Users
                </label>
                <input
                  type="number"
                  required
                  value={maxUsers}
                  onChange={(e) => setMaxUsers(Number(e.target.value))}
                  style={{
                    width: "100%",
                    height: "44px",
                    padding: "0 14px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: "10px",
                    fontSize: "13.5px",
                    color: "#0f172a",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#334155",
                    marginBottom: "8px",
                  }}
                >
                  Max Documents
                </label>
                <input
                  type="number"
                  required
                  value={maxDocuments}
                  onChange={(e) => setMaxDocuments(Number(e.target.value))}
                  style={{
                    width: "100%",
                    height: "44px",
                    padding: "0 14px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: "10px",
                    fontSize: "13.5px",
                    color: "#0f172a",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            {/* 4. Storage Limit Dropdown */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#334155",
                  marginBottom: "8px",
                }}
              >
                Storage Limit
              </label>
              <div style={{ position: "relative" }}>
                <select
                  value={storage}
                  onChange={(e) => setStorage(e.target.value)}
                  style={{
                    width: "100%",
                    height: "44px",
                    padding: "0 36px 0 14px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: "10px",
                    fontSize: "13.5px",
                    color: "#0f172a",
                    outline: "none",
                    cursor: "pointer",
                    appearance: "none",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="1 GB">1 GB</option>
                  <option value="5 GB">5 GB</option>
                  <option value="10 GB">10 GB</option>
                  <option value="50 GB">50 GB</option>
                  <option value="Unlimited">Unlimited</option>
                </select>
                <ChevronDown
                  style={{
                    width: "16px",
                    height: "16px",
                    color: "#94a3b8",
                    position: "absolute",
                    right: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>

            {/* 5. Features (comma separated) */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#334155",
                  marginBottom: "8px",
                }}
              >
                Features (comma separated)
              </label>
              <textarea
                rows={3}
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  backgroundColor: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "10px",
                  fontSize: "13.5px",
                  color: "#0f172a",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  resize: "vertical",
                }}
              />
            </div>

            {/* 6. Status Dropdown */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#334155",
                  marginBottom: "8px",
                }}
              >
                Status
              </label>
              <div style={{ position: "relative" }}>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  style={{
                    width: "100%",
                    height: "44px",
                    padding: "0 36px 0 14px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: "10px",
                    fontSize: "13.5px",
                    color: "#0f172a",
                    outline: "none",
                    cursor: "pointer",
                    appearance: "none",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <ChevronDown
                  style={{
                    width: "16px",
                    height: "16px",
                    color: "#94a3b8",
                    position: "absolute",
                    right: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
