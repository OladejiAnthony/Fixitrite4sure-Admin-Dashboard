// app/api/admin/reviews/[kind]/[id]/route.ts
// DELETE /api/admin/reviews/{provider|product}/:id
// Deleting a provider review also removes its comments, reactions and
// reports (on delete cascade in the schema).
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { displayName, logAdminActivity } from "@/lib/supabase/log-admin-activity";
import { isReviewKind, REVIEW_TABLE } from "@/lib/reviews";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ kind: string; id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { kind, id } = await params;
  if (!isReviewKind(kind)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const admin = createAdminClient();
  const table = REVIEW_TABLE[kind];

  const { data: existing } = await admin
    .from(table)
    .select("id, rating, author:profiles!author_id(first_name, last_name, email)")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  const { error } = await admin.from(table).delete().eq("id", id);

  const author = (existing as unknown as { author: Parameters<typeof displayName>[0] }).author;
  await logAdminActivity({
    action: "review.delete",
    description: `Deleted ${kind} review by ${displayName(author)}`,
    targetType: kind === "provider" ? "review" : "product_review",
    targetId: id,
    status: error ? "failed" : "success",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id });
}
