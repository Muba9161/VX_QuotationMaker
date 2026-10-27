"use client";
import Link from "next/link";
import React, { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Plus, Edit2, Check, X } from "lucide-react";
import { getSubscriptionPlans, saveSubscriptionPlan, SubscriptionPlan } from "@/lib/adminStorage";

export default function AdminSubscriptionPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>(getSubscriptionPlans());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    priceMonthly: 0,
    isFree: false,
    maxUsers: 5,
    maxDocuments: 200,
    storage: "1 GB",
    features: "Basic document creation, Email support",
    status: "Active" as "Active" | "Inactive",
  });

  const handleOpenModal = (plan?: SubscriptionPlan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        priceMonthly: plan.priceMonthly,
        isFree: plan.isFree,
        maxUsers: plan.maxUsers,
        maxDocuments: plan.maxDocuments,
        storage: plan.storage,
        features: plan.features.join(", "),
        status: plan.status,
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: "",
        priceMonthly: 999,
        isFree: false,
        maxUsers: 10,
        maxDocuments: 500,
        storage: "2 GB",
        features: "Custom Letterhead, PDF Downloads",
        status: "Active",
      });
    }
    setIsModalOpen(true);
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const newPlan: SubscriptionPlan = {
      id: editingPlan ? editingPlan.id : "plan-" + Date.now(),
      name: formData.name,
      priceMonthly: formData.isFree ? 0 : Number(formData.priceMonthly),
      isFree: formData.isFree,
      maxUsers: Number(formData.maxUsers),
      maxDocuments: Number(formData.maxDocuments),
      storage: formData.storage,
      features: formData.features.split(",").map(f => f.trim()),
      status: formData.status,
    };
    saveSubscriptionPlan(newPlan);
    setPlans(getSubscriptionPlans());
    setIsModalOpen(false);
  };

  return (
    <AdminLayout activePath="/admin/subscription-plans">
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Subscription Plans</h1>
            <p className="text-sm text-slate-500 mt-0.5">Create and manage subscription plans for organizations</p>
          </div>
          <Link
            href="/admin/subscription-plans/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Plan</span>
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">#</th>
                <th className="py-3.5 px-5">Plan Name</th>
                <th className="py-3.5 px-5">Price (Monthly)</th>
                <th className="py-3.5 px-5">Max Users</th>
                <th className="py-3.5 px-5">Max Documents</th>
                <th className="py-3.5 px-5">Storage</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {plans.map((p, index) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-5 text-slate-400 font-medium">{index + 1}</td>
                  <td className="py-4 px-5 font-bold text-slate-900">{p.name}</td>
                  <td className="py-4 px-5 font-medium">
                    {p.isFree ? "₹0 (Free)" : `₹${p.priceMonthly.toLocaleString("en-IN")}`}
                  </td>
                  <td className="py-4 px-5">{p.maxUsers}</td>
                  <td className="py-4 px-5">{p.maxDocuments > 100000 ? "Unlimited" : p.maxDocuments}</td>
                  <td className="py-4 px-5 font-mono text-xs">{p.storage}</td>
                  <td className="py-4 px-5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button
                      onClick={() => handleOpenModal(p)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">
                  {editingPlan ? "Edit Subscription Plan" : "Add New Plan"}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSavePlan} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Plan Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm"
                    placeholder="e.g. Basic, Pro, Enterprise"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Price (₹ per month)</label>
                    <input
                      type="number"
                      disabled={formData.isFree}
                      value={formData.isFree ? 0 : formData.priceMonthly}
                      onChange={(e) => setFormData({ ...formData, priceMonthly: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm disabled:bg-slate-100"
                    />
                  </div>
                  <div className="pt-5">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isFree}
                        onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-xs font-semibold text-slate-700">Free Plan</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Max Users</label>
                    <input
                      type="number"
                      value={formData.maxUsers}
                      onChange={(e) => setFormData({ ...formData, maxUsers: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Max Documents</label>
                    <input
                      type="number"
                      value={formData.maxDocuments}
                      onChange={(e) => setFormData({ ...formData, maxDocuments: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Storage Limit</label>
                  <input
                    type="text"
                    value={formData.storage}
                    onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm"
                    placeholder="e.g. 10 GB"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Features (comma separated)</label>
                  <textarea
                    rows={2}
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm"
                  >
                    Save Plan
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
