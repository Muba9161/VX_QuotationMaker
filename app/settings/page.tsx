"use client";

import React, { useState, useEffect } from "react";
import OrgLayout from "@/components/OrgLayout";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
  CheckCircle2,
  Check,
  Percent,
  Shield,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { getOrgBranding, saveOrgBranding, OrgBranding } from "@/lib/orgStorage";

export default function OrgSettingsPage() {
  const [branding, setBranding] = useState<OrgBranding>(() => getOrgBranding());
  const [activeTab, setActiveTab] = useState<
    "General" | "Document Settings" | "Notifications" | "Security & Password"
  >("General");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Security & Password tab state
  const [userProfile, setUserProfile] = useState<{
    email: string;
    name: string;
    role: string;
    hasPassword: boolean;
  } | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Additional document preferences state
  const [docPrefs, setDocPrefs] = useState({
    defaultTaxRate: 18,
    currency: "INR (₹)",
    paymentTerms: "50% advance, 50% on milestone delivery",
    notes: "Thank you for your business. Valid for 30 days.",
    enableWatermark: false,
    autoReminders: true,
  });

  // Notification toggles
  const [notifPrefs, setNotifPrefs] = useState({
    docViewed: true,
    docSigned: true,
    docExpired: true,
    memberJoined: false,
  });

  useEffect(() => {
    let isMounted = true;
    async function loadSettings() {
      try {
        const res = await fetch("/api/v1/organization/settings", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.data?.organization && isMounted) {
            const org = data.data.organization;
            const settings = data.data.settings;
            setBranding((prev) => ({
              ...prev,
              name: org.name || prev.name,
              tagline: org.tagline || prev.tagline,
              email: org.email || prev.email,
              phone: org.phone || prev.phone,
              address: org.address || prev.address,
              website: org.website || prev.website,
              allowRegistration: org.allowMemberRegistration ?? prev.allowRegistration,
              requireApproval: org.requireAdminApproval ?? prev.requireApproval,
              defaultExpiryDays: org.defaultExpiryDays || prev.defaultExpiryDays,
            }));

            if (settings) {
              setDocPrefs((prev) => ({
                ...prev,
                defaultTaxRate: settings.defaultTaxRate ?? prev.defaultTaxRate,
                currency: settings.defaultCurrency ? `${settings.defaultCurrency} (${settings.defaultCurrencySymbol || '₹'})` : prev.currency,
                paymentTerms: settings.defaultPaymentTerms ?? prev.paymentTerms,
                notes: settings.standardNotes ?? prev.notes,
                enableWatermark: settings.enableWatermark ?? prev.enableWatermark,
                autoReminders: settings.autoRemindersEnabled ?? prev.autoReminders,
              }));

              setNotifPrefs({
                docViewed: settings.notifyDocViewed ?? true,
                docSigned: settings.notifyDocSigned ?? true,
                docExpired: settings.notifyDocExpired ?? true,
                memberJoined: false,
              });
            }
            return;
          }
        }
      } catch {
        // Fallback to local storage if API is unreachable
      }

      const loaded = getOrgBranding();
      if (loaded && isMounted) {
        setBranding({
          ...loaded,
          email: loaded.email || "contact@acme.com",
          phone: loaded.phone || "+91 9876543210",
          address: loaded.address || "A-123, Sector 62, Noida, U.P. 201301",
          allowRegistration: loaded.allowRegistration ?? true,
          requireApproval: loaded.requireApproval ?? true,
          defaultExpiryDays: loaded.defaultExpiryDays || 30,
        });
      }
      // Load current user profile & password status
      try {
        const meRes = await fetch("/api/v1/auth/me", { credentials: "include" });
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData?.data?.user && isMounted) {
            setUserProfile({
              email: meData.data.user.email,
              name: meData.data.user.name,
              role: meData.data.user.role,
              hasPassword: Boolean(meData.data.user.hasPassword),
            });
          }
        }
      } catch {
        // me fetch fallback
      }
    }

    loadSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    try {
      const payload = {
        name: branding.name,
        tagline: branding.tagline,
        website: branding.website,
        email: branding.email,
        phone: branding.phone,
        address: branding.address,
        allowMemberRegistration: branding.allowRegistration,
        requireAdminApproval: branding.requireApproval,
        defaultExpiryDays: Number(branding.defaultExpiryDays) || 30,
        defaultTaxRate: Number(docPrefs.defaultTaxRate) || 18,
        defaultCurrency: docPrefs.currency.includes("USD") ? "USD" : "INR",
        defaultPaymentTerms: docPrefs.paymentTerms,
        standardNotes: docPrefs.notes,
        autoRemindersEnabled: docPrefs.autoReminders,
        notifyDocViewed: notifPrefs.docViewed,
        notifyDocSigned: notifPrefs.docSigned,
        notifyDocExpired: notifPrefs.docExpired,
      };

      const res = await fetch("/api/v1/organization/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        showToast(err?.error?.message || "Failed to save settings to server.");
        return;
      }
    } catch {
      // Local fallback
    }

    saveOrgBranding(branding);
    showToast("Settings updated successfully!");
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      return;
    }
    if (
      !/[a-zA-Z]/.test(newPassword) ||
      !/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword)
    ) {
      setPasswordError(
        "Password must contain at least one letter and one number or special character."
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await fetch("/api/v1/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: userProfile?.hasPassword ? currentPassword : undefined,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data?.error?.message || "Failed to update password.");
        return;
      }

      setPasswordSuccess(
        "Password updated successfully! You can now log in using your email and password."
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setUserProfile((prev) => (prev ? { ...prev, hasPassword: true } : null));
      showToast("Password updated successfully!");
    } catch {
      setPasswordError("A network error occurred. Please try again.");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <OrgLayout activePath="/settings" forcedRole="Org Admin">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "28px",
            right: "28px",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            backgroundColor: "#0f172a",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          <CheckCircle2 style={{ width: "16px", height: "16px", color: "#34d399" }} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div
        style={{
          width: "100%",
          maxWidth: "1480px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          boxSizing: "border-box",
          paddingBottom: "32px",
        }}
      >
        {/* Page Header */}
        <div>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-0.5px",
              margin: 0,
            }}
          >
            Organization Settings
          </h1>
          <p
            style={{
              fontSize: "13px",
              color: "#64748b",
              margin: "4px 0 0 0",
            }}
          >
            Configure your workspace settings and preferences.
          </p>
        </div>

        {/* Tabs Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "32px",
            borderBottom: "1px solid #e2e8f0",
            paddingBottom: "0px",
          }}
        >
          {(
            [
              "General",
              "Document Settings",
              "Notifications",
              "Security & Password",
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "8px 2px 12px 2px",
                  fontSize: "14px",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#2563eb" : "#64748b",
                  backgroundColor: "transparent",
                  border: "none",
                  borderBottom: isActive ? "2.5px solid #2563eb" : "2.5px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Main Content Box (Matching User's Reference Screenshot) */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            padding: "32px 36px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            boxSizing: "border-box",
          }}
        >
          {activeTab === "General" && (
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
              {/* Top 2 Columns Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.35fr 1fr",
                  gap: "36px",
                  alignItems: "start",
                }}
              >
                {/* Left Column: Organization Details */}
                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  <div>
                    <h2
                      style={{
                        fontSize: "17px",
                        fontWeight: 800,
                        color: "#0f172a",
                        margin: 0,
                      }}
                    >
                      Organization Details
                    </h2>
                    <p
                      style={{
                        fontSize: "12.5px",
                        color: "#64748b",
                        margin: "4px 0 0 0",
                      }}
                    >
                      Manage your organization information and preferences.
                    </p>
                  </div>

                  {/* Organization Email */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#334155",
                        marginBottom: "6px",
                      }}
                    >
                      Organization Email <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                      <span
                        style={{
                          position: "absolute",
                          left: "14px",
                          color: "#94a3b8",
                          display: "flex",
                          alignItems: "center",
                          pointerEvents: "none",
                        }}
                      >
                        <Mail style={{ width: "16px", height: "16px" }} />
                      </span>
                      <input
                        type="email"
                        required
                        value={branding.email}
                        onChange={(e) => setBranding({ ...branding, email: e.target.value })}
                        placeholder="contact@acme.com"
                        style={{
                          width: "100%",
                          height: "42px",
                          padding: "0 14px 0 42px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "10px",
                          fontSize: "13px",
                          color: "#0f172a",
                          outline: "none",
                          backgroundColor: "#ffffff",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#334155",
                        marginBottom: "6px",
                      }}
                    >
                      Phone
                    </label>
                    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                      <span
                        style={{
                          position: "absolute",
                          left: "14px",
                          color: "#94a3b8",
                          display: "flex",
                          alignItems: "center",
                          pointerEvents: "none",
                        }}
                      >
                        <Phone style={{ width: "16px", height: "16px" }} />
                      </span>
                      <input
                        type="text"
                        value={branding.phone}
                        onChange={(e) => setBranding({ ...branding, phone: e.target.value })}
                        placeholder="+91 9876543210"
                        style={{
                          width: "100%",
                          height: "42px",
                          padding: "0 14px 0 42px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "10px",
                          fontSize: "13px",
                          color: "#0f172a",
                          outline: "none",
                          backgroundColor: "#ffffff",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#334155",
                        marginBottom: "6px",
                      }}
                    >
                      Address
                    </label>
                    <div style={{ position: "relative", display: "flex", alignItems: "flex-start" }}>
                      <span
                        style={{
                          position: "absolute",
                          left: "14px",
                          top: "14px",
                          color: "#94a3b8",
                          display: "flex",
                          alignItems: "center",
                          pointerEvents: "none",
                        }}
                      >
                        <MapPin style={{ width: "16px", height: "16px" }} />
                      </span>
                      <textarea
                        rows={3}
                        value={branding.address}
                        onChange={(e) => setBranding({ ...branding, address: e.target.value })}
                        placeholder="A-123, Sector 62, Noida, U.P. 201301"
                        style={{
                          width: "100%",
                          padding: "12px 14px 12px 42px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "10px",
                          fontSize: "13px",
                          color: "#0f172a",
                          outline: "none",
                          resize: "none",
                          lineHeight: "1.5",
                          backgroundColor: "#ffffff",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>

                  {/* Checkbox 1: Allow member registration */}
                  <div style={{ paddingTop: "2px" }}>
                    <label
                      onClick={() =>
                        setBranding({
                          ...branding,
                          allowRegistration: !branding.allowRegistration,
                        })
                      }
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                    >
                      <div
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "5px",
                          backgroundColor: branding.allowRegistration ? "#2563eb" : "#ffffff",
                          border: branding.allowRegistration
                            ? "1px solid #2563eb"
                            : "1.5px solid #cbd5e1",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "2px",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {branding.allowRegistration && (
                          <Check style={{ width: "13px", height: "13px", color: "#ffffff", strokeWidth: 3 }} />
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                          Allow member registration
                        </div>
                        <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: "2px" }}>
                          Allow new users to register and join your organization.
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Checkbox 2: Require admin approval */}
                  <div>
                    <label
                      onClick={() =>
                        setBranding({
                          ...branding,
                          requireApproval: !branding.requireApproval,
                        })
                      }
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                    >
                      <div
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "5px",
                          backgroundColor: branding.requireApproval ? "#2563eb" : "#ffffff",
                          border: branding.requireApproval
                            ? "1px solid #2563eb"
                            : "1.5px solid #cbd5e1",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "2px",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {branding.requireApproval && (
                          <Check style={{ width: "13px", height: "13px", color: "#ffffff", strokeWidth: 3 }} />
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                          Require admin approval
                        </div>
                        <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: "2px" }}>
                          New members will require admin approval to join.
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Expiry days */}
                  <div style={{ paddingTop: "4px" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#334155",
                        marginBottom: "6px",
                      }}
                    >
                      Default document expiry (days)
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          height: "40px",
                          width: "150px",
                          padding: "0 12px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "10px",
                          backgroundColor: "#ffffff",
                          boxSizing: "border-box",
                        }}
                      >
                        <Calendar style={{ width: "15px", height: "15px", color: "#94a3b8", flexShrink: 0 }} />
                        <input
                          type="number"
                          min={1}
                          max={365}
                          value={branding.defaultExpiryDays}
                          onChange={(e) =>
                            setBranding({
                              ...branding,
                              defaultExpiryDays: Number(e.target.value) || 30,
                            })
                          }
                          style={{
                            width: "100%",
                            border: "none",
                            outline: "none",
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "#0f172a",
                            backgroundColor: "transparent",
                          }}
                        />
                      </div>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>
                        Set default expiry period for quotations, MOUs and other documents.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Illustration Card (Matching Reference Screenshot) */}
                <div
                  style={{
                    backgroundColor: "#f0f7ff",
                    borderRadius: "16px",
                    padding: "44px 32px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    boxSizing: "border-box",
                    minHeight: "360px",
                  }}
                >
                  {/* Circular Backdrop with 3 Blue Floating Gears */}
                  <div
                    style={{
                      width: "140px",
                      height: "140px",
                      borderRadius: "50%",
                      backgroundColor: "#e0edff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      marginBottom: "18px",
                    }}
                  >
                    {/* Big Center Gear (#2563eb) */}
                    <svg
                      viewBox="0 0 24 24"
                      style={{
                        width: "68px",
                        height: "68px",
                        color: "#2563eb",
                        filter: "drop-shadow(0 2px 4px rgba(37,99,235,0.2))",
                      }}
                      fill="currentColor"
                    >
                      <path d="M12 15.5C10.07 15.5 8.5 13.93 8.5 12C8.5 10.07 10.07 8.5 12 8.5C13.93 8.5 15.5 10.07 15.5 12C15.5 13.93 13.93 15.5 12 15.5ZM19.43 12.97C19.47 12.65 19.5 12.33 19.5 12C19.5 11.67 19.47 11.34 19.43 11.03L21.54 9.37C21.73 9.22 21.78 8.95 21.66 8.73L19.66 5.27C19.54 5.05 19.27 4.97 19.05 5.05L16.56 6.05C16.04 5.65 15.48 5.32 14.87 5.07L14.49 2.42C14.46 2.18 14.25 2 14 2H10C9.75 2 9.54 2.18 9.51 2.42L9.13 5.07C8.52 5.32 7.96 5.66 7.44 6.05L4.95 5.05C4.73 4.96 4.46 5.05 4.34 5.27L2.34 8.73C2.21 8.95 2.27 9.22 2.46 9.37L4.57 11.03C4.53 11.34 4.5 11.67 4.5 12C4.5 12.33 4.53 12.65 4.57 12.97L2.46 14.63C2.27 14.78 2.21 15.05 2.34 15.27L4.34 18.73C4.46 18.95 4.73 19.03 4.95 18.95L7.44 17.95C7.96 18.35 8.52 18.68 9.13 18.93L9.51 21.58C9.54 21.82 9.75 22 10 22H14C14.25 22 14.46 21.82 14.49 21.58L14.87 18.93C15.48 18.68 16.04 18.34 16.56 17.95L19.05 18.95C19.27 19.04 19.54 18.95 19.66 18.73L21.66 15.27C21.78 15.05 21.73 14.78 21.54 14.63L19.43 12.97Z" />
                    </svg>

                    {/* Medium Top-Right Gear (#3b82f6) */}
                    <svg
                      viewBox="0 0 24 24"
                      style={{
                        width: "38px",
                        height: "38px",
                        color: "#3b82f6",
                        position: "absolute",
                        top: "14px",
                        right: "14px",
                      }}
                      fill="currentColor"
                    >
                      <path d="M12 15.5C10.07 15.5 8.5 13.93 8.5 12C8.5 10.07 10.07 8.5 12 8.5C13.93 8.5 15.5 10.07 15.5 12C15.5 13.93 13.93 15.5 12 15.5ZM19.43 12.97C19.47 12.65 19.5 12.33 19.5 12C19.5 11.67 19.47 11.34 19.43 11.03L21.54 9.37C21.73 9.22 21.78 8.95 21.66 8.73L19.66 5.27C19.54 5.05 19.27 4.97 19.05 5.05L16.56 6.05C16.04 5.65 15.48 5.32 14.87 5.07L14.49 2.42C14.46 2.18 14.25 2 14 2H10C9.75 2 9.54 2.18 9.51 2.42L9.13 5.07C8.52 5.32 7.96 5.66 7.44 6.05L4.95 5.05C4.73 4.96 4.46 5.05 4.34 5.27L2.34 8.73C2.21 8.95 2.27 9.22 2.46 9.37L4.57 11.03C4.53 11.34 4.5 11.67 4.5 12C4.5 12.33 4.53 12.65 4.57 12.97L2.46 14.63C2.27 14.78 2.21 15.05 2.34 15.27L4.34 18.73C4.46 18.95 4.73 19.03 4.95 18.95L7.44 17.95C7.96 18.35 8.52 18.68 9.13 18.93L9.51 21.58C9.54 21.82 9.75 22 10 22H14C14.25 22 14.46 21.82 14.49 21.58L14.87 18.93C15.48 18.68 16.04 18.34 16.56 17.95L19.05 18.95C19.27 19.04 19.54 18.95 19.66 18.73L21.66 15.27C21.78 15.05 21.73 14.78 21.54 14.63L19.43 12.97Z" />
                    </svg>

                    {/* Small Bottom-Right Gear (#60a5fa) */}
                    <svg
                      viewBox="0 0 24 24"
                      style={{
                        width: "28px",
                        height: "28px",
                        color: "#60a5fa",
                        position: "absolute",
                        bottom: "22px",
                        right: "12px",
                      }}
                      fill="currentColor"
                    >
                      <path d="M12 15.5C10.07 15.5 8.5 13.93 8.5 12C8.5 10.07 10.07 8.5 12 8.5C13.93 8.5 15.5 10.07 15.5 12C15.5 13.93 13.93 15.5 12 15.5ZM19.43 12.97C19.47 12.65 19.5 12.33 19.5 12C19.5 11.67 19.47 11.34 19.43 11.03L21.54 9.37C21.73 9.22 21.78 8.95 21.66 8.73L19.66 5.27C19.54 5.05 19.27 4.97 19.05 5.05L16.56 6.05C16.04 5.65 15.48 5.32 14.87 5.07L14.49 2.42C14.46 2.18 14.25 2 14 2H10C9.75 2 9.54 2.18 9.51 2.42L9.13 5.07C8.52 5.32 7.96 5.66 7.44 6.05L4.95 5.05C4.73 4.96 4.46 5.05 4.34 5.27L2.34 8.73C2.21 8.95 2.27 9.22 2.46 9.37L4.57 11.03C4.53 11.34 4.5 11.67 4.5 12C4.5 12.33 4.53 12.65 4.57 12.97L2.46 14.63C2.27 14.78 2.21 15.05 2.34 15.27L4.34 18.73C4.46 18.95 4.73 19.03 4.95 18.95L7.44 17.95C7.96 18.35 8.52 18.68 9.13 18.93L9.51 21.58C9.54 21.82 9.75 22 10 22H14C14.25 22 14.46 21.82 14.49 21.58L14.87 18.93C15.48 18.68 16.04 18.34 16.56 17.95L19.05 18.95C19.27 19.04 19.54 18.95 19.66 18.73L21.66 15.27C21.78 15.05 21.73 14.78 21.54 14.63L19.43 12.97Z" />
                    </svg>
                  </div>

                  <h3
                    style={{
                      fontSize: "15px",
                      fontWeight: 800,
                      color: "#0f172a",
                      margin: "0 0 6px 0",
                    }}
                  >
                    General Settings
                  </h3>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      margin: 0,
                      maxWidth: "260px",
                      lineHeight: "1.5",
                    }}
                  >
                    These settings control your organization&apos;s basic information and member access preferences.
                  </p>
                </div>
              </div>

              {/* Bottom Right Save Changes Button (Matching Screenshot) */}
              <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "8px" }}>
                <button
                  type="submit"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 24px",
                    borderRadius: "10px",
                    border: "none",
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(37,99,235,0.25)",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1d4ed8")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
                >
                  <Save style={{ width: "15px", height: "15px" }} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          )}

          {/* Document Settings Tab */}
          {activeTab === "Document Settings" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <h2 style={{ fontSize: "17px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                  Document Defaults & Compliance
                </h2>
                <p style={{ fontSize: "12.5px", color: "#64748b", margin: "4px 0 0 0" }}>
                  Configure default tax rates, currency formatting, and standard terms.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#334155",
                      marginBottom: "6px",
                    }}
                  >
                    Default Tax / GST Rate (%)
                  </label>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      height: "42px",
                      padding: "0 14px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "10px",
                      backgroundColor: "#ffffff",
                    }}
                  >
                    <Percent style={{ width: "16px", height: "16px", color: "#94a3b8" }} />
                    <input
                      type="number"
                      value={docPrefs.defaultTaxRate}
                      onChange={(e) =>
                        setDocPrefs({ ...docPrefs, defaultTaxRate: Number(e.target.value) })
                      }
                      style={{
                        width: "100%",
                        border: "none",
                        outline: "none",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#0f172a",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#334155",
                      marginBottom: "6px",
                    }}
                  >
                    Currency Symbol & Format
                  </label>
                  <select
                    value={docPrefs.currency}
                    onChange={(e) => setDocPrefs({ ...docPrefs, currency: e.target.value })}
                    style={{
                      width: "100%",
                      height: "42px",
                      padding: "0 14px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "10px",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#0f172a",
                      backgroundColor: "#ffffff",
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    <option value="INR (₹)">INR (₹) - Indian Rupee</option>
                    <option value="USD ($)">USD ($) - US Dollar</option>
                    <option value="EUR (€)">EUR (€) - Euro</option>
                    <option value="GBP (£)">GBP (£) - British Pound</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#334155",
                    marginBottom: "6px",
                  }}
                >
                  Default Payment Terms
                </label>
                <input
                  type="text"
                  value={docPrefs.paymentTerms}
                  onChange={(e) => setDocPrefs({ ...docPrefs, paymentTerms: e.target.value })}
                  style={{
                    width: "100%",
                    height: "42px",
                    padding: "0 14px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "10px",
                    fontSize: "13px",
                    color: "#0f172a",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#334155",
                    marginBottom: "6px",
                  }}
                >
                  Standard Notes & Disclaimer
                </label>
                <textarea
                  rows={3}
                  value={docPrefs.notes}
                  onChange={(e) => setDocPrefs({ ...docPrefs, notes: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "10px",
                    fontSize: "13px",
                    color: "#0f172a",
                    outline: "none",
                    resize: "none",
                    lineHeight: "1.5",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => showToast("Document settings updated successfully!")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 24px",
                    borderRadius: "10px",
                    border: "none",
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <Save style={{ width: "15px", height: "15px" }} />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "Notifications" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <h2 style={{ fontSize: "17px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                  Notification Preferences
                </h2>
                <p style={{ fontSize: "12.5px", color: "#64748b", margin: "4px 0 0 0" }}>
                  Choose which alerts and emails you want to receive.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  {
                    key: "docViewed" as const,
                    title: "Document Viewed Notification",
                    desc: "Receive an email alert whenever a recipient opens a quotation or MOU link.",
                  },
                  {
                    key: "docSigned" as const,
                    title: "Document Signed Notification",
                    desc: "Get immediate notification when all required parties complete digital signatures.",
                  },
                  {
                    key: "docExpired" as const,
                    title: "Document Expiry Alerts",
                    desc: "Get reminded 3 days before a quotation or agreement expires.",
                  },
                  {
                    key: "memberJoined" as const,
                    title: "Team Member Activity",
                    desc: "Notify when a new team member accepts invitation or creates documents.",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      padding: "16px",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#f8fafc",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                        {item.desc}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifPrefs[item.key]}
                      onChange={(e) =>
                        setNotifPrefs({ ...notifPrefs, [item.key]: e.target.checked })
                      }
                      style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#2563eb" }}
                    />
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => showToast("Notification preferences updated successfully!")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 24px",
                    borderRadius: "10px",
                    border: "none",
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <Save style={{ width: "15px", height: "15px" }} />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === "Security & Password" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
              {/* Account Security Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "16px",
                  paddingBottom: "20px",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "10px",
                      backgroundColor: "#eff6ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#2563eb",
                    }}
                  >
                    <Shield style={{ width: "22px", height: "22px" }} />
                  </div>
                  <div>
                    <h2
                      style={{
                        fontSize: "16px",
                        fontWeight: 700,
                        color: "#0f172a",
                        margin: 0,
                      }}
                    >
                      Account Security & Password
                    </h2>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#64748b",
                        margin: "2px 0 0 0",
                      }}
                    >
                      Manage your login credentials and password security settings.
                    </p>
                  </div>
                </div>

                {userProfile && (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "6px 14px",
                      borderRadius: "9999px",
                      backgroundColor: userProfile.hasPassword ? "#f0fdf4" : "#eff6ff",
                      border: userProfile.hasPassword
                        ? "1px solid #bbf7d0"
                        : "1px solid #bfdbfe",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: userProfile.hasPassword ? "#166534" : "#1e40af",
                    }}
                  >
                    <KeyRound style={{ width: "13px", height: "13px" }} />
                    <span>
                      {userProfile.hasPassword
                        ? "Password Configured"
                        : "Google Sign-In Active (No Password Set)"}
                    </span>
                  </div>
                )}
              </div>

              {/* Status Notice */}
              {userProfile && !userProfile.hasPassword ? (
                <div
                  style={{
                    backgroundColor: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    borderRadius: "12px",
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                  }}
                >
                  <KeyRound
                    style={{
                      width: "18px",
                      height: "18px",
                      color: "#2563eb",
                      marginTop: "2px",
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#1e3a8a" }}>
                      You sign in using Google ({userProfile.email})
                    </div>
                    <div
                      style={{
                        fontSize: "12.5px",
                        color: "#1e40af",
                        marginTop: "3px",
                        lineHeight: 1.5,
                      }}
                    >
                      Your account was authenticated through Google. You can create a VorldX
                      password below if you would like the flexibility to log in directly
                      with your email address and password in addition to Google OAuth.
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Alerts */}
              {passwordError && (
                <div
                  style={{
                    backgroundColor: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: "10px",
                    padding: "12px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    color: "#991b1b",
                    fontSize: "13px",
                    fontWeight: 500,
                  }}
                >
                  <AlertCircle style={{ width: "16px", height: "16px", flexShrink: 0 }} />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div
                  style={{
                    backgroundColor: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: "10px",
                    padding: "12px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    color: "#166534",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  <CheckCircle2 style={{ width: "16px", height: "16px", flexShrink: 0 }} />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {/* Password Form */}
              <form
                onSubmit={handlePasswordSubmit}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                  maxWidth: "540px",
                }}
              >
                {/* Current Password (only if user already has one) */}
                {userProfile?.hasPassword && (
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#334155",
                        marginBottom: "6px",
                      }}
                    >
                      Current Password <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showCurrent ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter your current password"
                        required
                        style={{
                          width: "100%",
                          padding: "10px 40px 10px 12px",
                          borderRadius: "10px",
                          border: "1px solid #cbd5e1",
                          fontSize: "13.5px",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          color: "#94a3b8",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {showCurrent ? (
                          <EyeOff style={{ width: "16px", height: "16px" }} />
                        ) : (
                          <Eye style={{ width: "16px", height: "16px" }} />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* New Password */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#334155",
                      marginBottom: "6px",
                    }}
                  >
                    {userProfile?.hasPassword ? "New Password" : "Create Password"}{" "}
                    <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters (letters + numbers/symbols)"
                      required
                      style={{
                        width: "100%",
                        padding: "10px 40px 10px 12px",
                        borderRadius: "10px",
                        border: "1px solid #cbd5e1",
                        fontSize: "13.5px",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "#94a3b8",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {showNew ? (
                        <EyeOff style={{ width: "16px", height: "16px" }} />
                      ) : (
                        <Eye style={{ width: "16px", height: "16px" }} />
                      )}
                    </button>
                  </div>

                  {/* Requirements Checklist */}
                  <div
                    style={{
                      marginTop: "8px",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "12px",
                      fontSize: "11.5px",
                    }}
                  >
                    <span
                      style={{
                        color: newPassword.length >= 8 ? "#16a34a" : "#94a3b8",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      {newPassword.length >= 8 ? "✓" : "○"} 8+ characters
                    </span>
                    <span
                      style={{
                        color: /[a-zA-Z]/.test(newPassword) ? "#16a34a" : "#94a3b8",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      {/[a-zA-Z]/.test(newPassword) ? "✓" : "○"} At least 1 letter
                    </span>
                    <span
                      style={{
                        color: /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword)
                          ? "#16a34a"
                          : "#94a3b8",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      {/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword)
                        ? "✓"
                        : "○"}{" "}
                      At least 1 number or symbol
                    </span>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#334155",
                      marginBottom: "6px",
                    }}
                  >
                    Confirm New Password <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "10px",
                      border:
                        confirmPassword && confirmPassword !== newPassword
                          ? "1px solid #ef4444"
                          : "1px solid #cbd5e1",
                      fontSize: "13.5px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  {confirmPassword && confirmPassword !== newPassword && (
                    <div style={{ fontSize: "11.5px", color: "#ef4444", marginTop: "4px" }}>
                      Passwords do not match
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "12px", paddingTop: "8px" }}>
                  <button
                    type="submit"
                    disabled={
                      passwordLoading ||
                      newPassword.length < 8 ||
                      newPassword !== confirmPassword
                    }
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 24px",
                      borderRadius: "10px",
                      border: "none",
                      backgroundColor:
                        passwordLoading ||
                        newPassword.length < 8 ||
                        newPassword !== confirmPassword
                          ? "#94a3b8"
                          : "#2563eb",
                      color: "#ffffff",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor:
                        passwordLoading ||
                        newPassword.length < 8 ||
                        newPassword !== confirmPassword
                          ? "not-allowed"
                          : "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {passwordLoading ? (
                      <>
                        <Loader2
                          style={{
                            width: "15px",
                            height: "15px",
                            animation: "spin 1s linear infinite",
                          }}
                        />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Lock style={{ width: "15px", height: "15px" }} />
                        <span>
                          {userProfile?.hasPassword ? "Update Password" : "Set Password"}
                        </span>
                      </>
                    )}
                  </button>

                  {(newPassword || confirmPassword || currentPassword) && (
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                        setPasswordError(null);
                      }}
                      style={{
                        padding: "10px 16px",
                        borderRadius: "10px",
                        border: "1px solid #cbd5e1",
                        backgroundColor: "#ffffff",
                        color: "#475569",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </OrgLayout>
  );
}
