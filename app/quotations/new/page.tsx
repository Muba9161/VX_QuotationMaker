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
      <div className="max-w-[1400px] mx-auto p-4 sm:p-6 space-y-6 font-sans">
        {/* Top Header matching Screenshot */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-1.5 rounded-lg hover:bg-slate-100 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </Link>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Create Quotation</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSave("Draft")}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 rounded-lg shadow-2xs transition-colors"
            >
              <Save className="w-3.5 h-3.5 text-blue-600" />
              <span>Save Draft</span>
            </button>
            <button
              onClick={() => handleSave("Draft")}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-blue-600 rounded-lg shadow-2xs transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => handleSave("Sent")}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Generate PDF</span>
            </button>
          </div>
        </div>

        {/* 2-Column Layout Matching Screenshot 1:1 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (8 cols): Basic Details + Items & Services */}
          <div className="lg:col-span-8 space-y-6">
            {/* Basic Details Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
              <h2 className="text-base font-bold text-slate-900">Basic Details</h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Quotation Number</label>
                  <input
                    type="text"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Date</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none pr-9"
                    />
                    <Calendar className="w-4 h-4 text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Valid Till</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={validTill}
                      onChange={(e) => setValidTill(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none pr-9"
                    />
                    <Calendar className="w-4 h-4 text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Customer Address</label>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Items & Services Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900">Items & Services</h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-700 font-semibold">
                      <th className="py-2.5 px-3 w-8">#</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 w-20 text-center">Quantity</th>
                      <th className="py-2.5 px-3 w-16 text-center">Unit</th>
                      <th className="py-2.5 px-3 w-28 text-center">Rate (₹)</th>
                      <th className="py-2.5 px-3 w-28 text-center">Amount (₹)</th>
                      <th className="py-2.5 px-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((it, idx) => (
                      <tr key={it.id}>
                        <td className="py-3 px-3 text-slate-700 font-medium">{idx + 1}</td>
                        <td className="py-3 px-3">
                          <input
                            type="text"
                            value={it.description}
                            onChange={(e) => updateItem(idx, "description", e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="number"
                            value={it.quantity}
                            onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))}
                            className="w-full px-2 py-2 border border-slate-200 rounded-lg text-xs text-center bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="text"
                            value={it.unit}
                            onChange={(e) => updateItem(idx, "unit", e.target.value)}
                            className="w-full px-2 py-2 border border-slate-200 rounded-lg text-xs text-center bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="number"
                            value={it.rate}
                            onChange={(e) => updateItem(idx, "rate", Number(e.target.value))}
                            className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs text-center bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="number"
                            readOnly
                            value={it.amount || 0}
                            className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs text-center bg-white text-slate-800 font-medium focus:outline-none cursor-default"
                          />
                        </td>
                        <td className="py-3 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="Remove Item"
                          >
                            <Trash2 className="w-4 h-4 stroke-[2]" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={addItem}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Add Item</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Summary + Payment Terms + Notes */}
          <div className="lg:col-span-4 space-y-5">
            {/* Summary Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900">Summary</h2>

              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-bold text-slate-900">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-medium">GST (18%)</span>
                  <span className="font-bold text-slate-900">₹{gstAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-medium">Discount (Optional)</span>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                    className="w-20 px-2.5 py-1 border border-slate-200 rounded-md text-xs text-right font-medium text-slate-900 bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Total Row with Light Blue Highlight Box */}
              <div className="bg-blue-100/80 rounded-xl px-4 py-3 flex items-center justify-between mt-4">
                <span className="text-sm font-bold text-slate-900">Total</span>
                <span className="text-base font-bold text-blue-600">₹{total.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Payment Terms Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2.5">
              <h2 className="text-base font-bold text-slate-900">Payment Terms</h2>
              <input
                type="text"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Notes Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2.5">
              <h2 className="text-base font-bold text-slate-900">Notes</h2>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </OrgLayout>
  );
}
