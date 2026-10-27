"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Hexagon, Shield, FileText, CheckCircle2 } from "lucide-react";
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
    }, 500);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 font-sans bg-white">
      {/* Left Login Form */}
      <div className="flex flex-col justify-between p-8 sm:p-14 lg:p-20">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Hexagon className="w-5 h-5 fill-white/20 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 leading-none">VorldX</span>
              <p className="text-[10px] text-slate-400">Building Virtual World with Simplicity</p>
            </div>
          </div>
        </div>

        <div className="max-w-md w-full mx-auto my-auto py-8">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Platform Admin Login
            </h1>
            <p className="text-sm text-slate-500 mt-1.5">Access the VorldX Admin Console</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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
          VorldX Admin Console &bull; Security Level 4 &bull; 256-Bit Encrypted
        </div>
      </div>

      {/* Right Decorative Graphic Panel */}
      <div className="hidden md:flex flex-col justify-center items-center p-12 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 text-white relative overflow-hidden">
        {/* Floating cards decoration */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 w-full max-w-sm space-y-4">
          {/* Card 1 */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 shadow-2xl space-y-3 transform -rotate-3 hover:rotate-0 transition-transform">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-blue-500/40 flex items-center justify-center text-white">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-[10px] bg-emerald-400/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold">Active</span>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-white">Platform Organizations</p>
              <p className="text-[11px] text-blue-200">24 Registered &bull; 1,245 Documents</p>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="w-3/4 h-full bg-blue-300 rounded-full"></div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-5 shadow-2xl space-y-2 transform translate-x-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white text-blue-700 font-bold text-xs flex items-center justify-center">
                PA
              </div>
              <div>
                <p className="text-xs font-bold">Platform Super Admin</p>
                <p className="text-[10px] text-blue-200">VorldX Centralized Control</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
