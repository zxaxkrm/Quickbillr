"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string;
}

interface LineItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export default function InvoiceForm({
  clients,
  invoiceNumber,
  invoice,
}: {
  clients: Client[];
  invoiceNumber: string;
 invoice?: {
  id: string;
  clientId: string;
  number: string;
  issueDate: Date;
  dueDate: Date;
  notes?: string | null;
  tax: number;
  discount: number;
  items: { description: string; quantity: number; rate: number; amount: number }[];
}
}) {
  const router = useRouter();
  const isEditing = !!invoice;
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    clientId: invoice?.clientId || "",
    number: invoice?.number || invoiceNumber,
    issueDate: invoice?.issueDate
      ? new Date(invoice.issueDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    dueDate: invoice?.dueDate
      ? new Date(invoice.dueDate).toISOString().split("T")[0]
      : "",
    notes: invoice?.notes || "",
    tax: invoice?.tax || 0,
    discount: invoice?.discount || 0,
  });

  const [items, setItems] = useState<LineItem[]>(
    invoice?.items || [{ description: "", quantity: 1, rate: 0, amount: 0 }]
  );

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    if (field === "quantity" || field === "rate") {
      updated[index].amount = Number(updated[index].quantity) * Number(updated[index].rate);
    }
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, rate: 0, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount = (subtotal * form.discount) / 100;
  const taxAmount = ((subtotal - discountAmount) * form.tax) / 100;
  const total = subtotal - discountAmount + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(
        isEditing ? `/api/invoices/${invoice.id}` : "/api/invoices",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            items,
            subtotal,
            total,
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        toast.success(isEditing ? "Invoice updated" : "Invoice created");
        router.push(`/dashboard/invoices/${data.id}`);
        router.refresh();
      } else {
        toast.error("Failed to save invoice");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Invoice Details */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold">Invoice Details</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Invoice Number</label>
            <input
              value={form.number}
              onChange={(e) => setForm({ ...form, number: e.target.value })}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Client</label>
            <select
              value={form.clientId}
              onChange={(e) => setForm({ ...form, clientId: e.target.value })}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Select client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Issue Date</label>
            <input
              type="date"
              value={form.issueDate}
              onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Due Date</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold">Line Items</h2>

        <div className="space-y-3">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 text-xs text-gray-500 max-sm:hidden">
            <div className="col-span-5">Description</div>
            <div className="col-span-2">Quantity</div>
            <div className="col-span-2">Rate ($)</div>
            <div className="col-span-2">Amount</div>
            <div className="col-span-1"></div>
          </div>

          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-center">
              <input
                value={item.description}
                onChange={(e) => updateItem(index, "description", e.target.value)}
                placeholder="Description"
                required
                className="col-span-12 sm:col-span-5 border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                min="1"
                required
                className="col-span-4 sm:col-span-2 border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="number"
                value={item.rate}
                onChange={(e) => updateItem(index, "rate", Number(e.target.value))}
                min="0"
                step="0.01"
                required
                className="col-span-4 sm:col-span-2 border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
              <div className="col-span-3 sm:col-span-2 text-sm font-medium">
                ${item.amount.toFixed(2)}
              </div>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="col-span-1 text-red-400 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
        >
          <Plus className="w-4 h-4" />
          Add Line Item
        </button>
      </div>

      {/* Summary */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold">Summary</h2>

        <div className="grid grid-cols-2 gap-4 max-w-sm ml-auto">
          <div className="space-y-1">
            <label className="text-sm font-medium">Discount (%)</label>
            <input
              type="number"
              value={form.discount}
              onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })}
              min="0"
              max="100"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Tax (%)</label>
            <input
              type="number"
              value={form.tax}
              onChange={(e) => setForm({ ...form, tax: Number(e.target.value) })}
              min="0"
              max="100"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="max-w-sm ml-auto space-y-2 text-sm border-t pt-4">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {form.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount ({form.discount}%)</span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>
          )}
          {form.tax > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">Tax ({form.tax}%)</span>
              <span>${taxAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base border-t pt-2">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-2">
        <label className="text-sm font-medium">Notes <span className="text-gray-400">(optional)</span></label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={3}
          placeholder="Payment terms, bank details, thank you note..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50"
        >
          {isLoading ? "Saving..." : isEditing ? "Update Invoice" : "Create Invoice"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}