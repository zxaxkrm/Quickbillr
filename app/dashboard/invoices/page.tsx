export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";

export const metadata = { title: "Invoices" };

export default async function InvoicesPage() {
  const session = await auth();

  const invoices = await prisma.invoice.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
    include: { client: { select: { name: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Link
          href="/dashboard/invoices/new"
          className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800"
        >
          <Plus className="w-4 h-4" />
          New Invoice
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center space-y-3">
          <FileText className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-gray-500 text-sm">No invoices yet.</p>
          <Link
            href="/dashboard/invoices/new"
            className="text-sm text-blue-600 hover:underline"
          >
            Create your first invoice
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden max-sm:hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs text-gray-500">
                  <th className="px-4 py-3">Invoice</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map(
                  (invoice: {
                    id: string;
                    number: string;
                    total: number;
                    status: string;
                    dueDate: Date;
                    client: { name: string };
                  }) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">
                        {invoice.number}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {invoice.client.name}
                      </td>
                      <td className="px-4 py-3">
                        ${invoice.total.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            invoice.status === "paid"
                              ? "bg-green-100 text-green-700"
                              : invoice.status === "overdue"
                                ? "bg-red-100 text-red-700"
                                : invoice.status === "sent"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/invoices/${invoice.id}`}
                          className="text-xs px-3 py-1 border border-gray-200 rounded-md hover:bg-gray-100"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 sm:hidden">
            {invoices.map((invoice) => (
              <Link key={invoice.id} href={`/dashboard/invoices/${invoice.id}`}>
                <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{invoice.number}</p>
                      <p className="text-xs text-gray-500">
                        {invoice.client.name}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : invoice.status === "overdue"
                            ? "bg-red-100 text-red-700"
                            : invoice.status === "sent"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="font-bold">
                      ${invoice.total.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      Due {new Date(invoice.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
