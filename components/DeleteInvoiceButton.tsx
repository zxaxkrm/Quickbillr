"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function DeleteInvoiceButton({ invoiceId }: { invoiceId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Delete this invoice?")) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Invoice deleted");
        router.push("/dashboard/invoices");
        router.refresh();
      } else {
        toast.error("Failed to delete invoice");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isLoading}
      className="px-4 py-2 border border-red-200 text-red-600 text-sm rounded-lg hover:bg-red-50 disabled:opacity-50"
    >
      {isLoading ? "Deleting..." : "Delete"}
    </button>
  );
}