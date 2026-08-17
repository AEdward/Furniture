import { NextResponse } from "next/server";
import { createPage, PageError } from "@/lib/db";
import { parsePageInput, PageValidationError } from "@/lib/pages";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const input = parsePageInput(body);
    const page = await createPage(input);
    return NextResponse.json({ page }, { status: 201 });
  } catch (err) {
    if (err instanceof PageValidationError || err instanceof PageError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to create page." }, { status: 500 });
  }
}
