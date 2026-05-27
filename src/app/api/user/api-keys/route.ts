import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { createApiKey } from "@/lib/api-key";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKeys = await db.apiKey.findMany({
    where: { userId: (session.user as any).id },
    select: {
      id: true,
      name: true,
      prefix: true,
      enabled: true,
      lastUsedAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ apiKeys });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "请提供 Key 名称" }, { status: 400 });
  }

  const keyData = await createApiKey((session.user as any).id, name.trim());
  return NextResponse.json(
    { fullKey: keyData.fullKey, prefix: keyData.prefix, name: name.trim() },
    { status: 201 }
  );
}
