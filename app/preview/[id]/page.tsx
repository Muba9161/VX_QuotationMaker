"use client";

import React, { use, useState, useEffect, Suspense } from "react";
import Link from "next/link";
import OrgLayout from "@/components/OrgLayout";
import {
  ArrowLeft,
  Download,
  Send,
  Printer,
  Edit3,
  Minus,
  Plus,
  Loader2,
  FileText,
} from "lucide-react";
import QuotationPreviewSheet, {
  QuotationData,
} from "@/components/preview/QuotationPreviewSheet";
import MouPreviewSheet, { MouData } from "@/components/preview/MouPreviewSheet";
import { generateQuotationPdf } from "@/lib/pdf/quotation-pdf";
import { generateMouPdf } from "@/lib/pdf/mou-pdf";

const FALLBACK_DOCS = [
  {
    id: "q-001",
    docNumber: "Q-001",
    title: "Website Development",
    type: "quotation" as const,
    issueDate: "2026-10-28",
    validTill: "2026-11-15",
    subtotal: 30000,
    taxRate: 18,
    taxAmount: 5400,
    total: 35400,
    clientName: "Tech Solutions Pvt Ltd",
    clientCompany: "Tech Solutions Pvt Ltd",
    clientAddress: "A-45, Block B, Sector 62, Noida, U.P. 201301",
    paymentTerms: "50% advance, 50% on delivery",
    notes: "Thank you for your business.",
    items: [
      { id: "1", description: "Website Development", quantity: 1, rate: 25000, amount: 25000 },
      { id: "2", description: "Hosting Setup", quantity: 1, rate: 5000, amount: 5000 },
    ],
  },
  {
    id: "q-002",
    docNumber: "Q-002",
    title: "IT Support Services",
    type: "quotation" as const,
    issueDate: "2026-10-25",
    validTill: "2026-11-20",
    subtotal: 86000,
    taxRate: 18,
    taxAmount: 15480,
    total: 101480,
    clientName: "NextGen Digital",
    clientCompany: "NextGen Digital",
    clientAddress: "Brigade Road, Bengaluru, Karnataka 560025",
    paymentTerms: "Monthly billing in advance",
    notes: "Response SLA guaranteed within 1 hour.",
    items: [
      { id: "1", description: "Monthly 24/7 Remote IT Support", quantity: 3, rate: 25000, amount: 75000 },
      { id: "2", description: "On-site Server Maintenance", quantity: 1, rate: 11000, amount: 11000 },
    ],
  },
  {
    id: "q-003",
    docNumber: "Q-003",
    title: "UI/UX Design",
    type: "quotation" as const,
    issueDate: "2026-10-20",
    validTill: "2026-11-15",
    subtotal: 95000,
    taxRate: 18,
    taxAmount: 17100,
    total: 112100,
    clientName: "EduVision",
    clientCompany: "EduVision",
    clientAddress: "Salt Lake Sector V, Kolkata 700091",
    paymentTerms: "Milestone-based delivery",
    notes: "Includes up to 3 revision cycles.",
    items: [
      { id: "1", description: "Design System & Figma Prototypes", quantity: 1, rate: 60000, amount: 60000 },
      { id: "2", description: "User Research & Usability Testing", quantity: 1, rate: 35000, amount: 35000 },
    ],
  },
  {
    id: "mou-001",
    docNumber: "MOU-001",
    title: "Partnership Agreement",
    type: "mou" as const,
    issueDate: "2026-10-26",
    validTill: "2027-10-26",
    clientName: "Global Systems",
    clientCompany: "Global Systems",
    clientAddress: "Tower C, Cyber City, Gurugram, Haryana 122002",
    notes: "Executed in duplicate originals.",
    clauses: [
      { id: "1", title: "Strategic Partnership Framework", content: "The parties collaborate to integrate enterprise cloud software.", sortOrder: 1 },
      { id: "2", title: "Joint GTM Technology Integration", content: "Joint commercial enablement across target territories.", sortOrder: 2 },
    ],
  },
  {
    id: "mou-002",
    docNumber: "MOU-002",
    title: "Strategic Collaboration",
    type: "mou" as const,
    issueDate: "2026-10-24",
    validTill: "2026-12-31",
    clientName: "Innovate India",
    clientCompany: "Innovate India",
    clientAddress: "Hitec City, Madhapur, Hyderabad 500081",
    notes: "Subject to steering board review.",
    clauses: [
      { id: "1", title: "Collaborative R&D Engagement", content: "Framework for joint technology development.", sortOrder: 1 },
      { id: "2", title: "Incubation & Mentorship", content: "Mentorship and developer support milestones.", sortOrder: 2 },
    ],
  },
];

interface PreviewParams {
  params: Promise<{ id: string }>;
}

function PreviewContent({ params }: PreviewParams) {
  const { id } = use(params);
  const [docType, setDocType] = useState<"quotation" | "mou">("quotation");
  const [quotationData, setQuotationData] = useState<QuotationData | null>(null);
  const [mouData, setMouData] = useState<MouData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    let isMounted = true;
    async function fetchDocument() {
      setIsLoading(true);
      setError(null);
      try {
        const qRes = await fetch(`/api/v1/quotations/${id}`, {
          credentials: "include",
        });
        if (qRes.ok) {
          const qJson = await qRes.json();
          if (qJson?.data && isMounted) {
            setDocType("quotation");
            setQuotationData(qJson.data);
            setIsLoading(false);
            return;
          }
        }

        const mRes = await fetch(`/api/v1/mous/${id}`, {
          credentials: "include",
        });
        if (mRes.ok) {
          const mJson = await mRes.json();
          if (mJson?.data && isMounted) {
            setDocType("mou");
            setMouData(mJson.data);
            setIsLoading(false);
            return;
          }
        }

        const fallback = FALLBACK_DOCS.find(
          (d) =>
            d.id.toLowerCase() === id.toLowerCase() ||
            d.docNumber.toLowerCase() === id.toLowerCase() ||
            id.toLowerCase().includes(d.id.toLowerCase())
        );

        if (fallback && isMounted) {
          if (fallback.type === "quotation") {
            setDocType("quotation");
            setQuotationData(fallback as unknown as QuotationData);
          } else {
            setDocType("mou");
            setMouData(fallback as unknown as MouData);
          }
          setIsLoading(false);
          return;
        }

        if (isMounted) {
          setError("Document not found or access denied.");
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const fallback = FALLBACK_DOCS.find(
            (d) =>
              d.id.toLowerCase() === id.toLowerCase() ||
              d.docNumber.toLowerCase() === id.toLowerCase() ||
              id.toLowerCase().includes(d.id.toLowerCase())
          );
          if (fallback) {
            if (fallback.type === "quotation") {
              setDocType("quotation");
              setQuotationData(fallback as unknown as QuotationData);
            } else {
              setDocType("mou");
              setMouData(fallback as unknown as MouData);
            }
            setIsLoading(false);
            return;
          }
          setError(
            err instanceof Error ? err.message : "Failed to load document preview."
          );
          setIsLoading(false);
        }
      }
    }
    fetchDocument();
    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!isLoading && (quotationData || mouData)) {
      if (typeof window !== "undefined" && window.location.search.includes("autoPrint=true")) {
        const timer = setTimeout(() => {
          window.print();
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoading, quotationData, mouData]);

  const pdfDownloadUrl =
    docType === "quotation"
      ? `/api/v1/quotations/${id}/pdf`
      : `/api/v1/mous/${id}/pdf`;

  const handleDownloadPdf = async () => {
    try {
      const res = await fetch(pdfDownloadUrl, { credentials: "include" });
      if (res.ok) {
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/pdf")) {
          const blob = await res.blob();
          const docNumber = quotationData?.docNumber || mouData?.docNumber || id;
          const filename = `${docType === "quotation" ? "Quotation" : "MOU"}-${docNumber}.pdf`;
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          return;
        }
      }

      if (docType === "quotation" && quotationData) {
        const bytes = generateQuotationPdf({
          quotationNumber: quotationData.docNumber,
          title: quotationData.title,
          issueDate: quotationData.issueDate,
          validTill: quotationData.validTill,
          currencySymbol: quotationData.currencySymbol || "₹",
          subtotal: Number(quotationData.subtotal) || 0,
          discountAmount: Number(quotationData.discountAmount) || 0,
          taxRate: Number(quotationData.taxRate) || 18,
          taxAmount: Number(quotationData.taxAmount) || 0,
          grandTotal: Number(quotationData.total) || 0,
          paymentTerms: quotationData.paymentTerms,
          notes: quotationData.notes,
          termsAndConditions: quotationData.termsAndConditions,
          client: {
            name: quotationData.clientName,
            company: quotationData.clientCompany,
            email: quotationData.clientEmail,
            address: quotationData.clientAddress,
          },
          organization: {
            name: "Acme Technologies Pvt Ltd",
            displayName: "Acme Technologies",
            email: "info@acme.com",
            address: "A-45, Sector 62, Noida, U.P. 201301",
            primaryColor: "#2563eb",
          },
          items: quotationData.items.map((it) => ({
            description: it.description,
            quantity: it.quantity,
            unit: it.unit || "Nos",
            rate: it.rate || it.unitPrice || 0,
            amount: it.amount,
          })),
        });
        const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Quotation-${quotationData.docNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else if (docType === "mou" && mouData) {
        const bytes = generateMouPdf({
          mouNumber: mouData.docNumber,
          title: mouData.title,
          effectiveDate: mouData.issueDate,
          expiryDate: mouData.validTill,
          purpose: "Mutual Technical Collaboration and Framework",
          governingLaw: "Laws of India",
          notes: mouData.notes,
          partyA: {
            name: "Acme Technologies Pvt Ltd",
            displayName: "Acme Technologies",
            email: "info@acme.com",
            address: "A-45, Sector 62, Noida, U.P. 201301",
            signatoryName: "Rahul Sharma",
            signatoryTitle: "Director",
            primaryColor: "#0d9488",
          },
          partyB: {
            name: mouData.clientName,
            company: mouData.clientCompany,
            address: mouData.clientAddress,
          },
          clauses: (mouData.clauses || []).map((c, i) => ({
            title: c.title,
            content: c.content,
            sortOrder: c.sortOrder || i + 1,
          })),
        });
        const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `MOU-${mouData.docNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch (err) {
      console.error("PDF download failed:", err);
    }
  };

  const editUrl =
    docType === "quotation" ? `/quotations/new?edit=${id}` : `/mou/new?edit=${id}`;

  return (
    <OrgLayout activePath="/documents">
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          paddingBottom: "64px",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {/* Top Action Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "14px",
          }}
          className="no-print"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link
              href={docType === "quotation" ? "/quotations" : "/mou"}
              style={{
                padding: "8px",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#ffffff",
                color: "#475569",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
              }}
            >
              <ArrowLeft style={{ width: "16px", height: "16px" }} />
            </Link>
            <div>
              <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.4px" }}>
                Document Preview
              </h1>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
                High-fidelity publication preview for ID: {id}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {/* Zoom Controls */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                backgroundColor: "#ffffff",
                padding: "4px 8px",
                fontSize: "12px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
              }}
            >
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(z - 10, 60))}
                style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", padding: "4px" }}
              >
                <Minus style={{ width: "14px", height: "14px" }} />
              </button>
              <span style={{ fontWeight: 700, color: "#334155", minWidth: "40px", textAlign: "center" }}>
                {zoom}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(z + 10, 140))}
                style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", padding: "4px" }}
              >
                <Plus style={{ width: "14px", height: "14px" }} />
              </button>
            </div>

            {/* Edit Document */}
            <Link
              href={editUrl}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                border: "1px solid #cbd5e1",
                backgroundColor: "#ffffff",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#334155",
                textDecoration: "none",
              }}
            >
              <Edit3 style={{ width: "14px", height: "14px", color: "#64748b" }} />
              <span>Edit</span>
            </Link>

            {/* Print */}
            <button
              type="button"
              onClick={() => window.print()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                border: "1px solid #cbd5e1",
                backgroundColor: "#ffffff",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#334155",
                cursor: "pointer",
              }}
            >
              <Printer style={{ width: "14px", height: "14px", color: "#64748b" }} />
              <span>Print</span>
            </button>

            {/* Download Real PDF */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                backgroundColor: "#2563eb",
                color: "#ffffff",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(37,99,235,0.2)",
              }}
            >
              <Download style={{ width: "14px", height: "14px" }} />
              <span>Download PDF</span>
            </button>

            {/* Send for Signature */}
            <Link
              href={`/documents/${id}/send`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                backgroundColor: "#059669",
                color: "#ffffff",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 2px 4px rgba(5,150,105,0.2)",
              }}
            >
              <Send style={{ width: "14px", height: "14px" }} />
              <span>Send for Signature</span>
            </Link>
          </div>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div style={{ padding: "96px 0", textAlign: "center" }}>
            <Loader2 style={{ width: "32px", height: "32px", color: "#2563eb", margin: "0 auto 12px auto" }} />
            <p style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>
              Generating publication preview...
            </p>
          </div>
        ) : error ? (
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "48px 24px",
              textAlign: "center",
              maxWidth: "460px",
              margin: "0 auto",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            }}
          >
            <FileText style={{ width: "40px", height: "40px", color: "#94a3b8", margin: "0 auto 12px auto" }} />
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#1e293b", margin: 0 }}>
              Document Unavailable
            </h3>
            <p style={{ fontSize: "12px", color: "#64748b", margin: "6px 0 20px 0" }}>{error}</p>
            <Link
              href="/quotations"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "8px 18px",
                backgroundColor: "#0f172a",
                color: "#ffffff",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Back to Quotations
            </Link>
          </div>
        ) : (
          <div
            style={{
              backgroundColor: "#e2e8f0",
              borderRadius: "16px",
              border: "1px solid #cbd5e1",
              padding: "32px 16px",
              overflowX: "auto",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top center",
                transition: "transform 0.15s ease",
              }}
            >
              {docType === "quotation" && quotationData ? (
                <QuotationPreviewSheet data={quotationData} />
              ) : docType === "mou" && mouData ? (
                <MouPreviewSheet data={mouData} />
              ) : null}
            </div>
          </div>
        )}
      </div>
    </OrgLayout>
  );
}

export default function PreviewPage({ params }: PreviewParams) {
  return (
    <Suspense
      fallback={
        <OrgLayout activePath="/documents">
          <div style={{ padding: "96px 0", textAlign: "center" }}>
            <Loader2 style={{ width: "32px", height: "32px", color: "#2563eb", margin: "0 auto 12px auto" }} />
            <p style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>
              Loading document...
            </p>
          </div>
        </OrgLayout>
      }
    >
      <PreviewContent params={params} />
    </Suspense>
  );
}
