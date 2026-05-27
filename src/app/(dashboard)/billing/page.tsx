"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
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
  Zap,
  Coins,
  Gift,
  QrCode,
  Loader2,
  Smartphone,
} from "lucide-react";

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState<PlanDefinition | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"ALIPAY" | "WECHAT" | null>(null);
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  async function handlePurchase(plan: PlanDefinition) {
    setSelectedPlan(plan);
    setPaymentMethod(null);
    setQrCodeUrl(null);
  }

  async function handlePayment(method: "ALIPAY" | "WECHAT") {
    if (!selectedPlan) return;
    setPaymentMethod(method);
    setLoading(true);

    try {
      const res = await fetch("/api/billing/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan.id,
          method,
        }),
      });
      const data = await res.json();
      if (data.qrCodeUrl) {
        setQrCodeUrl(data.qrCodeUrl);
        setOrderId(data.orderId);
        toast.success("订单已创建，请扫码支付");
      } else {
        toast.info("支付功能需要配置支付商户信息");
      }
    } catch {
      toast.error("创建订单失败");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-5xl space-y-8">
      <FadeInUp>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">充值积分</h1>
          <p className="text-sm text-muted-foreground mt-1">
            选择合适的套餐充值积分，用于调用 AI 模型 API
          </p>
        </div>
      </FadeInUp>

      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANS.map((plan) => (
          <StaggerItem key={plan.id}>
            <ScaleOnHover>
              <button
                onClick={() => handlePurchase(plan)}
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
        {selectedPlan && (
          <motion.div
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass rounded-2xl p-6 shadow-apple">
              <h2 className="text-lg font-semibold mb-4">
                选择支付方式 — {selectedPlan.name} ({selectedPlan.credits + selectedPlan.bonusCredits}{" "}
                积分 / {formatRMB(selectedPlan.priceCents)})
              </h2>

              <div className="flex gap-3 mb-6">
                {(["ALIPAY", "WECHAT"] as const).map((method) => (
                  <button
                    key={method}
                    onClick={() => handlePayment(method)}
                    disabled={loading}
                    className={cn(
                      "flex items-center gap-2 px-5 py-3 rounded-xl border-2 transition-all text-sm font-medium",
                      paymentMethod === method
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-primary/30 text-muted-foreground"
                    )}
                  >
                    <Smartphone className="w-4 h-4" />
                    {method === "ALIPAY" ? "支付宝" : "微信支付"}
                  </button>
                ))}
              </div>

              {loading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    正在创建订单...
                  </span>
                </div>
              )}

              {qrCodeUrl && (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  <div className="w-48 h-48 mx-auto bg-white rounded-2xl p-3 mb-4 flex items-center justify-center">
                    <QrCode className="w-32 h-32 text-gray-800" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    请使用
                    {paymentMethod === "ALIPAY" ? "支付宝" : "微信"}
                    扫描二维码支付
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    支付完成后积分将自动到账
                  </p>
                </motion.div>
              )}

              {!qrCodeUrl && !loading && (
                <p className="text-xs text-muted-foreground">
                  提示: 真实支付需要配置支付宝/微信支付商户信息。当前为模拟环境。
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
