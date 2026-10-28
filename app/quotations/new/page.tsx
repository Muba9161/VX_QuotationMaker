"use client";

import React, { useState } from "react";
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
  Trash2,
  SlidersHorizontal,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  CheckCircle2,
  X,
} from "lucide-react";
import { saveOrgDocument, OrgDocument } from "@/lib/orgStorage";

interface ItemRow {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

export default function CreateQuotationPage() {
  const router = useRouter();

  // 1. Basic Details State
  const [quotationNumber, setQuotationNumber] = useState("Q-001");
  const [date, setDate] = useState("28-10-2026");
  const [validTill, setValidTill] = useState("15-11-2026");
  const [clientOrg, setClientOrg] = useState("Tech Solutions Pvt Ltd");
  const [clientContact, setClientContact] = useState("Rohan Sharma");
  const [email, setEmail] = useState("rohan@techsol.com");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [billingAddress, setBillingAddress] = useState(
    "A-123, Sector 62,\nNoida, U.P. 201301"
  );
  const [subjectTitle, setSubjectTitle] = useState(
    "Website Development Quotation"
  );

  // 2. Items & Services State
  const [items, setItems] = useState<ItemRow[]>([
    {
      id: "item-1",
      description: "Website Development",
      quantity: 1,
      unit: "Nos",
      rate: 25000,
      amount: 25000,
    },
    {
      id: "item-2",
      description: "Hosting Setup (1 Year)",
      quantity: 1,
      unit: "Nos",
      rate: 5000,
      amount: 5000,
    },
  ]);
  const [discountPercent, setDiscountPercent] = useState<number>(10);

  // 3. Terms & Notes State
  const [terms, setTerms] = useState(
    `1. Payment: 50% advance, 50% on delivery.\n2. Validity: This quotation is valid for 15 days from the date of issue.\n3. Delivery: Project will be delivered within 4-6 weeks after confirmation.\n4. Support: 3 months free support after delivery.`
  );
  const [notes, setNotes] = useState(
    `Thank you for considering our proposal. We look forward to working with you.\n\nFor any queries, feel free to contact us.\n\nRegards,\nAcme Technologies`
  );

  // 4. Template selection
  const [selectedTemplate, setSelectedTemplate] = useState("Standard Quotation");

  // UI Preview state
  const [zoomScale, setZoomScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Calculations
  const subtotal = items.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const taxableAmount = subtotal - discountAmount;
  const gstRate = 18;
  const gstAmount = Math.round((taxableAmount * gstRate) / 100);
  const total = taxableAmount + gstAmount;

  // Item Handlers
  const handleAddItem = () => {
    const newItem: ItemRow = {
      id: `item-${Date.now()}`,
      description: "New Service Item",
      quantity: 1,
      unit: "Nos",
      rate: 1000,
      amount: 1000,
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (
    id: string,
    field: keyof ItemRow,
    value: string | number
  ) => {
    setItems(
      items.map((it) => {
        if (it.id !== id) return it;
        const updated = { ...it, [field]: value };
        if (field === "quantity" || field === "rate") {
          const qty = field === "quantity" ? Number(value) || 0 : it.quantity;
          const rate = field === "rate" ? Number(value) || 0 : it.rate;
          updated.amount = qty * rate;
        }
        return updated;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      showToast("At least one item is required.");
      return;
    }
    setItems(items.filter((it) => it.id !== id));
  };

  // Save / Generate Handlers
  const handleSaveDraft = () => {
    const docId = `quote-${Date.now()}`;
    const doc: OrgDocument = {
      id: docId,
      docNumber: quotationNumber,
      title: subjectTitle || "Quotation",
      type: "quotation",
      customerName: clientOrg,
      customerAddress: billingAddress,
      date,
      validTill,
      items: items.map((it) => ({
        id: it.id,
        description: it.description,
        quantity: it.quantity,
        unit: it.unit,
        rate: it.rate,
        amount: it.amount,
      })),
      clauses: [],
      subtotal,
      taxRate: gstRate,
      taxAmount: gstAmount,
      discount: discountAmount,
      total,
      paymentTerms: "50% advance, 50% on delivery",
      notes,
      status: "Draft",
      createdAt: date,
      signToken: `token-${docId}`,
      recipients: [
        {
          id: "r-1",
          name: clientContact,
          email,
          role: "Signer",
        },
      ],
    };
    saveOrgDocument(doc);
    showToast(`Draft ${quotationNumber} saved successfully!`);
    setTimeout(() => {
      router.push("/quotations");
    }, 1000);
  };

  const handleGeneratePDF = () => {
    showToast(`Generating and downloading PDF for ${quotationNumber}...`);
    try {
      const printableContent = `QUOTATION ${quotationNumber}
==================================================
Organization: Acme Technologies Pvt Ltd
Client: ${clientOrg}
Contact: ${clientContact} (${email} | ${phone})
Address: ${billingAddress.replace(/\n/g, ", ")}
Date: ${date}
Valid Till: ${validTill}

Subject: ${subjectTitle}

ITEMS & SERVICES:
--------------------------------------------------
${items
  .map(
    (it, idx) =>
      `${idx + 1}. ${it.description} | Qty: ${it.quantity} ${it.unit} | Rate: ₹${it.rate.toLocaleString("en-IN")} | Amount: ₹${it.amount.toLocaleString("en-IN")}`
  )
  .join("\n")}

--------------------------------------------------
Subtotal: ₹${subtotal.toLocaleString("en-IN")}
Discount (${discountPercent}%): ₹${discountAmount.toLocaleString("en-IN")}
GST (${gstRate}%): ₹${gstAmount.toLocaleString("en-IN")}
TOTAL: ₹${total.toLocaleString("en-IN")}
==================================================

Terms & Conditions:
${terms}

Notes:
${notes}

Authorized Signatory
Acme Technologies Pvt Ltd
`;
      const blob = new Blob([printableContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${quotationNumber}_Quotation.txt`;
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
        gap: "22px",
        boxSizing: "border-box",
        minHeight: "820px",
      }}
    >
      {/* 1. Sheet Header: Acme Logo + Company Info */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: "18px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Geometric Triangle Blue Logo */}
          <div
            style={{
              width: "38px",
              height: "38px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              viewBox="0 0 100 100"
              style={{ width: "36px", height: "36px" }}
            >
              <polygon points="50,15 15,85 85,85" fill="#2563eb" />
              <polygon points="50,15 85,85 50,85" fill="#38bdf8" />
              <polygon points="50,45 35,85 65,85" fill="#ffffff" />
            </svg>
          </div>
          <div>
            <div
              style={{
                fontSize: "17px",
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
                fontSize: "12px",
                fontWeight: 600,
                color: "#475569",
                letterSpacing: "0.2px",
              }}
            >
              Technologies
            </div>
          </div>
        </div>

        <div
          style={{
            textAlign: "right",
            fontSize: "10.5px",
            color: "#475569",
            lineHeight: 1.45,
          }}
        >
          <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "11px" }}>
            Acme Technologies Pvt Ltd
          </div>
          <div>A-123, Sector 62, Noida, U.P. 201301</div>
          <div>www.acme.com | info@acme.com</div>
          <div>+91 98765 43210</div>
        </div>
      </div>

      {/* 2. Sheet Title */}
      <div style={{ textAlign: "center", margin: "4px 0" }}>
        <h2
          style={{
            fontSize: "18px",
            fontWeight: 900,
            color: "#0f172a",
            letterSpacing: "1.5px",
            margin: 0,
            textTransform: "uppercase",
          }}
        >
          QUOTATION
        </h2>
      </div>

      {/* 3. Sheet Meta Info (Quotation No & Bill To) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          fontSize: "11px",
          lineHeight: 1.5,
        }}
      >
        <div>
          <div style={{ display: "flex", gap: "8px" }}>
            <span style={{ fontWeight: 700, color: "#0f172a", width: "85px" }}>
              Quotation No:
            </span>
            <span style={{ color: "#334155", fontWeight: 600 }}>
              {quotationNumber}
            </span>
          </div>
          <div style={{ display: "flex", gap: "8px", marginTop: "2px" }}>
            <span style={{ fontWeight: 700, color: "#0f172a", width: "85px" }}>
              Date:
            </span>
            <span style={{ color: "#334155" }}>{date}</span>
          </div>
          <div style={{ display: "flex", gap: "8px", marginTop: "2px" }}>
            <span style={{ fontWeight: 700, color: "#0f172a", width: "85px" }}>
              Valid Till:
            </span>
            <span style={{ color: "#334155" }}>{validTill}</span>
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "2px" }}>
            Bill To:
          </div>
          <div style={{ fontWeight: 600, color: "#1e293b" }}>{clientOrg}</div>
          <div style={{ color: "#64748b", whiteSpace: "pre-line" }}>
            {billingAddress}
          </div>
          <div style={{ color: "#64748b", marginTop: "2px" }}>
            {email}
          </div>
          <div style={{ color: "#64748b" }}>{phone}</div>
        </div>
      </div>

      {/* 4. Sheet Items Table */}
      <div style={{ overflow: "hidden", borderRadius: "6px" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "11px",
            textAlign: "left",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#eff6ff" }}>
              <th
                style={{
                  padding: "8px 10px",
                  fontWeight: 700,
                  color: "#1e293b",
                  width: "28px",
                }}
              >
                #
              </th>
              <th
                style={{
                  padding: "8px 10px",
                  fontWeight: 700,
                  color: "#1e293b",
                }}
              >
                Description
              </th>
              <th
                style={{
                  padding: "8px 10px",
                  fontWeight: 700,
                  color: "#1e293b",
                  textAlign: "center",
                  width: "45px",
                }}
              >
                Qty
              </th>
              <th
                style={{
                  padding: "8px 10px",
                  fontWeight: 700,
                  color: "#1e293b",
                  textAlign: "center",
                  width: "45px",
                }}
              >
                Unit
              </th>
              <th
                style={{
                  padding: "8px 10px",
                  fontWeight: 700,
                  color: "#1e293b",
                  textAlign: "right",
                  width: "75px",
                }}
              >
                Rate (₹)
              </th>
              <th
                style={{
                  padding: "8px 10px",
                  fontWeight: 700,
                  color: "#1e293b",
                  textAlign: "right",
                  width: "80px",
                }}
              >
                Amount (₹)
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr
                key={it.id}
                style={{
                  borderBottom: "1px solid #f1f5f9",
                  backgroundColor: "#ffffff",
                }}
              >
                <td style={{ padding: "8px 10px", color: "#64748b" }}>
                  {idx + 1}
                </td>
                <td
                  style={{
                    padding: "8px 10px",
                    fontWeight: 500,
                    color: "#0f172a",
                  }}
                >
                  {it.description}
                </td>
                <td
                  style={{
                    padding: "8px 10px",
                    textAlign: "center",
                    color: "#475569",
                  }}
                >
                  {it.quantity}
                </td>
                <td
                  style={{
                    padding: "8px 10px",
                    textAlign: "center",
                    color: "#475569",
                  }}
                >
                  {it.unit}
                </td>
                <td
                  style={{
                    padding: "8px 10px",
                    textAlign: "right",
                    color: "#475569",
                  }}
                >
                  {it.rate.toLocaleString("en-IN")}
                </td>
                <td
                  style={{
                    padding: "8px 10px",
                    textAlign: "right",
                    fontWeight: 600,
                    color: "#0f172a",
                  }}
                >
                  {it.amount.toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Summary */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "6px",
          }}
        >
          <div style={{ width: "230px", fontSize: "11px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "3px 8px",
                color: "#475569",
              }}
            >
              <span>Subtotal</span>
              <span style={{ fontWeight: 600, color: "#0f172a" }}>
                ₹{subtotal.toLocaleString("en-IN")}
              </span>
            </div>

            {discountPercent > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "3px 8px",
                  color: "#475569",
                }}
              >
                <span>Discount ({discountPercent}%)</span>
                <span style={{ fontWeight: 600, color: "#0f172a" }}>
                  ₹{discountAmount.toLocaleString("en-IN")}
                </span>
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "3px 8px",
                color: "#475569",
              }}
            >
              <span>GST ({gstRate}%)</span>
              <span style={{ fontWeight: 600, color: "#0f172a" }}>
                ₹{gstAmount.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Total Highlight Bar */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "6px 10px",
                backgroundColor: "#eff6ff",
                borderRadius: "4px",
                marginTop: "4px",
              }}
            >
              <span
                style={{
                  fontWeight: 800,
                  color: "#0f172a",
                  fontSize: "12px",
                }}
              >
                Total
              </span>
              <span
                style={{
                  fontWeight: 900,
                  color: "#2563eb",
                  fontSize: "13px",
                }}
              >
                ₹{total.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Terms & Conditions */}
      <div style={{ fontSize: "10px", color: "#475569", lineHeight: 1.45 }}>
        <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "3px" }}>
          Terms & Conditions:
        </div>
        <div style={{ whiteSpace: "pre-line" }}>{terms}</div>
      </div>

      {/* 6. Notes & Signature Block */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: "20px",
          alignItems: "flex-end",
          paddingTop: "6px",
          fontSize: "10px",
          lineHeight: 1.45,
        }}
      >
        <div>
          <div
            style={{ fontWeight: 700, color: "#0f172a", marginBottom: "3px" }}
          >
            Notes:
          </div>
          <div style={{ whiteSpace: "pre-line", color: "#475569" }}>{notes}</div>
        </div>

        <div style={{ textAlign: "center" }}>
          {/* Cursive Signature Graphic */}
          <div style={{ height: "45px", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <svg viewBox="0 0 160 50" style={{ width: "120px", height: "40px" }}>
              <path
                d="M 10 35 C 30 10, 40 45, 55 20 C 65 5, 75 35, 90 25 C 105 15, 120 40, 145 15"
                fill="transparent"
                stroke="#0f172a"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d="M 40 28 Q 75 42 130 32"
                fill="transparent"
                stroke="#0f172a"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div
            style={{
              borderTop: "1px solid #94a3b8",
              paddingTop: "4px",
              fontWeight: 700,
              color: "#0f172a",
              fontSize: "10.5px",
            }}
          >
            Authorized Signatory
          </div>
          <div style={{ color: "#64748b", fontSize: "10px" }}>
            Acme Technologies Pvt Ltd
          </div>
        </div>
      </div>

      {/* 7. Footer Thank You */}
      <div
        style={{
          textAlign: "center",
          fontSize: "11px",
          color: "#64748b",
          borderTop: "1px solid #f1f5f9",
          paddingTop: "12px",
          marginTop: "auto",
        }}
      >
        Thank you for your business!
      </div>
    </div>
  );

  return (
    <OrgLayout activePath="/quotations">
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
              href="/quotations"
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
                Create Quotation
              </h1>
              <p
                style={{
                  fontSize: "13px",
                  color: "#64748b",
                  margin: "3px 0 0 0",
                }}
              >
                Fill the details, add items and customize the content using the
                editor.
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
                {/* Quotation No, Date, Valid Till */}
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
                      Quotation Number *
                    </label>
                    <input
                      type="text"
                      value={quotationNumber}
                      onChange={(e) => setQuotationNumber(e.target.value)}
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
                    <div style={{ position: "relative" }}>
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
                        }}
                      />
                      <Calendar
                        style={{
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: "15px",
                          height: "15px",
                          color: "#94a3b8",
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
                    <div style={{ position: "relative" }}>
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
                        }}
                      />
                      <Calendar
                        style={{
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: "15px",
                          height: "15px",
                          color: "#94a3b8",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Client / Organization & Client Contact */}
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
                      Client / Organization *
                    </label>
                    <div style={{ position: "relative" }}>
                      <select
                        value={clientOrg}
                        onChange={(e) => setClientOrg(e.target.value)}
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
                        <option value="Tech Solutions Pvt Ltd">
                          Tech Solutions Pvt Ltd
                        </option>
                        <option value="Global Systems">Global Systems</option>
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
                      Client Contact (Optional)
                    </label>
                    <input
                      type="text"
                      value={clientContact}
                      onChange={(e) => setClientContact(e.target.value)}
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

                {/* Email & Phone */}
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
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
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

                {/* Billing Address & Subject / Title */}
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
                      Billing Address
                    </label>
                    <textarea
                      rows={3}
                      value={billingAddress}
                      onChange={(e) => setBillingAddress(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        backgroundColor: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        fontSize: "13px",
                        color: "#0f172a",
                        boxSizing: "border-box",
                        resize: "vertical",
                        lineHeight: 1.4,
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
                      Subject / Title
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
                </div>
              </div>
            </div>

            {/* SECTION 2: ITEMS & SERVICES */}
            <div>
              <h2
                style={{
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#0f172a",
                  margin: "0 0 16px 0",
                }}
              >
                2. Items & Services
              </h2>

              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    textAlign: "left",
                    fontSize: "12.5px",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px solid #e2e8f0",
                        color: "#334155",
                      }}
                    >
                      <th style={{ padding: "8px 6px", width: "24px" }}>#</th>
                      <th style={{ padding: "8px 6px" }}>Description</th>
                      <th style={{ padding: "8px 6px", width: "70px" }}>
                        Quantity
                      </th>
                      <th style={{ padding: "8px 6px", width: "65px" }}>
                        Unit
                      </th>
                      <th style={{ padding: "8px 6px", width: "95px" }}>
                        Rate (₹)
                      </th>
                      <th style={{ padding: "8px 6px", width: "95px" }}>
                        Amount (₹)
                      </th>
                      <th
                        style={{
                          padding: "8px 6px",
                          width: "50px",
                          textAlign: "center",
                        }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => (
                      <tr key={it.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "8px 6px", color: "#64748b" }}>
                          {idx + 1}
                        </td>
                        <td style={{ padding: "8px 6px" }}>
                          <input
                            type="text"
                            value={it.description}
                            onChange={(e) =>
                              handleUpdateItem(
                                it.id,
                                "description",
                                e.target.value
                              )
                            }
                            style={{
                              width: "100%",
                              height: "34px",
                              padding: "0 8px",
                              border: "1px solid #cbd5e1",
                              borderRadius: "6px",
                              fontSize: "12.5px",
                              boxSizing: "border-box",
                            }}
                          />
                        </td>
                        <td style={{ padding: "8px 6px" }}>
                          <input
                            type="number"
                            min="1"
                            value={it.quantity}
                            onChange={(e) =>
                              handleUpdateItem(
                                it.id,
                                "quantity",
                                e.target.value
                              )
                            }
                            style={{
                              width: "100%",
                              height: "34px",
                              padding: "0 8px",
                              border: "1px solid #cbd5e1",
                              borderRadius: "6px",
                              fontSize: "12.5px",
                              boxSizing: "border-box",
                              textAlign: "center",
                            }}
                          />
                        </td>
                        <td style={{ padding: "8px 6px" }}>
                          <input
                            type="text"
                            value={it.unit}
                            onChange={(e) =>
                              handleUpdateItem(it.id, "unit", e.target.value)
                            }
                            style={{
                              width: "100%",
                              height: "34px",
                              padding: "0 8px",
                              border: "1px solid #cbd5e1",
                              borderRadius: "6px",
                              fontSize: "12.5px",
                              boxSizing: "border-box",
                              textAlign: "center",
                            }}
                          />
                        </td>
                        <td style={{ padding: "8px 6px" }}>
                          <input
                            type="number"
                            value={it.rate}
                            onChange={(e) =>
                              handleUpdateItem(it.id, "rate", e.target.value)
                            }
                            style={{
                              width: "100%",
                              height: "34px",
                              padding: "0 8px",
                              border: "1px solid #cbd5e1",
                              borderRadius: "6px",
                              fontSize: "12.5px",
                              boxSizing: "border-box",
                              textAlign: "right",
                            }}
                          />
                        </td>
                        <td style={{ padding: "8px 6px" }}>
                          <input
                            type="text"
                            readOnly
                            value={it.amount.toLocaleString("en-IN")}
                            style={{
                              width: "100%",
                              height: "34px",
                              padding: "0 8px",
                              backgroundColor: "#f8fafc",
                              border: "1px solid #e2e8f0",
                              borderRadius: "6px",
                              fontSize: "12.5px",
                              boxSizing: "border-box",
                              textAlign: "right",
                              fontWeight: 600,
                              color: "#0f172a",
                            }}
                          />
                        </td>
                        <td style={{ padding: "8px 6px", textAlign: "center" }}>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(it.id)}
                            style={{
                              border: "none",
                              backgroundColor: "transparent",
                              color: "#ef4444",
                              cursor: "pointer",
                              padding: "4px",
                              borderRadius: "4px",
                            }}
                          >
                            <Trash2 style={{ width: "15px", height: "15px" }} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Item Button + Calculations Row */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: "16px",
                  marginTop: "16px",
                }}
              >
                <button
                  type="button"
                  onClick={handleAddItem}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "7px 16px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #2563eb",
                    borderRadius: "8px",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: "#2563eb",
                    cursor: "pointer",
                  }}
                >
                  <Plus style={{ width: "14px", height: "14px", strokeWidth: 2.5 }} />
                  <span>Add Item</span>
                </button>

                {/* Right Calculations Box */}
                <div style={{ width: "240px", fontSize: "12.5px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "4px 0",
                      color: "#475569",
                    }}
                  >
                    <span>Subtotal</span>
                    <span style={{ fontWeight: 600, color: "#0f172a" }}>
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "4px 0",
                      color: "#475569",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span>Discount (Optional)</span>
                      <select
                        value={discountPercent}
                        onChange={(e) =>
                          setDiscountPercent(Number(e.target.value))
                        }
                        style={{
                          height: "26px",
                          padding: "0 6px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "4px",
                          fontSize: "11px",
                          backgroundColor: "#ffffff",
                        }}
                      >
                        <option value={0}>0%</option>
                        <option value={5}>5%</option>
                        <option value={10}>10%</option>
                        <option value={15}>15%</option>
                        <option value={20}>20%</option>
                      </select>
                    </div>
                    <span style={{ fontWeight: 600, color: "#0f172a" }}>
                      ₹{discountAmount.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "4px 0",
                      color: "#475569",
                    }}
                  >
                    <span>GST (18%)</span>
                    <span style={{ fontWeight: 600, color: "#0f172a" }}>
                      ₹{gstAmount.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Total Highlight Bar */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 12px",
                      backgroundColor: "#eff6ff",
                      borderRadius: "6px",
                      marginTop: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 800,
                        color: "#0f172a",
                        fontSize: "13.5px",
                      }}
                    >
                      Total
                    </span>
                    <span
                      style={{
                        fontWeight: 900,
                        color: "#2563eb",
                        fontSize: "15px",
                      }}
                    >
                      ₹{total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: TERMS & NOTES */}
            <div>
              <h2
                style={{
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#0f172a",
                  margin: "0 0 16px 0",
                }}
              >
                3. Terms & Notes
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                {/* Terms Box */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#334155",
                      marginBottom: "6px",
                    }}
                  >
                    Terms & Conditions
                  </label>

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
                        gap: "6px",
                        padding: "6px 8px",
                        backgroundColor: "#f8fafc",
                        borderBottom: "1px solid #e2e8f0",
                        fontSize: "11.5px",
                        color: "#475569",
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>Normal ⌄</span>
                      <span style={{ color: "#cbd5e1" }}>|</span>
                      <Bold style={{ width: "13px", height: "13px", cursor: "pointer" }} />
                      <Italic style={{ width: "13px", height: "13px", cursor: "pointer" }} />
                      <Underline style={{ width: "13px", height: "13px", cursor: "pointer" }} />
                      <span style={{ color: "#cbd5e1" }}>|</span>
                      <List style={{ width: "13px", height: "13px", cursor: "pointer" }} />
                      <ListOrdered style={{ width: "13px", height: "13px", cursor: "pointer" }} />
                      <Link2 style={{ width: "13px", height: "13px", cursor: "pointer" }} />
                    </div>

                    <textarea
                      rows={6}
                      value={terms}
                      onChange={(e) => setTerms(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        border: "none",
                        outline: "none",
                        fontSize: "11.5px",
                        color: "#0f172a",
                        boxSizing: "border-box",
                        resize: "vertical",
                        lineHeight: 1.4,
                      }}
                    />
                  </div>
                </div>

                {/* Notes Box */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#334155",
                      marginBottom: "6px",
                    }}
                  >
                    Notes (Optional)
                  </label>

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
                        gap: "6px",
                        padding: "6px 8px",
                        backgroundColor: "#f8fafc",
                        borderBottom: "1px solid #e2e8f0",
                        fontSize: "11.5px",
                        color: "#475569",
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>Normal ⌄</span>
                      <span style={{ color: "#cbd5e1" }}>|</span>
                      <Bold style={{ width: "13px", height: "13px", cursor: "pointer" }} />
                      <Italic style={{ width: "13px", height: "13px", cursor: "pointer" }} />
                      <Underline style={{ width: "13px", height: "13px", cursor: "pointer" }} />
                      <span style={{ color: "#cbd5e1" }}>|</span>
                      <List style={{ width: "13px", height: "13px", cursor: "pointer" }} />
                      <ListOrdered style={{ width: "13px", height: "13px", cursor: "pointer" }} />
                      <Link2 style={{ width: "13px", height: "13px", cursor: "pointer" }} />
                    </div>

                    <textarea
                      rows={6}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        border: "none",
                        outline: "none",
                        fontSize: "11.5px",
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

            {/* SECTION 4: CHOOSE TEMPLATE (OPTIONAL) */}
            <div>
              <h2
                style={{
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#0f172a",
                  margin: "0 0 12px 0",
                }}
              >
                4. Choose Template (Optional)
              </h2>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ position: "relative", width: "240px" }}>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
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
                    <option value="Standard Quotation">Standard Quotation</option>
                    <option value="Modern Corporate">Modern Corporate</option>
                    <option value="Minimalist Professional">
                      Minimalist Professional
                    </option>
                    <option value="Enterprise IT">Enterprise IT</option>
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

                <button
                  type="button"
                  onClick={() =>
                    showToast(`Applied ${selectedTemplate} layout!`)
                  }
                  style={{
                    height: "38px",
                    padding: "0 18px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#2563eb",
                    cursor: "pointer",
                  }}
                >
                  Use Template
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
