import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { frequency, nextDate, active } = await req.json();

  const recurring = await prisma.recurring.create({
    data: {
      invoiceId: id,
      frequency,
      nextDate: new Date(nextDate),
      active,
    },
  });

  return NextResponse.json(recurring);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { frequency, nextDate, active } = await req.json();

  const recurring = await prisma.recurring.update({
    where: { invoiceId: id },
    data: {
      frequency,
      nextDate: new Date(nextDate),
      active,
    },
  });

  return NextResponse.json(recurring);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await prisma.recurring.delete({
    where: { invoiceId: id },
  });

  return NextResponse.json({ success: true });
}