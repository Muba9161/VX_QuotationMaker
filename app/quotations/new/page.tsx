"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import OrgLayout from "@/components/OrgLayout";
import { ArrowLeft, Plus, Trash2, Save, Eye, FileDown, Calendar, FileText, CheckCircle2 } from "lucide-react";
import { saveOrgDocument, OrgDocument, OrgDocumentItem } from "@/lib/orgStorage";

export default function QuotationBuilderPage() {
  const router = useRouter();

  const [activeSubStep, setActiveSubStep] = useState("Quotations");
  const subSteps = ["Basic Details", "Quotations", "Terms & Conditions", "Notes & Attachments"];

  const [docNumber, setDocNumber] = useState("Q-001");
  const [date, setDate] = useState("28-10-2026");
  const [validTill, setValidTill] = useState("28-11-2026");
  const [customerName, setCustomerName] = useState("Tech Solutions Pvt Ltd");
  const [customerAddress, setCustomerAddress] = useState("A-123, Sector 62, Noida, U.P. 201301");
  const [paymentTerms, setPaymentTerms] = useState("50% advance, 50% on delivery");
  const [notes, setNotes] = useState("Thank you for your business.");

  const [items, setItems] = useState<OrgDocumentItem[]>([
    { id: "i-1", description: "Website Development", quantity: 1, unit: "Nos", rate: 25000, amount: 25000 },
    { id: "i-2", description: "Hosting Setup", quantity: 1, unit: "Nos", rate: 5000, amount: 5000 },
  ]);

  const [discount, setDiscount] = useState(0);

  const addItem = () => {
    const newItem: OrgDocumentItem = {
      id: "i-" + Date.now(),
      description: "Additional Service",
      quantity: 1,
      unit: "Nos",
      rate: 1000,
      amount: 1000,
    };
    setItems([...items, newItem]);
  };

  const updateItem = (index: number, field: keyof OrgDocumentItem, val: any) => {
    const copy = [...items];
    copy[index] = { ...copy[index], [field]: val };
    if (field === "quantity" || field === "rate") {
      copy[index].amount = Number(copy[index].quantity) * Number(copy[index].rate);
    }
    setItems(copy);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((acc, it) => acc + (it.amount || 0), 0);
  const gstRate = 18;
  const gstAmount = Math.round((subtotal * gstRate) / 100);
  const total = subtotal + gstAmount - discount;

  const handleSave = (status: 'Draft' | 'Sent') => {
    const docId = "doc-" + Date.now();
    const doc: OrgDocument = {
      id: docId,
      docNumber,
      title: items[0]?.description || "Quotation",
      type: "quotation",
      customerName,
      customerAddress,
      date,
      validTill,
      items,
      clauses: [],
      subtotal,
      taxRate: gstRate,
      taxAmount: gstAmount,
      discount,
      total,
      paymentTerms,
      notes,
      status,
      createdAt: "28 Oct 2026",
      signToken: "token-" + docId,
      recipients: [
        { id: "r-1", name: "Customer Signer", email: "client@example.com", role: "Signer" },
      ],
    };
    saveOrgDocument(doc);
    router.push(`/preview/${docId}`);
  };

  return (
    <OrgLayout activePath="/quotations/new">
      <div className="space-y-6 max-w-7xl mx-auto font-sans">
        {/* Top Header matching Screen 4 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Link href="/documents" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Create Quotation</h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleSave("Draft")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 rounded-lg shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>
            <button
              onClick={() => handleSave("Draft")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 rounded-lg shadow-xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => handleSave("Sent")}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Generate PDF</span>
            </button>
          </div>
        </div>

        {/* 3-Column Layout: Left Sub-Steps Nav, Center Form, Right Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Col 1: Left Mini-Step Sidebar (Screen 4) */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-2 shadow-xs space-y-1">
            {subSteps.map((step) => (
              <button
                key={step}
                onClick={() => setActiveSubStep(step)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                  activeSubStep === step
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <span>{step}</span>
                {activeSubStep === step && <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
              </button>
            ))}
          </div>

          {/* Col 2: Center Main Form (Basic Details + Items & Services) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Basic Details */}
            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Basic Details</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Quotation Number</label>
                  <input
                    type="text"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50"
                    />
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Valid Till</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={validTill}
                      onChange={(e) => setValidTill(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50"
                    />
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Customer Address</label>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Items & Services */}
            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Items & Services</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-3 w-8">#</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 w-20">Quantity</th>
                      <th className="py-2.5 px-3 w-16">Unit</th>
                      <th className="py-2.5 px-3 w-24">Rate (₹)</th>
                      <th className="py-2.5 px-3 w-24">Amount (₹)</th>
                      <th className="py-2.5 px-3 w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((it, idx) => (
                      <tr key={it.id}>
                        <td className="py-3 px-3 text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-3">
                          <input
                            type="text"
                            value={it.description}
                            onChange={(e) => updateItem(idx, "description", e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="number"
                            value={it.quantity}
                            onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))}
                            className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-center"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="text"
                            value={it.unit}
                            onChange={(e) => updateItem(idx, "unit", e.target.value)}
                            className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-center"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="number"
                            value={it.rate}
                            onChange={(e) => updateItem(idx, "rate", Number(e.target.value))}
                            className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-right"
                          />
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-900 text-right">
                          {(it.amount || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={addItem}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>
          </div>

          {/* Col 3: Right Summary Column (Summary, Payment Terms, Notes) */}
          <div className="lg:col-span-3 space-y-4">
            {/* Summary */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b pb-2">Summary</h3>

              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>GST (18%)</span>
                <span className="font-semibold text-slate-900">₹{gstAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Discount (Optional)</span>
                <span className="font-semibold text-slate-900">₹{discount}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">Total</span>
                <span className="text-base font-extrabold text-blue-600">₹{total.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Payment Terms */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Payment Terms</h3>
              <textarea
                rows={2}
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            {/* Notes */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Notes</h3>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </OrgLayout>
  );
}
