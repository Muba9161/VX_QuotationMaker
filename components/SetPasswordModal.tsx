"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  Shield,
} from "lucide-react";

interface SetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  hasExistingPassword?: boolean;
}

export default function SetPasswordModal({
  isOpen,
  onClose,
  onSuccess,
  hasExistingPassword: initialHasPassword,
}: SetPasswordModalProps) {
  const [hasPassword, setHasPassword] = useState<boolean>(initialHasPassword ?? false);
  const [checkingUser, setCheckingUser] = useState(initialHasPassword === undefined);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check user password status if not provided
  useEffect(() => {
    let isMounted = true;
    if (isOpen && initialHasPassword === undefined) {
      fetch("/api/v1/auth/me", { credentials: "include" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (isMounted && data?.data?.user) {
            setHasPassword(Boolean(data.data.user.hasPassword));
          }
        })
        .catch(() => {})
        .finally(() => {
          if (isMounted) setCheckingUser(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, initialHasPassword]);

  if (!isOpen) return null;

  const handleClose = () => {
    setError(null);
    setSuccess(null);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (hasPassword && !currentPassword) {
      setError("Please enter your current password.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasDigitOrSpecial = /[\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword);
    if (!hasLetter || !hasDigitOrSpecial) {
      setError("Password must contain both letters and at least one number or special character.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: hasPassword ? currentPassword : undefined,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error?.message || "Failed to update password. Please check requirements.");
        setLoading(false);
        return;
      }

      const successMsg =
        data?.data?.message ||
        (hasPassword
          ? "Password updated successfully!"
          : "Password set successfully! You can now log in using your password as well as Google.");

      setSuccess(successMsg);
      setHasPassword(true);
      setLoading(false);

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch {
      setError("Unable to connect to server. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          maxWidth: "460px",
          width: "100%",
          padding: "24px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          border: "1px solid #e2e8f0",
          boxSizing: "border-box",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
        className="space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                {hasPassword ? "Change Account Password" : "Set Account Password"}
              </h3>
              <p className="text-[11px] text-slate-500">
                {hasPassword
                  ? "Update your existing VorldX login password"
                  : "Enable email & password login alongside Google Sign-In"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info Banner for Google-only users */}
        {!hasPassword && !checkingUser && (
          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-start gap-2.5 text-xs text-blue-800">
            <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Google Account Linked:</strong> You currently sign in via Google. Setting a password gives you the flexibility to sign in using either method.
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {hasPassword && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Current Password *</label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  required
                  disabled={loading}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 font-medium text-slate-800 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              {hasPassword ? "New Password *" : "Password *"}
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                required
                disabled={loading}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-3.5 pr-10 py-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 font-medium text-slate-800 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            {/* Password Validation Checklist */}
            <div className="mt-2 space-y-1 text-[11px]">
              <div className={`flex items-center gap-1.5 ${newPassword.length >= 8 ? "text-emerald-600 font-medium" : "text-slate-400"}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${newPassword.length >= 8 ? "bg-emerald-500" : "bg-slate-300"}`} />
                <span>At least 8 characters</span>
              </div>
              <div className={`flex items-center gap-1.5 ${/[a-zA-Z]/.test(newPassword) && /[\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword) ? "text-emerald-600 font-medium" : "text-slate-400"}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${/[a-zA-Z]/.test(newPassword) && /[\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword) ? "bg-emerald-500" : "bg-slate-300"}`} />
                <span>Contains letters and numbers or symbols</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Confirm Password *</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                required
                disabled={loading}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-3.5 pr-10 py-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 font-medium text-slate-800 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-[11px] text-red-500 mt-1">Passwords do not match.</p>
            )}
            {confirmPassword && newPassword === confirmPassword && (
              <p className="text-[11px] text-emerald-600 mt-1 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Passwords match
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              disabled={loading}
              onClick={handleClose}
              className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors cursor-pointer text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || newPassword.length < 8 || newPassword !== confirmPassword}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>{hasPassword ? "Update Password" : "Set Password"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
