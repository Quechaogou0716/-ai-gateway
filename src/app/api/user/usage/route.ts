import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "50");
  const page = parseInt(searchParams.get("page") || "1");
  const skip = (page - 1) * limit;

  const userId = (session.user as any).id;

  const [logs, total, totalTokens] = await Promise.all([
    limit === 0
      ? []
      : db.usageLog.findMany({
          where: { userId },
          select: {
            id: true,
            modelId: true,
            requestTokens: true,
            responseTokens: true,
            totalTokens: true,
            creditsConsumed: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: limit,
          skip,
        }),
    db.usageLog.count({ where: { userId } }),
    db.usageLog
      .aggregate({
        where: { userId, status: "SUCCESS" },
        _sum: { totalTokens: true },
      })
      .then((r: any) => r._sum.totalTokens || 0),
  ]);

  return NextResponse.json({ logs, total, totalTokens, page, limit });
}
