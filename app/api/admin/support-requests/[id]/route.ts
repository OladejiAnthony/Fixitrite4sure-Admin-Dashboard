// app/api/admin/support-requests/[id]/route.ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/require-admin";

const SUPPORT_SELECT =
  "id, created_at, last_message_at, last_message_sender_id, subject_user_id, " +
  "user:profiles!subject_user_id(id, user_type, first_name, last_name, business_name, company_name, email, phone_number, profile_image)";

const MESSAGE_SELECT =
  "id, sender_id, body, media_type, media_path, created_at, " +
  "sender:profiles!sender_id(id, first_name, last_name, is_admin)";

// Newest N messages, returned oldest-first for display.
const MESSAGE_LIMIT = 500;

// chat-media is a private bucket; hand the browser short-lived signed URLs.
const SIGNED_URL_TTL_SECONDS = 60 * 60;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const admin = createAdminClient();

  // kind = 'support' keeps this route from exposing private direct chats
  // between users, which admins have no access to under RLS either.
  const { data: conversation, error } = await admin
    .from("conversations")
    .select(SUPPORT_SELECT)
    .eq("id", id)
    .eq("kind", "support")
    .single();

  if (error || !conversation) {
    return NextResponse.json(
      { error: error?.message ?? "Not found" },
      { status: 404 }
    );
  }

  const { data: messages, error: messagesError } = await admin
    .from("messages")
    .select(MESSAGE_SELECT)
    .eq("conversation_id", id)
    .order("created_at", { ascending: false })
    .limit(MESSAGE_LIMIT);

  if (messagesError) {
    return NextResponse.json({ error: messagesError.message }, { status: 500 });
  }

  const ordered = ((messages ?? []) as any[]).reverse();

  const paths = ordered
    .map((m) => m.media_path)
    .filter((p): p is string => Boolean(p));

  const signed = new Map<string, string>();
  if (paths.length > 0) {
    const { data: urls } = await admin.storage
      .from("chat-media")
      .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);
    for (const u of urls ?? []) {
      if (u.path && u.signedUrl) signed.set(u.path, u.signedUrl);
    }
  }

  const c = conversation as any;

  return NextResponse.json({
    ...c,
    awaiting_reply: c.last_message_sender_id === c.subject_user_id,
    messages: ordered.map((m) => ({
      ...m,
      media_url: m.media_path ? signed.get(m.media_path) ?? null : null,
      from_user: m.sender_id === c.subject_user_id,
    })),
  });
}
