"use client";

import { useState } from "react";
import { toast } from "sonner";

const STATUSES = ["Draft", "Sent", "Paid", "Overdue"];

export default function InvoiceStatusUpdater({
  invoiceId,
  currentStatus,
}: {
  invoiceId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = async (newStatus: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setStatus(newStatus);
        toast.success("Status updated");
      } else {
        toast.error("Failed to update status");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <select
      value={status}
      onChange={(e) => handleChange(e.target.value)}
      disabled={isLoading}
      className={`text-xs px-3 py-2 rounded-lg border-0 font-medium cursor-pointer ${
        status === "paid"
          ? "bg-green-100 text-green-700"
          : status === "overdue"
          ? "bg-red-100 text-red-700"
          : status === "sent"
          ? "bg-blue-100 text-blue-700"
          : "bg-gray-100 text-gray-700"
      }`}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}