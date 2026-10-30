"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import OrgLayout from "@/components/OrgLayout";
import { Search, UserPlus, CheckCircle2, AlertCircle } from "lucide-react";
import TeamSummaryCards from "@/components/team/TeamSummaryCards";
import TeamTable, { TeamMemberItem } from "@/components/team/TeamTable";
import AddMemberModal from "@/components/team/AddMemberModal";
import EditMemberModal from "@/components/team/EditMemberModal";
import ConfirmModal from "@/components/ConfirmModal";
import { getOrgTeam } from "@/lib/orgStorage";

interface ApiMember {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status: string;
  title?: string | null;
  phone?: string | null;
}

interface ApiInvitation {
  id: string;
  email: string;
  role: string;
  inviteToken?: string;
}

export default function TeamMembersPage() {
  const [team, setTeam] = useState<TeamMemberItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMemberItem | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Deletion confirm modal
  const [memberToDelete, setMemberToDelete] = useState<TeamMemberItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadTeamMembers = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/organization/team", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data?.data) {
          const { members = [], invitations = [] } = data.data;
          const mapped: TeamMemberItem[] = [
            ...members.map((u: ApiMember) => ({
              id: u.id,
              name: u.name || u.email.split("@")[0],
              email: u.email,
              role: (u.role === "ORG_ADMIN" ? "Org Admin" : u.role === "VIEWER" ? "Viewer" : "Editor") as "Org Admin" | "Editor" | "Viewer",
              status: (u.status === "ACTIVE"
                ? "Active"
                : u.status === "INACTIVE"
                ? "Inactive"
                : u.status === "SUSPENDED"
                ? "Suspended"
                : "Invited") as "Active" | "Invited" | "Inactive" | "Suspended",
              title: u.title,
              phone: u.phone,
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
    } catch {}
    setTeam(getOrgTeam() as TeamMemberItem[]);
  }, []);

  useEffect(() => {
    let active = true;
    const fetchTeam = async () => {
      await loadTeamMembers();
      if (!active) return;
    };
    void fetchTeam();
    return () => {
      active = false;
    };
  }, [loadTeamMembers]);

  // Summary counts
  const totalCount = team.length;
  const adminCount = team.filter((m) => m.role === "Org Admin").length;
  const editorCount = team.filter((m) => m.role === "Editor").length;
  const viewerCount = team.filter((m) => m.role === "Viewer").length;

  // Filtered and paginated list
  const filteredTeam = useMemo(() => {
    return team.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "All Roles" || m.role === roleFilter;
      const matchesStatus = statusFilter === "All Status" || m.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [team, searchTerm, roleFilter, statusFilter]);

  const totalPages = Math.ceil(filteredTeam.length / pageSize) || 1;
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTeam.slice(start, start + pageSize);
  }, [filteredTeam, currentPage]);

  const handleResendInvite = async (id: string, email: string) => {
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
    const inviteUrl = `${window.location.origin}/invite?token=${token}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(inviteUrl);
    }
    showToast("Invite link copied to clipboard!", "success");
  };

  const handleConfirmDelete = async () => {
    if (!memberToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/organization/team/${memberToDelete.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        await fetch(`/api/v1/organization/team/invite/${memberToDelete.id}`, {
          method: "DELETE",
          credentials: "include",
        });
      }
      showToast(`Removed ${memberToDelete.name} from team.`, "success");
      await loadTeamMembers();
      setMemberToDelete(null);
    } catch {
      showToast("Failed to remove team member.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <OrgLayout activePath="/team">
      {/* Toast Notification */}
      {toast && (
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
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          {toast.type === "success" ? (
            <CheckCircle2 style={{ width: "16px", height: "16px", color: "#34d399", flexShrink: 0 }} />
          ) : (
            <AlertCircle style={{ width: "16px", height: "16px", color: "#f87171", flexShrink: 0 }} />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          paddingBottom: "64px",
        }}
      >
        {/* Page Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "14px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: 800,
                color: "#0f172a",
                margin: 0,
                letterSpacing: "-0.4px",
              }}
            >
              Team Members
            </h1>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0 0" }}>
              Manage your organization members and workspace access
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 700,
              border: "none",
              boxShadow: "0 2px 6px rgba(37,99,235,0.25)",
              cursor: "pointer",
            }}
          >
            <UserPlus style={{ width: "16px", height: "16px" }} />
            <span>Add Member</span>
          </button>
        </div>

        {/* 4 Stat Summary Cards */}
        <TeamSummaryCards
          total={totalCount}
          admins={adminCount}
          editors={editorCount}
          viewers={viewerCount}
        />

        {/* Search & Filters */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            backgroundColor: "#ffffff",
            padding: "14px 18px",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <div
            style={{
              position: "relative",
              flex: 1,
              minWidth: "260px",
              maxWidth: "400px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Search
              style={{
                width: "16px",
                height: "16px",
                color: "#94a3b8",
                position: "absolute",
                left: "12px",
              }}
            />
            <input
              type="text"
              placeholder="Search members by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: "100%",
                padding: "8px 12px 8px 36px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                outline: "none",
                backgroundColor: "#ffffff",
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                backgroundColor: "#ffffff",
                fontSize: "13px",
                color: "#334155",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="All Roles">All Roles</option>
              <option value="Org Admin">Org Admin</option>
              <option value="Editor">Editor</option>
              <option value="Viewer">Viewer</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                backgroundColor: "#ffffff",
                fontSize: "13px",
                color: "#334155",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="All Status">All Status</option>
              <option value="Active">Active</option>
              <option value="Invited">Invited</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Member Table */}
        <TeamTable
          members={paginatedMembers}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onResendInvite={handleResendInvite}
          onCopyInviteLink={handleCopyInviteLink}
          onRequestDelete={(m) => setMemberToDelete(m)}
          onEditMember={(m) => setEditingMember(m)}
        />
      </div>

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={(email, delivery) => {
          loadTeamMembers();
          if (delivery && !delivery.delivered) {
            showToast(`Invitation created, but email delivery failed (${delivery.error}). You can copy the invite link.`, "error");
          } else {
            showToast(`Invitation sent to ${email} successfully! Email dispatched via Gmail SMTP.`, "success");
          }
        }}
      />

      {/* Edit Member Modal */}
      {editingMember && (
        <EditMemberModal
          key={editingMember.id}
          isOpen={!!editingMember}
          member={editingMember}
          onClose={() => setEditingMember(null)}
          onSuccess={async (updatedName) => {
            showToast(
              updatedName ? `Updated ${updatedName}'s details successfully!` : "Team member details updated successfully!",
              "success"
            );
            await loadTeamMembers();
          }}
          onResendInvite={handleResendInvite}
          onCopyInviteLink={handleCopyInviteLink}
        />
      )}

      {/* Styled Confirmation Dialog for Deleting Member */}
      <ConfirmModal
        isOpen={!!memberToDelete}
        title="Remove Team Member"
        description={`Are you sure you want to remove ${memberToDelete?.name} (${memberToDelete?.email}) from this organization? They will immediately lose access to workspace documents and templates.`}
        confirmLabel="Remove Member"
        cancelLabel="Cancel"
        variant="danger"
        isConfirming={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setMemberToDelete(null)}
      />
    </OrgLayout>
  );
}
