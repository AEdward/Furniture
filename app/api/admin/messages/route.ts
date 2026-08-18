import { NextResponse } from "next/server";
import { getAllContactMessages } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const messages = await getAllContactMessages();
  return NextResponse.json({ messages });
}
