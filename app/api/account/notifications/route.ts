import { NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customers";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
} from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const [notifications, unreadCount] = await Promise.all([
    getNotifications("customer", customer.id),
    getUnreadNotificationCount("customer", customer.id),
  ]);
  return NextResponse.json({ notifications, unreadCount });
}

export async function POST() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  await markAllNotificationsRead("customer", customer.id);
  return NextResponse.json({ ok: true });
}
