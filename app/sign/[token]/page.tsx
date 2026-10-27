"use client";
import React, { useRef, useState, use, Suspense } from "react";
import { CheckCircle2, ShieldCheck, Download, PenTool, Type } from "lucide-react";
import { getOrgDocumentById, getOrgBranding } from "@/lib/orgStorage";

function SignContent({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;
  const branding = getOrgBranding();
  const doc = getOrgDocumentById(token) || {
    id: "doc-1",
    docNumber: "Q-001",
    title: "Website Development Quotation",
    type: "quotation" as const,
    customerName: "Tech Solutions Pvt Ltd",
    customerAddress: "A-123, Sector 62, Noida, U.P.",
    date: "28-10-2026",
    validTill: "28-11-2026",
    total: 35400,
    items: [
      { id: "1", description: "Website Development", quantity: 1, unit: "Nos", rate: 25000, amount: 25000 },
      { id: "2", description: "Hosting Setup", quantity: 1, unit: "Nos", rate: 5000, amount: 5000 },
    ],
    clauses: [],
    subtotal: 30000,
    taxRate: 18,
    taxAmount: 5400,
    discount: 0,
    paymentTerms: "50% advance, 50% on delivery",
    notes: "Thank you for your business.",
    status: "Sent" as const,
    createdAt: "28 Oct 2026",
    recipients: [],
  };

  const [signerName, setSignerName] = useState("John Doe");
  const [method, setMethod] = useState<"draw" | "type">("draw");
  const [typedSign, setTypedSign] = useState("John Doe");
  const [signed, setSigned] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1e3a8a";
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const stopDraw = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSign = () => {
    setSigned(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base">
              ▲
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900">{branding.name}</h1>
              <p className="text-xs text-slate-500">Document Signing Portal &bull; Verified Recipient</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>256-Bit Encrypted</span>
          </div>
        </div>

        <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-md space-y-6">
          <div className="flex justify-between border-b pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{doc.title}</h2>
              <p className="text-xs text-slate-500">Document No: {doc.docNumber} | Issued: {doc.date}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Total Amount</span>
              <p className="text-xl font-black text-blue-600">₹{doc.total.toLocaleString("en-IN")}</p>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl text-xs space-y-1">
            <p className="font-bold text-slate-800">Recipient Details:</p>
            <p className="text-slate-600">{doc.customerName}</p>
            <p className="text-slate-500">{doc.customerAddress}</p>
          </div>

          {signed ? (
            <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-xl text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-emerald-900">Document Electronically Signed</h3>
              <p className="text-xs text-emerald-700 max-w-sm mx-auto">
                Signed by {signerName} on {new Date().toLocaleDateString("en-IN")} with timestamp verification stamp.
              </p>
              <button
                onClick={() => window.print()}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold"
              >
                <Download className="w-4 h-4" />
                <span>Download Executed Copy</span>
              </button>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl p-6 bg-slate-50/50 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Provide Your Digital Signature</h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Signer Legal Name</label>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMethod("draw")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                    method === "draw" ? "bg-blue-600 text-white" : "bg-white border text-slate-600"
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Draw Signature</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("type")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                    method === "type" ? "bg-blue-600 text-white" : "bg-white border text-slate-600"
                  }`}
                >
                  <Type className="w-3.5 h-3.5" />
                  <span>Type Signature</span>
                </button>
              </div>

              {method === "draw" ? (
                <div>
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={120}
                    onMouseDown={startDraw}
                    onMouseMove={draw}
                    onMouseUp={stopDraw}
                    onMouseLeave={stopDraw}
                    className="w-full h-32 bg-white border border-slate-300 rounded-xl cursor-crosshair shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="mt-1 text-[11px] text-slate-500 hover:text-slate-800 underline"
                  >
                    Clear Canvas
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={typedSign}
                    onChange={(e) => setTypedSign(e.target.value)}
                    className="w-full p-4 bg-white border border-slate-200 rounded-xl font-serif text-2xl italic text-blue-900"
                  />
                </div>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSign}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20"
                >
                  Confirm & Sign Document
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SignDocumentPage(props: { params: Promise<{ token: string }> }) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading signing portal...</div>}>
      <SignContent params={props.params} />
    </Suspense>
  );
}
