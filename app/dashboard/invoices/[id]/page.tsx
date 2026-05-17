export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import InvoiceStatusUpdater from "@/components/InvoiceStatusUpdater";
import SendInvoiceButton from "@/components/SendInvoiceButton";
import DownloadPDFButton from "@/components/DownloadPDFButton";
import DeleteInvoiceButton from "@/components/DeleteInvoiceButton";

export const metadata = { title: "Invoice" };

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const invoice = await prisma.invoice.findUnique({
    where: { id, userId: session!.user.id },
    include: {
      client: true,
      items: true,
      recurring: true,
      user: { select: { name: true, email: true } },
    },
  });

  if (!invoice) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">{invoice.number}</h1>
          <p className="text-gray-500 text-sm">{invoice.client.name}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <InvoiceStatusUpdater
            invoiceId={invoice.id}
            currentStatus={invoice.status}
          />
          <DownloadPDFButton invoice={invoice} />
          <SendInvoiceButton
            invoiceId={invoice.id}
            clientEmail={invoice.client.email}
          />

          <Link
            href={`/dashboard/invoices/${invoice.id}/recurring`}
            className="px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-100"
          >
            {invoice.recurring ? "Recurring ✓" : "Set Recurring"}
          </Link>
          <Link
            href={`/dashboard/invoices/${invoice.id}/edit`}
            className="px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-100"
          >
            Edit
          </Link>
          <DeleteInvoiceButton invoiceId={invoice.id} />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-8 space-y-8">
        
        <div className="sm:flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">INVOICE</h2>
            <p className="text-gray-500 text-sm mt-1">{invoice.number}</p>
          </div>
          <div className="sm:text-right text-sm space-y-1">
            <p className="font-semibold">{invoice.user.name}</p>
            <p className="text-gray-500">{invoice.user.email}</p>
          </div>
        </div>

        <div className="sm:flex justify-between text-sm">
          <div className="space-y-1">
            <p className="text-gray-500">Bill To</p>
            <p className="font-semibold">{invoice.client.name}</p>
            <p className="text-gray-500">{invoice.client.email}</p>
            {invoice.client.phone && (
              <p className="text-gray-500">{invoice.client.phone}</p>
            )}
            {invoice.client.address && (
              <p className="text-gray-500">{invoice.client.address}</p>
            )}
          </div>
          <div className="sm:text-right max-sm:flex justify-between space-y-1">
            <div>
              <p className="text-gray-500">Issue Date</p>
              <p>{new Date(invoice.issueDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-500">Due Date</p>
              <p>{new Date(invoice.dueDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="pb-3">Description</th>
                <th className="pb-3 text-right max-sm:hidden">Qty</th>
                <th className="pb-3 text-right max-sm:hidden">Rate</th>
                <th className="pb-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3">{item.description}</td>
                  <td className="py-3 text-right max-sm:hidden">{item.quantity}</td>
                  <td className="py-3 text-right max-sm:hidden">${item.rate.toFixed(2)}</td>
                  <td className="py-3 text-right">${item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="max-w-xs ml-auto space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span>${invoice.subtotal.toFixed(2)}</span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount ({invoice.discount}%)</span>
              <span>
                -${((invoice.subtotal * invoice.discount) / 100).toFixed(2)}
              </span>
            </div>
          )}
          {invoice.tax > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">Tax ({invoice.tax}%)</span>
              <span>
                $
                {(
                  ((invoice.subtotal -
                    (invoice.subtotal * invoice.discount) / 100) *
                    invoice.tax) /
                  100
                ).toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base border-t pt-2">
            <span>Total</span>
            <span>${invoice.total.toFixed(2)}</span>
          </div>
        </div>

        {invoice.notes && (
          <div className="border-t pt-4 text-sm text-gray-500">
            <p className="font-medium text-gray-700 mb-1">Notes</p>
            <p>{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
