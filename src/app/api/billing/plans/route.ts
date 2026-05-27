import { NextResponse } from "next/server";
import { PLANS } from "@/config/plans";

export async function GET() {
  return NextResponse.json({ plans: PLANS });
}
