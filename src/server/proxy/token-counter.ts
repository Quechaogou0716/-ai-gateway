import { type ModelDefinition, MODELS } from "@/config/models";

export function getModel(modelId: string): ModelDefinition | undefined {
  return MODELS.find((m) => m.modelId === modelId);
}

export function estimateInputTokens(messages: unknown[]): number {
  const text = JSON.stringify(messages);
  return Math.max(1, Math.ceil(text.length / 3.5));
}

export function calculateCreditCost(
  model: ModelDefinition,
  inputTokens: number,
  outputTokens: number
): number {
  const inputCost = (inputTokens / 1000) * model.inputCreditPrice;
  const outputCost = (outputTokens / 1000) * model.outputCreditPrice;
  return Math.ceil(inputCost + outputCost);
}

export function estimatePreFlightCredits(
  model: ModelDefinition,
  inputTokens: number,
  requestedMaxTokens?: number
): number {
  const maxOut = requestedMaxTokens || model.maxOutputTokens || 4096;
  const estimatedOutput = Math.min(maxOut, model.maxOutputTokens || 4096);
  const est = calculateCreditCost(model, inputTokens, estimatedOutput);
  return Math.ceil(est * 1.2);
}
