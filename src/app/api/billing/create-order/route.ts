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

  const { planId, method, transactionId } = await req.json();
  const plan = PLANS.find((p) => p.id === planId);

  if (!plan) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  if (method === "MANUAL" && !transactionId?.trim()) {
    return NextResponse.json({ error: "请提供交易流水号" }, { status: 400 });
  }

  const outTradeNo = `AG-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const totalCredits = plan.credits + plan.bonusCredits;

  // Ensure the plan exists in DB or create it
  let dbPlan = await db.creditPlan.findUnique({ where: { id: plan.id } });
  if (!dbPlan) {
    dbPlan = await db.creditPlan.create({
      data: {
        id: plan.id,
        name: plan.name,
        credits: plan.credits,
        priceCents: plan.priceCents,
        bonusCredits: plan.bonusCredits,
      },
    });
  }

  const order = await db.paymentOrder.create({
    data: {
      userId: (session.user as any).id,
      creditPlanId: dbPlan.id,
      amountCents: plan.priceCents,
      credits: plan.credits,
      bonusCredits: plan.bonusCredits,
      totalCredits,
      method,
      outTradeNo,
      transactionId: transactionId?.trim() || null,
    },
  });

  return NextResponse.json({
    orderId: order.id,
    outTradeNo: order.outTradeNo,
    amount: plan.priceCents / 100,
    credits: totalCredits,
  });
}
