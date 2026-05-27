import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// WeChat Pay async notification handler
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const outTradeNo = body.out_trade_no as string;
    const tradeState = body.trade_state as string;

    if (!outTradeNo) {
      return NextResponse.json(
        { code: "FAIL", message: "Missing out_trade_no" },
        { status: 400 }
      );
    }

    // Verify signature in production (WeChat Pay API v3 signature verification)
    // ...

    const order = await db.paymentOrder.findUnique({
      where: { outTradeNo },
    });

    if (!order) {
      return NextResponse.json(
        { code: "FAIL", message: "Order not found" },
        { status: 404 }
      );
    }

    if (order.status === "PAID") {
      return NextResponse.json({ code: "SUCCESS" });
    }

    if (tradeState === "SUCCESS") {
      const transactionId = body.transaction_id as string;

      await db.$transaction(async (tx: any) => {
        await tx.paymentOrder.update({
          where: { id: order.id },
          data: {
            status: "PAID",
            transactionId: transactionId || undefined,
            paidAt: new Date(),
          },
        });

        const user = await tx.user.findUnique({
          where: { id: order.userId },
          select: { credits: true },
        });

        if (user) {
          await tx.user.update({
            where: { id: order.userId },
            data: { credits: { increment: order.totalCredits } },
          });

          await tx.creditLog.create({
            data: {
              userId: order.userId,
              amount: order.totalCredits,
              balanceBefore: user.credits,
              balanceAfter: user.credits + order.totalCredits,
              type: "PURCHASE",
              description: `购买 ${order.totalCredits} 积分 (${order.method})`,
              paymentOrderId: order.id,
            },
          });
        }
      });
    }

    return NextResponse.json({ code: "SUCCESS" });
  } catch (error) {
    console.error("WeChat Pay notify error:", error);
    return NextResponse.json(
      { code: "FAIL", message: "Internal error" },
      { status: 500 }
    );
  }
}
