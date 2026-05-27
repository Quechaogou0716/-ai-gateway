import crypto from "crypto";
import { db } from "@/lib/db";

export function generateApiKey(): { fullKey: string; prefix: string; hashedKey: string } {
  const randomPart = crypto.randomBytes(32).toString("hex");
  const fullKey = `ai-${randomPart}`;
  const prefix = fullKey.slice(3, 11);
  const hashedKey = crypto.createHash("sha256").update(fullKey).digest("hex");
  return { fullKey, prefix, hashedKey };
}

export async function createApiKey(userId: string, name: string) {
  const { fullKey, prefix, hashedKey } = generateApiKey();

  await db.apiKey.create({
    data: {
      userId,
      name,
      prefix,
      hashedKey,
    },
  });

  return { fullKey, prefix };
}

export function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

export async function authenticateApiKey(authHeader: string | null) {
  if (!authHeader?.startsWith("Bearer ")) return null;

  const key = authHeader.slice(7).trim();
  const hashedKey = hashApiKey(key);

  const apiKey = await db.apiKey.findUnique({
    where: { hashedKey },
    include: { user: true },
  });

  if (!apiKey || !apiKey.enabled) return null;

  db.apiKey
    .update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } })
    .catch(() => {});

  return { user: apiKey.user, apiKey };
}
