export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import RecurringForm from "@/components/RecurringForm";

export const metadata = { title: "Recurring Invoice" };

export default async function RecurringPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const invoice = await prisma.invoice.findUnique({
    where: { id, userId: session!.user.id },
    include: { recurring: true },
  });

  if (!invoice) notFound();

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold">Recurring Settings</h1>
      <p className="text-gray-500 text-sm">
        Set up automatic invoice generation for {invoice.number}
      </p>
      <RecurringForm invoiceId={invoice.id} recurring={invoice.recurring} />
    </div>
  );
}