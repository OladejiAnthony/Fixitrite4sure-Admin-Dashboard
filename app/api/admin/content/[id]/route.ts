// app/api/admin/content/[id]/route.ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { displayName, logAdminActivity } from "@/lib/supabase/log-admin-activity";

const CONTENT_SELECT =
  "id, caption, media_url, media_type, like_count, review_status, review_reason, reviewed_at, created_at, " +
  "author:profiles!author_id(id, first_name, last_name, email)";

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
    .select(CONTENT_SELECT)
    .eq("id", id)
    .eq("is_advert", false)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

// Approve/reject a regular post. review_status/review_reason/reviewed_by/
// reviewed_at were added to bearing_posts by fixit-app-mobile's
// 20260827130000_bearing_posts_review.sql migration; rejecting also writes
// a notifications row so the author is told in-app.
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
    .eq("is_advert", false)
    .select("id, author_id, review_status, review_reason")
    .single();

  const { data: author } = data
    ? await admin
        .from("profiles")
        .select("first_name, last_name, business_name, company_name, email")
        .eq("id", data.author_id)
        .maybeSingle()
    : { data: null };

  await logAdminActivity({
    action: `content.${reviewStatus === "approved" ? "approve" : "reject"}`,
    description: `${reviewStatus === "approved" ? "Approved" : "Rejected"} post by ${displayName(author)}`,
    targetType: "post",
    targetId: id,
    status: error ? "failed" : "success",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (reviewStatus === "rejected") {
    await admin.from("notifications").insert({
      owner_id: data.author_id,
      title: "Your post was rejected",
      body: reviewReason,
    });
  }

  return NextResponse.json(data);
}
