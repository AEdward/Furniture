import { NextResponse } from "next/server";
import { AdminUserError, getCurrentAdminUser, updateAdminName } from "@/lib/admin-users";

export async function PUT(request: Request) {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name : "";

  try {
    await updateAdminName(user.id, name);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AdminUserError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
