// app/api/admin/reviews/[kind]/[id]/response/route.ts
// PUT { body } - the signed-in admin's response to a provider review.
//
// Stored as a review_comments row authored by the admin (there is no
// admin-response column), so app users see it as a comment from that admin
// account. If this admin already commented on the review, their latest
// comment is edited; otherwise a new comment is added. One admin never edits
// another admin's comment.
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { displayName, logAdminActivity } from "@/lib/supabase/log-admin-activity";

const MAX_LENGTH = 2000;

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ kind: string; id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { kind, id } = await params;
  if (kind !== "provider") {
    return NextResponse.json(
      { error: "Only provider reviews can be responded to" },
      { status: 400 }
    );
  }

  const payload = await request.json().catch(() => null);
  const body = typeof payload?.body === "string" ? payload.body.trim() : "";
  if (!body) {
    return NextResponse.json({ error: "Response cannot be empty" }, { status: 400 });
  }
  if (body.length > MAX_LENGTH) {
    return NextResponse.json(
      { error: `Response must be ${MAX_LENGTH} characters or fewer` },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: review } = await admin
    .from("reviews")
    .select("id, author:profiles!author_id(first_name, last_name, email)")
    .eq("id", id)
    .maybeSingle();
  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  const { data: own } = await admin
    .from("review_comments")
    .select("id")
    .eq("review_id", id)
    .eq("author_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const result = own
    ? await admin
        .from("review_comments")
        .update({ body })
        .eq("id", own.id)
        .select("id, body, created_at")
        .single()
    : await admin
        .from("review_comments")
        .insert({ review_id: id, author_id: user.id, body })
        .select("id, body, created_at")
        .single();

  const author = (review as unknown as { author: Parameters<typeof displayName>[0] }).author;
  await logAdminActivity({
    action: own ? "review.response.update" : "review.response.create",
    description: `${own ? "Edited response to" : "Responded to"} review by ${displayName(author)}`,
    targetType: "review",
    targetId: id,
    status: result.error ? "failed" : "success",
  });

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  return NextResponse.json(result.data);
}
