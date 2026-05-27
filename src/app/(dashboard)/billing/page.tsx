"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FadeInUp } from "@/components/motion/fade-in-up";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/motion/stagger-list";
import { ScaleOnHover } from "@/components/motion/scale-on-hover";
import { PLANS, formatRMB, type PlanDefinition } from "@/config/plans";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Check,
  Coins,
  Gift,
  Loader2,
  Send,
  Clock,
  Copy,
} from "lucide-react";

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState<PlanDefinition | null>(null);
  const [txnId, setTxnId] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [qrCodeBase64, setQrCodeBase64] = useState("");

  useEffect(() => {
    fetch("/api/user/pending-orders")
      .then((r) => r.json())
      .then((d) => setPendingOrders(d.orders || []))
      .catch(() => {});
    fetch("/api/settings/payment-qr")
      .then((r) => r.json())
      .then((d) => setQrCodeBase64(d.qrCodeBase64 || ""))
      .catch(() => {});
  }, []);

  async function handleSubmit() {
    if (!selectedPlan || !txnId.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/billing/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan.id,
          method: "MANUAL",
          transactionId: txnId.trim(),
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        toast.success("订单已提交，等待管理员确认");
      } else {
        const data = await res.json();
        toast.error(data.error || "提交失败");
      }
    } catch {
      toast.error("网络错误");
    }
    setLoading(false);
  }

  const totalCredits = selectedPlan
    ? selectedPlan.credits + selectedPlan.bonusCredits
    : 0;

  return (
    <div className="max-w-5xl space-y-8">
      <FadeInUp>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">充值积分</h1>
          <p className="text-sm text-muted-foreground mt-1">
            选择合适的套餐，向管理员转账后提交订单
          </p>
        </div>
      </FadeInUp>

      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANS.map((plan) => (
          <StaggerItem key={plan.id}>
            <ScaleOnHover>
              <button
                onClick={() => {
                  setSelectedPlan(plan);
                  setSubmitted(false);
                  setTxnId("");
                }}
                className={cn(
                  "w-full text-left glass rounded-2xl p-5 shadow-apple transition-all relative overflow-hidden",
                  selectedPlan?.id === plan.id &&
                    "ring-2 ring-primary shadow-[0_0_0_4px_rgba(0,122,255,0.1)]"
                )}
              >
                {plan.popular && (
                  <div className="absolute top-3 right-3">
                    <span className="text-[10px] font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      推荐
                    </span>
                  </div>
                )}
                <p className="text-sm font-semibold mb-1">{plan.name}</p>
                <div className="flex items-baseline gap-0.5 mb-3">
                  <span className="text-2xl font-bold tabular-nums">
                    {formatRMB(plan.priceCents)}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Coins className="w-3.5 h-3.5" />
                    <span className="font-semibold text-foreground tabular-nums">
                      {plan.credits}
                    </span>{" "}
                    积分
                  </div>
                  {plan.bonusCredits > 0 && (
                    <div className="flex items-center gap-2 text-xs text-emerald-600">
                      <Gift className="w-3.5 h-3.5" />
                      <span className="font-semibold tabular-nums">
                        +{plan.bonusCredits}
                      </span>{" "}
                      赠送
                    </div>
                  )}
                </div>
              </button>
            </ScaleOnHover>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <AnimatePresence>
        {selectedPlan && !submitted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="glass rounded-2xl p-6 shadow-apple space-y-4">
              <h2 className="text-lg font-semibold">
                确认充值 — {selectedPlan.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                金额 <span className="font-bold text-foreground">{formatRMB(selectedPlan.priceCents)}</span>，
                到账 <span className="font-bold text-foreground">{totalCredits}</span> 积分
                {selectedPlan.bonusCredits > 0 && (
                  <span className="text-emerald-600">
                    （含 {selectedPlan.bonusCredits} 赠送）
                  </span>
                )}
              </p>

              {qrCodeBase64 ? (
                <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-secondary/30">
                  <p className="text-sm font-semibold">请扫码支付</p>
                  <img
                    src={qrCodeBase64}
                    alt="收款码"
                    className="w-48 h-48 rounded-xl border border-border bg-white object-contain"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    使用微信或支付宝扫描上方二维码
                    <br />
                    转账 <span className="font-bold text-foreground">{formatRMB(selectedPlan.priceCents)}</span>{" "}
                    完成后填写下方流水号
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">
                    请先向管理员转账
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    联系管理员获取收款二维码或转账方式。转账完成后，填写下方的交易流水号提交审核。
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="txnId">微信/支付宝交易流水号</Label>
                <Input
                  id="txnId"
                  placeholder="在微信/支付宝账单里找到这笔转账的流水号"
                  value={txnId}
                  onChange={(e) => setTxnId(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={loading || !txnId.trim()}
                className="rounded-xl w-full"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                提交审核
              </Button>
            </div>
          </motion.div>
        )}

        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="glass rounded-2xl p-8 shadow-apple text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4"
              >
                <Check className="w-7 h-7 text-emerald-500" />
              </motion.div>
              <h2 className="text-lg font-semibold mb-2">已提交</h2>
              <p className="text-sm text-muted-foreground">
                管理员确认后积分将自动到账，请耐心等待
              </p>
              <Button
                variant="ghost"
                className="mt-4 rounded-xl"
                onClick={() => {
                  setSubmitted(false);
                  setSelectedPlan(null);
                }}
              >
                充值其他套餐
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {pendingOrders.length > 0 && (
        <FadeInUp>
          <div className="glass rounded-2xl p-6 shadow-apple">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              待审核订单
            </h2>
            <div className="space-y-2">
              {pendingOrders.map((order: any) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-secondary/50"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {order.totalCredits} 积分 / ¥
                      {(order.amountCents / 100).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      流水号: {order.transactionId || "—"}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-600 font-medium">
                    等待确认
                  </span>
                </div>
              ))}
            </div>
          </div>
        </FadeInUp>
      )}
    </div>
  );
}
