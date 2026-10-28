"use client";
import React, { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Plus, Search, SlidersHorizontal, MoreVertical, X, Check, Edit2, Power, UserPlus } from "lucide-react";
import { getPlatformUsers, savePlatformUser, PlatformUser } from "@/lib/adminStorage";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<PlatformUser[]>(getPlatformUsers());
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "Admin" as "Super Admin" | "Support Admin" | "Admin",
  });

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;
    const user: PlatformUser = {
      id: "u-" + Date.now(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: "Active",
      lastLogin: "Just now",
    };
    savePlatformUser(user);
    setUsers(getPlatformUsers());
    setIsModalOpen(false);
    setNewUser({ name: "", email: "", role: "Admin" });
  };

  const toggleStatus = (id: string) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;
    const updated = {
      ...user,
      status: user.status === "Active" ? "Inactive" : "Active",
    } as PlatformUser;
    savePlatformUser(updated);
    setUsers(getPlatformUsers());
    setActiveMenuId(null);
  };

  return (
    <AdminLayout activePath="/admin/users">
      <div
        style={{
          width: "100%",
          maxWidth: "1400px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          boxSizing: "border-box",
        }}
      >
        {/* ================= PAGE HEADER ================= */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "26px",
                fontWeight: "900",
                color: "#0f172a",
                letterSpacing: "-0.5px",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Platform Users
            </h1>
            <p
              style={{
                fontSize: "13px",
                color: "#64748b",
                margin: "4px 0 0 0",
                fontWeight: "400",
              }}
            >
              Manage platform admin users (if multiple)
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
              transition: "background 0.15s ease",
            }}
          >
            <Plus style={{ width: "16px", height: "16px" }} />
            <span>Add User</span>
          </button>
        </div>

        {/* ================= SEARCH & FILTER BAR ================= */}
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "10px 14px",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            boxSizing: "border-box",
          }}
        >
          {/* Search Input */}
          <div style={{ position: "relative", flex: 1 }}>
            <Search
              style={{
                width: "15px",
                height: "15px",
                color: "#94a3b8",
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                height: "38px",
                padding: "0 14px 0 36px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                fontSize: "13px",
                color: "#1e293b",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Filter icon button */}
          <button
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              color: "#64748b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <SlidersHorizontal style={{ width: "16px", height: "16px" }} />
          </button>
        </div>

        {/* ================= USERS TABLE ================= */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#f8fafc",
                    borderBottom: "1px solid #f1f5f9",
                    color: "#64748b",
                    fontSize: "11px",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  <th style={{ padding: "14px 24px", width: "40px" }}>#</th>
                  <th style={{ padding: "14px 24px" }}>Name</th>
                  <th style={{ padding: "14px 24px" }}>Email</th>
                  <th style={{ padding: "14px 24px" }}>Role</th>
                  <th style={{ padding: "14px 24px" }}>Status</th>
                  <th style={{ padding: "14px 24px" }}>Last Login</th>
                  <th style={{ padding: "14px 24px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, i) => {
                  const initials = u.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2);

                  return (
                    <tr
                      key={u.id}
                      style={{
                        borderBottom:
                          i !== filteredUsers.length - 1
                            ? "1px solid #f1f5f9"
                            : "none",
                        transition: "background 0.15s ease",
                      }}
                    >
                      {/* # Number */}
                      <td style={{ padding: "16px 24px", color: "#94a3b8", fontWeight: "600" }}>
                        {i + 1}
                      </td>

                      {/* Avatar + Name */}
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              backgroundColor: "#2563eb",
                              color: "#ffffff",
                              fontWeight: "800",
                              fontSize: "12px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: "0 2px 6px rgba(37,99,235,0.2)",
                              flexShrink: 0,
                            }}
                          >
                            {initials}
                          </div>
                          <span style={{ fontWeight: "700", color: "#0f172a" }}>
                            {u.name}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td style={{ padding: "16px 24px", color: "#64748b" }}>
                        {u.email}
                      </td>

                      {/* Role */}
                      <td style={{ padding: "16px 24px", color: "#334155", fontWeight: "600" }}>
                        {u.role}
                      </td>

                      {/* Status */}
                      <td style={{ padding: "16px 24px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 12px",
                            borderRadius: "9999px",
                            fontSize: "11px",
                            fontWeight: "700",
                            backgroundColor:
                              u.status === "Active" ? "#dcfce7" : "#fee2e2",
                            color:
                              u.status === "Active" ? "#15803d" : "#dc2626",
                            border: `1px solid ${
                              u.status === "Active" ? "#bbf7d0" : "#fecaca"
                            }`,
                          }}
                        >
                          {u.status}
                        </span>
                      </td>

                      {/* Last Login */}
                      <td style={{ padding: "16px 24px", color: "#64748b", fontSize: "12px" }}>
                        {u.lastLogin}
                      </td>

                      {/* Actions ⋮ */}
                      <td style={{ padding: "16px 24px", textAlign: "right", position: "relative" }}>
                        <button
                          onClick={() =>
                            setActiveMenuId(activeMenuId === u.id ? null : u.id)
                          }
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: "6px",
                            color: "#94a3b8",
                            borderRadius: "6px",
                          }}
                        >
                          <MoreVertical style={{ width: "16px", height: "16px" }} />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuId === u.id && (
                          <div
                            style={{
                              position: "absolute",
                              right: "24px",
                              top: "45px",
                              width: "150px",
                              backgroundColor: "#ffffff",
                              borderRadius: "10px",
                              border: "1px solid #e2e8f0",
                              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                              zIndex: 40,
                              padding: "6px 0",
                              textAlign: "left",
                            }}
                          >
                            <button
                              onClick={() => toggleStatus(u.id)}
                              style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "8px 14px",
                                fontSize: "12px",
                                fontWeight: "600",
                                color: u.status === "Active" ? "#dc2626" : "#16a34a",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                              }}
                            >
                              <Power style={{ width: "13px", height: "13px" }} />
                              <span>{u.status === "Active" ? "Set Inactive" : "Set Active"}</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= MODAL: ADD USER ================= */}
        {isModalOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(15, 23, 42, 0.4)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 50,
              padding: "16px",
            }}
          >
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "18px",
                width: "100%",
                maxWidth: "460px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                padding: "24px",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                    Add Platform User
                  </h3>
                  <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
                    Create platform administrator credentials
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#94a3b8",
                  }}
                >
                  <X style={{ width: "20px", height: "20px" }} />
                </button>
              </div>

              <form onSubmit={handleAddUser} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    style={{
                      width: "100%",
                      height: "42px",
                      padding: "0 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "10px",
                      fontSize: "13px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="john@vorldx.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    style={{
                      width: "100%",
                      height: "42px",
                      padding: "0 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "10px",
                      fontSize: "13px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                    Platform Role
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                    style={{
                      width: "100%",
                      height: "42px",
                      padding: "0 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "10px",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#334155",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Support Admin">Support Admin</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      flex: 1,
                      height: "44px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#ffffff",
                      borderRadius: "10px",
                      fontSize: "13px",
                      fontWeight: "700",
                      color: "#475569",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      height: "44px",
                      border: "none",
                      backgroundColor: "#2563eb",
                      color: "#ffffff",
                      borderRadius: "10px",
                      fontSize: "13px",
                      fontWeight: "700",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
                    }}
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
