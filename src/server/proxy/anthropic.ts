import Anthropic from "@anthropic-ai/sdk";

function getAnthropicClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

function extractSystemMessages(
  messages: { role: string; content: unknown }[]
): { systemPrompt: string; remainingMessages: Anthropic.MessageParam[] } {
  let systemPrompt = "";
  const convertedMessages: Anthropic.MessageParam[] = [];

  for (const msg of messages) {
    if (msg.role === "system") {
      const content = typeof msg.content === "string"
        ? msg.content
        : Array.isArray(msg.content)
        ? msg.content.map((c: any) => c.text || "").join("\n")
        : "";
      systemPrompt += content + "\n";
    } else if (msg.role === "user") {
      convertedMessages.push({ role: "user", content: convertContent(msg.content) });
    } else if (msg.role === "assistant") {
      convertedMessages.push({ role: "assistant", content: convertContent(msg.content) });
    }
  }

  return { systemPrompt: systemPrompt.trim(), remainingMessages: convertedMessages };
}

function convertContent(content: unknown): string | Anthropic.ContentBlockParam[] {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map((c: any) => {
      if (c.type === "text") return { type: "text" as const, text: c.text };
      if (c.type === "image_url") {
        const url = c.image_url?.url || "";
        const [mediaType, base64] = url.startsWith("data:")
          ? url.slice(5).split(";base64,")
          : ["image/png", url];
        return {
          type: "image" as const,
          source: {
            type: "base64" as const,
            media_type: mediaType as any,
            data: base64,
          },
        };
      }
      return { type: "text" as const, text: "" };
    });
  }
  return String(content);
}

function transformOpenAiChunkToSSE(
  event: Anthropic.MessageStreamEvent,
  model: string
): string | null {
  if (event.type === "content_block_delta") {
    if (event.delta.type === "text_delta") {
      const chunk = {
        id: "chatcmpl-" + Date.now(),
        object: "chat.completion.chunk",
        created: Math.floor(Date.now() / 1000),
        model,
        choices: [
          {
            index: 0,
            delta: { content: event.delta.text },
            finish_reason: null,
          },
        ],
      };
      return `data: ${JSON.stringify(chunk)}\n\n`;
    }
  } else if (event.type === "message_stop") {
    const chunk = {
      id: "chatcmpl-" + Date.now(),
      object: "chat.completion.chunk",
      created: Math.floor(Date.now() / 1000),
      model,
      choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
      usage: {
        prompt_tokens: (event as any).usage?.input_tokens || 0,
        completion_tokens: (event as any).usage?.output_tokens || 0,
        total_tokens:
          ((event as any).usage?.input_tokens || 0) +
          ((event as any).usage?.output_tokens || 0),
      },
    };
    return `data: ${JSON.stringify(chunk)}\n\n`;
  }
  return null;
}

export async function proxyAnthropicStream(
  body: Record<string, unknown>,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder
): Promise<{ inputTokens: number; outputTokens: number }> {
  const anthropic = getAnthropicClient();
  const { systemPrompt, remainingMessages } = extractSystemMessages(
    body.messages as any[]
  );

  const model = (body.model as string) || "claude-haiku-4-5-20251001";
  let inputTokens = 0;
  let outputTokens = 0;

  const stream = await anthropic.messages.stream({
    model,
    max_tokens: (body.max_tokens as number) || 4096,
    temperature: body.temperature as number | undefined,
    system: systemPrompt || undefined,
    messages: remainingMessages,
  });

  for await (const event of stream) {
    if (event.type === "message_start") {
      inputTokens = (event.message as any).usage?.input_tokens || 0;
    } else if (event.type === "message_delta") {
      outputTokens = (event as any).usage?.output_tokens || 0;
    }

    const sse = transformOpenAiChunkToSSE(event, model);
    if (sse) {
      controller.enqueue(encoder.encode(sse));
    }
  }

  return { inputTokens, outputTokens };
}

export async function proxyAnthropic(body: Record<string, unknown>) {
  const anthropic = getAnthropicClient();
  const { systemPrompt, remainingMessages } = extractSystemMessages(
    body.messages as any[]
  );

  const model = (body.model as string) || "claude-haiku-4-5-20251001";

  const response = await anthropic.messages.create({
    model,
    max_tokens: (body.max_tokens as number) || 4096,
    temperature: body.temperature as number | undefined,
    system: systemPrompt || undefined,
    messages: remainingMessages,
  });

  const textContent = response.content
    .filter((c) => c.type === "text")
    .map((c) => c.text)
    .join("");

  return {
    id: "chatcmpl-" + Date.now(),
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [
      {
        index: 0,
        message: { role: "assistant", content: textContent },
        finish_reason: response.stop_reason || "stop",
      },
    ],
    usage: {
      prompt_tokens: response.usage.input_tokens,
      completion_tokens: response.usage.output_tokens,
      total_tokens:
        response.usage.input_tokens + response.usage.output_tokens,
    },
  };
}
