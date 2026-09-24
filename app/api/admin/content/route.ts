// app/api/admin/content/route.ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/require-admin";

// Regular posts are bearing_posts rows flagged is_advert = false. Paid
// adverts (is_advert = true) are handled by /api/admin/adverts instead.
const CONTENT_SELECT =
  "id, caption, media_url, media_type, like_count, review_status, review_reason, reviewed_at, created_at, " +
  "author:profiles!author_id(id, first_name, last_name, email)";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("bearing_posts")
    .select(CONTENT_SELECT)
    .eq("is_advert", false)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
