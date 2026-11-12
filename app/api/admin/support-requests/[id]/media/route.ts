// app/api/admin/support-requests/[id]/media/route.ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/require-admin";

// Stable URL for one chat attachment of a support conversation. The thread
// page refetches every 15s; handing it signed URLs directly meant a new src
// on every refetch (images reloaded, playing videos restarted). This route
// keeps the src fixed and redirects to a freshly signed chat-media URL.
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

  // Only sign objects that a message in this support conversation points at,
  // so the route can't be used to read media from private direct chats.
  const { data: conversation } = await admin
    .from("conversations")
    .select("id")
    .eq("id", id)
    .eq("kind", "support")
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
  // Shorter than the signed URL's lifetime, so a cached redirect never
  // points at an expired URL.
  response.headers.set("Cache-Control", "private, max-age=300");
  return response;
}
