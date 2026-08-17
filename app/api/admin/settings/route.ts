import { NextResponse } from "next/server";
import { updateSettings } from "@/lib/db";
import { parseSettingsInput, SettingsValidationError } from "@/lib/validate-settings";

export async function PUT(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const input = parseSettingsInput(body);
    const settings = await updateSettings(input);
    return NextResponse.json({ settings });
  } catch (err) {
    if (err instanceof SettingsValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to update settings." }, { status: 500 });
  }
}
