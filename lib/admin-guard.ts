import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { getCurrentAdminUser, type AdminUser } from "@/lib/admin-users";

// Role check for API routes — middleware.ts already confirms the request
// carries a valid admin session before this ever runs, but it doesn't
// know about roles, so admin-only endpoints (settings, users, orders)
// check here. Returns the signed-in admin, or a response to return
// immediately if they're not one.
export async function requireAdminApi(): Promise<AdminUser | NextResponse> {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }
  return user;
}

// Same check for admin-only pages — bounces an Editor back to the
// dashboard instead of rendering a page they have no API access to
// act on anyway.
export async function requireAdminPage(): Promise<AdminUser> {
  const user = await getCurrentAdminUser();
  if (!user || user.role !== "admin") {
    redirect("/admin");
  }
  return user;
}
