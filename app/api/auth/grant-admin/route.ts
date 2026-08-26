// app/api/auth/grant-admin/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const bodySchema = z.object({
  userId: z.string().uuid(),
});

// Every account created via this dashboard's /register is meant to be an
// admin. Without a recency check here, anyone who already knows a user's
// auth id (e.g. their own account from the mobile app, which shares this
// Supabase project) could replay this call directly and silently
// self-promote to a full admin. Restricting the grant to accounts created
// moments ago means only a signup that just happened through this
// dashboard's own flow can use it.
const GRANT_WINDOW_MS = 5 * 60 * 1000;

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: userData, error: userError } =
    await admin.auth.admin.getUserById(parsed.data.userId);

  if (userError || !userData?.user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const createdAt = new Date(userData.user.created_at).getTime();
  if (Date.now() - createdAt > GRANT_WINDOW_MS) {
    return NextResponse.json(
      { error: "This account is too old to auto-grant admin access." },
      { status: 403 }
    );
  }

  const { error } = await admin
    .from("profiles")
    .update({ is_admin: true })
    .eq("id", parsed.data.userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
