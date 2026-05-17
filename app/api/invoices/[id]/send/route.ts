import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { renderToBuffer } from "@react-pdf/renderer";
import InvoicePDF from "@/components/InvoicePDF";
import React from "react";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id, userId: session.user.id },
    include: {
      client: true,
      items: true,
      user: { select: { name: true, email: true } },
    },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }


  
const pdfBuffer = await renderToBuffer(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  React.createElement(InvoicePDF, { invoice }) as any
);

  await resend.emails.send({
    from: "QuickBillr <onboarding@resend.dev>",
    to: invoice.client.email,
    subject: `Invoice ${invoice.number} from ${invoice.user.name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Invoice ${invoice.number}</h2>
        <p>Hi ${invoice.client.name},</p>
        <p>Please find your invoice attached.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; color: #6b7280;">Invoice Number</td>
            <td style="padding: 8px; font-weight: bold;">${invoice.number}</td>
          </tr>
          <tr>
            <td style="padding: 8px; color: #6b7280;">Amount Due</td>
            <td style="padding: 8px; font-weight: bold;">$${invoice.total.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 8px; color: #6b7280;">Due Date</td>
            <td style="padding: 8px;">${new Date(invoice.dueDate).toLocaleDateString()}</td>
          </tr>
        </table>
        ${invoice.notes ? `<p style="color: #6b7280;">${invoice.notes}</p>` : ""}
        <p>Thank you for your business!</p>
        <p style="color: #6b7280;">— ${invoice.user.name}</p>
      </div>
    `,
    attachments: [
      {
        filename: `${invoice.number}.pdf`,
        content: pdfBuffer,
      },
    ],
  });

 
  await prisma.invoice.update({
    where: { id },
    data: { status: "sent" },
  });

  return NextResponse.json({ success: true });
}