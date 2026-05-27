"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FadeInUp } from "@/components/motion/fade-in-up";
import { Button } from "@/components/ui/button";
import { Copy, Check, ChevronRight, Terminal } from "lucide-react";
import { toast } from "sonner";

const codeExamples = {
  curl: `curl https://your-domain.com/api/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "你好！"}],
    "stream": false
  }'`,

  python: `from openai import OpenAI

client = OpenAI(
    base_url="https://your-domain.com/api/v1",
    api_key="YOUR_API_KEY"
)

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "你好！"}],
    stream=False
)

print(response.choices[0].message.content)`,

  nodejs: `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://your-domain.com/api/v1",
  apiKey: "YOUR_API_KEY"
});

const response = await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: "你好！" }],
  stream: false
});

console.log(response.choices[0].message.content);`,
};

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<keyof typeof codeExamples>("python");
  const [copied, setCopied] = useState(false);

  function copyCode() {
    navigator.clipboard.writeText(codeExamples[activeTab]);
    setCopied(true);
    toast.success("已复制到剪贴板");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-3xl space-y-8">
      <FadeInUp>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">API 文档</h1>
          <p className="text-sm text-muted-foreground mt-1">
            快速接入 AI Gateway，开始调用 AI 模型
          </p>
        </div>
      </FadeInUp>

      <FadeInUp delay={0.05}>
        <div className="glass rounded-2xl p-6 shadow-apple space-y-4">
          <h2 className="font-semibold">1. 获取 API Key</h2>
          <p className="text-sm text-muted-foreground">
            前往{" "}
            <a href="/dashboard/api-keys" className="text-primary hover:underline">
              API Keys 页面
            </a>{" "}
            创建一个新的 API Key。创建后请立即保存，Key 仅显示一次。
          </p>
        </div>
      </FadeInUp>

      <FadeInUp delay={0.1}>
        <div className="glass rounded-2xl p-6 shadow-apple space-y-4">
          <h2 className="font-semibold">2. 调用 API</h2>
          <p className="text-sm text-muted-foreground">
            我们的 API 完全兼容 OpenAI 格式，只需修改 Base URL 和 API Key 即可使用任意 OpenAI 兼容的 SDK 或工具。
          </p>

          <div className="flex gap-1 p-1 rounded-xl bg-secondary">
            {Object.keys(codeExamples).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 text-xs font-medium py-2 rounded-lg transition-all ${
                  activeTab === tab
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "curl" ? "cURL" : tab === "python" ? "Python" : "Node.js"}
              </button>
            ))}
          </div>

          <div className="relative">
            <pre className="bg-[#1c1c1e] text-[#e5e5e7] rounded-xl p-4 overflow-x-auto text-xs font-mono leading-relaxed">
              <code>{codeExamples[activeTab]}</code>
            </pre>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20"
              onClick={copyCode}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-white/70" />
              )}
            </Button>
          </div>
        </div>
      </FadeInUp>

      <FadeInUp delay={0.15}>
        <div className="glass rounded-2xl p-6 shadow-apple space-y-4">
          <h2 className="font-semibold">3. 支持的端点</h2>
          <div className="space-y-2">
            {[
              { method: "POST", path: "/api/v1/chat/completions", desc: "聊天补全 (支持流式 SSE)" },
              { method: "GET", path: "/api/v1/models", desc: "获取可用模型列表" },
            ].map((endpoint) => (
              <div
                key={endpoint.path}
                className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50"
              >
                <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full font-mono">
                  {endpoint.method}
                </span>
                <code className="text-xs font-mono flex-1">{endpoint.path}</code>
                <span className="text-xs text-muted-foreground">{endpoint.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </FadeInUp>

      <FadeInUp delay={0.2}>
        <div className="glass rounded-2xl p-6 shadow-apple space-y-4">
          <h2 className="font-semibold">4. 兼容工具</h2>
          <p className="text-sm text-muted-foreground">
            以下工具和库可直接配置 AI Gateway 使用:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              "OpenAI SDK (Python/Node.js)",
              "LangChain",
              "Vercel AI SDK",
              "Continue.dev",
              "Cursor",
              "Aider",
              "ShellGPT",
              "ChatGPT-Next-Web",
            ].map((tool) => (
              <div
                key={tool}
                className="flex items-center gap-2 text-xs text-muted-foreground p-2"
              >
                <ChevronRight className="w-3 h-3 text-primary/50" />
                {tool}
              </div>
            ))}
          </div>
        </div>
      </FadeInUp>
    </div>
  );
}
