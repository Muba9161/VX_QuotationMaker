"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import OrgLayout from "@/components/OrgLayout";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  FileText,
  Copy,
  Lock,
} from "lucide-react";
import ClientModal, { ClientData } from "@/components/clients/ClientModal";
import QuotationLineItemTable, { LineItemForm } from "@/components/quotations/QuotationLineItemTable";
import QuotationSummaryCard from "@/components/quotations/QuotationSummaryCard";

function QuotationBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [clients, setClients] = useState<ClientData[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  // Client Details Form
  const [clientName, setClientName] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");

  // Quotation Meta
  const [title, setTitle] = useState("");
  const [docNumber, setDocNumber] = useState<string | null>(null);
  const [issueDate, setIssueDate] = useState("");
  const [validTill, setValidTill] = useState("");
  const [isFinalized, setIsFinalized] = useState(false);

  // Financials Configuration
  const [taxRate, setTaxRate] = useState(18);
  const [discountType, setDiscountType] = useState<"percentage" | "fixed" | "none">("none");
  const [discountValue, setDiscountValue] = useState(0);

  // Commercial Terms
  const [paymentTerms, setPaymentTerms] = useState("50% advance, 50% upon delivery");
  const [deliveryTerms, setDeliveryTerms] = useState("Estimated delivery within 15 working days");
  const [notes, setNotes] = useState("Thank you for choosing our services. Valid for 30 days from issue date.");

  // Line items
  const [items, setItems] = useState<LineItemForm[]>([
    {
      name: "",
      description: "Website UI/UX Design & Development",
      quantity: 1,
      unit: "Nos",
      rate: 45000,
      discount: 0,
      taxPercent: 18,
    },
  ]);

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load clients list
  useEffect(() => {
    fetch("/api/v1/clients?limit=100&status=ACTIVE", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data) setClients(json.data);
      })
      .catch(() => {});
  }, []);

  // Load existing quotation if in edit mode
  useEffect(() => {
    if (!editId) return;
    let isMounted = true;
    fetch(`/api/v1/quotations/${editId}`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data && isMounted) {
          const q = json.data;
          setDocNumber(q.docNumber);
          setTitle(q.title || "");
          setClientName(q.clientName || "");
          setClientCompany(q.clientCompany || "");
          setClientEmail(q.clientEmail || "");
          setClientPhone(q.clientPhone || "");
          setClientAddress(q.clientAddress || "");
          setSelectedClientId(q.contactId || "");
          setIssueDate(q.issueDate ? q.issueDate.split("T")[0] : "");
          setValidTill(q.validTill ? q.validTill.split("T")[0] : "");
          setDiscountType(q.discountType || "none");
          setDiscountValue(Number(q.discountValue) || 0);
          setTaxRate(Number(q.taxRate) || 18);
          setPaymentTerms(q.paymentTerms || "50% advance, 50% upon delivery");
          setNotes(q.notes || "");
          if (q.status === "APPROVED" || q.status === "SIGNED") {
            setIsFinalized(true);
          }
          if (Array.isArray(q.items) && q.items.length > 0) {
            setItems(
              q.items.map((i: any) => ({
                name: i.name || "",
                description: i.description || "",
                quantity: Number(i.quantity) || 1,
                unit: i.unit || "Nos",
                rate: Number(i.rate) || 0,
                discount: Number(i.discount) || 0,
                taxPercent: Number(i.taxPercent) ?? Number(q.taxRate) ?? 18,
              }))
            );
          }
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [editId]);

  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
    const found = clients.find((c) => c.id === clientId);
    if (found) {
      setClientName(found.name);
      setClientCompany(found.companyName || "");
      setClientEmail(found.email || "");
      setClientPhone(found.phone || "");
      setClientAddress([found.address, found.city, found.state].filter(Boolean).join(", "));
    }
  };

  // Live calculation preview
  const previewFinancials = useMemo(() => {
    let subtotal = 0;
    let itemDiscounts = 0;
    const calculatedItems: Array<{ lineSub: number; taxable: number }> = [];

    for (const item of items) {
      const q = Math.max(0, Number(item.quantity) || 0);
      const r = Math.max(0, Number(item.rate) || 0);
      const d = Math.max(0, Number(item.discount) || 0);
      const lineSub = q * r;
      const taxable = Math.max(0, lineSub - d);
      subtotal += lineSub;
      itemDiscounts += d;
      calculatedItems.push({ lineSub, taxable });
    }

    const eligibleForOverall = Math.max(0, subtotal - itemDiscounts);
    let overallDiscount = 0;
    if (discountType === "percentage") {
      overallDiscount = eligibleForOverall * (Math.min(100, Math.max(0, discountValue)) / 100);
    } else if (discountType === "fixed") {
      overallDiscount = Math.min(eligibleForOverall, Math.max(0, discountValue));
    }

    const totalDiscount = itemDiscounts + overallDiscount;
    const taxableBase = Math.max(0, subtotal - totalDiscount);
    const calculatedTax = taxableBase * (Math.max(0, taxRate) / 100);
    const grandTotal = taxableBase + calculatedTax;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      totalDiscount: Math.round(totalDiscount * 100) / 100,
      taxableBase: Math.round(taxableBase * 100) / 100,
      calculatedTax: Math.round(calculatedTax * 100) / 100,
      grandTotal: Math.round(grandTotal * 100) / 100,
      calculatedItems,
    };
  }, [items, discountType, discountValue, taxRate]);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        name: "",
        description: "",
        quantity: 1,
        unit: "Nos",
        rate: 0,
        discount: 0,
        taxPercent: taxRate,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof LineItemForm, val: string | number) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleDuplicate = async () => {
    if (!editId) return;
    setIsDuplicating(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/quotations/${editId}/duplicate`, {
        method: "POST",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error?.message || "Failed to duplicate quotation.");
        return;
      }
      router.push(`/quotations/new?edit=${json.data.id}`);
    } catch {
      setError("Network error while duplicating quotation.");
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleSave = async (isDraft: boolean) => {
    setError(null);

    if (isFinalized) {
      setError("This quotation is accepted/signed and cannot be modified directly. Please duplicate it to create a new revision.");
      return;
    }

    if (!title.trim()) {
      setError("Please provide a title for this quotation.");
      return;
    }
    if (!clientName.trim()) {
      setError("Client or recipient name is required.");
      return;
    }
    if (items.length === 0 || items.some((i) => !i.description.trim())) {
      setError("Please provide valid descriptions for all line items.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        contactId: selectedClientId || undefined,
        clientName: clientName.trim(),
        clientCompany: clientCompany.trim() || undefined,
        clientEmail: clientEmail.trim() || undefined,
        clientPhone: clientPhone.trim() || undefined,
        clientAddress: clientAddress.trim() || undefined,
        title: title.trim(),
        issueDate: issueDate || new Date().toISOString().split("T")[0],
        validTill: validTill || undefined,
        discountType,
        discountValue: Number(discountValue) || 0,
        taxRate: Number(taxRate) || 18,
        paymentTerms,
        deliveryTerms,
        notes,
        items: items.map((i, idx) => ({
          name: i.name.trim() || undefined,
          description: i.description.trim(),
          quantity: Number(i.quantity) || 1,
          unit: i.unit || "Nos",
          rate: Number(i.rate) || 0,
          discount: Number(i.discount) || 0,
          taxPercent: Number(i.taxPercent) || taxRate,
          sortOrder: idx,
        })),
      };

      const isEdit = Boolean(editId);
      const url = isEdit ? `/api/v1/quotations/${editId}` : "/api/v1/quotations";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json?.error?.message || "Failed to save quotation.");
        return;
      }

      router.push("/quotations");
    } catch {
      setError("A network error occurred while submitting the quotation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OrgLayout activePath="/quotations">
      <div style={{ maxWidth: "1160px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "22px", paddingBottom: "40px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link
              href="/quotations"
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "10px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff", color: "#475569" }}
            >
              <ArrowLeft style={{ width: "18px", height: "18px" }} />
            </Link>
            <div>
              <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                {editId ? `Edit Quotation ${docNumber ? `(${docNumber})` : ""}` : "Create Quotation"}
              </h1>
              <p style={{ fontSize: "12.5px", color: "#64748b", margin: "2px 0 0 0" }}>
                {editId
                  ? "Update client details, line items, commercial discounts, and tax rates."
                  : "Generate an official itemized quotation with automated pricing calculations."}
              </p>
            </div>
          </div>

          {editId && (
            <button
              type="button"
              onClick={handleDuplicate}
              disabled={isDuplicating}
              style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff", color: "#334155", fontSize: "12.5px", fontWeight: 600, cursor: isDuplicating ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <Copy style={{ width: "14px", height: "14px" }} />
              <span>{isDuplicating ? "Duplicating..." : "Duplicate as New"}</span>
            </button>
          )}
        </div>

        {/* Finalized Warning Banner */}
        {isFinalized && (
          <div style={{ padding: "14px 18px", backgroundColor: "#fffbeb", border: "1px solid #fef3c7", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Lock style={{ width: "18px", height: "18px", color: "#b45309", flexShrink: 0 }} />
              <span style={{ fontSize: "13px", color: "#92400e", fontWeight: 500 }}>
                <strong>Locked Document:</strong> This quotation has already been accepted/signed and cannot be modified directly. You can create an independent clone to make revisions.
              </span>
            </div>
            <button
              type="button"
              onClick={handleDuplicate}
              disabled={isDuplicating}
              style={{ padding: "6px 14px", borderRadius: "8px", backgroundColor: "#b45309", color: "#ffffff", border: "none", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <Copy style={{ width: "13px", height: "13px" }} />
              <span>Duplicate as New Draft</span>
            </button>
          </div>
        )}

        {error && (
          <div style={{ padding: "12px 16px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", color: "#991b1b", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertCircle style={{ width: "16px", height: "16px", flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Section 1: Client & Quotation Meta */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "22px 24px" }}>
            <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", margin: "0 0 16px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              1. Client & Document Details
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
              {/* Client Selection & Details */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Choose Client / Counterparty</label>
                    <button
                      type="button"
                      onClick={() => setIsClientModalOpen(true)}
                      style={{ background: "none", border: "none", color: "#2563eb", fontSize: "11.5px", fontWeight: 600, cursor: "pointer" }}
                    >
                      + New Client
                    </button>
                  </div>
                  <select
                    value={selectedClientId}
                    onChange={(e) => handleSelectClient(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                  >
                    <option value="">-- Choose from client directory or enter below --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.companyName ? `(${c.companyName})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Contact Person *</label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Company / Business Name</label>
                    <input
                      type="text"
                      value={clientCompany}
                      onChange={(e) => setClientCompany(e.target.value)}
                      placeholder="e.g. Acme Tech Solutions"
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Email Address</label>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="contact@client.com"
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Phone Number</label>
                    <input
                      type="text"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Client Billing Address</label>
                  <input
                    type="text"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    placeholder="Floor 4, Cyber City, Gurugram, Haryana"
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              {/* Document Meta */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", backgroundColor: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Quotation Subject / Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Enterprise Cloud Infrastructure Setup"
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", backgroundColor: "#ffffff", boxSizing: "border-box" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Issue Date</label>
                    <input
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", backgroundColor: "#ffffff", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Valid Till (Expiry)</label>
                    <input
                      type="date"
                      value={validTill}
                      onChange={(e) => setValidTill(e.target.value)}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", backgroundColor: "#ffffff", boxSizing: "border-box" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Line Items & Summary */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <QuotationLineItemTable
              items={items}
              calculatedItems={previewFinancials.calculatedItems}
              onAddItem={handleAddItem}
              onRemoveItem={handleRemoveItem}
              onItemChange={handleItemChange}
            />

            <QuotationSummaryCard
              subtotal={previewFinancials.subtotal}
              totalDiscount={previewFinancials.totalDiscount}
              taxableAmount={previewFinancials.taxableBase}
              calculatedTax={previewFinancials.calculatedTax}
              grandTotal={previewFinancials.grandTotal}
              discountType={discountType}
              discountValue={discountValue}
              taxRate={taxRate}
              onDiscountTypeChange={setDiscountType}
              onDiscountValueChange={setDiscountValue}
              onTaxRateChange={setTaxRate}
            />
          </div>

          {/* Section 3: Commercial Terms & Notes */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "22px 24px" }}>
            <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", margin: "0 0 16px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              3. Commercial Terms & Notes
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Payment Terms</label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Delivery / SLA Terms</label>
                <input
                  type="text"
                  value={deliveryTerms}
                  onChange={(e) => setDeliveryTerms(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div style={{ marginTop: "14px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Notes & Commercial Remarks</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
              />
            </div>
          </div>

          {/* Action Footer */}
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "12px" }}>
            <Link
              href="/quotations"
              style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff", color: "#475569", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}
            >
              Cancel
            </Link>

            {/* Save as Draft Button */}
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={loading || isFinalized}
              style={{ padding: "10px 22px", borderRadius: "10px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff", color: "#334155", fontSize: "13px", fontWeight: 700, cursor: loading || isFinalized ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              <FileText style={{ width: "16px", height: "16px", color: "#64748b" }} />
              <span>Save as Draft</span>
            </button>

            {/* Save Quotation Button */}
            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={loading || isFinalized}
              style={{ padding: "10px 26px", borderRadius: "10px", border: "none", backgroundColor: isFinalized ? "#94a3b8" : "#2563eb", color: "#ffffff", fontSize: "13px", fontWeight: 700, cursor: loading || isFinalized ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: "8px", boxShadow: "0 2px 8px rgba(37,99,235,0.25)" }}
            >
              {loading ? (
                <>
                  <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save style={{ width: "16px", height: "16px" }} />
                  <span>{editId ? "Update Quotation" : "Save Quotation"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Add Client Modal */}
      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSaved={(created) => {
          setClients((prev) => [created, ...prev]);
          handleSelectClient(created.id!);
        }}
      />
    </OrgLayout>
  );
}

export default function NewQuotationPage() {
  return (
    <Suspense
      fallback={
        <OrgLayout activePath="/quotations">
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
            <Loader2 style={{ width: "28px", height: "28px", color: "#2563eb", animation: "spin 1s linear infinite" }} />
          </div>
        </OrgLayout>
      }
    >
      <QuotationBuilderContent />
    </Suspense>
  );
}
