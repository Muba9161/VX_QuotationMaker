"use client";

import React, { useState } from "react";
import RecipientLayout from "@/components/RecipientLayout";
import Link from "next/link";
import {
  User,
  Mail,
  Building,
  Phone,
  Briefcase,
  Globe,
  MapPin,
  Lock,
  Key,
  Shield,
  Smartphone,
  Laptop,
  Bell,
  Headphones,
  HelpCircle,
  BookOpen,
  Calendar,
  Clock,
  Edit2,
  Check,
  X,
  ChevronDown,
  Camera,
  Send,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";

export default function RecipientProfilePage() {
  // Personal Info State
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("John Doe");
  const [email] = useState("john.doe@email.com");
  const [company, setCompany] = useState("VorldX Technologies Pvt Ltd");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [designation, setDesignation] = useState("Business Manager");
  const [country, setCountry] = useState("India");
  const [address, setAddress] = useState(
    "A-123, Sector 62, Noida, Uttar Pradesh, 201301, India"
  );

  // Preferences State
  const [language, setLanguage] = useState("English");
  const [dateFormat, setDateFormat] = useState("DD MMM YYYY");

  // Notifications State
  const [notifShared, setNotifShared] = useState(true);
  const [notifReminder, setNotifReminder] = useState(true);
  const [notifChanges, setNotifChanges] = useState(true);
  const [notifStatus, setNotifStatus] = useState(true);

  // Modals
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  const [isSessionsModalOpen, setIsSessionsModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    showToast("Profile details updated successfully!");
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match!");
      return;
    }
    showToast("Password changed successfully!");
    setIsPasswordModalOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSendSupport = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Your support request has been submitted!");
    setIsSupportModalOpen(false);
    setSupportMessage("");
  };

  return (
    <RecipientLayout activePath="/recipient/profile">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "28px",
            right: "28px",
            zIndex: 9999,
            background: "#0f172a",
            color: "#ffffff",
            padding: "12px 22px",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          <Check size={16} color="#10b981" />
          {toastMessage}
        </div>
      )}

      <div
        style={{
          width: "100%",
          maxWidth: "1400px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* ================= HERO HEADER CARD ================= */}
        <div
          style={{
            position: "relative",
            background: "#ffffff",
            borderRadius: "18px",
            padding: "30px 36px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
            border: "1px solid #edf2f7",
            overflow: "hidden",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Left Text */}
          <div style={{ maxWidth: "600px", zIndex: 1 }}>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "800",
                color: "#0f172a",
                letterSpacing: "-0.02em",
                margin: "0 0 8px 0",
              }}
            >
              My Profile
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "#64748b",
                margin: 0,
                fontWeight: "400",
              }}
            >
              Manage your personal information and account settings.
            </p>
          </div>

          {/* Right Vector Illustration */}
          <div
            style={{
              position: "relative",
              width: "220px",
              height: "100px",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              flexShrink: 0,
            }}
          >
            {/* Soft blue glow backdrop */}
            <div
              style={{
                position: "absolute",
                right: "-10px",
                top: "-15px",
                width: "160px",
                height: "120px",
                background: "radial-gradient(ellipse at center, rgba(191, 219, 254, 0.8) 0%, rgba(219, 234, 254, 0.3) 70%, transparent 100%)",
                borderRadius: "50%",
                filter: "blur(14px)",
              }}
            />

            {/* Profile Silhouette circle */}
            <div
              style={{
                position: "relative",
                width: "82px",
                height: "82px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #93c5fd, #60a5fa)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 24px rgba(37, 99, 235, 0.16)",
                border: "4px solid #ffffff",
              }}
            >
              <User size={46} color="#ffffff" strokeWidth={2.2} />

              {/* Blue edit pencil round badge */}
              <div
                style={{
                  position: "absolute",
                  bottom: "-4px",
                  right: "-4px",
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  background: "#2563eb",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2.5px solid #ffffff",
                  boxShadow: "0 2px 8px rgba(37,99,235,0.4)",
                  cursor: "pointer",
                }}
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit2 size={13} />
              </div>
            </div>
          </div>
        </div>

        {/* ================= USER HEADER CARD ================= */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "18px",
            padding: "26px 32px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
            border: "1px solid #edf2f7",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "24px",
          }}
        >
          {/* Left Avatar & Info */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            {/* Avatar with Camera badge */}
            <div style={{ position: "relative" }}>
              <div
                style={{
                  width: "74px",
                  height: "74px",
                  borderRadius: "50%",
                  background: "#eff6ff",
                  border: "2px solid #dbeafe",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "26px",
                  fontWeight: "800",
                  color: "#1e3a8a",
                  letterSpacing: "-0.5px",
                }}
              >
                JD
              </div>
              <button
                type="button"
                onClick={() => showToast("Avatar upload simulation")}
                style={{
                  position: "absolute",
                  bottom: "-2px",
                  right: "-2px",
                  width: "26px",
                  height: "26px",
                  borderRadius: "50%",
                  background: "#2563eb",
                  border: "2px solid #ffffff",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(37, 99, 235, 0.35)",
                }}
              >
                <Camera size={13} />
              </button>
            </div>

            <div>
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: "800",
                  color: "#0f172a",
                  margin: "0 0 4px 0",
                  lineHeight: "1.2",
                }}
              >
                {fullName}
              </h2>
              <div
                style={{
                  fontSize: "14px",
                  color: "#64748b",
                  marginBottom: "10px",
                }}
              >
                {email}
              </div>

              {/* Badges */}
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "3px 10px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "600",
                    background: "#eff6ff",
                    color: "#2563eb",
                    border: "1px solid #bfdbfe",
                  }}
                >
                  External Recipient
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "3px 10px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "600",
                    background: "#dcfce7",
                    color: "#15803d",
                    border: "1px solid #bbf7d0",
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#16a34a",
                    }}
                  />
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Right Meta details */}
          <div
            style={{
              display: "flex",
              gap: "36px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#64748b",
                }}
              >
                <Calendar size={18} />
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>Member Since</div>
                <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", marginTop: "2px" }}>
                  10 Oct 2026
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#64748b",
                }}
              >
                <Clock size={18} />
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>Last Login</div>
                <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", marginTop: "2px" }}>
                  28 Oct 2026, 04:30 PM
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= 2-COLUMN MAIN CONTENT GRID ================= */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.9fr",
            gap: "24px",
            alignItems: "start",
          }}
        >
          {/* ================= LEFT COLUMN ================= */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* CARD 1: Personal Information */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: "18px",
                padding: "26px",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
                border: "1px solid #edf2f7",
              }}
            >
              {/* Card Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "22px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "#eff6ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#2563eb",
                    }}
                  >
                    <User size={18} />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: "16px",
                        fontWeight: "700",
                        color: "#0f172a",
                        margin: 0,
                      }}
                    >
                      Personal Information
                    </h3>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#64748b",
                        margin: "2px 0 0 0",
                      }}
                    >
                      View and update your personal details.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (isEditing) {
                      handleSaveProfile();
                    } else {
                      setIsEditing(true);
                    }
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "7px 16px",
                    borderRadius: "8px",
                    border: "1px solid #bae6fd",
                    background: isEditing ? "#2563eb" : "#f0f9ff",
                    color: isEditing ? "#ffffff" : "#0284c7",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {isEditing ? (
                    <>
                      <Check size={14} /> Save
                    </>
                  ) : (
                    <>
                      <Edit2 size={13} /> Edit
                    </>
                  )}
                </button>
              </div>

              {/* Form Fields */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Full Name */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#334155",
                      marginBottom: "6px",
                    }}
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      background: isEditing ? "#ffffff" : "#f8fafc",
                      fontSize: "14px",
                      color: "#0f172a",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#334155",
                      marginBottom: "6px",
                    }}
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    disabled
                    value={email}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      background: "#f1f5f9",
                      fontSize: "14px",
                      color: "#64748b",
                      outline: "none",
                      boxSizing: "border-box",
                      cursor: "not-allowed",
                    }}
                  />
                </div>

                {/* Company & Phone */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "14px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#334155",
                        marginBottom: "6px",
                      }}
                    >
                      Company / Organization
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                        background: isEditing ? "#ffffff" : "#f8fafc",
                        fontSize: "14px",
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
                        fontWeight: "600",
                        color: "#334155",
                        marginBottom: "6px",
                      }}
                    >
                      Phone Number
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                        background: isEditing ? "#ffffff" : "#f8fafc",
                        fontSize: "14px",
                        color: "#0f172a",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                {/* Designation & Country */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "14px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#334155",
                        marginBottom: "6px",
                      }}
                    >
                      Designation
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                        background: isEditing ? "#ffffff" : "#f8fafc",
                        fontSize: "14px",
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
                        fontWeight: "600",
                        color: "#334155",
                        marginBottom: "6px",
                      }}
                    >
                      Country
                    </label>
                    <div style={{ position: "relative" }}>
                      <select
                        disabled={!isEditing}
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        style={{
                          width: "100%",
                          appearance: "none",
                          padding: "10px 36px 10px 14px",
                          borderRadius: "10px",
                          border: "1px solid #e2e8f0",
                          background: isEditing ? "#ffffff" : "#f8fafc",
                          fontSize: "14px",
                          color: "#0f172a",
                          outline: "none",
                          cursor: isEditing ? "pointer" : "default",
                          boxSizing: "border-box",
                        }}
                      >
                        <option value="India">India</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="United Arab Emirates">United Arab Emirates</option>
                        <option value="Singapore">Singapore</option>
                      </select>
                      <ChevronDown
                        size={15}
                        color="#64748b"
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          pointerEvents: "none",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#334155",
                      marginBottom: "6px",
                    }}
                  >
                    Address
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      background: isEditing ? "#ffffff" : "#f8fafc",
                      fontSize: "14px",
                      color: "#0f172a",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* CARD 2: Language & Preferences */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: "18px",
                padding: "26px",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
                border: "1px solid #edf2f7",
              }}
            >
              {/* Card Header */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "#eff6ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#2563eb",
                  }}
                >
                  <Globe size={18} />
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "#0f172a",
                      margin: 0,
                    }}
                  >
                    Language & Preferences
                  </h3>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      margin: "2px 0 0 0",
                    }}
                  >
                    Set your preferred language and regional settings.
                  </p>
                </div>
              </div>

              {/* Preferences Inputs */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "14px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#334155",
                      marginBottom: "6px",
                    }}
                  >
                    Preferred Language
                  </label>
                  <div style={{ position: "relative" }}>
                    <select
                      value={language}
                      onChange={(e) => {
                        setLanguage(e.target.value);
                        showToast(`Language updated to ${e.target.value}`);
                      }}
                      style={{
                        width: "100%",
                        appearance: "none",
                        padding: "10px 36px 10px 14px",
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                        background: "#ffffff",
                        fontSize: "14px",
                        color: "#0f172a",
                        outline: "none",
                        cursor: "pointer",
                        boxSizing: "border-box",
                      }}
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                    </select>
                    <ChevronDown
                      size={15}
                      color="#64748b"
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#334155",
                      marginBottom: "6px",
                    }}
                  >
                    Date Format
                  </label>
                  <div style={{ position: "relative" }}>
                    <select
                      value={dateFormat}
                      onChange={(e) => {
                        setDateFormat(e.target.value);
                        showToast(`Date format updated to ${e.target.value}`);
                      }}
                      style={{
                        width: "100%",
                        appearance: "none",
                        padding: "10px 36px 10px 14px",
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                        background: "#ffffff",
                        fontSize: "14px",
                        color: "#0f172a",
                        outline: "none",
                        cursor: "pointer",
                        boxSizing: "border-box",
                      }}
                    >
                      <option value="DD MMM YYYY">DD MMM YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                    <ChevronDown
                      size={15}
                      color="#64748b"
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN ================= */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* CARD 3: Security */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: "18px",
                padding: "26px",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
                border: "1px solid #edf2f7",
              }}
            >
              {/* Card Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "#eff6ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#2563eb",
                    }}
                  >
                    <Lock size={18} />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: "16px",
                        fontWeight: "700",
                        color: "#0f172a",
                        margin: 0,
                      }}
                    >
                      Security
                    </h3>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#64748b",
                        margin: "2px 0 0 0",
                      }}
                    >
                      Manage your password and account security.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(true)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "7px 14px",
                    borderRadius: "8px",
                    border: "1px solid #bae6fd",
                    background: "#f0f9ff",
                    color: "#0284c7",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Key size={13} /> Change Password
                </button>
              </div>

              {/* Rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Password row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingBottom: "14px",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>Password</div>
                    <div style={{ fontSize: "13px", color: "#64748b", letterSpacing: "2px", marginTop: "2px" }}>
                      ••••••••
                    </div>
                  </div>
                  <button
                    onClick={() => setIsPasswordModalOpen(true)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#2563eb",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    Change
                  </button>
                </div>

                {/* 2FA row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingBottom: "14px",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>
                      Two-Factor Authentication
                    </div>
                    <div style={{ marginTop: "4px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: "600",
                          background: is2FAEnabled ? "#dcfce7" : "#f1f5f9",
                          color: is2FAEnabled ? "#15803d" : "#64748b",
                        }}
                      >
                        {is2FAEnabled ? "Enabled" : "Not Enabled"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIs2FAModalOpen(true)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#2563eb",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    {is2FAEnabled ? "Manage" : "Enable"}
                  </button>
                </div>

                {/* Active Sessions */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>Active Sessions</div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "12px",
                        color: "#64748b",
                        marginTop: "2px",
                      }}
                    >
                      <Laptop size={14} /> 1 active session
                    </div>
                  </div>
                  <button
                    onClick={() => setIsSessionsModalOpen(true)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#2563eb",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    View
                  </button>
                </div>
              </div>
            </div>

            {/* CARD 4: Notifications */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: "18px",
                padding: "26px",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
                border: "1px solid #edf2f7",
              }}
            >
              {/* Card Header */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "#eff6ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#2563eb",
                  }}
                >
                  <Bell size={18} />
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "#0f172a",
                      margin: 0,
                    }}
                  >
                    Notifications
                  </h3>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      margin: "2px 0 0 0",
                    }}
                  >
                    Choose what notifications you want to receive.
                  </p>
                </div>
              </div>

              {/* 4 Switch Rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {/* 1. Document shared with me */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>
                      Document shared with me
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "1px" }}>
                      Get notified when a new document is shared.
                    </div>
                  </div>
                  <label style={{ position: "relative", display: "inline-block", width: "42px", height: "24px" }}>
                    <input
                      type="checkbox"
                      checked={notifShared}
                      onChange={(e) => {
                        setNotifShared(e.target.checked);
                        showToast(`Notification setting updated`);
                      }}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        cursor: "pointer",
                        inset: 0,
                        backgroundColor: notifShared ? "#2563eb" : "#cbd5e1",
                        borderRadius: "24px",
                        transition: "0.2s",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          content: '""',
                          height: "18px",
                          width: "18px",
                          left: notifShared ? "21px" : "3px",
                          bottom: "3px",
                          backgroundColor: "#ffffff",
                          borderRadius: "50%",
                          transition: "0.2s",
                        }}
                      />
                    </span>
                  </label>
                </div>

                {/* 2. Signature request reminder */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>
                      Signature request reminder
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "1px" }}>
                      Receive reminders for pending signatures.
                    </div>
                  </div>
                  <label style={{ position: "relative", display: "inline-block", width: "42px", height: "24px" }}>
                    <input
                      type="checkbox"
                      checked={notifReminder}
                      onChange={(e) => {
                        setNotifReminder(e.target.checked);
                        showToast(`Notification setting updated`);
                      }}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        cursor: "pointer",
                        inset: 0,
                        backgroundColor: notifReminder ? "#2563eb" : "#cbd5e1",
                        borderRadius: "24px",
                        transition: "0.2s",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          content: '""',
                          height: "18px",
                          width: "18px",
                          left: notifReminder ? "21px" : "3px",
                          bottom: "3px",
                          backgroundColor: "#ffffff",
                          borderRadius: "50%",
                          transition: "0.2s",
                        }}
                      />
                    </span>
                  </label>
                </div>

                {/* 3. Change request updates */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>
                      Change request updates
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "1px" }}>
                      Get notified about changes requested by sender.
                    </div>
                  </div>
                  <label style={{ position: "relative", display: "inline-block", width: "42px", height: "24px" }}>
                    <input
                      type="checkbox"
                      checked={notifChanges}
                      onChange={(e) => {
                        setNotifChanges(e.target.checked);
                        showToast(`Notification setting updated`);
                      }}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        cursor: "pointer",
                        inset: 0,
                        backgroundColor: notifChanges ? "#2563eb" : "#cbd5e1",
                        borderRadius: "24px",
                        transition: "0.2s",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          content: '""',
                          height: "18px",
                          width: "18px",
                          left: notifChanges ? "21px" : "3px",
                          bottom: "3px",
                          backgroundColor: "#ffffff",
                          borderRadius: "50%",
                          transition: "0.2s",
                        }}
                      />
                    </span>
                  </label>
                </div>

                {/* 4. Document status updates */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>
                      Document status updates
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "1px" }}>
                      Get notified when document is signed, declined or updated.
                    </div>
                  </div>
                  <label style={{ position: "relative", display: "inline-block", width: "42px", height: "24px" }}>
                    <input
                      type="checkbox"
                      checked={notifStatus}
                      onChange={(e) => {
                        setNotifStatus(e.target.checked);
                        showToast(`Notification setting updated`);
                      }}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        cursor: "pointer",
                        inset: 0,
                        backgroundColor: notifStatus ? "#2563eb" : "#cbd5e1",
                        borderRadius: "24px",
                        transition: "0.2s",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          content: '""',
                          height: "18px",
                          width: "18px",
                          left: notifStatus ? "21px" : "3px",
                          bottom: "3px",
                          backgroundColor: "#ffffff",
                          borderRadius: "50%",
                          transition: "0.2s",
                        }}
                      />
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* CARD 5: Help & Support */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: "18px",
                padding: "26px",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
                border: "1px solid #edf2f7",
              }}
            >
              {/* Card Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "#eff6ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#2563eb",
                    }}
                  >
                    <Headphones size={18} />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: "16px",
                        fontWeight: "700",
                        color: "#0f172a",
                        margin: 0,
                      }}
                    >
                      Help & Support
                    </h3>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#64748b",
                        margin: "2px 0 0 0",
                      }}
                    >
                      Need assistance? We're here to help.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSupportModalOpen(true)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "7px 14px",
                    borderRadius: "8px",
                    border: "1px solid #bae6fd",
                    background: "#f0f9ff",
                    color: "#0284c7",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Headphones size={13} /> Contact Support
                </button>
              </div>

              {/* 3 Quick Help Boxes */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "12px",
                }}
              >
                {/* Box 1: Help Center */}
                <div
                  onClick={() => showToast("Opening VorldX Knowledgebase...")}
                  style={{
                    background: "#f8fafc",
                    borderRadius: "12px",
                    padding: "16px 12px",
                    border: "1px solid #e2e8f0",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "#eff6ff")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "#f8fafc")}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "#eff6ff",
                      color: "#2563eb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 8px auto",
                    }}
                  >
                    <HelpCircle size={16} />
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>
                    View Help Center
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                    FAQs and guides
                  </div>
                </div>

                {/* Box 2: User Guide */}
                <div
                  onClick={() => showToast("Opening User Guide...")}
                  style={{
                    background: "#f8fafc",
                    borderRadius: "12px",
                    padding: "16px 12px",
                    border: "1px solid #e2e8f0",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "#eff6ff")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "#f8fafc")}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "#eff6ff",
                      color: "#2563eb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 8px auto",
                    }}
                  >
                    <BookOpen size={16} />
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>
                    User Guide
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                    Learn how to use VorldX
                  </div>
                </div>

                {/* Box 3: Email Support */}
                <div
                  onClick={() => setIsSupportModalOpen(true)}
                  style={{
                    background: "#f8fafc",
                    borderRadius: "12px",
                    padding: "16px 12px",
                    border: "1px solid #e2e8f0",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "#eff6ff")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "#f8fafc")}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "#eff6ff",
                      color: "#2563eb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 8px auto",
                    }}
                  >
                    <Mail size={16} />
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>
                    support@vorldx.com
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                    Email us for support
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= CHANGE PASSWORD MODAL ================= */}
      {isPasswordModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            padding: "20px",
          }}
          onClick={() => setIsPasswordModalOpen(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "18px",
              width: "100%",
              maxWidth: "480px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
              overflow: "hidden",
              border: "1px solid #e2e8f0",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "#eff6ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#2563eb",
                  }}
                >
                  <Key size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                    Change Password
                  </h3>
                  <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
                    Ensure your account uses a secure password
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#f1f5f9",
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit}>
              <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  padding: "16px 24px",
                  borderTop: "1px solid #f1f5f9",
                  background: "#f8fafc",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  style={{
                    padding: "9px 18px",
                    borderRadius: "9px",
                    border: "1px solid #e2e8f0",
                    background: "#ffffff",
                    color: "#334155",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "9px 18px",
                    borderRadius: "9px",
                    border: "none",
                    background: "#2563eb",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= 2FA MODAL ================= */}
      {is2FAModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            padding: "20px",
          }}
          onClick={() => setIs2FAModalOpen(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "18px",
              width: "100%",
              maxWidth: "480px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
              overflow: "hidden",
              border: "1px solid #e2e8f0",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "#eff6ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#2563eb",
                  }}
                >
                  <Smartphone size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                    Two-Factor Authentication
                  </h3>
                  <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
                    Enhance security with an authenticator app
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIs2FAModalOpen(false)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#f1f5f9",
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: "24px" }}>
              <p style={{ fontSize: "13px", color: "#475569", lineHeight: "1.5", margin: "0 0 16px 0" }}>
                Two-Factor Authentication (2FA) adds an extra layer of defense by requiring an authentication code from your mobile device upon signing in.
              </p>
              <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>Current Status</div>
                <div style={{ fontSize: "12px", color: is2FAEnabled ? "#15803d" : "#64748b", marginTop: "2px", fontWeight: "600" }}>
                  {is2FAEnabled ? "● Two-Factor Authentication is Active" : "○ Not Enabled"}
                </div>
              </div>
            </div>

            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid #f1f5f9",
                background: "#f8fafc",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                onClick={() => setIs2FAModalOpen(false)}
                style={{
                  padding: "9px 18px",
                  borderRadius: "9px",
                  border: "1px solid #e2e8f0",
                  background: "#ffffff",
                  color: "#334155",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  setIs2FAEnabled(!is2FAEnabled);
                  showToast(is2FAEnabled ? "Two-Factor Authentication disabled" : "Two-Factor Authentication enabled!");
                  setIs2FAModalOpen(false);
                }}
                style={{
                  padding: "9px 18px",
                  borderRadius: "9px",
                  border: "none",
                  background: is2FAEnabled ? "#ef4444" : "#2563eb",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                {is2FAEnabled ? "Disable 2FA" : "Enable 2FA"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= ACTIVE SESSIONS MODAL ================= */}
      {isSessionsModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            padding: "20px",
          }}
          onClick={() => setIsSessionsModalOpen(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "18px",
              width: "100%",
              maxWidth: "500px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
              overflow: "hidden",
              border: "1px solid #e2e8f0",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "#eff6ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#2563eb",
                  }}
                >
                  <Laptop size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                    Active Sessions
                  </h3>
                  <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
                    Devices currently signed into your account
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSessionsModalOpen(false)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#f1f5f9",
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: "20px 24px" }}>
              <div
                style={{
                  background: "#f8fafc",
                  padding: "16px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Laptop size={22} color="#2563eb" />
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>
                      Windows 11 • Google Chrome
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                      Noida, India • Current session (Active now)
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    padding: "3px 8px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: "600",
                    background: "#dcfce7",
                    color: "#15803d",
                  }}
                >
                  This Device
                </span>
              </div>
            </div>

            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid #f1f5f9",
                background: "#f8fafc",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setIsSessionsModalOpen(false)}
                style={{
                  padding: "9px 18px",
                  borderRadius: "9px",
                  border: "none",
                  background: "#2563eb",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= CONTACT SUPPORT MODAL ================= */}
      {isSupportModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            padding: "20px",
          }}
          onClick={() => setIsSupportModalOpen(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "18px",
              width: "100%",
              maxWidth: "500px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
              overflow: "hidden",
              border: "1px solid #e2e8f0",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "#eff6ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#2563eb",
                  }}
                >
                  <Headphones size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                    Contact Support
                  </h3>
                  <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
                    We usually respond in under 2 hours
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSupportModalOpen(false)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#f1f5f9",
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSendSupport}>
              <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                    Your Question / Issue
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    placeholder="Describe what you need help with..."
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "14px",
                      outline: "none",
                      resize: "vertical",
                      fontFamily: "inherit",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  padding: "16px 24px",
                  borderTop: "1px solid #f1f5f9",
                  background: "#f8fafc",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsSupportModalOpen(false)}
                  style={{
                    padding: "9px 18px",
                    borderRadius: "9px",
                    border: "1px solid #e2e8f0",
                    background: "#ffffff",
                    color: "#334155",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "9px 18px",
                    borderRadius: "9px",
                    border: "none",
                    background: "#2563eb",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Send size={14} /> Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </RecipientLayout>
  );
}
