"use client";
import React, { useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";
import {
  Search,
  Plus,
  MoreVertical,
  ChevronDown,
  X,
  Building2,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
  Zap,
  Globe,
  Code2,
  LineChart
} from "lucide-react";
import { getOrganizations, saveOrganization, PlatformOrg } from "@/lib/adminStorage";

export default function AdminOrganizationsPage() {
  const [orgs, setOrgs] = useState<PlatformOrg[]>(getOrganizations());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("All Plans");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // New Org Form State
  const [newOrg, setNewOrg] = useState({
    displayName: "",
    domain: "",
    email: "",
    plan: "Pro" as "Basic" | "Pro" | "Enterprise",
  });

  const orgIcons: Record<string, { bg: string; color: string; icon: any }> = {
    "org-1": { bg: "linear-gradient(135deg, #6366f1, #3b82f6)", color: "#ffffff", icon: Sparkles },
    "org-2": { bg: "linear-gradient(135deg, #f97316, #ea580c)", color: "#ffffff", icon: Zap },
    "org-3": { bg: "linear-gradient(135deg, #d97706, #b45309)", color: "#ffffff", icon: Building2 },
    "org-4": { bg: "linear-gradient(135deg, #0284c7, #0369a1)", color: "#ffffff", icon: Shield },
    "org-5": { bg: "linear-gradient(135deg, #1e3a8a, #0f172a)", color: "#ffffff", icon: Globe },
    "org-6": { bg: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "#ffffff", icon: Layers },
    "org-7": { bg: "linear-gradient(135deg, #0891b2, #0e7490)", color: "#ffffff", icon: Code2 },
    "org-8": { bg: "linear-gradient(135deg, #1e40af, #1e3a8a)", color: "#ffffff", icon: LineChart },
  };

  const filteredOrgs = orgs.filter((org) => {
    const matchesSearch =
      org.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan =
      selectedPlan === "All Plans" || org.plan === selectedPlan;
    const matchesStatus =
      selectedStatus === "All Status" || org.status === selectedStatus;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrg.displayName || !newOrg.domain) return;
    const created: PlatformOrg = {
      id: "org-" + Date.now(),
      name: newOrg.displayName.toLowerCase().replace(/\s+/g, ""),
      displayName: newOrg.displayName,
      domain: newOrg.domain,
      plan: newOrg.plan,
      usersCount: 1,
      maxUsers: newOrg.plan === "Enterprise" ? 200 : newOrg.plan === "Pro" ? 50 : 5,
      documentsCount: 0,
      maxDocuments: newOrg.plan === "Enterprise" ? 999999 : newOrg.plan === "Pro" ? 5000 : 200,
      status: "Active",
      joinedOn: "Today",
      validTill: "28 Oct 2027",
      email: newOrg.email || `contact@${newOrg.domain}`,
      phone: "+91 9800000000",
      address: "India",
      storageLimit: newOrg.plan === "Enterprise" ? "50 GB" : newOrg.plan === "Pro" ? "10 GB" : "1 GB",
    };
    saveOrganization(created);
    setOrgs(getOrganizations());
    setIsModalOpen(false);
    setNewOrg({ displayName: "", domain: "", email: "", plan: "Pro" });
  };

  const toggleStatus = (id: string) => {
    const org = orgs.find((o) => o.id === id);
    if (!org) return;
    const updated = {
      ...org,
      status: org.status === "Active" ? "Suspended" : "Active",
    } as PlatformOrg;
    saveOrganization(updated);
    setOrgs(getOrganizations());
    setActiveMenuId(null);
  };

  return (
    <AdminLayout activePath="/admin/organizations">
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
              Organizations
            </h1>
            <p
              style={{
                fontSize: "13px",
                color: "#64748b",
                margin: "4px 0 0 0",
                fontWeight: "400",
              }}
            >
              Manage all registered organizations
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
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
              transition: "background 0.15s ease",
            }}
          >
            <Plus style={{ width: "16px", height: "16px" }} />
            <span>Add Organization</span>
          </button>
        </div>

        {/* ================= FILTERS ROW ================= */}
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "12px 16px",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
            boxSizing: "border-box",
          }}
        >
          {/* Search Input */}
          <div style={{ position: "relative", flex: "1 1 320px", minWidth: "260px" }}>
            <Search
              style={{
                width: "15px",
                height: "15px",
                color: "#94a3b8",
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              placeholder="Search by name, email, domain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                height: "38px",
                padding: "0 14px 0 36px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                fontSize: "13px",
                color: "#1e293b",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Dropdown Filters */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* All Plans */}
            <div style={{ position: "relative" }}>
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                style={{
                  height: "38px",
                  padding: "0 32px 0 14px",
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#334155",
                  outline: "none",
                  cursor: "pointer",
                  appearance: "none",
                }}
              >
                <option value="All Plans">All Plans</option>
                <option value="Basic">Basic</option>
                <option value="Pro">Pro</option>
                <option value="Enterprise">Enterprise</option>
              </select>
              <ChevronDown
                style={{
                  width: "14px",
                  height: "14px",
                  color: "#94a3b8",
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              />
            </div>

            {/* All Status */}
            <div style={{ position: "relative" }}>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{
                  height: "38px",
                  padding: "0 32px 0 14px",
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#334155",
                  outline: "none",
                  cursor: "pointer",
                  appearance: "none",
                }}
              >
                <option value="All Status">All Status</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </select>
              <ChevronDown
                style={{
                  width: "14px",
                  height: "14px",
                  color: "#94a3b8",
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              />
            </div>
          </div>
        </div>

        {/* ================= ORGANIZATIONS TABLE ================= */}
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
                  <th style={{ padding: "14px 20px", width: "36px" }}>#</th>
                  <th style={{ padding: "14px 16px", width: "60px" }}>Logo</th>
                  <th style={{ padding: "14px 20px" }}>Organization Name</th>
                  <th style={{ padding: "14px 20px" }}>Domain</th>
                  <th style={{ padding: "14px 20px" }}>Plan</th>
                  <th style={{ padding: "14px 20px" }}>Users</th>
                  <th style={{ padding: "14px 20px" }}>Documents</th>
                  <th style={{ padding: "14px 20px" }}>Status</th>
                  <th style={{ padding: "14px 20px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrgs.map((org, index) => {
                  const logoMeta = orgIcons[org.id] || {
                    bg: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                    color: "#ffffff",
                    icon: Building2,
                  };
                  const LogoIcon = logoMeta.icon;

                  return (
                    <tr
                      key={org.id}
                      style={{
                        borderBottom:
                          index !== filteredOrgs.length - 1
                            ? "1px solid #f1f5f9"
                            : "none",
                        transition: "background 0.15s ease",
                      }}
                    >
                      {/* # Number */}
                      <td style={{ padding: "16px 20px", color: "#94a3b8", fontWeight: "600" }}>
                        {index + 1}
                      </td>

                      {/* Logo Avatar Circle */}
                      <td style={{ padding: "16px 16px" }}>
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: logoMeta.bg,
                            color: logoMeta.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                            flexShrink: 0,
                          }}
                        >
                          <LogoIcon style={{ width: "18px", height: "18px" }} />
                        </div>
                      </td>

                      {/* Organization Name */}
                      <td style={{ padding: "16px 20px" }}>
                        <Link
                          href={`/admin/organizations/${org.id}`}
                          style={{
                            fontWeight: "700",
                            color: "#0f172a",
                            textDecoration: "none",
                          }}
                        >
                          {org.displayName}
                        </Link>
                      </td>

                      {/* Domain */}
                      <td style={{ padding: "16px 20px", color: "#64748b", fontFamily: "monospace", fontSize: "12px" }}>
                        {org.domain}
                      </td>

                      {/* Plan */}
                      <td style={{ padding: "16px 20px", color: "#334155", fontWeight: "600" }}>
                        {org.plan}
                      </td>

                      {/* Users */}
                      <td style={{ padding: "16px 20px", color: "#475569", fontWeight: "600" }}>
                        {org.usersCount}
                      </td>

                      {/* Documents */}
                      <td style={{ padding: "16px 20px", color: "#475569", fontWeight: "600" }}>
                        {org.documentsCount}
                      </td>

                      {/* Status */}
                      <td style={{ padding: "16px 20px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 12px",
                            borderRadius: "9999px",
                            fontSize: "11px",
                            fontWeight: "700",
                            backgroundColor:
                              org.status === "Active" ? "#dcfce7" : "#fee2e2",
                            color:
                              org.status === "Active" ? "#15803d" : "#dc2626",
                            border: `1px solid ${
                              org.status === "Active" ? "#bbf7d0" : "#fecaca"
                            }`,
                          }}
                        >
                          {org.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "16px 20px", textAlign: "right", position: "relative" }}>
                        <button
                          onClick={() =>
                            setActiveMenuId(activeMenuId === org.id ? null : org.id)
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
                        {activeMenuId === org.id && (
                          <div
                            style={{
                              position: "absolute",
                              right: "20px",
                              top: "45px",
                              width: "160px",
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
                              href={`/admin/organizations/${org.id}`}
                              style={{
                                display: "block",
                                padding: "8px 14px",
                                fontSize: "12px",
                                fontWeight: "600",
                                color: "#334155",
                                textDecoration: "none",
                              }}
                            >
                              View Details
                            </Link>
                            <button
                              onClick={() => toggleStatus(org.id)}
                              style={{
                                width: "100%",
                                textAlign: "left",
                                padding: "8px 14px",
                                fontSize: "12px",
                                fontWeight: "600",
                                color: org.status === "Active" ? "#dc2626" : "#16a34a",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                              }}
                            >
                              {org.status === "Active" ? "Suspend Organization" : "Activate Organization"}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ================= PAGINATION FOOTER ================= */}
          <div
            style={{
              padding: "16px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid #f1f5f9",
              backgroundColor: "#ffffff",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "500" }}>
              Showing 1-8 of 24
            </span>

            {/* Pagination numbers */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {/* Active page 1 */}
              <button
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: "700",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 6px rgba(37,99,235,0.25)",
                }}
              >
                1
              </button>

              {/* Page 2 */}
              <button
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  backgroundColor: "transparent",
                  color: "#64748b",
                  fontSize: "12px",
                  fontWeight: "600",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                2
              </button>

              {/* Page 3 */}
              <button
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  backgroundColor: "transparent",
                  color: "#64748b",
                  fontSize: "12px",
                  fontWeight: "600",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                3
              </button>

              <span style={{ color: "#94a3b8", fontSize: "12px", padding: "0 2px" }}>...</span>

              {/* Page 5 */}
              <button
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  backgroundColor: "transparent",
                  color: "#64748b",
                  fontSize: "12px",
                  fontWeight: "600",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                5
              </button>
            </div>
          </div>
        </div>

        {/* ================= ADD ORGANIZATION MODAL ================= */}
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
                    Add New Organization
                  </h3>
                  <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
                    Register a new company workspace
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

              <form onSubmit={handleCreateOrg} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                    Organization Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VorldX Technologies Pvt Ltd"
                    value={newOrg.displayName}
                    onChange={(e) => setNewOrg({ ...newOrg, displayName: e.target.value })}
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
                    Domain
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. vorldx.com"
                    value={newOrg.domain}
                    onChange={(e) => setNewOrg({ ...newOrg, domain: e.target.value })}
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
                    Admin Contact Email
                  </label>
                  <input
                    type="email"
                    placeholder="admin@vorldx.com"
                    value={newOrg.email}
                    onChange={(e) => setNewOrg({ ...newOrg, email: e.target.value })}
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
                    Subscription Plan
                  </label>
                  <select
                    value={newOrg.plan}
                    onChange={(e) => setNewOrg({ ...newOrg, plan: e.target.value as any })}
                    style={{
                      width: "100%",
                      height: "42px",
                      padding: "0 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "10px",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#334155",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="Basic">Basic (Free)</option>
                    <option value="Pro">Pro (₹2,999/mo)</option>
                    <option value="Enterprise">Enterprise (₹8,999/mo)</option>
                  </select>
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
                    Create Workspace
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
