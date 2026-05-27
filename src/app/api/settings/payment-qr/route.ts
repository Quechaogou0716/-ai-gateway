import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const setting = await db.siteSetting.findUnique({
    where: { key: "payment_qr_base64" },
  });

  return NextResponse.json({ qrCodeBase64: setting?.value || "" });
}
