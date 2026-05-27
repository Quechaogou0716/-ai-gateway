import { NextResponse } from "next/server";
import { MODELS } from "@/config/models";

export async function GET() {
  const data = MODELS.filter((m) => true).map((m) => ({
    id: m.modelId,
    object: "model",
    created: Math.floor(Date.now() / 1000),
    owned_by: m.provider.toLowerCase(),
  }));

  return NextResponse.json({
    object: "list",
    data,
  });
}
