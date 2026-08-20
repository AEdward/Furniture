import { NextResponse } from "next/server";
import { getCurrentAdminUser } from "@/lib/admin-users";
import { markNotificationRead } from "@/lib/notifications";

export async function PATCH(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid notification id." }, { status: 400 });
  }
  await markNotificationRead(id, "admin", user.id);
  return NextResponse.json({ ok: true });
}
