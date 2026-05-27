"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Zap,
  Key,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Copy,
  Check,
} from "lucide-react";
import Link from "next/link";
import { NumberTicker } from "@/components/motion/number-ticker";
import { ScaleOnHover } from "@/components/motion/scale-on-hover";
import { FadeInUp } from "@/components/motion/fade-in-up";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Stats {
  credits: number;
  apiKeyCount: number;
  totalCalls: number;
  totalTokens: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats>({
    credits: 0,
    apiKeyCount: 0,
    totalCalls: 0,
    totalTokens: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [balRes, keysRes, usageRes] = await Promise.all([
          fetch("/api/user/balance"),
          fetch("/api/user/api-keys"),
          fetch("/api/user/usage?limit=0"),
        ]);
        const balance = await balRes.json();
        const keys = await keysRes.json();
        const usage = await usageRes.json();
        setStats({
          credits: balance.credits || 0,
          apiKeyCount: keys.apiKeys?.length || 0,
          totalCalls: usage.total || 0,
          totalTokens: usage.totalTokens || 0,
        });
      } catch (e) {
        // ignore
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  const statCards = [
    {
      label: "可用积分",
      value: stats.credits,
      icon: CreditCard,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "API Keys",
      value: stats.apiKeyCount,
      icon: Key,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "API 调用",
      value: stats.totalCalls,
      icon: Activity,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
    {
      label: "总 Token",
      value: stats.totalTokens,
      icon: Zap,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="max-w-5xl space-y-8">
      <FadeInUp>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            你好，{session?.user?.name || "用户"}
          </h1>
          <p className="text-muted-foreground mt-1">
            欢迎使用 AI Gateway 控制台
          </p>
        </div>
      </FadeInUp>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <FadeInUp key={card.label} delay={i * 0.05}>
            <ScaleOnHover>
              <div className="glass rounded-2xl p-5 shadow-apple hover:shadow-apple-hover transition-shadow cursor-default">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
                    card.bg
                  )}
                >
                  <card.icon className={cn("w-5 h-5", card.color)} />
                </div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  {card.label}
                </p>
                <p className="text-2xl font-semibold tabular-nums mt-1 text-foreground">
                  {loading ? (
                    <span className="text-muted-foreground">--</span>
                  ) : (
                    <NumberTicker value={card.value} />
                  )}
                </p>
              </div>
            </ScaleOnHover>
          </FadeInUp>
        ))}
      </div>

      <FadeInUp delay={0.15}>
        <div className="glass rounded-2xl p-6 shadow-apple">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">快速开始</h2>
            <Link href="/dashboard/docs">
              <Button variant="ghost" size="sm" className="rounded-xl text-xs">
                查看文档
                <ArrowUpRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickStartStep
              num={1}
              title="创建 API Key"
              desc="在 API Keys 页面创建一个新的 Key，用于调用 API。"
              href="/dashboard/api-keys"
            />
            <QuickStartStep
              num={2}
              title="充值积分"
              desc="选择合适的积分套餐，通过支付宝或微信充值。"
              href="/dashboard/billing"
            />
            <QuickStartStep
              num={3}
              title="调用 API"
              desc="使用 OpenAI SDK 或任意兼容工具，将 Base URL 指向我们即可。"
              href="/dashboard/docs"
            />
          </div>
        </div>
      </FadeInUp>
    </div>
  );
}

function QuickStartStep({
  num,
  title,
  desc,
  href,
}: {
  num: number;
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <Link href={href} className="block group">
      <div className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold mb-3">
          {num}
        </div>
        <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">{desc}</p>
      </div>
    </Link>
  );
}
