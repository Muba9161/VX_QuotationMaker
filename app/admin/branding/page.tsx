"use client";

import React, { useState, useRef } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  Search,
  Upload,
  Trash2,
  ChevronDown,
  Globe,
  Phone,
  Mail,
  MapPin,
  Check,
  FileText,
  SlidersHorizontal,
  Palette,
  Sparkles,
  Layers,
  ArrowRight,
  MoreVertical,
  CheckCircle2,
  Copy,
  RotateCcw,
  Download,
  Eye,
  ShieldCheck,
  QrCode,
  Image as ImageIcon,
} from "lucide-react";

interface OrgBranding {
  id: string;
  name: string;
  domain: string;
  tagline: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  emblemLetter: string;
  emblemBg: string;
  emblemColor: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: "Small" | "Medium" | "Large";
  showLogo: boolean;
  showTagline: boolean;
  useCustomHeaderFooter: boolean;
  showAddress: boolean;
  layout: "Standard" | "Modern" | "Minimal";
  status: "Active" | "Pending" | "Suspended";
  logoUrl?: string;
  lastModified?: string;
}

const SEED_ORGS: OrgBranding[] = [
  {
    id: "org-1",
    name: "Acme Technologies Pvt Ltd",
    domain: "acme.com",
    tagline: "Innovating for a Better Tomorrow",
    website: "https://www.acme.com",
    phone: "+91 98765 43210",
    email: "contact@acme.com",
    address: "A-123, Sector 62, Noida, UP 201309",
    emblemLetter: "A",
    emblemBg: "#dbeafe",
    emblemColor: "#2563eb",
    primaryColor: "#2563EB",
    secondaryColor: "#60A5FA",
    accentColor: "#1E3A8A",
    fontFamily: "Roboto",
    fontSize: "Large",
    showLogo: true,
    showTagline: true,
    useCustomHeaderFooter: true,
    showAddress: true,
    layout: "Modern",
    status: "Active",
    lastModified: "Today, 10:45 AM",
  },
  {
    id: "org-2",
    name: "NextGen Digital",
    domain: "nextgen.com",
    tagline: "Transforming Ideas into Reality",
    website: "https://www.nextgen.com",
    phone: "+91 98765 11111",
    email: "info@nextgen.com",
    address: "Plot 45, Hitec City, Hyderabad, TS 500081",
    emblemLetter: "N",
    emblemBg: "#ffedd5",
    emblemColor: "#ea580c",
    primaryColor: "#EA580C",
    secondaryColor: "#FDBA74",
    accentColor: "#9A3412",
    fontFamily: "Inter",
    fontSize: "Medium",
    showLogo: true,
    showTagline: true,
    useCustomHeaderFooter: true,
    showAddress: true,
    layout: "Modern",
    status: "Active",
    lastModified: "Yesterday, 04:15 PM",
  },
  {
    id: "org-3",
    name: "Global Systems",
    domain: "globalsys.com",
    tagline: "Empowering Enterprises Globally",
    website: "https://www.globalsys.com",
    phone: "+91 98765 22222",
    email: "hello@globalsys.com",
    address: "B-45, IT Park, Bangalore, KA 560100",
    emblemLetter: "G",
    emblemBg: "#cffafe",
    emblemColor: "#0891b2",
    primaryColor: "#0891B2",
    secondaryColor: "#67E8F9",
    accentColor: "#164E63",
    fontFamily: "Roboto",
    fontSize: "Medium",
    showLogo: true,
    showTagline: true,
    useCustomHeaderFooter: true,
    showAddress: true,
    layout: "Standard",
    status: "Active",
    lastModified: "25 Oct 2026",
  },
  {
    id: "org-4",
    name: "Tech Solutions",
    domain: "techsolution.com",
    tagline: "Scalable Cloud Architecture",
    website: "https://www.techsolution.com",
    phone: "+91 98765 33333",
    email: "support@techsolution.com",
    address: "Level 4, Cyber City, Gurugram, HR 122002",
    emblemLetter: "T",
    emblemBg: "#dbeafe",
    emblemColor: "#2563eb",
    primaryColor: "#2563EB",
    secondaryColor: "#93C5FD",
    accentColor: "#1E40AF",
    fontFamily: "Poppins",
    fontSize: "Medium",
    showLogo: true,
    showTagline: true,
    useCustomHeaderFooter: true,
    showAddress: true,
    layout: "Minimal",
    status: "Active",
    lastModified: "24 Oct 2026",
  },
  {
    id: "org-5",
    name: "Innovate India",
    domain: "innovate.com",
    tagline: "Fostering Indian Innovation",
    website: "https://www.innovate.com",
    phone: "+91 98765 44444",
    email: "contact@innovate.com",
    address: "T-Hub Phase 2, Madhapur, Hyderabad, TS",
    emblemLetter: "I",
    emblemBg: "#e0e7ff",
    emblemColor: "#1e3a8a",
    primaryColor: "#1E3A8A",
    secondaryColor: "#818CF8",
    accentColor: "#312E81",
    fontFamily: "Inter",
    fontSize: "Medium",
    showLogo: true,
    showTagline: true,
    useCustomHeaderFooter: true,
    showAddress: true,
    layout: "Modern",
    status: "Active",
    lastModified: "22 Oct 2026",
  },
  {
    id: "org-6",
    name: "Bright Future",
    domain: "brightfuture.com",
    tagline: "Educating Minds, Shaping Futures",
    website: "https://www.brightfuture.com",
    phone: "+91 98765 55555",
    email: "team@brightfuture.com",
    address: "C-12, Viman Nagar, Pune, MH 411014",
    emblemLetter: "B",
    emblemBg: "#f3e8ff",
    emblemColor: "#9333ea",
    primaryColor: "#9333EA",
    secondaryColor: "#D8B4FE",
    accentColor: "#581C87",
    fontFamily: "Outfit",
    fontSize: "Medium",
    showLogo: true,
    showTagline: true,
    useCustomHeaderFooter: true,
    showAddress: true,
    layout: "Standard",
    status: "Active",
    lastModified: "20 Oct 2026",
  },
  {
    id: "org-7",
    name: "CodeCraft Solutions",
    domain: "codecraft.com",
    tagline: "Precision Software Engineering",
    website: "https://www.codecraft.com",
    phone: "+91 98765 66666",
    email: "devs@codecraft.com",
    address: "8th Floor, Infopark, Kochi, KL 682042",
    emblemLetter: "C",
    emblemBg: "#dbeafe",
    emblemColor: "#2563eb",
    primaryColor: "#2563EB",
    secondaryColor: "#60A5FA",
    accentColor: "#1E3A8A",
    fontFamily: "Inter",
    fontSize: "Medium",
    showLogo: true,
    showTagline: true,
    useCustomHeaderFooter: true,
    showAddress: true,
    layout: "Standard",
    status: "Active",
    lastModified: "18 Oct 2026",
  },
  {
    id: "org-8",
    name: "DataMind Analytics",
    domain: "datamind.com",
    tagline: "Data Driven Decisions",
    website: "https://www.datamind.com",
    phone: "+91 98765 77777",
    email: "insights@datamind.com",
    address: "Block B, Manyata Tech Park, Bangalore, KA",
    emblemLetter: "D",
    emblemBg: "#e2e8f0",
    emblemColor: "#0f172a",
    primaryColor: "#0F172A",
    secondaryColor: "#94A3B8",
    accentColor: "#020617",
    fontFamily: "Roboto",
    fontSize: "Medium",
    showLogo: true,
    showTagline: true,
    useCustomHeaderFooter: true,
    showAddress: true,
    layout: "Minimal",
    status: "Active",
    lastModified: "15 Oct 2026",
  },
];

export default function BrandingPage() {
  const [topTab, setTopTab] = useState("Platform Branding");
  const [searchOrg, setSearchOrg] = useState("");
  const [sortOption, setSortOption] = useState<
    "Last Modified" | "Name (A-Z)" | "Active First" | "Domain"
  >("Last Modified");
  const [selectedOrgId, setSelectedOrgId] = useState<string>("org-1");

  const [orgs, setOrgs] = useState<OrgBranding[]>(SEED_ORGS);
  const selectedOrg = orgs.find((o) => o.id === selectedOrgId) || orgs[0];

  const [subTab, setSubTab] = useState("General");
  const [previewTemplate, setPreviewTemplate] = useState("Quotation Template");

  // Form editable state
  const [formState, setFormState] = useState<OrgBranding>(selectedOrg);

  // Dropdown states
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [activeOrgMenuId, setActiveOrgMenuId] = useState<string | null>(null);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // File input ref for logo upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Switch organization
  const handleSelectOrg = (org: OrgBranding) => {
    setSelectedOrgId(org.id);
    setFormState(org);
    setActiveOrgMenuId(null);
  };

  // Logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const resultUrl = reader.result as string;
        const updated = { ...formState, logoUrl: resultUrl };
        setFormState(updated);
        setOrgs((prev) =>
          prev.map((o) => (o.id === updated.id ? updated : o))
        );
        showToast("New logo uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove Logo
  const handleRemoveLogo = () => {
    const updated = { ...formState, logoUrl: undefined };
    setFormState(updated);
    setOrgs((prev) =>
      prev.map((o) => (o.id === updated.id ? updated : o))
    );
    showToast("Logo removed. Default vector emblem restored.");
  };

  // Save changes
  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setOrgs((prev) =>
      prev.map((o) =>
        o.id === formState.id
          ? { ...formState, lastModified: "Just now" }
          : o
      )
    );
    showToast(`Branding changes saved for ${formState.name}!`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Reset colors
  const handleResetColors = () => {
    setFormState({
      ...formState,
      primaryColor: "#2563EB",
      secondaryColor: "#60A5FA",
      accentColor: "#1E3A8A",
    });
    setShowActionsMenu(false);
    showToast("Brand colors reset to default palette.");
  };

  // Copy JSON configuration
  const handleCopyJSON = () => {
    navigator.clipboard?.writeText(JSON.stringify(formState, null, 2));
    setShowActionsMenu(false);
    showToast("Branding configuration copied to clipboard!");
  };

  // Apply to all templates
  const handleApplyAll = () => {
    setShowActionsMenu(false);
    showToast("Applied branding to all 12 platform templates!");
  };

  const topTabs = [
    "Platform Branding",
    "Organization Branding",
    "Brand Assets",
    "Theme Settings",
    "Email & Footer",
    "Watermark & Security",
  ];

  // Filter & Sort Orgs
  const filteredOrgs = orgs
    .filter(
      (o) =>
        o.name.toLowerCase().includes(searchOrg.toLowerCase()) ||
        o.domain.toLowerCase().includes(searchOrg.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOption === "Name (A-Z)") {
        return a.name.localeCompare(b.name);
      }
      if (sortOption === "Active First") {
        return a.status === "Active" ? -1 : 1;
      }
      if (sortOption === "Domain") {
        return a.domain.localeCompare(b.domain);
      }
      return 0; // default Last Modified
    });

  // Calculate font size styling in preview
  const getPreviewFontSize = () => {
    switch (formState.fontSize) {
      case "Small":
        return { body: "11px", heading: "18px", sub: "12px", table: "10.5px" };
      case "Large":
        return { body: "13px", heading: "22px", sub: "14px", table: "12px" };
      case "Medium":
      default:
        return { body: "12px", heading: "20px", sub: "13px", table: "11px" };
    }
  };

  const pSize = getPreviewFontSize();

  return (
    <AdminLayout activePath="/admin/branding">
      {/* Hidden File Input */}
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
            backgroundColor: "#0f172a",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            zIndex: 9999,
          }}
        >
          <CheckCircle2 style={{ width: "16px", height: "16px", color: "#4ade80" }} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div
        style={{
          width: "100%",
          maxWidth: "1650px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          boxSizing: "border-box",
        }}
      >
        {/* ================= PAGE HEADER ================= */}
        <div>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: "900",
              color: "#0f172a",
              letterSpacing: "-0.5px",
              margin: 0,
            }}
          >
            Branding
          </h1>
          <p
            style={{
              fontSize: "13px",
              color: "#64748b",
              margin: "4px 0 0 0",
            }}
          >
            Manage platform branding and organization-wise branding configurations
          </p>
        </div>

        {/* ================= TOP TABS BAR (Snippet 1) ================= */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "28px",
            borderBottom: "1px solid #e2e8f0",
            padding: "0 4px",
            overflowX: "auto",
          }}
        >
          {topTabs.map((tab) => {
            const isActive = topTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setTopTab(tab)}
                style={{
                  padding: "10px 4px",
                  fontSize: "14px",
                  fontWeight: isActive ? "800" : "600",
                  color: isActive ? "#2563eb" : "#64748b",
                  backgroundColor: "transparent",
                  border: "none",
                  borderBottom: isActive
                    ? "2.5px solid #2563eb"
                    : "2.5px solid transparent",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease",
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* ================= VIEW 1: BRAND ASSETS TAB ================= */}
        {topTab === "Brand Assets" && (
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              padding: "28px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                  Brand Assets Library
                </h2>
                <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0 0" }}>
                  Centralized repository of logos, watermarks, stamps, and letterhead assets
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  padding: "9px 18px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "700",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <Upload style={{ width: "15px", height: "15px" }} />
                <span>Upload New Asset</span>
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" }}>
              {[
                { name: "Acme Primary Logo (SVG)", type: "Logo", size: "42 KB", date: "28 Oct 2026" },
                { name: "Digital Signature Seal", type: "Stamp", size: "128 KB", date: "27 Oct 2026" },
                { name: "Corporate Watermark Stamp", type: "Watermark", size: "94 KB", date: "26 Oct 2026" },
                { name: "Executive Letterhead Template", type: "Letterhead", size: "310 KB", date: "25 Oct 2026" },
              ].map((asset, idx) => (
                <div
                  key={idx}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "16px",
                    backgroundColor: "#f8fafc",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      height: "100px",
                      backgroundColor: "#ffffff",
                      borderRadius: "8px",
                      border: "1px dashed #cbd5e1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#64748b",
                    }}
                  >
                    <ImageIcon style={{ width: "32px", height: "32px", color: "#94a3b8" }} />
                  </div>
                  <div>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a", display: "block" }}>
                      {asset.name}
                    </span>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>
                      {asset.type} • {asset.size} • {asset.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= VIEW 2: THEME SETTINGS TAB ================= */}
        {topTab === "Theme Settings" && (
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              padding: "28px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                Theme Presets & Palette Engine
              </h2>
              <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0 0" }}>
                Select a curated color system to apply across documents and dashboards
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "18px" }}>
              {[
                { name: "VorldX Royal Blue", p: "#2563EB", s: "#60A5FA", a: "#1E3A8A" },
                { name: "Emerald Growth", p: "#059669", s: "#34D399", a: "#064E3B" },
                { name: "Sunset Crimson", p: "#E11D48", s: "#FB7185", a: "#881337" },
                { name: "Modern Cyber Slate", p: "#0F172A", s: "#94A3B8", a: "#020617" },
              ].map((theme, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setFormState({
                      ...formState,
                      primaryColor: theme.p,
                      secondaryColor: theme.s,
                      accentColor: theme.a,
                    });
                    showToast(`Theme preset "${theme.name}" applied!`);
                  }}
                  style={{
                    border: formState.primaryColor === theme.p ? "2px solid #2563eb" : "1px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "16px",
                    cursor: "pointer",
                    backgroundColor: formState.primaryColor === theme.p ? "#eff6ff" : "#ffffff",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: theme.p }} />
                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: theme.s }} />
                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: theme.a }} />
                  </div>
                  <span style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", display: "block" }}>
                    {theme.name}
                  </span>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    Click to apply to active quotation
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= VIEW 3: WATERMARK & SECURITY TAB ================= */}
        {topTab === "Watermark & Security" && (
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              padding: "28px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              maxWidth: "800px",
            }}
          >
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                Document Watermark & Cryptographic Security
              </h2>
              <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0 0" }}>
                Protect generated Quotations and MOUs against tampering and unauthorized distribution
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                  Default Watermark Text
                </label>
                <input
                  type="text"
                  defaultValue="CONFIDENTIAL & PROPRIETARY"
                  style={{
                    width: "100%",
                    padding: "9px 14px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "8px" }}>
                <div>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a", display: "block" }}>
                    Embed Document Verification QR Code
                  </span>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    Allows clients to scan and verify authenticity online
                  </span>
                </div>
                <input type="checkbox" defaultChecked style={{ width: "20px", height: "20px", cursor: "pointer" }} />
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "8px" }}>
                <div>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a", display: "block" }}>
                    Enforce Digital Cryptographic Signature
                  </span>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    Affixes SHA-256 digital certificate stamp on PDF generation
                  </span>
                </div>
                <input type="checkbox" defaultChecked style={{ width: "20px", height: "20px", cursor: "pointer" }} />
              </div>
            </div>
          </div>
        )}

        {/* ================= VIEW 4: EMAIL & FOOTER TAB ================= */}
        {topTab === "Email & Footer" && (
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              padding: "28px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              maxWidth: "800px",
            }}
          >
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                Email Template & Document Footer Customization
              </h2>
              <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0 0" }}>
                Configure global footer disclaimers, support contacts, and legal notices
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                  Document Footer Disclaimer
                </label>
                <textarea
                  rows={4}
                  defaultValue="This quotation is valid for 30 days from the issue date. Payment terms: 50% advance upon confirmation and 50% upon milestone delivery. All prices are in INR and subject to applicable GST."
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "13px",
                    lineHeight: "1.5",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                  Platform Copyright Statement
                </label>
                <input
                  type="text"
                  defaultValue="© 2026 VorldX Technologies Pvt Ltd. Powered by White-Label Quotation Engine."
                  style={{
                    width: "100%",
                    padding: "9px 14px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= VIEW 5: 3-COLUMN MAIN WORKSPACE (Platform & Organization Branding) ================= */}
        {(topTab === "Platform Branding" || topTab === "Organization Branding") && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "250px 620px 1fr",
              gap: "20px",
              alignItems: "start",
              boxSizing: "border-box",
            }}
          >
            {/* ================= COLUMN 1: ORGANIZATIONS LIST (Snippet 5) ================= */}
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                padding: "18px 16px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                boxSizing: "border-box",
              }}
            >
              {/* Header with Title and 'Last Modified ▾' Dropdown (Snippet 5) */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "800",
                    color: "#0f172a",
                  }}
                >
                  Organizations
                </span>

                {/* Dropdown 'Last Modified ▾' */}
                <div style={{ position: "relative" }}>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as any)}
                    style={{
                      appearance: "none",
                      backgroundColor: "#ffffff",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      padding: "4px 24px 4px 10px",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#334155",
                      cursor: "pointer",
                      outline: "none",
                    }}
                  >
                    <option value="Last Modified">Last Modified</option>
                    <option value="Name (A-Z)">Name (A-Z)</option>
                    <option value="Active First">Active First</option>
                    <option value="Domain">Domain</option>
                  </select>
                  <ChevronDown
                    style={{
                      width: "12px",
                      height: "12px",
                      color: "#64748b",
                      position: "absolute",
                      right: "8px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              </div>

              {/* Search Input */}
              <div style={{ position: "relative" }}>
                <Search
                  style={{
                    width: "14px",
                    height: "14px",
                    color: "#94a3b8",
                    position: "absolute",
                    left: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                />
                <input
                  type="text"
                  placeholder="Search organizations..."
                  value={searchOrg}
                  onChange={(e) => setSearchOrg(e.target.value)}
                  style={{
                    width: "100%",
                    height: "36px",
                    padding: "0 10px 0 32px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#0f172a",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Organizations Vertical List with 3-Dots Action Menu (Snippet 5) */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  maxHeight: "720px",
                  overflowY: "auto",
                }}
              >
                {filteredOrgs.map((org) => {
                  const isSelected = org.id === selectedOrgId;
                  const isMenuOpen = activeOrgMenuId === org.id;

                  return (
                    <div
                      key={org.id}
                      style={{
                        position: "relative",
                      }}
                    >
                      <div
                        onClick={() => handleSelectOrg(org)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "9px 10px",
                          borderRadius: "10px",
                          backgroundColor: isSelected ? "#eff6ff" : "transparent",
                          border: `1px solid ${
                            isSelected ? "#bfdbfe" : "transparent"
                          }`,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          boxSizing: "border-box",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
                          {/* Circle Emblem or Logo Thumbnail */}
                          {org.logoUrl ? (
                            <img
                              src={org.logoUrl}
                              alt={org.name}
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                objectFit: "cover",
                                border: "1px solid #cbd5e1",
                                flexShrink: 0,
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                backgroundColor: org.emblemBg,
                                color: org.emblemColor,
                                fontWeight: "900",
                                fontSize: "13px",
                                display: "flex",
                                alignItems: "center",
                                justifyCenter: "center",
                                flexShrink: 0,
                                textAlign: "center",
                                lineHeight: "32px",
                              }}
                            >
                              {org.emblemLetter}
                            </div>
                          )}

                          <div style={{ minWidth: 0, flex: 1 }}>
                            <span
                              style={{
                                fontSize: "12px",
                                fontWeight: "700",
                                color: isSelected ? "#1d4ed8" : "#0f172a",
                                display: "block",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {org.name}
                            </span>
                            <span
                              style={{
                                fontSize: "11px",
                                color: "#64748b",
                                display: "block",
                              }}
                            >
                              {org.domain}
                            </span>
                          </div>
                        </div>

                        {/* 3-Dots Action Button (Snippet 5) */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveOrgMenuId(isMenuOpen ? null : org.id);
                          }}
                          style={{
                            padding: "4px",
                            backgroundColor: "transparent",
                            border: "none",
                            borderRadius: "6px",
                            color: "#94a3b8",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#0f172a")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                        >
                          <MoreVertical style={{ width: "15px", height: "15px" }} />
                        </button>
                      </div>

                      {/* 3-Dots Context Menu (Snippet 5) */}
                      {isMenuOpen && (
                        <div
                          style={{
                            position: "absolute",
                            right: "8px",
                            top: "38px",
                            backgroundColor: "#ffffff",
                            borderRadius: "10px",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                            border: "1px solid #e2e8f0",
                            width: "160px",
                            zIndex: 50,
                            padding: "6px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "2px",
                          }}
                        >
                          <button
                            onClick={() => {
                              handleSelectOrg(org);
                              setActiveOrgMenuId(null);
                            }}
                            style={{
                              padding: "6px 10px",
                              fontSize: "12px",
                              color: "#334155",
                              border: "none",
                              backgroundColor: "transparent",
                              borderRadius: "6px",
                              textAlign: "left",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                          >
                            <Eye style={{ width: "13px", height: "13px" }} />
                            <span>Preview</span>
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard?.writeText(`https://${org.domain}`);
                              setActiveOrgMenuId(null);
                              showToast(`Copied domain https://${org.domain}`);
                            }}
                            style={{
                              padding: "6px 10px",
                              fontSize: "12px",
                              color: "#334155",
                              border: "none",
                              backgroundColor: "transparent",
                              borderRadius: "6px",
                              textAlign: "left",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                          >
                            <Copy style={{ width: "13px", height: "13px" }} />
                            <span>Copy Domain</span>
                          </button>
                          <button
                            onClick={() => {
                              showToast(`Exported assets package for ${org.name}`);
                              setActiveOrgMenuId(null);
                            }}
                            style={{
                              padding: "6px 10px",
                              fontSize: "12px",
                              color: "#334155",
                              border: "none",
                              backgroundColor: "transparent",
                              borderRadius: "6px",
                              textAlign: "left",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                          >
                            <Download style={{ width: "13px", height: "13px" }} />
                            <span>Export Assets</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ================= COLUMN 2: BRANDING FORM (Snippets 2, 3, 4) ================= */}
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
              {/* Top Org Name & Actions Header (Snippet 2) */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px",
                  borderBottom: "1px solid #f1f5f9",
                  paddingBottom: "14px",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <h2
                      style={{
                        fontSize: "18px",
                        fontWeight: "900",
                        color: "#0f172a",
                        margin: 0,
                      }}
                    >
                      {formState.name}
                    </h2>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: "9999px",
                        fontSize: "10.5px",
                        fontWeight: "700",
                        backgroundColor: "#dcfce7",
                        color: "#166534",
                        border: "1px solid #bbf7d0",
                      }}
                    >
                      {formState.status}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      margin: "4px 0 0 0",
                    }}
                  >
                    Manage branding settings for this organization
                  </p>
                </div>

                {/* Right: Actions ▾ and Save Changes Buttons (Snippet 2) */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", position: "relative" }}>
                  {/* Actions ▾ Button */}
                  <button
                    type="button"
                    onClick={() => setShowActionsMenu(!showActionsMenu)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 14px",
                      backgroundColor: "#ffffff",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#334155",
                      cursor: "pointer",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                    }}
                  >
                    <span>Actions</span>
                    <ChevronDown style={{ width: "13px", height: "13px" }} />
                  </button>

                  {/* Actions Dropdown Menu */}
                  {showActionsMenu && (
                    <div
                      style={{
                        position: "absolute",
                        right: "120px",
                        top: "42px",
                        backgroundColor: "#ffffff",
                        borderRadius: "10px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                        border: "1px solid #e2e8f0",
                        width: "210px",
                        zIndex: 50,
                        padding: "6px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                      }}
                    >
                      <button
                        onClick={handleResetColors}
                        style={{
                          padding: "8px 12px",
                          fontSize: "12px",
                          color: "#334155",
                          border: "none",
                          backgroundColor: "transparent",
                          borderRadius: "6px",
                          textAlign: "left",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <RotateCcw style={{ width: "14px", height: "14px" }} />
                        <span>Reset to Default Colors</span>
                      </button>

                      <button
                        onClick={handleCopyJSON}
                        style={{
                          padding: "8px 12px",
                          fontSize: "12px",
                          color: "#334155",
                          border: "none",
                          backgroundColor: "transparent",
                          borderRadius: "6px",
                          textAlign: "left",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <Copy style={{ width: "14px", height: "14px" }} />
                        <span>Copy Branding JSON</span>
                      </button>

                      <button
                        onClick={handleApplyAll}
                        style={{
                          padding: "8px 12px",
                          fontSize: "12px",
                          color: "#334155",
                          border: "none",
                          backgroundColor: "transparent",
                          borderRadius: "6px",
                          textAlign: "left",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <Sparkles style={{ width: "14px", height: "14px" }} />
                        <span>Apply to All Templates</span>
                      </button>
                    </div>
                  )}

                  {/* Save Changes Button */}
                  <button
                    type="button"
                    onClick={() => handleSave()}
                    style={{
                      padding: "8px 18px",
                      backgroundColor: "#2563eb",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "700",
                      cursor: "pointer",
                      boxShadow: "0 2px 6px rgba(37,99,235,0.25)",
                      transition: "background-color 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1d4ed8")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
                  >
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Sub-tabs */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "22px",
                  borderBottom: "1px solid #e2e8f0",
                  overflowX: "auto",
                }}
              >
                {[
                  "General",
                  "Logo & Identity",
                  "Colors & Theme",
                  "Document Header/Footer",
                  "Typography",
                  "Email Branding",
                ].map((st) => {
                  const isActive = subTab === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSubTab(st)}
                      style={{
                        padding: "8px 2px",
                        fontSize: "12.5px",
                        fontWeight: isActive ? "800" : "600",
                        color: isActive ? "#2563eb" : "#64748b",
                        backgroundColor: "transparent",
                        border: "none",
                        borderBottom: isActive
                          ? "2.5px solid #2563eb"
                          : "2.5px solid transparent",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {st}
                    </button>
                  );
                })}
              </div>

              {/* Form Body */}
              <form
                onSubmit={handleSave}
                style={{ display: "flex", flexDirection: "column", gap: "20px" }}
              >
                {/* Section 1: Basic Information & Organization Logo (Snippet 3) */}
                <div>
                  <span
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: "800",
                      color: "#0f172a",
                      marginBottom: "12px",
                    }}
                  >
                    Basic Information
                  </span>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.3fr 1fr",
                      gap: "20px",
                      alignItems: "start",
                    }}
                  >
                    {/* Left Column: Name, Tagline, Website */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "11px",
                            fontWeight: "700",
                            color: "#475569",
                            marginBottom: "4px",
                          }}
                        >
                          Organization Name
                        </label>
                        <input
                          type="text"
                          value={formState.name}
                          onChange={(e) =>
                            setFormState({ ...formState, name: e.target.value })
                          }
                          style={{
                            width: "100%",
                            height: "38px",
                            padding: "0 10px",
                            border: "1px solid #cbd5e1",
                            borderRadius: "8px",
                            fontSize: "12px",
                            color: "#0f172a",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "11px",
                            fontWeight: "700",
                            color: "#475569",
                            marginBottom: "4px",
                          }}
                        >
                          Tagline
                        </label>
                        <input
                          type="text"
                          value={formState.tagline}
                          onChange={(e) =>
                            setFormState({ ...formState, tagline: e.target.value })
                          }
                          style={{
                            width: "100%",
                            height: "38px",
                            padding: "0 10px",
                            border: "1px solid #cbd5e1",
                            borderRadius: "8px",
                            fontSize: "12px",
                            color: "#0f172a",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "11px",
                            fontWeight: "700",
                            color: "#475569",
                            marginBottom: "4px",
                          }}
                        >
                          Website
                        </label>
                        <input
                          type="text"
                          value={formState.website}
                          onChange={(e) =>
                            setFormState({ ...formState, website: e.target.value })
                          }
                          style={{
                            width: "100%",
                            height: "38px",
                            padding: "0 10px",
                            border: "1px solid #cbd5e1",
                            borderRadius: "8px",
                            fontSize: "12px",
                            color: "#0f172a",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>
                    </div>

                    {/* Right Column: Organization Logo Box & Upload/Remove Buttons (Snippet 3) */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "11px",
                          fontWeight: "700",
                          color: "#475569",
                          marginBottom: "4px",
                        }}
                      >
                        Organization Logo
                      </label>

                      <div
                        style={{
                          border: "1px solid #cbd5e1",
                          borderRadius: "10px",
                          backgroundColor: "#f8fafc",
                          padding: "16px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          height: "100px",
                          boxSizing: "border-box",
                          overflow: "hidden",
                        }}
                      >
                        {formState.logoUrl ? (
                          <img
                            src={formState.logoUrl}
                            alt="Org Logo"
                            style={{
                              maxHeight: "70px",
                              maxWidth: "140px",
                              objectFit: "contain",
                            }}
                          />
                        ) : (
                          <>
                            <svg
                              viewBox="0 0 40 32"
                              style={{ width: "42px", height: "32px" }}
                            >
                              <path
                                d="M20 2 L4 30 L16 30 Z"
                                fill={formState.primaryColor}
                              />
                              <path
                                d="M20 2 L36 30 L24 30 Z"
                                fill={formState.secondaryColor}
                              />
                              <path d="M16 20 L24 20 L20 12 Z" fill="#ffffff" />
                            </svg>
                            <span
                              style={{
                                fontSize: "13px",
                                fontWeight: "900",
                                color: "#0f172a",
                                letterSpacing: "1px",
                              }}
                            >
                              ACME
                            </span>
                          </>
                        )}
                      </div>

                      {/* Upload New Logo & Remove Buttons (Snippet 3) */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginTop: "8px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          style={{
                            flex: 1,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            padding: "6px 10px",
                            backgroundColor: "#ffffff",
                            border: "1px solid #2563eb",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: "700",
                            color: "#2563eb",
                            cursor: "pointer",
                            transition: "background-color 0.15s ease",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "#eff6ff")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "#ffffff")
                          }
                        >
                          <Upload style={{ width: "13px", height: "13px" }} />
                          <span>Upload New Logo</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            padding: "6px 10px",
                            backgroundColor: "#ffffff",
                            border: "1px solid #fee2e2",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: "700",
                            color: "#dc2626",
                            cursor: "pointer",
                            transition: "background-color 0.15s ease",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "#fef2f2")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "#ffffff")
                          }
                        >
                          <Trash2 style={{ width: "13px", height: "13px" }} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Brand Colors */}
                <div>
                  <span
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: "800",
                      color: "#0f172a",
                      marginBottom: "2px",
                    }}
                  >
                    Brand Colors
                  </span>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "#64748b",
                      margin: "0 0 10px 0",
                    }}
                  >
                    These colors will be used in documents, templates and communications
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "12px",
                    }}
                  >
                    {/* Primary Color */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "11px",
                          fontWeight: "700",
                          color: "#475569",
                          marginBottom: "4px",
                        }}
                      >
                        Primary Color
                      </label>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          height: "36px",
                          padding: "0 8px",
                          backgroundColor: "#f8fafc",
                          border: "1px solid #cbd5e1",
                          borderRadius: "8px",
                          boxSizing: "border-box",
                        }}
                      >
                        <input
                          type="color"
                          value={formState.primaryColor}
                          onChange={(e) =>
                            setFormState({
                              ...formState,
                              primaryColor: e.target.value,
                            })
                          }
                          style={{
                            width: "22px",
                            height: "22px",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            padding: 0,
                            backgroundColor: "transparent",
                          }}
                        />
                        <input
                          type="text"
                          value={formState.primaryColor}
                          onChange={(e) =>
                            setFormState({
                              ...formState,
                              primaryColor: e.target.value,
                            })
                          }
                          style={{
                            width: "100%",
                            border: "none",
                            background: "transparent",
                            fontSize: "11.5px",
                            fontWeight: "700",
                            color: "#0f172a",
                            outline: "none",
                            fontFamily: "monospace",
                          }}
                        />
                      </div>
                    </div>

                    {/* Secondary Color */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "11px",
                          fontWeight: "700",
                          color: "#475569",
                          marginBottom: "4px",
                        }}
                      >
                        Secondary Color
                      </label>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          height: "36px",
                          padding: "0 8px",
                          backgroundColor: "#f8fafc",
                          border: "1px solid #cbd5e1",
                          borderRadius: "8px",
                          boxSizing: "border-box",
                        }}
                      >
                        <input
                          type="color"
                          value={formState.secondaryColor}
                          onChange={(e) =>
                            setFormState({
                              ...formState,
                              secondaryColor: e.target.value,
                            })
                          }
                          style={{
                            width: "22px",
                            height: "22px",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            padding: 0,
                            backgroundColor: "transparent",
                          }}
                        />
                        <input
                          type="text"
                          value={formState.secondaryColor}
                          onChange={(e) =>
                            setFormState({
                              ...formState,
                              secondaryColor: e.target.value,
                            })
                          }
                          style={{
                            width: "100%",
                            border: "none",
                            background: "transparent",
                            fontSize: "11.5px",
                            fontWeight: "700",
                            color: "#0f172a",
                            outline: "none",
                            fontFamily: "monospace",
                          }}
                        />
                      </div>
                    </div>

                    {/* Accent Color */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "11px",
                          fontWeight: "700",
                          color: "#475569",
                          marginBottom: "4px",
                        }}
                      >
                        Accent Color
                      </label>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          height: "36px",
                          padding: "0 8px",
                          backgroundColor: "#f8fafc",
                          border: "1px solid #cbd5e1",
                          borderRadius: "8px",
                          boxSizing: "border-box",
                        }}
                      >
                        <input
                          type="color"
                          value={formState.accentColor}
                          onChange={(e) =>
                            setFormState({
                              ...formState,
                              accentColor: e.target.value,
                            })
                          }
                          style={{
                            width: "22px",
                            height: "22px",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            padding: 0,
                            backgroundColor: "transparent",
                          }}
                        />
                        <input
                          type="text"
                          value={formState.accentColor}
                          onChange={(e) =>
                            setFormState({
                              ...formState,
                              accentColor: e.target.value,
                            })
                          }
                          style={{
                            width: "100%",
                            border: "none",
                            background: "transparent",
                            fontSize: "11.5px",
                            fontWeight: "700",
                            color: "#0f172a",
                            outline: "none",
                            fontFamily: "monospace",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Typography (Snippet 4) */}
                <div>
                  <span
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: "800",
                      color: "#0f172a",
                      marginBottom: "8px",
                    }}
                  >
                    Typography
                  </span>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "14px",
                    }}
                  >
                    {/* Primary Font: Roboto ▾ (Snippet 4) */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "11px",
                          fontWeight: "700",
                          color: "#475569",
                          marginBottom: "4px",
                        }}
                      >
                        Primary Font
                      </label>
                      <div style={{ position: "relative" }}>
                        <select
                          value={formState.fontFamily}
                          onChange={(e) =>
                            setFormState({
                              ...formState,
                              fontFamily: e.target.value,
                            })
                          }
                          style={{
                            width: "100%",
                            height: "36px",
                            padding: "0 28px 0 12px",
                            backgroundColor: "#ffffff",
                            border: "1px solid #cbd5e1",
                            borderRadius: "8px",
                            fontSize: "12px",
                            color: "#0f172a",
                            fontWeight: "600",
                            appearance: "none",
                            outline: "none",
                            cursor: "pointer",
                            boxSizing: "border-box",
                          }}
                        >
                          <option value="Roboto">Roboto</option>
                          <option value="Inter">Inter</option>
                          <option value="Poppins">Poppins</option>
                          <option value="Outfit">Outfit</option>
                          <option value="Montserrat">Montserrat</option>
                          <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                        </select>
                        <ChevronDown
                          style={{
                            width: "14px",
                            height: "14px",
                            color: "#64748b",
                            position: "absolute",
                            right: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            pointerEvents: "none",
                          }}
                        />
                      </div>
                    </div>

                    {/* Font Size: Large ▾ (Snippet 4) */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "11px",
                          fontWeight: "700",
                          color: "#475569",
                          marginBottom: "4px",
                        }}
                      >
                        Font Size
                      </label>
                      <div style={{ position: "relative" }}>
                        <select
                          value={formState.fontSize}
                          onChange={(e) =>
                            setFormState({
                              ...formState,
                              fontSize: e.target.value as any,
                            })
                          }
                          style={{
                            width: "100%",
                            height: "36px",
                            padding: "0 28px 0 12px",
                            backgroundColor: "#ffffff",
                            border: "1px solid #cbd5e1",
                            borderRadius: "8px",
                            fontSize: "12px",
                            color: "#0f172a",
                            fontWeight: "600",
                            appearance: "none",
                            outline: "none",
                            cursor: "pointer",
                            boxSizing: "border-box",
                          }}
                        >
                          <option value="Small">Small</option>
                          <option value="Medium">Medium</option>
                          <option value="Large">Large</option>
                        </select>
                        <ChevronDown
                          style={{
                            width: "14px",
                            height: "14px",
                            color: "#64748b",
                            position: "absolute",
                            right: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            pointerEvents: "none",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 4: Document Display Settings & Default Document Layout (Snippet 4) */}
                <div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.3fr 1fr",
                      gap: "20px",
                      alignItems: "start",
                    }}
                  >
                    {/* Left: 4 Toggles (Snippet 4) */}
                    <div>
                      <span
                        style={{
                          display: "block",
                          fontSize: "13px",
                          fontWeight: "800",
                          color: "#0f172a",
                          marginBottom: "10px",
                        }}
                      >
                        Document Display Settings
                      </span>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                          fontSize: "12px",
                        }}
                      >
                        {[
                          {
                            label: "Show organization logo in documents",
                            key: "showLogo",
                          },
                          {
                            label: "Show tagline in documents",
                            key: "showTagline",
                          },
                          {
                            label: "Use custom header/footer",
                            key: "useCustomHeaderFooter",
                          },
                          {
                            label: "Show organization address",
                            key: "showAddress",
                          },
                        ].map((item) => {
                          const val = (formState as any)[item.key];
                          return (
                            <div
                              key={item.key}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                setFormState({
                                  ...formState,
                                  [item.key]: !val,
                                })
                              }
                            >
                              <div
                                style={{
                                  width: "36px",
                                  height: "20px",
                                  backgroundColor: val ? "#2563eb" : "#cbd5e1",
                                  borderRadius: "9999px",
                                  padding: "2px",
                                  display: "flex",
                                  alignItems: "center",
                                  transition: "background-color 0.2s ease",
                                  flexShrink: 0,
                                  boxSizing: "border-box",
                                }}
                              >
                                <div
                                  style={{
                                    width: "16px",
                                    height: "16px",
                                    backgroundColor: "#ffffff",
                                    borderRadius: "50%",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                                    transform: val
                                      ? "translateX(16px)"
                                      : "translateX(0px)",
                                    transition: "transform 0.2s ease",
                                  }}
                                />
                              </div>
                              <span
                                style={{
                                  color: "#334155",
                                  fontWeight: "600",
                                  userSelect: "none",
                                }}
                              >
                                {item.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right: Default Document Layout (Standard, Modern [highlighted], Minimal) (Snippet 4) */}
                    <div>
                      <span
                        style={{
                          display: "block",
                          fontSize: "12px",
                          fontWeight: "700",
                          color: "#475569",
                          marginBottom: "8px",
                        }}
                      >
                        Default Document Layout
                      </span>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr 1fr",
                          gap: "8px",
                        }}
                      >
                        {(["Standard", "Modern", "Minimal"] as const).map(
                          (lay) => {
                            const isSel = formState.layout === lay;
                            return (
                              <div
                                key={lay}
                                onClick={() =>
                                  setFormState({ ...formState, layout: lay })
                                }
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  gap: "6px",
                                  cursor: "pointer",
                                }}
                              >
                                <div
                                  style={{
                                    width: "100%",
                                    height: "64px",
                                    border: `1.5px solid ${
                                      isSel ? "#2563eb" : "#cbd5e1"
                                    }`,
                                    borderRadius: "8px",
                                    backgroundColor: "#ffffff",
                                    padding: "6px",
                                    boxSizing: "border-box",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    boxShadow: isSel
                                      ? "0 0 0 2px rgba(37,99,235,0.15)"
                                      : "none",
                                    transition: "all 0.15s ease",
                                  }}
                                >
                                  <div
                                    style={{
                                      height: "4px",
                                      backgroundColor: isSel
                                        ? "#2563eb"
                                        : "#cbd5e1",
                                      borderRadius: "2px",
                                      width: lay === "Modern" ? "100%" : "60%",
                                    }}
                                  />
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: "3px",
                                    }}
                                  >
                                    <div
                                      style={{
                                        height: "3px",
                                        backgroundColor: "#f1f5f9",
                                        width: "100%",
                                      }}
                                    />
                                    <div
                                      style={{
                                        height: "3px",
                                        backgroundColor: "#f1f5f9",
                                        width: "75%",
                                      }}
                                    />
                                  </div>
                                  <div
                                    style={{
                                      height: "3px",
                                      backgroundColor: isSel
                                        ? "#93c5fd"
                                        : "#e2e8f0",
                                      borderRadius: "1px",
                                      width: "40%",
                                      alignSelf: "flex-end",
                                    }}
                                  />
                                </div>
                                <span
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: isSel ? "800" : "600",
                                    color: isSel ? "#2563eb" : "#64748b",
                                  }}
                                >
                                  {lay}
                                </span>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* ================= COLUMN 3: LIVE A4 DOCUMENT PREVIEW ================= */}
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                padding: "20px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                boxSizing: "border-box",
                position: "sticky",
                top: "20px",
              }}
            >
              {/* Preview Header & Template Selector */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "800",
                      color: "#0f172a",
                    }}
                  >
                    Document Preview
                  </span>
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: "#22c55e",
                      display: "inline-block",
                    }}
                  />
                </div>

                <div style={{ position: "relative" }}>
                  <select
                    value={previewTemplate}
                    onChange={(e) => setPreviewTemplate(e.target.value)}
                    style={{
                      appearance: "none",
                      backgroundColor: "#ffffff",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      padding: "5px 28px 5px 10px",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#334155",
                      cursor: "pointer",
                      outline: "none",
                    }}
                  >
                    <option value="Quotation Template">Quotation Template</option>
                    <option value="MOU Agreement">MOU Agreement</option>
                    <option value="Commercial Proposal">Commercial Proposal</option>
                    <option value="Partnership Agreement">Partnership Agreement</option>
                  </select>
                  <ChevronDown
                    style={{
                      width: "12px",
                      height: "12px",
                      color: "#64748b",
                      position: "absolute",
                      right: "8px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              </div>

              {/* A4 Sheet Container dynamically reacting to all branding states */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "24px 22px",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
                  boxSizing: "border-box",
                  fontFamily: formState.fontFamily,
                  color: "#1e293b",
                  position: "relative",
                  overflow: "hidden",
                  minHeight: "560px",
                }}
              >
                {/* Modern Ribbon Header (Reacts to useCustomHeaderFooter & layout) */}
                {formState.useCustomHeaderFooter && formState.layout === "Modern" && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "6px",
                      backgroundColor: formState.primaryColor,
                    }}
                  />
                )}

                {/* Minimalist Top Bar */}
                {formState.layout === "Minimal" && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "2px",
                      backgroundColor: "#e2e8f0",
                    }}
                  />
                )}

                {/* Document Header Section */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "16px",
                    borderBottom: `2px solid ${
                      formState.layout === "Modern" ? formState.primaryColor : "#e2e8f0"
                    }`,
                    paddingBottom: "14px",
                    marginBottom: "16px",
                  }}
                >
                  {/* Left: Organization Logo & Branding Identity */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {formState.showLogo && (
                      formState.logoUrl ? (
                        <img
                          src={formState.logoUrl}
                          alt="Company Logo"
                          style={{
                            maxHeight: "44px",
                            maxWidth: "110px",
                            objectFit: "contain",
                          }}
                        />
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <svg
                            viewBox="0 0 40 32"
                            style={{ width: "36px", height: "28px" }}
                          >
                            <path
                              d="M20 2 L4 30 L16 30 Z"
                              fill={formState.primaryColor}
                            />
                            <path
                              d="M20 2 L36 30 L24 30 Z"
                              fill={formState.secondaryColor}
                            />
                            <path d="M16 20 L24 20 L20 12 Z" fill="#ffffff" />
                          </svg>
                          <span
                            style={{
                              fontSize: "14px",
                              fontWeight: "900",
                              color: "#0f172a",
                              letterSpacing: "1px",
                            }}
                          >
                            ACME
                          </span>
                        </div>
                      )
                    )}
                  </div>

                  {/* Right: Organization Contact Info & Tagline */}
                  <div style={{ textAlign: "right", fontSize: pSize.sub }}>
                    <span
                      style={{
                        fontSize: pSize.body,
                        fontWeight: "800",
                        color: "#0f172a",
                        display: "block",
                      }}
                    >
                      {formState.name}
                    </span>
                    {formState.showTagline && (
                      <span
                        style={{
                          fontSize: "10.5px",
                          fontStyle: "italic",
                          color: formState.primaryColor,
                          display: "block",
                          marginTop: "1px",
                        }}
                      >
                        {formState.tagline}
                      </span>
                    )}
                    {formState.showAddress && (
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#64748b",
                          marginTop: "3px",
                          lineHeight: "1.3",
                        }}
                      >
                        <span>{formState.website}</span> • <span>{formState.phone}</span>
                        <br />
                        <span>{formState.email}</span>
                        <br />
                        <span>{formState.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Document Title & Meta Bar */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    marginBottom: "16px",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: pSize.heading,
                        fontWeight: "900",
                        color: "#0f172a",
                        margin: 0,
                        letterSpacing: "-0.4px",
                      }}
                    >
                      Quotation
                    </h3>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        backgroundColor: "#f1f5f9",
                        color: formState.primaryColor,
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: "700",
                        marginBottom: "3px",
                      }}
                    >
                      #QTN-2026-001
                    </span>
                    <div style={{ fontSize: "10px", color: "#64748b" }}>
                      <span>Date: 28 Oct 2026</span> • <span>Valid: 28 Nov 2026</span>
                    </div>
                  </div>
                </div>

                {/* Bill To Section */}
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    marginBottom: "14px",
                    fontSize: pSize.sub,
                    borderLeft: `3px solid ${formState.primaryColor}`,
                  }}
                >
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: "700",
                      color: "#64748b",
                      textTransform: "uppercase",
                      display: "block",
                    }}
                  >
                    Bill To:
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "800",
                      color: "#0f172a",
                      display: "block",
                    }}
                  >
                    Global Systems Ltd
                  </span>
                  <span style={{ fontSize: "10.5px", color: "#64748b" }}>
                    B-45, IT Park, Bangalore, KA 560100
                  </span>
                </div>

                {/* Line Items Table */}
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    textAlign: "left",
                    marginBottom: "16px",
                    fontSize: pSize.table,
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: "#f8fafc",
                        borderBottom: "1.5px solid #e2e8f0",
                        color: "#475569",
                        fontSize: "10px",
                        fontWeight: "700",
                      }}
                    >
                      <th style={{ padding: "6px 8px" }}>#</th>
                      <th style={{ padding: "6px 8px" }}>Description</th>
                      <th style={{ padding: "6px 8px", textAlign: "center" }}>Qty</th>
                      <th style={{ padding: "6px 8px", textAlign: "right" }}>Rate</th>
                      <th style={{ padding: "6px 8px", textAlign: "right" }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "7px 8px", color: "#64748b" }}>1</td>
                      <td style={{ padding: "7px 8px", fontWeight: "700", color: "#0f172a" }}>
                        Enterprise Web Architecture
                      </td>
                      <td style={{ padding: "7px 8px", textAlign: "center" }}>1</td>
                      <td style={{ padding: "7px 8px", textAlign: "right" }}>₹50,000</td>
                      <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: "700" }}>₹50,000</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "7px 8px", color: "#64748b" }}>2</td>
                      <td style={{ padding: "7px 8px", fontWeight: "700", color: "#0f172a" }}>
                        UI/UX Design & Prototype
                      </td>
                      <td style={{ padding: "7px 8px", textAlign: "center" }}>1</td>
                      <td style={{ padding: "7px 8px", textAlign: "right" }}>₹20,000</td>
                      <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: "700" }}>₹20,000</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "7px 8px", color: "#64748b" }}>3</td>
                      <td style={{ padding: "7px 8px", fontWeight: "700", color: "#0f172a" }}>
                        Cloud Deployment & CI/CD
                      </td>
                      <td style={{ padding: "7px 8px", textAlign: "center" }}>1</td>
                      <td style={{ padding: "7px 8px", textAlign: "right" }}>₹10,000</td>
                      <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: "700" }}>₹10,000</td>
                    </tr>
                  </tbody>
                </table>

                {/* Totals Calculation Card */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "200px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                      fontSize: "11px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b" }}>
                      <span>Subtotal:</span>
                      <span style={{ fontWeight: "700", color: "#0f172a" }}>₹80,000</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b" }}>
                      <span>GST (18%):</span>
                      <span style={{ fontWeight: "700", color: "#0f172a" }}>₹14,400</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        paddingTop: "6px",
                        borderTop: `1.5px solid ${formState.primaryColor}`,
                        fontWeight: "900",
                        fontSize: "13px",
                        color: formState.primaryColor,
                      }}
                    >
                      <span>Grand Total:</span>
                      <span>₹94,400</span>
                    </div>
                  </div>
                </div>

                {/* Footer Ribbon */}
                {formState.useCustomHeaderFooter && (
                  <div
                    style={{
                      marginTop: "16px",
                      paddingTop: "10px",
                      borderTop: "1px dashed #cbd5e1",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "9.5px",
                      color: "#94a3b8",
                    }}
                  >
                    <span>Authorized by {formState.name}</span>
                    <span>Page 1 of 1</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
