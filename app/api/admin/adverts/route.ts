// app/api/admin/adverts/route.ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/require-admin";

// Adverts are bearing_posts rows flagged is_advert = true, tied back to the
// tier the advertiser paid for and the Flutterwave transaction that paid it.
const ADVERT_SELECT =
  "id, caption, media_url, media_type, like_count, is_advert, review_status, review_reason, reviewed_at, created_at, " +
  "author:profiles!author_id(id, first_name, last_name, email), " +
  "tier:advert_tiers(id, label, amount, currency), " +
  "transaction:advert_transactions(id, status, amount, currency, flutterwave_tx_ref, flutterwave_transaction_id)";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("bearing_posts")
    .select(ADVERT_SELECT)
    .eq("is_advert", true)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
