"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react";

interface VerificationData {
  valid: boolean;
  email: string;
  role: string;
  organizationName: string;
  inviterName?: string | null;
  expiresAt: string;
  hasExistingAccount?: boolean;
  hasPassword?: boolean;
}

function InvitePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteData, setInviteData] = useState<VerificationData | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function verify() {
      if (!token) {
        if (isMounted) {
          setError("No invitation token provided. Please check your invitation link.");
          setLoading(false);
        }
        return;
      }

      try {
        const res = await fetch(
          `/api/v1/organization/team/invite/verify?token=${encodeURIComponent(token)}`
        );
        const data = await res.json().catch(() => null);

        if (!isMounted) return;

        if (!res.ok) {
          setError(
            data?.error?.message ||
              "Invalid or expired invitation token. Please ask your administrator to resend your invite."
          );
          setLoading(false);
          return;
        }

        if (data?.data) {
          setInviteData(data.data);
          setName(data.data.email.split("@")[0]);
        }
        setLoading(false);
      } catch {
        if (isMounted) {
          setError(
            "Unable to connect to verification server. Please check your connection."
          );
          setLoading(false);
        }
      }
    }

    verify();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleAcceptWithPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError("Please enter your name.");
      return;
    }

    if (password.length < 8) {
      setFormError("Password must be at least 8 characters long.");
      return;
    }

    const hasLetter = /[a-zA-Z]/.test(password);
    const hasDigitOrSpecial = /[\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
    if (!hasLetter || !hasDigitOrSpecial) {
      setFormError("Password must contain both letters and at least one number or special character.");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/v1/organization/team/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          name: name.trim(),
          password,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setFormError(data?.error?.message || "Failed to accept invitation. Please try again.");
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setSubmitting(false);
    } catch {
      setFormError("Unable to reach server. Please try again.");
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    router.push("/api/v1/auth/google");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-blue-50/70 via-slate-50 to-indigo-50/40 flex flex-col items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-slate-200/80 p-10 max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
            <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
          </div>
          <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Verifying Invitation...</h2>
          <p className="text-xs text-slate-500">Connecting securely to authenticate your workspace invite.</p>
        </div>
      </div>
    );
  }

  if (error || !inviteData) {
    return (
      <div className="min-h-screen bg-linear-to-b from-red-50/40 via-slate-50 to-slate-100/50 flex flex-col items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border border-red-100 p-8 max-w-md w-full text-center space-y-5">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-red-100">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Invitation Issue</h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">{error}</p>
          </div>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
            >
              <span>Back to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-linear-to-b from-blue-50/60 via-slate-50 to-emerald-50/40 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full p-8 sm:p-10 space-y-6 text-center">
          <div className="relative mx-auto w-16 h-16">
            <div className="absolute inset-0 rounded-full bg-emerald-400 blur-md opacity-30 animate-pulse" />
            <div className="relative w-16 h-16 bg-linear-to-tr from-emerald-500 to-teal-400 text-white rounded-2xl flex items-center justify-center shadow-lg mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold uppercase tracking-wider">
              Invitation Accepted
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome to the Team!</h1>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Your member account for <strong className="text-slate-800">{inviteData.organizationName}</strong> is ready. You can now access your dashboard and documents.
            </p>
          </div>

          {/* Account Profile Badge */}
          <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 text-left space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
              <span className="text-slate-500 font-medium">Workspace</span>
              <span className="font-bold text-slate-900">{inviteData.organizationName}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
              <span className="text-slate-500 font-medium">Account Email</span>
              <span className="font-bold text-slate-900">{inviteData.email}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 font-medium">Assigned Role</span>
              <span className="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-bold text-[11px]">
                {inviteData.role}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl text-xs transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              <span>Enter Workspace Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50/70 via-slate-50 to-indigo-50/40 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full p-8 sm:p-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl shadow-lg shadow-blue-500/20">
            VX
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">You&apos;re Invited!</h1>
            <p className="text-xs text-slate-500 mt-1">
              {inviteData.inviterName || "An administrator"} invited you to join
            </p>
          </div>
          <div className="inline-flex items-center gap-2 bg-blue-50/80 border border-blue-200/80 text-blue-800 px-4 py-1.5 rounded-full text-xs font-bold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>{inviteData.organizationName}</span>
          </div>
        </div>

        {/* Invited Account Details Card */}
        <div className="bg-slate-50/80 border border-slate-200/70 rounded-2xl p-4 space-y-2.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Invited Email:</span>
            <span className="font-bold text-slate-900">{inviteData.email}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Assigned Role:</span>
            <span className="inline-block px-2.5 py-0.5 bg-blue-100/80 text-blue-800 rounded-md font-bold text-[11px]">
              {inviteData.role}
            </span>
          </div>
        </div>

        {/* Option A: Quick Google Sign-In */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 px-5 py-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl font-bold text-xs transition-all shadow-xs hover:shadow-sm cursor-pointer"
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
            <span>Continue with Google</span>
          </button>
          <p className="text-[11px] text-center text-slate-400">
            Fast sign-in if your Google account matches <span className="font-semibold text-slate-600">{inviteData.email}</span>
          </p>
        </div>

        {/* Divider */}
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider text-slate-400">
            <span className="bg-white px-3">or create password</span>
          </div>
        </div>

        {/* Option B: Set Password Form */}
        <form onSubmit={handleAcceptWithPassword} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-red-700 font-medium">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                disabled={submitting}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 font-medium text-slate-800 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Create Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                disabled={submitting}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 font-medium text-slate-800 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            {/* Live Password Checklist */}
            <div className="mt-2 space-y-1 text-[11px]">
              <div className={`flex items-center gap-1.5 ${password.length >= 8 ? "text-emerald-600 font-medium" : "text-slate-400"}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${password.length >= 8 ? "bg-emerald-500" : "bg-slate-300"}`} />
                <span>At least 8 characters</span>
              </div>
              <div className={`flex items-center gap-1.5 ${/[a-zA-Z]/.test(password) && /[\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) ? "text-emerald-600 font-medium" : "text-slate-400"}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${/[a-zA-Z]/.test(password) && /[\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) ? "bg-emerald-500" : "bg-slate-300"}`} />
                <span>Contains letters and numbers or symbols</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                disabled={submitting}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 font-medium text-slate-800 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-[11px] text-red-500 mt-1">Passwords do not match.</p>
            )}
            {confirmPassword && password === confirmPassword && (
              <p className="text-[11px] text-emerald-600 mt-1 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || password.length < 8 || password !== confirmPassword}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-xs"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Configuring Your Account...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Accept &amp; Set Password</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      }
    >
      <InvitePageContent />
    </Suspense>
  );
}
