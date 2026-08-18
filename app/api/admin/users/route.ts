import { NextResponse } from "next/server";
import { AdminUserError, createAdminUser } from "@/lib/admin-users";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name : "";
  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";

  try {
    const user = await createAdminUser({ name, email, password });
    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    if (err instanceof AdminUserError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to create admin." }, { status: 500 });
  }
}
