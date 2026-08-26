// lib/supabase/require-admin.ts
import "server-only";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Route Handlers that use the service-role client bypass RLS entirely, so
// each one must check profiles.is_admin itself — middleware can't do this
// for API routes (it runs on the Edge runtime, which can't load the
// service-role client at all). Call this first in every app/api/admin/**
// handler; a non-null return means "stop, respond with this".
export async function requireAdmin(): Promise<NextResponse | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: profile, error } = await admin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (error || !profile?.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}
