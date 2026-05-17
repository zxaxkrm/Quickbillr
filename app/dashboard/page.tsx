import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import RevenueChart from "@/components/RevenueChart";
import InvoiceStatusChart from "@/components/InvoiceStatusChart";
import Link from "next/link";

export const dynamic = "force-dynamic";

type InvoiceSummary = {
  total: number;
  status: string;
  issueDate: Date;
};

export default async function DashboardPage() {
  const session = await auth();

  const [totalInvoices, totalClients, paidInvoices, overdueInvoices, allInvoices] =
    await Promise.all([
      prisma.invoice.count({ where: { userId: session!.user.id } }),
      prisma.client.count({ where: { userId: session!.user.id } }),
      prisma.invoice.aggregate({
        where: { userId: session!.user.id, status: "paid" },
        _sum: { total: true },
      }),
      prisma.invoice.count({
        where: { userId: session!.user.id, status: "overdue" },
      }),
      prisma.invoice.findMany({
        where: { userId: session!.user.id },
        select: { total: true, status: true, issueDate: true },
      }),
    ]);

  const recentInvoices = await prisma.invoice.findMany({
    where: { userId: session!.user.id },
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { client: { select: { name: true } } },
  });

  
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    return {
      month: date.toLocaleString("default", { month: "short" }),
      year: date.getFullYear(),
      monthIndex: date.getMonth(),
    };
  });

  

  const revenueData = months.map(({ month, year, monthIndex }) => ({
    month,
    revenue: allInvoices
      .filter((inv: InvoiceSummary) => {
        const d = new Date(inv.issueDate);
        return (
          inv.status === "paid" &&
          d.getMonth() === monthIndex &&
          d.getFullYear() === year
        );
      })
      .reduce((sum: number, inv: InvoiceSummary) => sum + inv.total, 0),
  }));


  const statusData = ["draft", "sent", "paid", "overdue"].map((status) => ({
    name: status,
    value: allInvoices.filter((inv: InvoiceSummary) => inv.status === status).length,
  }));

  const stats = [
    {
      label: "Total Revenue",
      value: `$${(paidInvoices._sum.total ?? 0).toLocaleString()}`,
      color: "text-green-600",
    },
    {
      label: "Total Invoices",
      value: totalInvoices,
      color: "text-blue-600",
    },
    {
      label: "Total Clients",
      value: totalClients,
      color: "text-purple-600",
    },
    {
      label: "Overdue",
      value: overdueInvoices,
      color: "text-red-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {session?.user?.name?.split(" ")[0]}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Here&apos;s what&apos;s happening with your invoices.
        </p>
      </div>

   
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-gray-200 rounded-xl p-5 space-y-2"
          >
            <p className="text-xs text-gray-500">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

     
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RevenueChart data={revenueData} />
        </div>
        <div>
          <InvoiceStatusChart data={statusData} />
        </div>
      </div>

     
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Recent Invoices</h2>
          <Link href={"/dashboard/invoices"} className="text-sm text-blue-600 hover:underline">
            View all
          </Link>
        </div>

        {recentInvoices.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">
            No invoices yet. Create your first invoice!
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="pb-3">Invoice</th>
                <th className="pb-3">Client</th>
                <th className="pb-3 max-sm:hidden">Amount</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 max-sm:hidden">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentInvoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="py-3 font-medium">{invoice.number}</td>
                  <td className="py-3 text-gray-500">{invoice.client.name}</td>
                  <td className="py-3 max-sm:hidden">${invoice.total.toLocaleString()}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      invoice.status === "paid"
                        ? "bg-green-100 text-green-700"
                        : invoice.status === "overdue"
                        ? "bg-red-100 text-red-700"
                        : invoice.status === "sent"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="py-3 text-gray-500 text-xs max-sm:hidden">
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}