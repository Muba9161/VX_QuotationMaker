"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import OrgLayout from "@/components/OrgLayout";
import {
  ArrowLeft,
  Plus,
  Save,
  Loader2,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";
import ClientModal, { ClientData } from "@/components/clients/ClientModal";
import MouClauseList, { ClauseForm } from "@/components/mou/MouClauseList";

const DEFAULT_STANDARD_CLAUSES: ClauseForm[] = [
  {
    title: "1. Introduction & Recitals",
    content: "This Memorandum of Understanding (MOU) is made and entered into by and between the First Party and the Second Party for establishing a cooperative and collaborative framework.",
    sortOrder: 0,
  },
  {
    title: "2. Purpose & Objective",
    content: "The purpose of this MOU is to define the principles and operating guidelines governing technical and commercial collaboration between both organizations.",
    sortOrder: 1,
  },
  {
    title: "3. Scope of Collaboration",
    content: "Both parties agree to explore joint opportunities, technical knowledge sharing, collaborative product deployment, and strategic operational support as mutually agreed upon in writing.",
    sortOrder: 2,
  },
  {
    title: "4. Responsibilities of Party A",
    content: "Party A shall provide core system access, technical consultation, architectural design, and operational onboarding required to achieve the collaboration goals.",
    sortOrder: 3,
  },
  {
    title: "5. Responsibilities of Party B",
    content: "Party B shall supply necessary project inputs, designate a dedicated point of contact, review milestone deliverables, and adhere to operational timelines.",
    sortOrder: 4,
  },
  {
    title: "6. Financial & Commercial Framework",
    content: "Unless otherwise specified in a formal binding statement of work (SOW) or commercial quotation, each party shall bear its own operational expenses under this MOU.",
    sortOrder: 5,
  },
  {
    title: "7. Confidentiality & Non-Disclosure",
    content: "Each party agrees to hold all proprietary and technical information received in connection with this agreement in strict confidence and shall not disclose it without prior written consent.",
    sortOrder: 6,
  },
  {
    title: "8. Duration, Termination & Exit",
    content: "This agreement shall remain effective for a period of one (1) year from the effective date, and may be terminated by either party with thirty (30) days written notice.",
    sortOrder: 7,
  },
  {
    title: "9. Dispute Resolution & Governing Law",
    content: "Any disputes arising under this agreement shall be settled through amicable good-faith consultations. This agreement shall be governed and construed according to the laws of India.",
    sortOrder: 8,
  },
];

export default function NewMouPage() {
  const router = useRouter();
  const [clients, setClients] = useState<ClientData[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  // Counterparty Details
  const [partyName, setPartyName] = useState("");
  const [partyCompany, setPartyCompany] = useState("");
  const [partyEmail, setPartyEmail] = useState("");
  const [partyPhone, setPartyPhone] = useState("");
  const [partyAddress, setPartyAddress] = useState("");

  // MOU Meta
  const [title, setTitle] = useState("");
  const [purpose, setPurpose] = useState("Strategic Business Collaboration & Service Delivery");
  const [governingLaw, setGoverningLaw] = useState("Indian Jurisdiction");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");

  // Structured Clauses
  const [clauses, setClauses] = useState<ClauseForm[]>(DEFAULT_STANDARD_CLAUSES);

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/clients?limit=100&status=ACTIVE", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data) setClients(json.data);
      })
      .catch(() => {});
  }, []);

  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
    const found = clients.find((c) => c.id === clientId);
    if (found) {
      setPartyName(found.name);
      setPartyCompany(found.companyName || "");
      setPartyEmail(found.email || "");
      setPartyPhone(found.phone || "");
      setPartyAddress([found.address, found.city, found.state].filter(Boolean).join(", "));
    }
  };

  const handleAddClause = () => {
    setClauses((prev) => [
      ...prev,
      {
        title: `${prev.length + 1}. Additional Clause`,
        content: "Enter the terms, conditions, or mutual understandings for this section.",
        sortOrder: prev.length,
      },
    ]);
  };

  const handleRemoveClause = (idx: number) => {
    if (clauses.length <= 1) return;
    setClauses((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleMoveClause = (idx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= clauses.length) return;
    setClauses((prev) => {
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy.map((c, i) => ({ ...c, sortOrder: i }));
    });
  };

  const handleClauseChange = (idx: number, field: "title" | "content", val: string) => {
    setClauses((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please provide an agreement title.");
      return;
    }
    if (!partyName.trim()) {
      setError("Second party contact name is required.");
      return;
    }
    if (clauses.length === 0 || clauses.some((c) => !c.title.trim() || !c.content.trim())) {
      setError("All clauses must have a title and non-empty content.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        contactId: selectedClientId || undefined,
        clientName: partyName.trim(),
        clientCompany: partyCompany.trim() || undefined,
        clientEmail: partyEmail.trim() || undefined,
        clientPhone: partyPhone.trim() || undefined,
        clientAddress: partyAddress.trim() || undefined,
        title: title.trim(),
        purpose: purpose.trim() || undefined,
        governingLaw: governingLaw.trim() || "Indian Jurisdiction",
        effectiveDate: effectiveDate || new Date().toISOString().split("T")[0],
        expiryDate: expiryDate || undefined,
        notes: notes.trim() || undefined,
        clauses: clauses.map((c, idx) => ({
          title: c.title.trim(),
          content: c.content.trim(),
          sortOrder: idx,
        })),
      };

      const res = await fetch("/api/v1/mous", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json?.error?.message || "Failed to create MOU.");
        return;
      }

      router.push("/mou");
    } catch {
      setError("Network error while submitting MOU.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OrgLayout activePath="/mou">
      <div style={{ maxWidth: "1160px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "22px", paddingBottom: "40px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link
            href="/mou"
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "10px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff", color: "#475569" }}
          >
            <ArrowLeft style={{ width: "18px", height: "18px" }} />
          </Link>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", margin: 0 }}>Create Memorandum of Understanding</h1>
            <p style={{ fontSize: "12.5px", color: "#64748b", margin: "2px 0 0 0" }}>
              Draft a structured bilateral agreement with customizable numbered clauses and terms.
            </p>
          </div>
        </div>

        {/* Legal Disclaimer Notice */}
        <div style={{ padding: "12px 18px", backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "12px", display: "flex", alignItems: "center", gap: "10px", color: "#1e40af", fontSize: "12.5px" }}>
          <ShieldAlert style={{ width: "18px", height: "18px", flexShrink: 0, color: "#2563eb" }} />
          <span>
            <strong>Legal Notice:</strong> This platform provides commercial document drafting templates. Organizations should review all clauses with their legal counsel prior to formal execution.
          </span>
        </div>

        {error && (
          <div style={{ padding: "12px 16px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", color: "#991b1b", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertCircle style={{ width: "16px", height: "16px", flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Section 1: Parties & Agreement Meta */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "22px 24px" }}>
            <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", margin: "0 0 16px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              1. Parties & Agreement Meta
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
              {/* Second Party */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Second Party (Counterparty)</label>
                    <button
                      type="button"
                      onClick={() => setIsClientModalOpen(true)}
                      style={{ background: "none", border: "none", color: "#2563eb", fontSize: "11.5px", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "2px" }}
                    >
                      <Plus style={{ width: "12px", height: "12px" }} />
                      <span>New Party</span>
                    </button>
                  </div>
                  <select
                    value={selectedClientId}
                    onChange={(e) => handleSelectClient(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                  >
                    <option value="">-- Choose from party directory or enter details --</option>
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
                      value={partyName}
                      onChange={(e) => setPartyName(e.target.value)}
                      placeholder="e.g. Ananya Patel"
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Organization / Institution</label>
                    <input
                      type="text"
                      value={partyCompany}
                      onChange={(e) => setPartyCompany(e.target.value)}
                      placeholder="e.g. Global Systems"
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Email</label>
                    <input
                      type="email"
                      value={partyEmail}
                      onChange={(e) => setPartyEmail(e.target.value)}
                      placeholder="ananya@globalsys.com"
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Phone</label>
                    <input
                      type="text"
                      value={partyPhone}
                      onChange={(e) => setPartyPhone(e.target.value)}
                      placeholder="+91 87654 32109"
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                    />
                  </div>
                </div>
              </div>

              {/* Agreement Meta */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Agreement Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Strategic Technical Collaboration & Research Agreement"
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Collaboration Purpose</label>
                  <input
                    type="text"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="e.g. Joint Product Development & Technical Exchange"
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Effective Date</label>
                    <input
                      type="date"
                      value={effectiveDate}
                      onChange={(e) => setEffectiveDate(e.target.value)}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Validity / Expiry</label>
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Governing Law</label>
                    <input
                      type="text"
                      value={governingLaw}
                      onChange={(e) => setGoverningLaw(e.target.value)}
                      placeholder="e.g. Indian Jurisdiction"
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Internal Notes</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Optional notes"
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Structured Clauses Editor */}
          <MouClauseList
            clauses={clauses}
            onAddClause={handleAddClause}
            onRemoveClause={handleRemoveClause}
            onMoveClause={handleMoveClause}
            onClauseChange={handleClauseChange}
          />

          {/* Action Footer */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <Link
              href="/mou"
              style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff", color: "#475569", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              style={{ padding: "10px 26px", borderRadius: "10px", border: "none", backgroundColor: "#2563eb", color: "#ffffff", fontSize: "13px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: "8px", boxShadow: "0 2px 8px rgba(37,99,235,0.25)" }}
            >
              {loading ? (
                <>
                  <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} />
                  <span>Saving MOU...</span>
                </>
              ) : (
                <>
                  <Save style={{ width: "16px", height: "16px" }} />
                  <span>Save MOU</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

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
