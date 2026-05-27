import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { PLANS } from "@/config/plans";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { planId, method } = await req.json();
  const plan = PLANS.find((p) => p.id === planId);

  if (!plan) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const outTradeNo = `AG-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const totalCredits = plan.credits + plan.bonusCredits;

  const order = await db.paymentOrder.create({
    data: {
      userId: (session.user as any).id,
      creditPlanId: plan.id,
      amountCents: plan.priceCents,
      credits: plan.credits,
      bonusCredits: plan.bonusCredits,
      totalCredits,
      method,
      outTradeNo,
    },
  });

  // In production, call payment gateway API here to get QR code URL
  // For now, return the order info (QR code display is simulated in frontend)
  return NextResponse.json({
    orderId: order.id,
    outTradeNo: order.outTradeNo,
    qrCodeUrl: `/api/billing/qr/${order.outTradeNo}`,
    amount: plan.priceCents / 100,
    credits: totalCredits,
  });
}
