"use client";

import React, { useState, useEffect } from "react";
import OrgLayout from "@/components/OrgLayout";
import {
  Users,
  Plus,
  Search,
  Edit2,
  Eye,
  Trash2,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import ClientModal, { ClientData } from "@/components/clients/ClientModal";
import ClientDetailDrawer from "@/components/clients/ClientDetailDrawer";
import ConfirmModal from "@/components/ConfirmModal";

export default function ContactsManagementPage() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ACTIVE" | "ARCHIVED" | "ALL">("ACTIVE");
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientData | null>(null);

  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<{
    client: ClientData;
    action: "ARCHIVE" | "UNARCHIVE" | "DELETE";
  } | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const refreshClients = async () => {
    try {
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
        status: statusFilter,
      });
      if (search.trim()) {
        params.set("search", search.trim());
      }
      const res = await fetch(`/api/v1/clients?${params.toString()}`, { credentials: "include" });
      if (res.ok) {
        const json = await res.json();
        setClients(json.data || []);
        if (json.meta?.pagination) {
          setPagination((prev) => ({ ...prev, ...json.meta.pagination }));
        }
      }
    } catch {
      showToast("Failed to refresh clients.");
    }
  };

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const params = new URLSearchParams({
          page: String(pagination.page),
          limit: String(pagination.limit),
          status: statusFilter,
        });
        if (search.trim()) {
          params.set("search", search.trim());
        }

        const res = await fetch(`/api/v1/clients?${params.toString()}`, {
          credentials: "include",
        });

        if (res.ok && !ignore) {
          const json = await res.json();
          setClients(json.data || []);
          if (json.meta?.pagination) {
            setPagination((prev) => ({ ...prev, ...json.meta.pagination }));
          }
        }
      } catch {
        if (!ignore) showToast("Failed to load clients from server.");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [pagination.page, pagination.limit, statusFilter, search]);

  const handleOpenDetail = async (client: ClientData) => {
    try {
      const res = await fetch(`/api/v1/clients/${client.id}`, { credentials: "include" });
      if (res.ok) {
        const json = await res.json();
        setSelectedClient(json.data);
      } else {
        setSelectedClient(client);
      }
    } catch {
      setSelectedClient(client);
    }
    setIsDrawerOpen(true);
  };

  const handleArchive = (client: ClientData) => {
    setConfirmTarget({
      client,
      action: client.status === "ARCHIVED" ? "UNARCHIVE" : "ARCHIVE",
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmTarget) return;
    const { client, action } = confirmTarget;
    setIsProcessingAction(true);

    try {
      if (action === "UNARCHIVE") {
        const res = await fetch(`/api/v1/clients/${client.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status: "ACTIVE" }),
        });
        if (res.ok) {
          setClients((prev) =>
            prev.map((c) => (c.id === client.id ? { ...c, status: "ACTIVE" } : c))
          );
          showToast(`Client "${client.name}" restored to active.`);
          setConfirmTarget(null);
          setIsProcessingAction(false);
          setIsDrawerOpen(false);
          refreshClients();
          return;
        }
      } else {
        const res = await fetch(`/api/v1/clients/${client.id}`, {
          method: "DELETE",
          credentials: "include",
        });
        const json = await res.json().catch(() => null);

        if (res.ok) {
          // Immediately synchronize UI: remove from list if active filter or deleted
          setClients((prev) =>
            statusFilter === "ACTIVE" || json?.data?.deleted
              ? prev.filter((c) => c.id !== client.id)
              : prev.map((c) => (c.id === client.id ? { ...c, status: "ARCHIVED" } : c))
          );
          const msg = json?.data?.message || `Client "${client.name}" archived successfully.`;
          showToast(msg);
          setConfirmTarget(null);
          setIsProcessingAction(false);
          setIsDrawerOpen(false);
          refreshClients();
          return;
        }
      }
      showToast("Failed to update client. Please try again.");
      setIsProcessingAction(false);
    } catch {
      showToast("Error updating client status.");
      setIsProcessingAction(false);
    }
  };

  return (
    <OrgLayout activePath="/clients">
      {/* Toast */}
      {toastMessage && (
        <div style={{ position: "fixed", bottom: "28px", right: "28px", zIndex: 9999, display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#0f172a", color: "#ffffff", padding: "12px 20px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
          <CheckCircle2 style={{ width: "16px", height: "16px", color: "#34d399" }} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.4px" }}>
              Clients & Contacts
            </h1>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "3px 0 0 0" }}>
              Manage clients, counterparties, and commercial partner directories.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingClient(null);
              setIsModalOpen(true);
            }}
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px", backgroundColor: "#2563eb", color: "#ffffff", borderRadius: "10px", border: "none", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 6px rgba(37,99,235,0.2)" }}
          >
            <Plus style={{ width: "16px", height: "16px" }} />
            <span>Add Client</span>
          </button>
        </div>

        {/* Search & Status Filters */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", backgroundColor: "#ffffff", padding: "14px 18px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, maxWidth: "380px", position: "relative" }}>
            <Search style={{ width: "16px", height: "16px", color: "#94a3b8", position: "absolute", left: "12px" }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, company, email, phone..."
              style={{ width: "100%", padding: "8px 12px 8px 36px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", outline: "none" }}
            />
          </div>

          <div style={{ display: "flex", gap: "6px" }}>
            {(["ACTIVE", "ARCHIVED", "ALL"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  border: statusFilter === st ? "1px solid #2563eb" : "1px solid #e2e8f0",
                  backgroundColor: statusFilter === st ? "#eff6ff" : "#ffffff",
                  color: statusFilter === st ? "#2563eb" : "#64748b",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {st === "ACTIVE" ? "Active" : st === "ARCHIVED" ? "Archived" : "All Clients"}
              </button>
            ))}
          </div>
        </div>

        {/* Clients Table */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: "60px", textAlign: "center", color: "#64748b", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
              <Loader2 style={{ width: "24px", height: "24px", animation: "spin 1s linear infinite", color: "#2563eb" }} />
              <span style={{ fontSize: "13.5px" }}>Loading clients directory...</span>
            </div>
          ) : clients.length === 0 ? (
            <div style={{ padding: "60px 20px", textAlign: "center" }}>
              <Users style={{ width: "40px", height: "40px", color: "#cbd5e1", margin: "0 auto 12px" }} />
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>No clients found</h3>
              <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                {search ? "No clients match your search criteria." : "Get started by adding your first client."}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b", fontWeight: 600, fontSize: "12px" }}>
                    <th style={{ padding: "12px 18px" }}>Client / Contact</th>
                    <th style={{ padding: "12px 18px" }}>Company</th>
                    <th style={{ padding: "12px 18px" }}>Contact Details</th>
                    <th style={{ padding: "12px 18px" }}>Location</th>
                    <th style={{ padding: "12px 18px" }}>Status</th>
                    <th style={{ padding: "12px 18px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((c) => (
                    <tr
                      key={c.id}
                      style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer", transition: "background 0.15s" }}
                      onClick={() => handleOpenDetail(c)}
                    >
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ fontWeight: 700, color: "#0f172a" }}>{c.name}</div>
                        {c.taxId && <div style={{ fontSize: "11px", color: "#94a3b8" }}>GST: {c.taxId}</div>}
                      </td>
                      <td style={{ padding: "14px 18px", color: "#334155", fontWeight: 500 }}>
                        {c.companyName || "—"}
                      </td>
                      <td style={{ padding: "14px 18px", color: "#64748b" }}>
                        <div>{c.email || "—"}</div>
                        {c.phone && <div style={{ fontSize: "11.5px", color: "#94a3b8" }}>{c.phone}</div>}
                      </td>
                      <td style={{ padding: "14px 18px", color: "#64748b" }}>
                        {[c.city, c.state].filter(Boolean).join(", ") || "—"}
                      </td>
                      <td style={{ padding: "14px 18px" }}>
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 700,
                            backgroundColor: c.status === "ARCHIVED" ? "#f1f5f9" : "#eff6ff",
                            color: c.status === "ARCHIVED" ? "#64748b" : "#2563eb",
                          }}
                        >
                          {c.status === "ARCHIVED" ? "Archived" : "Active"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 18px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "6px" }} onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(c)}
                            title="View details & documents"
                            style={{ padding: "6px", background: "none", border: "1px solid #e2e8f0", borderRadius: "6px", color: "#64748b", cursor: "pointer" }}
                          >
                            <Eye style={{ width: "14px", height: "14px" }} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingClient(c);
                              setIsModalOpen(true);
                            }}
                            title="Edit"
                            style={{ padding: "6px", background: "none", border: "1px solid #e2e8f0", borderRadius: "6px", color: "#64748b", cursor: "pointer" }}
                          >
                            <Edit2 style={{ width: "14px", height: "14px" }} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleArchive(c)}
                            title={c.status === "ARCHIVED" ? "Unarchive Client" : "Archive / Delete Client"}
                            style={{ padding: "6px", background: "none", border: "1px solid #e2e8f0", borderRadius: "6px", color: c.status === "ARCHIVED" ? "#2563eb" : "#ef4444", cursor: "pointer" }}
                          >
                            <Trash2 style={{ width: "14px", height: "14px" }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Client Modal */}
      <ClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingClient}
        onSaved={() => {
          showToast(editingClient ? "Client updated successfully!" : "Client created successfully!");
          refreshClients();
        }}
      />

      {/* Detail Drawer */}
      <ClientDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        client={selectedClient}
        onEdit={(client) => {
          setIsDrawerOpen(false);
          setEditingClient(client);
          setIsModalOpen(true);
        }}
        onArchive={handleArchive}
      />

      {/* Confirmation Dialog */}
      <ConfirmModal
        isOpen={Boolean(confirmTarget)}
        onClose={() => {
          if (!isProcessingAction) setConfirmTarget(null);
        }}
        onConfirm={handleConfirmAction}
        title={
          confirmTarget?.action === "UNARCHIVE"
            ? "Restore Client"
            : confirmTarget?.action === "DELETE"
            ? "Delete Client"
            : "Archive Client"
        }
        description={
          confirmTarget?.action === "UNARCHIVE"
            ? `Are you sure you want to restore client "${confirmTarget.client.name}" to active status?`
            : confirmTarget?.action === "DELETE"
            ? `Are you sure you want to permanently delete client "${confirmTarget?.client.name}"? This action cannot be undone.`
            : `Are you sure you want to archive client "${confirmTarget?.client.name}"? If there are existing quotations or MOUs linked to this client, records will be safely preserved.`
        }
        confirmLabel={
          confirmTarget?.action === "UNARCHIVE"
            ? "Restore Client"
            : confirmTarget?.action === "DELETE"
            ? "Delete Client"
            : "Archive Client"
        }
        variant={confirmTarget?.action === "UNARCHIVE" ? "primary" : "danger"}
        isConfirming={isProcessingAction}
      />
    </OrgLayout>
  );
}
