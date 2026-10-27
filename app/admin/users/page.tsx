"use client";
import React, { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Plus, Search, SlidersHorizontal, MoreVertical, X } from "lucide-react";
import { getPlatformUsers, savePlatformUser, PlatformUser } from "@/lib/adminStorage";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<PlatformUser[]>(getPlatformUsers());
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "Admin" as "Super Admin" | "Support Admin" | "Admin",
  });

  const filteredUsers = users.filter((u) =>
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

  return (
    <AdminLayout activePath="/admin/users">
      <div className="space-y-6 max-w-7xl mx-auto font-sans">
        {/* Header matching Image 1 (Users Management) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Users</h1>
            <p className="text-xs text-slate-400 mt-0.5">Manage platform admin users (if multiple)</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>

        {/* Search & Filter Bar matching Image 1 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <button className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Users Table matching Image 1 */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100 text-[10px]">
              <tr>
                <th className="py-3.5 px-5">#</th>
                <th className="py-3.5 px-5">Name</th>
                <th className="py-3.5 px-5">Email</th>
                <th className="py-3.5 px-5">Role</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Last Login</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredUsers.map((u, i) => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-5 text-slate-400">{i + 1}</td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                        {u.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <span className="font-bold text-slate-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-slate-500">{u.email}</td>
                  <td className="py-4 px-5 text-slate-700">{u.role}</td>
                  <td className="py-4 px-5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </td>
                  <td className="py-4 px-5 text-slate-400 font-normal">{u.lastLogin}</td>
                  <td className="py-4 px-5 text-right">
                    <button className="p-1 text-slate-400 hover:text-slate-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal: Add User */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Add Platform User</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddUser} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Platform Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-xs text-slate-700"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Support Admin">Support Admin</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3.5 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                  >
                    Add User
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
