// app/api/admin/user-chats/[id]/media/route.ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/require-admin";

// Stable URL for one attachment in a direct chat; redirects to a freshly
// signed chat-media URL. Same approach as the support-requests media route.
const SIGNED_URL_TTL_SECONDS = 10 * 60;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const path = new URL(request.url).searchParams.get("path");
  if (!path) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Only sign objects that a message in this direct conversation points at.
  const { data: conversation } = await admin
    .from("conversations")
    .select("id")
    .eq("id", id)
    .eq("kind", "direct")
    .maybeSingle();

  const { data: message } = conversation
    ? await admin
        .from("messages")
        .select("id")
        .eq("conversation_id", id)
        .eq("media_path", path)
        .limit(1)
        .maybeSingle()
    : { data: null };

  if (!message) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data, error } = await admin.storage
    .from("chat-media")
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    return NextResponse.json(
      { error: error?.message ?? "Attachment unavailable" },
      { status: 404 }
    );
  }

  const response = NextResponse.redirect(data.signedUrl, 302);
  response.headers.set("Cache-Control", "private, max-age=300");
  return response;
}
