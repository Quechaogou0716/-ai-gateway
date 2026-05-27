import OpenAI from "openai";

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function proxyOpenAI(body: Record<string, unknown>, stream: boolean) {
  const openai = getOpenAIClient();
  const response = await openai.chat.completions.create({
    model: (body.model as string) || "gpt-4o-mini",
    messages: body.messages as any,
    temperature: body.temperature as number | undefined,
    max_tokens: body.max_tokens as number | undefined,
    top_p: body.top_p as number | undefined,
    stream,
    stream_options: stream ? { include_usage: true } : undefined,
  });

  return response;
}
