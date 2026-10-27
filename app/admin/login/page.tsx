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
    <div className="min-h-screen w-full flex flex-col md:flex-row font-sans bg-white selection:bg-blue-100 overflow-x-hidden">
      {/* Left Column: White Form matching Image 2 */}
      <div
        style={{
          flex: "1 1 54%",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "36px 32px",
          background: "#ffffff",
        }}
      >
        <div style={{ height: "8px" }}></div>

        {/* Centered Form Box */}
        <div
          style={{
            maxWidth: "380px",
            width: "100%",
            margin: "auto",
            padding: "10px 0",
          }}
        >
          {/* Logo matching Image 2: Horizontal Badge + VorldX Title & Subtitle */}
          <div className="flex flex-col items-center justify-center text-center mb-6">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 48 48" className="w-10 h-10 drop-shadow-xs" fill="none">
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
              <div className="text-left">
                <span className="text-2xl font-black text-[#0f172a] tracking-tight leading-none block">
                  VorldX
                </span>
                <p className="text-[10px] text-slate-400 font-medium tracking-tight mt-0.5 whitespace-nowrap">
                  Building Virtual World with Simplicity
                </p>
              </div>
            </div>
          </div>

          {/* Heading matching Image 2 */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-[25px] font-black text-[#0f172a] tracking-tight">
              Platform Admin Login
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-normal">
              Access the VorldX Admin Console
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@vorldx.com"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                />
                <span className="font-medium text-slate-700">Remember me</span>
              </label>
              <a href="#" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-[#1b64f2] hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-sm font-bold shadow-sm transition-all disabled:opacity-70 cursor-pointer tracking-wide"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <span className="relative px-3 bg-white text-xs text-slate-400 font-medium">or</span>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="w-full py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 active:bg-slate-100 text-slate-700 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 shadow-2xs transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            maxWidth: "380px",
            width: "100%",
            margin: "0 auto",
            paddingTop: "16px",
            borderTop: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "11px",
            color: "#94a3b8",
          }}
        >
          <span>VorldX Admin Console</span>
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
          >
            Org Workspace &rarr;
          </Link>
        </div>
      </div>

      {/* Right Column: Vivid Royal Blue Section matching Image 2 */}
      <div
        style={{
          flex: "1 1 46%",
          minHeight: "100vh",
          background: "linear-gradient(180deg, #0b54dd 0%, #0948c2 50%, #073ba5 100%)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "36px",
          userSelect: "none",
        }}
        className="hidden md:flex"
      >
        {/* Decorative geometric background circles at the bottom matching Image 2 */}
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            right: "-80px",
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            background: "rgba(27, 108, 240, 0.4)",
            pointerEvents: "none",
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            left: "40px",
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            background: "rgba(22, 96, 238, 0.5)",
            pointerEvents: "none",
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            bottom: "80px",
            right: "100px",
            width: "160px",
            height: "160px",
            borderRadius: "50%",
            background: "rgba(7, 55, 155, 0.6)",
            pointerEvents: "none",
          }}
        ></div>

        {/* Isometric Floating Elements Container matching Image 2 */}
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "460px",
            height: "540px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Card 1: Top-Right Tilted Dashboard Window Card */}
          <div
            style={{
              transform: "rotate(-6deg) perspective(600px)",
              marginLeft: "auto",
              width: "250px",
              background: "rgba(255, 255, 255, 0.96)",
              borderRadius: "14px",
              boxShadow: "0 20px 45px rgba(0,0,0,0.2)",
              padding: "16px",
              border: "1px solid rgba(255,255,255,0.8)",
            }}
          >
            {/* Header with blue badge & lines */}
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-2.5 mb-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#1b64f2] flex items-center justify-center text-white shadow-xs shrink-0">
                <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-white">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="space-y-1 flex-1">
                <div className="h-2 w-20 bg-slate-300 rounded-full"></div>
                <div className="h-1.5 w-12 bg-slate-200 rounded-full"></div>
              </div>
            </div>

            {/* User row avatars */}
            <div className="flex items-center justify-between px-2 py-1.5 bg-slate-50/70 rounded-md mb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-200 text-[9px] font-bold text-blue-800 flex items-center justify-center">1</div>
                <div className="w-16 h-2 bg-slate-300 rounded-full"></div>
              </div>
              <div className="w-8 h-2 bg-blue-400 rounded-full"></div>
            </div>

            <div className="space-y-1.5 px-0.5">
              <div className="h-1.5 w-full bg-slate-200 rounded-full"></div>
              <div className="h-1.5 w-4/5 bg-slate-200 rounded-full"></div>
            </div>
          </div>

          {/* Card 2: Middle-Left Tilted Bar Chart Card */}
          <div
            style={{
              transform: "rotate(-2deg) perspective(600px)",
              marginRight: "auto",
              width: "190px",
              background: "rgba(255, 255, 255, 0.96)",
              borderRadius: "14px",
              boxShadow: "0 16px 36px rgba(0,0,0,0.18)",
              padding: "14px",
              border: "1px solid rgba(255,255,255,0.8)",
              marginTop: "-20px",
              marginLeft: "8px",
            }}
          >
            {/* 4 Blue Bar Columns matching Image 2 */}
            <div className="h-16 flex items-end justify-between gap-2 px-1 pb-1 border-b border-slate-100">
              <div className="w-5 bg-sky-300 rounded-t-sm h-[40%]"></div>
              <div className="w-5 bg-blue-500 rounded-t-sm h-[75%]"></div>
              <div className="w-5 bg-blue-400 rounded-t-sm h-[55%]"></div>
              <div className="w-5 bg-blue-600 rounded-t-sm h-[95%]"></div>
            </div>
            <div className="flex justify-between text-[9px] text-slate-400 font-medium mt-1.5">
              <span>Oct</span>
              <span>Nov</span>
              <span>Dec</span>
            </div>
          </div>

          {/* Card 3: Bottom-Right Tilted Line Chart Card matching Image 2 */}
          <div
            style={{
              transform: "rotate(4deg) perspective(600px)",
              marginLeft: "auto",
              width: "220px",
              background: "rgba(255, 255, 255, 0.96)",
              borderRadius: "14px",
              boxShadow: "0 20px 45px rgba(0,0,0,0.2)",
              padding: "14px",
              border: "1px solid rgba(255,255,255,0.8)",
              marginTop: "8px",
              marginRight: "14px",
              position: "relative",
              zIndex: 10,
            }}
          >
            {/* Zig-zag Upward Line Chart SVG */}
            <div className="h-14 w-full">
              <svg viewBox="0 0 100 35" className="w-full h-full">
                <path
                  d="M 5 28 L 22 22 L 38 25 L 55 14 L 72 18 L 92 6"
                  fill="none"
                  stroke="#1b64f2"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="92" cy="6" r="3" fill="#1b64f2" />
                <path
                  d="M 5 28 L 22 22 L 38 25 L 55 14 L 72 18 L 92 6 L 92 35 L 5 35 Z"
                  fill="#1b64f2"
                  fillOpacity="0.12"
                />
              </svg>
            </div>

            {/* Mini target indicator */}
            <div className="flex items-center justify-between text-[9px] text-slate-500 font-semibold pt-1.5 border-t border-slate-100">
              <span>Conversion Rate</span>
              <span className="text-emerald-600 font-bold">+34.8%</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
