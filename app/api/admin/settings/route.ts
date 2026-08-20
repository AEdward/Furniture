import { NextResponse } from "next/server";
import { updateSettings } from "@/lib/db";
import { parseSettingsInput, SettingsValidationError } from "@/lib/validate-settings";
import { requireAdminApi } from "@/lib/admin-guard";
import { logAdminAction } from "@/lib/audit-log";

export async function PUT(request: Request) {
  const gate = await requireAdminApi();
  if (gate instanceof NextResponse) return gate;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const input = parseSettingsInput(body);
    const settings = await updateSettings(input);
    await logAdminAction(gate, "update", "settings");
    return NextResponse.json({ settings });
  } catch (err) {
    if (err instanceof SettingsValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to update settings." }, { status: 500 });
  }
}
