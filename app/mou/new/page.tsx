"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import OrgLayout from "@/components/OrgLayout";
import {
  ArrowLeft,
  FileText,
  Eye,
  ArrowRightToLine,
  Calendar,
  ChevronDown,
  Plus,
  SlidersHorizontal,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  ListChecks,
  Link2,
  Image as ImageIcon,
  Table,
  CheckCircle2,
  X,
  Globe,
} from "lucide-react";
import { saveOrgDocument, getOrgDocumentById, OrgDocument } from "@/lib/orgStorage";

const CLAUSE_PRESETS: Record<string, string> = {
  "Agreement Clauses": `1. Purpose of Agreement
The purpose of this Memorandum of Understanding (MOU) is to establish a framework for collaboration between Acme Technologies Pvt Ltd and Global Systems for mutual growth and development.

2. Scope of Collaboration
• Exchange of technical knowledge and expertise
• Joint development of solutions
• Collaboration on research and innovation initiatives
• Exploration of business opportunities

3. Responsibilities of Parties
• Both parties agree to contribute resources, knowledge and support as required.
• Each party shall ensure timely communication and coordination.
• Both parties will work in good faith to achieve the objectives outlined in this MOU.`,

  "Terms & Conditions": `1. Term of Agreement
This MOU shall become effective on the date of signing and shall remain in force for an initial period of 3 years, unless terminated earlier by mutual consent.

2. Non-Exclusivity
This agreement does not restrict either party from entering into similar agreements with other entities.

3. Amendments & Governance
Any modification to this MOU must be made in writing and signed by authorized representatives of both parties.`,

  "Responsibilities": `1. Joint Governance Committee
Both parties agree to establish a joint coordination team to oversee milestone execution and deliverables.

2. Technical Resource Allocation
• Acme Technologies shall provide engineering architecture, cloud infrastructure, and technical oversight.
• Partner organization shall provide domain requirements, validation datasets, and field testing teams.`,

  "Confidentiality": `1. Confidential Information
Each party agrees to maintain strict confidentiality of all proprietary data, trade secrets, software designs, and business information exchanged during the term.

2. Protection & Use
Confidential information shall be used solely for the purposes defined in this agreement and shall not be disclosed to third parties without prior written consent.`,

  "Termination": `1. Termination with Notice
Either party may terminate this MOU by providing a 30-day written notice to the other party.

2. Dispute Resolution
Any dispute arising under this agreement shall be settled amicably through good-faith executive mediation.`,

  "Notes": `1. Operational Notes
• Regular monthly review meetings to be held on the first Monday of each calendar month.
• Key performance indicators (KPIs) to be reviewed bi-annually.
• Direct contact escalation channels established for immediate operational queries.`,
};

// Markdown & Inline Text Formatter
const renderFormattedContent = (content: string) => {
  if (!content) return null;
  const lines = content.split("\n");

  return (
    <>
      {lines.map((line, idx) => {
        const parts: React.ReactNode[] = [];
        const regex =
          /(\*\*.*?\*\*|\*.*?\*|<u>.*?<\/u>|~~.*?~~|\[.*?\]\(.*?\))/g;
        let lastIndex = 0;
        let match;
        let keyIdx = 0;

        while ((match = regex.exec(line)) !== null) {
          const matchStart = match.index;
          const matchText = match[0];

          if (matchStart > lastIndex) {
            parts.push(
              <span key={`text-${idx}-${keyIdx++}`}>
                {line.substring(lastIndex, matchStart)}
              </span>
            );
          }

          if (matchText.startsWith("**") && matchText.endsWith("**")) {
            parts.push(
              <strong
                key={`bold-${idx}-${keyIdx++}`}
                style={{ fontWeight: 700, color: "#0f172a" }}
              >
                {matchText.slice(2, -2)}
              </strong>
            );
          } else if (matchText.startsWith("*") && matchText.endsWith("*")) {
            parts.push(
              <em
                key={`italic-${idx}-${keyIdx++}`}
                style={{ fontStyle: "italic" }}
              >
                {matchText.slice(1, -1)}
              </em>
            );
          } else if (
            matchText.startsWith("<u>") &&
            matchText.endsWith("</u>")
          ) {
            parts.push(
              <u key={`u-${idx}-${keyIdx++}`}>
                {matchText.slice(3, -4)}
              </u>
            );
          } else if (
            matchText.startsWith("~~") &&
            matchText.endsWith("~~")
          ) {
            parts.push(
              <s key={`s-${idx}-${keyIdx++}`}>
                {matchText.slice(2, -2)}
              </s>
            );
          } else if (
            matchText.startsWith("[") &&
            matchText.includes("](") &&
            matchText.endsWith(")")
          ) {
            const splitIdx = matchText.indexOf("](");
            const title = matchText.substring(1, splitIdx);
            const url = matchText.substring(splitIdx + 2, matchText.length - 1);
            parts.push(
              <a
                key={`a-${idx}-${keyIdx++}`}
                href={url}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#2563eb", textDecoration: "underline" }}
              >
                {title}
              </a>
            );
          }

          lastIndex = matchStart + matchText.length;
        }

        if (lastIndex < line.length) {
          parts.push(
            <span key={`end-${idx}-${keyIdx++}`}>
              {line.substring(lastIndex)}
            </span>
          );
        }

        return (
          <div
            key={idx}
            style={{
              minHeight: line.trim() ? "auto" : "0.9em",
              lineHeight: 1.55,
            }}
          >
            {parts.length > 0 ? parts : line || "\u00A0"}
          </div>
        );
      })}
    </>
  );
};

export default function CreateMOUPage() {
  const router = useRouter();

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const datePickerRef = useRef<HTMLInputElement>(null);
  const validTillPickerRef = useRef<HTMLInputElement>(null);

  // 1. Basic Details State
  const [mouNumber, setMouNumber] = useState("MOU-001");
  const [date, setDate] = useState("28-10-2026");
  const [validTill, setValidTill] = useState("28-10-2029");

  const [orgA, setOrgA] = useState("Acme Technologies Pvt Ltd");
  const [orgB, setOrgB] = useState("Global Systems");

  const [contactA, setContactA] = useState("Rahul Sharma");
  const [contactB, setContactB] = useState("Ananya Patel");

  const [emailA, setEmailA] = useState("rahul@acme.com");
  const [emailB, setEmailB] = useState("ananya@globalsys.com");

  const [subjectTitle, setSubjectTitle] = useState("Strategic Collaboration");
  const [purpose, setPurpose] = useState(
    "To establish a framework for collaboration between Acme Technologies and Global Systems for mutual growth and development."
  );

  // 2. MOU Content Editor State
  const [activeTab, setActiveTab] = useState("Agreement Clauses");

  const [agreementContent, setAgreementContent] = useState(`1. Purpose of Agreement
The purpose of this Memorandum of Understanding (MOU) is to establish a framework for collaboration between Acme Technologies Pvt Ltd and Global Systems for mutual growth and development.

2. Scope of Collaboration
• Exchange of technical knowledge and expertise
• Joint development of solutions
• Collaboration on research and innovation initiatives
• Exploration of business opportunities

3. Responsibilities of Parties
• Both parties agree to contribute resources, knowledge and support as required.
• Each party shall ensure timely communication and coordination.
• Both parties will work in good faith to achieve the objectives outlined in this MOU.`);

  // UI Preview state
  const [zoomScale, setZoomScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const partyB = sp.get("partyB") || sp.get("contact");
      const orgBParam = sp.get("orgB");
      const emailBParam = sp.get("emailB");
      if (partyB) setContactB(partyB);
      if (orgBParam) setOrgB(orgBParam);
      if (emailBParam) setEmailB(emailBParam);

      const editId = sp.get("edit");
      if (editId) {
        const found = getOrgDocumentById(editId);
        if (found) {
          setMouNumber(found.docNumber);
          setDate(found.date);
          setValidTill(found.validTill);
          setOrgB(found.customerName);
          setSubjectTitle(found.title);
          showToast(`Loaded ${found.docNumber} for editing`);
        }
      }
    }
  }, []);

  const applyMouFormatting = (
    action:
      | "bold"
      | "italic"
      | "underline"
      | "strike"
      | "bullet"
      | "number"
      | "checks"
      | "link"
      | "image"
      | "table"
      | "heading"
  ) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = agreementContent.substring(start, end);

    let replacement = "";
    let newCursorPos = start;

    switch (action) {
      case "bold":
        replacement = selectedText ? `**${selectedText}**` : "**bold text**";
        newCursorPos = start + replacement.length;
        break;
      case "italic":
        replacement = selectedText ? `*${selectedText}*` : "*italic text*";
        newCursorPos = start + replacement.length;
        break;
      case "underline":
        replacement = selectedText
          ? `<u>${selectedText}</u>`
          : "<u>underlined text</u>";
        newCursorPos = start + replacement.length;
        break;
      case "strike":
        replacement = selectedText
          ? `~~${selectedText}~~`
          : "~~strikethrough text~~";
        newCursorPos = start + replacement.length;
        break;
      case "bullet":
        if (selectedText) {
          replacement = selectedText
            .split("\n")
            .map((l) => (l.startsWith("• ") ? l : `• ${l}`))
            .join("\n");
        } else {
          replacement =
            agreementContent && !agreementContent.endsWith("\n")
              ? "\n• bullet item"
              : "• bullet item";
        }
        newCursorPos = start + replacement.length;
        break;
      case "number":
        if (selectedText) {
          replacement = selectedText
            .split("\n")
            .map((l, i) => `${i + 1}. ${l.replace(/^\d+\.\s*/, "")}`)
            .join("\n");
        } else {
          replacement =
            agreementContent && !agreementContent.endsWith("\n")
              ? "\n1. list item"
              : "1. list item";
        }
        newCursorPos = start + replacement.length;
        break;
      case "checks":
        if (selectedText) {
          replacement = selectedText
            .split("\n")
            .map((l) => (l.startsWith("[ ] ") ? l : `[ ] ${l}`))
            .join("\n");
        } else {
          replacement =
            agreementContent && !agreementContent.endsWith("\n")
              ? "\n[ ] check item"
              : "[ ] check item";
        }
        newCursorPos = start + replacement.length;
        break;
      case "link":
        replacement = selectedText
          ? `[${selectedText}](https://example.com)`
          : "[link text](https://example.com)";
        newCursorPos = start + replacement.length;
        break;
      case "image":
        replacement = selectedText
          ? `![${selectedText}](https://example.com/image.png)`
          : "![Description](https://example.com/image.png)";
        newCursorPos = start + replacement.length;
        break;
      case "table":
        replacement = `\n| Clause | Description | Responsibility |\n|---|---|---|\n| 1.0 | Setup & Scope | Party A |\n| 2.0 | Review & Audit | Party B |\n`;
        newCursorPos = start + replacement.length;
        break;
      case "heading":
        replacement = selectedText
          ? `\n### ${selectedText}\n`
          : `\n### Section Title\n`;
        newCursorPos = start + replacement.length;
        break;
    }

    const updated =
      agreementContent.substring(0, start) +
      replacement +
      agreementContent.substring(end);
    setAgreementContent(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "b" || e.key === "B") {
        e.preventDefault();
        applyMouFormatting("bold");
      } else if (e.key === "i" || e.key === "I") {
        e.preventDefault();
        applyMouFormatting("italic");
      } else if (e.key === "u" || e.key === "U") {
        e.preventDefault();
        applyMouFormatting("underline");
      }
    }
  };

  // Save / Generate Handlers
  const handleSaveDraft = () => {
    const docId = `mou-${Date.now()}`;
    const doc: OrgDocument = {
      id: docId,
      docNumber: mouNumber,
      title: subjectTitle || "Strategic Collaboration",
      type: "mou",
      customerName: orgB,
      customerAddress: "B-45, Sector 18, Gurugram, Haryana 122001",
      date,
      validTill,
      items: [],
      clauses: [
        {
          id: "c-1",
          title: "Agreement Clauses",
          content: agreementContent,
        },
      ],
      subtotal: 0,
      taxRate: 0,
      taxAmount: 0,
      discount: 0,
      total: 0,
      paymentTerms: "Mutual agreement",
      notes: purpose,
      status: "Draft",
      createdAt: date,
      signToken: `token-${docId}`,
      recipients: [
        {
          id: "r-1",
          name: contactB,
          email: emailB,
          role: "Signer",
        },
      ],
    };
    saveOrgDocument(doc);
    showToast(`Draft ${mouNumber} saved successfully!`);
    setTimeout(() => {
      router.push("/mou");
    }, 1000);
  };

  const handleGeneratePDF = () => {
    showToast(`Generating and downloading PDF for ${mouNumber}...`);
    try {
      const printableContent = `MEMORANDUM OF UNDERSTANDING (MOU)
==================================================
MOU Number: ${mouNumber}
Date: ${date}
Valid Till: ${validTill}
Subject: ${subjectTitle}

PARTIES:
--------------------------------------------------
Party A: ${orgA}
Contact: ${contactA} (${emailA})
Address: A-123, Sector 62, Noida, U.P. 201301

Party B: ${orgB}
Contact: ${contactB} (${emailB})
Address: B-45, Sector 18, Gurugram, Haryana 122001

PURPOSE / OBJECTIVE:
--------------------------------------------------
${purpose}

TERMS & CLAUSES:
--------------------------------------------------
${agreementContent}

==================================================
SIGNATURES:

For ${orgA}:
Name: ${contactA} (Org Admin)
Date: ${date}

For ${orgB}:
Name: ${contactB} (Business Head)
Date: ${date}
`;
      const blob = new Blob([printableContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${mouNumber}_MOU.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {}
  };

  // Reusable Document Preview Sheet
  const renderPreviewSheet = () => (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "4px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        border: "1px solid #e2e8f0",
        padding: "36px 40px",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        color: "#1e293b",
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        boxSizing: "border-box",
        minHeight: "840px",
      }}
    >
      {/* 1. Sheet Header: Dual Logos */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #f1f5f9",
          paddingBottom: "16px",
        }}
      >
        {/* Acme Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              viewBox="0 0 100 100"
              style={{ width: "34px", height: "34px" }}
            >
              <polygon points="50,15 15,85 85,85" fill="#2563eb" />
              <polygon points="50,15 85,85 50,85" fill="#38bdf8" />
              <polygon points="50,45 35,85 65,85" fill="#ffffff" />
            </svg>
          </div>
          <div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: 900,
                color: "#0f172a",
                letterSpacing: "-0.3px",
                lineHeight: 1.1,
              }}
            >
              ACME
            </div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#475569",
              }}
            >
              Technologies
            </div>
          </div>
        </div>

        {/* Global Systems Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: "#eff6ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#2563eb",
            }}
          >
            <Globe style={{ width: "22px", height: "22px" }} />
          </div>
          <div>
            <div
              style={{
                fontSize: "15px",
                fontWeight: 800,
                color: "#0f172a",
                lineHeight: 1.1,
              }}
            >
              Global
            </div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#475569",
              }}
            >
              Systems
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sheet Title */}
      <div style={{ textAlign: "center", margin: "2px 0 6px 0" }}>
        <h2
          style={{
            fontSize: "16px",
            fontWeight: 900,
            color: "#0f172a",
            letterSpacing: "1px",
            margin: 0,
            textTransform: "uppercase",
            lineHeight: 1.3,
          }}
        >
          MEMORANDUM OF UNDERSTANDING
        </h2>
        <div
          style={{
            fontSize: "13px",
            fontWeight: 800,
            color: "#0f172a",
            marginTop: "2px",
          }}
        >
          (MOU)
        </div>
      </div>

      {/* 3. Preamble */}
      <div
        style={{
          fontSize: "10.5px",
          color: "#475569",
          lineHeight: 1.5,
        }}
      >
        This Memorandum of Understanding (MOU) is made and entered into on{" "}
        <strong style={{ color: "#0f172a" }}>{date}</strong>, between:
      </div>

      {/* 4. Two Organization Cards Side by Side */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: "12px",
        }}
      >
        {/* Card 1: Org A */}
        <div
          style={{
            backgroundColor: "#f8fafc",
            borderRadius: "8px",
            border: "1px solid #eef2f6",
            padding: "12px 14px",
            fontSize: "10px",
            lineHeight: 1.45,
            color: "#475569",
          }}
        >
          <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "11px", marginBottom: "2px" }}>
            {orgA}
          </div>
          <div>A-123, Sector 62, Noida, U.P. 201301</div>
          <div>Email: {emailA}</div>
          <div>Contact: +91 98765 43210</div>
          <div>Represented by: {contactA} (Org Admin)</div>
        </div>

        {/* AND separator */}
        <div
          style={{
            fontWeight: 800,
            fontSize: "11px",
            color: "#64748b",
            padding: "0 4px",
          }}
        >
          AND
        </div>

        {/* Card 2: Org B */}
        <div
          style={{
            backgroundColor: "#f8fafc",
            borderRadius: "8px",
            border: "1px solid #eef2f6",
            padding: "12px 14px",
            fontSize: "10px",
            lineHeight: 1.45,
            color: "#475569",
          }}
        >
          <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "11px", marginBottom: "2px" }}>
            {orgB}
          </div>
          <div>B-45, Sector 18, Gurugram, Haryana 122001</div>
          <div>Email: {emailB}</div>
          <div>Contact: +91 87654 32109</div>
          <div>Represented by: {contactB} (Business Head)</div>
        </div>
      </div>

      {/* 5. Sections Content */}
      <div
        style={{
          fontSize: "10.5px",
          color: "#334155",
          lineHeight: 1.55,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {renderFormattedContent(agreementContent)}
      </div>

      {/* 6. Signatures Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "40px",
          marginTop: "auto",
          paddingTop: "24px",
          fontSize: "10.5px",
        }}
      >
        <div>
          <div style={{ color: "#475569", marginBottom: "30px" }}>
            For {orgA}
          </div>
          <div
            style={{
              borderTop: "1px solid #94a3b8",
              paddingTop: "4px",
            }}
          >
            <div style={{ fontWeight: 800, color: "#0f172a" }}>{contactA}</div>
            <div style={{ color: "#64748b" }}>Org Admin</div>
            <div style={{ color: "#64748b" }}>{date}</div>
          </div>
        </div>

        <div>
          <div style={{ color: "#475569", marginBottom: "30px" }}>
            For {orgB}
          </div>
          <div
            style={{
              borderTop: "1px solid #94a3b8",
              paddingTop: "4px",
            }}
          >
            <div style={{ fontWeight: 800, color: "#0f172a" }}>{contactB}</div>
            <div style={{ color: "#64748b" }}>Business Head</div>
            <div style={{ color: "#64748b" }}>{date}</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <OrgLayout activePath="/mou">
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
            zIndex: 99999,
          }}
        >
          <CheckCircle2
            style={{ width: "16px", height: "16px", color: "#4ade80" }}
          />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Fullscreen Preview Modal */}
      {isFullscreen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15,23,42,0.6)",
            backdropFilter: "blur(6px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999999,
            padding: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              width: "100%",
              maxWidth: "850px",
              marginBottom: "12px",
            }}
          >
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              style={{
                backgroundColor: "#ffffff",
                border: "none",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              <X style={{ width: "18px", height: "18px", color: "#0f172a" }} />
            </button>
          </div>
          <div
            style={{
              maxWidth: "850px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {renderPreviewSheet()}
          </div>
        </div>
      )}

      <div
        style={{
          width: "100%",
          maxWidth: "1400px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          boxSizing: "border-box",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        }}
      >
        {/* ================= HEADER ROW ================= */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link
              href="/mou"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                color: "#334155",
                textDecoration: "none",
              }}
            >
              <ArrowLeft style={{ width: "18px", height: "18px" }} />
            </Link>
            <div>
              <h1
                style={{
                  fontSize: "22px",
                  fontWeight: 800,
                  color: "#0f172a",
                  margin: 0,
                  letterSpacing: "-0.4px",
                }}
              >
                Create MOU
              </h1>
              <p
                style={{
                  fontSize: "13px",
                  color: "#64748b",
                  margin: "3px 0 0 0",
                }}
              >
                Fill the details and edit the content using the editor.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              onClick={handleSaveDraft}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                height: "38px",
                padding: "0 16px",
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#334155",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <FileText style={{ width: "15px", height: "15px", color: "#2563eb" }} />
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                height: "38px",
                padding: "0 16px",
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#334155",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <Eye style={{ width: "15px", height: "15px", color: "#2563eb" }} />
              <span>Preview</span>
            </button>

            <button
              type="button"
              onClick={handleGeneratePDF}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                height: "38px",
                padding: "0 18px",
                backgroundColor: "#2563eb",
                border: "none",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#ffffff",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(37,99,235,0.28)",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#1d4ed8")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#2563eb")
              }
            >
              <ArrowRightToLine style={{ width: "15px", height: "15px" }} />
              <span>Generate PDF</span>
            </button>
          </div>
        </div>

        {/* ================= MAIN SPLIT: FORM (LEFT) + LIVE PREVIEW (RIGHT) ================= */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.15fr 1fr",
            gap: "24px",
            alignItems: "start",
          }}
        >
          {/* LEFT COLUMN: FORM SECTIONS */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #eef2f6",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "28px",
              boxSizing: "border-box",
            }}
          >
            {/* SECTION 1: BASIC DETAILS */}
            <div>
              <h2
                style={{
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#0f172a",
                  margin: "0 0 16px 0",
                }}
              >
                1. Basic Details
              </h2>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                {/* MOU Number, Date, Valid Till */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.1fr 1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#334155",
                        marginBottom: "4px",
                      }}
                    >
                      MOU Number *
                    </label>
                    <input
                      type="text"
                      value={mouNumber}
                      onChange={(e) => setMouNumber(e.target.value)}
                      style={{
                        width: "100%",
                        height: "38px",
                        padding: "0 12px",
                        backgroundColor: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        fontSize: "13px",
                        color: "#0f172a",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#334155",
                        marginBottom: "4px",
                      }}
                    >
                      Date *
                    </label>
                    <div
                      style={{ position: "relative", cursor: "pointer" }}
                      onClick={() => {
                        try {
                          datePickerRef.current?.showPicker?.();
                        } catch {
                          datePickerRef.current?.focus();
                        }
                      }}
                    >
                      <input
                        type="text"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        style={{
                          width: "100%",
                          height: "38px",
                          padding: "0 34px 0 12px",
                          backgroundColor: "#ffffff",
                          border: "1px solid #cbd5e1",
                          borderRadius: "8px",
                          fontSize: "13px",
                          color: "#0f172a",
                          boxSizing: "border-box",
                          cursor: "text",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Calendar
                        style={{
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: "15px",
                          height: "15px",
                          color: "#64748b",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          try {
                            datePickerRef.current?.showPicker?.();
                          } catch {
                            datePickerRef.current?.focus();
                          }
                        }}
                      />
                      <input
                        ref={datePickerRef}
                        type="date"
                        style={{
                          position: "absolute",
                          opacity: 0,
                          width: "1px",
                          height: "1px",
                          bottom: 0,
                          right: 0,
                          pointerEvents: "none",
                        }}
                        onChange={(e) => {
                          if (e.target.value) {
                            const [year, month, day] = e.target.value.split("-");
                            setDate(`${day}-${month}-${year}`);
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#334155",
                        marginBottom: "4px",
                      }}
                    >
                      Valid Till *
                    </label>
                    <div
                      style={{ position: "relative", cursor: "pointer" }}
                      onClick={() => {
                        try {
                          validTillPickerRef.current?.showPicker?.();
                        } catch {
                          validTillPickerRef.current?.focus();
                        }
                      }}
                    >
                      <input
                        type="text"
                        value={validTill}
                        onChange={(e) => setValidTill(e.target.value)}
                        style={{
                          width: "100%",
                          height: "38px",
                          padding: "0 34px 0 12px",
                          backgroundColor: "#ffffff",
                          border: "1px solid #cbd5e1",
                          borderRadius: "8px",
                          fontSize: "13px",
                          color: "#0f172a",
                          boxSizing: "border-box",
                          cursor: "text",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Calendar
                        style={{
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: "15px",
                          height: "15px",
                          color: "#64748b",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          try {
                            validTillPickerRef.current?.showPicker?.();
                          } catch {
                            validTillPickerRef.current?.focus();
                          }
                        }}
                      />
                      <input
                        ref={validTillPickerRef}
                        type="date"
                        style={{
                          position: "absolute",
                          opacity: 0,
                          width: "1px",
                          height: "1px",
                          bottom: 0,
                          right: 0,
                          pointerEvents: "none",
                        }}
                        onChange={(e) => {
                          if (e.target.value) {
                            const [year, month, day] = e.target.value.split("-");
                            setValidTill(`${day}-${month}-${year}`);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Organization A & Organization B */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#334155",
                        marginBottom: "4px",
                      }}
                    >
                      Organization A *
                    </label>
                    <div style={{ position: "relative" }}>
                      <select
                        value={orgA}
                        onChange={(e) => setOrgA(e.target.value)}
                        style={{
                          width: "100%",
                          height: "38px",
                          padding: "0 32px 0 12px",
                          backgroundColor: "#ffffff",
                          border: "1px solid #cbd5e1",
                          borderRadius: "8px",
                          fontSize: "13px",
                          color: "#0f172a",
                          appearance: "none",
                          boxSizing: "border-box",
                        }}
                      >
                        <option value="Acme Technologies Pvt Ltd">
                          Acme Technologies Pvt Ltd
                        </option>
                      </select>
                      <ChevronDown
                        style={{
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: "14px",
                          height: "14px",
                          color: "#64748b",
                          pointerEvents: "none",
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#334155",
                        marginBottom: "4px",
                      }}
                    >
                      Organization B *
                    </label>
                    <div style={{ position: "relative" }}>
                      <select
                        value={orgB}
                        onChange={(e) => setOrgB(e.target.value)}
                        style={{
                          width: "100%",
                          height: "38px",
                          padding: "0 32px 0 12px",
                          backgroundColor: "#ffffff",
                          border: "1px solid #cbd5e1",
                          borderRadius: "8px",
                          fontSize: "13px",
                          color: "#0f172a",
                          appearance: "none",
                          boxSizing: "border-box",
                        }}
                      >
                        <option value="Global Systems">Global Systems</option>
                        <option value="Tech Solutions Pvt Ltd">
                          Tech Solutions Pvt Ltd
                        </option>
                        <option value="NextGen Digital">NextGen Digital</option>
                        <option value="Innovate India">Innovate India</option>
                        <option value="BrightTech Ltd">BrightTech Ltd</option>
                      </select>
                      <ChevronDown
                        style={{
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: "14px",
                          height: "14px",
                          color: "#64748b",
                          pointerEvents: "none",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Person (Org A) & Contact Person (Org B) */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#334155",
                        marginBottom: "4px",
                      }}
                    >
                      Contact Person (Org A)
                    </label>
                    <input
                      type="text"
                      value={contactA}
                      onChange={(e) => setContactA(e.target.value)}
                      style={{
                        width: "100%",
                        height: "38px",
                        padding: "0 12px",
                        backgroundColor: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        fontSize: "13px",
                        color: "#0f172a",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#334155",
                        marginBottom: "4px",
                      }}
                    >
                      Contact Person (Org B)
                    </label>
                    <input
                      type="text"
                      value={contactB}
                      onChange={(e) => setContactB(e.target.value)}
                      style={{
                        width: "100%",
                        height: "38px",
                        padding: "0 12px",
                        backgroundColor: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        fontSize: "13px",
                        color: "#0f172a",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                {/* Email (Org A) & Email (Org B) */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#334155",
                        marginBottom: "4px",
                      }}
                    >
                      Email (Org A)
                    </label>
                    <input
                      type="email"
                      value={emailA}
                      onChange={(e) => setEmailA(e.target.value)}
                      style={{
                        width: "100%",
                        height: "38px",
                        padding: "0 12px",
                        backgroundColor: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        fontSize: "13px",
                        color: "#0f172a",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#334155",
                        marginBottom: "4px",
                      }}
                    >
                      Email (Org B)
                    </label>
                    <input
                      type="email"
                      value={emailB}
                      onChange={(e) => setEmailB(e.target.value)}
                      style={{
                        width: "100%",
                        height: "38px",
                        padding: "0 12px",
                        backgroundColor: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        fontSize: "13px",
                        color: "#0f172a",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                {/* Subject / Title & Purpose / Objective */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#334155",
                        marginBottom: "4px",
                      }}
                    >
                      Subject / Title *
                    </label>
                    <input
                      type="text"
                      value={subjectTitle}
                      onChange={(e) => setSubjectTitle(e.target.value)}
                      style={{
                        width: "100%",
                        height: "38px",
                        padding: "0 12px",
                        backgroundColor: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        fontSize: "13px",
                        color: "#0f172a",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#334155",
                        marginBottom: "4px",
                      }}
                    >
                      Purpose / Objective
                    </label>
                    <textarea
                      rows={3}
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        backgroundColor: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        fontSize: "12.5px",
                        color: "#0f172a",
                        boxSizing: "border-box",
                        resize: "vertical",
                        lineHeight: 1.4,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: MOU CONTENT (EDITOR) */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
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
                  2. MOU Content (Editor)
                </h2>

                <button
                  type="button"
                  onClick={() => {
                    setAgreementContent(CLAUSE_PRESETS["Agreement Clauses"]);
                    showToast("Loaded standard MOU clauses template!");
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 14px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: "#2563eb",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f8fafc")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#ffffff")
                  }
                >
                  <FileText style={{ width: "13px", height: "13px" }} />
                  <span>Use Template</span>
                </button>
              </div>

              {/* Clause Tabs */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  flexWrap: "wrap",
                  marginBottom: "12px",
                }}
              >
                {[
                  "Agreement Clauses",
                  "Terms & Conditions",
                  "Responsibilities",
                  "Confidentiality",
                  "Termination",
                  "Notes",
                ].map((tab) => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab);
                        if (CLAUSE_PRESETS[tab]) {
                          setAgreementContent(CLAUSE_PRESETS[tab]);
                          showToast(`Loaded "${tab}" template!`);
                        }
                      }}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: isActive ? 700 : 500,
                        backgroundColor: isActive ? "#2563eb" : "#f1f5f9",
                        color: isActive ? "#ffffff" : "#475569",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>

              {/* Rich Editor Box */}
              <div
                style={{
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                {/* Rich Editor Toolbar */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "6px 10px",
                    backgroundColor: "#f8fafc",
                    borderBottom: "1px solid #e2e8f0",
                    fontSize: "12px",
                    color: "#475569",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    title="Insert Section Heading"
                    onClick={() => applyMouFormatting("heading")}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#334155",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#e2e8f0")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    Heading 1 ⌄
                  </button>

                  <span style={{ color: "#cbd5e1", margin: "0 2px" }}>|</span>

                  <button
                    type="button"
                    title="Bold (Ctrl+B)"
                    onClick={() => applyMouFormatting("bold")}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: "4px 6px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      color: "#334155",
                      display: "flex",
                      alignItems: "center",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#e2e8f0")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <Bold style={{ width: "14px", height: "14px" }} />
                  </button>

                  <button
                    type="button"
                    title="Italic (Ctrl+I)"
                    onClick={() => applyMouFormatting("italic")}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: "4px 6px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      color: "#334155",
                      display: "flex",
                      alignItems: "center",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#e2e8f0")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <Italic style={{ width: "14px", height: "14px" }} />
                  </button>

                  <button
                    type="button"
                    title="Underline (Ctrl+U)"
                    onClick={() => applyMouFormatting("underline")}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: "4px 6px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      color: "#334155",
                      display: "flex",
                      alignItems: "center",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#e2e8f0")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <Underline style={{ width: "14px", height: "14px" }} />
                  </button>

                  <button
                    type="button"
                    title="Strikethrough"
                    onClick={() => applyMouFormatting("strike")}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: "4px 6px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      color: "#334155",
                      display: "flex",
                      alignItems: "center",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#e2e8f0")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <Strikethrough style={{ width: "14px", height: "14px" }} />
                  </button>

                  <span style={{ color: "#cbd5e1", margin: "0 2px" }}>|</span>

                  <button
                    type="button"
                    title="Bullet List"
                    onClick={() => applyMouFormatting("bullet")}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: "4px 6px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      color: "#334155",
                      display: "flex",
                      alignItems: "center",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#e2e8f0")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <List style={{ width: "14px", height: "14px" }} />
                  </button>

                  <button
                    type="button"
                    title="Numbered List"
                    onClick={() => applyMouFormatting("number")}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: "4px 6px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      color: "#334155",
                      display: "flex",
                      alignItems: "center",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#e2e8f0")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <ListOrdered style={{ width: "14px", height: "14px" }} />
                  </button>

                  <button
                    type="button"
                    title="Checklist Item"
                    onClick={() => applyMouFormatting("checks")}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: "4px 6px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      color: "#334155",
                      display: "flex",
                      alignItems: "center",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#e2e8f0")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <ListChecks style={{ width: "14px", height: "14px" }} />
                  </button>

                  <span style={{ color: "#cbd5e1", margin: "0 2px" }}>|</span>

                  <button
                    type="button"
                    title="Insert Link"
                    onClick={() => applyMouFormatting("link")}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: "4px 6px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      color: "#334155",
                      display: "flex",
                      alignItems: "center",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#e2e8f0")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <Link2 style={{ width: "14px", height: "14px" }} />
                  </button>

                  <button
                    type="button"
                    title="Insert Image"
                    onClick={() => applyMouFormatting("image")}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: "4px 6px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      color: "#334155",
                      display: "flex",
                      alignItems: "center",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#e2e8f0")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <ImageIcon style={{ width: "14px", height: "14px" }} />
                  </button>

                  <button
                    type="button"
                    title="Insert Table"
                    onClick={() => applyMouFormatting("table")}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: "4px 6px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      color: "#334155",
                      display: "flex",
                      alignItems: "center",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#e2e8f0")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <Table style={{ width: "14px", height: "14px" }} />
                  </button>

                  <span style={{ color: "#cbd5e1", margin: "0 2px" }}>|</span>

                  <button
                    type="button"
                    title="Preview Fullscreen"
                    onClick={() => setIsFullscreen(true)}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: "4px 6px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      color: "#334155",
                      display: "flex",
                      alignItems: "center",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#e2e8f0")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <Maximize2 style={{ width: "13px", height: "13px" }} />
                  </button>
                </div>

                <textarea
                  ref={editorRef}
                  rows={13}
                  value={agreementContent}
                  onChange={(e) => setAgreementContent(e.target.value)}
                  onKeyDown={handleEditorKeyDown}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: "none",
                    outline: "none",
                    fontSize: "12px",
                    color: "#0f172a",
                    boxSizing: "border-box",
                    resize: "vertical",
                    lineHeight: 1.55,
                    fontFamily:
                      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  }}
                />
              </div>

              {/* Add Section Button */}
              <div style={{ marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setAgreementContent(
                      (prev) =>
                        prev +
                        `\n\n4. Additional Clause\n• Detail provision for mutual alignment and governance.`
                    );
                    showToast("Added new clause section!");
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "7px 16px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: "#2563eb",
                    cursor: "pointer",
                  }}
                >
                  <Plus style={{ width: "14px", height: "14px", strokeWidth: 2.5 }} />
                  <span>Add Section</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: DOCUMENT PREVIEW */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Document Preview Controls Bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "2px 4px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                <SlidersHorizontal style={{ width: "16px", height: "16px", color: "#64748b" }} />
                <span>Document Preview</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 8px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "12px",
                    color: "#475569",
                    cursor: "pointer",
                  }}
                >
                  <span>Page 1</span>
                  <ChevronDown style={{ width: "12px", height: "12px" }} />
                </div>

                <button
                  type="button"
                  onClick={() => setZoomScale(Math.max(0.8, zoomScale - 0.1))}
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    padding: "4px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#64748b",
                  }}
                >
                  <ZoomOut style={{ width: "14px", height: "14px" }} />
                </button>

                <button
                  type="button"
                  onClick={() => setZoomScale(Math.min(1.2, zoomScale + 0.1))}
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    padding: "4px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#64748b",
                  }}
                >
                  <ZoomIn style={{ width: "14px", height: "14px" }} />
                </button>

                <button
                  type="button"
                  onClick={() => setIsFullscreen(true)}
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    padding: "4px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#64748b",
                  }}
                >
                  <Maximize2 style={{ width: "14px", height: "14px" }} />
                </button>
              </div>
            </div>

            {/* Live Interactive A4 Sheet */}
            <div
              style={{
                transform: `scale(${zoomScale})`,
                transformOrigin: "top left",
                transition: "transform 0.15s ease",
              }}
            >
              {renderPreviewSheet()}
            </div>
          </div>
        </div>
      </div>
    </OrgLayout>
  );
}
