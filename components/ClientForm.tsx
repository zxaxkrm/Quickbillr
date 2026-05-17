"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ClientForm({ client }: {
  client?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    address?: string | null;
  }
}) {
  const router = useRouter();
  const isEditing = !!client;
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    name: client?.name || "",
    email: client?.email || "",
    phone: client?.phone || "",
    address: client?.address || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(
        isEditing ? `/api/clients/${client.id}` : "/api/clients",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      if (res.ok) {
        toast.success(isEditing ? "Client updated" : "Client created");
        router.push("/dashboard/clients");
        router.refresh();
      } else {
        toast.error("Failed to save client");
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
        <label className="text-sm font-medium">Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Phone <span className="text-gray-400">(optional)</span></label>
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Address <span className="text-gray-400">(optional)</span></label>
        <textarea
          name="address"
          value={form.address}
          onChange={handleChange}
          rows={3}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50"
        >
          {isLoading ? "Saving..." : isEditing ? "Update Client" : "Add Client"}
        </button>
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