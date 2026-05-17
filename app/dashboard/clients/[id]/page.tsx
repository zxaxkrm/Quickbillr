export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ClientForm from "@/components/ClientForm";
import DeleteClientButton from "@/components/DeleteClientButton";

export const metadata = { title: "Edit Client" };

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) notFound();

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Client</h1>
        <DeleteClientButton clientId={client.id} />
      </div>
      <ClientForm client={client} />
    </div>
  );
}