"use client";
import React, { useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";
import { Plus, MoreVertical, X, Check, Edit2, Trash2, Power } from "lucide-react";
import { getSubscriptionPlans, saveSubscriptionPlan, SubscriptionPlan } from "@/lib/adminStorage";

export default function AdminSubscriptionPlansPage() {
  const defaultPlans: SubscriptionPlan[] = [
    { id: 'plan-basic', name: 'Basic', priceMonthly: 0, isFree: true, maxUsers: 5, maxDocuments: 200, storage: '1 GB', status: 'Active', features: ['Basic document creation', 'Email support'] },
    { id: 'plan-pro', name: 'Pro', priceMonthly: 2999, isFree: false, maxUsers: 50, maxDocuments: 5000, storage: '10 GB', status: 'Active', features: ['Unlimited letterheads', 'Audit certificate', 'Priority support'] },
    { id: 'plan-enterprise', name: 'Enterprise', priceMonthly: 8999, isFree: false, maxUsers: 200, maxDocuments: 999999, storage: '50 GB', status: 'Active', features: ['Dedicated manager', 'Custom domain', 'SLA 99.9%'] },
  ];

  const [plans, setPlans] = useState<SubscriptionPlan[]>(() => {
    const loaded = getSubscriptionPlans();
    if (loaded && loaded.length > 0) {
      return loaded.map(p => {
        if (p.name === 'Pro' && p.priceMonthly !== 2999) return { ...p, priceMonthly: 2999 };
        if (p.name === 'Enterprise' && p.priceMonthly !== 8999) return { ...p, priceMonthly: 8999 };
        return p;
      });
    }
    return defaultPlans;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    priceMonthly: 0,
    isFree: false,
    maxUsers: 5,
    maxDocuments: 200,
    storage: "1 GB",
    features: "Basic document creation, Email support",
    status: "Active" as "Active" | "Inactive",
  });

  const handleOpenModal = (plan?: SubscriptionPlan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        priceMonthly: plan.priceMonthly,
        isFree: plan.isFree,
        maxUsers: plan.maxUsers,
        maxDocuments: plan.maxDocuments,
        storage: plan.storage,
        features: plan.features.join(", "),
        status: plan.status,
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: "",
        priceMonthly: 2999,
        isFree: false,
        maxUsers: 50,
        maxDocuments: 5000,
        storage: "10 GB",
        features: "Custom Letterhead, PDF Downloads, Priority Support",
        status: "Active",
      });
    }
    setActiveMenuId(null);
    setIsModalOpen(true);
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const newPlan: SubscriptionPlan = {
      id: editingPlan ? editingPlan.id : "plan-" + Date.now(),
      name: formData.name,
      priceMonthly: formData.isFree ? 0 : Number(formData.priceMonthly),
      isFree: formData.isFree,
      maxUsers: Number(formData.maxUsers),
      maxDocuments: Number(formData.maxDocuments),
      storage: formData.storage,
      features: formData.features.split(",").map((f) => f.trim()),
      status: formData.status,
    };
    saveSubscriptionPlan(newPlan);
    setPlans(getSubscriptionPlans());
    setIsModalOpen(false);
  };

  const toggleStatus = (id: string) => {
    const plan = plans.find((p) => p.id === id);
    if (!plan) return;
    const updated = {
      ...plan,
      status: plan.status === "Active" ? "Inactive" : "Active",
    } as SubscriptionPlan;
    saveSubscriptionPlan(updated);
    setPlans(getSubscriptionPlans());
    setActiveMenuId(null);
  };

  return (
    <AdminLayout activePath="/admin/subscription-plans">
      <div
        style={{
          width: "100%",
          maxWidth: "1400px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          boxSizing: "border-box",
        }}
      >
        {/* ================= PAGE HEADER ================= */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "26px",
                fontWeight: "900",
                color: "#0f172a",
                letterSpacing: "-0.5px",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Subscription Plans
            </h1>
            <p
              style={{
                fontSize: "13px",
                color: "#64748b",
                margin: "4px 0 0 0",
                fontWeight: "400",
              }}
            >
              Create and manage subscription plans for organizations
            </p>
          </div>

          <Link
            href="/admin/subscription-plans/new"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
              textDecoration: "none",
              transition: "background 0.15s ease",
            }}
          >
            <Plus style={{ width: "16px", height: "16px" }} />
            <span>Add Plan</span>
          </Link>
        </div>

        {/* ================= PLANS TABLE ================= */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#f8fafc",
                    borderBottom: "1px solid #f1f5f9",
                    color: "#64748b",
                    fontSize: "11px",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  <th style={{ padding: "14px 24px", width: "40px" }}>#</th>
                  <th style={{ padding: "14px 24px" }}>Plan Name</th>
                  <th style={{ padding: "14px 24px" }}>Price (Monthly)</th>
                  <th style={{ padding: "14px 24px" }}>Max Users</th>
                  <th style={{ padding: "14px 24px" }}>Max Documents</th>
                  <th style={{ padding: "14px 24px" }}>Storage</th>
                  <th style={{ padding: "14px 24px" }}>Status</th>
                  <th style={{ padding: "14px 24px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p, index) => (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom:
                        index !== plans.length - 1 ? "1px solid #f1f5f9" : "none",
                      transition: "background 0.15s ease",
                    }}
                  >
                    {/* Index */}
                    <td style={{ padding: "16px 24px", color: "#94a3b8", fontWeight: "600" }}>
                      {index + 1}
                    </td>

                    {/* Plan Name */}
                    <td style={{ padding: "16px 24px", fontWeight: "800", color: "#0f172a" }}>
                      {p.name}
                    </td>

                    {/* Price Monthly */}
                    <td style={{ padding: "16px 24px", fontWeight: "600", color: "#334155" }}>
                      {p.isFree || p.priceMonthly === 0 ? "₹0" : `₹${p.priceMonthly.toLocaleString("en-IN")}`}
                    </td>

                    {/* Max Users */}
                    <td style={{ padding: "16px 24px", color: "#475569", fontWeight: "600" }}>
                      {p.maxUsers}
                    </td>

                    {/* Max Documents */}
                    <td style={{ padding: "16px 24px", color: "#475569", fontWeight: "600" }}>
                      {p.maxDocuments > 100000 ? "Unlimited" : p.maxDocuments}
                    </td>

                    {/* Storage */}
                    <td style={{ padding: "16px 24px", color: "#475569", fontWeight: "600" }}>
                      {p.storage}
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: "16px 24px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 12px",
                          borderRadius: "9999px",
                          fontSize: "11px",
                          fontWeight: "700",
                          backgroundColor:
                            p.status === "Active" ? "#dcfce7" : "#fee2e2",
                          color:
                            p.status === "Active" ? "#15803d" : "#dc2626",
                          border: `1px solid ${
                            p.status === "Active" ? "#bbf7d0" : "#fecaca"
                          }`,
                        }}
                      >
                        {p.status}
                      </span>
                    </td>

                    {/* Actions ⋮ */}
                    <td style={{ padding: "16px 24px", textAlign: "right", position: "relative" }}>
                      <button
                        onClick={() =>
                          setActiveMenuId(activeMenuId === p.id ? null : p.id)
                        }
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          padding: "6px",
                          color: "#94a3b8",
                          borderRadius: "6px",
                        }}
                      >
                        <MoreVertical style={{ width: "16px", height: "16px" }} />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === p.id && (
                        <div
                          style={{
                            position: "absolute",
                            right: "24px",
                            top: "45px",
                            width: "150px",
                            backgroundColor: "#ffffff",
                            borderRadius: "10px",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                            zIndex: 40,
                            padding: "6px 0",
                            textAlign: "left",
                          }}
                        >
                          <Link
                            href={`/admin/subscription-plans/new?id=${p.id}`}
                            style={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "8px 14px",
                              fontSize: "12px",
                              fontWeight: "600",
                              color: "#334155",
                              background: "none",
                              textDecoration: "none",
                              boxSizing: "border-box",
                            }}
                          >
                            <Edit2 style={{ width: "13px", height: "13px", color: "#2563eb" }} />
                            <span>Edit Plan</span>
                          </Link>
                          <button
                            onClick={() => toggleStatus(p.id)}
                            style={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "8px 14px",
                              fontSize: "12px",
                              fontWeight: "600",
                              color: p.status === "Active" ? "#dc2626" : "#16a34a",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            <Power style={{ width: "13px", height: "13px" }} />
                            <span>{p.status === "Active" ? "Set Inactive" : "Set Active"}</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= MODAL: ADD / EDIT PLAN ================= */}
        {isModalOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(15, 23, 42, 0.4)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 50,
              padding: "16px",
            }}
          >
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "18px",
                width: "100%",
                maxWidth: "480px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                padding: "24px",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                    {editingPlan ? "Edit Subscription Plan" : "Add New Plan"}
                  </h3>
                  <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
                    Configure pricing and resource limits
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#94a3b8",
                  }}
                >
                  <X style={{ width: "20px", height: "20px" }} />
                </button>
              </div>

              <form onSubmit={handleSavePlan} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                    Plan Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Basic, Pro, Enterprise"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: "100%",
                      height: "42px",
                      padding: "0 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "10px",
                      fontSize: "13px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                      Price (₹ per month)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.priceMonthly}
                      onChange={(e) => setFormData({ ...formData, priceMonthly: Number(e.target.value) })}
                      style={{
                        width: "100%",
                        height: "42px",
                        padding: "0 12px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "10px",
                        fontSize: "13px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                      Max Users
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.maxUsers}
                      onChange={(e) => setFormData({ ...formData, maxUsers: Number(e.target.value) })}
                      style={{
                        width: "100%",
                        height: "42px",
                        padding: "0 12px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "10px",
                        fontSize: "13px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                      Max Documents
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.maxDocuments}
                      onChange={(e) => setFormData({ ...formData, maxDocuments: Number(e.target.value) })}
                      style={{
                        width: "100%",
                        height: "42px",
                        padding: "0 12px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "10px",
                        fontSize: "13px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                      Storage (e.g. 10 GB)
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.storage}
                      onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                      style={{
                        width: "100%",
                        height: "42px",
                        padding: "0 12px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "10px",
                        fontSize: "13px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      flex: 1,
                      height: "44px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#ffffff",
                      borderRadius: "10px",
                      fontSize: "13px",
                      fontWeight: "700",
                      color: "#475569",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      height: "44px",
                      border: "none",
                      backgroundColor: "#2563eb",
                      color: "#ffffff",
                      borderRadius: "10px",
                      fontSize: "13px",
                      fontWeight: "700",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
                    }}
                  >
                    {editingPlan ? "Update Plan" : "Save Plan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
