"use client";

import React from "react";
import Link from "next/link";
import { X, Mail, Phone, MapPin, Globe, Plus, Edit2, Archive } from "lucide-react";
import type { ClientData } from "./ClientModal";

interface ClientDetailProps {
  client: (ClientData & {
    quotations?: Array<{
      id: string;
      docNumber: string;
      title: string;
      status: string;
      total: number;
      createdAt: string;
    }>;
    mous?: Array<{
      id: string;
      docNumber: string;
      title: string;
      status: string;
      createdAt: string;
    }>;
  }) | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (client: ClientData) => void;
  onArchive: (client: ClientData) => void;
}

export default function ClientDetailDrawer({ client, isOpen, onClose, onEdit, onArchive }: ClientDetailProps) {
  if (!isOpen || !client) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        backgroundColor: "rgba(15, 23, 42, 0.4)",
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          height: "100%",
          backgroundColor: "#ffffff",
          boxShadow: "-8px 0 25px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "inline-block", padding: "3px 8px", backgroundColor: client.status === "ARCHIVED" ? "#f1f5f9" : "#eff6ff", color: client.status === "ARCHIVED" ? "#64748b" : "#2563eb", borderRadius: "6px", fontSize: "11px", fontWeight: 700, marginBottom: "6px" }}>
              {client.status === "ARCHIVED" ? "Archived Client" : "Active Client"}
            </div>
            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              {client.name}
            </h2>
            {client.companyName && (
              <p style={{ fontSize: "13px", color: "#64748b", margin: "2px 0 0 0", fontWeight: 500 }}>
                {client.companyName}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "4px" }}
          >
            <X style={{ width: "20px", height: "20px" }} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "22px" }}>
          {/* Quick Action Buttons */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              onClick={() => onEdit(client)}
              style={{ flex: 1, padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#ffffff", fontSize: "12px", fontWeight: 600, color: "#334155", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
            >
              <Edit2 style={{ width: "13px", height: "13px" }} />
              <span>Edit Details</span>
            </button>
            <button
              type="button"
              onClick={() => onArchive(client)}
              style={{ padding: "8px 12px", border: "1px solid #fecaca", borderRadius: "8px", background: "#fef2f2", fontSize: "12px", fontWeight: 600, color: "#dc2626", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <Archive style={{ width: "13px", height: "13px" }} />
              <span>{client.status === "ARCHIVED" ? "Unarchive" : "Archive"}</span>
            </button>
          </div>

          {/* Contact Details */}
          <div>
            <h3 style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 10px 0" }}>
              Contact Information
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "9px", fontSize: "13px", color: "#334155" }}>
              {client.email && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Mail style={{ width: "15px", height: "15px", color: "#64748b" }} />
                  <a href={`mailto:${client.email}`} style={{ color: "#2563eb", textDecoration: "none" }}>{client.email}</a>
                </div>
              )}
              {client.phone && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Phone style={{ width: "15px", height: "15px", color: "#64748b" }} />
                  <span>{client.phone}</span>
                </div>
              )}
              {(client.address || client.city) && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                  <MapPin style={{ width: "15px", height: "15px", color: "#64748b", marginTop: "2px" }} />
                  <span>{[client.address, client.city, client.state, client.postalCode, client.country].filter(Boolean).join(", ")}</span>
                </div>
              )}
              {client.website && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Globe style={{ width: "15px", height: "15px", color: "#64748b" }} />
                  <a href={client.website} target="_blank" rel="noreferrer" style={{ color: "#2563eb", textDecoration: "none" }}>{client.website}</a>
                </div>
              )}
              {client.taxId && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#64748b" }}>
                  <span style={{ fontWeight: 600 }}>GST / Tax ID:</span> {client.taxId}
                </div>
              )}
            </div>
          </div>

          {/* Linked Quotations */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <h3 style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>
                Associated Quotations ({client.quotations?.length || 0})
              </h3>
              <Link
                href={`/quotations/new?clientId=${client.id}`}
                style={{ fontSize: "12px", fontWeight: 600, color: "#2563eb", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "3px" }}
              >
                <Plus style={{ width: "12px", height: "12px" }} />
                <span>New Quote</span>
              </Link>
            </div>
            {client.quotations && client.quotations.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {client.quotations.map((q) => (
                  <div key={q.id} style={{ padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{q.docNumber}</div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>{q.title}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#0f172a" }}>₹{Number(q.total).toLocaleString()}</div>
                      <span style={{ fontSize: "10.5px", fontWeight: 700, color: q.status === "APPROVED" ? "#16a34a" : "#2563eb" }}>{q.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: "12.5px", color: "#94a3b8", margin: 0 }}>No quotations generated for this client yet.</p>
            )}
          </div>

          {/* Linked MOUs */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <h3 style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>
                Associated MOUs ({client.mous?.length || 0})
              </h3>
              <Link
                href={`/mou/new?clientId=${client.id}`}
                style={{ fontSize: "12px", fontWeight: 600, color: "#2563eb", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "3px" }}
              >
                <Plus style={{ width: "12px", height: "12px" }} />
                <span>New MOU</span>
              </Link>
            </div>
            {client.mous && client.mous.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {client.mous.map((m) => (
                  <div key={m.id} style={{ padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{m.docNumber}</div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>{m.title}</div>
                    </div>
                    <span style={{ fontSize: "10.5px", fontWeight: 700, color: m.status === "SIGNED" ? "#16a34a" : "#2563eb" }}>{m.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: "12.5px", color: "#94a3b8", margin: 0 }}>No MOUs executed for this client yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
