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

  // Demo credentials for the 4 roles requested by user
  const demoAccounts = [
    {
      roleKey: "editor" as const,
      name: "Editor",
      subtitle: "Priya Singh (Acme Technologies)",
      email: "priya@acme.com",
      password: "Password@123",
      target: "/dashboard",
      icon: Briefcase,
      color: "blue",
      badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      roleKey: "org_admin" as const,
      name: "Organization Admin",
      subtitle: "Rahul Sharma (Acme Technologies)",
      email: "admin@acme.com",
      password: "Password@123",
      target: "/dashboard",
      icon: Shield,
      color: "indigo",
      badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    {
      roleKey: "platform_admin" as const,
      name: "Platform Admin",
      subtitle: "Super Admin (WorldX Platform)",
      email: "admin@vorldx.com",
      password: "Password@123",
      target: "/admin/dashboard",
      icon: User,
      color: "purple",
      badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      roleKey: "recipient" as const,
      name: "External Recipient",
      subtitle: "John Doe (Tech Solutions Pvt Ltd)",
      email: "recipient@techsolutions.com",
      password: "Password@123",
      target: "/sign/doc-1",
      icon: PenTool,
      color: "emerald",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
  ];

  const handleSelectAccount = (account: (typeof demoAccounts)[0]) => {
    setSelectedRole(account.roleKey);
    setEmail(account.email);
    setPassword(account.password);
  };

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
    if (roleHint === "recipient" || lower.includes("recipient") || lower.includes("techsolutions") || lower.includes("client")) {
      if (typeof window !== "undefined") {
        localStorage.setItem("vorldx_signer_name", "John Doe");
      }
      setTimeout(() => router.push("/sign/doc-1"), 300);
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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 font-sans bg-white selection:bg-blue-100">
      {/* ================= LEFT COLUMN: HERO & BRANDING ================= */}
      <div className="bg-gradient-to-b from-[#f2f7ff] via-[#e9f2fd] to-[#dce8fd] p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Soft radial aura glow */}
        <div className="absolute top-1/3 -left-20 w-96 h-96 bg-blue-300/25 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 right-0 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Brand Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 4h7v5h5v11H6V4zm2 8v2h8v-2H8zm0 4v2h5v-2H8z" />
            </svg>
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight">WorldX</span>
        </div>

        {/* Center Content: Headline & 3D Layered Document Cards */}
        <div className="relative z-10 my-auto py-8 max-w-lg">
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.12]">
            Create.<br />
            Share.<br />
            Sign. All in<br />
            <span className="text-blue-600">one place.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 mt-4 leading-relaxed font-normal max-w-md">
            Professional quotations, agreements and documents for your organization.
          </p>

          {/* 3D Layered Document Mockup Illustration from Screenshot */}
          <div className="relative w-full max-w-xs h-64 mx-auto sm:mx-0 mt-8">
            {/* Back sheet: Faint tilted document */}
            <div className="absolute left-1 top-2 w-56 h-56 bg-white/70 rounded-2xl border border-white/80 shadow-md transform -rotate-12 pointer-events-none p-4 space-y-2 opacity-60">
              <div className="h-2 bg-slate-200 rounded-full w-2/3"></div>
              <div className="h-1.5 bg-slate-100 rounded-full w-full"></div>
              <div className="h-1.5 bg-slate-100 rounded-full w-4/5"></div>
            </div>

            {/* Middle sheet: Solid royal blue card */}
            <div className="absolute left-6 top-4 w-56 h-56 bg-blue-600 rounded-2xl shadow-xl shadow-blue-600/30 transform -rotate-6 transition-transform"></div>

            {/* Front sheet: Main Quotation Document Card with Signature */}
            <div className="absolute left-12 top-0 w-60 h-64 bg-white rounded-2xl shadow-2xl shadow-slate-400/25 border border-slate-100/80 p-5 transform rotate-3 hover:rotate-1 transition-all duration-300">
              {/* Document Header */}
              <div className="mb-4">
                <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">
                  QUOTATION
                </span>
              </div>

              {/* Document Line Placeholders */}
              <div className="space-y-2">
                <div className="h-2 bg-blue-100/90 rounded-full w-5/6"></div>
                <div className="h-1.5 bg-slate-100 rounded-full w-full"></div>
                <div className="h-1.5 bg-slate-100 rounded-full w-4/5"></div>
                <div className="h-1.5 bg-slate-100 rounded-full w-3/4"></div>
                <div className="h-1.5 bg-slate-100 rounded-full w-5/6"></div>
              </div>

              {/* Bottom Stamp & Pen Signature */}
              <div className="absolute bottom-4 inset-x-5 flex items-end justify-between pt-4 border-t border-slate-100">
                {/* Stamp block */}
                <div className="w-10 h-10 rounded-lg bg-blue-50/80 border border-blue-100 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-md bg-blue-200/50"></div>
                </div>

                {/* Digital ink signature */}
                <div className="relative">
                  <svg viewBox="0 0 100 40" className="w-20 h-10 overflow-visible">
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
        <div className="relative z-10 pt-4 grid grid-cols-3 gap-3 border-t border-slate-200/60 max-w-md">
          {/* 1. Create Documents */}
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-blue-100/80 text-blue-600 flex items-center justify-center mb-1.5 shadow-2xs">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-700 leading-tight">Create<br />Documents</span>
          </div>

          {/* 2. Share Securely */}
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-100/80 text-emerald-600 flex items-center justify-center mb-1.5 shadow-2xs">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-700 leading-tight">Share<br />Securely</span>
          </div>

          {/* 3. Get Signatures */}
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-purple-100/80 text-purple-600 flex items-center justify-center mb-1.5 shadow-2xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-700 leading-tight">Get<br />Signatures</span>
          </div>
        </div>
      </div>

      {/* ================= RIGHT COLUMN: SIGN IN FORM ================= */}
      <div className="flex flex-col justify-between p-8 sm:p-12 lg:p-16 bg-white overflow-y-auto">
        <div className="max-w-md w-full mx-auto my-auto py-6">
          {/* Centered Logo in Right Column */}
          <div className="flex flex-col items-center justify-center mb-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 mb-3">
              <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 4h7v5h5v11H6V4zm2 8v2h8v-2H8zm0 4v2h5v-2H8z" />
              </svg>
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">WorldX</span>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-4">
              Welcome Back
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Sign in to your workspace
            </p>
          </div>

          {/* Quick Demo Credentials Tabs / Selectors (4 Roles requested) */}
          <div className="mb-6 bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 shadow-2xs">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                1-Click Quick Login as:
              </span>
              <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">
                All 4 Roles Ready
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((acc) => {
                const Icon = acc.icon;
                const isCurrent = email === acc.email;
                return (
                  <button
                    key={acc.roleKey}
                    type="button"
                    onClick={() => handleQuickLogin(acc)}
                    className={`flex items-start gap-2 p-2.5 rounded-xl border text-left transition-all ${
                      isCurrent
                        ? "bg-white border-blue-500 shadow-xs ring-2 ring-blue-500/10"
                        : "bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        acc.roleKey === "editor"
                          ? "bg-blue-50 text-blue-600"
                          : acc.roleKey === "org_admin"
                          ? "bg-indigo-50 text-indigo-600"
                          : acc.roleKey === "platform_admin"
                          ? "bg-purple-50 text-purple-600"
                          : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {acc.name}
                        </span>
                        {isCurrent && <Check className="w-3 h-3 text-blue-600 shrink-0" />}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">{acc.email}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Standard Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email field */}
            <div>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPass ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <span className="font-medium">Remember me</span>
              </label>
              <a href="#" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/25 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <span>Sign In</span>
              )}
            </button>

            {/* Or Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <span className="relative px-4 bg-white text-xs text-slate-400 font-medium">or</span>
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={() => processLogin(email, selectedRole)}
              className="w-full py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold flex items-center justify-center gap-2.5 shadow-2xs transition-colors"
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

          {/* Footer link */}
          <div className="mt-8 text-center text-xs text-slate-500 font-medium">
            Don&apos;t have an account?{" "}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-bold transition-colors">
              Contact your administrator
            </a>
          </div>
        </div>

        {/* Credentials Reference Drawer / Bottom Reference Card */}
        <div className="mt-4 pt-4 border-t border-slate-100 max-w-md w-full mx-auto">
          <div className="text-[11px] text-slate-400 font-mono text-center">
            WorldX Enterprise Quotation &amp; MOU White-Label Platform
          </div>
        </div>
      </div>
    </div>
  );
}
