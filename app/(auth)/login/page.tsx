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
  PenTool,
  X,
  Send,
  CheckCircle2,
  Phone,
  Building,
  KeyRound,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Sparkles,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { adminLogin } from "@/lib/adminStorage";

export default function WorldXLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("priya@acme.com");
  const [password, setPassword] = useState("Password@123");
  const [remember, setRemember] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [selectedRole, setSelectedRole] = useState<
    "editor" | "org_admin" | "platform_admin" | "recipient"
  >("editor");

  // Google OAuth Modal State
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleSigningIn, setGoogleSigningIn] = useState<string | null>(null);
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);

  // Forgot Password Modal State
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<"email" | "code" | "success">("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [sentCode, setSentCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  // Contact Administrator Modal State
  const [showContactAdminModal, setShowContactAdminModal] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactRole, setContactRole] = useState("Editor / Quotations");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

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
    processLogin(account.email, account.password, account.roleKey);
  };

  const processLogin = async (userEmail: string, userPass: string, roleHint?: string) => {
    setLoading(true);
    setAuthError("");

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userEmail, password: userPass }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setAuthError(data?.error?.message || "Invalid email or password.");
        setLoading(false);
        return;
      }

      // Successful authentication: backend establishes HttpOnly vx_session cookie
      const user = data.data?.user;
      const role = user?.role;

      if (role === "SUPER_ADMIN" || role === "SUPPORT_ADMIN" || roleHint === "platform_admin") {
        router.push("/admin/dashboard");
      } else if (role === "RECIPIENT" || roleHint === "recipient") {
        router.push("/recipient/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setAuthError("Unable to reach authentication server. Please check your connection.");
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processLogin(email, password, selectedRole);
  };

  // Google accounts available for quick sign-in
  const googleAccounts = [
    {
      name: "Rahul Sharma",
      email: "rahul.sharma@acme.com",
      role: "org_admin" as const,
      org: "Acme Technologies Pvt Ltd",
      badge: "Org Admin",
      badgeBg: "#eef2ff",
      badgeColor: "#4f46e5",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
      initials: "RS",
    },
    {
      name: "Priya Singh",
      email: "priya.singh@acme.com",
      role: "editor" as const,
      org: "Acme Technologies Pvt Ltd",
      badge: "Editor",
      badgeBg: "#eff6ff",
      badgeColor: "#2563eb",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces",
      initials: "PS",
    },
    {
      name: "John Doe",
      email: "john.doe@techsolutions.com",
      role: "recipient" as const,
      org: "Tech Solutions Inc",
      badge: "Recipient / Signer",
      badgeBg: "#ecfdf5",
      badgeColor: "#059669",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
      initials: "JD",
    },
    {
      name: "Super Admin",
      email: "admin@vorldx.com",
      role: "platform_admin" as const,
      org: "WorldX Global Platform",
      badge: "Platform Admin",
      badgeBg: "#faf5ff",
      badgeColor: "#9333ea",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces",
      initials: "SA",
    },
  ];

  const handleSelectGoogleAccount = (acc: typeof googleAccounts[0]) => {
    setGoogleSigningIn(acc.email);
    setTimeout(() => {
      setShowGoogleModal(false);
      processLogin(acc.email, acc.role);
    }, 700);
  };

  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail || !customGoogleEmail.includes("@")) return;
    setGoogleSigningIn(customGoogleEmail);
    setTimeout(() => {
      setShowGoogleModal(false);
      processLogin(customGoogleEmail, "org_admin");
    }, 700);
  };

  const handleSendResetCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes("@")) {
      setForgotError("Please enter a valid email address.");
      return;
    }
    setForgotLoading(true);
    setForgotError("");
    setTimeout(() => {
      setSentCode("482901");
      setForgotLoading(false);
      setForgotStep("code");
    }, 600);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    if (resetCode.trim() !== sentCode && resetCode.trim() !== "123456") {
      setForgotError("Invalid code. Use verification code 482901.");
      return;
    }
    if (newPassword.length < 6) {
      setForgotError("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setForgotError("Passwords do not match.");
      return;
    }
    setForgotLoading(true);
    setTimeout(() => {
      setForgotLoading(false);
      setPassword(newPassword);
      setEmail(forgotEmail);
      setForgotStep("success");
    }, 600);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactEmail.includes("@")) {
      return;
    }
    setContactLoading(true);
    setTimeout(() => {
      if (typeof window !== "undefined") {
        const existing = JSON.parse(localStorage.getItem("vorldx_account_requests") || "[]");
        existing.push({
          id: "req_" + Date.now(),
          name: contactName,
          email: contactEmail,
          role: contactRole,
          message: contactMessage,
          date: new Date().toISOString(),
          status: "Pending",
        });
        localStorage.setItem("vorldx_account_requests", JSON.stringify(existing));
      }
      setContactLoading(false);
      setContactSubmitted(true);
    }, 600);
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

          {/* Error Banner */}
          {authError && (
            <div
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "10px",
                backgroundColor: "#fef2f2",
                border: "1px solid #fee2e2",
                color: "#b91c1c",
                fontSize: "12px",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <AlertCircle style={{ width: "16px", height: "16px", flexShrink: 0 }} />
              <span>{authError}</span>
            </div>
          )}

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
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setForgotStep("email");
                  setForgotError("");
                  setResetCode("");
                  setNewPassword("");
                  setConfirmNewPassword("");
                  setShowForgotPasswordModal(true);
                }}
                style={{
                  fontWeight: "600",
                  color: "#2563eb",
                  textDecoration: "none",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  fontSize: "13px",
                }}
              >
                Forgot password?
              </button>
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
              onClick={() => {
                setGoogleSigningIn(null);
                setShowCustomGoogleInput(false);
                setShowGoogleModal(true);
              }}
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
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f8fafc";
                e.currentTarget.style.borderColor = "#cbd5e1";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#ffffff";
                e.currentTarget.style.borderColor = "#e2e8f0";
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
            <button
              type="button"
              onClick={() => {
                setContactSubmitted(false);
                setContactName("");
                setContactEmail("");
                setContactMessage("");
                setShowContactAdminModal(true);
              }}
              style={{
                color: "#2563eb",
                fontWeight: "700",
                textDecoration: "none",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
                fontSize: "13px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
            >
              Contact your administrator
            </button>
          </div>
        </div>

        {/* Bottom subtle copyright */}
        <div style={{ marginTop: "auto", paddingTop: "16px", textAlign: "center" }}>
          <span style={{ fontSize: "11px", color: "#94a3b8" }}>
            WorldX Enterprise Quotation &amp; MOU White-Label Platform
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. GOOGLE OAUTH MODAL                                                     */}
      {/* ========================================================================= */}
      {showGoogleModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setShowGoogleModal(false)}
        >
          <div
            style={{
              width: "440px",
              maxWidth: "100%",
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
              border: "1px solid #e2e8f0",
              animation: "fadeIn 0.2s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "24px 24px 16px 24px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <svg style={{ width: "24px", height: "24px" }} viewBox="0 0 24 24">
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
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    Sign in with Google
                  </h3>
                  <p
                    style={{
                      margin: "2px 0 0 0",
                      fontSize: "12px",
                      color: "#64748b",
                    }}
                  >
                    Choose an account to continue to WorldX
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                  padding: "4px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X style={{ width: "18px", height: "18px" }} />
              </button>
            </div>

            {/* Account List */}
            <div style={{ padding: "12px 16px" }}>
              {googleAccounts.map((acc) => {
                const isSelected = googleSigningIn === acc.email;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    disabled={googleSigningIn !== null}
                    onClick={() => handleSelectGoogleAccount(acc)}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      backgroundColor: isSelected ? "#eff6ff" : "transparent",
                      border: "none",
                      borderRadius: "12px",
                      cursor: googleSigningIn !== null ? "not-allowed" : "pointer",
                      textAlign: "left",
                      transition: "background-color 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected && !googleSigningIn) {
                        e.currentTarget.style.backgroundColor = "#f8fafc";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "50%",
                          overflow: "hidden",
                          border: "1.5px solid #e2e8f0",
                          backgroundColor: "#f1f5f9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "13px",
                          color: "#334155",
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={acc.avatar}
                          alt={acc.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                        <span>{acc.initials}</span>
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span
                            style={{
                              fontSize: "13.5px",
                              fontWeight: 700,
                              color: "#0f172a",
                            }}
                          >
                            {acc.name}
                          </span>
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: 700,
                              padding: "2px 7px",
                              borderRadius: "6px",
                              backgroundColor: acc.badgeBg,
                              color: acc.badgeColor,
                            }}
                          >
                            {acc.badge}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#64748b",
                            marginTop: "2px",
                          }}
                        >
                          {acc.email}
                        </div>
                      </div>
                    </div>

                    {isSelected ? (
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#2563eb",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            width: "12px",
                            height: "12px",
                            border: "2px solid #2563eb",
                            borderTopColor: "transparent",
                            borderRadius: "50%",
                            animation: "spin 0.8s linear infinite",
                          }}
                        />
                        Signing in...
                      </div>
                    ) : (
                      <ChevronRight style={{ width: "16px", height: "16px", color: "#cbd5e1" }} />
                    )}
                  </button>
                );
              })}

              {/* Use Another Account Option */}
              <div style={{ borderTop: "1px solid #f1f5f9", marginTop: "8px", paddingTop: "8px" }}>
                {!showCustomGoogleInput ? (
                  <button
                    type="button"
                    onClick={() => setShowCustomGoogleInput(true)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      backgroundColor: "transparent",
                      border: "none",
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#2563eb",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <User style={{ width: "16px", height: "16px" }} />
                    <span>Use another Google account</span>
                  </button>
                ) : (
                  <form
                    onSubmit={handleCustomGoogleSubmit}
                    style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: "8px" }}
                  >
                    <label style={{ fontSize: "11px", fontWeight: 600, color: "#475569" }}>
                      Enter your Google email:
                    </label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        type="email"
                        value={customGoogleEmail}
                        onChange={(e) => setCustomGoogleEmail(e.target.value)}
                        placeholder="you@gmail.com"
                        required
                        style={{
                          flex: 1,
                          padding: "8px 12px",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1",
                          fontSize: "12px",
                          outline: "none",
                        }}
                      />
                      <button
                        type="submit"
                        style={{
                          padding: "8px 14px",
                          backgroundColor: "#2563eb",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Continue
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Bottom terms notice */}
            <div
              style={{
                padding: "14px 20px",
                backgroundColor: "#f8fafc",
                borderTop: "1px solid #f1f5f9",
                fontSize: "11px",
                color: "#94a3b8",
                lineHeight: 1.4,
                textAlign: "center",
              }}
            >
              To continue, Google will verify your identity and share your profile info with WorldX.
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. FORGOT PASSWORD MODAL                                                  */}
      {/* ========================================================================= */}
      {showForgotPasswordModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setShowForgotPasswordModal(false)}
        >
          <div
            style={{
              width: "460px",
              maxWidth: "100%",
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
              border: "1px solid #e2e8f0",
              padding: "28px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    backgroundColor: "#eff6ff",
                    color: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <KeyRound style={{ width: "22px", height: "22px" }} />
                </div>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "17px",
                      fontWeight: 800,
                      color: "#0f172a",
                    }}
                  >
                    Reset your password
                  </h3>
                  <p
                    style={{
                      margin: "3px 0 0 0",
                      fontSize: "12px",
                      color: "#64748b",
                    }}
                  >
                    Follow the instructions to recover account access.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(false)}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                  padding: "4px",
                  borderRadius: "8px",
                }}
              >
                <X style={{ width: "18px", height: "18px" }} />
              </button>
            </div>

            {/* Error Banner */}
            {forgotError && (
              <div
                style={{
                  marginBottom: "16px",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fee2e2",
                  color: "#dc2626",
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <AlertCircle style={{ width: "16px", height: "16px", flexShrink: 0 }} />
                <span>{forgotError}</span>
              </div>
            )}

            {/* Step 1: Enter Email */}
            {forgotStep === "email" && (
              <form onSubmit={handleSendResetCode} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      color: "#334155",
                      marginBottom: "6px",
                    }}
                  >
                    Registered Email Address
                  </label>
                  <div style={{ position: "relative" }}>
                    <Mail
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "16px",
                        height: "16px",
                        color: "#94a3b8",
                      }}
                    />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="e.g. priya@acme.com"
                      required
                      style={{
                        width: "100%",
                        height: "44px",
                        padding: "0 14px 0 38px",
                        borderRadius: "10px",
                        border: "1px solid #cbd5e1",
                        fontSize: "13px",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <p style={{ margin: "6px 0 0 0", fontSize: "11px", color: "#64748b" }}>
                    We will send a 6-digit one-time security code to verify your identity.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  style={{
                    height: "44px",
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "13.5px",
                    fontWeight: 700,
                    cursor: forgotLoading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    boxShadow: "0 2px 6px rgba(37,99,235,0.25)",
                  }}
                >
                  {forgotLoading ? (
                    <span>Sending code...</span>
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight style={{ width: "16px", height: "16px" }} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Step 2: Enter Code & New Password */}
            {forgotStep === "code" && (
              <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {/* Simulated Email Notification Banner */}
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "10px",
                    backgroundColor: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    color: "#1e40af",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 700 }}>Security Code Sent: </span>
                    <span style={{ fontFamily: "monospace", fontSize: "13px", fontWeight: 800 }}>482901</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setResetCode("482901")}
                    style={{
                      padding: "3px 8px",
                      backgroundColor: "#2563eb",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "10.5px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Autofill
                  </button>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="Enter 482901"
                    maxLength={6}
                    required
                    style={{
                      width: "100%",
                      height: "40px",
                      padding: "0 12px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "13px",
                      fontFamily: "monospace",
                      letterSpacing: "2px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                    style={{
                      width: "100%",
                      height: "40px",
                      padding: "0 12px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "13px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                    style={{
                      width: "100%",
                      height: "40px",
                      padding: "0 12px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "13px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                  <button
                    type="button"
                    onClick={() => setForgotStep("email")}
                    style={{
                      flex: 1,
                      height: "42px",
                      backgroundColor: "#f1f5f9",
                      color: "#475569",
                      border: "none",
                      borderRadius: "10px",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    style={{
                      flex: 2,
                      height: "42px",
                      backgroundColor: "#2563eb",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "10px",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: forgotLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    {forgotLoading ? "Resetting..." : "Update Password"}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Success Screen */}
            {forgotStep === "success" && (
              <div style={{ textAlign: "center", padding: "16px 8px 8px 8px" }}>
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    backgroundColor: "#ecfdf5",
                    color: "#059669",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px auto",
                  }}
                >
                  <CheckCircle2 style={{ width: "32px", height: "32px" }} />
                </div>
                <h4 style={{ margin: "0 0 6px 0", fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
                  Password Reset Successful!
                </h4>
                <p style={{ margin: "0 0 20px 0", fontSize: "12.5px", color: "#64748b", lineHeight: 1.5 }}>
                  Your password has been securely updated. You can now log into WorldX with your new credentials.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPasswordModal(false);
                    processLogin(forgotEmail, "editor");
                  }}
                  style={{
                    width: "100%",
                    height: "44px",
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "13.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 10px rgba(37,99,235,0.25)",
                  }}
                >
                  Sign In with New Password
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CONTACT ADMINISTRATOR MODAL                                            */}
      {/* ========================================================================= */}
      {showContactAdminModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setShowContactAdminModal(false)}
        >
          <div
            style={{
              width: "480px",
              maxWidth: "100%",
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
              border: "1px solid #e2e8f0",
              padding: "26px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: "18px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    backgroundColor: "#eef2ff",
                    color: "#4f46e5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Shield style={{ width: "22px", height: "22px" }} />
                </div>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "17px",
                      fontWeight: 800,
                      color: "#0f172a",
                    }}
                  >
                    Contact Organization Admin
                  </h3>
                  <p
                    style={{
                      margin: "3px 0 0 0",
                      fontSize: "12px",
                      color: "#64748b",
                    }}
                  >
                    Need an account created or elevated permissions?
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowContactAdminModal(false)}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                  padding: "4px",
                  borderRadius: "8px",
                }}
              >
                <X style={{ width: "18px", height: "18px" }} />
              </button>
            </div>

            {/* Admin Profile Card */}
            <div
              style={{
                padding: "14px 16px",
                borderRadius: "12px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                marginBottom: "18px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      backgroundColor: "#2563eb",
                      color: "#ffffff",
                      fontSize: "13px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    RS
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                      Rahul Sharma
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>
                      Org Administrator • Acme Technologies Pvt Ltd
                    </div>
                  </div>
                </div>
                <a
                  href="mailto:admin@acme.com?subject=WorldX%20Account%20Access%20Request"
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "11.5px",
                    fontWeight: 600,
                    color: "#2563eb",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Mail style={{ width: "13px", height: "13px" }} />
                  <span>Email</span>
                </a>
              </div>
            </div>

            {/* Form or Success State */}
            {!contactSubmitted ? (
              <form onSubmit={handleContactSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                    Your Full Name <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Ankit Verma"
                    required
                    style={{
                      width: "100%",
                      height: "38px",
                      padding: "0 12px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "12.5px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                    Your Work Email <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="ankit@acme.com"
                    required
                    style={{
                      width: "100%",
                      height: "38px",
                      padding: "0 12px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "12.5px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                    Requested Role / Access
                  </label>
                  <select
                    value={contactRole}
                    onChange={(e) => setContactRole(e.target.value)}
                    style={{
                      width: "100%",
                      height: "38px",
                      padding: "0 10px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "12.5px",
                      outline: "none",
                      boxSizing: "border-box",
                      backgroundColor: "#ffffff",
                    }}
                  >
                    <option value="Editor / Quotations">Editor (Create, Edit & Send Quotations/MOUs)</option>
                    <option value="Approver / Manager">Document Approver (Authorize high-value deals)</option>
                    <option value="Viewer / Auditor">Viewer (Read-only document audit)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                    Note for Administrator (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Explain why you need access..."
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "12px",
                      outline: "none",
                      boxSizing: "border-box",
                      resize: "none",
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                  <button
                    type="button"
                    onClick={() => setShowContactAdminModal(false)}
                    style={{
                      flex: 1,
                      height: "40px",
                      backgroundColor: "#f1f5f9",
                      color: "#475569",
                      border: "none",
                      borderRadius: "10px",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={contactLoading}
                    style={{
                      flex: 2,
                      height: "40px",
                      backgroundColor: "#2563eb",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "10px",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: contactLoading ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    {contactLoading ? (
                      <span>Submitting...</span>
                    ) : (
                      <>
                        <Send style={{ width: "14px", height: "14px" }} />
                        <span>Send Request</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ textAlign: "center", padding: "16px 8px 8px 8px" }}>
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    backgroundColor: "#ecfdf5",
                    color: "#059669",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px auto",
                  }}
                >
                  <CheckCircle2 style={{ width: "32px", height: "32px" }} />
                </div>
                <h4 style={{ margin: "0 0 6px 0", fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
                  Access Request Submitted!
                </h4>
                <p style={{ margin: "0 0 20px 0", fontSize: "12.5px", color: "#64748b", lineHeight: 1.5 }}>
                  Your request has been logged and sent to <strong>Rahul Sharma (admin@acme.com)</strong>. An invitation link will be sent to <strong>{contactEmail}</strong> once approved.
                </p>
                <button
                  type="button"
                  onClick={() => setShowContactAdminModal(false)}
                  style={{
                    width: "100%",
                    height: "42px",
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Done
                </button>
              </div>
            )}

            {/* External Recipient Link */}
            <div
              style={{
                marginTop: "16px",
                paddingTop: "14px",
                borderTop: "1px solid #f1f5f9",
                textAlign: "center",
                fontSize: "12px",
                color: "#64748b",
              }}
            >
              Are you an external client or signer?{" "}
              <a
                href="/register"
                style={{
                  color: "#2563eb",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Register directly here →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
