"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Recurring {
  id: string;
  frequency: string;
  nextDate: Date;
  active: boolean;
}

export default function RecurringForm({
  invoiceId,
  recurring,
}: {
  invoiceId: string;
  recurring: Recurring | null;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    frequency: recurring?.frequency || "monthly",
    nextDate: recurring?.nextDate
      ? new Date(recurring.nextDate).toISOString().split("T")[0]
      : "",
    active: recurring?.active ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`/api/invoices/${invoiceId}/recurring`, {
        method: recurring ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success(recurring ? "Recurring updated" : "Recurring enabled");
        router.back();
        router.refresh();
      } else {
        toast.error("Failed to save recurring settings");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!confirm("Disable recurring for this invoice?")) return;
    setIsLoading(true);

    try {
      const res = await fetch(`/api/invoices/${invoiceId}/recurring`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Recurring disabled");
        router.back();
        router.refresh();
      } else {
        toast.error("Failed to disable recurring");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium">Frequency</label>
        <select
          value={form.frequency}
          onChange={(e) => setForm({ ...form, frequency: e.target.value })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Next Invoice Date</label>
        <input
          type="date"
          value={form.nextDate}
          onChange={(e) => setForm({ ...form, nextDate: e.target.value })}
          required
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="active"
          checked={form.active}
          onChange={(e) => setForm({ ...form, active: e.target.checked })}
          className="w-4 h-4"
        />
        <label htmlFor="active" className="text-sm font-medium">Active</label>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50"
        >
          {isLoading ? "Saving..." : recurring ? "Update" : "Enable Recurring"}
        </button>
        {recurring && (
          <button
            type="button"
            onClick={handleDisable}
            disabled={isLoading}
            className="px-6 py-2 border border-red-200 text-red-600 text-sm rounded-lg hover:bg-red-50 disabled:opacity-50"
          >
            Disable
          </button>
        )}
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}