import { db } from "@/lib/db";
import { type ModelDefinition, MODELS } from "@/config/models";
import { estimateInputTokens, estimatePreFlightCredits, calculateCreditCost } from "./token-counter";

export async function checkAndReserveCredits(
  userId: string,
  modelId: string,
  messages: unknown[],
  maxTokens?: number
): Promise<{ allowed: boolean; error?: string; estimatedCost: number; model: ModelDefinition }> {
  const model = MODELS.find((m) => m.modelId === modelId);
  if (!model) {
    return { allowed: false, error: `Model "${modelId}" not found`, estimatedCost: 0, model: null as any };
  }

  const inputTokens = estimateInputTokens(messages);
  const estimatedCost = estimatePreFlightCredits(model, inputTokens, maxTokens);

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });

  if (!user) {
    return { allowed: false, error: "User not found", estimatedCost: 0, model };
  }

  if (user.credits < estimatedCost) {
    return {
      allowed: false,
      error: `积分不足。需要约 ${estimatedCost} 积分，当前余额: ${user.credits} 积分`,
      estimatedCost,
      model,
    };
  }

  return { allowed: true, estimatedCost, model };
}

export async function deductCredits(
  userId: string,
  apiKeyId: string | null,
  model: ModelDefinition,
  inputTokens: number,
  outputTokens: number,
  isStreaming: boolean,
  status: string,
  durationMs: number
) {
  const creditsToDeduct = calculateCreditCost(model, inputTokens, outputTokens);

  await db.$transaction(async (tx: any) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    if (!user || user.credits < creditsToDeduct) {
      // If insufficient, deduct what we can and log the failure
      const actualDeduct = user?.credits || 0;
      if (actualDeduct > 0) {
        await tx.user.update({
          where: { id: userId },
          data: { credits: { decrement: actualDeduct } },
        });
        await tx.creditLog.create({
          data: {
            userId,
            amount: -actualDeduct,
            balanceBefore: user?.credits || 0,
            balanceAfter: Math.max(0, (user?.credits || 0) - actualDeduct),
            type: "CONSUMPTION",
            description: `${model.modelId}: ${inputTokens}+${outputTokens} tokens`,
          },
        });
      }

      await tx.usageLog.create({
        data: {
          userId,
          apiKeyId,
          modelId: model.modelId,
          requestTokens: inputTokens,
          responseTokens: outputTokens,
          totalTokens: inputTokens + outputTokens,
          creditsConsumed: actualDeduct,
          isStreaming,
          status: "INSUFFICIENT_CREDITS",
          durationMs,
        },
      });
      return;
    }

    await tx.user.update({
      where: { id: userId },
      data: { credits: { decrement: creditsToDeduct } },
    });

    const usageLog = await tx.usageLog.create({
      data: {
        userId,
        apiKeyId,
        modelId: model.modelId,
        requestTokens: inputTokens,
        responseTokens: outputTokens,
        totalTokens: inputTokens + outputTokens,
        creditsConsumed: creditsToDeduct,
        isStreaming,
        status,
        durationMs,
      },
    });

    await tx.creditLog.create({
      data: {
        userId,
        amount: -creditsToDeduct,
        balanceBefore: user.credits,
        balanceAfter: user.credits - creditsToDeduct,
        type: "CONSUMPTION",
        description: `${model.modelId}: ${inputTokens}+${outputTokens} tokens`,
        usageLogId: usageLog.id,
      },
    });
  });
}
