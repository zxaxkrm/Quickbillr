import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import InvoiceForm from "@/components/InvoiceForm";

export const metadata = { title: "New Invoice" };

export default async function NewInvoicePage() {
  const session = await auth();

  const clients = await prisma.client.findMany({
    where: { userId: session!.user.id },
    orderBy: { name: "asc" },
  });

  if (clients.length === 0) redirect("/dashboard/clients/new");


  const count = await prisma.invoice.count({
    where: { userId: session!.user.id },
  });
  const invoiceNumber = `INV-${String(count + 1).padStart(3, "0")}`;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">New Invoice</h1>
      <InvoiceForm clients={clients} invoiceNumber={invoiceNumber} />
    </div>
  );
}