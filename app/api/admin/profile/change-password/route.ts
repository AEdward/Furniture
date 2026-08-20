import { NextResponse } from "next/server";
import { AdminUserError, changeAdminPassword, getCurrentAdminUser, verifyAdminCredentials } from "@/lib/admin-users";

export async function POST(request: Request) {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

  const verified = await verifyAdminCredentials(user.email, currentPassword);
  if (!verified) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
  }

  try {
    await changeAdminPassword(user.id, newPassword);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AdminUserError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to change password." }, { status: 500 });
  }
}
