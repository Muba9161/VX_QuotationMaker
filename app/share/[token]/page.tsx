"use client";

import React, { useState, useEffect, use } from "react";
import PublicShareHeader from "@/components/share/PublicShareHeader";
import PublicOtpGate from "@/components/share/PublicOtpGate";
import PublicDocumentViewer, { PublicDocPayload } from "@/components/share/PublicDocumentViewer";
import PublicSigningModal from "@/components/share/PublicSigningModal";
import PublicDeclineModal from "@/components/share/PublicDeclineModal";
import { ShieldAlert, Clock, FileX } from "lucide-react";

interface PublicShareData {
  status: string;
  requiresOtp?: boolean;
  recipientName?: string;
  recipientEmailMasked?: string;
  docNumber?: string;
  share?: {
    id: string;
    recipientName: string;
    recipientEmail: string;
    recipientRole: string;
    signingOrder: number;
    allowDownload: boolean;
    expiresAt: string;
    status?: string;
    customMessage?: string | null;
  };
  organization: {
    name: string;
    logoUrl?: string | null;
    primaryColor?: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    gstNumber?: string | null;
  };
  document?: PublicDocPayload;
  signatures?: Array<{
    id: string;
    signerName: string;
    signerEmail: string;
    signerRole: string;
    signatureType: string;
    signatureData: string;
    createdAt: string;
    consentAcceptedAt?: string;
  }>;
}

function ShareContent({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PublicShareData | null>(null);
  const [errorType, setErrorType] = useState<"REVOKED" | "EXPIRED" | "NOT_FOUND" | "GENERIC" | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);

  const fetchDocument = async () => {
    setLoading(true);
    setErrorType(null);
    try {
      const res = await fetch(`/api/v1/public/shares/${token}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorType(json.error === "REVOKED" ? "REVOKED" : json.error === "EXPIRED" ? "EXPIRED" : "NOT_FOUND");
        setErrorMessage(json.message || "Unable to access document.");
      } else {
        setData(json);
      }
    } catch {
      setErrorType("GENERIC");
      setErrorMessage("Network error connecting to document portal.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, [token]);

  const handleDownload = () => {
    window.location.href = `/api/v1/public/shares/${token}/download`;
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "36px", height: "36px", border: "3px solid #e2e8f0", borderTopColor: "#2563eb", borderRadius: "50%", margin: "0 auto 16px auto", animation: "spin 1s linear infinite" }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "#64748b" }}>Loading secure document...</div>
        </div>
      </div>
    );
  }

  // Error State: Revoked / Expired / Invalid
  if (errorType || !data) {
    const isRevoked = errorType === "REVOKED";
    const isExpired = errorType === "EXPIRED";
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc", padding: "20px" }}>
        <div style={{ maxWidth: "480px", width: "100%", backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "36px 28px", textAlign: "center", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)" }}>
          <div style={{ width: "54px", height: "54px", borderRadius: "50%", backgroundColor: isRevoked ? "#fef2f2" : isExpired ? "#fefce8" : "#f1f5f9", color: isRevoked ? "#dc2626" : isExpired ? "#ca8a04" : "#64748b", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
            {isRevoked ? <FileX style={{ width: "26px", height: "26px" }} /> : isExpired ? <Clock style={{ width: "26px", height: "26px" }} /> : <ShieldAlert style={{ width: "26px", height: "26px" }} />}
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: "0 0 8px 0" }}>
            {isRevoked ? "Document Link Revoked" : isExpired ? "Document Link Expired" : "Document Not Available"}
          </h2>
          <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.5, margin: "0 0 24px 0" }}>
            {errorMessage}
          </p>
          <div style={{ fontSize: "12px", color: "#94a3b8" }}>
            Please contact the sender if you believe this is an error.
          </div>
        </div>
      </div>
    );
  }

  // OTP Gate
  if (data.requiresOtp) {
    return (
      <PublicOtpGate
        token={token}
        recipientName={data.recipientName || "Recipient"}
        recipientEmailMasked={data.recipientEmailMasked || "***@***"}
        organizationName={data.organization.name}
        docNumber={data.docNumber || "Document"}
        onVerified={fetchDocument}
      />
    );
  }

  if (!data.document || !data.share) {
    return null;
  }

  const isFullySigned = data.document.status === "SIGNED";
  const hasAlreadySigned = data.share.status === "COMPLETED";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <PublicShareHeader
        organizationName={data.organization.name}
        logoUrl={data.organization.logoUrl}
        primaryColor={data.organization.primaryColor}
        docNumber={data.document.docNumber}
        docTitle={data.document.title}
        docType={data.document.type}
        status={data.document.status}
        allowDownload={data.share.allowDownload}
        onDownload={handleDownload}
        onOpenSignModal={() => setIsSignModalOpen(true)}
        onOpenDeclineModal={() => setIsDeclineModalOpen(true)}
        isFullySigned={isFullySigned}
        hasAlreadySigned={hasAlreadySigned}
      />

      <main style={{ padding: "16px 20px 48px 20px" }}>
        <PublicDocumentViewer
          document={data.document}
          organization={data.organization}
          signatures={data.signatures}
        />
      </main>

      <PublicSigningModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        token={token}
        defaultName={data.share.recipientName}
        defaultEmail={data.share.recipientEmail}
        docNumber={data.document.docNumber}
        onSignedSuccessfully={fetchDocument}
      />

      <PublicDeclineModal
        isOpen={isDeclineModalOpen}
        onClose={() => setIsDeclineModalOpen(false)}
        token={token}
        docNumber={data.document.docNumber}
        onDeclinedSuccessfully={fetchDocument}
      />
    </div>
  );
}

export default function PublicSharePage({ params }: { params: Promise<{ token: string }> }) {
  return (
    <React.Suspense
      fallback={
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc" }}>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "#64748b" }}>Loading secure document...</div>
        </div>
      }
    >
      <ShareContent params={params} />
    </React.Suspense>
  );
}
