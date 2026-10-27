"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, UserCheck, Shield } from "lucide-react";

export default function OrgLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("priya@company.com");
  const [password, setPassword] = useState("•••••••••••••");
  const [remember, setRemember] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLoginWithRole = (roleType: "Editor" | "Org Admin") => {
    setLoading(true);
    const authData =
      roleType === "Editor"
        ? { email: "priya@company.com", name: "Priya Singh", role: "Editor", avatar: "PS" }
        : { email: "admin@company.com", name: "Rahul Sharma", role: "Org Admin", avatar: "RS" };

    if (typeof window !== "undefined") {
      localStorage.setItem("vorldx_org_auth", JSON.stringify(authData));
    }
    setTimeout(() => {
      router.push("/dashboard");
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const isEditor =
      email.toLowerCase().includes("editor") ||
      email.toLowerCase().includes("priya") ||
      !email.toLowerCase().includes("admin");

    const authData = isEditor
      ? { email, name: "Priya Singh", role: "Editor", avatar: "PS" }
      : { email, name: "Rahul Sharma", role: "Org Admin", avatar: "RS" };

    if (typeof window !== "undefined") {
      localStorage.setItem("vorldx_org_auth", JSON.stringify(authData));
    }
    setTimeout(() => {
      router.push("/dashboard");
    }, 300);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 font-sans bg-white">
      {/* Left Form (Screen 1 exact match) */}
      <div className="flex flex-col justify-between p-8 sm:p-12 lg:p-16">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 relative flex items-center justify-center shrink-0">
              <svg viewBox="0 0 48 48" className="w-8 h-8 drop-shadow-xs" fill="none">
                <circle cx="24" cy="19" r="14" fill="#0284c7" />
                <circle cx="24" cy="19" r="12" fill="#0ea5e9" />
                <path d="M18 23L15 37L24 32L33 37L30 23" fill="#0369a1" />
                <path d="M16 24L15 37L24 32" fill="#075985" />
                <path d="M32 24L33 37L24 32" fill="#0369a1" />
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
            <div>
              <span className="text-base font-bold text-slate-900 leading-none">VorldX</span>
              <p className="text-[10px] text-slate-400">Business Documents, Simplified</p>
            </div>
          </div>
        </div>

        <div className="max-w-md w-full mx-auto my-auto py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 font-medium">
              Sign in to your workspace
            </p>
          </div>

          {/* Quick Credential Switchers */}
          <div className="mb-5 p-2.5 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium text-[11px]">Quick Credentials:</span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setEmail("priya@company.com");
                  setPassword("•••••••••••••");
                  handleLoginWithRole("Editor");
                }}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 shadow-xs transition-colors"
              >
                <UserCheck className="w-3 h-3" />
                <span>Editor (Priya)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("admin@company.com");
                  setPassword("•••••••••••••");
                  handleLoginWithRole("Org Admin");
                }}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors"
              >
                <Shield className="w-3 h-3" />
                <span>Org Admin</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
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
                  className="w-full px-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
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
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
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

        <div className="text-xs text-slate-400 text-center">
          VorldX Multi-Tenant Platform &bull; Acme Technologies Workspace
        </div>
      </div>

      {/* Right Graphic Banner matching Screen 1 */}
      <div className="hidden lg:flex flex-col justify-center items-center p-12 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white relative overflow-hidden">
        {/* Soft decorative background circles */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-sky-400/20 rounded-full blur-3xl"></div>

        {/* Decorative Wave bottom pattern */}
        <div className="absolute bottom-0 inset-x-0 opacity-20 pointer-events-none">
          <svg viewBox="0 0 1440 320" className="w-full h-auto" fill="none">
            <path
              fill="#ffffff"
              d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,165.3C960,149,1056,171,1152,192C1248,213,1344,235,1392,245.3L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>

        <div className="relative z-10 max-w-md text-center space-y-6">
          <h2 className="text-3xl font-extrabold tracking-tight leading-snug">
            Create Professional<br />
            Quotations & MOUs
          </h2>

          <p className="text-xs text-blue-100/90 font-normal leading-relaxed max-w-xs mx-auto">
            Use approved templates, add details and share for digital signing.
          </p>

          {/* 3D Floating Tilted Document Previews from Screen 1 */}
          <div className="relative w-72 h-72 mx-auto pt-4">
            {/* Left Card: Quotation */}
            <div className="absolute left-2 top-4 w-48 h-60 bg-white rounded-xl shadow-2xl p-4 text-left border border-blue-50 transform -rotate-8 hover:-rotate-4 transition-all duration-300">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">QUOTATION</span>
                <span className="text-[8px] text-slate-400 font-mono">Q-001</span>
              </div>
              <div className="space-y-2">
                <div className="h-1.5 bg-blue-100 rounded-full w-4/5"></div>
                <div className="h-1.5 bg-slate-100 rounded-full w-full"></div>
                <div className="h-1.5 bg-slate-100 rounded-full w-3/4"></div>
                <div className="h-1.5 bg-slate-100 rounded-full w-5/6"></div>
              </div>
              <div className="mt-8 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-600">Total</span>
                <span className="text-[10px] font-black text-blue-600">₹35,400</span>
              </div>
            </div>

            {/* Right Card: MOU (overlapping) */}
            <div className="absolute right-2 top-14 w-48 h-60 bg-white rounded-xl shadow-2xl p-4 text-left border border-blue-50 transform rotate-8 hover:rotate-4 transition-all duration-300">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">MOU</span>
                <span className="text-[8px] text-slate-400 font-mono">MOU-001</span>
              </div>
              <div className="space-y-2">
                <div className="h-1.5 bg-indigo-100 rounded-full w-3/4"></div>
                <div className="h-1.5 bg-slate-100 rounded-full w-full"></div>
                <div className="h-1.5 bg-slate-100 rounded-full w-5/6"></div>
                <div className="h-1.5 bg-slate-100 rounded-full w-2/3"></div>
              </div>
              <div className="mt-8 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[8px] text-slate-400">Signatory</span>
                <span className="text-[9px] font-serif italic text-indigo-700 border-b border-indigo-400 pb-0.5">
                  Tech Solutions
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
