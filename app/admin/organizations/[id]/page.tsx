"use client";
import React, { useState, use } from "react";
import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";
import {
  ArrowLeft,
  Edit3,
  PauseCircle,
  PlayCircle,
  FileText,
  Users,
  CreditCard,
  KeyRound,
  ExternalLink,
  CheckCircle2,
  X,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Layers,
  Shield,
  Download
} from "lucide-react";
import { getOrganizationById, saveOrganization, PlatformOrg } from "@/lib/adminStorage";

function OrgDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orgId = resolvedParams.id;
  const initialOrg = getOrganizationById(orgId) || {
    id: orgId,
    name: "acme",
    displayName: "VorldX Technologies Pvt Ltd",
    domain: "vorldx.com",
    plan: "Pro" as const,
    usersCount: 12,
    maxUsers: 50,
    documentsCount: 145,
    maxDocuments: 5000,
    status: "Active" as const,
    joinedOn: "28 Oct 2026",
    validTill: "28 Oct 2027",
    tagline: "Innovating for a Better Tomorrow",
    email: "contact@vorldx.com",
    phone: "+91 9876543210",
    address: "A-123, Sector 62, Noida, UP 201301",
    storageLimit: "10 GB",
  };

  const [org, setOrg] = useState<PlatformOrg>(initialOrg);
  const [activeTab, setActiveTab] = useState("Overview");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLetterheadPreviewOpen, setIsLetterheadPreviewOpen] = useState(false);
  const [editForm, setEditForm] = useState({ ...org });

  const tabs = ["Overview", "Members", "Branding", "Templates", "Documents", "Settings", "Billing"];

  const toggleStatus = () => {
    const updated = {
      ...org,
      status: org.status === "Active" ? "Suspended" : "Active",
    } as PlatformOrg;
    saveOrganization(updated);
    setOrg(updated);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    saveOrganization(editForm);
    setOrg(editForm);
    setIsEditOpen(false);
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
          gap: "18px",
          boxSizing: "border-box",
        }}
      >
        {/* ================= BACK LINK ================= */}
        <div>
          <Link
            href="/admin/organizations"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              fontWeight: "600",
              color: "#2563eb",
              textDecoration: "none",
            }}
          >
            <ArrowLeft style={{ width: "14px", height: "14px" }} />
            <span>Back to Organizations</span>
          </Link>
        </div>

        {/* ================= TOP ORG HEADER CARD ================= */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            padding: "20px 24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            boxSizing: "border-box",
          }}
        >
          {/* Left: Emblem + Name + Status */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Geometric VorldX Triangle Logo */}
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "#eff6ff",
                border: "1px solid #dbeafe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg viewBox="0 0 40 32" style={{ width: "32px", height: "26px" }}>
                <path d="M20 2 L4 30 L16 30 Z" fill="#2563eb" />
                <path d="M20 2 L36 30 L24 30 Z" fill="#38bdf8" />
                <path d="M16 20 L24 20 L20 12 Z" fill="#ffffff" />
              </svg>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <h1
                style={{
                  fontSize: "22px",
                  fontWeight: "900",
                  color: "#0f172a",
                  letterSpacing: "-0.5px",
                  margin: 0,
                }}
              >
                {org.displayName}
              </h1>
              <span
                style={{
                  display: "inline-block",
                  padding: "3px 12px",
                  borderRadius: "9999px",
                  fontSize: "11px",
                  fontWeight: "700",
                  backgroundColor: org.status === "Active" ? "#dcfce7" : "#fee2e2",
                  color: org.status === "Active" ? "#15803d" : "#dc2626",
                  border: `1px solid ${org.status === "Active" ? "#bbf7d0" : "#fecaca"}`,
                }}
              >
                {org.status}
              </span>
            </div>
          </div>

          {/* Right: Action Buttons (Edit & Suspend) */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={() => setIsEditOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "10px",
                backgroundColor: "#ffffff",
                border: "1px solid #cbd5e1",
                fontSize: "12.5px",
                fontWeight: "600",
                color: "#334155",
                cursor: "pointer",
                boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
              }}
            >
              <Edit3 style={{ width: "14px", height: "14px", color: "#64748b" }} />
              <span>Edit</span>
            </button>

            <button
              onClick={toggleStatus}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "10px",
                backgroundColor: org.status === "Active" ? "#fff1f2" : "#f0fdf4",
                border: `1px solid ${org.status === "Active" ? "#fecdd3" : "#bbf7d0"}`,
                fontSize: "12.5px",
                fontWeight: "700",
                color: org.status === "Active" ? "#e11d48" : "#16a34a",
                cursor: "pointer",
              }}
            >
              {org.status === "Active" ? (
                <>
                  <PauseCircle style={{ width: "15px", height: "15px" }} />
                  <span>Suspend</span>
                </>
              ) : (
                <>
                  <PlayCircle style={{ width: "15px", height: "15px" }} />
                  <span>Activate</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ================= TABS NAVIGATION (7 TABS) ================= */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            borderBottom: "1px solid #e2e8f0",
            padding: "0 4px",
            overflowX: "auto",
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "10px 4px",
                  fontSize: "13px",
                  fontWeight: isActive ? "800" : "600",
                  color: isActive ? "#2563eb" : "#64748b",
                  backgroundColor: "transparent",
                  border: "none",
                  borderBottom: isActive ? "2.5px solid #2563eb" : "2.5px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* ================= TAB CONTENT ================= */}
        {activeTab === "Overview" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr 1fr",
              gap: "20px",
              boxSizing: "border-box",
            }}
          >
            {/* COLUMN 1: Organization Information Card */}
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                padding: "22px 24px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                boxSizing: "border-box",
              }}
            >
              <h3 style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                Organization Information
              </h3>

              {/* Organization Name */}
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>
                  Organization Name
                </label>
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#0f172a",
                  }}
                >
                  {org.displayName}
                </div>
              </div>

              {/* Tagline */}
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>
                  Tagline
                </label>
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    fontSize: "12.5px",
                    color: "#475569",
                  }}
                >
                  {org.tagline || "Innovating for a Better Tomorrow"}
                </div>
              </div>

              {/* Website */}
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>
                  Website
                </label>
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    fontSize: "12.5px",
                    color: "#2563eb",
                    fontWeight: "600",
                  }}
                >
                  https://www.{org.domain}
                </div>
              </div>

              {/* Email & Phone side by side */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>
                    Email
                  </label>
                  <div
                    style={{
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      padding: "8px 10px",
                      fontSize: "12px",
                      color: "#334155",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {org.email}
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>
                    Phone
                  </label>
                  <div
                    style={{
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      padding: "8px 10px",
                      fontSize: "12px",
                      color: "#334155",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {org.phone}
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>
                  Address
                </label>
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    fontSize: "12px",
                    color: "#475569",
                  }}
                >
                  {org.address}
                </div>
              </div>

              {/* Joined On & Valid Till at bottom */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "6px",
                  fontSize: "11px",
                  color: "#94a3b8",
                }}
              >
                <span>Joined: {org.joinedOn}</span>
                <span>Valid: {org.validTill}</span>
              </div>
            </div>

            {/* COLUMN 2: Logo & Letterhead Card */}
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                padding: "22px 24px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                display: "flex",
                flexDirection: "column",
                boxSizing: "border-box",
              }}
            >
              <h3 style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a", margin: "0 0 16px 0" }}>
                Logo &amp; Letterhead
              </h3>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                  flex: 1,
                }}
              >
                {/* Left: VorldX Mountain Logo + View Letterhead button */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    flex: 1,
                  }}
                >
                  {/* Geometric VorldX Triangles */}
                  <div style={{ marginBottom: "8px" }}>
                    <svg viewBox="0 0 60 48" style={{ width: "70px", height: "56px" }}>
                      <path d="M30 4 L6 44 L24 44 Z" fill="#2563eb" />
                      <path d="M30 4 L54 44 L36 44 Z" fill="#38bdf8" />
                      <path d="M24 30 L36 30 L30 18 Z" fill="#ffffff" />
                    </svg>
                  </div>
                  <span
                    style={{
                      fontSize: "20px",
                      fontWeight: "900",
                      letterSpacing: "2px",
                      color: "#0f172a",
                      display: "block",
                      marginBottom: "16px",
                    }}
                  >
                    VorldX
                  </span>

                  <button
                    onClick={() => setIsLetterheadPreviewOpen(true)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      backgroundColor: "#ffffff",
                      border: "1.5px solid #2563eb",
                      color: "#2563eb",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      boxShadow: "0 1px 3px rgba(37,99,235,0.1)",
                    }}
                  >
                    View Letterhead
                  </button>
                </div>

                {/* Right: Framed A4 Document Preview */}
                <div
                  onClick={() => setIsLetterheadPreviewOpen(true)}
                  style={{
                    width: "120px",
                    height: "170px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                    padding: "8px",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    position: "relative",
                  }}
                  title="Click to preview letterhead"
                >
                  {/* Header of mini document */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "6px" }}>
                      <div style={{ width: "8px", height: "8px", backgroundColor: "#2563eb", borderRadius: "1px" }} />
                      <span style={{ fontSize: "7px", fontWeight: "900", color: "#0f172a" }}>VorldX</span>
                    </div>
                    <div style={{ height: "2px", backgroundColor: "#2563eb", width: "100%", marginBottom: "8px" }} />

                    {/* Placeholder lines */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div style={{ height: "3px", backgroundColor: "#e2e8f0", width: "80%", borderRadius: "2px" }} />
                      <div style={{ height: "3px", backgroundColor: "#f1f5f9", width: "100%", borderRadius: "2px" }} />
                      <div style={{ height: "3px", backgroundColor: "#f1f5f9", width: "90%", borderRadius: "2px" }} />
                      <div style={{ height: "3px", backgroundColor: "#f1f5f9", width: "70%", borderRadius: "2px" }} />
                    </div>
                  </div>

                  {/* Footer seal */}
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        border: "1px dashed #93c5fd",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#bfdbfe" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 3: Plan Details & Quick Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Top: Plan Details */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0",
                  padding: "18px 20px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                  boxSizing: "border-box",
                }}
              >
                <h3 style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a", margin: "0 0 12px 0" }}>
                  Plan Details
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b" }}>Current Plan</span>
                    <span style={{ fontWeight: "800", color: "#0f172a" }}>{org.plan}</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b" }}>Valid Till</span>
                    <span style={{ fontWeight: "700", color: "#0f172a" }}>{org.validTill}</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b" }}>Max Users</span>
                    <span style={{ fontWeight: "700", color: "#0f172a" }}>{org.maxUsers}</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b" }}>Storage Limit</span>
                    <span style={{ fontWeight: "700", color: "#0f172a" }}>{org.storageLimit}</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b" }}>Documents This Month</span>
                    <span style={{ fontWeight: "800", color: "#0f172a" }}>
                      {org.documentsCount} / {org.maxDocuments}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div
                    style={{
                      width: "100%",
                      height: "6px",
                      backgroundColor: "#f1f5f9",
                      borderRadius: "9999px",
                      overflow: "hidden",
                      marginTop: "4px",
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(100, (org.documentsCount / org.maxDocuments) * 100)}%`,
                        height: "100%",
                        backgroundColor: "#10b981",
                        borderRadius: "9999px",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom: Quick Actions */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0",
                  padding: "18px 20px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                  boxSizing: "border-box",
                }}
              >
                <h3 style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a", margin: "0 0 12px 0" }}>
                  Quick Actions
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <button
                    onClick={() => setActiveTab("Members")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px",
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#334155",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <Users style={{ width: "14px", height: "14px", color: "#2563eb" }} />
                    <span>Manage Members</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("Documents")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px",
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#334155",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <FileText style={{ width: "14px", height: "14px", color: "#2563eb" }} />
                    <span>View Documents</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("Billing")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px",
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#334155",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <CreditCard style={{ width: "14px", height: "14px", color: "#2563eb" }} />
                    <span>Change Plan</span>
                  </button>

                  <button
                    onClick={() => alert(`Password reset link dispatched to ${org.email}`)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px",
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#334155",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <KeyRound style={{ width: "14px", height: "14px", color: "#2563eb" }} />
                    <span>Reset Password</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= MEMBERS TAB ================= */}
        {activeTab === "Members" && (
          <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", marginBottom: "16px" }}>Team Members (VorldX Technologies)</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#dbeafe", color: "#2563eb", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center" }}>RS</div>
                  <div>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a", display: "block" }}>Rahul Sharma</span>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>admin@vorldx.com</span>
                  </div>
                </div>
                <span style={{ padding: "3px 10px", backgroundColor: "#eff6ff", color: "#2563eb", borderRadius: "9999px", fontSize: "11px", fontWeight: "700" }}>Org Admin</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#f3e8ff", color: "#9333ea", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center" }}>PS</div>
                  <div>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a", display: "block" }}>Priya Singh</span>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>priya@vorldx.com</span>
                  </div>
                </div>
                <span style={{ padding: "3px 10px", backgroundColor: "#faf5ff", color: "#9333ea", borderRadius: "9999px", fontSize: "11px", fontWeight: "700" }}>Editor</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= BRANDING TAB ================= */}
        {activeTab === "Branding" && (
          <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>White-Label Letterhead &amp; Brand Settings</h3>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>Brand colors, custom domain, and official digital letterheads.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ padding: "16px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "4px" }}>Primary Brand Color</span>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "6px", backgroundColor: "#2563eb" }} />
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>#2563EB (Royal Blue)</span>
                </div>
              </div>

              <div style={{ padding: "16px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "4px" }}>Custom CNAME Domain</span>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>docs.vorldx.com (Configured)</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= DOCUMENTS TAB ================= */}
        {activeTab === "Documents" && (
          <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", marginBottom: "16px" }}>Documents (145 Total)</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12.5px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ fontWeight: "700", color: "#0f172a" }}>Q-001: Website Development Quotation</span>
                <span style={{ color: "#16a34a", fontWeight: "700" }}>Signed (₹35,400)</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ fontWeight: "700", color: "#0f172a" }}>MOU-001: Partnership Agreement</span>
                <span style={{ color: "#2563eb", fontWeight: "700" }}>Sent for Signature</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= TEMPLATES TAB ================= */}
        {activeTab === "Templates" && (
          <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: 0 }}>Organization Document Templates</h3>
                <p style={{ fontSize: "12.5px", color: "#64748b", margin: "4px 0 0 0" }}>Pre-configured quotation styles and standardized MOU frameworks for {org.displayName}.</p>
              </div>
              <button
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "9px 18px",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "12.5px",
                  fontWeight: "700",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(37,99,235,0.2)",
                }}
              >
                + Add New Template
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "16px" }}>
              {/* Template Card 1 */}
              <div style={{ border: "1px solid #e2e8f0", borderRadius: "14px", padding: "18px", backgroundColor: "#f8fafc", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#dbeafe", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FileText style={{ width: "18px", height: "18px" }} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: "13.5px", fontWeight: "800", color: "#0f172a", margin: 0 }}>Standard IT &amp; SaaS Quotation</h4>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>Quotation Template &bull; Version 2.1</span>
                    </div>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 8px", backgroundColor: "#dcfce7", color: "#166534", borderRadius: "9999px" }}>Active</span>
                </div>
                <p style={{ fontSize: "12px", color: "#475569", margin: 0, lineHeight: "1.5" }}>Includes itemized table, GST breakdown, payment milestones, and official seal signature section.</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "10px", borderTop: "1px solid #e2e8f0", fontSize: "11.5px", color: "#64748b" }}>
                  <span>Used in <strong>98 documents</strong></span>
                  <button style={{ color: "#2563eb", fontWeight: "700", background: "none", border: "none", cursor: "pointer", fontSize: "12px" }}>Preview Template &rarr;</button>
                </div>
              </div>

              {/* Template Card 2 */}
              <div style={{ border: "1px solid #e2e8f0", borderRadius: "14px", padding: "18px", backgroundColor: "#f8fafc", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#fef3c7", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Shield style={{ width: "18px", height: "18px" }} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: "13.5px", fontWeight: "800", color: "#0f172a", margin: 0 }}>Master Services Agreement (MOU)</h4>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>Legal MOU Template &bull; Version 1.4</span>
                    </div>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 8px", backgroundColor: "#dcfce7", color: "#166534", borderRadius: "9999px" }}>Active</span>
                </div>
                <p style={{ fontSize: "12px", color: "#475569", margin: 0, lineHeight: "1.5" }}>Two-party partnership framework with confidentiality covenants, term covenants, and dual-party digital sign blocks.</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "10px", borderTop: "1px solid #e2e8f0", fontSize: "11.5px", color: "#64748b" }}>
                  <span>Used in <strong>47 documents</strong></span>
                  <button style={{ color: "#2563eb", fontWeight: "700", background: "none", border: "none", cursor: "pointer", fontSize: "12px" }}>Preview Template &rarr;</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= SETTINGS TAB ================= */}
        {activeTab === "Settings" && (
          <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px", display: "flex", flexDirection: "column", gap: "22px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: 0 }}>Organization Security &amp; Compliance Settings</h3>
              <p style={{ fontSize: "12.5px", color: "#64748b", margin: "4px 0 0 0" }}>Control signing authentication, webhook callbacks, and multi-tenant isolation rules for {org.displayName}.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div style={{ padding: "18px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "12px" }}>
                <span style={{ fontSize: "13px", fontWeight: "800", color: "#0f172a" }}>E-Signature Security</span>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <span style={{ fontSize: "12.5px", fontWeight: "700", color: "#334155", display: "block" }}>Require Recipient Mobile OTP</span>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>Dispatches SMS verification code before unlocking signing</span>
                  </div>
                  <input type="checkbox" defaultChecked style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#2563eb" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid #e2e8f0" }}>
                  <div>
                    <span style={{ fontSize: "12.5px", fontWeight: "700", color: "#334155", display: "block" }}>Automatic Document Expiry</span>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>Unsigned documents expire after 30 days</span>
                  </div>
                  <input type="checkbox" defaultChecked style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#2563eb" }} />
                </div>
              </div>

              <div style={{ padding: "18px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "12px" }}>
                <span style={{ fontSize: "13px", fontWeight: "800", color: "#0f172a" }}>Webhooks &amp; Integration API</span>
                <div>
                  <label style={{ display: "block", fontSize: "11.5px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>Signed Document Webhook URL</label>
                  <input
                    type="text"
                    defaultValue="https://api.vorldx.com/v1/documents/callback"
                    style={{ width: "100%", height: "38px", padding: "0 10px", fontSize: "12px", border: "1px solid #cbd5e1", borderRadius: "8px", boxSizing: "border-box" }}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
                  <button style={{ padding: "6px 14px", backgroundColor: "#2563eb", color: "#ffffff", border: "none", borderRadius: "8px", fontSize: "11.5px", fontWeight: "700", cursor: "pointer" }}>Save Endpoint</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= BILLING TAB (1:1 COMPLETE ENTERPRISE SUITE) ================= */}
        {activeTab === "Billing" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "22px", boxSizing: "border-box" }}>
            {/* Top Row: Current Plan Card & Payment / Invoicing Profile Card */}
            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "20px", alignItems: "stretch" }}>
              {/* Card 1: Subscription Plan Status */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0",
                  padding: "24px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "18px",
                  boxSizing: "border-box",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <CreditCard style={{ width: "18px", height: "18px" }} />
                      </div>
                      <span style={{ fontSize: "12.5px", fontWeight: "800", color: "#0f172a" }}>Current Subscription</span>
                    </div>
                    <span style={{ fontSize: "11.5px", fontWeight: "700", padding: "3px 10px", borderRadius: "9999px", backgroundColor: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" }}>
                      Active
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px", margin: "14px 0 8px 0" }}>
                    <h2 style={{ fontSize: "28px", fontWeight: "900", color: "#0f172a", margin: 0, letterSpacing: "-0.5px" }}>
                      {org.plan} Plan
                    </h2>
                    <span style={{ fontSize: "14px", fontWeight: "800", color: "#2563eb" }}>
                      {org.plan === "Basic" ? "₹0 / mo" : org.plan === "Enterprise" ? "₹8,999 / mo" : "₹2,999 / mo"}
                    </span>
                    <span style={{ fontSize: "11.5px", color: "#64748b" }}>(Billed Annually)</span>
                  </div>

                  <p style={{ fontSize: "12px", color: "#64748b", margin: 0, lineHeight: "1.5" }}>
                    Full white-label branding, digital signature workflows, priority Indian data residency, and SLA support.
                  </p>
                </div>

                <div style={{ backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "12px 16px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b" }}>Billing Cycle:</span>
                    <span style={{ fontWeight: "700", color: "#0f172a" }}>Annual (12 Months)</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b" }}>Next Renewal Date:</span>
                    <span style={{ fontWeight: "700", color: "#0f172a" }}>{org.validTill || "28 Oct 2027"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b" }}>Auto-Renew:</span>
                    <span style={{ fontWeight: "700", color: "#16a34a" }}>Enabled via Razorpay</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <button
                    onClick={() => setIsEditOpen(true)}
                    style={{
                      flex: 1,
                      padding: "10px 16px",
                      backgroundColor: "#2563eb",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "10px",
                      fontSize: "12.5px",
                      fontWeight: "700",
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(37,99,235,0.2)",
                    }}
                  >
                    Change / Upgrade Plan
                  </button>
                  <button
                    onClick={() => alert("Subscription cancellation requested. A confirmation notice has been sent to " + org.email)}
                    style={{
                      padding: "10px 16px",
                      backgroundColor: "#ffffff",
                      color: "#dc2626",
                      border: "1px solid #fecaca",
                      borderRadius: "10px",
                      fontSize: "12.5px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    Cancel Plan
                  </button>
                </div>
              </div>

              {/* Card 2: Payment Method & Invoicing Details */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0",
                  padding: "24px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "16px",
                  boxSizing: "border-box",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                    <span style={{ fontSize: "12.5px", fontWeight: "800", color: "#0f172a" }}>Payment Method &amp; Invoicing</span>
                    <button
                      onClick={() => alert("Payment gateway popup opened for " + org.displayName)}
                      style={{ fontSize: "11.5px", fontWeight: "700", color: "#2563eb", background: "none", border: "none", cursor: "pointer" }}
                    >
                      + Update Card
                    </button>
                  </div>

                  {/* Stored Credit Card Pill */}
                  <div style={{ padding: "14px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "42px", height: "28px", backgroundColor: "#1e3a8a", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontWeight: "900", fontSize: "10px", letterSpacing: "1px" }}>
                        VISA
                      </div>
                      <div>
                        <span style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a", display: "block" }}>Visa ending in 4242</span>
                        <span style={{ fontSize: "11px", color: "#64748b" }}>Expires 12/2028 &bull; Default Method</span>
                      </div>
                    </div>
                    <span style={{ fontSize: "10.5px", fontWeight: "700", padding: "2px 8px", backgroundColor: "#e2e8f0", color: "#334155", borderRadius: "6px" }}>
                      Primary
                    </span>
                  </div>

                  {/* Tax & GST Legal Details */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px", color: "#475569" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #f1f5f9", paddingBottom: "6px" }}>
                      <span style={{ color: "#64748b" }}>Company Name:</span>
                      <span style={{ fontWeight: "700", color: "#0f172a" }}>{org.displayName}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #f1f5f9", paddingBottom: "6px" }}>
                      <span style={{ color: "#64748b" }}>GSTIN:</span>
                      <span style={{ fontWeight: "700", color: "#0f172a", fontFamily: "monospace" }}>07AAAAA0000A1Z5</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #f1f5f9", paddingBottom: "6px" }}>
                      <span style={{ color: "#64748b" }}>Invoicing Email:</span>
                      <span style={{ fontWeight: "700", color: "#0f172a" }}>{org.email}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>Registered Address:</span>
                      <span style={{ fontWeight: "600", color: "#0f172a", textAlign: "right", maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {org.address}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={() => setIsEditOpen(true)}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#ffffff",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#334155",
                      cursor: "pointer",
                    }}
                  >
                    Edit Invoicing Info
                  </button>
                </div>
              </div>
            </div>

            {/* Middle Row: Usage Quotas & Resource Consumption (3 Stat Cards) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              {/* Stat 1: Documents Quota */}
              <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "18px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>Monthly Documents Quota</span>
                  <FileText style={{ width: "16px", height: "16px", color: "#10b981" }} />
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                  <span style={{ fontSize: "22px", fontWeight: "900", color: "#0f172a" }}>{org.documentsCount}</span>
                  <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>/ {org.maxDocuments} used</span>
                </div>
                <div style={{ width: "100%", height: "6px", backgroundColor: "#f1f5f9", borderRadius: "9999px", overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(100, (org.documentsCount / org.maxDocuments) * 100)}%`, height: "100%", backgroundColor: "#10b981", borderRadius: "9999px" }} />
                </div>
                <span style={{ fontSize: "11px", color: "#64748b" }}>{org.maxDocuments - org.documentsCount} documents remaining (Resets monthly)</span>
              </div>

              {/* Stat 2: Members Seats */}
              <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "18px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>Team Seats Quota</span>
                  <Users style={{ width: "16px", height: "16px", color: "#2563eb" }} />
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                  <span style={{ fontSize: "22px", fontWeight: "900", color: "#0f172a" }}>{org.usersCount}</span>
                  <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>/ {org.maxUsers} seats</span>
                </div>
                <div style={{ width: "100%", height: "6px", backgroundColor: "#f1f5f9", borderRadius: "9999px", overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(100, (org.usersCount / org.maxUsers) * 100)}%`, height: "100%", backgroundColor: "#2563eb", borderRadius: "9999px" }} />
                </div>
                <span style={{ fontSize: "11px", color: "#64748b" }}>{org.maxUsers - org.usersCount} user seats available to invite</span>
              </div>

              {/* Stat 3: Cloud Storage */}
              <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "18px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>Cloud Storage Limit</span>
                  <Layers style={{ width: "16px", height: "16px", color: "#8b5cf6" }} />
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                  <span style={{ fontSize: "22px", fontWeight: "900", color: "#0f172a" }}>2.4 GB</span>
                  <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>/ {org.storageLimit}</span>
                </div>
                <div style={{ width: "100%", height: "6px", backgroundColor: "#f1f5f9", borderRadius: "9999px", overflow: "hidden" }}>
                  <div style={{ width: "24%", height: "100%", backgroundColor: "#8b5cf6", borderRadius: "9999px" }} />
                </div>
                <span style={{ fontSize: "11px", color: "#64748b" }}>7.6 GB high-speed AWS S3 storage free</span>
              </div>
            </div>

            {/* Bottom Row: Invoice & Billing History Table */}
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                padding: "24px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                boxSizing: "border-box",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                    Invoices &amp; Payment History
                  </h3>
                  <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0 0 0" }}>
                    Official GST-compliant tax invoices generated for {org.displayName}.
                  </p>
                </div>
                <button
                  onClick={() => alert("All 4 invoices downloaded in a zip file.")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 16px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#334155",
                    cursor: "pointer",
                  }}
                >
                  <Download style={{ width: "14px", height: "14px" }} />
                  <span>Download All Invoices</span>
                </button>
              </div>

              {/* Invoices Table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12.5px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      <th style={{ padding: "12px 14px", fontWeight: "700" }}>Invoice #</th>
                      <th style={{ padding: "12px 14px", fontWeight: "700" }}>Date</th>
                      <th style={{ padding: "12px 14px", fontWeight: "700" }}>Description</th>
                      <th style={{ padding: "12px 14px", fontWeight: "700" }}>Amount</th>
                      <th style={{ padding: "12px 14px", fontWeight: "700" }}>Payment Method</th>
                      <th style={{ padding: "12px 14px", fontWeight: "700" }}>Status</th>
                      <th style={{ padding: "12px 14px", fontWeight: "700", textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        id: "INV-2026-003",
                        date: "28 Oct 2026",
                        desc: "Pro Plan - Annual Renewal (1 Year)",
                        amount: "₹35,988.00",
                        method: "Razorpay (Visa •• 4242)",
                        status: "Paid",
                      },
                      {
                        id: "INV-2025-002",
                        date: "28 Oct 2025",
                        desc: "Pro Plan - Annual Tier Subscription",
                        amount: "₹35,988.00",
                        method: "Razorpay (Visa •• 4242)",
                        status: "Paid",
                      },
                      {
                        id: "INV-2025-001",
                        date: "15 Jun 2025",
                        desc: "Storage Addon (+5GB Extra Cloud)",
                        amount: "₹1,499.00",
                        method: "Razorpay (UPI / NetBanking)",
                        status: "Paid",
                      },
                      {
                        id: "INV-2024-001",
                        date: "28 Oct 2024",
                        desc: "Initial Setup & Pro Plan Activation",
                        amount: "₹35,988.00",
                        method: "Razorpay (HDFC NetBanking)",
                        status: "Paid",
                      },
                    ].map((inv) => (
                      <tr key={inv.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "14px", fontWeight: "800", color: "#2563eb", fontFamily: "monospace" }}>
                          {inv.id}
                        </td>
                        <td style={{ padding: "14px", color: "#475569" }}>
                          {inv.date}
                        </td>
                        <td style={{ padding: "14px", fontWeight: "600", color: "#0f172a" }}>
                          {inv.desc}
                        </td>
                        <td style={{ padding: "14px", fontWeight: "800", color: "#0f172a" }}>
                          {inv.amount}
                        </td>
                        <td style={{ padding: "14px", color: "#64748b" }}>
                          {inv.method}
                        </td>
                        <td style={{ padding: "14px" }}>
                          <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: "9999px", fontSize: "11px", fontWeight: "700", backgroundColor: "#dcfce7", color: "#166534" }}>
                            {inv.status}
                          </span>
                        </td>
                        <td style={{ padding: "14px", textAlign: "right" }}>
                          <button
                            onClick={() => alert(`Tax Invoice ${inv.id} for ${inv.amount} downloaded.`)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "6px 12px",
                              backgroundColor: "#ffffff",
                              border: "1px solid #cbd5e1",
                              borderRadius: "6px",
                              fontSize: "11.5px",
                              fontWeight: "700",
                              color: "#2563eb",
                              cursor: "pointer",
                            }}
                          >
                            <Download style={{ width: "12px", height: "12px" }} />
                            <span>Download PDF</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL: EDIT ORGANIZATION ================= */}
        {isEditOpen && (
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
                maxWidth: "520px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                padding: "24px",
                boxSizing: "border-box",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                  Edit Organization
                </h3>
                <button onClick={() => setIsEditOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                  <X style={{ width: "20px", height: "20px" }} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={editForm.displayName}
                    onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                    style={{ width: "100%", height: "40px", padding: "0 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={editForm.tagline}
                    onChange={(e) => setEditForm({ ...editForm, tagline: e.target.value })}
                    style={{ width: "100%", height: "40px", padding: "0 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", boxSizing: "border-box" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      style={{ width: "100%", height: "40px", padding: "0 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                      Phone
                    </label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      style={{ width: "100%", height: "40px", padding: "0 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                    Address
                  </label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    style={{ width: "100%", height: "40px", padding: "0 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", boxSizing: "border-box" }}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    style={{ flex: 1, height: "42px", border: "1px solid #e2e8f0", backgroundColor: "#ffffff", borderRadius: "8px", fontSize: "13px", fontWeight: "700", color: "#475569", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ flex: 1, height: "42px", border: "none", backgroundColor: "#2563eb", color: "#ffffff", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL: LETTERHEAD PREVIEW ================= */}
        {isLetterheadPreviewOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(15, 23, 42, 0.5)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 50,
              padding: "20px",
            }}
          >
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "18px",
                width: "100%",
                maxWidth: "600px",
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: "0 25px 50px rgba(0,0,0,0.2)",
                padding: "24px",
                boxSizing: "border-box",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                    Official Letterhead Preview
                  </h3>
                  <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
                    VorldX Technologies Pvt Ltd &bull; Verified Brand Letterhead
                  </p>
                </div>
                <button onClick={() => setIsLetterheadPreviewOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                  <X style={{ width: "20px", height: "20px" }} />
                </button>
              </div>

              {/* Full A4 Letterhead Box */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  padding: "32px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  minHeight: "450px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                {/* Header */}
                <div>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", borderBottom: "2px solid #2563eb", paddingBottom: "16px", marginBottom: "24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <svg viewBox="0 0 40 32" style={{ width: "36px", height: "30px" }}>
                        <path d="M20 2 L4 30 L16 30 Z" fill="#2563eb" />
                        <path d="M20 2 L36 30 L24 30 Z" fill="#38bdf8" />
                        <path d="M16 20 L24 20 L20 12 Z" fill="#ffffff" />
                      </svg>
                      <div>
                        <h4 style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a", margin: 0 }}>VORLDX TECHNOLOGIES</h4>
                        <span style={{ fontSize: "10px", color: "#64748b" }}>Innovating for a Better Tomorrow</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", fontSize: "10px", color: "#64748b", lineHeight: "1.4" }}>
                      <p style={{ margin: 0 }}>A-123, Sector 62, Noida, UP</p>
                      <p style={{ margin: 0 }}>www.vorldx.com &bull; contact@vorldx.com</p>
                    </div>
                  </div>

                  <div style={{ padding: "12px 0", color: "#475569", fontSize: "12px", lineHeight: "1.6" }}>
                    <p style={{ fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>To Whom It May Concern,</p>
                    <p>This document is generated on the official letterhead of VorldX Technologies Pvt Ltd through the VorldX White-Label Document Management and Digital Signing Engine.</p>
                  </div>
                </div>

                {/* Footer Stamp */}
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", borderTop: "1px solid #e2e8f0", paddingTop: "16px" }}>
                  <span style={{ fontSize: "10px", color: "#94a3b8" }}>Generated via VorldX Enterprise Engine</span>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontStyle: "italic", fontFamily: "serif", fontSize: "14px", color: "#1e3a8a", display: "block" }}>Rahul Sharma</span>
                    <span style={{ fontSize: "10px", color: "#64748b" }}>Authorized Signatory</span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
                <button
                  onClick={() => setIsLetterheadPreviewOpen(false)}
                  style={{
                    padding: "8px 20px",
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "12.5px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default function OrgDetailPage(props: { params: Promise<{ id: string }> }) {
  return (
    <React.Suspense fallback={<div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>}>
      <OrgDetailContent {...props} />
    </React.Suspense>
  );
}
