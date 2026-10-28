"use client";

import React, { useState } from "react";
import Link from "next/link";
import OrgLayout from "@/components/OrgLayout";
import {
  Search,
  SlidersHorizontal,
  MoreVertical,
  Eye,
  Send,
  Download,
  Trash2,
  CheckCircle2,
} from "lucide-react";

interface DocItem {
  id: string;
  docNumber: string;
  title: string;
  type: "Quotation" | "MOU";
  recipient: string;
  status: "Sent" | "Signed" | "Draft" | "Pending";
  date: string;
}

const INITIAL_DOCUMENTS: DocItem[] = [
  {
    id: "q-001",
    docNumber: "Q-001",
    title: "Website Development",
    type: "Quotation",
    recipient: "Tech Solutions",
    status: "Sent",
    date: "28 Oct 2026",
  },
  {
    id: "mou-001",
    docNumber: "MOU-001",
    title: "Partnership MOU",
    type: "MOU",
    recipient: "Global Systems",
    status: "Signed",
    date: "26 Oct 2026",
  },
  {
    id: "q-002",
    docNumber: "Q-002",
    title: "IT Support",
    type: "Quotation",
    recipient: "NextGen Digital",
    status: "Draft",
    date: "25 Oct 2026",
  },
  {
    id: "mou-002",
    docNumber: "MOU-002",
    title: "Strategic MOU",
    type: "MOU",
    recipient: "Innovate India",
    status: "Pending",
    date: "24 Oct 2026",
  },
  {
    id: "q-003",
    docNumber: "Q-003",
    title: "Mobile App",
    type: "Quotation",
    recipient: "Bright Future",
    status: "Signed",
    date: "22 Oct 2026",
  },
];

export default function MyDocumentsPage() {
  const [documents, setDocuments] = useState<DocItem[]>(INITIAL_DOCUMENTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const tabs = ["All", "Quotations", "MOUs", "Drafts", "Sent", "Signed", "Expired"];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.docNumber.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "All") return true;
    if (activeTab === "Quotations") return doc.type === "Quotation";
    if (activeTab === "MOUs") return doc.type === "MOU";
    if (activeTab === "Drafts") return doc.status === "Draft";
    if (activeTab === "Sent") return doc.status === "Sent";
    if (activeTab === "Signed") return doc.status === "Signed";
    if (activeTab === "Expired") return false;
    return true;
  });

  const getStatusBadgeStyle = (status: DocItem["status"]) => {
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
          color: "#64748b",
        };
      case "Pending":
        return {
          backgroundColor: "#fef3c7",
          color: "#d97706",
        };
    }
  };

  return (
    <OrgLayout activePath="/my-documents">
      {/* Toast Notification */}
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
            fontWeight: 600,
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
          maxWidth: "1080px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          boxSizing: "border-box",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        }}
      >
        {/* ================= HEADER ================= */}
        <div>
          <h1
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#0f172a",
              margin: 0,
              letterSpacing: "-0.3px",
            }}
          >
            My Documents
          </h1>
        </div>

        {/* ================= SEARCH BAR WITH FILTER BUTTON ================= */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              flex: 1,
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Search
              style={{
                width: "16px",
                height: "16px",
                color: "#94a3b8",
                position: "absolute",
                left: "14px",
              }}
            />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                height: "40px",
                padding: "0 14px 0 40px",
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                fontSize: "13px",
                color: "#1e293b",
                outline: "none",
                boxSizing: "border-box",
                boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
              }}
            />
          </div>

          <button
            type="button"
            title="Filter options"
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#64748b",
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
              flexShrink: 0,
            }}
          >
            <SlidersHorizontal style={{ width: "16px", height: "16px" }} />
          </button>
        </div>

        {/* ================= TABS ROW ================= */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            borderBottom: "1px solid #e2e8f0",
            paddingBottom: "8px",
            overflowX: "auto",
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "5px 14px",
                  borderRadius: "6px",
                  fontSize: "12.5px",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "#2563eb" : "#64748b",
                  backgroundColor: isActive ? "#eff6ff" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* ================= DOCUMENTS TABLE ================= */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #eef2f6",
            boxShadow: "0 1px 3px rgba(15, 23, 42, 0.02)",
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          <div style={{ overflowX: "auto" }}>
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
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <th
                    style={{
                      padding: "12px 18px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748b",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      width: "90px",
                    }}
                  >
                    #
                  </th>
                  <th
                    style={{
                      padding: "12px 18px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748b",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    Title
                  </th>
                  <th
                    style={{
                      padding: "12px 18px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748b",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    Type
                  </th>
                  <th
                    style={{
                      padding: "12px 18px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748b",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    Recipient
                  </th>
                  <th
                    style={{
                      padding: "12px 18px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748b",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    Status
                  </th>
                  <th
                    style={{
                      padding: "12px 18px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748b",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    Date
                  </th>
                  <th
                    style={{
                      padding: "12px 18px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748b",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      textAlign: "right",
                      width: "60px",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map((doc) => {
                  const badgeStyle = getStatusBadgeStyle(doc.status);

                  return (
                    <tr
                      key={doc.id}
                      style={{
                        borderBottom: "1px solid #f8fafc",
                        transition: "background-color 0.15s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#f8fafc")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      {/* # */}
                      <td
                        style={{
                          padding: "14px 18px",
                          fontSize: "12.5px",
                          color: "#64748b",
                          fontFamily: "monospace",
                        }}
                      >
                        {doc.docNumber}
                      </td>

                      {/* Title */}
                      <td
                        style={{
                          padding: "14px 18px",
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "#0f172a",
                        }}
                      >
                        {doc.title}
                      </td>

                      {/* Type */}
                      <td
                        style={{
                          padding: "14px 18px",
                          fontSize: "12.5px",
                          color: "#475569",
                        }}
                      >
                        {doc.type}
                      </td>

                      {/* Recipient */}
                      <td
                        style={{
                          padding: "14px 18px",
                          fontSize: "12.5px",
                          color: "#475569",
                        }}
                      >
                        {doc.recipient}
                      </td>

                      {/* Status */}
                      <td style={{ padding: "14px 18px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 10px",
                            borderRadius: "12px",
                            fontSize: "11.5px",
                            fontWeight: 600,
                            backgroundColor: badgeStyle.backgroundColor,
                            color: badgeStyle.color,
                          }}
                        >
                          {doc.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td
                        style={{
                          padding: "14px 18px",
                          fontSize: "12px",
                          color: "#64748b",
                        }}
                      >
                        {doc.date}
                      </td>

                      {/* Actions */}
                      <td
                        style={{
                          padding: "14px 18px",
                          textAlign: "right",
                          position: "relative",
                        }}
                      >
                        <button
                          onClick={() =>
                            setActiveMenuId(
                              activeMenuId === doc.id ? null : doc.id
                            )
                          }
                          style={{
                            border: "none",
                            backgroundColor: "transparent",
                            color: "#94a3b8",
                            cursor: "pointer",
                            padding: "4px",
                            borderRadius: "4px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "#0f172a")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "#94a3b8")
                          }
                        >
                          <MoreVertical style={{ width: "15px", height: "15px" }} />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuId === doc.id && (
                          <div
                            style={{
                              position: "absolute",
                              right: "18px",
                              top: "38px",
                              backgroundColor: "#ffffff",
                              borderRadius: "8px",
                              border: "1px solid #e2e8f0",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                              zIndex: 50,
                              minWidth: "160px",
                              padding: "4px 0",
                              textAlign: "left",
                            }}
                          >
                            <Link
                              href={`/preview/${doc.id}`}
                              onClick={() => setActiveMenuId(null)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "8px 12px",
                                fontSize: "12px",
                                color: "#334155",
                                textDecoration: "none",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor = "#f8fafc")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor = "transparent")
                              }
                            >
                              <Eye style={{ width: "13px", height: "13px" }} />
                              <span>View Document</span>
                            </Link>
                            <Link
                              href={`/documents/${doc.id}/send`}
                              onClick={() => setActiveMenuId(null)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "8px 12px",
                                fontSize: "12px",
                                color: "#2563eb",
                                textDecoration: "none",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor = "#eff6ff")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor = "transparent")
                              }
                            >
                              <Send style={{ width: "13px", height: "13px" }} />
                              <span>Send for Signature</span>
                            </Link>
                            <button
                              onClick={() => {
                                showToast(`Downloading ${doc.docNumber}...`);
                                setActiveMenuId(null);
                              }}
                              style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "8px 12px",
                                fontSize: "12px",
                                color: "#334155",
                                border: "none",
                                backgroundColor: "transparent",
                                cursor: "pointer",
                                textAlign: "left",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor = "#f8fafc")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor = "transparent")
                              }
                            >
                              <Download style={{ width: "13px", height: "13px" }} />
                              <span>Download PDF</span>
                            </button>
                            <button
                              onClick={() => {
                                setDocuments(documents.filter((d) => d.id !== doc.id));
                                showToast(`Deleted ${doc.docNumber}`);
                                setActiveMenuId(null);
                              }}
                              style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "8px 12px",
                                fontSize: "12px",
                                color: "#ef4444",
                                border: "none",
                                backgroundColor: "transparent",
                                cursor: "pointer",
                                textAlign: "left",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor = "#fee2e2")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor = "transparent")
                              }
                            >
                              <Trash2 style={{ width: "13px", height: "13px" }} />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredDocs.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        padding: "36px",
                        textAlign: "center",
                        color: "#94a3b8",
                        fontSize: "13px",
                      }}
                    >
                      No documents found for current filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </OrgLayout>
  );
}
