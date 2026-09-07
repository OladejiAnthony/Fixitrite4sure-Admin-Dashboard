// app/api/admin/repair-companies/route.ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { dedupeProfilesByIdentity } from "@/lib/dedupe-profiles";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("profiles")
    .select(
      "id, company_name, business_name, first_name, last_name, email, phone_number, verification_status, created_at"
    )
    .eq("user_type", "company")
    .eq("is_admin", false)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(dedupeProfilesByIdentity(data));
}
