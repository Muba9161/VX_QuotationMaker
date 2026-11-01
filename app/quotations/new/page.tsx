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
import QuotationClientSection from "@/components/quotations/QuotationClientSection";
import QuotationTermsSection from "@/components/quotations/QuotationTermsSection";
import QuotationActionFooter from "@/components/quotations/QuotationActionFooter";
import { calculatePreviewFinancials } from "@/components/quotations/quotation-calc";

function QuotationBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const templateId = searchParams.get("templateId");

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

  // Load template if templateId is provided in URL
  useEffect(() => {
    if (!templateId || editId) return;
    let isMounted = true;
    fetch(`/api/v1/templates/${encodeURIComponent(templateId)}`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data && isMounted) {
          const tmpl = json.data;
          if (tmpl.title) setTitle(tmpl.title);
          const pTerms = tmpl.paymentTerms || tmpl.contentSchema?.paymentTerms;
          if (pTerms) setPaymentTerms(pTerms);
          const tNotes = tmpl.notes || tmpl.contentSchema?.notes;
          if (tNotes) setNotes(tNotes);

          if (Array.isArray(tmpl.items) && tmpl.items.length > 0) {
            setItems(
              tmpl.items.map((i: any) => ({
                name: i.name || "",
                description: i.description || "",
                quantity: Number(i.defaultQuantity) || 1,
                unit: i.unit || "Nos",
                rate: Number(i.defaultRate) || 0,
                discount: 0,
                taxPercent: taxRate,
              }))
            );
          }
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [templateId, editId, taxRate]);

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
    return calculatePreviewFinancials(items, discountType, discountValue, taxRate);
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

          {!editId && (
            <Link
              href="/templates?category=QUOTATION"
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                backgroundColor: "#ffffff",
                color: "#334155",
                fontSize: "12.5px",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                textDecoration: "none"
              }}
            >
              <FileText style={{ width: "14px", height: "14px", color: "#2563eb" }} />
              <span>Choose Template</span>
            </Link>
          )}

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
          <QuotationClientSection
            clients={clients}
            selectedClientId={selectedClientId}
            onSelectClient={handleSelectClient}
            onOpenClientModal={() => setIsClientModalOpen(true)}
            clientName={clientName}
            onClientNameChange={setClientName}
            clientCompany={clientCompany}
            onClientCompanyChange={setClientCompany}
            clientEmail={clientEmail}
            onClientEmailChange={setClientEmail}
            clientPhone={clientPhone}
            onClientPhoneChange={setClientPhone}
            clientAddress={clientAddress}
            onClientAddressChange={setClientAddress}
            title={title}
            onTitleChange={setTitle}
            issueDate={issueDate}
            onIssueDateChange={setIssueDate}
            validTill={validTill}
            onValidTillChange={setValidTill}
          />

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
          <QuotationTermsSection
            paymentTerms={paymentTerms}
            onPaymentTermsChange={setPaymentTerms}
            deliveryTerms={deliveryTerms}
            onDeliveryTermsChange={setDeliveryTerms}
            notes={notes}
            onNotesChange={setNotes}
          />

          {/* Action Footer */}
          <QuotationActionFooter
            editId={editId}
            loading={loading}
            isFinalized={isFinalized}
            onSave={handleSave}
          />
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
