"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PDFDocument } from "pdf-lib";
import OrgLayout from "@/components/OrgLayout";
import { notifySuccess } from "@/lib/ui/success-notification";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  Copy,
  Lock,
  FileText,
  Eye,
  CheckCircle2,
} from "lucide-react";
import ClientModal, { ClientData } from "@/components/clients/ClientModal";
import QuotationLineItemTable, { LineItemForm } from "@/components/quotations/QuotationLineItemTable";
import QuotationSummaryCard from "@/components/quotations/QuotationSummaryCard";
import QuotationClientSection from "@/components/quotations/QuotationClientSection";
import QuotationTermsSection from "@/components/quotations/QuotationTermsSection";
import QuotationActionFooter from "@/components/quotations/QuotationActionFooter";
import { calculatePreviewFinancials } from "@/components/quotations/quotation-calc";
import { generateQuotationPdf } from "@/lib/pdf/quotation-pdf";

interface QuotationTemplate {
  id: string;
  title: string;
  type: string;
  category?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  fileUrl?: string | null;
  fileSource?: string | null;
  imageMimeType?: string | null;
  imageFilename?: string | null;
  accentColor?: string;
  paymentTerms?: string | null;
  notes?: string | null;
  termsConditions?: string | null;
  contentSchema?: {
    paymentTerms?: string;
    notes?: string;
    termsConditions?: string;
  } | null;
  items?: Array<{
    description: string;
    defaultQuantity: number;
    unit: string;
    defaultRate: number;
  }>;
  clauses?: Array<{
    title: string;
    content: string;
  }>;
  letterheadConfig?: {
    accentColor?: string;
    headerTagline?: string;
    footerNote?: string;
  } | null;
}

interface QuotationPreviewBranding {
  organization: {
    name: string;
    displayName?: string | null;
    email?: string | null;
    phone?: string | null;
    website?: string | null;
    address?: string | null;
  };
  branding: {
    primaryColor?: string | null;
    logoUrl?: string | null;
  };
  letterhead: {
    letterheadUrl?: string | null;
    mimeType?: string | null;
    applyQuotations?: boolean;
    defaultSignatoryName?: string | null;
    defaultSignatoryTitle?: string | null;
  };
}

function QuotationBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const templateId = searchParams.get("templateId");
  const previousEditId = useRef(editId);

  const [clients, setClients] = useState<ClientData[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [quotationTemplates, setQuotationTemplates] = useState<QuotationTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [isTemplatesLoading, setIsTemplatesLoading] = useState(true);
  const [templateLoadError, setTemplateLoadError] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<QuotationTemplate | null>(null);
  const [previewBranding, setPreviewBranding] = useState<QuotationPreviewBranding | null>(null);
  const [quotationPdfPreviewUrl, setQuotationPdfPreviewUrl] = useState<string | null>(null);
  const [isGeneratingPdfPreview, setIsGeneratingPdfPreview] = useState(false);
  const [pdfPreviewError, setPdfPreviewError] = useState<string | null>(null);

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
  const [paymentTerms, setPaymentTerms] = useState("");
  const [deliveryTerms, setDeliveryTerms] = useState("");
  const [notes, setNotes] = useState("");
  const [termsAndConditions, setTermsAndConditions] = useState("");

  // Line items
  const [items, setItems] = useState<LineItemForm[]>([
    {
      name: "",
      description: "",
      quantity: 1,
      unit: "Nos",
      rate: 0,
      discount: 0,
      taxPercent: 18,
    },
  ]);

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetQuotationForm = useCallback(() => {
    setSelectedClientId("");
    setSelectedTemplateId(null);
    setClientName("");
    setClientCompany("");
    setClientEmail("");
    setClientPhone("");
    setClientAddress("");
    setTitle("");
    setDocNumber(null);
    setIssueDate("");
    setValidTill("");
    setIsFinalized(false);
    setTaxRate(18);
    setDiscountType("none");
    setDiscountValue(0);
    setPaymentTerms("");
    setDeliveryTerms("");
    setNotes("");
    setTermsAndConditions("");
    setItems([
      {
        name: "",
        description: "",
        quantity: 1,
        unit: "Nos",
        rate: 0,
        discount: 0,
        taxPercent: 18,
      },
    ]);
    setQuotationPdfPreviewUrl(null);
    setPdfPreviewError(null);
    setError(null);
  }, []);

  const selectQuotationTemplate = useCallback((template: QuotationTemplate) => {
    setSelectedTemplateId(template.id);
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/v1/templates", {
      credentials: "include",
      cache: "no-store",
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json?.error?.message || "Failed to load saved templates.");
        }
        if (!Array.isArray(json?.data)) {
          throw new Error("The template service returned an invalid response.");
        }
        return json.data as QuotationTemplate[];
      })
      .then((templates) => {
        if (!isMounted) return;
        const availableTemplates = templates.filter((template) => {
          const category = (template.category || template.type).toUpperCase();
          return template.type === "QUOTATION" && category !== "MOU";
        });
        setQuotationTemplates(availableTemplates);

        if (!editId && templateId) {
          const requestedTemplate = availableTemplates.find((template) => template.id === templateId);
          if (requestedTemplate) {
            setSelectedTemplateId(requestedTemplate.id);
          } else {
            setSelectedTemplateId(null);
          }
        }
      })
      .catch((loadError: unknown) => {
        if (!isMounted) return;
        setTemplateLoadError(
          loadError instanceof Error ? loadError.message : "Failed to load saved templates."
        );
      })
      .finally(() => {
        if (isMounted) setIsTemplatesLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [editId, templateId]);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/v1/organization/branding", {
      credentials: "include",
      cache: "no-store",
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json?.error?.message || "Failed to load organization branding.");
        }
        return json?.data as QuotationPreviewBranding;
      })
      .then((branding) => {
        if (isMounted) setPreviewBranding(branding);
      })
      .catch((brandingError: unknown) => {
        if (isMounted) {
          setPdfPreviewError(
            brandingError instanceof Error ? brandingError.message : "Failed to load organization branding."
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (quotationPdfPreviewUrl) URL.revokeObjectURL(quotationPdfPreviewUrl);
    };
  }, [quotationPdfPreviewUrl]);

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
    if (!editId) {
      if (previousEditId.current) resetQuotationForm();
      previousEditId.current = null;
      return;
    }
    previousEditId.current = editId;
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
          setSelectedTemplateId(q.templateId || null);
          setIssueDate(q.issueDate ? q.issueDate.split("T")[0] : "");
          setValidTill(q.validTill ? q.validTill.split("T")[0] : "");
          setDiscountType(q.discountType || "none");
          setDiscountValue(Number(q.discountValue) || 0);
          setTaxRate(Number(q.taxRate) || 18);
          setPaymentTerms(q.paymentTerms || "50% advance, 50% upon delivery");
          setNotes(q.notes || "");
          setTermsAndConditions(q.termsAndConditions || "");
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
  }, [editId, resetQuotationForm]);

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

  const handlePreviewQuotation = async () => {
    if (!previewBranding) {
      setPdfPreviewError("Organization branding is still loading. Please try again.");
      return;
    }

    setPdfPreviewError(null);
    setIsGeneratingPdfPreview(true);

    try {
      const selectedTemplate = quotationTemplates.find((template) => template.id === selectedTemplateId);
      if (selectedTemplate?.fileSource === "UPLOAD_DOCX") {
        throw new Error(
          "Word templates cannot be rendered as quotation previews. Select a PDF or image template instead."
        );
      }
      const selectedUploadedAsset =
        selectedTemplate &&
        (selectedTemplate.fileSource === "UPLOAD_PDF" || selectedTemplate.fileSource === "UPLOAD_IMAGE");
      if (selectedUploadedAsset && !selectedTemplate?.fileUrl) {
        throw new Error("The selected quotation template file is unavailable.");
      }
      const backgroundAssets: Array<{ bytes: ArrayBuffer; mimeType: string }> = [];
      const assetSources = [
        ...(selectedUploadedAsset && selectedTemplate?.fileUrl
          ? [{
              url: selectedTemplate.fileUrl,
              mimeType: selectedTemplate.imageMimeType ||
                (selectedTemplate.fileSource === "UPLOAD_PDF" ? "application/pdf" : "image/png"),
            }]
          : []),
        ...(previewBranding.letterhead.letterheadUrl &&
          previewBranding.letterhead.applyQuotations !== false
          ? [{
              url: previewBranding.letterhead.letterheadUrl,
              mimeType: previewBranding.letterhead.mimeType || "application/pdf",
            }]
          : []),
      ];

      for (const assetSource of assetSources) {
        const assetResponse = await fetch(assetSource.url, {
          credentials: "include",
          cache: "no-store",
        });
        if (!assetResponse.ok) {
          throw new Error("Could not load a selected template or letterhead file for preview.");
        }
        backgroundAssets.push({
          bytes: await assetResponse.arrayBuffer(),
          mimeType: assetSource.mimeType,
        });
      }

      let logoDataUrl: string | null = null;
      const logoUrl =
        selectedTemplate?.imageUrl || previewBranding.branding.logoUrl;
      if (logoUrl) {
        const logoResponse = await fetch(logoUrl, {
          credentials: "include",
          cache: "no-store",
        });
        if (!logoResponse.ok) {
          throw new Error("Could not load the organization logo for preview.");
        }
        let logoBlob = await logoResponse.blob();
        if (!["image/png", "image/jpeg", "image/jpg"].includes(logoBlob.type.toLowerCase())) {
          const bitmap = await createImageBitmap(logoBlob);
          const canvas = document.createElement("canvas");
          canvas.width = bitmap.width;
          canvas.height = bitmap.height;
          const context = canvas.getContext("2d");
          if (!context) throw new Error("Could not prepare the selected template branding image.");
          context.drawImage(bitmap, 0, 0);
          bitmap.close();
          logoBlob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
              (blob) => blob
                ? resolve(blob)
                : reject(new Error("Could not convert the selected template branding image.")),
              "image/png"
            );
          });
        }
        logoDataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Could not read the organization logo."));
          reader.onerror = () => reject(new Error("Could not read the organization logo."));
          reader.readAsDataURL(logoBlob);
        });
      }

      const pdfBytes = generateQuotationPdf({
        quotationNumber: docNumber || "PREVIEW",
        title: title.trim() || "Quotation",
        issueDate: issueDate || new Date().toISOString().slice(0, 10),
        validTill: validTill || null,
        currencySymbol: "₹",
        subtotal: previewFinancials.subtotal,
        discountAmount: previewFinancials.totalDiscount,
        taxRate: Number(taxRate) || 0,
        taxAmount: previewFinancials.calculatedTax,
        grandTotal: previewFinancials.grandTotal,
        paymentTerms,
        deliveryTerms,
        notes,
        termsAndConditions,
        letterheadApplied: backgroundAssets.length > 0,
        templateImageBase64: logoDataUrl,
        templateImageFormat: logoDataUrl?.startsWith("data:image/jpeg") ? "JPEG" : "PNG",
        client: {
          name: clientName.trim() || "Client Name",
          company: clientCompany.trim() || null,
          email: clientEmail.trim() || null,
          phone: clientPhone.trim() || null,
          address: clientAddress.trim() || null,
        },
        organization: {
          name: previewBranding.organization.name,
          displayName: previewBranding.organization.displayName,
          email: previewBranding.organization.email,
          phone: previewBranding.organization.phone,
          website: previewBranding.organization.website,
          address: previewBranding.organization.address,
          primaryColor:
            selectedTemplate?.accentColor ||
            selectedTemplate?.letterheadConfig?.accentColor ||
            previewBranding.branding.primaryColor,
          signatoryName: previewBranding.letterhead.defaultSignatoryName,
          signatoryTitle: previewBranding.letterhead.defaultSignatoryTitle,
        },
        items: items.map((item, index) => ({
          name: item.name || null,
          description: item.description || "Quotation item",
          quantity: Number(item.quantity) || 0,
          unit: item.unit || "Nos",
          rate: Number(item.rate) || 0,
          discount: Number(item.discount) || 0,
          taxPercent: Number(item.taxPercent) || Number(taxRate) || 0,
          amount: previewFinancials.calculatedItems[index]?.taxable || 0,
        })),
      });

      let finalPdfBytes = pdfBytes;
      for (const backgroundAsset of backgroundAssets) {
        const baseDocument = await PDFDocument.load(finalPdfBytes);
        const outputDocument = await PDFDocument.create();
        const embeddedContentPages = await outputDocument.embedPdf(baseDocument, baseDocument.getPageIndices());

        if (backgroundAsset.mimeType.toLowerCase().includes("pdf")) {
          const backgroundDocument = await PDFDocument.load(backgroundAsset.bytes);
          const [backgroundPage] = await outputDocument.embedPdf(backgroundDocument, [0]);
          embeddedContentPages.forEach((contentPage, index) => {
            const { width, height } = baseDocument.getPage(index).getSize();
            const outputPage = outputDocument.addPage([width, height]);
            outputPage.drawPage(backgroundPage, { x: 0, y: 0, width, height });
            outputPage.drawPage(contentPage, { x: 0, y: 0, width, height });
          });
        } else {
          let imageBytes = new Uint8Array(backgroundAsset.bytes);
          let imageMime = backgroundAsset.mimeType;
          if (!["image/png", "image/jpeg", "image/jpg"].includes(imageMime.toLowerCase())) {
            const bitmap = await createImageBitmap(new Blob([imageBytes], { type: imageMime }));
            const canvas = document.createElement("canvas");
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            const context = canvas.getContext("2d");
            if (!context) throw new Error("Could not prepare the selected image template.");
            context.drawImage(bitmap, 0, 0);
            bitmap.close();
            const pngBlob = await new Promise<Blob>((resolve, reject) => {
              canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Could not convert the selected image template.")), "image/png");
            });
            imageBytes = new Uint8Array(await pngBlob.arrayBuffer());
            imageMime = "image/png";
          }
          const embeddedImage = imageMime.toLowerCase().includes("png")
            ? await outputDocument.embedPng(imageBytes)
            : await outputDocument.embedJpg(imageBytes);
          embeddedContentPages.forEach((contentPage, index) => {
            const { width, height } = baseDocument.getPage(index).getSize();
            const outputPage = outputDocument.addPage([width, height]);
            const imageDimensions = embeddedImage.scaleToFit(width, height);
            outputPage.drawImage(embeddedImage, {
              x: (width - imageDimensions.width) / 2,
              y: (height - imageDimensions.height) / 2,
              width: imageDimensions.width,
              height: imageDimensions.height,
            });
            outputPage.drawPage(contentPage, { x: 0, y: 0, width, height });
          });
        }

        finalPdfBytes = await outputDocument.save();
      }

      if (quotationPdfPreviewUrl) URL.revokeObjectURL(quotationPdfPreviewUrl);
      const pdfBlob = new Blob([new Uint8Array(finalPdfBytes)], { type: "application/pdf" });
      setQuotationPdfPreviewUrl(URL.createObjectURL(pdfBlob));
    } catch (previewError: unknown) {
      setPdfPreviewError(
        previewError instanceof Error ? previewError.message : "Could not generate the quotation preview."
      );
    } finally {
      setIsGeneratingPdfPreview(false);
    }
  };

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
        templateId: selectedTemplateId,
        status: isDraft ? "DRAFT" : "SENT",
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
        termsAndConditions,
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

      resetQuotationForm();
      notifySuccess(isEdit ? "Quotation updated successfully." : "Quotation created successfully.");
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

          {/* Section 3: Quotation Template Selection */}
          <section
            style={{
              padding: "20px",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>
                  Available Templates
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b" }}>
                  Select a saved quotation or letterhead design. Your entered quotation details will stay unchanged.
                </p>
              </div>
              {selectedTemplateId && (
                <button
                  type="button"
                  onClick={() => setSelectedTemplateId(null)}
                  style={{ border: 0, background: "transparent", color: "#2563eb", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                >
                  Clear selection
                </button>
              )}
            </div>

            {isTemplatesLoading ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "22px 0", color: "#64748b", fontSize: "12px" }}>
                <Loader2 style={{ width: "16px", height: "16px", color: "#2563eb", animation: "spin 1s linear infinite" }} />
                Loading saved templates...
              </div>
            ) : templateLoadError ? (
              <p role="alert" style={{ margin: "16px 0 0", color: "#b91c1c", fontSize: "12px" }}>
                {templateLoadError}
              </p>
            ) : quotationTemplates.length === 0 ? (
              <div style={{ marginTop: "16px", padding: "18px", borderRadius: "10px", border: "1px dashed #cbd5e1", textAlign: "center", color: "#64748b", fontSize: "12px" }}>
                No saved quotation-compatible templates are available. Upload a quotation or letterhead template in Templates to use it here.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 220px), 1fr))", gap: "12px", marginTop: "16px" }}>
                {quotationTemplates.map((template) => {
                  const isSelected = selectedTemplateId === template.id;
                  return (
                    <div
                      key={template.id}
                      role="button"
                      tabIndex={isFinalized ? -1 : 0}
                      aria-pressed={isSelected}
                      onClick={() => !isFinalized && selectQuotationTemplate(template)}
                      onKeyDown={(event) => {
                        if (!isFinalized && (event.key === "Enter" || event.key === " ")) {
                          event.preventDefault();
                          selectQuotationTemplate(template);
                        }
                      }}
                      style={{
                        overflow: "hidden",
                        borderRadius: "11px",
                        border: isSelected ? "2px solid #2563eb" : "1px solid #e2e8f0",
                        boxShadow: isSelected ? "0 0 0 2px rgba(37,99,235,0.08)" : "none",
                        backgroundColor: "#ffffff",
                        cursor: isFinalized ? "default" : "pointer",
                        outline: "none",
                      }}
                    >
                      <div style={{ height: "104px", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                        {template.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={template.imageUrl} alt={`${template.title} thumbnail`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : template.fileSource === "UPLOAD_PDF" && template.fileUrl ? (
                          <iframe
                            src={`${template.fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                            title={`${template.title} original PDF`}
                            loading="lazy"
                            style={{ width: "100%", height: "100%", border: 0, pointerEvents: "none" }}
                          />
                        ) : template.fileSource === "UPLOAD_IMAGE" && template.fileUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={template.imageUrl || template.fileUrl || ""} alt={`${template.title} original template`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", padding: "10px", boxSizing: "border-box", backgroundColor: "#ffffff", borderTop: `4px solid ${template.accentColor || template.letterheadConfig?.accentColor || "#2563eb"}` }}>
                            <strong style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "10px", color: "#1e293b" }}>{template.title}</strong>
                            <div style={{ height: "1px", margin: "6px 0", backgroundColor: "#e2e8f0" }} />
                            {(template.items || []).slice(0, 2).map((item, index) => (
                              <div key={`${item.description}-${index}`} style={{ display: "flex", justifyContent: "space-between", gap: "6px", marginTop: "5px", fontSize: "8px", color: "#64748b" }}>
                                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.description}</span>
                                <span style={{ flexShrink: 0 }}>{item.unit || "Nos"}</span>
                              </div>
                            ))}
                            {!template.items?.length && <span style={{ fontSize: "8px", color: "#64748b" }}>{(template.category || template.type).replaceAll("_", " ")}</span>}
                          </div>
                        )}
                      </div>
                      <div style={{ padding: "11px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                          <strong style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "12px", color: "#1e293b" }}>
                            {template.title}
                          </strong>
                          {isSelected && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", flexShrink: 0, color: "#2563eb", fontSize: "10px", fontWeight: 700 }}>
                              <CheckCircle2 style={{ width: "12px", height: "12px" }} /> Selected
                            </span>
                          )}
                        </div>
                        <div style={{ marginTop: "4px", fontSize: "10.5px", color: "#64748b" }}>
                          {(template.category || template.type).replaceAll("_", " ")}
                        </div>
                        <div style={{ display: "flex", gap: "7px", marginTop: "10px" }}>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setPreviewTemplate(template);
                            }}
                            style={{ flex: 1, height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "5px", borderRadius: "7px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff", color: "#475569", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}
                          >
                            <Eye style={{ width: "13px", height: "13px" }} /> Preview
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              selectQuotationTemplate(template);
                            }}
                            disabled={isSelected || isFinalized}
                            style={{ flex: 1, height: "32px", borderRadius: "7px", border: "1px solid #2563eb", backgroundColor: isSelected ? "#eff6ff" : "#2563eb", color: isSelected ? "#2563eb" : "#ffffff", fontSize: "11px", fontWeight: 700, cursor: isSelected || isFinalized ? "default" : "pointer" }}
                          >
                            {isSelected ? "Selected" : "Select"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginTop: "18px", paddingTop: "14px", borderTop: "1px solid #e2e8f0" }}>
              <span style={{ color: "#64748b", fontSize: "12px" }}>
                {selectedTemplateId
                  ? `Selected: ${quotationTemplates.find((template) => template.id === selectedTemplateId)?.title || "Template"}`
                  : "No template selected"}
              </span>
              <button
                type="button"
                onClick={handlePreviewQuotation}
                disabled={isGeneratingPdfPreview || isFinalized}
                style={{ height: "36px", padding: "0 14px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "7px", borderRadius: "8px", border: "1px solid #2563eb", backgroundColor: "#2563eb", color: "#ffffff", fontSize: "12px", fontWeight: 700, cursor: isGeneratingPdfPreview || isFinalized ? "not-allowed" : "pointer", opacity: isGeneratingPdfPreview || isFinalized ? 0.7 : 1 }}
              >
                {isGeneratingPdfPreview ? (
                  <Loader2 style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} />
                ) : (
                  <Eye style={{ width: "14px", height: "14px" }} />
                )}
                {isGeneratingPdfPreview ? "Preparing preview..." : "Preview Quotation"}
              </button>
            </div>
            {pdfPreviewError && (
              <p role="alert" style={{ margin: "10px 0 0", color: "#b91c1c", fontSize: "12px" }}>
                {pdfPreviewError}
              </p>
            )}
          </section>

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

      {quotationPdfPreviewUrl && (
        <div
          role="presentation"
          onClick={() => setQuotationPdfPreviewUrl(null)}
          style={{ position: "fixed", inset: 0, zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", backgroundColor: "rgba(15,23,42,0.65)" }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="quotation-preview-title"
            onClick={(event) => event.stopPropagation()}
            style={{ width: "100%", maxWidth: "1000px", height: "min(90vh, 900px)", display: "flex", flexDirection: "column", borderRadius: "14px", overflow: "hidden", backgroundColor: "#ffffff", boxShadow: "0 20px 50px rgba(15,23,42,0.3)" }}
          >
            <div style={{ minHeight: "54px", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", borderBottom: "1px solid #e2e8f0" }}>
              <div>
                <h2 id="quotation-preview-title" style={{ margin: 0, color: "#0f172a", fontSize: "15px", fontWeight: 800 }}>Quotation Preview</h2>
                <p style={{ margin: "3px 0 0", color: "#64748b", fontSize: "11px" }}>Live preview with your current form data and selected design</p>
              </div>
              <button type="button" onClick={() => setQuotationPdfPreviewUrl(null)} aria-label="Close quotation preview" style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff", color: "#475569", fontSize: "18px", cursor: "pointer" }}>×</button>
            </div>
            <iframe
              src={quotationPdfPreviewUrl}
              title="Live quotation PDF preview"
              style={{ width: "100%", flex: 1, border: 0, backgroundColor: "#e2e8f0" }}
            />
          </div>
        </div>
      )}

      {previewTemplate && (
        <div
          role="presentation"
          onClick={() => setPreviewTemplate(null)}
          style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", backgroundColor: "rgba(15,23,42,0.55)" }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="quotation-template-preview-title"
            onClick={(event) => event.stopPropagation()}
            style={{ width: "100%", maxWidth: "620px", maxHeight: "90vh", overflow: "auto", borderRadius: "14px", backgroundColor: "#ffffff", boxShadow: "0 20px 50px rgba(15,23,42,0.25)" }}
          >
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
              <div>
                <h2 id="quotation-template-preview-title" style={{ margin: 0, color: "#0f172a", fontSize: "16px", fontWeight: 800 }}>{previewTemplate.title}</h2>
                <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "12px" }}>{previewTemplate.category || previewTemplate.type}</p>
              </div>
              <button type="button" onClick={() => setPreviewTemplate(null)} aria-label="Close preview" style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff", color: "#475569", fontSize: "18px", cursor: "pointer" }}>×</button>
            </div>
            <div style={{ padding: "20px" }}>
              {previewTemplate.fileSource === "UPLOAD_PDF" && previewTemplate.fileUrl ? (
                <iframe
                  src={`${previewTemplate.fileUrl}#toolbar=0&navpanes=0`}
                  title={`${previewTemplate.title} original PDF`}
                  style={{ display: "block", width: "100%", height: "min(60vh, 620px)", border: "1px solid #e2e8f0", borderRadius: "9px", backgroundColor: "#f8fafc" }}
                />
              ) : previewTemplate.fileSource === "UPLOAD_DOCX" && previewTemplate.fileUrl ? (
                <a href={previewTemplate.fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#2563eb", fontSize: "13px", fontWeight: 700 }}>
                  <FileText style={{ width: "16px", height: "16px" }} /> Open original DOCX template
                </a>
              ) : previewTemplate.imageUrl || previewTemplate.fileSource === "UPLOAD_IMAGE" && previewTemplate.fileUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewTemplate.imageUrl || previewTemplate.fileUrl || ""} alt={`${previewTemplate.title} original template`} style={{ display: "block", width: "100%", maxHeight: "420px", objectFit: "contain", borderRadius: "9px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }} />
              ) : null}
              {previewTemplate.description && <p style={{ margin: "14px 0 0", color: "#475569", fontSize: "13px", lineHeight: 1.5 }}>{previewTemplate.description}</p>}
              {!!previewTemplate.items?.length && (
                <div style={{ marginTop: "14px" }}>
                  <strong style={{ fontSize: "12px", color: "#334155" }}>Saved line items</strong>
                  {previewTemplate.items.map((item, index) => (
                    <div key={`${item.description}-${index}`} style={{ display: "flex", justifyContent: "space-between", gap: "12px", padding: "8px 0", borderBottom: "1px solid #f1f5f9", color: "#475569", fontSize: "12px" }}>
                      <span>{item.description}</span>
                      <span style={{ whiteSpace: "nowrap" }}>{item.defaultQuantity} {item.unit} · ₹{Number(item.defaultRate).toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
              )}
              {!!previewTemplate.clauses?.length && (
                <div style={{ marginTop: "14px" }}>
                  <strong style={{ fontSize: "12px", color: "#334155" }}>Saved clauses</strong>
                  {previewTemplate.clauses.map((clause, index) => (
                    <div key={`${clause.title}-${index}`} style={{ padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                      <strong style={{ display: "block", color: "#334155", fontSize: "12px" }}>{clause.title}</strong>
                      <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "12px", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{clause.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ padding: "12px 20px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button type="button" onClick={() => setPreviewTemplate(null)} style={{ height: "36px", padding: "0 14px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff", color: "#475569", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>Close</button>
              <button type="button" onClick={() => { selectQuotationTemplate(previewTemplate); setPreviewTemplate(null); }} disabled={isFinalized} style={{ height: "36px", padding: "0 14px", borderRadius: "8px", border: "1px solid #2563eb", backgroundColor: "#2563eb", color: "#ffffff", fontSize: "12px", fontWeight: 700, cursor: isFinalized ? "not-allowed" : "pointer" }}>Select Template</button>
            </div>
          </div>
        </div>
      )}

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
