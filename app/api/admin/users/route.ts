import { NextResponse } from "next/server";
import { AdminUserError, createAdminUser } from "@/lib/admin-users";
import { requireAdminApi } from "@/lib/admin-guard";

export async function POST(request: Request) {
  const gate = await requireAdminApi();
  if (gate instanceof NextResponse) return gate;

  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name : "";
  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";
  const role = body.role === "editor" ? "editor" : "admin";

  try {
    const user = await createAdminUser({ name, email, password, role });
    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    if (err instanceof AdminUserError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to create admin." }, { status: 500 });
  }
}
