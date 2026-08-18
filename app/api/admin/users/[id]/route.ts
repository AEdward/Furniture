import { NextResponse } from "next/server";
import {
  AdminUserError,
  changeAdminPassword,
  changeAdminRole,
  deleteAdminUser,
} from "@/lib/admin-users";
import { requireAdminApi } from "@/lib/admin-guard";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const gate = await requireAdminApi();
  if (gate instanceof NextResponse) return gate;

  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid admin id." }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const password = typeof body.password === "string" ? body.password : "";
  const role = body.role === "admin" || body.role === "editor" ? body.role : null;

  try {
    if (password) {
      await changeAdminPassword(id, password);
    }
    if (role) {
      await changeAdminRole(id, role);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AdminUserError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to update admin." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const gate = await requireAdminApi();
  if (gate instanceof NextResponse) return gate;

  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid admin id." }, { status: 400 });
  }

  try {
    await deleteAdminUser(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AdminUserError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to remove admin." }, { status: 500 });
  }
}
