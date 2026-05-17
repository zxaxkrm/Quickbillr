import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    clientId, number, issueDate, dueDate,
    notes, tax, discount, subtotal, total, items,
  } = await req.json();

  const invoice = await prisma.invoice.create({
    data: {
      userId: session.user.id,
      clientId,
      number,
      issueDate: new Date(issueDate),
      dueDate: new Date(dueDate),
      notes,
      tax,
      discount,
      subtotal,
      total,
      items: {
        create: items.map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
        })),
      },
    },
  });

  return NextResponse.json(invoice);
}