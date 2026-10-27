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
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 font-sans bg-white selection:bg-blue-100">
      {/* Left Column: Login Form */}
      <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-14 max-w-md mx-auto w-full min-h-screen">
        {/* Spacer top */}
        <div className="hidden sm:block h-2"></div>

        {/* Centered Form Container */}
        <div className="w-full my-auto py-4">
          {/* Top Logo centered */}
          <div className="flex flex-col items-center justify-center text-center mb-6">
            <div className="relative w-12 h-12 flex items-center justify-center mb-2">
              <svg viewBox="0 0 48 48" className="w-12 h-12 drop-shadow-sm" fill="none">
                <circle cx="24" cy="20" r="15" fill="#1e3a8a" />
                <circle cx="24" cy="20" r="13" fill="#2563eb" />
                <path d="M18 24L14 39L24 34L34 39L30 24" fill="#1d4ed8" />
                <path d="M16 25L14 39L24 34" fill="#1e40af" />
                <path d="M32 25L34 39L24 34" fill="#1e3a8a" />
                {/* Hexagon icon inside */}
                <path
                  d="M24 13L29 16V22L24 25L19 22V16L24 13Z"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  fill="none"
                />
                <circle cx="24" cy="19" r="2.5" fill="#ffffff" />
              </svg>
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              VorldX
            </span>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide mt-1">
              Building Virtual World with Simplicity
            </p>
          </div>

          {/* Heading centered matching screenshot */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Platform Admin Login
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-normal">
              Access the VorldX Admin Console
            </p>
          </div>

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
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                />
                <span className="font-medium">Remember me</span>
              </label>
              <a href="#" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-sm font-semibold shadow-sm transition-all disabled:opacity-70 cursor-pointer"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <span className="relative px-3 bg-white text-xs text-slate-400">or</span>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="w-full py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 active:bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold flex items-center justify-center gap-2.5 shadow-2xs transition-all cursor-pointer"
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

        {/* Footer info & switcher */}
        <div className="pt-4 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 gap-2">
          <span>VorldX Admin Console</span>
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
          >
            Org Workspace &rarr;
          </Link>
        </div>
      </div>

      {/* Right Column: Isometric Blue Preview Graphic matching reference screenshot */}
      <div className="hidden md:flex flex-col justify-center items-center p-8 lg:p-12 bg-gradient-to-b from-[#0e52d4] via-[#0d4cc7] to-[#0a3fa8] relative overflow-hidden select-none">
        {/* Soft background blue ambient circular shapes at the bottom matching reference */}
        <div className="absolute -bottom-24 -left-12 w-80 h-80 bg-blue-500/30 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -right-16 w-96 h-96 bg-[#1660ee]/40 rounded-full pointer-events-none"></div>
        <div className="absolute bottom-12 left-16 w-24 h-24 bg-blue-400/20 rounded-full pointer-events-none"></div>
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Isometric 3D Layered Cards Showcase */}
        <div className="relative w-full max-w-md h-[500px]">
          {/* Card 1: Top Right Application Window (Tilted perspective) */}
          <div
            style={{ transform: "rotate(-5deg) perspective(800px) rotateY(-8deg)" }}
            className="absolute top-6 right-0 w-64 bg-white rounded-xl shadow-2xl p-4 border border-blue-100/60"
          >
            {/* Top Bar with Icon & Placeholder lines */}
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="space-y-1">
                <div className="h-2 w-20 bg-slate-300 rounded-full"></div>
                <div className="h-1.5 w-14 bg-slate-200 rounded-full"></div>
              </div>
            </div>

            {/* List items with avatars */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700">
                  A
                </div>
                <div className="flex-1 space-y-1">
                  <div className="h-1.5 w-full bg-slate-200 rounded-full"></div>
                  <div className="h-1.5 w-3/4 bg-slate-100 rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-700">
                  B
                </div>
                <div className="flex-1 space-y-1">
                  <div className="h-1.5 w-full bg-slate-200 rounded-full"></div>
                  <div className="h-1.5 w-2/3 bg-slate-100 rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-[10px] font-bold text-purple-700">
                  C
                </div>
                <div className="flex-1 space-y-1">
                  <div className="h-1.5 w-4/5 bg-slate-200 rounded-full"></div>
                  <div className="h-1.5 w-1/2 bg-slate-100 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Status footer */}
            <div className="mt-3.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400 font-medium">
              <span>Organizations</span>
              <span className="text-blue-600 font-bold">24 Active</span>
            </div>
          </div>

          {/* Card 2: Middle Left Floating Bar Chart Card */}
          <div
            style={{ transform: "rotate(-3deg) perspective(800px) rotateX(4deg)" }}
            className="absolute top-36 left-2 w-48 bg-white rounded-xl shadow-xl p-4 border border-blue-100/60"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-800">Analytics</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            {/* Vertical Bar Columns */}
            <div className="h-20 flex items-end justify-between gap-2.5 px-1 border-b border-slate-100 pb-1">
              <div className="w-4.5 bg-blue-300 rounded-t-sm h-[40%]"></div>
              <div className="w-4.5 bg-blue-500 rounded-t-sm h-[75%]"></div>
              <div className="w-4.5 bg-blue-400 rounded-t-sm h-[55%]"></div>
              <div className="w-4.5 bg-blue-600 rounded-t-sm h-[92%]"></div>
            </div>

            <div className="flex justify-between text-[9px] text-slate-400 mt-2 font-medium">
              <span>Q1</span>
              <span>Q2</span>
              <span>Q3</span>
              <span>Q4</span>
            </div>
          </div>

          {/* Card 3: Bottom Right Floating Trend Line Chart Card */}
          <div
            style={{ transform: "rotate(4deg) perspective(800px) rotateY(6deg)" }}
            className="absolute bottom-4 right-6 w-52 bg-white rounded-xl shadow-xl p-4 border border-blue-100/60"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-800">Growth</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                +28.4%
              </span>
            </div>

            {/* Upward Line Trend Chart */}
            <div className="h-16 w-full flex items-center justify-center">
              <svg viewBox="0 0 120 40" className="w-full h-full">
                <path
                  d="M 5 32 Q 30 26, 50 20 T 85 12 T 115 5"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
                <circle cx="115" cy="5" r="3.5" fill="#2563eb" />
                <path
                  d="M 5 32 Q 30 26, 50 20 T 85 12 T 115 5 L 115 38 L 5 38 Z"
                  fill="url(#blueGrad2)"
                  opacity="0.18"
                />
                <defs>
                  <linearGradient id="blueGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1 font-medium">
              <span>Total Revenue</span>
              <span className="font-bold text-slate-700">₹4.8M</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
