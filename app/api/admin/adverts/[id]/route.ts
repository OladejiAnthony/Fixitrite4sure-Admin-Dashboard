// app/api/admin/adverts/[id]/route.ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

const ADVERT_SELECT =
  "id, caption, media_url, media_type, like_count, is_advert, review_status, review_reason, reviewed_at, created_at, " +
  "author:profiles(id, first_name, last_name, email), " +
  "tier:advert_tiers(id, label, amount, currency), " +
  "transaction:advert_transactions(id, status, amount, currency, flutterwave_tx_ref, flutterwave_transaction_id)";

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

// Approve/reject a paid advert. review_status/review_reason/reviewed_by/
// reviewed_at were added to bearing_posts by fixit-app-mobile's
// 20260827130000_bearing_posts_review.sql migration; rejecting also writes
// a notifications row so the author is told in-app (that table already
// existed — no schema change needed for this part).
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const body = await request.json();
  const reviewStatus = body.review_status;
  const reviewReason =
    typeof body.review_reason === "string" && body.review_reason.trim()
      ? body.review_reason.trim()
      : null;

  if (reviewStatus !== "approved" && reviewStatus !== "rejected") {
    return NextResponse.json(
      { error: "review_status must be 'approved' or 'rejected'" },
      { status: 400 }
    );
  }
  if (reviewStatus === "rejected" && !reviewReason) {
    return NextResponse.json(
      { error: "review_reason is required when rejecting" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("bearing_posts")
    .update({
      review_status: reviewStatus,
      review_reason: reviewStatus === "rejected" ? reviewReason : null,
      reviewed_by: user?.id ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("is_advert", true)
    .select("id, author_id, review_status, review_reason")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (reviewStatus === "rejected") {
    await admin.from("notifications").insert({
      owner_id: data.author_id,
      title: "Your advert was rejected",
      body: reviewReason,
    });
  }

  return NextResponse.json(data);
}
