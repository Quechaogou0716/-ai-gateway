import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await db.paymentOrder.findMany({
    where: {
      userId: (session.user as any).id,
      status: "PENDING",
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      amountCents: true,
      totalCredits: true,
      transactionId: true,
      outTradeNo: true,
      method: true,
      status: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ orders });
}
