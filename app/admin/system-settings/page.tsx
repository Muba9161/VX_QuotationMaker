"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  Settings,
  Mail,
  Shield,
  HardDrive,
  FileText,
  Key,
  CheckCircle2,
} from "lucide-react";
import {
  getSystemSettings,
  saveSystemSettings,
  SystemSettings,
} from "@/lib/adminStorage";

type SettingsTab =
  | "General"
  | "Email Settings"
  | "Security"
  | "Storage"
  | "Audit Logs"
  | "API Keys";

export default function AdminSystemSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("General");
  const [settings, setSettings] = useState<SystemSettings>({
    platformName: "VorldX",
    supportEmail: "support@vorldx.com",
    maxUploadSizeMB: 10,
    allowOrgRegistration: true,
    emailNotifications: true,
    maintenanceMode: false,
  });

  // Additional secondary settings for comprehensive enterprise support
  const [emailConfig, setEmailConfig] = useState({
    smtpHost: "smtp.sendgrid.net",
    smtpPort: 587,
    senderEmail: "notifications@vorldx.com",
    senderName: "VorldX Platform",
    enableSSL: true,
  });

  const [securityConfig, setSecurityConfig] = useState({
    sessionTimeoutMin: 60,
    enable2FA: true,
    enforceStrongPasswords: true,
    maxLoginAttempts: 5,
  });

  const [storageConfig, setStorageConfig] = useState({
    storageProvider: "Local Disk",
    tenantQuotaGB: 10,
    retentionDays: 30,
    compressAssets: true,
  });

  const [auditConfig, setAuditConfig] = useState({
    logRetentionDays: 90,
    logAdminActions: true,
    logTenantLogins: true,
    autoExportLogs: false,
  });

  const [apiConfig, setApiConfig] = useState({
    apiKey: "vx_live_99a8b7c6d5e4f3a2b10",
    webhookUrl: "https://api.vorldx.com/webhooks/events",
    enableExternalIntegrations: true,
    rateLimitReqMin: 1000,
  });

  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    const loaded = getSystemSettings();
    if (loaded) {
      setSettings(loaded);
    }
  }, []);

  const handleSave = () => {
    saveSystemSettings(settings);
    setSavedMessage("Settings saved successfully!");
    setTimeout(() => {
      setSavedMessage(null);
    }, 3000);
  };

  const navItems = [
    { label: "General" as SettingsTab, icon: Settings },
    { label: "Email Settings" as SettingsTab, icon: Mail },
    { label: "Security" as SettingsTab, icon: Shield },
    { label: "Storage" as SettingsTab, icon: HardDrive },
    { label: "Audit Logs" as SettingsTab, icon: FileText },
    { label: "API Keys" as SettingsTab, icon: Key },
  ];

  return (
    <AdminLayout activePath="/admin/system-settings">
      <div
        style={{
          width: "100%",
          maxWidth: "1120px",
          margin: "0 auto",
          padding: "24px 20px 48px 20px",
          boxSizing: "border-box",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        }}
      >
        {/* Top Header Card */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            border: "1px solid #eef2f6",
            boxShadow: "0 4px 24px -2px rgba(15, 23, 42, 0.05)",
            padding: "28px 32px",
            boxSizing: "border-box",
          }}
        >
          {/* Header Row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "28px",
              paddingBottom: "20px",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#0f172a",
                  margin: 0,
                  letterSpacing: "-0.3px",
                }}
              >
                System Settings
              </h1>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: 400,
                  color: "#64748b",
                  margin: "4px 0 0 0",
                }}
              >
                Configure platform-wide settings
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {savedMessage && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    backgroundColor: "#dcfce7",
                    color: "#16a34a",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  <CheckCircle2 style={{ width: "14px", height: "14px" }} />
                  {savedMessage}
                </div>
              )}
              <button
                type="button"
                onClick={handleSave}
                style={{
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 22px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)",
                  transition: "background-color 0.15s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#1d4ed8")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#2563eb")
                }
              >
                Save Changes
              </button>
            </div>
          </div>

          {/* 2-Column Settings Layout */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "36px",
              boxSizing: "border-box",
            }}
          >
            {/* Left Column: Settings Navigation Tabs */}
            <div
              style={{
                width: "210px",
                minWidth: "210px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.label;

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setActiveTab(item.label)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      fontSize: "13px",
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? "#2563eb" : "#475569",
                      backgroundColor: isActive ? "#eff6ff" : "transparent",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "#f8fafc";
                        e.currentTarget.style.color = "#0f172a";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#475569";
                      }
                    }}
                  >
                    <IconComponent
                      style={{
                        width: "17px",
                        height: "17px",
                        color: isActive ? "#2563eb" : "#64748b",
                        flexShrink: 0,
                      }}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Vertical Divider */}
            <div
              style={{
                width: "1px",
                backgroundColor: "#f1f5f9",
                alignSelf: "stretch",
              }}
            />

            {/* Right Column: Settings Content Panels */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
              }}
            >
              {/* TAB 1: GENERAL SETTINGS (Exact replica of Reference Image) */}
              {activeTab === "General" && (
                <div>
                  <h2
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#0f172a",
                      margin: "0 0 20px 0",
                    }}
                  >
                    General Settings
                  </h2>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "18px",
                      maxWidth: "600px",
                    }}
                  >
                    {/* Platform Name */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "#334155",
                          flex: 1,
                        }}
                      >
                        Platform Name
                      </label>
                      <input
                        type="text"
                        value={settings.platformName}
                        onChange={(e) =>
                          setSettings({ ...settings, platformName: e.target.value })
                        }
                        style={{
                          width: "300px",
                          padding: "8px 14px",
                          backgroundColor: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          fontSize: "13px",
                          color: "#0f172a",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    {/* Support Email */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "#334155",
                          flex: 1,
                        }}
                      >
                        Support Email
                      </label>
                      <input
                        type="email"
                        value={settings.supportEmail}
                        onChange={(e) =>
                          setSettings({ ...settings, supportEmail: e.target.value })
                        }
                        style={{
                          width: "300px",
                          padding: "8px 14px",
                          backgroundColor: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          fontSize: "13px",
                          color: "#0f172a",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    {/* Max File Upload Size (MB) */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "#334155",
                          flex: 1,
                        }}
                      >
                        Max File Upload Size (MB)
                      </label>
                      <input
                        type="number"
                        value={settings.maxUploadSizeMB}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            maxUploadSizeMB: Number(e.target.value) || 0,
                          })
                        }
                        style={{
                          width: "300px",
                          padding: "8px 14px",
                          backgroundColor: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          fontSize: "13px",
                          color: "#0f172a",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    {/* Allow Organization Registration Toggle */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                        paddingTop: "6px",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "#334155",
                          flex: 1,
                        }}
                      >
                        Allow Organization Registration
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setSettings({
                            ...settings,
                            allowOrgRegistration: !settings.allowOrgRegistration,
                          })
                        }
                        style={{
                          width: "44px",
                          height: "24px",
                          backgroundColor: settings.allowOrgRegistration
                            ? "#2563eb"
                            : "#cbd5e1",
                          borderRadius: "9999px",
                          border: "none",
                          padding: "3px",
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                          transition: "background-color 0.2s ease",
                          boxSizing: "border-box",
                        }}
                      >
                        <span
                          style={{
                            width: "18px",
                            height: "18px",
                            backgroundColor: "#ffffff",
                            borderRadius: "9999px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
                            transform: settings.allowOrgRegistration
                              ? "translateX(20px)"
                              : "translateX(0px)",
                            transition: "transform 0.2s ease",
                          }}
                        />
                      </button>
                    </div>

                    {/* Email Notifications Toggle */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                        paddingTop: "6px",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "#334155",
                          flex: 1,
                        }}
                      >
                        Email Notifications
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setSettings({
                            ...settings,
                            emailNotifications: !settings.emailNotifications,
                          })
                        }
                        style={{
                          width: "44px",
                          height: "24px",
                          backgroundColor: settings.emailNotifications
                            ? "#2563eb"
                            : "#cbd5e1",
                          borderRadius: "9999px",
                          border: "none",
                          padding: "3px",
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                          transition: "background-color 0.2s ease",
                          boxSizing: "border-box",
                        }}
                      >
                        <span
                          style={{
                            width: "18px",
                            height: "18px",
                            backgroundColor: "#ffffff",
                            borderRadius: "9999px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
                            transform: settings.emailNotifications
                              ? "translateX(20px)"
                              : "translateX(0px)",
                            transition: "transform 0.2s ease",
                          }}
                        />
                      </button>
                    </div>

                    {/* Maintenance Mode Toggle */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                        paddingTop: "6px",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "#334155",
                          flex: 1,
                        }}
                      >
                        Maintenance Mode
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setSettings({
                            ...settings,
                            maintenanceMode: !settings.maintenanceMode,
                          })
                        }
                        style={{
                          width: "44px",
                          height: "24px",
                          backgroundColor: settings.maintenanceMode
                            ? "#2563eb"
                            : "#cbd5e1",
                          borderRadius: "9999px",
                          border: "none",
                          padding: "3px",
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                          transition: "background-color 0.2s ease",
                          boxSizing: "border-box",
                        }}
                      >
                        <span
                          style={{
                            width: "18px",
                            height: "18px",
                            backgroundColor: "#ffffff",
                            borderRadius: "9999px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
                            transform: settings.maintenanceMode
                              ? "translateX(20px)"
                              : "translateX(0px)",
                            transition: "transform 0.2s ease",
                          }}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: EMAIL SETTINGS */}
              {activeTab === "Email Settings" && (
                <div>
                  <h2
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#0f172a",
                      margin: "0 0 20px 0",
                    }}
                  >
                    Email Settings
                  </h2>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "18px",
                      maxWidth: "600px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "#334155",
                          flex: 1,
                        }}
                      >
                        SMTP Host
                      </label>
                      <input
                        type="text"
                        value={emailConfig.smtpHost}
                        onChange={(e) =>
                          setEmailConfig({ ...emailConfig, smtpHost: e.target.value })
                        }
                        style={{
                          width: "300px",
                          padding: "8px 14px",
                          backgroundColor: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          fontSize: "13px",
                          color: "#0f172a",
                          outline: "none",
                        }}
                      />
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "#334155",
                          flex: 1,
                        }}
                      >
                        SMTP Port
                      </label>
                      <input
                        type="number"
                        value={emailConfig.smtpPort}
                        onChange={(e) =>
                          setEmailConfig({
                            ...emailConfig,
                            smtpPort: Number(e.target.value) || 587,
                          })
                        }
                        style={{
                          width: "300px",
                          padding: "8px 14px",
                          backgroundColor: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          fontSize: "13px",
                          color: "#0f172a",
                          outline: "none",
                        }}
                      />
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "#334155",
                          flex: 1,
                        }}
                      >
                        Sender Email
                      </label>
                      <input
                        type="email"
                        value={emailConfig.senderEmail}
                        onChange={(e) =>
                          setEmailConfig({
                            ...emailConfig,
                            senderEmail: e.target.value,
                          })
                        }
                        style={{
                          width: "300px",
                          padding: "8px 14px",
                          backgroundColor: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          fontSize: "13px",
                          color: "#0f172a",
                          outline: "none",
                        }}
                      />
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "#334155",
                          flex: 1,
                        }}
                      >
                        Sender Display Name
                      </label>
                      <input
                        type="text"
                        value={emailConfig.senderName}
                        onChange={(e) =>
                          setEmailConfig({
                            ...emailConfig,
                            senderName: e.target.value,
                          })
                        }
                        style={{
                          width: "300px",
                          padding: "8px 14px",
                          backgroundColor: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          fontSize: "13px",
                          color: "#0f172a",
                          outline: "none",
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SECURITY */}
              {activeTab === "Security" && (
                <div>
                  <h2
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#0f172a",
                      margin: "0 0 20px 0",
                    }}
                  >
                    Security Settings
                  </h2>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "18px",
                      maxWidth: "600px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "#334155",
                          flex: 1,
                        }}
                      >
                        Session Timeout (Minutes)
                      </label>
                      <input
                        type="number"
                        value={securityConfig.sessionTimeoutMin}
                        onChange={(e) =>
                          setSecurityConfig({
                            ...securityConfig,
                            sessionTimeoutMin: Number(e.target.value) || 60,
                          })
                        }
                        style={{
                          width: "300px",
                          padding: "8px 14px",
                          backgroundColor: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          fontSize: "13px",
                          color: "#0f172a",
                          outline: "none",
                        }}
                      />
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "#334155",
                          flex: 1,
                        }}
                      >
                        Require Two-Factor Auth (2FA) for Admins
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setSecurityConfig({
                            ...securityConfig,
                            enable2FA: !securityConfig.enable2FA,
                          })
                        }
                        style={{
                          width: "44px",
                          height: "24px",
                          backgroundColor: securityConfig.enable2FA
                            ? "#2563eb"
                            : "#cbd5e1",
                          borderRadius: "9999px",
                          border: "none",
                          padding: "3px",
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                        }}
                      >
                        <span
                          style={{
                            width: "18px",
                            height: "18px",
                            backgroundColor: "#ffffff",
                            borderRadius: "9999px",
                            transform: securityConfig.enable2FA
                              ? "translateX(20px)"
                              : "translateX(0px)",
                            transition: "transform 0.2s ease",
                          }}
                        />
                      </button>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "#334155",
                          flex: 1,
                        }}
                      >
                        Enforce Strong Passwords
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setSecurityConfig({
                            ...securityConfig,
                            enforceStrongPasswords:
                              !securityConfig.enforceStrongPasswords,
                          })
                        }
                        style={{
                          width: "44px",
                          height: "24px",
                          backgroundColor: securityConfig.enforceStrongPasswords
                            ? "#2563eb"
                            : "#cbd5e1",
                          borderRadius: "9999px",
                          border: "none",
                          padding: "3px",
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                        }}
                      >
                        <span
                          style={{
                            width: "18px",
                            height: "18px",
                            backgroundColor: "#ffffff",
                            borderRadius: "9999px",
                            transform: securityConfig.enforceStrongPasswords
                              ? "translateX(20px)"
                              : "translateX(0px)",
                            transition: "transform 0.2s ease",
                          }}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: STORAGE */}
              {activeTab === "Storage" && (
                <div>
                  <h2
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#0f172a",
                      margin: "0 0 20px 0",
                    }}
                  >
                    Storage Settings
                  </h2>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "18px",
                      maxWidth: "600px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "#334155",
                          flex: 1,
                        }}
                      >
                        Primary Storage Provider
                      </label>
                      <select
                        value={storageConfig.storageProvider}
                        onChange={(e) =>
                          setStorageConfig({
                            ...storageConfig,
                            storageProvider: e.target.value,
                          })
                        }
                        style={{
                          width: "300px",
                          padding: "8px 14px",
                          backgroundColor: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          fontSize: "13px",
                          color: "#0f172a",
                          outline: "none",
                        }}
                      >
                        <option value="Local Disk">Local Disk (Server Volume)</option>
                        <option value="AWS S3">AWS S3 Compatible</option>
                        <option value="Cloudflare R2">Cloudflare R2</option>
                      </select>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "#334155",
                          flex: 1,
                        }}
                      >
                        Default Storage Quota per Org (GB)
                      </label>
                      <input
                        type="number"
                        value={storageConfig.tenantQuotaGB}
                        onChange={(e) =>
                          setStorageConfig({
                            ...storageConfig,
                            tenantQuotaGB: Number(e.target.value) || 10,
                          })
                        }
                        style={{
                          width: "300px",
                          padding: "8px 14px",
                          backgroundColor: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          fontSize: "13px",
                          color: "#0f172a",
                          outline: "none",
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: AUDIT LOGS */}
              {activeTab === "Audit Logs" && (
                <div>
                  <h2
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#0f172a",
                      margin: "0 0 20px 0",
                    }}
                  >
                    Audit Logs Settings
                  </h2>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "18px",
                      maxWidth: "600px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "#334155",
                          flex: 1,
                        }}
                      >
                        Retention Period (Days)
                      </label>
                      <input
                        type="number"
                        value={auditConfig.logRetentionDays}
                        onChange={(e) =>
                          setAuditConfig({
                            ...auditConfig,
                            logRetentionDays: Number(e.target.value) || 90,
                          })
                        }
                        style={{
                          width: "300px",
                          padding: "8px 14px",
                          backgroundColor: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          fontSize: "13px",
                          color: "#0f172a",
                          outline: "none",
                        }}
                      />
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "#334155",
                          flex: 1,
                        }}
                      >
                        Log Platform Admin Actions
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setAuditConfig({
                            ...auditConfig,
                            logAdminActions: !auditConfig.logAdminActions,
                          })
                        }
                        style={{
                          width: "44px",
                          height: "24px",
                          backgroundColor: auditConfig.logAdminActions
                            ? "#2563eb"
                            : "#cbd5e1",
                          borderRadius: "9999px",
                          border: "none",
                          padding: "3px",
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                        }}
                      >
                        <span
                          style={{
                            width: "18px",
                            height: "18px",
                            backgroundColor: "#ffffff",
                            borderRadius: "9999px",
                            transform: auditConfig.logAdminActions
                              ? "translateX(20px)"
                              : "translateX(0px)",
                            transition: "transform 0.2s ease",
                          }}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: API KEYS */}
              {activeTab === "API Keys" && (
                <div>
                  <h2
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#0f172a",
                      margin: "0 0 20px 0",
                    }}
                  >
                    API & Webhook Settings
                  </h2>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "18px",
                      maxWidth: "600px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "#334155",
                          flex: 1,
                        }}
                      >
                        Master API Key
                      </label>
                      <input
                        type="password"
                        readOnly
                        value={apiConfig.apiKey}
                        style={{
                          width: "300px",
                          padding: "8px 14px",
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          fontSize: "13px",
                          color: "#0f172a",
                          outline: "none",
                          letterSpacing: "1px",
                        }}
                      />
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "#334155",
                          flex: 1,
                        }}
                      >
                        Webhook Event URL
                      </label>
                      <input
                        type="text"
                        value={apiConfig.webhookUrl}
                        onChange={(e) =>
                          setApiConfig({
                            ...apiConfig,
                            webhookUrl: e.target.value,
                          })
                        }
                        style={{
                          width: "300px",
                          padding: "8px 14px",
                          backgroundColor: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          fontSize: "13px",
                          color: "#0f172a",
                          outline: "none",
                        }}
                      />
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "#334155",
                          flex: 1,
                        }}
                      >
                        Rate Limit (Requests / Min)
                      </label>
                      <input
                        type="number"
                        value={apiConfig.rateLimitReqMin}
                        onChange={(e) =>
                          setApiConfig({
                            ...apiConfig,
                            rateLimitReqMin: Number(e.target.value) || 1000,
                          })
                        }
                        style={{
                          width: "300px",
                          padding: "8px 14px",
                          backgroundColor: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          fontSize: "13px",
                          color: "#0f172a",
                          outline: "none",
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
