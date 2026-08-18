import { NextResponse } from "next/server";
import { getAllReviews } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const reviews = await getAllReviews();
  return NextResponse.json({ reviews });
}
