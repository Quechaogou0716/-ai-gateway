import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Alipay async notification handler
export async function POST(req: Request) {
  try {
    const body = await req.formData();
    const outTradeNo = body.get("out_trade_no") as string;
    const tradeStatus = body.get("trade_status") as string;

    if (!outTradeNo) {
      return NextResponse.json({ error: "Missing out_trade_no" }, { status: 400 });
    }

    // Verify signature in production (verify with Alipay public key)
    // ...

    const order = await db.paymentOrder.findUnique({
      where: { outTradeNo },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === "PAID") {
      return new NextResponse("success");
    }

    if (tradeStatus === "TRADE_SUCCESS" || tradeStatus === "TRADE_FINISHED") {
      const transactionId = body.get("trade_no") as string;

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

    return new NextResponse("success");
  } catch (error) {
    console.error("Alipay notify error:", error);
    return new NextResponse("fail", { status: 500 });
  }
}
