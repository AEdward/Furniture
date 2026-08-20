import { NextResponse } from "next/server";
import { getCurrentAdminUser } from "@/lib/admin-users";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
} from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const [notifications, unreadCount] = await Promise.all([
    getNotifications("admin", user.id),
    getUnreadNotificationCount("admin", user.id),
  ]);
  return NextResponse.json({ notifications, unreadCount });
}

// Mark every notification for this admin read.
export async function POST() {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  await markAllNotificationsRead("admin", user.id);
  return NextResponse.json({ ok: true });
}
