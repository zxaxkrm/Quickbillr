"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";
import type { InvoicePDFProps } from "./InvoicePDF";

export default function DownloadPDFButton({ invoice }: { invoice: InvoicePDFProps["invoice"] }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const InvoicePDF = (await import("./InvoicePDF")).default;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = await pdf(<InvoicePDF invoice={invoice} /> as any).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoice.number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded");
    } catch (err) {
      toast.error("Failed to generate PDF");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-100 disabled:opacity-50"
    >
      <Download className="w-4 h-4" />
      {isLoading ? "Generating..." : "Download PDF"}
    </button>
  );
}