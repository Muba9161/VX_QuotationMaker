"use client";

import React, { useState, useEffect, useMemo } from "react";
import OrgLayout from "@/components/OrgLayout";
import {
  Users,
  User,
  Edit3,
  Eye,
  Search,
  ChevronDown,
  Filter,
  UserPlus,
  Pencil,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  Trash2,
  Mail,
  AlertCircle,
  Loader2,
  Copy,
} from "lucide-react";
import {
  getOrgTeam,
  saveOrgTeamMember,
  OrgTeamMember,
} from "@/lib/orgStorage";

interface ApiMember {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status: string;
}

interface ApiInvitation {
  id: string;
  email: string;
  role: string;
  inviteToken?: string;
}

export default function TeamMembersPage() {
  const [team, setTeam] = useState<OrgTeamMember[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All Roles");
  const [statusFilter, setStatusFilter] = useState<string>("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<OrgTeamMember | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New member form
  const [newMember, setNewMember] = useState<{
    name: string;
    email: string;
    role: "Org Admin" | "Editor" | "Viewer";
    status: "Active" | "Invited";
  }>({
    name: "",
    email: "",
    role: "Editor",
    status: "Invited",
  });

  const loadTeamMembers = React.useCallback(async () => {
    try {
      const res = await fetch("/api/v1/organization/team", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.data) {
          const { members = [], invitations = [] } = data.data;
          const mapped: OrgTeamMember[] = [
            ...members.map((u: ApiMember) => ({
              id: u.id,
              name: u.name || u.email.split("@")[0],
              email: u.email,
              role: (u.role === "ORG_ADMIN" ? "Org Admin" : u.role === "VIEWER" ? "Viewer" : "Editor") as "Org Admin" | "Editor" | "Viewer",
              status: (u.status === "ACTIVE" ? "Active" : "Invited") as "Active" | "Invited",
            })),
            ...invitations.map((i: ApiInvitation) => ({
              id: i.id,
              name: i.email.split("@")[0],
              email: i.email,
              role: (i.role === "ORG_ADMIN" ? "Org Admin" : i.role === "VIEWER" ? "Viewer" : "Editor") as "Org Admin" | "Editor" | "Viewer",
              status: "Invited" as const,
              inviteToken: i.inviteToken,
            })),
          ];
          setTeam(mapped);
          return;
        }
      }
    } catch {
      // Fallback
    }
    setTeam(getOrgTeam());
  }, []);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const res = await fetch("/api/v1/organization/team", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.data && !ignore) {
            const { members = [], invitations = [] } = data.data;
            const mapped: OrgTeamMember[] = [
              ...members.map((u: ApiMember) => ({
                id: u.id,
                name: u.name || u.email.split("@")[0],
                email: u.email,
                role: (u.role === "ORG_ADMIN" ? "Org Admin" : u.role === "VIEWER" ? "Viewer" : "Editor") as "Org Admin" | "Editor" | "Viewer",
                status: (u.status === "ACTIVE" ? "Active" : "Invited") as "Active" | "Invited",
              })),
              ...invitations.map((i: ApiInvitation) => ({
                id: i.id,
                name: i.email.split("@")[0],
                email: i.email,
                role: (i.role === "ORG_ADMIN" ? "Org Admin" : i.role === "VIEWER" ? "Viewer" : "Editor") as "Org Admin" | "Editor" | "Viewer",
                status: "Invited" as const,
                inviteToken: i.inviteToken,
              })),
            ];
            setTeam(mapped);
            return;
          }
        }
      } catch {
        // Fallback
      }
      if (!ignore) {
        setTeam(getOrgTeam());
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Stats calculation
  const totalMembers = team.length;
  const adminCount = team.filter((m) => m.role === "Org Admin").length;
  const editorCount = team.filter((m) => m.role === "Editor").length;
  const viewerCount = team.filter((m) => m.role === "Viewer").length;

  // Filtered list
  const filteredTeam = useMemo(() => {
    return team.filter((member) => {
      const matchSearch =
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRole =
        roleFilter === "All Roles" || member.role === roleFilter;
      const matchStatus =
        statusFilter === "All Status" || member.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [team, searchTerm, roleFilter, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredTeam.length / pageSize) || 1;
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTeam.slice(start, start + pageSize);
  }, [filteredTeam, currentPage]);

  // Handlers
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const trimmedEmail = newMember.email.trim();
    const trimmedName = newMember.name.trim();

    if (!trimmedName) {
      setModalError("Please provide member full name.");
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setModalError("Please provide a valid email address.");
      return;
    }

    const backendRole =
      newMember.role === "Org Admin"
        ? "ORG_ADMIN"
        : newMember.role === "Viewer"
        ? "VIEWER"
        : "EDITOR";

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/v1/organization/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: trimmedEmail, role: backendRole }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const errorMsg =
          data?.error?.message ||
          "Failed to invite member. Please check authorization and parameters.";
        setModalError(errorMsg);
        showToast(errorMsg, "error");
        setIsSubmitting(false);
        return;
      }

      await loadTeamMembers();
      setIsAddModalOpen(false);
      setNewMember({ name: "", email: "", role: "Editor", status: "Invited" });
      setModalError(null);
      setIsSubmitting(false);

      const emailNote = data?.data?.emailSent
        ? "Invitation email dispatched via Gmail SMTP."
        : "Invite link generated.";
      showToast(`Invitation sent to ${trimmedEmail} successfully! ${emailNote}`, "success");
      return;
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Unable to reach server. Please try again.";
      setModalError(errorMsg);
      showToast(errorMsg, "error");
      setIsSubmitting(false);
    }
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    const backendRole = editingMember.role === "Org Admin" ? "ORG_ADMIN" : editingMember.role === "Viewer" ? "VIEWER" : "EDITOR";
    const backendStatus = editingMember.status === "Active" ? "ACTIVE" : "INACTIVE";

    try {
      const res = await fetch(`/api/v1/organization/team/${editingMember.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role: backendRole, status: backendStatus }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        showToast(err?.error?.message || "Failed to update member.");
        return;
      }

      await loadTeamMembers();
      setEditingMember(null);
      showToast(`Updated member details for ${editingMember.name}`);
      return;
    } catch {
      // Local fallback
    }

    saveOrgTeamMember(editingMember);
    setTeam(getOrgTeam());
    setEditingMember(null);
    showToast(`Updated member details for ${editingMember.name}`);
  };

  const handleDeleteMember = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/v1/organization/team/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        // Try invitation revocation in case id is an invitation
        const inviteRes = await fetch(`/api/v1/organization/team/invite/${id}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (!inviteRes.ok) {
          const err = await res.json().catch(() => null);
          showToast(err?.error?.message || "Failed to remove member.");
          return;
        }
      }

      await loadTeamMembers();
      setActiveMenuId(null);
      showToast(`Removed ${name} from organization team.`, "success");
      return;
    } catch {
      showToast("Network error removing member.", "error");
    }
  };

  const handleResendInvite = async (id: string, email: string) => {
    setActiveMenuId(null);
    try {
      const res = await fetch(`/api/v1/organization/team/invite/${id}/resend`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        showToast(`Invitation email resent to ${email} successfully!`, "success");
        await loadTeamMembers();
      } else {
        showToast(data?.error?.message || "Failed to resend invitation.", "error");
      }
    } catch {
      showToast("Network error resending invitation.", "error");
    }
  };

  const handleCopyInviteLink = (token: string) => {
    const appUrl = window.location.origin;
    const inviteUrl = `${appUrl}/invite?token=${token}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(inviteUrl);
    }
    showToast("Invite link copied to clipboard!", "success");
    setActiveMenuId(null);
  };

  // Avatar colors
  const getAvatarStyle = (name: string) => {
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    if (name.includes("Rahul")) {
      return { initials, bg: "bg-blue-100", text: "text-blue-600" };
    }
    if (name.includes("Priya")) {
      return { initials, bg: "bg-purple-100", text: "text-purple-600" };
    }
    if (name.includes("Amit")) {
      return { initials, bg: "bg-emerald-100", text: "text-emerald-600" };
    }
    if (name.includes("Neha")) {
      return { initials, bg: "bg-amber-100", text: "text-amber-600" };
    }
    if (name.includes("Karan")) {
      return { initials, bg: "bg-rose-100", text: "text-rose-600" };
    }
    return { initials, bg: "bg-blue-100", text: "text-blue-600" };
  };

  // Role Badge Style
  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case "Org Admin":
        return "bg-blue-100 text-blue-600";
      case "Editor":
        return "bg-purple-100 text-purple-600";
      case "Viewer":
        return "bg-rose-100 text-rose-600";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  // Status Badge Style matching Image 2
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-emerald-100/80 text-emerald-600";
      case "Invited":
        return "bg-amber-100/80 text-amber-600";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <OrgLayout activePath="/team">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "32px",
            right: "32px",
            zIndex: 10000,
            backgroundColor: "#0f172a",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: "12px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          {toastType === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="space-y-6 max-w-[1400px] mx-auto font-sans pb-16">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Team Members
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your organization members
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setModalError(null);
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        </div>

        {/* 4 Stat Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Members */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 leading-tight">
                {totalMembers}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Total Members
              </div>
            </div>
          </div>

          {/* Card 2: Organization Admin */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <div className="w-7 h-7 rounded-full border-2 border-emerald-500/80 flex items-center justify-center">
                <User className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 leading-tight">
                {adminCount}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Organization Admin
              </div>
            </div>
          </div>

          {/* Card 3: Editors */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 leading-tight">
                {editorCount}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Editors
              </div>
            </div>
          </div>

          {/* Card 4: Viewer */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 leading-tight">
                {viewerCount}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Viewer
              </div>
            </div>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search members by name or email..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-[#f4f7fb]"
              />
            </div>

            {/* Dropdowns & Filter Button */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Role Filter */}
              <div className="relative">
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none bg-white border border-slate-200 text-slate-700 text-xs font-medium py-2 pl-3.5 pr-8 rounded-xl focus:outline-hidden focus:border-blue-500 cursor-pointer shadow-2xs"
                >
                  <option value="All Roles">All Roles</option>
                  <option value="Org Admin">Org Admin</option>
                  <option value="Editor">Editor</option>
                  <option value="Viewer">Viewer</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none bg-white border border-slate-200 text-slate-700 text-xs font-medium py-2 pl-3.5 pr-8 rounded-xl focus:outline-hidden focus:border-blue-500 cursor-pointer shadow-2xs"
                >
                  <option value="All Status">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Invited">Invited</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Funnel Button */}
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setRoleFilter("All Roles");
                  setStatusFilter("All Status");
                  setCurrentPage(1);
                  showToast("Filters reset to default");
                }}
                title="Reset Filters"
                className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-slate-900 font-bold">
                <tr>
                  <th className="py-3 px-3 w-10 text-slate-600">#</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedMembers.length > 0 ? (
                  paginatedMembers.map((member, idx) => {
                    const avatar = getAvatarStyle(member.name);
                    const rowNumber = (currentPage - 1) * pageSize + idx + 1;
                    const isMenuOpen = activeMenuId === member.id;

                    return (
                      <tr
                        key={member.id}
                        className="hover:bg-slate-50/60 transition-colors group"
                      >
                        {/* Number */}
                        <td className="py-3.5 px-3 text-slate-400 font-medium">
                          {rowNumber}
                        </td>

                        {/* Name + Avatar */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full ${avatar.bg} ${avatar.text} font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs`}
                            >
                              {avatar.initials}
                            </div>
                            <span className="font-semibold text-slate-900 text-xs">
                              {member.name}
                            </span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-3.5 px-4 text-slate-500 font-medium">
                          {member.email}
                        </td>

                        {/* Role Badge */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold ${getRoleBadgeStyle(
                              member.role
                            )}`}
                          >
                            {member.role}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold ${getStatusBadgeStyle(
                              member.status
                            )}`}
                          >
                            {member.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="relative inline-flex items-center gap-1.5">
                            {/* Pencil / Edit Button */}
                            <button
                              type="button"
                              onClick={() => setEditingMember(member)}
                              title="Edit Member"
                              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            {/* More Actions Menu Button */}
                            <button
                              type="button"
                              onClick={() =>
                                setActiveMenuId(isMenuOpen ? null : member.id)
                              }
                              title="More Options"
                              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {/* Dropdown Menu */}
                            {isMenuOpen && (
                              <div className="absolute right-0 top-8 z-30 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 text-left text-xs font-medium animate-in fade-in zoom-in-95 duration-100">
                                {member.status === "Invited" && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleResendInvite(member.id, member.email)}
                                      className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-700 cursor-pointer"
                                    >
                                      <Mail className="w-3.5 h-3.5 text-blue-600" />
                                      <span>Resend Invite</span>
                                    </button>
                                    {member.inviteToken && (
                                      <button
                                        type="button"
                                        onClick={() => handleCopyInviteLink(member.inviteToken!)}
                                        className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-700 cursor-pointer"
                                      >
                                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                                        <span>Copy Invite Link</span>
                                      </button>
                                    )}
                                  </>
                                )}
                                <button
                                  onClick={() => {
                                    setEditingMember(member);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-700 cursor-pointer"
                                >
                                  <Pencil className="w-3.5 h-3.5 text-slate-500" />
                                  <span>Edit Details</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteMember(member.id, member.name)}
                                  className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-red-50 text-red-600 cursor-pointer border-t border-slate-100 mt-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Remove Member</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 text-center text-slate-400 font-medium"
                    >
                      No team members found matching your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            <div>
              Showing {filteredTeam.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
              {Math.min(currentPage * pageSize, filteredTeam.length)} of {filteredTeam.length}{" "}
              members
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              {/* Previous */}
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {/* Page Numbers */}
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                const isActive = currentPage === pageNum;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* Next */}
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              maxWidth: "460px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "1px solid #e2e8f0",
              boxSizing: "border-box",
            }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add Team Member</h3>
                <p className="text-xs text-slate-500 mt-0.5">Invite a member to your organization workspace</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setModalError(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{modalError}</span>
              </div>
            )}

            <form onSubmit={handleAddMember} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={isSubmitting}
                  value={newMember.name}
                  onChange={(e) => {
                    setNewMember({ ...newMember, name: e.target.value });
                    if (modalError) setModalError(null);
                  }}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-800 disabled:bg-slate-50 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  disabled={isSubmitting}
                  value={newMember.email}
                  onChange={(e) => {
                    setNewMember({ ...newMember, email: e.target.value });
                    if (modalError) setModalError(null);
                  }}
                  placeholder="sarah@acme.com"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-800 disabled:bg-slate-50 disabled:opacity-60"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  The user can redeem via the invite link or sign in directly with Google.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Role
                  </label>
                  <select
                    disabled={isSubmitting}
                    value={newMember.role}
                    onChange={(e) =>
                      setNewMember({
                        ...newMember,
                        role: e.target.value as "Org Admin" | "Editor" | "Viewer",
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 text-slate-800 font-medium disabled:bg-slate-50"
                  >
                    <option value="Editor">Editor</option>
                    <option value="Viewer">Viewer</option>
                    <option value="Org Admin">Org Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Status
                  </label>
                  <select
                    disabled={isSubmitting}
                    value={newMember.status}
                    onChange={(e) =>
                      setNewMember({
                        ...newMember,
                        status: e.target.value as "Active" | "Invited",
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 text-slate-800 font-medium disabled:bg-slate-50"
                  >
                    <option value="Invited">Invited (Pending)</option>
                    <option value="Active">Active</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setModalError(null);
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Invitation...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Send Invitation</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              maxWidth: "460px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "1px solid #e2e8f0",
              boxSizing: "border-box",
            }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Edit Member Details</h3>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateMember} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editingMember.name}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={editingMember.email}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, email: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Role
                  </label>
                  <select
                    value={editingMember.role}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        role: e.target.value as "Org Admin" | "Editor" | "Viewer",
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 text-slate-800 font-medium"
                  >
                    <option value="Editor">Editor</option>
                    <option value="Viewer">Viewer</option>
                    <option value="Org Admin">Org Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Status
                  </label>
                  <select
                    value={editingMember.status}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        status: e.target.value as "Active" | "Invited",
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 text-slate-800 font-medium"
                  >
                    <option value="Active">Active</option>
                    <option value="Invited">Invited</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </OrgLayout>
  );
}
