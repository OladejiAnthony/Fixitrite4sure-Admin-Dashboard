// app/api/admin/super-admins/[id]/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const admin = createAdminClient();

  const { data: profile, error } = await admin
    .from("profiles")
    .select("id, first_name, last_name, email, created_at")
    .eq("id", id)
    .eq("is_admin", true)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  const { data: authData } = await admin.auth.admin.getUserById(id);
  const isBanned = Boolean(
    authData?.user?.banned_until &&
      new Date(authData.user.banned_until) > new Date()
  );

  return NextResponse.json({
    id: profile.id,
    name:
      [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
      profile.email ||
      "—",
    email: profile.email,
    role: "Super Admin",
    status: isBanned ? "Inactive" : "Active",
    lastLogin: authData?.user?.last_sign_in_at ?? null,
  });
}

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(["Active", "Inactive"]).optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const admin = createAdminClient();

  if (parsed.data.name) {
    const [first_name, ...rest] = parsed.data.name.trim().split(/\s+/);
    const { error } = await admin
      .from("profiles")
      .update({ first_name, last_name: rest.join(" ") || null })
      .eq("id", id)
      .eq("is_admin", true);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  if (parsed.data.status) {
    const { error } = await admin.auth.admin.updateUserById(id, {
      ban_duration: parsed.data.status === "Inactive" ? "876000h" : "none",
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}

// "Delete" here means revoke dashboard access, not erase the account —
// the underlying auth user / profile may belong to a real person who
// should just lose admin rights, not have their history destroyed.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.id === id) {
    return NextResponse.json(
      { error: "You can't revoke your own admin access." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ is_admin: false })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
