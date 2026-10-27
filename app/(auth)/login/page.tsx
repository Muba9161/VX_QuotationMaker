"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Hexagon, FileCheck } from "lucide-react";

export default function OrgLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@acme.com");
  const [password, setPassword] = useState("••••••••••••");
  const [remember, setRemember] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("vorldx_org_auth", JSON.stringify({ email, name: "Rahul Sharma", role: "Org Admin" }));
    }
    setTimeout(() => {
      router.push("/dashboard");
    }, 600);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 font-sans bg-white">
      {/* Left side: Login Form */}
      <div className="flex flex-col justify-between p-8 sm:p-14 lg:p-20">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Hexagon className="w-4 h-4 fill-white/20 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 leading-none">VorldX</span>
              <p className="text-[10px] text-slate-400">Business Documents, Simplified</p>
            </div>
          </div>
        </div>

        <div className="max-w-md w-full mx-auto my-auto py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome to<br />Acme Technologies
            </h1>
            <p className="text-sm text-slate-500 mt-2">Sign in to your workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span>Remember me</span>
              </label>
              <a href="#" className="font-semibold text-blue-600 hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 transition-all disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <span className="relative px-4 bg-white text-xs text-slate-400">or</span>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="w-full py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <span className="text-red-500 font-bold">G</span>
              <span>Sign in with Google</span>
            </button>
          </form>
        </div>

        <div className="text-xs text-slate-400 text-center">
          Protected by VorldX Identity &bull; 256-bit Encrypted
        </div>
      </div>

      {/* Right side: Illustration & Branding Banner */}
      <div className="hidden md:flex flex-col justify-center items-center p-12 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-md text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl">
            <FileCheck className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight">
            Create. Share. Sign.<br />
            <span className="text-blue-200">All in your brand.</span>
          </h2>

          <p className="text-sm text-blue-100 font-normal leading-relaxed">
            Professional quotations and MOUs with your company letterhead, automated calculations, and secure legal digital signatures.
          </p>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl text-left space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-semibold text-white/80">ACME TECHNOLOGIES</span>
              <span className="text-[10px] bg-emerald-400/20 text-emerald-200 px-2 py-0.5 rounded-full font-medium">VERIFIED</span>
            </div>
            <div className="space-y-1.5">
              <div className="h-2.5 bg-white/30 rounded-full w-3/4"></div>
              <div className="h-2.5 bg-white/20 rounded-full w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
