"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FadeInUp } from "@/components/motion/fade-in-up";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/motion/stagger-list";
import {
  Sparkles,
  Zap,
  Shield,
  Cpu,
  ArrowRight,
  Layers,
  Smartphone,
  Globe,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Zap,
    title: "毫秒级响应",
    desc: "全球节点加速，低延迟流式输出，实时 SSR 渲染",
  },
  {
    icon: Layers,
    title: "多模型聚合",
    desc: "一个 API 接入 OpenAI、Anthropic、Google 等全部主流模型",
  },
  {
    icon: Shield,
    title: "安全可靠",
    desc: "API Key SHA-256 加密，积分交易原子化，数据严格隔离",
  },
  {
    icon: Smartphone,
    title: "按量付费",
    desc: "用多少付多少，无需月费。支持支付宝和微信支付充值",
  },
];

const models = [
  { name: "GPT-4o", provider: "OpenAI" },
  { name: "GPT-4o Mini", provider: "OpenAI" },
  { name: "Claude Sonnet 4.6", provider: "Anthropic" },
  { name: "Claude Haiku 4.5", provider: "Anthropic" },
  { name: "Gemini 1.5 Pro", provider: "Google" },
  { name: "Gemini 1.5 Flash", provider: "Google" },
];

const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#000000] overflow-x-hidden">
      {/* Nav */}
      <header className="glass sticky top-0 z-50 border-b border-border/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm tracking-tight">AI Gateway</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="rounded-xl text-xs">
                登录
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="rounded-xl text-xs">
                免费注册
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-24 pb-16 px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-[oklch(0.55_0.2_260/8%)] blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] rounded-full bg-[oklch(0.6_0.2_180/5%)] blur-[100px]" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springTransition }}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/8 text-primary text-xs font-medium mb-6">
              <Sparkles className="w-3 h-3" />
              现已支持 6+ 主流 AI 模型
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springTransition, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]"
          >
            一站式接入
            <br />
            <span className="text-primary">前沿 AI 模型</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springTransition, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed"
          >
            AI Gateway 是你和世界顶级 AI 模型之间的桥梁。一条 API Key，接入
            OpenAI、Anthropic、Google 等全部模型。按量付费，零门槛。
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springTransition, delay: 0.3 }}
            className="mt-8 flex items-center justify-center gap-3"
          >
            <Link href="/register">
              <Button size="lg" className="rounded-2xl text-sm h-12 px-6">
                免费开始使用
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link href="/dashboard/docs">
              <Button
                variant="secondary"
                size="lg"
                className="rounded-2xl text-sm h-12 px-6"
              >
                查看文档
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Code snippet preview */}
      <section className="max-w-3xl mx-auto px-4 pb-20 relative z-10">
        <FadeInUp>
          <div className="glass rounded-3xl shadow-apple p-2 overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border/30">
              <div className="w-3 h-3 rounded-full bg-red-400/60" />
              <div className="w-3 h-3 rounded-full bg-amber-400/60" />
              <div className="w-3 h-3 rounded-full bg-emerald-400/60" />
              <span className="ml-2 text-[10px] text-muted-foreground font-mono">
                terminal — bash
              </span>
            </div>
            <pre className="p-5 text-xs sm:text-sm font-mono text-foreground leading-relaxed bg-transparent overflow-x-auto">
              <code>
                <span className="text-muted-foreground">{`# 只需修改 Base URL 和 API Key
`}</span>
                <span className="text-primary">{`curl `}</span>
                <span className="text-foreground">{`https://your-domain.com/api/v1/chat/completions \\\n`}</span>
                <span className="text-muted-foreground">{`  -H `}</span>
                <span className="text-emerald-600 dark:text-emerald-400">{`"Content-Type: application/json"`}</span>
                <span className="text-foreground">{` \\\n`}</span>
                <span className="text-muted-foreground">{`  -H `}</span>
                <span className="text-emerald-600 dark:text-emerald-400">{`"Authorization: Bearer YOUR_API_KEY"`}</span>
                <span className="text-foreground">{` \\\n`}</span>
                <span className="text-muted-foreground">{`  -d `}</span>
                <span className="text-amber-600 dark:text-amber-400">{`'{"model": "gpt-4o-mini", "messages": [{"role": "user", "content": "Hello!"}]}'`}</span>
              </code>
            </pre>
          </div>
        </FadeInUp>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <FadeInUp>
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                为什么选择 AI Gateway
              </h2>
              <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
                一个平台，连接所有 AI。简单、快速、安全的 API 中继服务。
              </p>
            </div>
          </FadeInUp>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feat) => (
              <StaggerItem key={feat.title}>
                <div className="glass rounded-2xl p-6 shadow-apple h-full hover:shadow-apple-hover transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <feat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1.5">{feat.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Supported models */}
      <section className="py-20 px-4 bg-white/40 dark:bg-white/[3%]">
        <div className="max-w-5xl mx-auto">
          <FadeInUp>
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                支持的模型
              </h2>
              <p className="text-muted-foreground mt-3">
                持续接入最新、最强大的 AI 模型
              </p>
            </div>
          </FadeInUp>

          <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {models.map((m) => (
              <StaggerItem key={m.name}>
                <div className="glass rounded-2xl p-4 shadow-apple text-center hover:shadow-apple-hover transition-shadow cursor-default">
                  <Cpu className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-semibold">{m.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {m.provider}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <FadeInUp>
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                灵活的定价
              </h2>
              <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
                按量付费，用多少付多少。积分永不过期，随时充值。
              </p>
            </div>
          </FadeInUp>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              { name: "入门版", price: "¥10", credits: "100" },
              { name: "标准版", price: "¥45", credits: "550", popular: true },
              { name: "专业版", price: "¥99", credits: "1,350" },
              { name: "旗舰版", price: "¥399", credits: "5,800" },
            ].map((plan, i) => (
              <FadeInUp key={plan.name} delay={i * 0.05}>
                <div
                  className={cn(
                    "glass rounded-2xl p-5 text-center shadow-apple hover:shadow-apple-hover transition-shadow",
                    plan.popular && "ring-2 ring-primary shadow-[0_0_0_6px_rgba(0,122,255,0.08)]"
                  )}
                >
                  {plan.popular && (
                    <span className="text-[10px] font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded-full mb-2 inline-block">
                      最受欢迎
                    </span>
                  )}
                  <p className="text-sm font-semibold">{plan.name}</p>
                  <p className="text-2xl font-bold mt-1">{plan.price}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {plan.credits} 积分
                  </p>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <FadeInUp>
          <div className="max-w-2xl mx-auto text-center glass rounded-3xl p-10 shadow-apple">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              准备好开始了吗？
            </h2>
            <p className="text-muted-foreground mt-3 mb-6">
              注册即得免费积分，立即体验前沿 AI 模型
            </p>
            <Link href="/register">
              <Button size="lg" className="rounded-2xl h-12 px-8 text-sm">
                免费注册
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </FadeInUp>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="text-xs text-muted-foreground">
              &copy; 2026 AI Gateway
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/dashboard/docs" className="hover:text-foreground transition-colors">
              文档
            </Link>
            <Link href="/login" className="hover:text-foreground transition-colors">
              登录
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
