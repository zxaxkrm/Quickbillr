"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";

export default function SendInvoiceButton({
  invoiceId,
  clientEmail,
}: {
  invoiceId: string;
  clientEmail: string;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!confirm(`Send invoice to ${clientEmail}?`)) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/send`, {
        method: "POST",
      });

      if (res.ok) {
        toast.success(`Invoice sent to ${clientEmail}`);
      } else {
        toast.error("Failed to send invoice");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSend}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50"
    >
      <Send className="w-4 h-4" />
      {isLoading ? "Sending..." : "Send Invoice"}
    </button>
  );
}