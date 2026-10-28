"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { adminLogin } from "@/lib/adminStorage";

export default function PlatformAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@vorldx.com");
  const [password, setPassword] = useState("••••••••••••");
  const [remember, setRemember] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    adminLogin(email, password);
    setTimeout(() => {
      router.push("/admin/dashboard");
    }, 400);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#e8effc",
        backgroundImage: "radial-gradient(#d3e2fc 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Exact Static Card matching user image */}
      <div
        style={{
          width: "100%",
          maxWidth: "680px",
          height: "680px",
          backgroundColor: "#ffffff",
          borderRadius: "24px",
          boxShadow: "0 20px 50px -10px rgba(12, 50, 140, 0.22), 0 0 0 1px rgba(190, 210, 245, 0.6)",
          display: "flex",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Left Side: White Form Section (58% width) */}
        <div
          style={{
            flex: "0 0 58%",
            backgroundColor: "#ffffff",
            padding: "36px 32px 28px 32px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Main Form Content */}
          <div>
            {/* Logo: Ribbon Badge + VorldX Title & Subtitle */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {/* Badge Rosette Logo */}
                <div style={{ width: "36px", height: "36px", position: "relative", flexShrink: 0 }}>
                  <svg viewBox="0 0 48 48" style={{ width: "100%", height: "100%" }} fill="none">
                    <circle cx="24" cy="19" r="14" fill="#1e3a8a" />
                    <circle cx="24" cy="19" r="12" fill="#2563eb" />
                    <path d="M18 23L15 37L24 32L33 37L30 23" fill="#1d4ed8" />
                    <path d="M16 24L15 37L24 32" fill="#1e40af" />
                    <path d="M32 24L33 37L24 32" fill="#1e3a8a" />
                    <path
                      d="M24 13L28 15.5V20.5L24 23L20 20.5V15.5L24 13Z"
                      stroke="#ffffff"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                      fill="none"
                    />
                    <circle cx="24" cy="18" r="2" fill="#ffffff" />
                  </svg>
                </div>
                <div style={{ textAlign: "left" }}>
                  <span
                    style={{
                      fontSize: "22px",
                      fontWeight: 900,
                      color: "#0f172a",
                      lineHeight: "1",
                      display: "block",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    VorldX
                  </span>
                  <p
                    style={{
                      fontSize: "9px",
                      color: "#94a3b8",
                      fontWeight: 500,
                      margin: "2px 0 0 0",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Building Virtual World with Simplicity
                  </p>
                </div>
              </div>
            </div>

            {/* Title & Subtitle */}
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <h1
                style={{
                  fontSize: "22px",
                  fontWeight: 900,
                  color: "#0f172a",
                  margin: "0",
                  letterSpacing: "-0.4px",
                }}
              >
                Platform Admin Login
              </h1>
              <p style={{ fontSize: "12px", color: "#94a3b8", margin: "4px 0 0 0" }}>
                Access the VorldX Admin Console
              </p>
            </div>

            {/* Inputs Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Email */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#334155",
                    marginBottom: "5px",
                  }}
                >
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@vorldx.com"
                  style={{
                    width: "100%",
                    height: "38px",
                    padding: "0 12px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#1e293b",
                    outline: "none",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#334155",
                    marginBottom: "5px",
                  }}
                >
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: "100%",
                      height: "38px",
                      padding: "0 34px 0 12px",
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#1e293b",
                      outline: "none",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{
                      position: "absolute",
                      right: "8px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "#94a3b8",
                      cursor: "pointer",
                      padding: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot Password */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "11px",
                  paddingTop: "2px",
                }}
              >
                <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", color: "#475569" }}>
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    style={{
                      width: "14px",
                      height: "14px",
                      accentColor: "#2563eb",
                      cursor: "pointer",
                      margin: 0,
                    }}
                  />
                  <span style={{ fontWeight: 600 }}>Remember me</span>
                </label>
                <a
                  href="#"
                  style={{
                    color: "#2563eb",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Forgot password?
                </a>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  height: "40px",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  marginTop: "6px",
                  boxShadow: "0 2px 4px rgba(37, 99, 235, 0.25)",
                  transition: "background-color 0.15s",
                }}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>

              {/* Or Divider */}
              <div style={{ position: "relative", textAlign: "center", margin: "6px 0" }}>
                <div style={{ position: "absolute", inset: "0", display: "flex", alignItems: "center" }}>
                  <div style={{ width: "100%", borderTop: "1px solid #f1f5f9" }}></div>
                </div>
                <span style={{ position: "relative", backgroundColor: "#ffffff", padding: "0 8px", fontSize: "10px", color: "#94a3b8" }}>
                  or
                </span>
              </div>

              {/* Sign In With Google */}
              <button
                type="button"
                onClick={handleSubmit}
                style={{
                  width: "100%",
                  height: "38px",
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#334155",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  cursor: "pointer",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                }}
              >
                <svg style={{ width: "14px", height: "14px" }} viewBox="0 0 24 24">
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
          </div>

          {/* Bottom Switcher */}
          <div
            style={{
              paddingTop: "14px",
              borderTop: "1px solid #f8fafc",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "10px",
              color: "#94a3b8",
            }}
          >
            <span>VorldX Admin Console</span>
            <Link
              href="/dashboard"
              style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none" }}
            >
              Org Workspace &rarr;
            </Link>
          </div>
        </div>

        {/* Right Side: Vivid Royal Blue Section (42% width) */}
        <div
          style={{
            flex: "0 0 42%",
            background: "linear-gradient(180deg, #0b54dd 0%, #0947c0 50%, #073aa3 100%)",
            position: "relative",
            overflow: "hidden",
            padding: "24px 16px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            userSelect: "none",
          }}
        >
          {/* Overlapping ambient background circles at bottom */}
          <div
            style={{
              position: "absolute",
              bottom: "-40px",
              right: "-40px",
              width: "220px",
              height: "220px",
              borderRadius: "50%",
              backgroundColor: "rgba(27, 108, 240, 0.45)",
              pointerEvents: "none",
            }}
          ></div>
          <div
            style={{
              position: "absolute",
              bottom: "40px",
              left: "20px",
              width: "70px",
              height: "70px",
              borderRadius: "50%",
              backgroundColor: "rgba(22, 96, 238, 0.55)",
              pointerEvents: "none",
            }}
          ></div>

          {/* Card 1: Top-Right Tilted Window */}
          <div
            style={{
              transform: "rotate(-8deg) translateY(-10px) translateX(12px)",
              width: "210px",
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              boxShadow: "0 12px 28px rgba(0,0,0,0.18)",
              padding: "12px",
              border: "1px solid rgba(255,255,255,0.9)",
              marginLeft: "auto",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px", marginBottom: "8px" }}>
              <div
                style={{
                  width: "26px",
                  height: "26px",
                  borderRadius: "6px",
                  backgroundColor: "#1b64f2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                }}
              >
                <svg viewBox="0 0 24 24" style={{ width: "14px", height: "14px", fill: "#ffffff" }}>
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                <div style={{ width: "60px", height: "6px", backgroundColor: "#cbd5e1", borderRadius: "3px" }}></div>
                <div style={{ width: "40px", height: "4px", backgroundColor: "#e2e8f0", borderRadius: "2px" }}></div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
              <div style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "#dbeafe" }}></div>
              <div style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "#dcfce7" }}></div>
              <div style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "#f3e8ff" }}></div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ width: "100%", height: "4px", backgroundColor: "#e2e8f0", borderRadius: "2px" }}></div>
              <div style={{ width: "70%", height: "4px", backgroundColor: "#f1f5f9", borderRadius: "2px" }}></div>
            </div>
          </div>

          {/* Card 2: Middle-Left Tilted Bar Chart */}
          <div
            style={{
              transform: "rotate(-3deg) translateX(-6px)",
              width: "150px",
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              boxShadow: "0 10px 24px rgba(0,0,0,0.15)",
              padding: "10px",
              border: "1px solid rgba(255,255,255,0.9)",
              marginTop: "-10px",
            }}
          >
            <div style={{ height: "46px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "6px", padding: "0 4px 4px 4px", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ width: "14px", height: "40%", backgroundColor: "#7dd3fc", borderRadius: "3px 3px 0 0" }}></div>
              <div style={{ width: "14px", height: "75%", backgroundColor: "#3b82f6", borderRadius: "3px 3px 0 0" }}></div>
              <div style={{ width: "14px", height: "55%", backgroundColor: "#60a5fa", borderRadius: "3px 3px 0 0" }}></div>
              <div style={{ width: "14px", height: "95%", backgroundColor: "#1d4ed8", borderRadius: "3px 3px 0 0" }}></div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "7px", color: "#94a3b8", fontWeight: 600, marginTop: "4px" }}>
              <span>Q1</span>
              <span>Q2</span>
              <span>Q3</span>
              <span>Q4</span>
            </div>
          </div>

          {/* Card 3: Bottom-Right Tilted Line Chart */}
          <div
            style={{
              transform: "rotate(5deg) translateY(6px)",
              width: "175px",
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              boxShadow: "0 12px 28px rgba(0,0,0,0.18)",
              padding: "10px 12px",
              border: "1px solid rgba(255,255,255,0.9)",
              marginLeft: "auto",
              position: "relative",
              zIndex: 10,
            }}
          >
            <div style={{ height: "36px", width: "100%" }}>
              <svg viewBox="0 0 100 35" style={{ width: "100%", height: "100%" }}>
                <path
                  d="M 5 28 L 22 22 L 38 25 L 55 14 L 72 18 L 92 6"
                  fill="none"
                  stroke="#1b64f2"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="92" cy="6" r="2.5" fill="#1b64f2" />
                <path
                  d="M 5 28 L 22 22 L 38 25 L 55 14 L 72 18 L 92 6 L 92 35 L 5 35 Z"
                  fill="#1b64f2"
                  fillOpacity="0.12"
                />
              </svg>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "7.5px",
                color: "#64748b",
                fontWeight: 600,
                paddingTop: "4px",
                borderTop: "1px solid #f1f5f9",
              }}
            >
              <span>Trend Rate</span>
              <span style={{ color: "#16a34a", fontWeight: 700 }}>+34.8%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
