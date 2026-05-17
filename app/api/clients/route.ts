import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, email, phone, address } = await req.json();

  const client = await prisma.client.create({
    data: {
      userId: session.user.id,
      name,
      email,
      phone: phone || null,
      address: address || null,
    },
  });

  return NextResponse.json(client);
}