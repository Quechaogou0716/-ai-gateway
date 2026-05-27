import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  await db.user.upsert({
    where: { email: "admin@aigateway.cn" },
    update: {},
    create: {
      name: "管理员",
      email: "admin@aigateway.cn",
      hashedPassword: adminPassword,
      role: "ADMIN",
      credits: 10000,
    },
  });

  // Demo user
  const demoPassword = await bcrypt.hash("demo123", 12);
  await db.user.upsert({
    where: { email: "demo@aigateway.cn" },
    update: {},
    create: {
      name: "Demo",
      email: "demo@aigateway.cn",
      hashedPassword: demoPassword,
      role: "USER",
      credits: 100,
    },
  });

  // AI Models
  const models = [
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
      sortOrder: 1,
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
      sortOrder: 2,
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
      sortOrder: 3,
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
      sortOrder: 4,
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
      sortOrder: 5,
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
      sortOrder: 6,
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
      sortOrder: 7,
    },
  ];

  for (const model of models) {
    await db.aiModel.upsert({
      where: { modelId: model.modelId },
      update: model,
      create: model,
    });
  }

  // Credit plans
  const plans = [
    { id: "starter", name: "入门版", credits: 100, priceCents: 1000, bonusCredits: 0, sortOrder: 1 },
    { id: "standard", name: "标准版", credits: 500, priceCents: 4500, bonusCredits: 50, sortOrder: 2 },
    { id: "pro", name: "专业版", credits: 1200, priceCents: 9900, bonusCredits: 150, sortOrder: 3 },
    { id: "max", name: "旗舰版", credits: 5000, priceCents: 39900, bonusCredits: 800, sortOrder: 4 },
  ];

  for (const plan of plans) {
    await db.creditPlan.upsert({
      where: { id: plan.id },
      update: plan,
      create: plan,
    });
  }

  // Site settings
  await db.siteSetting.upsert({
    where: { key: "rate_limit_rpm" },
    update: {},
    create: { key: "rate_limit_rpm", value: "60" },
  });

  console.log("Seed complete!");
  console.log("---");
  console.log("管理员: admin@aigateway.cn / admin123");
  console.log("体验账号: demo@aigateway.cn / demo123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
