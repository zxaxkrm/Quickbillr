"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = {
  paid: "#16a34a",
  sent: "#2563eb",
  draft: "#6b7280",
  overdue: "#dc2626",
};

interface StatusData {
  name: string;
  value: number;
}

export default function InvoiceStatusChart({ data }: { data: StatusData[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
      <h2 className="font-semibold">Invoice Status</h2>
      {data.every((d) => d.value === 0) ? (
        <p className="text-sm text-gray-400 py-10 text-center">No invoice data yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data.filter((d) => d.value > 0)}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
            >
              {data
                .filter((d) => d.value > 0)
                .map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[entry.name as keyof typeof COLORS]}
                  />
                ))}
            </Pie>
            <Tooltip formatter={(value) => [value, "Invoices"]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}