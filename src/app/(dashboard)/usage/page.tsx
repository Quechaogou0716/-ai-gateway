"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FadeInUp } from "@/components/motion/fade-in-up";
import { NumberTicker } from "@/components/motion/number-ticker";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Zap, Activity, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UsageData {
  id: string;
  modelId: string;
  requestTokens: number;
  responseTokens: number;
  totalTokens: number;
  creditsConsumed: number;
  status: string;
  createdAt: string;
}

export default function UsagePage() {
  const [logs, setLogs] = useState<UsageData[]>([]);
  const [total, setTotal] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/usage?limit=50")
      .then((r) => r.json())
      .then((data) => {
        setLogs(data.logs || []);
        setTotal(data.total || 0);
        setTotalTokens(data.totalTokens || 0);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-5xl space-y-6">
      <FadeInUp>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">用量明细</h1>
          <p className="text-sm text-muted-foreground mt-1">
            查看你的 API 调用记录和 Token 消耗
          </p>
        </div>
      </FadeInUp>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "总调用次数", value: total, icon: Activity, color: "text-violet-500", bg: "bg-violet-500/10" },
          { label: "总 Token 数", value: totalTokens, icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "活跃模型", value: new Set(logs.map((l) => l.modelId)).size, icon: BarChart3, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        ].map((stat, i) => (
          <FadeInUp key={stat.label} delay={i * 0.05}>
            <div className="glass rounded-2xl p-5 shadow-apple">
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", stat.bg)}>
                <stat.icon className={cn("w-4 h-4", stat.color)} />
              </div>
              <p className="text-xs text-muted-foreground font-medium uppercase">{stat.label}</p>
              <p className="text-xl font-semibold tabular-nums mt-1">
                {loading ? "--" : <NumberTicker value={stat.value} />}
              </p>
            </div>
          </FadeInUp>
        ))}
      </div>

      <FadeInUp delay={0.1}>
        <div className="glass rounded-2xl shadow-apple overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">时间</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">模型</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">输入 Token</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">输出 Token</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">消耗积分</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-border/30 last:border-0 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(log.createdAt), "MM-dd HH:mm", { locale: zhCN })}
                    </td>
                    <td className="px-5 py-3 text-xs font-medium">{log.modelId}</td>
                    <td className="px-5 py-3 text-xs text-right tabular-nums">{log.requestTokens.toLocaleString()}</td>
                    <td className="px-5 py-3 text-xs text-right tabular-nums">{log.responseTokens.toLocaleString()}</td>
                    <td className="px-5 py-3 text-xs text-right tabular-nums font-medium">
                      -{log.creditsConsumed.toLocaleString()}
                    </td>
                  </motion.tr>
                ))}
                {!loading && logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-sm text-muted-foreground">
                      暂无调用记录
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </FadeInUp>
    </div>
  );
}
