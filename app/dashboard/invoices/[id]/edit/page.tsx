export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import InvoiceForm from "@/components/InvoiceForm";

export const metadata = { title: "Edit Invoice" };

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const [invoice, clients] = await Promise.all([
    prisma.invoice.findUnique({
      where: { id, userId: session!.user.id },
      include: { items: true },
    }),
    prisma.client.findMany({
      where: { userId: session!.user.id },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!invoice) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Invoice</h1>
      <InvoiceForm
        clients={clients}
        invoiceNumber={invoice.number}
        invoice={invoice}
      />
    </div>
  );
}