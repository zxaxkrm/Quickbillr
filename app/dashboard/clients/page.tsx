export const dynamic = "force-dynamic"

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, Plus } from "lucide-react";


export const metadata = { title: "Clients" };

export default async function ClientsPage() {
  const session = await auth();

  const clients = await prisma.client.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { invoices: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clients</h1>
        <Link
          href="/dashboard/clients/new"
          className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center space-y-3">
          <Users className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-gray-500 text-sm">No clients yet.</p>
          <Link href="/dashboard/clients/new" className="text-sm text-blue-600 hover:underline">
            Add your first client
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs text-gray-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3 max-sm:hidden">Phone</th>
                <th className="px-4 py-3 max-sm:hidden">Invoices</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
            {clients.map((client: { id: string; name: string; email: string; phone: string | null; _count: { invoices: number } }) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{client.name}</td>
                  <td className="px-4 py-3 text-gray-500">{client.email}</td>
                  <td className="px-4 py-3 text-gray-500 max-sm:hidden">{client.phone ?? "—"}</td>
                  <td className="px-4 py-3 max-sm:hidden">{client._count.invoices}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/clients/${client.id}`}
                      className="text-xs px-3 py-1 border border-gray-200 rounded-md hover:bg-gray-100"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}