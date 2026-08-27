// app/api/admin/adverts/[id]/route.ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/require-admin";

const ADVERT_SELECT =
  "id, caption, media_url, media_type, like_count, is_advert, review_status, review_reason, reviewed_at, created_at, " +
  "author:profiles(id, first_name, last_name, email), " +
  "tier:advert_tiers(id, label, amount, currency), " +
  "transaction:advert_transactions(id, status, amount, currency, flutterwave_tx_ref, flutterwave_transaction_id)";

// Approve/reject is deferred until fixit-app-mobile ships the migration
// adding review_status/review_reason/reviewed_by/reviewed_at to
// bearing_posts (see the admin-dashboard plan's Phase B) — this route is
// read-only until then.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("bearing_posts")
    .select(ADVERT_SELECT)
    .eq("id", id)
    .eq("is_advert", true)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}
