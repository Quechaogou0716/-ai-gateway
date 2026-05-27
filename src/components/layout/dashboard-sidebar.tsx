"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Key,
  CreditCard,
  BarChart3,
  Cpu,
  BookOpen,
  Sparkles,
} from "lucide-react";

const links = [
  { href: "/dashboard", label: "概览", icon: LayoutDashboard },
  { href: "/dashboard/api-keys", label: "API Keys", icon: Key },
  { href: "/dashboard/billing", label: "充值", icon: CreditCard },
  { href: "/dashboard/usage", label: "用量", icon: BarChart3 },
  { href: "/dashboard/models", label: "模型", icon: Cpu },
  { href: "/dashboard/docs", label: "文档", icon: BookOpen },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-60 glass border-r border-border/50 flex flex-col z-40">
      <div className="p-5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-base tracking-tight">
            AI Gateway
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {links.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== "/dashboard" && pathname.startsWith(link.href));

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-primary/8 rounded-xl"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 35,
                  }}
                />
              )}
              <link.icon className="w-4 h-4 relative z-10" />
              <span className="relative z-10">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50">
        <div className="text-xs text-muted-foreground">
          &copy; 2026 AI Gateway
        </div>
      </div>
    </aside>
  );
}
