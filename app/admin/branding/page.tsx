"use client";
import React, { useState } from "react";
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
  fontSize: string;
  showLogo: boolean;
  showTagline: boolean;
  useCustomHeaderFooter: boolean;
  showAddress: boolean;
  layout: "Standard" | "Modern" | "Minimal";
  status: "Active" | "Pending" | "Suspended";
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
    fontFamily: "Poppins",
    fontSize: "Medium",
    showLogo: true,
    showTagline: true,
    useCustomHeaderFooter: true,
    showAddress: true,
    layout: "Standard",
    status: "Active",
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
  },
];

export default function BrandingPage() {
  const [topTab, setTopTab] = useState("Platform Branding");
  const [searchOrg, setSearchOrg] = useState("");
  const [selectedOrgId, setSelectedOrgId] = useState<string>("org-1");

  // Middle panel state for current org
  const [orgs, setOrgs] = useState<OrgBranding[]>(SEED_ORGS);
  const selectedOrg = orgs.find((o) => o.id === selectedOrgId) || orgs[0];

  const [subTab, setSubTab] = useState("General");
  const [previewTemplate, setPreviewTemplate] = useState("Quotation Template");

  // Form editable state
  const [formState, setFormState] = useState<OrgBranding>(selectedOrg);

  // Switch organization
  const handleSelectOrg = (org: OrgBranding) => {
    setSelectedOrgId(org.id);
    setFormState(org);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setOrgs((prev) =>
      prev.map((o) => (o.id === formState.id ? { ...formState } : o))
    );
    alert(`Branding settings saved for ${formState.name}!`);
  };

  const topTabs = [
    "Platform Branding",
    "Organization Branding",
    "Brand Assets",
    "Theme Settings",
    "Email & Footer",
    "Watermark & Security",
  ];

  const filteredOrgs = orgs.filter(
    (o) =>
      o.name.toLowerCase().includes(searchOrg.toLowerCase()) ||
      o.domain.toLowerCase().includes(searchOrg.toLowerCase())
  );

  return (
    <AdminLayout activePath="/admin/branding">
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

        {/* ================= TOP TABS BAR ================= */}
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
                  fontSize: "13.5px",
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

        {/* ================= 3-COLUMN MAIN WORKSPACE ================= */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "230px 600px 1fr",
            gap: "20px",
            alignItems: "start",
            boxSizing: "border-box",
          }}
        >
          {/* ================= COLUMN 1: ORGANIZATIONS LIST ================= */}
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
            <span
              style={{
                fontSize: "14px",
                fontWeight: "800",
                color: "#0f172a",
              }}
            >
              Organizations
            </span>

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

            {/* Organizations Vertical List */}
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
                return (
                  <div
                    key={org.id}
                    onClick={() => handleSelectOrg(org)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
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
                    {/* Circle Emblem */}
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
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {org.emblemLetter}
                    </div>

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
                );
              })}
            </div>
          </div>

          {/* ================= COLUMN 2: BRANDING CONFIGURATION FORM ================= */}
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
            {/* Top Org Name & Actions Header */}
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

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "7px 14px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#334155",
                    cursor: "pointer",
                  }}
                >
                  <span>Actions</span>
                  <ChevronDown style={{ width: "12px", height: "12px" }} />
                </button>

                <button
                  onClick={handleSave}
                  style={{
                    padding: "7px 18px",
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(37,99,235,0.2)",
                  }}
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
              {/* Section 1: Basic Information */}
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

                  {/* Right Column: Organization Logo Box */}
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
                      }}
                    >
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
                    </div>

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
                        onClick={() => alert("Logo upload modal opened")}
                        style={{
                          flex: 1,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "4px",
                          padding: "6px 8px",
                          backgroundColor: "#ffffff",
                          border: "1px solid #2563eb",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: "700",
                          color: "#2563eb",
                          cursor: "pointer",
                        }}
                      >
                        <Upload style={{ width: "12px", height: "12px" }} />
                        <span>Upload New Logo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => alert("Logo reset to default.")}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "4px",
                          padding: "6px 10px",
                          backgroundColor: "#ffffff",
                          border: "1px solid #fee2e2",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: "700",
                          color: "#dc2626",
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 style={{ width: "12px", height: "12px" }} />
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
                      <div
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "4px",
                          backgroundColor: formState.primaryColor,
                          flexShrink: 0,
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
                      <ChevronDown
                        style={{
                          width: "12px",
                          height: "12px",
                          color: "#94a3b8",
                          flexShrink: 0,
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
                      <div
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "4px",
                          backgroundColor: formState.secondaryColor,
                          flexShrink: 0,
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
                      <ChevronDown
                        style={{
                          width: "12px",
                          height: "12px",
                          color: "#94a3b8",
                          flexShrink: 0,
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
                      <div
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "4px",
                          backgroundColor: formState.accentColor,
                          flexShrink: 0,
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
                      <ChevronDown
                        style={{
                          width: "12px",
                          height: "12px",
                          color: "#94a3b8",
                          flexShrink: 0,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Typography */}
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
                  {/* Primary Font */}
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
                          padding: "0 28px 0 10px",
                          backgroundColor: "#f8fafc",
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
                        <option value="Poppins">Poppins</option>
                        <option value="Inter">Inter</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Outfit">Outfit</option>
                      </select>
                      <ChevronDown
                        style={{
                          width: "14px",
                          height: "14px",
                          color: "#94a3b8",
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          pointerEvents: "none",
                        }}
                      />
                    </div>
                  </div>

                  {/* Font Size */}
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
                            fontSize: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          height: "36px",
                          padding: "0 28px 0 10px",
                          backgroundColor: "#f8fafc",
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
                          color: "#94a3b8",
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

              {/* Section 4: Document Display Settings & Default Document Layout */}
              <div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.3fr 1fr",
                    gap: "20px",
                    alignItems: "start",
                  }}
                >
                  {/* Left: 4 Toggles */}
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

                  {/* Right: Default Document Layout (Standard, Modern, Minimal) */}
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
                                }}
                              >
                                <div
                                  style={{
                                    height: "4px",
                                    backgroundColor: isSel
                                      ? "#2563eb"
                                      : "#cbd5e1",
                                    borderRadius: "2px",
                                    width: "60%",
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
                                      width: "80%",
                                    }}
                                  />
                                </div>
                                <div
                                  style={{
                                    height: "3px",
                                    backgroundColor: isSel
                                      ? "#93c5fd"
                                      : "#e2e8f0",
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

          {/* ================= COLUMN 3: DOCUMENT PREVIEW ================= */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              padding: "20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              boxSizing: "border-box",
            }}
          >
            {/* Top Bar: Title & Template selector */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: "10px",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "800",
                  color: "#0f172a",
                }}
              >
                Document Preview
              </span>

              <div style={{ position: "relative" }}>
                <select
                  value={previewTemplate}
                  onChange={(e) => setPreviewTemplate(e.target.value)}
                  style={{
                    height: "30px",
                    padding: "0 22px 0 8px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    fontSize: "11.5px",
                    color: "#475569",
                    fontWeight: "600",
                    appearance: "none",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="Quotation Template">Quotation Template</option>
                  <option value="Proposal Template">Proposal Template</option>
                  <option value="Invoice Template">Invoice Template</option>
                </select>
                <ChevronDown
                  style={{
                    width: "12px",
                    height: "12px",
                    color: "#94a3b8",
                    position: "absolute",
                    right: "6px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>

            {/* A4 Sheet Preview */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
                padding: "28px",
                minHeight: "720px",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
                overflow: "hidden",
                fontFamily: formState.fontFamily,
              }}
            >
              {/* Main Document Body */}
              <div>
                {/* Header Row: Logo on Left, Address details on Right */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: "16px",
                  }}
                >
                  {/* Left: ACME Logo */}
                  {formState.showLogo && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
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
                          fontSize: "18px",
                          fontWeight: "900",
                          color: "#0f172a",
                          letterSpacing: "1px",
                        }}
                      >
                        ACME
                      </span>
                    </div>
                  )}

                  {/* Right: Company details */}
                  <div
                    style={{
                      textAlign: "right",
                      fontSize: "10px",
                      color: "#64748b",
                      lineHeight: "1.4",
                    }}
                  >
                    <strong
                      style={{
                        fontSize: "11px",
                        color: "#0f172a",
                        display: "block",
                      }}
                    >
                      {formState.name}
                    </strong>
                    {formState.showTagline && (
                      <span style={{ fontStyle: "italic", display: "block" }}>
                        {formState.tagline}
                      </span>
                    )}
                    <span style={{ display: "block" }}>
                      🌐 {formState.website.replace("https://", "")}
                    </span>
                    <span style={{ display: "block" }}>📞 {formState.phone}</span>
                    <span style={{ display: "block" }}>✉ {formState.email}</span>
                    {formState.showAddress && (
                      <span style={{ display: "block" }}>
                        📍 {formState.address}
                      </span>
                    )}
                  </div>
                </div>

                {/* Horizontal Divider in Brand Primary Color */}
                <div
                  style={{
                    width: "100%",
                    height: "2px",
                    backgroundColor: formState.primaryColor,
                    marginBottom: "18px",
                  }}
                />

                {/* Document Type & Meta */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: "20px",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: "20px",
                        fontWeight: "900",
                        color: "#0f172a",
                        margin: 0,
                      }}
                    >
                      Quotation
                    </h3>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "800",
                        color: "#0f172a",
                        display: "block",
                        fontFamily: "monospace",
                      }}
                    >
                      #QTN-2026-001
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        color: "#64748b",
                        display: "block",
                      }}
                    >
                      Date: 28 Oct 2026
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        color: "#64748b",
                        display: "block",
                      }}
                    >
                      Valid Till: 28 Nov 2026
                    </span>
                  </div>
                </div>

                {/* Bill To */}
                <div
                  style={{
                    fontSize: "10.5px",
                    color: "#475569",
                    marginBottom: "20px",
                    lineHeight: "1.4",
                  }}
                >
                  <strong
                    style={{
                      color: "#0f172a",
                      display: "block",
                      fontSize: "11px",
                    }}
                  >
                    Bill To:
                  </strong>
                  <strong style={{ color: "#0f172a", display: "block" }}>
                    Global Systems Ltd
                  </strong>
                  <span>B-45, IT Park, Bangalore, KA 560100</span>
                </div>

                {/* Line Items Table */}
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "10.5px",
                    textAlign: "left",
                    marginBottom: "18px",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: "#f8fafc",
                        color: "#475569",
                        fontWeight: "800",
                        borderBottom: "1px solid #cbd5e1",
                      }}
                    >
                      <th style={{ padding: "6px 8px", width: "20px" }}>#</th>
                      <th style={{ padding: "6px 8px" }}>Description</th>
                      <th style={{ padding: "6px 8px", textAlign: "center" }}>
                        Qty
                      </th>
                      <th style={{ padding: "6px 8px", textAlign: "right" }}>
                        Unit Price
                      </th>
                      <th style={{ padding: "6px 8px", textAlign: "right" }}>
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "8px" }}>1</td>
                      <td style={{ padding: "8px", fontWeight: "700" }}>
                        Website Development
                      </td>
                      <td style={{ padding: "8px", textAlign: "center" }}>1</td>
                      <td style={{ padding: "8px", textAlign: "right" }}>
                        ₹50,000
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          textAlign: "right",
                          fontWeight: "700",
                        }}
                      >
                        ₹50,000
                      </td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "8px" }}>2</td>
                      <td style={{ padding: "8px", fontWeight: "700" }}>
                        UI/UX Design
                      </td>
                      <td style={{ padding: "8px", textAlign: "center" }}>1</td>
                      <td style={{ padding: "8px", textAlign: "right" }}>
                        ₹20,000
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          textAlign: "right",
                          fontWeight: "700",
                        }}
                      >
                        ₹20,000
                      </td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "8px" }}>3</td>
                      <td style={{ padding: "8px", fontWeight: "700" }}>
                        Maintenance (1 Year)
                      </td>
                      <td style={{ padding: "8px", textAlign: "center" }}>1</td>
                      <td style={{ padding: "8px", textAlign: "right" }}>
                        ₹10,000
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          textAlign: "right",
                          fontWeight: "700",
                        }}
                      >
                        ₹10,000
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} />
                      <td
                        style={{
                          padding: "4px 8px",
                          textAlign: "right",
                          color: "#64748b",
                        }}
                      >
                        Subtotal
                      </td>
                      <td
                        style={{
                          padding: "4px 8px",
                          textAlign: "right",
                          fontWeight: "700",
                        }}
                      >
                        ₹80,000
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3} />
                      <td
                        style={{
                          padding: "4px 8px",
                          textAlign: "right",
                          color: "#64748b",
                        }}
                      >
                        GST (18%)
                      </td>
                      <td
                        style={{
                          padding: "4px 8px",
                          textAlign: "right",
                          fontWeight: "700",
                        }}
                      >
                        ₹14,400
                      </td>
                    </tr>
                    <tr style={{ backgroundColor: "#eff6ff" }}>
                      <td colSpan={3} />
                      <td
                        style={{
                          padding: "6px 8px",
                          textAlign: "right",
                          fontWeight: "900",
                          color: "#1e3a8a",
                        }}
                      >
                        Total
                      </td>
                      <td
                        style={{
                          padding: "6px 8px",
                          textAlign: "right",
                          fontWeight: "900",
                          color: "#1e3a8a",
                          fontSize: "11.5px",
                        }}
                      >
                        ₹94,400
                      </td>
                    </tr>
                  </tfoot>
                </table>

                {/* Terms */}
                <div
                  style={{
                    fontSize: "9.5px",
                    color: "#475569",
                    lineHeight: "1.5",
                  }}
                >
                  <strong
                    style={{
                      color: "#0f172a",
                      display: "block",
                      marginBottom: "2px",
                    }}
                  >
                    Terms &amp; Conditions:
                  </strong>
                  <span>1. Payment: 50% advance, 50% on delivery.</span>
                  <br />
                  <span>2. Validity: This quotation is valid for 30 days.</span>
                  <br />
                  <span>3. Support: 1 year free support.</span>
                </div>

                <p
                  style={{
                    fontSize: "10px",
                    fontStyle: "italic",
                    color: "#64748b",
                    marginTop: "10px",
                  }}
                >
                  Thank you for your business!
                </p>
              </div>

              {/* Bottom Decorative Wave/Angular Ribbon in Brand Colors */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "36px",
                  background: `linear-gradient(90deg, ${formState.primaryColor} 0%, ${formState.secondaryColor} 100%)`,
                  clipPath: "polygon(0 40%, 100% 0%, 100% 100%, 0% 100%)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
