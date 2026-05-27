"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, Loader2, RefreshCw } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("");

  const fetchOrders = useCallback(async () => {
    try {
      const url = filter
        ? `/api/admin/orders?status=${filter}`
        : "/api/admin/orders";
      const res = await fetch(url);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      toast.error("加载订单失败");
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  async function handleConfirm(orderId: string) {
    setConfirming(orderId);
    try {
      const res = await fetch("/api/admin/confirm-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      if (res.ok) {
        toast.success("订单已确认，积分已到账");
        fetchOrders();
      } else {
        const data = await res.json();
        toast.error(data.error || "确认失败");
      }
    } catch {
      toast.error("网络错误");
    }
    setConfirming(null);
  }

  const statusLabel: Record<string, string> = {
    PENDING: "待确认",
    COMPLETED: "已完成",
    CANCELLED: "已取消",
  };

  const statusColor: Record<string, string> = {
    PENDING: "bg-amber-500/10 text-amber-600",
    COMPLETED: "bg-emerald-500/10 text-emerald-600",
    CANCELLED: "bg-muted-foreground/10 text-muted-foreground",
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">订单管理</h1>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm rounded-xl border border-border bg-background px-3 py-1.5"
          >
            <option value="">全部订单</option>
            <option value="PENDING">待确认</option>
            <option value="COMPLETED">已完成</option>
            <option value="CANCELLED">已取消</option>
          </select>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchOrders}
            className="rounded-xl"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="glass rounded-2xl p-8 shadow-apple text-center">
          <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
        </div>
      ) : orders.length === 0 ? (
        <div className="glass rounded-2xl p-8 shadow-apple text-center text-sm text-muted-foreground">
          暂无订单
        </div>
      ) : (
        <div className="glass rounded-2xl shadow-apple overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">用户</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">套餐</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">金额</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">积分</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">方式</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">流水号</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">状态</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">时间</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">操作</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any) => (
                  <tr key={order.id} className="border-b border-border/30 last:border-0">
                    <td className="p-4">
                      <p className="font-medium">{order.user?.name || "—"}</p>
                      <p className="text-xs text-muted-foreground">{order.user?.email}</p>
                    </td>
                    <td className="p-4 text-muted-foreground">{order.creditPlanId}</td>
                    <td className="p-4 font-medium tabular-nums">
                      ¥{(order.amountCents / 100).toFixed(2)}
                    </td>
                    <td className="p-4 tabular-nums">{order.totalCredits}</td>
                    <td className="p-4">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary">
                        {order.method === "MANUAL" ? "手动" : order.method}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground font-mono">
                      {order.transactionId || "—"}
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[order.status] || ""}`}
                      >
                        {statusLabel[order.status] || order.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString("zh-CN")}
                    </td>
                    <td className="p-4 text-right">
                      {order.status === "PENDING" && (
                        <Button
                          size="sm"
                          onClick={() => handleConfirm(order.id)}
                          disabled={confirming === order.id}
                          className="rounded-xl"
                        >
                          {confirming === order.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                          ) : (
                            <Check className="w-3.5 h-3.5 mr-1" />
                          )}
                          确认到账
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
