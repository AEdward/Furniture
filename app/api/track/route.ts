import { NextRequest, NextResponse } from "next/server";
import { recordPageView } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const path = typeof body.path === "string" ? body.path.slice(0, 255) : null;
    if (!path) {
      return NextResponse.json({ error: "path is required." }, { status: 400 });
    }
    const referrer =
      typeof body.referrer === "string" && body.referrer ? body.referrer.slice(0, 255) : null;

    await recordPageView(path, referrer);
    return NextResponse.json({ ok: true });
  } catch {
    // Tracking must never break the page it's called from.
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
