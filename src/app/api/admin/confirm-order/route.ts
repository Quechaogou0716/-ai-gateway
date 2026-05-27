import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { orderId } = await req.json();

  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  const order = await db.paymentOrder.findUnique({ where: { id: orderId } });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status !== "PENDING") {
    return NextResponse.json({ error: "Order is not pending" }, { status: 400 });
  }

  // Atomically update order status, add credits, and create credit log
  const result = await db.$transaction(async (tx) => {
    const updatedOrder = await tx.paymentOrder.update({
      where: { id: orderId },
      data: { status: "COMPLETED", paidAt: new Date() },
    });

    const user = await tx.user.update({
      where: { id: order.userId },
      data: { credits: { increment: order.totalCredits } },
    });

    await tx.creditLog.create({
      data: {
        userId: order.userId,
        amount: order.totalCredits,
        balanceBefore: user.credits - order.totalCredits,
        balanceAfter: user.credits,
        type: "CHARGE",
        description: `充值 ${order.totalCredits} 积分 (订单 ${order.outTradeNo})`,
        paymentOrderId: order.id,
      },
    });

    return updatedOrder;
  });

  return NextResponse.json({ success: true, order: result });
}
