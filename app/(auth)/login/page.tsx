"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  FileText,
  Share2,
  ShieldCheck,
  Check,
  User,
  Shield,
  Briefcase,
  PenTool
} from "lucide-react";
import { adminLogin } from "@/lib/adminStorage";

export default function WorldXLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("priya@acme.com");
  const [password, setPassword] = useState("Password@123");
  const [remember, setRemember] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<
    "editor" | "org_admin" | "platform_admin" | "recipient"
  >("editor");

  const demoAccounts = [
    {
      roleKey: "editor" as const,
      name: "Editor",
      subtitle: "Priya Singh",
      email: "priya@acme.com",
      password: "Password@123",
      target: "/dashboard",
      icon: Briefcase,
      color: "#2563eb",
      bgColor: "#eff6ff",
    },
    {
      roleKey: "org_admin" as const,
      name: "Org Admin",
      subtitle: "Rahul Sharma",
      email: "admin@acme.com",
      password: "Password@123",
      target: "/dashboard",
      icon: Shield,
      color: "#4f46e5",
      bgColor: "#eef2ff",
    },
    {
      roleKey: "platform_admin" as const,
      name: "Platform Admin",
      subtitle: "Super Admin",
      email: "admin@vorldx.com",
      password: "Password@123",
      target: "/admin/dashboard",
      icon: User,
      color: "#9333ea",
      bgColor: "#faf5ff",
    },
    {
      roleKey: "recipient" as const,
      name: "Recipient",
      subtitle: "Tech Solutions",
      email: "recipient@techsolutions.com",
      password: "Password@123",
      target: "/recipient/dashboard",
      icon: PenTool,
      color: "#059669",
      bgColor: "#ecfdf5",
    },
  ];

  const handleQuickLogin = (account: (typeof demoAccounts)[0]) => {
    setSelectedRole(account.roleKey);
    setEmail(account.email);
    setPassword(account.password);
    processLogin(account.email, account.roleKey);
  };

  const processLogin = (userEmail: string, roleHint?: string) => {
    setLoading(true);
    const lower = userEmail.toLowerCase();

    // 1. Platform Admin
    if (roleHint === "platform_admin" || lower.includes("vorldx") || lower === "admin@vorldx.com" || lower.includes("superadmin")) {
      adminLogin(userEmail, password);
      setTimeout(() => router.push("/admin/dashboard"), 300);
      return;
    }

    // 2. External Recipient
    if (roleHint === "recipient" || lower.includes("recipient") || lower.includes("techsolutions") || lower.includes("client") || lower.includes("john")) {
      if (typeof window !== "undefined") {
        localStorage.setItem("vorldx_signer_name", "John Doe");
        localStorage.setItem("vorldx_user_role", "recipient");
      }
      setTimeout(() => router.push("/recipient/dashboard"), 300);
      return;
    }

    // 3. Editor
    if (roleHint === "editor" || lower.includes("priya") || lower.includes("editor")) {
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "vorldx_org_auth",
          JSON.stringify({ email: userEmail, name: "Priya Singh", role: "Editor", avatar: "PS" })
        );
      }
      setTimeout(() => router.push("/dashboard"), 300);
      return;
    }

    // 4. Default: Organization Admin (Rahul Sharma)
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "vorldx_org_auth",
        JSON.stringify({ email: userEmail, name: "Rahul Sharma", role: "Org Admin", avatar: "RS" })
      );
    }
    setTimeout(() => router.push("/dashboard"), 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processLogin(email, selectedRole);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "row",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        backgroundColor: "#ffffff",
      }}
    >
      {/* ================= LEFT COLUMN: HERO & BRANDING (50% WIDTH) ================= */}
      <div
        style={{
          flex: "0 0 50%",
          width: "50%",
          minHeight: "100vh",
          background: "linear-gradient(180deg, #f0f6ff 0%, #e6f0fe 50%, #d8e7fc 100%)",
          padding: "48px 56px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        {/* Soft background aura */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "-10%",
            width: "450px",
            height: "450px",
            background: "radial-gradient(circle, rgba(147, 197, 253, 0.4) 0%, transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />

        {/* Top Brand Logo */}
        <div style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.28)",
            }}
          >
            <svg viewBox="0 0 24 24" style={{ width: "24px", height: "24px", fill: "currentColor" }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 4h7v5h5v11H6V4zm2 8v2h8v-2H8zm0 4v2h5v-2H8z" />
            </svg>
          </div>
          <span style={{ fontSize: "24px", fontWeight: "900", color: "#0f172a", letterSpacing: "-0.5px" }}>
            WorldX
          </span>
        </div>

        {/* Center Content: Headline & 3D Layered Document Cards */}
        <div style={{ position: "relative", zIndex: 10, margin: "auto 0", padding: "24px 0", maxWidth: "520px" }}>
          <h1
            style={{
              fontSize: "44px",
              lineHeight: "1.15",
              fontWeight: "900",
              color: "#0f172a",
              letterSpacing: "-1px",
              margin: "0 0 16px 0",
            }}
          >
            Create.<br />
            Share.<br />
            Sign. All in<br />
            <span style={{ color: "#2563eb" }}>one place.</span>
          </h1>

          <p
            style={{
              fontSize: "15px",
              lineHeight: "1.6",
              color: "#475569",
              margin: "0 0 36px 0",
              maxWidth: "420px",
            }}
          >
            Professional quotations, agreements and documents for your organization.
          </p>

          {/* 3D Layered Document Mockup Illustration */}
          <div style={{ position: "relative", width: "320px", height: "240px" }}>
            {/* Back sheet: Faint tilted document */}
            <div
              style={{
                position: "absolute",
                left: "4px",
                top: "16px",
                width: "210px",
                height: "210px",
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                borderRadius: "16px",
                border: "1px solid rgba(255, 255, 255, 0.9)",
                boxShadow: "0 8px 20px rgba(100, 116, 139, 0.08)",
                transform: "rotate(-12deg)",
                padding: "16px",
                boxSizing: "border-box",
                pointerEvents: "none",
              }}
            >
              <div style={{ height: "8px", background: "#cbd5e1", borderRadius: "9999px", width: "65%", marginBottom: "8px" }} />
              <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "9999px", width: "95%", marginBottom: "8px" }} />
              <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "9999px", width: "80%" }} />
            </div>

            {/* Middle sheet: Solid royal blue card */}
            <div
              style={{
                position: "absolute",
                left: "30px",
                top: "14px",
                width: "215px",
                height: "215px",
                backgroundColor: "#2563eb",
                borderRadius: "16px",
                boxShadow: "0 16px 30px rgba(37, 99, 235, 0.35)",
                transform: "rotate(-6deg)",
              }}
            />

            {/* Front sheet: Main Quotation Document Card with Signature */}
            <div
              style={{
                position: "absolute",
                left: "60px",
                top: "0px",
                width: "230px",
                height: "235px",
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                border: "1px solid #f1f5f9",
                boxShadow: "0 20px 40px rgba(15, 23, 42, 0.12)",
                padding: "18px",
                boxSizing: "border-box",
                transform: "rotate(3deg)",
              }}
            >
              <div style={{ marginBottom: "14px" }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "900",
                    color: "#334155",
                    letterSpacing: "0.8px",
                    textTransform: "uppercase",
                  }}
                >
                  QUOTATION
                </span>
              </div>

              {/* Document Line Placeholders */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ height: "7px", backgroundColor: "#dbeafe", borderRadius: "9999px", width: "85%" }} />
                <div style={{ height: "6px", backgroundColor: "#f1f5f9", borderRadius: "9999px", width: "100%" }} />
                <div style={{ height: "6px", backgroundColor: "#f1f5f9", borderRadius: "9999px", width: "80%" }} />
                <div style={{ height: "6px", backgroundColor: "#f1f5f9", borderRadius: "9999px", width: "70%" }} />
              </div>

              {/* Bottom Stamp & Pen Signature */}
              <div
                style={{
                  position: "absolute",
                  bottom: "16px",
                  left: "18px",
                  right: "18px",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  paddingTop: "12px",
                  borderTop: "1px solid #f1f5f9",
                }}
              >
                {/* Stamp block */}
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    backgroundColor: "#eff6ff",
                    border: "1px solid #dbeafe",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ width: "20px", height: "20px", borderRadius: "4px", backgroundColor: "#bfdbfe" }} />
                </div>

                {/* Digital ink signature */}
                <div>
                  <svg viewBox="0 0 100 40" style={{ width: "75px", height: "34px", overflow: "visible" }}>
                    <path
                      d="M 5 28 Q 20 5, 35 25 T 60 15 T 85 22 T 95 10"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom 3 Feature Pills */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            paddingTop: "24px",
            borderTop: "1px solid rgba(203, 213, 225, 0.6)",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
            maxWidth: "460px",
          }}
        >
          {/* 1. Create Documents */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "#dbeafe",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "6px",
              }}
            >
              <FileText style={{ width: "20px", height: "20px" }} />
            </div>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#334155", lineHeight: "1.3" }}>
              Create<br />Documents
            </span>
          </div>

          {/* 2. Share Securely */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "#d1fae5",
                color: "#059669",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "6px",
              }}
            >
              <Share2 style={{ width: "20px", height: "20px" }} />
            </div>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#334155", lineHeight: "1.3" }}>
              Share<br />Securely
            </span>
          </div>

          {/* 3. Get Signatures */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "#f3e8ff",
                color: "#9333ea",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "6px",
              }}
            >
              <ShieldCheck style={{ width: "20px", height: "20px" }} />
            </div>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#334155", lineHeight: "1.3" }}>
              Get<br />Signatures
            </span>
          </div>
        </div>
      </div>

      {/* ================= RIGHT COLUMN: SIGN IN FORM (50% WIDTH, FULLY CENTERED) ================= */}
      <div
        style={{
          flex: "0 0 50%",
          width: "50%",
          minHeight: "100vh",
          backgroundColor: "#ffffff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 32px",
          boxSizing: "border-box",
          overflowY: "auto",
        }}
      >
        <div style={{ width: "100%", maxWidth: "420px", margin: "auto 0" }}>
          {/* Centered Top Brand Logo in Right Column */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: "24px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "#2563eb",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 16px rgba(37, 99, 235, 0.25)",
                marginBottom: "10px",
              }}
            >
              <svg viewBox="0 0 24 24" style={{ width: "28px", height: "28px", fill: "currentColor" }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 4h7v5h5v11H6V4zm2 8v2h8v-2H8zm0 4v2h5v-2H8z" />
              </svg>
            </div>
            <span style={{ fontSize: "24px", fontWeight: "900", color: "#0f172a", letterSpacing: "-0.5px" }}>
              WorldX
            </span>

            <h2
              style={{
                fontSize: "28px",
                fontWeight: "800",
                color: "#0f172a",
                letterSpacing: "-0.5px",
                marginTop: "16px",
                marginBottom: "4px",
              }}
            >
              Welcome Back
            </h2>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
              Sign in to your workspace
            </p>
          </div>

          {/* Quick Demo Credentials 4 Roles */}
          <div
            style={{
              marginBottom: "20px",
              padding: "12px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "14px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "between",
                marginBottom: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: "800",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  color: "#64748b",
                  flex: 1,
                }}
              >
                1-Click Demo Credentials:
              </span>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: "700",
                  color: "#2563eb",
                  backgroundColor: "#eff6ff",
                  padding: "2px 8px",
                  borderRadius: "9999px",
                }}
              >
                4 Roles
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {demoAccounts.map((acc) => {
                const Icon = acc.icon;
                const isSelected = email === acc.email;
                return (
                  <button
                    key={acc.roleKey}
                    type="button"
                    onClick={() => handleQuickLogin(acc)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 10px",
                      borderRadius: "10px",
                      border: isSelected ? "1.5px solid #2563eb" : "1px solid #e2e8f0",
                      backgroundColor: isSelected ? "#ffffff" : "#ffffff",
                      boxShadow: isSelected ? "0 2px 6px rgba(37,99,235,0.15)" : "none",
                      cursor: "pointer",
                      textAlign: "left",
                      boxSizing: "border-box",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div
                      style={{
                        width: "26px",
                        height: "26px",
                        borderRadius: "6px",
                        backgroundColor: acc.bgColor,
                        color: acc.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon style={{ width: "14px", height: "14px" }} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#0f172a", whiteSpace: "nowrap" }}>
                          {acc.name}
                        </span>
                        {isSelected && <Check style={{ width: "12px", height: "12px", color: "#2563eb" }} />}
                      </div>
                      <span
                        style={{
                          fontSize: "9px",
                          color: "#64748b",
                          display: "block",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {acc.subtitle}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            {/* Email Field with Bulletproof Box Model */}
            <div style={{ position: "relative", width: "100%", marginBottom: "16px" }}>
              <div
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                  display: "flex",
                  alignItems: "center",
                  pointerEvents: "none",
                  zIndex: 2,
                }}
              >
                <Mail style={{ width: "18px", height: "18px" }} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                style={{
                  width: "100%",
                  height: "48px",
                  padding: "0 16px 0 44px",
                  backgroundColor: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "12px",
                  fontSize: "14px",
                  color: "#0f172a",
                  outline: "none",
                  display: "block",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
            </div>

            {/* Password Field with Bulletproof Box Model */}
            <div style={{ position: "relative", width: "100%", marginBottom: "16px" }}>
              <div
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                  display: "flex",
                  alignItems: "center",
                  pointerEvents: "none",
                  zIndex: 2,
                }}
              >
                <Lock style={{ width: "18px", height: "18px" }} />
              </div>
              <input
                type={showPass ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                style={{
                  width: "100%",
                  height: "48px",
                  padding: "0 44px 0 44px",
                  backgroundColor: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "12px",
                  fontSize: "14px",
                  color: "#0f172a",
                  outline: "none",
                  display: "block",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: "absolute",
                  right: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                  display: "flex",
                  alignItems: "center",
                  padding: "4px",
                  zIndex: 2,
                }}
              >
                {showPass ? <Eye style={{ width: "18px", height: "18px" }} /> : <EyeOff style={{ width: "18px", height: "18px" }} />}
              </button>
            </div>

            {/* Remember me & Forgot Password */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "13px",
                marginBottom: "20px",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  color: "#475569",
                  userSelect: "none",
                }}
              >
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  style={{
                    width: "16px",
                    height: "16px",
                    accentColor: "#2563eb",
                    cursor: "pointer",
                  }}
                />
                <span style={{ fontWeight: "500" }}>Remember me</span>
              </label>
              <a
                href="#"
                style={{
                  fontWeight: "600",
                  color: "#2563eb",
                  textDecoration: "none",
                }}
              >
                Forgot password?
              </a>
            </div>

            {/* Blue Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                height: "48px",
                backgroundColor: "#2563eb",
                color: "#ffffff",
                border: "none",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
                transition: "background-color 0.15s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            {/* Divider "or" */}
            <div
              style={{
                position: "relative",
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div style={{ width: "100%", borderTop: "1px solid #e2e8f0" }} />
              </div>
              <span
                style={{
                  position: "relative",
                  backgroundColor: "#ffffff",
                  padding: "0 12px",
                  fontSize: "12px",
                  color: "#94a3b8",
                  fontWeight: "500",
                }}
              >
                or
              </span>
            </div>

            {/* Google Button */}
            <button
              type="button"
              onClick={() => processLogin(email, selectedRole)}
              style={{
                width: "100%",
                height: "46px",
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                color: "#334155",
                fontSize: "14px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                transition: "background-color 0.15s ease",
              }}
            >
              <svg style={{ width: "18px", height: "18px" }} viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </form>

          {/* Contact Admin Footer */}
          <div style={{ marginTop: "28px", textAlign: "center", fontSize: "13px", color: "#64748b" }}>
            Don&apos;t have an account?{" "}
            <a
              href="#"
              style={{
                color: "#2563eb",
                fontWeight: "700",
                textDecoration: "none",
              }}
            >
              Contact your administrator
            </a>
          </div>
        </div>

        {/* Bottom subtle copyright */}
        <div style={{ marginTop: "auto", paddingTop: "16px", textAlign: "center" }}>
          <span style={{ fontSize: "11px", color: "#94a3b8" }}>
            WorldX Enterprise Quotation &amp; MOU White-Label Platform
          </span>
        </div>
      </div>
    </div>
  );
}
