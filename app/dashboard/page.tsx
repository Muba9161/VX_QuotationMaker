"use client";

import React, { useState } from "react";
import Link from "next/link";
import OrgLayout from "@/components/OrgLayout";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  MoreVertical,
  X,
  Edit,
  Eye,
  Download,
  Share2,
  Send,
  Trash2,
} from "lucide-react";
import { getOrgDocuments, deleteOrgDocument } from "@/lib/orgStorage";

interface RecentDoc {
  id: string;
  docNumber: string;
  title: string;
  type: "Quotation" | "MOU";
  recipient: string;
  status: "Sent" | "Signed" | "Draft" | "Pending";
  lastUpdated: string;
}

const RECENT_DOCUMENTS: RecentDoc[] = [
  {
    id: "doc-1",
    docNumber: "Q-001",
    title: "Website Development",
    type: "Quotation",
    recipient: "Tech Solutions Pvt Ltd",
    status: "Sent",
    lastUpdated: "28 Oct 2026",
  },
  {
    id: "doc-2",
    docNumber: "MOU-001",
    title: "Partnership Agreement",
    type: "MOU",
    recipient: "Global Systems",
    status: "Signed",
    lastUpdated: "26 Oct 2026",
  },
  {
    id: "doc-3",
    docNumber: "Q-002",
    title: "IT Support Services",
    type: "Quotation",
    recipient: "NextGen Digital",
    status: "Draft",
    lastUpdated: "25 Oct 2026",
  },
  {
    id: "doc-4",
    docNumber: "MOU-002",
    title: "Strategic Collaboration",
    type: "MOU",
    recipient: "Innovate India",
    status: "Pending",
    lastUpdated: "24 Oct 2026",
  },
];

export default function OrgDashboardPage() {
  const [documents, setDocuments] = useState<RecentDoc[]>(RECENT_DOCUMENTS);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<"Quotation" | "MOU">("Quotation");
  const [newRecipient, setNewRecipient] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDownloadPDF = (doc: RecentDoc) => {
    setActiveMenuId(null);
    showToast(`Downloading PDF for ${doc.docNumber}...`);
    if (typeof window !== "undefined") {
      const w = window.open(`/preview/${doc.id}?autoPrint=true`, "_blank");
      if (w) w.focus();
    }
  };

  const handleDelete = (doc: RecentDoc) => {
    setActiveMenuId(null);
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    deleteOrgDocument(doc.id);
    showToast(`Deleted ${doc.docNumber}`);
  };

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    const newDoc: RecentDoc = {
      id: `doc-${Date.now()}`,
      docNumber: newType === "Quotation" ? `Q-00${documents.length + 1}` : `MOU-00${documents.length + 1}`,
      title: newTitle || "New Service Proposal",
      type: newType,
      recipient: newRecipient || "Client Corp",
      status: "Draft",
      lastUpdated: "Just now",
    };
    setDocuments([newDoc, ...documents]);
    setIsCreateOpen(false);
    setNewTitle("");
    setNewRecipient("");
    showToast(`Created document #${newDoc.docNumber} successfully!`);
  };

  const getStatusBadgeStyle = (status: RecentDoc["status"]) => {
    switch (status) {
      case "Sent":
        return {
          backgroundColor: "#eff6ff",
          color: "#2563eb",
        };
      case "Signed":
        return {
          backgroundColor: "#dcfce7",
          color: "#16a34a",
        };
      case "Draft":
        return {
          backgroundColor: "#f1f5f9",
          color: "#475569",
        };
      case "Pending":
        return {
          backgroundColor: "#fef3c7",
          color: "#d97706",
        };
    }
  };

  return (
    <OrgLayout activePath="/dashboard">
      {/* Toast */}
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
          maxWidth: "1120px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          boxSizing: "border-box",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        }}
      >
        {/* ================= WELCOME HEADER ================= */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
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
              Good Morning, Priya! 👋
            </h1>
            <p
              style={{
                fontSize: "13px",
                fontWeight: 400,
                color: "#64748b",
                margin: "4px 0 0 0",
              }}
            >
              Here&apos;s an overview of your documents.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(37,99,235,0.25)",
              transition: "background-color 0.15s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#1d4ed8")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#2563eb")
            }
          >
            <Plus style={{ width: "16px", height: "16px" }} />
            <span>Create Document</span>
          </button>
        </div>

        {/* ================= 4 STAT CARDS IN A ROW ================= */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "18px",
          }}
        >
          {/* Card 1: Total Documents */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #eef2f6",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: "#eff6ff",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <FileText style={{ width: "22px", height: "22px" }} />
            </div>
            <div>
              <span
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: 1,
                  display: "block",
                }}
              >
                12
              </span>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#64748b",
                  marginTop: "4px",
                  display: "block",
                }}
              >
                Total Documents
              </span>
            </div>
          </div>

          {/* Card 2: Pending for Signature */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #eef2f6",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: "#fef3c7",
                color: "#d97706",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Clock style={{ width: "22px", height: "22px" }} />
            </div>
            <div>
              <span
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: 1,
                  display: "block",
                }}
              >
                5
              </span>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#64748b",
                  marginTop: "4px",
                  display: "block",
                }}
              >
                Pending for Signature
              </span>
            </div>
          </div>

          {/* Card 3: Signed */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #eef2f6",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: "#dcfce7",
                color: "#16a34a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <CheckCircle2 style={{ width: "22px", height: "22px" }} />
            </div>
            <div>
              <span
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: 1,
                  display: "block",
                }}
              >
                6
              </span>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#64748b",
                  marginTop: "4px",
                  display: "block",
                }}
              >
                Signed
              </span>
            </div>
          </div>

          {/* Card 4: Expired */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #eef2f6",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: "#fee2e2",
                color: "#dc2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <AlertCircle style={{ width: "22px", height: "22px" }} />
            </div>
            <div>
              <span
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: 1,
                  display: "block",
                }}
              >
                1
              </span>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#64748b",
                  marginTop: "4px",
                  display: "block",
                }}
              >
                Expired
              </span>
            </div>
          </div>
        </div>

        {/* ================= RECENT DOCUMENTS TABLE ================= */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            border: "1px solid #eef2f6",
            boxShadow: "0 4px 24px -2px rgba(15, 23, 42, 0.05)",
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          {/* Card Header */}
          <div
            style={{
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <h2
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#0f172a",
                margin: 0,
              }}
            >
              Recent Documents
            </h2>
            <Link
              href="/my-documents"
              style={{
                fontSize: "12.5px",
                fontWeight: 600,
                color: "#2563eb",
                textDecoration: "none",
              }}
            >
              View All
            </Link>
          </div>

          {/* Table */}
          <div style={{ width: "100%", overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#f8fafc",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <th
                    style={{
                      padding: "12px 20px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#64748b",
                      width: "80px",
                    }}
                  >
                    #
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#64748b",
                    }}
                  >
                    Document Title
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#64748b",
                    }}
                  >
                    Type
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#64748b",
                    }}
                  >
                    Recipient
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#64748b",
                    }}
                  >
                    Status
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#64748b",
                    }}
                  >
                    Last Updated
                  </th>
                  <th
                    style={{
                      padding: "12px 20px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#64748b",
                      textAlign: "right",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => {
                  const isMenuOpen = activeMenuId === doc.id;
                  const badgeStyle = getStatusBadgeStyle(doc.status);

                  return (
                    <tr
                      key={doc.id}
                      style={{
                        borderBottom: "1px solid #f8fafc",
                        transition: "background-color 0.15s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#fafafa")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      {/* Doc Number */}
                      <td
                        style={{
                          padding: "15px 20px",
                          fontSize: "12.5px",
                          fontWeight: 500,
                          color: "#64748b",
                        }}
                      >
                        {doc.docNumber}
                      </td>

                      {/* Title */}
                      <td
                        style={{
                          padding: "15px 16px",
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#0f172a",
                        }}
                      >
                        {doc.title}
                      </td>

                      {/* Type */}
                      <td
                        style={{
                          padding: "15px 16px",
                          fontSize: "12.5px",
                          color: "#475569",
                        }}
                      >
                        {doc.type}
                      </td>

                      {/* Recipient */}
                      <td
                        style={{
                          padding: "15px 16px",
                          fontSize: "12.5px",
                          color: "#334155",
                        }}
                      >
                        {doc.recipient}
                      </td>

                      {/* Status Badge */}
                      <td style={{ padding: "15px 16px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "3px 12px",
                            borderRadius: "9999px",
                            fontSize: "11px",
                            fontWeight: 600,
                            letterSpacing: "0.1px",
                            ...badgeStyle,
                          }}
                        >
                          {doc.status}
                        </span>
                      </td>

                      {/* Last Updated */}
                      <td
                        style={{
                          padding: "15px 16px",
                          fontSize: "12.5px",
                          color: "#64748b",
                        }}
                      >
                        {doc.lastUpdated}
                      </td>

                      {/* Actions */}
                      <td
                        style={{
                          padding: "15px 20px",
                          textAlign: "right",
                          position: "relative",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMenuId(isMenuOpen ? null : doc.id)
                          }
                          style={{
                            backgroundColor: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: "4px",
                            borderRadius: "4px",
                            color: "#64748b",
                          }}
                        >
                          <MoreVertical
                            style={{ width: "15px", height: "15px" }}
                          />
                        </button>

                        {/* Action Popover Menu */}
                        {isMenuOpen && (
                          <div
                            data-doc-menu="true"
                            style={{
                              position: "absolute",
                              right: "20px",
                              top: "40px",
                              backgroundColor: "#ffffff",
                              borderRadius: "12px",
                              boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                              border: "1px solid #e2e8f0",
                              width: "175px",
                              zIndex: 60,
                              padding: "6px",
                              display: "flex",
                              flexDirection: "column",
                              gap: "2px",
                              textAlign: "left",
                            }}
                          >
                            <Link
                              href={`/preview/${doc.id}`}
                              onClick={() => setActiveMenuId(null)}
                              style={{
                                padding: "8px 12px",
                                fontSize: "12.5px",
                                fontWeight: 500,
                                color: "#0f172a",
                                textDecoration: "none",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                transition: "background-color 0.15s ease",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor = "#f8fafc")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor = "transparent")
                              }
                            >
                              <Eye style={{ width: "14px", height: "14px", color: "#475569" }} />
                              <span>View Document</span>
                            </Link>

                            <Link
                              href={`/documents/${doc.id}/send`}
                              onClick={() => setActiveMenuId(null)}
                              style={{
                                padding: "8px 12px",
                                fontSize: "12.5px",
                                fontWeight: 500,
                                color: "#2563eb",
                                textDecoration: "none",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                transition: "background-color 0.15s ease",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor = "#eff6ff")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor = "transparent")
                              }
                            >
                              <Send style={{ width: "14px", height: "14px", color: "#2563eb" }} />
                              <span>Send for Signature</span>
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleDownloadPDF(doc)}
                              style={{
                                padding: "8px 12px",
                                fontSize: "12.5px",
                                fontWeight: 500,
                                color: "#0f172a",
                                border: "none",
                                backgroundColor: "transparent",
                                borderRadius: "8px",
                                textAlign: "left",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                width: "100%",
                                transition: "background-color 0.15s ease",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor = "#f8fafc")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor = "transparent")
                              }
                            >
                              <Download style={{ width: "14px", height: "14px", color: "#475569" }} />
                              <span>Download PDF</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(doc)}
                              style={{
                                padding: "8px 12px",
                                fontSize: "12.5px",
                                fontWeight: 500,
                                color: "#ef4444",
                                border: "none",
                                backgroundColor: "transparent",
                                borderRadius: "8px",
                                textAlign: "left",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                width: "100%",
                                transition: "background-color 0.15s ease",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor = "#fee2e2")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor = "transparent")
                              }
                            >
                              <Trash2 style={{ width: "14px", height: "14px", color: "#ef4444" }} />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================= CREATE DOCUMENT MODAL ================= */}
      {isCreateOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "18px",
              width: "100%",
              maxWidth: "460px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              padding: "24px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <h3
                style={{
                  fontSize: "17px",
                  fontWeight: 800,
                  color: "#0f172a",
                  margin: 0,
                }}
              >
                Create New Document
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                }}
              >
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>

            <form
              onSubmit={handleCreateDocument}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
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
                  Document Type
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  style={{
                    width: "100%",
                    height: "38px",
                    padding: "0 10px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                >
                  <option value="Quotation">Quotation</option>
                  <option value="MOU">MOU</option>
                </select>
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
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Website Development"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{
                    width: "100%",
                    height: "38px",
                    padding: "0 10px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "13px",
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
                  Recipient Organization
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tech Solutions Pvt Ltd"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  style={{
                    width: "100%",
                    height: "38px",
                    padding: "0 10px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "13px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "8px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  style={{
                    flex: 1,
                    height: "38px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#ffffff",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#475569",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    height: "38px",
                    border: "none",
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Create Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </OrgLayout>
  );
}
