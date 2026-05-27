import { authenticateApiKey } from "@/lib/api-key";
import { checkAndReserveCredits, deductCredits } from "./credit-check";
import { estimateInputTokens } from "./token-counter";
import { proxyOpenAI } from "./openai";
import { proxyAnthropic, proxyAnthropicStream } from "./anthropic";
import { proxyGemini, proxyGeminiStream } from "./google";
import { type ModelDefinition } from "@/config/models";

function createErrorResponse(message: string, code: number, type: string) {
  return new Response(
    JSON.stringify({
      error: { message, type, code },
    }),
    {
      status: code,
      headers: { "Content-Type": "application/json" },
    }
  );
}

export async function handleChatCompletion(req: Request) {
  const startTime = Date.now();

  // Auth
  const authResult = await authenticateApiKey(
    req.headers.get("authorization")
  );
  if (!authResult) {
    return createErrorResponse("Invalid API key", 401, "authentication_error");
  }
  const { user, apiKey } = authResult;

  // Parse body
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return createErrorResponse("Invalid JSON body", 400, "invalid_request_error");
  }

  const modelId = body.model as string;
  const stream = (body.stream as boolean) || false;

  if (!modelId) {
    return createErrorResponse(
      "model is required",
      400,
      "invalid_request_error"
    );
  }

  // Credit check
  const checkResult = await checkAndReserveCredits(
    user.id,
    modelId,
    body.messages as unknown[],
    body.max_tokens as number | undefined
  );

  if (!checkResult.allowed) {
    return createErrorResponse(
      checkResult.error || "Insufficient credits",
      402,
      "insufficient_credits"
    );
  }

  const { model } = checkResult;

  try {
    if (stream) {
      return handleStreamingResponse(
        req,
        body,
        model,
        user.id,
        apiKey.id,
        startTime
      );
    }
    return handleNonStreamingResponse(
      body,
      model,
      user.id,
      apiKey.id,
      startTime
    );
  } catch (error: any) {
    const durationMs = Date.now() - startTime;

    await deductCredits(
      user.id,
      apiKey.id,
      model,
      estimateInputTokens((body.messages as unknown[]) || []),
      0,
      false,
      "ERROR",
      durationMs
    );

    return createErrorResponse(
      `Upstream error: ${error.message || "Unknown error"}`,
      502,
      "upstream_error"
    );
  }
}

async function handleNonStreamingResponse(
  body: Record<string, unknown>,
  model: ModelDefinition,
  userId: string,
  apiKeyId: string,
  startTime: number
) {
  let result: any;

  if (model.provider === "OPENAI") {
    const openAiResponse = await proxyOpenAI(body, false);
    result = openAiResponse as any;
  } else if (model.provider === "ANTHROPIC") {
    const anthropicResponse = await proxyAnthropic(body);
    result = anthropicResponse;
  } else if (model.provider === "GOOGLE") {
    result = await proxyGemini(body, process.env.GOOGLE_AI_API_KEY || "");
  } else {
    return createErrorResponse(
      `Unknown provider: ${model.provider}`,
      400,
      "invalid_request_error"
    );
  }

  const durationMs = Date.now() - startTime;
  const inputTokens = result.usage?.prompt_tokens || 0;
  const outputTokens = result.usage?.completion_tokens || 0;

  await deductCredits(
    userId,
    apiKeyId,
    model,
    inputTokens,
    outputTokens,
    false,
    "SUCCESS",
    durationMs
  );

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

async function handleStreamingResponse(
  req: Request,
  body: Record<string, unknown>,
  model: ModelDefinition,
  userId: string,
  apiKeyId: string,
  startTime: number
) {
  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      let inputTokens = 0;
      let outputTokens = 0;
      let status = "SUCCESS";

      try {
        if (model.provider === "OPENAI") {
          const stream = await proxyOpenAI(body, true);
          for await (const chunk of stream as any) {
            const content = chunk.choices?.[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    id: chunk.id || "chatcmpl-" + Date.now(),
                    object: "chat.completion.chunk",
                    created: chunk.created || Math.floor(Date.now() / 1000),
                    model: model.modelId,
                    choices: [
                      {
                        index: 0,
                        delta: { content },
                        finish_reason: chunk.choices?.[0]?.finish_reason || null,
                      },
                    ],
                  })}\n\n`
                )
              );
            }
            if (chunk.usage) {
              inputTokens = chunk.usage.prompt_tokens || 0;
              outputTokens = chunk.usage.completion_tokens || 0;
            }
          }
        } else if (model.provider === "ANTHROPIC") {
          const counts = await proxyAnthropicStream(body, controller, encoder);
          inputTokens = counts.inputTokens;
          outputTokens = counts.outputTokens;
        } else if (model.provider === "GOOGLE") {
          const counts = await proxyGeminiStream(
            body,
            process.env.GOOGLE_AI_API_KEY || "",
            controller,
            encoder
          );
          inputTokens = counts.inputTokens;
          outputTokens = counts.outputTokens;
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error: any) {
        status = "ERROR";
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              error: { message: error.message, type: "upstream_error" },
            })}\n\n`
          )
        );
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }

      const durationMs = Date.now() - startTime;
      if (inputTokens > 0 || outputTokens > 0) {
        await deductCredits(
          userId,
          apiKeyId,
          model,
          inputTokens || estimateInputTokens((body.messages as unknown[]) || []),
          outputTokens,
          true,
          status,
          durationMs
        );
      }
    },
  });

  return new Response(readable, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
