"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, CreditCard, Activity, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { NumberTicker } from "@/components/motion/number-ticker";

export default function AdminPage() {
  const [stats, setStats] = useState({
    users: 0,
    orders: 0,
    calls: 0,
    revenue: 0,
  });

  const cards = [
    { label: "总用户数", value: stats.users, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "总订单", value: stats.orders, icon: CreditCard, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "API 调用", value: stats.calls, icon: Activity, color: "text-violet-500", bg: "bg-violet-500/10" },
    { label: "总收入 (元)", value: stats.revenue, icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">管理概览</h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 30 }}
            className="glass rounded-2xl p-5 shadow-apple"
          >
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", card.bg)}>
              <card.icon className={cn("w-4 h-4", card.color)} />
            </div>
            <p className="text-xs text-muted-foreground font-medium">{card.label}</p>
            <p className="text-xl font-semibold tabular-nums mt-1">
              <NumberTicker value={card.value} />
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
