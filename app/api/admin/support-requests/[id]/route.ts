// app/api/admin/support-requests/[id]/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import {
  displayName,
  logAdminActivity,
} from "@/lib/supabase/log-admin-activity";

// Matches the messages.body check constraint (char_length <= 4000).
const replySchema = z.object({
  body: z.string().trim().min(1, "Reply cannot be empty").max(4000),
});

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

// Admin reply. The insert runs on the admin's own session (RLS applies):
// the "Participants send messages as themselves" policy allows it because
// is_conversation_participant() is true for admins on support conversations.
// DB triggers then refresh the conversation preview and notify the user as
// "FixIt Support".
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  const parsed = replySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid reply" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { data: conversation } = await admin
    .from("conversations")
    .select("id, user:profiles!subject_user_id(first_name, last_name, business_name, company_name, email)")
    .eq("id", id)
    .eq("kind", "support")
    .maybeSingle();

  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({ conversation_id: id, sender_id: user.id, body: parsed.data.body })
    .select("id, sender_id, body, media_type, media_path, created_at")
    .single();

  await logAdminActivity({
    action: "support.reply",
    description: `Replied to support request from ${displayName((conversation as any).user)}`,
    targetType: "support_request",
    targetId: id,
    status: error ? "failed" : "success",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
