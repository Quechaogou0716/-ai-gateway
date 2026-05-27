export type Provider = "OPENAI" | "ANTHROPIC" | "GOOGLE";

export interface ModelDefinition {
  modelId: string;
  provider: Provider;
  displayName: string;
  description: string;
  contextWindow: number;
  maxOutputTokens: number;
  inputCreditPrice: number;
  outputCreditPrice: number;
  supportsVision: boolean;
  supportsStreaming: boolean;
}

export const MODELS: ModelDefinition[] = [
  {
    modelId: "gpt-4o",
    provider: "OPENAI",
    displayName: "GPT-4o",
    description: "OpenAI 最新多模态旗舰模型，兼顾速度与智能",
    contextWindow: 128000,
    maxOutputTokens: 16384,
    inputCreditPrice: 5.0,
    outputCreditPrice: 15.0,
    supportsVision: true,
    supportsStreaming: true,
  },
  {
    modelId: "gpt-4o-mini",
    provider: "OPENAI",
    displayName: "GPT-4o Mini",
    description: "轻量级模型，适合日常任务，性价比极高",
    contextWindow: 128000,
    maxOutputTokens: 16384,
    inputCreditPrice: 0.3,
    outputCreditPrice: 0.6,
    supportsVision: true,
    supportsStreaming: true,
  },
  {
    modelId: "gpt-4-turbo",
    provider: "OPENAI",
    displayName: "GPT-4 Turbo",
    description: "强大的推理和生成能力",
    contextWindow: 128000,
    maxOutputTokens: 4096,
    inputCreditPrice: 10.0,
    outputCreditPrice: 30.0,
    supportsVision: true,
    supportsStreaming: true,
  },
  {
    modelId: "claude-sonnet-4-6",
    provider: "ANTHROPIC",
    displayName: "Claude Sonnet 4.6",
    description: "Anthropic 最新中端模型，速度与智能的完美平衡",
    contextWindow: 200000,
    maxOutputTokens: 8192,
    inputCreditPrice: 6.0,
    outputCreditPrice: 18.0,
    supportsVision: true,
    supportsStreaming: true,
  },
  {
    modelId: "claude-haiku-4-5",
    provider: "ANTHROPIC",
    displayName: "Claude Haiku 4.5",
    description: "超快响应，适合轻量级任务和对话",
    contextWindow: 200000,
    maxOutputTokens: 8192,
    inputCreditPrice: 0.5,
    outputCreditPrice: 1.5,
    supportsVision: false,
    supportsStreaming: true,
  },
  {
    modelId: "gemini-1.5-pro",
    provider: "GOOGLE",
    displayName: "Gemini 1.5 Pro",
    description: "Google 旗舰模型，超大上下文窗口",
    contextWindow: 1000000,
    maxOutputTokens: 8192,
    inputCreditPrice: 3.5,
    outputCreditPrice: 10.5,
    supportsVision: true,
    supportsStreaming: true,
  },
  {
    modelId: "gemini-1.5-flash",
    provider: "GOOGLE",
    displayName: "Gemini 1.5 Flash",
    description: "Google 最快速模型，适合大批量任务",
    contextWindow: 1000000,
    maxOutputTokens: 8192,
    inputCreditPrice: 0.15,
    outputCreditPrice: 0.6,
    supportsVision: true,
    supportsStreaming: true,
  },
];
