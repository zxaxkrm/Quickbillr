import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { name, email, phone, address } = await req.json();

  const client = await prisma.client.update({
    where: { id, userId: session.user.id },
    data: { name, email, phone: phone || null, address: address || null },
  });

  return NextResponse.json(client);
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

  await prisma.client.delete({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ success: true });
}