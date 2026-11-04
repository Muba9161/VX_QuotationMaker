"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import OrgLayout from "@/components/OrgLayout";
import {
  FileText,
  Clock,
  CheckCircle2,
  PenTool,
  Plus,
  Search,
  Calendar,
  MoreVertical,
  Maximize2,
  Download,
  Edit,
  Share2,
  Trash2,
  Send,
  Eye,
  ChevronDown,
  X,
  Copy,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Printer,
} from "lucide-react";

interface DocumentRow {
  id: string;
  docNumber: string;
  title: string;
  type: "Quotation" | "MOU" | "Contract" | "Proposal";
  recipient: string;
  status: string;
  statusCode: string;
  lastUpdated: string;
  updatedAt: string | null;
  iconColor: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [selectedDocId, setSelectedDocId] = useState("");
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedDateFilter, setSelectedDateFilter] = useState("All Dates");
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewRetryKey, setPreviewRetryKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const previewFrameRef = useRef<HTMLIFrameElement>(null);
  const pageSize = 10;

  useEffect(() => {
    let isMounted = true;

    async function fetchAllPages(endpoint: string) {
      const records: unknown[] = [];
      let page = 1;
      let totalPages = 1;

      do {
        const response = await fetch(`${endpoint}?limit=100&page=${page}`, {
          credentials: "include",
          cache: "no-store",
        });
        const payload = await response.json();
        if (!response.ok || payload?.success === false) {
          throw new Error(payload?.error?.message || "Unable to load documents.");
        }
        if (!Array.isArray(payload?.data)) {
          throw new Error("The documents API returned an invalid response.");
        }

        records.push(...payload.data);
        const pages = Number(payload?.meta?.pagination?.totalPages);
        if (!Number.isInteger(pages) || pages < 0 || (pages > 0 && pages < page)) {
          throw new Error("The documents API returned invalid pagination data.");
        }
        totalPages = pages;
        page += 1;
      } while (page <= totalPages);

      return records;
    }

    function mapStatus(status: string) {
      switch (status) {
        case "SENT":
        case "VIEWED":
        case "PENDING_SIGNATURE":
          return "Sent";
        case "SIGNED":
          return "Signed";
        case "APPROVED":
          return "Approved";
        case "PENDING_APPROVAL":
          return "Pending";
        case "DRAFT":
          return "Draft";
        case "EXPIRED":
          return "Expired";
        case "DECLINED":
          return "Declined";
        case "REVOKED":
          return "Revoked";
        case "CHANGES_REQUESTED":
          return "Changes Requested";
        default:
          return status.replaceAll("_", " ");
      }
    }

    function mapDocument(value: unknown, type: "Quotation" | "MOU"): DocumentRow {
      if (!value || typeof value !== "object") {
        throw new Error("The documents API returned an invalid document.");
      }
      const record = value as Record<string, unknown>;
      const id = typeof record.id === "string" ? record.id : "";
      const docNumber = typeof record.docNumber === "string" ? record.docNumber : "";
      const title = typeof record.title === "string" ? record.title : "";
      const statusCode = typeof record.status === "string" ? record.status : "";
      if (!id || !docNumber || !title || !statusCode) {
        throw new Error("The documents API returned a document missing required fields.");
      }

      const recipient = [record.clientName, record.clientCompany].find(
        (part): part is string => typeof part === "string" && part.trim().length > 0
      ) || "";
      const dateValue = record.updatedAt || record.createdAt || record.issueDate || record.effectiveDate;
      const date = dateValue ? new Date(String(dateValue)) : null;
      const validDate = date && !Number.isNaN(date.getTime()) ? date : null;

      return {
        id,
        docNumber,
        title,
        type,
        recipient,
        status: mapStatus(statusCode),
        statusCode,
        lastUpdated: validDate
          ? validDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
          : "-",
        updatedAt: validDate ? validDate.toISOString() : null,
        iconColor: type === "MOU" ? "#0d9488" : "#2563eb",
      };
    }

    async function loadDocuments() {
      setDocumentsLoading(true);
      setDocumentsError(null);
      try {
        const [quotations, mous] = await Promise.all([
          fetchAllPages("/api/v1/quotations"),
          fetchAllPages("/api/v1/mous"),
        ]);
        const loadedDocuments = [
          ...quotations.map((document) => mapDocument(document, "Quotation")),
          ...mous.map((document) => mapDocument(document, "MOU")),
        ].sort((a, b) => {
          if (!a.updatedAt) return 1;
          if (!b.updatedAt) return -1;
          return b.updatedAt.localeCompare(a.updatedAt);
        });

        if (isMounted) {
          setDocuments(loadedDocuments);
          setSelectedDocId((selectedId) =>
            loadedDocuments.some((document) => document.id === selectedId)
              ? selectedId
              : loadedDocuments[0]?.id || ""
          );
          setCheckedIds([]);
        }
      } catch (error) {
        if (isMounted) {
          setDocuments([]);
          setSelectedDocId("");
          setDocumentsError(
            error instanceof Error ? error.message : "Unable to load documents."
          );
        }
      } finally {
        if (isMounted) setDocumentsLoading(false);
      }
    }

    void loadDocuments();
    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-doc-menu]")) {
        setActiveMenuId(null);
      }
      if (!target.closest("[data-date-dropdown]")) {
        setIsDateDropdownOpen(false);
      }
      if (!target.closest("[data-create-dropdown]")) {
        setIsCreateDropdownOpen(false);
      }
    };
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesTab =
      activeTab === "All"
        ? true
        : activeTab === "Quotations"
        ? doc.type === "Quotation"
        : activeTab === "MOUs"
        ? doc.type === "MOU"
        : activeTab === "Contracts"
        ? doc.type === "Contract"
        : activeTab === "Proposals"
        ? doc.type === "Proposal"
        : false;

    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.docNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const updatedAt = doc.updatedAt ? new Date(doc.updatedAt) : null;
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (selectedDateFilter === "This Week") {
      startDate.setDate(startDate.getDate() - ((startDate.getDay() + 6) % 7));
    } else if (selectedDateFilter === "This Month") {
      startDate.setDate(1);
    } else if (selectedDateFilter === "Last 30 Days") {
      startDate.setDate(startDate.getDate() - 29);
    }
    const matchesDate =
      selectedDateFilter === "All Dates" ||
      Boolean(
        updatedAt &&
          !Number.isNaN(updatedAt.getTime()) &&
          updatedAt >= startDate &&
          updatedAt <= now
      );

    return matchesTab && matchesSearch && matchesDate;
  });

  const selectedDoc = filteredDocs.find((document) => document.id === selectedDocId) || filteredDocs[0];
  const previewDocumentId = selectedDoc?.id;
  const previewDocumentType = selectedDoc?.type;

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl: string | null = null;

    async function loadPreview() {
      if (!previewDocumentId || !previewDocumentType) {
        setPreviewPdfUrl(null);
        setPreviewError(null);
        setPreviewLoading(false);
        return;
      }

      setPreviewPdfUrl(null);
      setPreviewError(null);
      setPreviewLoading(true);
      try {
        const endpoint =
          previewDocumentType === "MOU"
            ? `/api/v1/mous/${previewDocumentId}/pdf?preview=1`
            : `/api/v1/quotations/${previewDocumentId}/pdf?preview=1`;
        const response = await fetch(endpoint, {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error?.message || "Unable to load this document preview.");
        }
        if (!(response.headers.get("content-type") || "").includes("application/pdf")) {
          throw new Error("The document preview is not available as a PDF.");
        }

        objectUrl = URL.createObjectURL(await response.blob());
        setPreviewPdfUrl(objectUrl);
      } catch (error) {
        if (!controller.signal.aborted) {
          setPreviewError(
            error instanceof Error ? error.message : "Unable to load this document preview."
          );
        }
      } finally {
        if (!controller.signal.aborted) setPreviewLoading(false);
      }
    }

    void loadPreview();
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [previewDocumentId, previewDocumentType, previewRetryKey]);



  const totalPages = Math.max(1, Math.ceil(filteredDocs.length / pageSize));
  const activePage = Math.min(currentPage, totalPages);
  const pageDocs = filteredDocs.slice((activePage - 1) * pageSize, activePage * pageSize);
  const pendingSignatureCount = documents.filter((document) =>
    ["SENT", "VIEWED", "PENDING_SIGNATURE"].includes(document.statusCode)
  ).length;
  const signedCount = documents.filter((document) => document.statusCode === "SIGNED").length;
  const expiredCount = documents.filter((document) => document.statusCode === "EXPIRED").length;

  const handleSelectAll = () => {
    if (checkedIds.length === filteredDocs.length) {
      setCheckedIds([]);
    } else {
      setCheckedIds(filteredDocs.map((d) => d.id));
    }
  };

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const triggerFileDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleDownloadPDF = async (doc: DocumentRow) => {
    showToast(`Downloading PDF for ${doc.docNumber}...`);
    try {
      const endpoint =
        doc.type === "MOU"
          ? `/api/v1/mous/${doc.id}/pdf`
          : `/api/v1/quotations/${doc.id}/pdf`;
      const response = await fetch(endpoint, {
        credentials: "include",
        cache: "no-store",
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message || "Unable to download this document.");
      }
      if (!(response.headers.get("content-type") || "").includes("application/pdf")) {
        throw new Error("The document is not available as a PDF.");
      }
      triggerFileDownload(await response.blob(), `${doc.type}-${doc.docNumber}.pdf`);
      showToast(`Downloaded ${doc.docNumber}.pdf`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to download PDF.");
    }
  };

  const handleDelete = async (doc: DocumentRow) => {
    try {
      const endpoint =
        doc.type === "MOU" ? `/api/v1/mous/${doc.id}` : `/api/v1/quotations/${doc.id}`;
      const response = await fetch(endpoint, {
        method: "DELETE",
        credentials: "include",
      });
      const payload = await response.json();
      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.error?.message || "Unable to delete this document.");
      }

      setReloadKey((key) => key + 1);
      setCurrentPage(1);
      setCheckedIds((previous) => previous.filter((id) => id !== doc.id));
      setActiveMenuId(null);
      showToast(payload?.data?.message || `Updated ${doc.docNumber}.`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to delete this document.");
    }
  };

  const handleDuplicate = async (doc: DocumentRow) => {
    if (doc.type !== "Quotation") {
      showToast("Duplicating MOUs is not supported.");
      setActiveMenuId(null);
      return;
    }
    try {
      const response = await fetch(`/api/v1/quotations/${doc.id}/duplicate`, {
        method: "POST",
        credentials: "include",
      });
      const payload = await response.json();
      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.error?.message || "Unable to duplicate this quotation.");
      }
      setReloadKey((key) => key + 1);
      setCurrentPage(1);
      setActiveMenuId(null);
      showToast(`Duplicated ${doc.docNumber}.`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to duplicate this quotation.");
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "Sent":
        return { backgroundColor: "#eff6ff", color: "#2563eb" };
      case "Signed":
        return { backgroundColor: "#dcfce7", color: "#16a34a" };
      case "Approved":
        return { backgroundColor: "#dcfce7", color: "#15803d" };
      case "Pending":
        return { backgroundColor: "#fef3c7", color: "#d97706" };
      case "Draft":
        return { backgroundColor: "#f1f5f9", color: "#475569" };
      case "Expired":
        return { backgroundColor: "#fee2e2", color: "#dc2626" };
      case "Declined":
        return { backgroundColor: "#fee2e2", color: "#b91c1c" };
      case "Revoked":
        return { backgroundColor: "#f1f5f9", color: "#64748b" };
      case "Changes Requested":
        return { backgroundColor: "#fff7ed", color: "#c2410c" };
      default:
        return { backgroundColor: "#f1f5f9", color: "#475569" };
    }
  };

  const getTypeBadgeStyle = (type: DocumentRow["type"]) => {
    switch (type) {
      case "Quotation":
        return { backgroundColor: "#eff6ff", color: "#2563eb" };
      case "MOU":
        return { backgroundColor: "#dcfce7", color: "#16a34a" };
      case "Contract":
        return { backgroundColor: "#f3e8ff", color: "#9333ea" };
      case "Proposal":
        return { backgroundColor: "#fce7f3", color: "#db2777" };
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
          maxWidth: "1160px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "22px",
          boxSizing: "border-box",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        }}
      >
        {/* ================= 1. PAGE HEADER ================= */}
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
                fontSize: "24px",
                fontWeight: 800,
                color: "#0f172a",
                margin: 0,
                letterSpacing: "-0.4px",
              }}
            >
              Documents
            </h1>
            <p
              style={{
                fontSize: "13.5px",
                fontWeight: 400,
                color: "#64748b",
                margin: "4px 0 0 0",
              }}
            >
              Manage all your documents in one place. Create, view, share and track document status.
            </p>
          </div>

          {/* Create Document Button with Dropdown */}
          <div data-create-dropdown="true" style={{ position: "relative" }}>
            <button
              type="button"
              data-create-dropdown="true"
              onClick={(e) => {
                e.stopPropagation();
                setIsCreateDropdownOpen((prev) => !prev);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                backgroundColor: "#2563eb",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                fontSize: "13.5px",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#1d4ed8")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#2563eb")
              }
            >
              <Plus style={{ width: "17px", height: "17px", strokeWidth: 2.5 }} />
              <span>Create Document</span>
              <ChevronDown style={{ width: "15px", height: "15px" }} />
            </button>

            {isCreateDropdownOpen && (
              <div
                data-create-dropdown="true"
                style={{
                  position: "absolute",
                  right: 0,
                  top: "46px",
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                  border: "1px solid #e2e8f0",
                  width: "180px",
                  zIndex: 50,
                  padding: "6px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                <Link
                  href="/quotations/new"
                  onClick={() => setIsCreateDropdownOpen(false)}
                  style={{
                    padding: "9px 12px",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#0f172a",
                    textDecoration: "none",
                    borderRadius: "8px",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f1f5f9")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  New Quotation
                </Link>
                <Link
                  href="/mou/new"
                  onClick={() => setIsCreateDropdownOpen(false)}
                  style={{
                    padding: "9px 12px",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#0f172a",
                    textDecoration: "none",
                    borderRadius: "8px",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f1f5f9")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  New MOU
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ================= 2. FOUR STAT CARDS IN A ROW ================= */}
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
              padding: "20px 22px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                backgroundColor: "#eff6ff",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <FileText style={{ width: "24px", height: "24px" }} />
            </div>
            <div>
              <span
                style={{
                  fontSize: "26px",
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: 1,
                  display: "block",
                }}
              >
                {documentsLoading || documentsError ? "—" : documents.length}
              </span>
              <span
                style={{
                  fontSize: "12.5px",
                  fontWeight: 500,
                  color: "#64748b",
                  marginTop: "5px",
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
              padding: "20px 22px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                backgroundColor: "#fef3c7",
                color: "#d97706",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <PenTool style={{ width: "22px", height: "22px" }} />
            </div>
            <div>
              <span
                style={{
                  fontSize: "26px",
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: 1,
                  display: "block",
                }}
              >
                {documentsLoading || documentsError ? "—" : pendingSignatureCount}
              </span>
              <span
                style={{
                  fontSize: "12.5px",
                  fontWeight: 500,
                  color: "#64748b",
                  marginTop: "5px",
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
              padding: "20px 22px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                backgroundColor: "#dcfce7",
                color: "#16a34a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <CheckCircle2 style={{ width: "24px", height: "24px" }} />
            </div>
            <div>
              <span
                style={{
                  fontSize: "26px",
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: 1,
                  display: "block",
                }}
              >
                {documentsLoading || documentsError ? "—" : signedCount}
              </span>
              <span
                style={{
                  fontSize: "12.5px",
                  fontWeight: 500,
                  color: "#64748b",
                  marginTop: "5px",
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
              padding: "20px 22px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                backgroundColor: "#fee2e2",
                color: "#dc2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Clock style={{ width: "24px", height: "24px" }} />
            </div>
            <div>
              <span
                style={{
                  fontSize: "26px",
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: 1,
                  display: "block",
                }}
              >
                {documentsLoading || documentsError ? "—" : expiredCount}
              </span>
              <span
                style={{
                  fontSize: "12.5px",
                  fontWeight: 500,
                  color: "#64748b",
                  marginTop: "5px",
                  display: "block",
                }}
              >
                Expired
              </span>
            </div>
          </div>
        </div>

        {/* ================= 3. FILTER TABS & SEARCH ROW ================= */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "14px",
          }}
        >
          {/* Filter Pills */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            {["All", "Quotations", "MOUs", "Contracts", "Proposals", "Others"].map(
              (tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab);
                      setCurrentPage(1);
                    }}
                    style={{
                      padding: "8px 18px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: isActive ? 700 : 500,
                      backgroundColor: isActive ? "#2563eb" : "#ffffff",
                      color: isActive ? "#ffffff" : "#475569",
                      border: isActive ? "none" : "1px solid #e2e8f0",
                      cursor: "pointer",
                      boxShadow: isActive
                        ? "0 2px 6px rgba(37,99,235,0.25)"
                        : "0 1px 2px rgba(0,0,0,0.02)",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {tab}
                  </button>
                );
              }
            )}
          </div>

          {/* Search Input & All Dates Dropdown */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div style={{ position: "relative", width: "240px" }}>
              <Search
                style={{
                  width: "15px",
                  height: "15px",
                  color: "#94a3b8",
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  width: "100%",
                  height: "38px",
                  padding: "0 12px 0 36px",
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

            {/* Interactive All Dates Dropdown */}
            <div style={{ position: "relative" }} data-date-dropdown="true">
              <button
                type="button"
                onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  height: "38px",
                  padding: "0 14px",
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "#475569",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <Calendar style={{ width: "14px", height: "14px", color: "#64748b" }} />
                <span>{selectedDateFilter}</span>
                <ChevronDown style={{ width: "13px", height: "13px", color: "#64748b" }} />
              </button>

              {isDateDropdownOpen && (
                <div
                  data-date-dropdown="true"
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "44px",
                    backgroundColor: "#ffffff",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
                    minWidth: "155px",
                    zIndex: 100,
                    padding: "6px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                    textAlign: "left",
                  }}
                >
                  {["All Dates", "Today", "This Week", "This Month", "Last 30 Days"].map(
                    (opt) => {
                      const isSel = selectedDateFilter === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setSelectedDateFilter(opt);
                            setCurrentPage(1);
                            setIsDateDropdownOpen(false);
                            showToast(`Filtered by ${opt}`);
                          }}
                          style={{
                            padding: "8px 12px",
                            fontSize: "12.5px",
                            fontWeight: isSel ? 700 : 500,
                            color: isSel ? "#2563eb" : "#0f172a",
                            backgroundColor: isSel ? "#eff6ff" : "transparent",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            width: "100%",
                            textAlign: "left",
                            transition: "background-color 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (!isSel)
                              e.currentTarget.style.backgroundColor = "#f8fafc";
                          }}
                          onMouseLeave={(e) => {
                            if (!isSel)
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                          }}
                        >
                          {opt}
                        </button>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= 4. SPLIT AREA: TABLE + PREVIEW ================= */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.65fr 1fr",
            gap: "20px",
            alignItems: "start",
          }}
        >
          {/* LEFT: Documents Table with Pagination */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "18px",
              border: "1px solid #eef2f6",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
              overflow: "hidden",
            }}
          >
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
                    <th style={{ padding: "12px 12px 12px 16px", width: "32px" }}>
                      <input
                        type="checkbox"
                        checked={
                          checkedIds.length === filteredDocs.length &&
                          filteredDocs.length > 0
                        }
                        onChange={handleSelectAll}
                        style={{ cursor: "pointer", accentColor: "#2563eb" }}
                      />
                    </th>
                    <th
                      style={{
                        padding: "12px 10px",
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
                        padding: "12px 12px",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#64748b",
                      }}
                    >
                      Document Title
                    </th>
                    <th
                      style={{
                        padding: "12px 10px",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#64748b",
                      }}
                    >
                      Type
                    </th>
                    <th
                      style={{
                        padding: "12px 12px",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#64748b",
                      }}
                    >
                      Recipient
                    </th>
                    <th
                      style={{
                        padding: "12px 10px",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#64748b",
                      }}
                    >
                      Status
                    </th>
                    <th
                      style={{
                        padding: "12px 12px",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#64748b",
                      }}
                    >
                      Last Updated
                    </th>
                    <th
                      style={{
                        padding: "12px 16px",
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
                  {pageDocs.map((doc, idx) => {
                    const isSelected = selectedDoc?.id === doc.id;
                    const isChecked = checkedIds.includes(doc.id);
                    const isMenuOpen = activeMenuId === doc.id;
                    const statusBadge = getStatusBadgeStyle(doc.status);
                    const typeBadge = getTypeBadgeStyle(doc.type);
                    const isBottom = idx >= pageDocs.length - 3;

                    return (
                      <tr
                        key={doc.id}
                        onClick={() => setSelectedDocId(doc.id)}
                        style={{
                          borderBottom: "1px solid #f8fafc",
                          backgroundColor: isSelected ? "#f8fafc" : "transparent",
                          cursor: "pointer",
                          transition: "background-color 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = "#fafafa";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        {/* Checkbox */}
                        <td
                          style={{ padding: "13px 12px 13px 16px" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleCheck(doc.id)}
                            style={{ cursor: "pointer", accentColor: "#2563eb" }}
                          />
                        </td>

                        {/* Doc Number + Icon */}
                        <td style={{ padding: "13px 10px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <FileText
                              style={{
                                width: "15px",
                                height: "15px",
                                color: doc.iconColor,
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                fontSize: "12px",
                                fontWeight: 600,
                                color: "#0f172a",
                              }}
                            >
                              {doc.docNumber}
                            </span>
                          </div>
                        </td>

                        {/* Title */}
                        <td
                          style={{
                            padding: "13px 12px",
                            fontSize: "12.5px",
                            fontWeight: 600,
                            color: "#0f172a",
                          }}
                        >
                          {doc.title}
                        </td>

                        {/* Type Badge */}
                        <td style={{ padding: "13px 10px" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "2px 8px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 600,
                              ...typeBadge,
                            }}
                          >
                            {doc.type}
                          </span>
                        </td>

                        {/* Recipient */}
                        <td
                          style={{
                            padding: "13px 12px",
                            fontSize: "12.5px",
                            color: "#334155",
                          }}
                        >
                          {doc.recipient || "—"}
                        </td>

                        {/* Status Badge */}
                        <td style={{ padding: "13px 10px" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "2px 10px",
                              borderRadius: "9999px",
                              fontSize: "11px",
                              fontWeight: 600,
                              ...statusBadge,
                            }}
                          >
                            {doc.status}
                          </span>
                        </td>

                        {/* Last Updated */}
                        <td
                          style={{
                            padding: "13px 12px",
                            fontSize: "12px",
                            color: "#64748b",
                          }}
                        >
                          {doc.lastUpdated}
                        </td>

                        {/* Actions */}
                        <td
                          style={{
                            padding: "13px 16px",
                            textAlign: "right",
                            position: "relative",
                          }}
                          data-doc-menu="true"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(isMenuOpen ? null : doc.id);
                            }}
                            style={{
                              backgroundColor: isMenuOpen ? "#eff6ff" : "transparent",
                              border: "none",
                              cursor: "pointer",
                              padding: "6px",
                              borderRadius: "6px",
                              color: isMenuOpen ? "#2563eb" : "#64748b",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <MoreVertical style={{ width: "16px", height: "16px" }} />
                          </button>

                          {isMenuOpen && (
                            <div
                              data-doc-menu="true"
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                position: "absolute",
                                right: "16px",
                                top: isBottom ? "auto" : "38px",
                                bottom: isBottom ? "38px" : "auto",
                                backgroundColor: "#ffffff",
                                borderRadius: "12px",
                                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.18)",
                                border: "1px solid #e2e8f0",
                                width: "175px",
                                zIndex: 9999,
                                padding: "6px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "2px",
                                textAlign: "left",
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedDocId(doc.id);
                                  setActiveMenuId(null);
                                  setIsFullscreenPreview(true);
                                }}
                                style={{
                                  padding: "8px 12px",
                                  fontSize: "13px",
                                  fontWeight: 500,
                                  color: "#1e293b",
                                  border: "none",
                                  backgroundColor: "transparent",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                  width: "100%",
                                  textAlign: "left",
                                  transition: "background-color 0.15s ease",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "#f8fafc")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "transparent")
                                }
                              >
                                <Eye style={{ width: "16px", height: "16px", color: "#64748b" }} />
                                <span>View Document</span>
                              </button>

                              <Link
                                href={`/documents/${doc.id}/send`}
                                onClick={() => setActiveMenuId(null)}
                                style={{
                                  padding: "8px 12px",
                                  fontSize: "13px",
                                  fontWeight: 500,
                                  color: "#2563eb",
                                  textDecoration: "none",
                                  borderRadius: "6px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                  transition: "background-color 0.15s ease",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "#eff6ff")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "transparent")
                                }
                              >
                                <Send style={{ width: "16px", height: "16px", color: "#2563eb" }} />
                                <span>Send for Signature</span>
                              </Link>

                              <button
                                type="button"
                                onClick={() => {
                                  handleDownloadPDF(doc);
                                  setActiveMenuId(null);
                                }}
                                style={{
                                  padding: "8px 12px",
                                  fontSize: "13px",
                                  fontWeight: 500,
                                  color: "#1e293b",
                                  border: "none",
                                  backgroundColor: "transparent",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                  width: "100%",
                                  textAlign: "left",
                                  transition: "background-color 0.15s ease",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "#f8fafc")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "transparent")
                                }
                              >
                                <Download style={{ width: "16px", height: "16px", color: "#64748b" }} />
                                <span>Download PDF</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(doc)}
                                style={{
                                  padding: "8px 12px",
                                  fontSize: "13px",
                                  fontWeight: 500,
                                  color: "#ef4444",
                                  border: "none",
                                  backgroundColor: "transparent",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                  width: "100%",
                                  textAlign: "left",
                                  transition: "background-color 0.15s ease",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "#fee2e2")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "transparent")
                                }
                              >
                                <Trash2 style={{ width: "16px", height: "16px", color: "#ef4444" }} />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {documentsLoading && (
                    <tr>
                      <td colSpan={8} style={{ padding: "32px", textAlign: "center", color: "#64748b" }}>
                        Loading documents...
                      </td>
                    </tr>
                  )}
                  {!documentsLoading && documentsError && (
                    <tr>
                      <td colSpan={8} style={{ padding: "24px", textAlign: "center", color: "#b91c1c" }}>
                        {documentsError}
                        <button
                          type="button"
                          onClick={() => setReloadKey((key) => key + 1)}
                          style={{ display: "block", margin: "10px auto 0", color: "#2563eb", border: 0, background: "none", cursor: "pointer" }}
                        >
                          Retry
                        </button>
                      </td>
                    </tr>
                  )}
                  {!documentsLoading && !documentsError && filteredDocs.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ padding: "32px", textAlign: "center", color: "#64748b" }}>
                        No documents found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div
              style={{
                padding: "14px 20px",
                borderTop: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
                fontSize: "12px",
                color: "#64748b",
              }}
            >
              <span>Showing {filteredDocs.length === 0 ? 0 : (activePage - 1) * pageSize + 1} to {Math.min(activePage * pageSize, filteredDocs.length)} of {filteredDocs.length} documents</span>

              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <button
                    type="button"
                    aria-label="First page"
                    onClick={() => setCurrentPage(1)}
                    disabled={activePage === 1}
                    style={{ width: "28px", height: "28px", borderRadius: "6px", border: "1px solid #e2e8f0", backgroundColor: "#ffffff", cursor: activePage === 1 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", opacity: activePage === 1 ? 0.5 : 1 }}
                  >
                    <ChevronsLeft style={{ width: "13px", height: "13px" }} />
                  </button>
                  <button
                    type="button"
                    aria-label="Previous page"
                    onClick={() => setCurrentPage((page) => Math.max(1, Math.min(page, totalPages) - 1))}
                    disabled={activePage === 1}
                    style={{ width: "28px", height: "28px", borderRadius: "6px", border: "1px solid #e2e8f0", backgroundColor: "#ffffff", cursor: activePage === 1 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", opacity: activePage === 1 ? 0.5 : 1 }}
                  >
                    <ChevronLeft style={{ width: "13px", height: "13px" }} />
                  </button>
                  {Array.from({ length: Math.min(3, totalPages - activePage + 1) }, (_, index) => activePage + index).map((page) => (
                    <button
                      key={page}
                      type="button"
                      aria-current={page === activePage ? "page" : undefined}
                      onClick={() => setCurrentPage(page)}
                      style={{ width: "28px", height: "28px", borderRadius: "6px", border: page === activePage ? "none" : "1px solid #e2e8f0", backgroundColor: page === activePage ? "#2563eb" : "#ffffff", color: page === activePage ? "#ffffff" : "#64748b", fontWeight: page === activePage ? 700 : 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    aria-label="Next page"
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, Math.min(page, totalPages) + 1))}
                    disabled={activePage >= totalPages}
                    style={{ width: "28px", height: "28px", borderRadius: "6px", border: "1px solid #e2e8f0", backgroundColor: "#ffffff", cursor: activePage >= totalPages ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", opacity: activePage >= totalPages ? 0.5 : 1 }}
                  >
                    <ChevronRight style={{ width: "13px", height: "13px" }} />
                  </button>
                  <button
                    type="button"
                    aria-label="Last page"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={activePage >= totalPages}
                    style={{ width: "28px", height: "28px", borderRadius: "6px", border: "1px solid #e2e8f0", backgroundColor: "#ffffff", cursor: activePage >= totalPages ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", opacity: activePage >= totalPages ? 0.5 : 1 }}
                  >
                    <ChevronsRight style={{ width: "13px", height: "13px" }} />
                  </button>
                </div>

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 10px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "12px",
                    color: "#475569",
                  }}
                >
                  <span>10 / page</span>
                  <ChevronDown style={{ width: "12px", height: "12px" }} />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Document Preview Panel */}
          {selectedDoc ? (
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "18px",
              border: "1px solid #eef2f6",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              boxSizing: "border-box",
            }}
          >
            {/* Header: Title + Expand Button */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h2
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#0f172a",
                  margin: 0,
                }}
              >
                Document Preview
              </h2>
              <button
                type="button"
                onClick={() => setIsFullscreenPreview(true)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748b",
                  padding: "4px",
                  borderRadius: "4px",
                }}
              >
                <Maximize2 style={{ width: "15px", height: "15px" }} />
              </button>
            </div>

            {/* Original server-rendered document preview */}
            <div
              style={{
                height: "460px",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                overflow: "hidden",
                backgroundColor: "#f8fafc",
              }}
            >
              {previewLoading ? (
                <div role="status" style={{ padding: "24px", color: "#64748b", fontSize: "13px" }}>
                  Loading document preview...
                </div>
              ) : previewError ? (
                <div role="alert" style={{ padding: "24px", color: "#b91c1c", fontSize: "13px" }}>
                  {previewError}
                  <button
                    type="button"
                    onClick={() => setPreviewRetryKey((key) => key + 1)}
                    style={{ display: "block", marginTop: "10px", color: "#2563eb", border: 0, background: "none", cursor: "pointer" }}
                  >
                    Retry preview
                  </button>
                </div>
              ) : previewPdfUrl ? (
                <iframe
                  title={`${selectedDoc.title} PDF preview`}
                  src={previewPdfUrl}
                  style={{ width: "100%", height: "100%", border: 0 }}
                />
              ) : null}
            </div>

            {/* Action Buttons below preview sheet */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button
                type="button"
                onClick={() => handleDownloadPDF(selectedDoc)}
                style={{
                  width: "100%",
                  height: "38px",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(37,99,235,0.25)",
                }}
              >
                <Download style={{ width: "15px", height: "15px" }} />
                <span>Download PDF</span>
              </button>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "8px",
                }}
              >
                <Link
                  href={
                    selectedDoc.type === "MOU"
                      ? `/mou/new?edit=${selectedDoc.id}`
                      : `/quotations/new?edit=${selectedDoc.id}`
                  }
                  style={{
                    height: "36px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: "#334155",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    textDecoration: "none",
                    cursor: "pointer",
                  }}
                >
                  <Edit style={{ width: "13px", height: "13px" }} />
                  <span>Edit</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(true)}
                  style={{
                    height: "36px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: "#334155",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    cursor: "pointer",
                  }}
                >
                  <Share2 style={{ width: "13px", height: "13px" }} />
                  <span>Share</span>
                </button>

                <button
                  type="button"
                  data-doc-menu="true"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenuId(activeMenuId === "panel" ? null : "panel");
                  }}
                  style={{
                    height: "36px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: "#334155",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  <MoreVertical style={{ width: "13px", height: "13px" }} />
                  <span>More</span>
                  <ChevronDown style={{ width: "11px", height: "11px" }} />

                  {activeMenuId === "panel" && (
                    <div
                      data-doc-menu="true"
                      style={{
                        position: "absolute",
                        right: 0,
                        bottom: "42px",
                        backgroundColor: "#ffffff",
                        borderRadius: "10px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                        border: "1px solid #e2e8f0",
                        width: "165px",
                        zIndex: 100,
                        padding: "6px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                        textAlign: "left",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          void handleDuplicate(selectedDoc);
                        }}
                        style={{
                          padding: "8px 10px",
                          fontSize: "12px",
                          fontWeight: 500,
                          color: "#0f172a",
                          border: "none",
                          backgroundColor: "transparent",
                          borderRadius: "6px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          width: "100%",
                          textAlign: "left",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#f8fafc")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                      >
                        <Copy style={{ width: "13px", height: "13px" }} />
                        <span>Duplicate</span>
                      </button>

                      <Link
                        href={`/documents/${selectedDoc.id}/send`}
                        onClick={() => setActiveMenuId(null)}
                        style={{
                          padding: "8px 10px",
                          fontSize: "12px",
                          fontWeight: 500,
                          color: "#2563eb",
                          textDecoration: "none",
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          width: "100%",
                          textAlign: "left",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#eff6ff")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                      >
                        <Send style={{ width: "13px", height: "13px" }} />
                        <span>Send for Signature</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          handleDownloadPDF(selectedDoc);
                          setActiveMenuId(null);
                        }}
                        style={{
                          padding: "8px 10px",
                          fontSize: "12px",
                          fontWeight: 500,
                          color: "#0f172a",
                          border: "none",
                          backgroundColor: "transparent",
                          borderRadius: "6px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          width: "100%",
                          textAlign: "left",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#f8fafc")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                      >
                        <Download style={{ width: "13px", height: "13px" }} />
                        <span>Download PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleDelete(selectedDoc);
                          setActiveMenuId(null);
                        }}
                        style={{
                          padding: "8px 10px",
                          fontSize: "12px",
                          fontWeight: 500,
                          color: "#ef4444",
                          border: "none",
                          backgroundColor: "transparent",
                          borderRadius: "6px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          width: "100%",
                          textAlign: "left",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#fee2e2")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                      >
                        <Trash2 style={{ width: "13px", height: "13px" }} />
                        <span>Delete Document</span>
                      </button>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
          ) : (
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "18px",
                border: "1px solid #eef2f6",
                boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
                padding: "20px",
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              Document Preview
              <p>{documentsLoading ? "Loading documents..." : "No document selected."}</p>
            </div>
          )}
        </div>
      </div>

      {/* ================= SHARE MODAL ================= */}
      {isShareModalOpen && selectedDoc && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.45)",
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
              maxWidth: "440px",
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
              <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0, color: "#0f172a" }}>
                Share {selectedDoc.docNumber}
              </h3>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
              >
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>
                Public Document Link
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  readOnly
                  value={`https://app.vorldx.com/preview/${selectedDoc.id}`}
                  style={{
                    flex: 1,
                    height: "38px",
                    padding: "0 10px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "12px",
                    backgroundColor: "#f8fafc",
                    color: "#475569",
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(
                      `https://app.vorldx.com/preview/${selectedDoc.id}`
                    );
                    showToast("Link copied to clipboard!");
                    setIsShareModalOpen(false);
                  }}
                  style={{
                    padding: "0 14px",
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= FULLSCREEN PREVIEW MODAL ================= */}
      {isFullscreenPreview && selectedDoc && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "24px",
          }}
          onClick={() => setIsFullscreenPreview(false)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "760px",
              boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
              padding: "28px 32px",
              boxSizing: "border-box",
              maxHeight: "92vh",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: "14px",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span
                  style={{
                    fontSize: "20px",
                    fontWeight: 800,
                    color: "#0f172a",
                    letterSpacing: "-0.3px",
                  }}
                >
                  {selectedDoc.title}
                </span>
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: "9999px",
                    fontSize: "11.5px",
                    fontWeight: 700,
                    ...getStatusBadgeStyle(selectedDoc.status),
                  }}
                >
                  {selectedDoc.status}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsFullscreenPreview(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                  padding: "6px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>

            {/* Original server-rendered document */}
            <div
              style={{
                height: "70vh",
                minHeight: "420px",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                overflow: "hidden",
                backgroundColor: "#f8fafc",
              }}
            >
              {previewLoading ? (
                <div role="status" style={{ padding: "24px", color: "#64748b", fontSize: "13px" }}>
                  Loading document preview...
                </div>
              ) : previewError ? (
                <div role="alert" style={{ padding: "24px", color: "#b91c1c", fontSize: "13px" }}>
                  {previewError}
                  <button
                    type="button"
                    onClick={() => setPreviewRetryKey((key) => key + 1)}
                    style={{ display: "block", marginTop: "10px", color: "#2563eb", border: 0, background: "none", cursor: "pointer" }}
                  >
                    Retry preview
                  </button>
                </div>
              ) : previewPdfUrl ? (
                <iframe
                  ref={previewFrameRef}
                  title={`${selectedDoc.title} PDF preview`}
                  src={previewPdfUrl}
                  style={{ width: "100%", height: "100%", border: 0 }}
                />
              ) : null}
            </div>

            {/* Modal Footer Controls */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: "10px",
                borderTop: "1px solid #e2e8f0",
              }}
            >
              <button
                type="button"
                onClick={() => setIsFullscreenPreview(false)}
                style={{
                  padding: "9px 18px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#475569",
                  cursor: "pointer",
                }}
              >
                Close
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => previewFrameRef.current?.contentWindow?.print()}
                  style={{
                    padding: "9px 16px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#ffffff",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#334155",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Printer style={{ width: "15px", height: "15px" }} />
                  <span>Print</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsFullscreenPreview(false);
                    setIsShareModalOpen(true);
                  }}
                  style={{
                    padding: "9px 16px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#ffffff",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#334155",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Share2 style={{ width: "15px", height: "15px" }} />
                  <span>Share</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadPDF(selectedDoc)}
                  style={{
                    padding: "9px 20px",
                    borderRadius: "10px",
                    border: "none",
                    backgroundColor: "#2563eb",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#ffffff",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 2px 6px rgba(37,99,235,0.3)",
                  }}
                >
                  <Download style={{ width: "15px", height: "15px" }} />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </OrgLayout>
  );
}
