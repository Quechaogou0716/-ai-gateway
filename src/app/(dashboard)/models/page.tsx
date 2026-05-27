"use client";

import { FadeInUp } from "@/components/motion/fade-in-up";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/motion/stagger-list";
import { MODELS, type Provider } from "@/config/models";
import { cn } from "@/lib/utils";
import { Cpu, Zap, Eye, Layers } from "lucide-react";

const providerLabels: Record<Provider, string> = {
  OPENAI: "OpenAI",
  ANTHROPIC: "Anthropic",
  GOOGLE: "Google",
};

const providerColors: Record<Provider, string> = {
  OPENAI: "bg-emerald-500/10 text-emerald-600",
  ANTHROPIC: "bg-violet-500/10 text-violet-600",
  GOOGLE: "bg-amber-500/10 text-amber-600",
};

export default function ModelsPage() {
  return (
    <div className="max-w-5xl space-y-6">
      <FadeInUp>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">模型列表</h1>
          <p className="text-sm text-muted-foreground mt-1">
            所有可用 AI 模型及其定价
          </p>
        </div>
      </FadeInUp>

      <StaggerContainer className="space-y-2">
        {MODELS.map((model) => (
          <StaggerItem key={model.modelId}>
            <div className="glass rounded-2xl p-5 shadow-apple flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-sm">{model.displayName}</h3>
                    <span
                      className={cn(
                        "text-[10px] font-medium px-2 py-0.5 rounded-full",
                        providerColors[model.provider]
                      )}
                    >
                      {providerLabels[model.provider]}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {model.description}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    {model.supportsVision && (
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Eye className="w-3 h-3" /> 支持视觉
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Layers className="w-3 h-3" /> {(model.contextWindow / 1000).toFixed(0)}K 上下文
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground mb-0.5">每千 Token 价格</div>
                <div className="text-xs">
                  <span className="text-muted-foreground">输入</span>{" "}
                  <span className="font-semibold tabular-nums">{model.inputCreditPrice}</span>{" "}
                  积分
                </div>
                <div className="text-xs">
                  <span className="text-muted-foreground">输出</span>{" "}
                  <span className="font-semibold tabular-nums">{model.outputCreditPrice}</span>{" "}
                  积分
                </div>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  );
}
