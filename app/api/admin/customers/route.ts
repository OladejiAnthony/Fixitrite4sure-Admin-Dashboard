// app/api/admin/customers/route.ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/require-admin";

// Admin needs every customer's row; profiles RLS is owner-scoped, so this
// goes through the service_role client rather than the caller's session.
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("profiles")
    .select(
      "id, first_name, last_name, email, phone_number, verification_status, created_at"
    )
    .eq("user_type", "customer")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
