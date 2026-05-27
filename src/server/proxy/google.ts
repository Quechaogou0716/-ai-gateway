const GOOGLE_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

function transformToGeminiFormat(messages: { role: string; content: unknown }[]) {
  const systemMessages = messages.filter((m) => m.role === "system");
  const conversationMessages = messages.filter((m) => m.role !== "system");

  const contents = conversationMessages.map((msg) => {
    const parts: Record<string, unknown>[] = [];
    if (typeof msg.content === "string") {
      parts.push({ text: msg.content });
    } else if (Array.isArray(msg.content)) {
      for (const block of msg.content as any[]) {
        if (block.type === "text") parts.push({ text: block.text });
        else if (block.type === "image_url") {
          const match = block.image_url?.url?.match(
            /data:([^;]+);base64,(.+)/
          );
          if (match) {
            parts.push({
              inline_data: { mime_type: match[1], data: match[2] },
            });
          }
        }
      }
    }
    return {
      role: msg.role === "assistant" ? "model" : "user",
      parts: parts.length > 0 ? parts : [{ text: "" }],
    };
  });

  return {
    systemInstruction: systemMessages.length > 0
      ? {
          parts: systemMessages.map((m) => ({
            text: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
          })),
        }
      : undefined,
    contents,
  };
}

export async function proxyGemini(
  body: Record<string, unknown>,
  apiKey: string
) {
  const model = (body.model as string) || "gemini-1.5-flash";
  const geminiModel = model === "gemini-1.5-pro"
    ? "gemini-1.5-pro"
    : "gemini-1.5-flash";

  const { systemInstruction, contents } = transformToGeminiFormat(
    body.messages as any[]
  );

  const res = await fetch(
    `${GOOGLE_API_BASE}/models/${geminiModel}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: systemInstruction,
        contents,
        generationConfig: {
          maxOutputTokens: (body.max_tokens as number) || 8192,
          temperature: body.temperature as number | undefined,
        },
      }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`Gemini API error: ${JSON.stringify(data.error || data)}`);
  }

  const textContent = data.candidates?.[0]?.content?.parts
    ?.map((p: any) => p.text)
    .join("") || "";

  const usage = data.usageMetadata || {};

  return {
    id: "chatcmpl-" + Date.now(),
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [
      {
        index: 0,
        message: { role: "assistant", content: textContent },
        finish_reason: "stop",
      },
    ],
    usage: {
      prompt_tokens: usage.promptTokenCount || 0,
      completion_tokens: usage.candidatesTokenCount || 0,
      total_tokens:
        (usage.promptTokenCount || 0) + (usage.candidatesTokenCount || 0),
    },
  };
}

export async function proxyGeminiStream(
  body: Record<string, unknown>,
  apiKey: string,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder
): Promise<{ inputTokens: number; outputTokens: number }> {
  const model = (body.model as string) || "gemini-1.5-flash";
  const geminiModel = model === "gemini-1.5-pro"
    ? "gemini-1.5-pro"
    : "gemini-1.5-flash";

  const { systemInstruction, contents } = transformToGeminiFormat(
    body.messages as any[]
  );

  const res = await fetch(
    `${GOOGLE_API_BASE}/models/${geminiModel}:streamGenerateContent?alt=sse&key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: systemInstruction,
        contents,
        generationConfig: {
          maxOutputTokens: (body.max_tokens as number) || 8192,
          temperature: body.temperature as number | undefined,
        },
      }),
    }
  );

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body from Gemini");

  const decoder = new TextDecoder();
  let buffer = "";
  let inputTokens = 0;
  let outputTokens = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const jsonStr = line.slice(6).trim();
      if (!jsonStr) continue;

      try {
        const event = JSON.parse(jsonStr);
        const text = event.candidates?.[0]?.content?.parts
          ?.map((p: any) => p.text)
          .join("") || "";

        if (event.usageMetadata) {
          inputTokens = event.usageMetadata.promptTokenCount || 0;
          outputTokens = event.usageMetadata.candidatesTokenCount || 0;
        }

        if (text) {
          const chunk = {
            id: "chatcmpl-" + Date.now(),
            object: "chat.completion.chunk",
            created: Math.floor(Date.now() / 1000),
            model,
            choices: [{ index: 0, delta: { content: text }, finish_reason: null }],
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
        }
      } catch {
        // Skip parse errors
      }
    }
  }

  return { inputTokens, outputTokens };
}
