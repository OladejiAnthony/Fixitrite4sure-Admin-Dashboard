// app/api/admin/super-admins/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/require-admin";

// profiles.is_admin is the only real admin concept in the schema — there's
// no separate "role" tiering, so every row here is just "an admin".
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const admin = createAdminClient();

  const { data: profiles, error } = await admin
    .from("profiles")
    .select("id, first_name, last_name, email, created_at")
    .eq("is_admin", true)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // last_sign_in_at / ban status live on auth.users, not profiles — one
  // listUsers() call rather than N+1 getUserById calls per row.
  const { data: authData, error: authError } =
    await admin.auth.admin.listUsers({ perPage: 1000 });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  const authById = new Map(authData.users.map((u) => [u.id, u]));

  const result = profiles.map((profile) => {
    const authUser = authById.get(profile.id);
    const isBanned = Boolean(
      authUser?.banned_until && new Date(authUser.banned_until) > new Date()
    );

    return {
      id: profile.id,
      name:
        [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
        profile.email ||
        "—",
      email: profile.email,
      role: "Super Admin",
      status: isBanned ? "Inactive" : "Active",
      lastLogin: authUser?.last_sign_in_at ?? null,
    };
  });

  return NextResponse.json(result);
}

const inviteSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = inviteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const admin = createAdminClient();

  const redirectTo = new URL(
    `/register?email=${encodeURIComponent(parsed.data.email)}`,
    request.url
  ).toString();

  const { data, error } = await admin.auth.admin.inviteUserByEmail(
    parsed.data.email,
    { redirectTo }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { error: promoteError } = await admin
    .from("profiles")
    .update({ is_admin: true })
    .eq("id", data.user.id);

  if (promoteError) {
    return NextResponse.json(
      { error: promoteError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
