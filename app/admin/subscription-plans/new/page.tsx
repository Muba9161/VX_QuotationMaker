"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import { ArrowLeft, Save, Check } from "lucide-react";
import { saveSubscriptionPlan, SubscriptionPlan } from "@/lib/adminStorage";

export default function AddNewPlanPage() {
  const router = useRouter();
  const [name, setName] = useState("Basic");
  const [priceMonthly, setPriceMonthly] = useState(0);
  const [isFree, setIsFree] = useState(true);
  const [maxUsers, setMaxUsers] = useState(5);
  const [maxDocuments, setMaxDocuments] = useState(200);
  const [storage, setStorage] = useState("1 GB");
  const [features, setFeatures] = useState("Basic document creation, Email support");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPlan: SubscriptionPlan = {
      id: "plan-" + Date.now(),
      name,
      priceMonthly: isFree ? 0 : Number(priceMonthly),
      isFree,
      maxUsers: Number(maxUsers),
      maxDocuments: Number(maxDocuments),
      storage,
      features: features.split(",").map(f => f.trim()),
      status,
    };
    saveSubscriptionPlan(newPlan);
    router.push("/admin/subscription-plans");
  };

  return (
    <AdminLayout activePath="/admin/subscription-plans">
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Top Header matching Screen 6 */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/subscription-plans"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Link>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Add New Plan</h1>
          </div>

          <button
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
          >
            <span>Save Plan</span>
          </button>
        </div>

        {/* Form Body matching Screen 6 */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Plan Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Price (₹ per month)</label>
                <input
                  type="number"
                  disabled={isFree}
                  value={isFree ? 0 : priceMonthly}
                  onChange={(e) => setPriceMonthly(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm disabled:opacity-60"
                />
              </div>

              <div className="pt-5">
                <label className="inline-flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFree}
                    onChange={(e) => {
                      setIsFree(e.target.checked);
                      if (e.target.checked) setPriceMonthly(0);
                    }}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-xs font-semibold text-slate-700">Free Plan</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Max Users</label>
                <input
                  type="number"
                  value={maxUsers}
                  onChange={(e) => setMaxUsers(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Max Documents</label>
                <input
                  type="number"
                  value={maxDocuments}
                  onChange={(e) => setMaxDocuments(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Storage Limit</label>
              <select
                value={storage}
                onChange={(e) => setStorage(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700"
              >
                <option value="1 GB">1 GB</option>
                <option value="5 GB">5 GB</option>
                <option value="10 GB">10 GB</option>
                <option value="50 GB">50 GB</option>
                <option value="Unlimited">Unlimited</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Features (comma separated)</label>
              <textarea
                rows={3}
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
