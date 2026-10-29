"use client";

import React, { useState, useRef, useEffect } from "react";
import OrgLayout from "@/components/OrgLayout";
import {
  Link2,
  ChevronDown,
  RotateCcw,
  Save,
  CheckCircle2,
  Upload,
} from "lucide-react";
import { getOrgBranding, saveOrgBranding, OrgBranding } from "@/lib/orgStorage";

export default function BrandingLetterheadPage() {
  const [branding, setBranding] = useState<OrgBranding>(() => getOrgBranding());
  const [activeTab, setActiveTab] = useState<"Branding" | "Letterhead">("Branding");
  const [previewDoc, setPreviewDoc] = useState<"Quotation" | "MOU" | "Letterhead">("Quotation");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadBranding() {
      try {
        const res = await fetch("/api/v1/organization/branding", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.data?.branding && isMounted) {
            const b = data.data.branding;
            const l = data.data.letterhead;
            setBranding((prev) => ({
              ...prev,
              primaryColor: b.primaryColor || prev.primaryColor,
              secondaryColor: b.secondaryColor || prev.secondaryColor,
              logoUrl: b.logoUrl || prev.logoUrl,
              letterheadSignatoryName: l?.defaultSignatoryName ?? prev.letterheadSignatoryName,
              letterheadSignatoryTitle: l?.defaultSignatoryTitle ?? prev.letterheadSignatoryTitle,
              letterheadHeaderStyle: l?.letterheadLogoPosition === "center" ? "Classic Centered" : (l?.letterheadLogoPosition === "right" ? "Minimal" : "Modern Accent"),
            }));
            return;
          }
        }
      } catch {
        // Fallback to local
      }

      const loaded = getOrgBranding();
      if (loaded && isMounted) {
        setBranding({
          ...loaded,
          name: loaded.name || "Acme Technologies Pvt Ltd",
          tagline: loaded.tagline ?? "Innovating for a Better Tomorrow",
          website: loaded.website || "https://www.acme.com",
          phone: loaded.phone || "+91 98765 43210",
          address: loaded.address || "A-123, Sector 62, Noida, U.P. 201301",
          primaryColor: loaded.primaryColor || "#2563EB",
          secondaryColor: loaded.secondaryColor || "#10B981",
        });
      }
    }

    loadBranding();
    return () => {
      isMounted = false;
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    try {
      const payload = {
        primaryColor: branding.primaryColor,
        secondaryColor: branding.secondaryColor,
        logoUrl: branding.logoUrl,
        defaultSignatoryName: branding.letterheadSignatoryName,
        defaultSignatoryTitle: branding.letterheadSignatoryTitle,
        letterheadLogoPosition: branding.letterheadHeaderStyle === "Classic Centered" ? "center" : (branding.letterheadHeaderStyle === "Minimal" ? "right" : "left"),
      };

      const res = await fetch("/api/v1/organization/branding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        showToast(err?.error?.message || "Failed to save branding to server.");
        return;
      }
    } catch {
      // Local fallback
    }

    saveOrgBranding(branding);
    setIsSaved(true);
    showToast("Branding settings saved successfully!");
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleReset = () => {
    const defaultData: OrgBranding = {
      name: "Acme Technologies Pvt Ltd",
      tagline: "Innovating for a Better Tomorrow",
      website: "https://www.acme.com",
      email: "contact@acme.com",
      phone: "+91 98765 43210",
      address: "A-123, Sector 62, Noida, U.P. 201301",
      primaryColor: "#2563EB",
      secondaryColor: "#10B981",
      logoUrl: "",
      allowRegistration: true,
      requireApproval: true,
      defaultExpiryDays: 30,
      letterheadHeaderStyle: "Modern Accent",
      letterheadSignatoryName: "Rahul Sharma",
      letterheadSignatoryTitle: "Chief Executive Officer",
      letterheadShowLogo: true,
      letterheadShowAddress: true,
      letterheadShowTagline: true,
    };
    setBranding(defaultData);
    saveOrgBranding(defaultData);
    showToast("Branding & Letterhead settings reset to default!");
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        setBranding((prev) => ({ ...prev, logoUrl: url }));
      };
      reader.readAsDataURL(file);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", "logo");

        const res = await fetch("/api/v1/organization/branding/upload", {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        if (res.ok) {
          const upData = await res.json();
          if (upData?.data?.assetUrl) {
            setBranding((prev) => ({ ...prev, logoUrl: upData.data.assetUrl }));
            showToast("Organization logo uploaded and saved!");
            return;
          }
        }
      } catch {
        // Preview preserved
      }

      showToast("Organization logo updated!");
    }
  };

  const primary = branding.primaryColor || "#2563EB";
  const secondary = branding.secondaryColor || "#10B981";

  return (
    <OrgLayout activePath="/branding" forcedRole="Org Admin">
      {/* Hidden Logo File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleLogoUpload}
        style={{ display: "none" }}
      />

      {/* Floating Toast Notification */}
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
          paddingBottom: "24px",
        }}
      >
        {/* ================= PAGE TITLE ================= */}
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
            Branding & Letterhead
          </h1>
          <p
            style={{
              fontSize: "13px",
              color: "#64748b",
              margin: "4px 0 0 0",
            }}
          >
            Customize your organization&apos;s branding and default letterhead.
          </p>
        </div>

        {/* ================= TABS BAR ================= */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "32px",
            borderBottom: "1px solid #e2e8f0",
            paddingBottom: "0px",
          }}
        >
          {(["Branding", "Letterhead"] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === "Letterhead") setPreviewDoc("Letterhead");
                  else setPreviewDoc("Quotation");
                }}
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

        {/* ================= MAIN 2-COLUMN GRID ================= */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.05fr 1fr",
            gap: "24px",
            alignItems: "start",
            boxSizing: "border-box",
          }}
        >
          {/* ================= LEFT CARD ================= */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              boxSizing: "border-box",
            }}
          >
            {activeTab === "Branding" ? (
              <>
                {/* Header */}
                <div>
                  <h2
                    style={{
                      fontSize: "16px",
                      fontWeight: 800,
                      color: "#0f172a",
                      margin: 0,
                    }}
                  >
                    Organization Branding
                  </h2>
                  <p
                    style={{
                      fontSize: "12.5px",
                      color: "#64748b",
                      margin: "4px 0 0 0",
                      lineHeight: "1.4",
                    }}
                  >
                    Set up your organization details, logo and brand colors. These will be used in quotations, MOUs and all documents.
                  </p>
                </div>

                {/* Subgrid: Inputs on Left, Logo on Right */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.25fr 1fr",
                    gap: "20px",
                    alignItems: "start",
                  }}
                >
                  {/* Left Column Inputs */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
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
                        Organization Name <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={branding.name}
                        onChange={(e) => setBranding({ ...branding, name: e.target.value })}
                        placeholder="Acme Technologies Pvt Ltd"
                        style={{
                          width: "100%",
                          height: "40px",
                          padding: "0 12px",
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
                        Tagline (optional)
                      </label>
                      <input
                        type="text"
                        value={branding.tagline}
                        onChange={(e) => setBranding({ ...branding, tagline: e.target.value })}
                        placeholder="Innovating for a Better Tomorrow"
                        style={{
                          width: "100%",
                          height: "40px",
                          padding: "0 12px",
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
                        Website
                      </label>
                      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <span
                          style={{
                            position: "absolute",
                            left: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            pointerEvents: "none",
                            color: "#94a3b8",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Link2 style={{ width: "16px", height: "16px" }} />
                        </span>
                        <input
                          type="text"
                          value={branding.website}
                          onChange={(e) => setBranding({ ...branding, website: e.target.value })}
                          placeholder="https://www.acme.com"
                          style={{
                            width: "100%",
                            height: "40px",
                            padding: "0 12px 0 38px",
                            border: "1px solid #cbd5e1",
                            borderRadius: "10px",
                            fontSize: "13px",
                            color: "#2563eb",
                            outline: "none",
                            backgroundColor: "#ffffff",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Organization Logo */}
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
                      Organization Logo
                    </label>

                    <div
                      style={{
                        border: "1.5px dashed #bfdbfe",
                        borderRadius: "12px",
                        backgroundColor: "#f8fafc",
                        padding: "16px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        minHeight: "158px",
                        boxSizing: "border-box",
                      }}
                    >
                      {branding.logoUrl ? (
                        <img
                          src={branding.logoUrl}
                          alt="Organization Logo"
                          style={{
                            maxHeight: "65px",
                            maxWidth: "140px",
                            objectFit: "contain",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {/* Exact Blue Chevron Arrow Logo from Screenshot */}
                          <svg
                            viewBox="0 0 54 44"
                            style={{ width: "48px", height: "40px" }}
                            fill="none"
                          >
                            <path
                              d="M27 3 L7 39 L18 39 L27 21 L36 39 L47 39 Z"
                              fill={primary}
                            />
                          </svg>
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: 900,
                              color: "#0f172a",
                              letterSpacing: "0.5px",
                              marginTop: "2px",
                            }}
                          >
                            ACME
                          </span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          backgroundColor: "#eff6ff",
                          color: "#2563eb",
                          border: "1px solid #bfdbfe",
                          borderRadius: "8px",
                          padding: "6px 16px",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#dbeafe")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#eff6ff")}
                      >
                        Change Logo
                      </button>

                      <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                        PNG, JPG (max 2MB)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Colors Row */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "18px",
                    paddingTop: "4px",
                  }}
                >
                  {/* Primary Color */}
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
                      Primary Color
                    </label>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        height: "44px",
                        padding: "0 12px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "10px",
                        backgroundColor: "#ffffff",
                        boxSizing: "border-box",
                        position: "relative",
                      }}
                    >
                      {/* Swatch with hidden native color input */}
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "6px",
                          backgroundColor: primary,
                          cursor: "pointer",
                          position: "relative",
                          overflow: "hidden",
                          flexShrink: 0,
                          boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                        }}
                      >
                        <input
                          type="color"
                          value={primary}
                          onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                          style={{
                            position: "absolute",
                            top: "-10px",
                            left: "-10px",
                            width: "48px",
                            height: "48px",
                            opacity: 0,
                            cursor: "pointer",
                          }}
                        />
                      </div>
                      <input
                        type="text"
                        value={primary}
                        onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                        style={{
                          border: "none",
                          outline: "none",
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#0f172a",
                          width: "100%",
                          fontFamily: "monospace",
                        }}
                      />
                      <ChevronDown style={{ width: "16px", height: "16px", color: "#94a3b8", flexShrink: 0 }} />
                    </div>
                    <span
                      style={{
                        display: "block",
                        fontSize: "11px",
                        color: "#94a3b8",
                        marginTop: "5px",
                      }}
                    >
                      Used for headers, buttons and highlights.
                    </span>
                  </div>

                  {/* Secondary Color */}
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
                      Secondary Color
                    </label>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        height: "44px",
                        padding: "0 12px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "10px",
                        backgroundColor: "#ffffff",
                        boxSizing: "border-box",
                        position: "relative",
                      }}
                    >
                      {/* Swatch with hidden native color input */}
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "6px",
                          backgroundColor: secondary,
                          cursor: "pointer",
                          position: "relative",
                          overflow: "hidden",
                          flexShrink: 0,
                          boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                        }}
                      >
                        <input
                          type="color"
                          value={secondary}
                          onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                          style={{
                            position: "absolute",
                            top: "-10px",
                            left: "-10px",
                            width: "48px",
                            height: "48px",
                            opacity: 0,
                            cursor: "pointer",
                          }}
                        />
                      </div>
                      <input
                        type="text"
                        value={secondary}
                        onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                        style={{
                          border: "none",
                          outline: "none",
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#0f172a",
                          width: "100%",
                          fontFamily: "monospace",
                        }}
                      />
                      <ChevronDown style={{ width: "16px", height: "16px", color: "#94a3b8", flexShrink: 0 }} />
                    </div>
                    <span
                      style={{
                        display: "block",
                        fontSize: "11px",
                        color: "#94a3b8",
                        marginTop: "5px",
                      }}
                    >
                      Used for secondary elements and accents.
                    </span>
                  </div>
                </div>

                {/* Brand Color Preview Card */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#334155",
                      marginBottom: "8px",
                    }}
                  >
                    Brand Color Preview
                  </label>

                  <div
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      backgroundColor: "#f8fafc",
                      padding: "16px 20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "16px",
                      flexWrap: "wrap",
                      boxSizing: "border-box",
                    }}
                  >
                    {/* Left: Buttons & Dots */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <button
                        type="button"
                        style={{
                          backgroundColor: primary,
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "8px",
                          padding: "8px 18px",
                          fontSize: "12.5px",
                          fontWeight: 700,
                          cursor: "pointer",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                        }}
                      >
                        Primary Button
                      </button>

                      <button
                        type="button"
                        style={{
                          backgroundColor: "#f0fdf4",
                          color: secondary,
                          border: `1.5px solid ${secondary}`,
                          borderRadius: "8px",
                          padding: "8px 18px",
                          fontSize: "12.5px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Secondary Button
                      </button>

                      {/* 4 dots */}
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginLeft: "4px" }}>
                        <span
                          style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            backgroundColor: primary,
                            display: "inline-block",
                          }}
                        />
                        <span
                          style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            backgroundColor: "#06b6d4",
                            display: "inline-block",
                          }}
                        />
                        <span
                          style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            backgroundColor: secondary,
                            display: "inline-block",
                          }}
                        />
                        <span
                          style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            backgroundColor: "#a7f3d0",
                            display: "inline-block",
                          }}
                        />
                      </div>
                    </div>

                    {/* Right: Typography preview */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        borderLeft: "1px solid #e2e8f0",
                        paddingLeft: "16px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "24px",
                          fontWeight: 900,
                          color: primary,
                          lineHeight: 1,
                        }}
                      >
                        Aa
                      </span>
                      <div>
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "#0f172a",
                          }}
                        >
                          This is a sample text with your brand colors.
                        </div>
                        <div
                          style={{
                            fontSize: "10.5px",
                            color: "#94a3b8",
                            marginTop: "2px",
                          }}
                        >
                          Quotations • MOUs • Documents • Letterhead
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Dedicated Letterhead Tab */
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div>
                  <h2
                    style={{
                      fontSize: "16px",
                      fontWeight: 800,
                      color: "#0f172a",
                      margin: 0,
                    }}
                  >
                    Default Letterhead Settings
                  </h2>
                  <p
                    style={{
                      fontSize: "12.5px",
                      color: "#64748b",
                      margin: "4px 0 0 0",
                    }}
                  >
                    Configure official letterhead layout, company header, and authorized signatory.
                  </p>
                </div>

                {/* Letterhead Header Style */}
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
                    Header Layout Style
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                    {(["Modern Accent", "Classic Centered", "Minimal"] as const).map((style) => {
                      const isSel = (branding.letterheadHeaderStyle || "Modern Accent") === style;
                      return (
                        <button
                          key={style}
                          type="button"
                          onClick={() => setBranding({ ...branding, letterheadHeaderStyle: style })}
                          style={{
                            padding: "10px 12px",
                            borderRadius: "10px",
                            border: `1.5px solid ${isSel ? "#2563eb" : "#cbd5e1"}`,
                            backgroundColor: isSel ? "#eff6ff" : "#ffffff",
                            color: isSel ? "#1d4ed8" : "#334155",
                            fontSize: "12px",
                            fontWeight: 700,
                            cursor: "pointer",
                            textAlign: "center",
                          }}
                        >
                          {style}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Signatory Info */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#334155",
                        marginBottom: "4px",
                      }}
                    >
                      Signatory Name
                    </label>
                    <input
                      type="text"
                      value={branding.letterheadSignatoryName || "Rahul Sharma"}
                      onChange={(e) =>
                        setBranding({ ...branding, letterheadSignatoryName: e.target.value })
                      }
                      style={{
                        width: "100%",
                        height: "38px",
                        padding: "0 12px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        fontSize: "12.5px",
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
                        marginBottom: "4px",
                      }}
                    >
                      Signatory Title
                    </label>
                    <input
                      type="text"
                      value={branding.letterheadSignatoryTitle || "Chief Executive Officer"}
                      onChange={(e) =>
                        setBranding({ ...branding, letterheadSignatoryTitle: e.target.value })
                      }
                      style={{
                        width: "100%",
                        height: "38px",
                        padding: "0 12px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        fontSize: "12.5px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                {/* Company Address */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#334155",
                      marginBottom: "4px",
                    }}
                  >
                    Official Address
                  </label>
                  <input
                    type="text"
                    value={branding.address || "A-123, Sector 62, Noida, U.P. 201301"}
                    onChange={(e) => setBranding({ ...branding, address: e.target.value })}
                    style={{
                      width: "100%",
                      height: "38px",
                      padding: "0 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      fontSize: "12.5px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ================= RIGHT CARD: LIVE BRAND PREVIEW ================= */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              boxSizing: "border-box",
            }}
          >
            {/* Header + Segmented Buttons */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "16px",
                    fontWeight: 800,
                    color: "#0f172a",
                    margin: 0,
                  }}
                >
                  Live Brand Preview
                </h2>
                <p
                  style={{
                    fontSize: "12.5px",
                    color: "#64748b",
                    margin: "2px 0 0 0",
                  }}
                >
                  See how your branding looks in documents.
                </p>
              </div>

              {/* Segmented Pills */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "3px",
                  gap: "2px",
                }}
              >
                {(["Quotation", "MOU", "Letterhead"] as const).map((docType) => {
                  const isSelected = previewDoc === docType;
                  return (
                    <button
                      key={docType}
                      type="button"
                      onClick={() => setPreviewDoc(docType)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: 700,
                        backgroundColor: isSelected ? primary : "transparent",
                        color: isSelected ? "#ffffff" : "#64748b",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {docType}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Document Sheet (White A4 Style Container) */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "24px 22px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {/* QUOTATION PREVIEW (1:1 Exact Match with Reference Screenshot) */}
              {previewDoc === "Quotation" && (
                <>
                  {/* Top Company Header */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      paddingBottom: "12px",
                    }}
                  >
                    {/* Left: Logo + Name */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {branding.logoUrl ? (
                        <img
                          src={branding.logoUrl}
                          alt="Logo"
                          style={{
                            maxHeight: "36px",
                            maxWidth: "100px",
                            objectFit: "contain",
                          }}
                        />
                      ) : (
                        <svg
                          viewBox="0 0 54 44"
                          style={{ width: "36px", height: "30px" }}
                          fill="none"
                        >
                          <path
                            d="M27 3 L7 39 L18 39 L27 21 L36 39 L47 39 Z"
                            fill={primary}
                          />
                        </svg>
                      )}
                      <div>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: 900,
                            color: "#0f172a",
                            letterSpacing: "0.5px",
                          }}
                        >
                          ACME
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#64748b",
                            fontWeight: 600,
                          }}
                        >
                          {branding.name || "Acme Technologies Pvt Ltd"}
                        </div>
                      </div>
                    </div>

                    {/* Right: Address & Website */}
                    <div
                      style={{
                        textAlign: "right",
                        fontSize: "9.5px",
                        color: "#64748b",
                        lineHeight: "1.4",
                      }}
                    >
                      <div>{branding.address || "A-123, Sector 62, Noida, U.P. 201301"}</div>
                      <div style={{ color: "#2563eb", fontWeight: 600 }}>
                        {branding.website
                          ? branding.website.replace(/^https?:\/\//, "")
                          : "www.acme.com"}
                      </div>
                      <div>{branding.phone || "+91 98765 43210"}</div>
                    </div>
                  </div>

                  {/* Document Title: QUOTATION */}
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: 900,
                      color: "#0f172a",
                      letterSpacing: "0.5px",
                    }}
                  >
                    QUOTATION
                  </div>

                  {/* Metadata Row: Bill To on left, Quote No/Date on right */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      fontSize: "10.5px",
                    }}
                  >
                    {/* Bill To */}
                    <div>
                      <span
                        style={{
                          fontSize: "9px",
                          fontWeight: 700,
                          color: "#94a3b8",
                          textTransform: "uppercase",
                          display: "block",
                        }}
                      >
                        BILL TO:
                      </span>
                      <div
                        style={{
                          fontSize: "11.5px",
                          fontWeight: 800,
                          color: "#0f172a",
                          marginTop: "1px",
                        }}
                      >
                        Innovate India
                      </div>
                      <div style={{ color: "#64748b", marginTop: "1px" }}>
                        BKC, Mumbai, Maharashtra
                      </div>
                    </div>

                    {/* Quotation Meta */}
                    <div
                      style={{
                        textAlign: "right",
                        fontSize: "10px",
                        color: "#475569",
                        lineHeight: "1.5",
                      }}
                    >
                      <div>
                        Quotation No:{" "}
                        <strong style={{ color: "#0f172a" }}>QUO-001</strong>
                      </div>
                      <div>
                        Date: <strong style={{ color: "#0f172a" }}>24-10-2026</strong>
                      </div>
                      <div>
                        Valid Till: <strong style={{ color: "#0f172a" }}>24-11-2026</strong>
                      </div>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      overflow: "hidden",
                    }}
                  >
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "10px",
                        textAlign: "left",
                      }}
                    >
                      <thead>
                        <tr
                          style={{
                            backgroundColor: "#f8fafc",
                            borderBottom: "1px solid #e2e8f0",
                            color: "#64748b",
                            fontWeight: 700,
                            fontSize: "9px",
                          }}
                        >
                          <th style={{ padding: "6px 8px", textAlign: "center", width: "24px" }}>
                            #
                          </th>
                          <th style={{ padding: "6px 8px" }}>DESCRIPTION</th>
                          <th style={{ padding: "6px 8px", textAlign: "center" }}>QTY</th>
                          <th style={{ padding: "6px 8px", textAlign: "center" }}>UNIT</th>
                          <th style={{ padding: "6px 8px", textAlign: "right" }}>RATE (₹)</th>
                          <th style={{ padding: "6px 8px", textAlign: "right" }}>AMOUNT (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "6px 8px", textAlign: "center", color: "#94a3b8" }}>
                            1
                          </td>
                          <td style={{ padding: "6px 8px", fontWeight: 600, color: "#0f172a" }}>
                            Web Development
                          </td>
                          <td style={{ padding: "6px 8px", textAlign: "center" }}>1</td>
                          <td style={{ padding: "6px 8px", textAlign: "center", color: "#64748b" }}>
                            Nos
                          </td>
                          <td style={{ padding: "6px 8px", textAlign: "right" }}>50,000</td>
                          <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 600 }}>
                            50,000
                          </td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "6px 8px", textAlign: "center", color: "#94a3b8" }}>
                            2
                          </td>
                          <td style={{ padding: "6px 8px", fontWeight: 600, color: "#0f172a" }}>
                            UI/UX Design
                          </td>
                          <td style={{ padding: "6px 8px", textAlign: "center" }}>1</td>
                          <td style={{ padding: "6px 8px", textAlign: "center", color: "#64748b" }}>
                            Nos
                          </td>
                          <td style={{ padding: "6px 8px", textAlign: "right" }}>30,000</td>
                          <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 600 }}>
                            30,000
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: "6px 8px", textAlign: "center", color: "#94a3b8" }}>
                            3
                          </td>
                          <td style={{ padding: "6px 8px", fontWeight: 600, color: "#0f172a" }}>
                            Maintenance Support
                          </td>
                          <td style={{ padding: "6px 8px", textAlign: "center" }}>1</td>
                          <td style={{ padding: "6px 8px", textAlign: "center", color: "#64748b" }}>
                            Nos
                          </td>
                          <td style={{ padding: "6px 8px", textAlign: "right" }}>20,000</td>
                          <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 600 }}>
                            20,000
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Calculations */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: "3px",
                      fontSize: "10.5px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "180px",
                        color: "#64748b",
                      }}
                    >
                      <span>Subtotal</span>
                      <span style={{ fontWeight: 600, color: "#0f172a" }}>₹1,00,000</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "180px",
                        color: "#64748b",
                      }}
                    >
                      <span>GST (18%)</span>
                      <span style={{ fontWeight: 600, color: "#0f172a" }}>₹18,000</span>
                    </div>
                    {/* Light Blue Highlighted Total Strip */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "180px",
                        backgroundColor: "#eff6ff",
                        padding: "5px 8px",
                        borderRadius: "4px",
                        fontWeight: 800,
                        fontSize: "12px",
                      }}
                    >
                      <span style={{ color: "#0f172a" }}>Total</span>
                      <span style={{ color: primary }}>₹1,18,000</span>
                    </div>
                  </div>

                  {/* Terms & Authorized Signatory */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-end",
                      paddingTop: "10px",
                      fontSize: "9.5px",
                    }}
                  >
                    {/* Left: Terms */}
                    <div>
                      <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "2px" }}>
                        Terms & Conditions:
                      </div>
                      <div style={{ color: "#64748b", lineHeight: "1.4" }}>
                        • Payment within 30 days.
                        <br />• This quotation is valid for 30 days.
                      </div>
                    </div>

                    {/* Right: Signature */}
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: "#94a3b8", fontSize: "9px", marginBottom: "2px" }}>
                        Authorized Signatory
                      </div>
                      <div
                        style={{
                          fontFamily: "'Brush Script MT', 'Caveat', 'Dancing Script', cursive",
                          fontSize: "20px",
                          color: "#0f172a",
                          lineHeight: "1.1",
                          margin: "2px 0",
                        }}
                      >
                        {branding.letterheadSignatoryName || "Rahul Sharma"}
                      </div>
                      <div style={{ fontWeight: 700, color: "#0f172a" }}>
                        {branding.letterheadSignatoryName || "Rahul Sharma"}
                      </div>
                      <div style={{ color: "#94a3b8", fontSize: "9px" }}>
                        {branding.name || "Acme Technologies Pvt Ltd"}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* MOU PREVIEW */}
              {previewDoc === "MOU" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "10.5px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: "1px solid #f1f5f9",
                      paddingBottom: "8px",
                    }}
                  >
                    <div style={{ fontWeight: 800, color: "#0f172a" }}>
                      {branding.name || "Acme Technologies Pvt Ltd"}
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: "9.5px" }}>Doc Ref: MOU-2026-001</div>
                  </div>

                  <div style={{ textAlign: "center", padding: "6px 0" }}>
                    <div style={{ color: primary, fontWeight: 900, fontSize: "13px" }}>
                      MEMORANDUM OF UNDERSTANDING
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: "9.5px", marginTop: "2px" }}>
                      Effective Date: 24th October 2026
                    </div>
                  </div>

                  <div style={{ color: "#475569", lineHeight: "1.5" }}>
                    This Memorandum of Understanding is entered into between{" "}
                    <strong style={{ color: "#0f172a" }}>{branding.name || "Acme Technologies Pvt Ltd"}</strong>{" "}
                    and <strong style={{ color: "#0f172a" }}>Innovate India</strong>.
                  </div>

                  <div
                    style={{
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      padding: "8px 12px",
                    }}
                  >
                    <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "2px" }}>
                      1. Purpose of Agreement
                    </div>
                    <div style={{ color: "#64748b", fontSize: "9.5px" }}>
                      Both parties agree to collaborate on technology development and joint enterprise delivery.
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-end",
                      paddingTop: "12px",
                      fontSize: "9.5px",
                    }}
                  >
                    <div>
                      <div style={{ color: "#94a3b8", marginBottom: "4px" }}>Authorized Signatory</div>
                      <div style={{ fontWeight: 700, color: "#0f172a" }}>Innovate India</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: "#94a3b8", marginBottom: "4px" }}>Authorized Signatory</div>
                      <div style={{ fontWeight: 700, color: "#0f172a" }}>
                        {branding.letterheadSignatoryName || "Rahul Sharma"}
                      </div>
                      <div style={{ color: "#94a3b8" }}>{branding.name || "Acme Technologies Pvt Ltd"}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* LETTERHEAD PREVIEW */}
              {previewDoc === "Letterhead" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", minHeight: "360px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      borderBottom: `2px solid ${primary}`,
                      paddingBottom: "12px",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 900, color: primary }}>
                        {branding.name || "Acme Technologies Pvt Ltd"}
                      </div>
                      <div style={{ fontSize: "10px", color: "#64748b", fontStyle: "italic" }}>
                        {branding.tagline || "Innovating for a Better Tomorrow"}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", fontSize: "9px", color: "#64748b", lineHeight: "1.4" }}>
                      <div>{branding.address || "A-123, Sector 62, Noida, U.P. 201301"}</div>
                      <div style={{ color: primary }}>{branding.website || "www.acme.com"}</div>
                      <div>{branding.phone || "+91 98765 43210"}</div>
                    </div>
                  </div>

                  <div style={{ color: "#334155", fontSize: "10.5px", lineHeight: "1.6", flex: 1 }}>
                    <p style={{ margin: "0 0 10px 0" }}>Date: 28th October 2026</p>
                    <p style={{ margin: "0 0 10px 0" }}>
                      <strong>To Whom It May Concern,</strong>
                    </p>
                    <p style={{ margin: "0 0 10px 0" }}>
                      This official letterhead is generated automatically with your customized branding colors, typography, and company information.
                    </p>
                  </div>

                  <div style={{ textAlign: "right", paddingTop: "10px", borderTop: "1px dashed #e2e8f0" }}>
                    <div
                      style={{
                        fontFamily: "'Brush Script MT', 'Caveat', cursive",
                        fontSize: "20px",
                        color: "#0f172a",
                      }}
                    >
                      {branding.letterheadSignatoryName || "Rahul Sharma"}
                    </div>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: "#0f172a" }}>
                      {branding.letterheadSignatoryName || "Rahul Sharma"}
                    </div>
                    <div style={{ fontSize: "9px", color: "#94a3b8" }}>
                      {branding.letterheadSignatoryTitle || "Chief Executive Officer"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= BOTTOM ACTION BUTTONS ================= */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "12px",
            paddingTop: "6px",
          }}
        >
          {/* Reset Changes Button */}
          <button
            type="button"
            onClick={handleReset}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
              backgroundColor: "#ffffff",
              color: "#334155",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
          >
            <RotateCcw style={{ width: "15px", height: "15px", color: "#64748b" }} />
            <span>Reset Changes</span>
          </button>

          {/* Save Branding Button */}
          <button
            type="button"
            onClick={() => handleSave()}
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
            <span>Save Branding</span>
          </button>
        </div>
      </div>
    </OrgLayout>
  );
}
