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

        if (isMounted) {
          setError("Document not found or access denied.");
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
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

  const pdfDownloadUrl =
    docType === "quotation"
      ? `/api/v1/quotations/${id}/pdf`
      : `/api/v1/mous/${id}/pdf`;

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
            <a
              href={pdfDownloadUrl}
              download
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
                textDecoration: "none",
                boxShadow: "0 2px 4px rgba(37,99,235,0.2)",
              }}
            >
              <Download style={{ width: "14px", height: "14px" }} />
              <span>Download PDF</span>
            </a>

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
