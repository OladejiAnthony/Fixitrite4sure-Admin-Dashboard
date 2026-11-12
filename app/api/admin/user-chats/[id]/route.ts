// app/api/admin/user-chats/[id]/route.ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { logAdminActivity } from "@/lib/supabase/log-admin-activity";
import {
  getDirectChat,
  participantNames,
  removeChatMedia,
} from "@/lib/supabase/user-chats";

const MESSAGE_SELECT =
  "id, sender_id, body, media_type, media_path, created_at, " +
  "sender:profiles!sender_id(id, first_name, last_name, is_admin)";

// Newest N messages, returned oldest-first for display.
const MESSAGE_LIMIT = 500;

// chat-media is private; attachments are served through ./media, which keeps
// the URL stable across refetches and redirects to a freshly signed URL.
const mediaUrl = (conversationId: string, path: string) =>
  `/api/admin/user-chats/${conversationId}/media?path=${encodeURIComponent(path)}`;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const admin = createAdminClient();

  const chat = await getDirectChat(admin, id);
  if (!chat) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: messages, error } = await admin
    .from("messages")
    .select(MESSAGE_SELECT)
    .eq("conversation_id", id)
    .order("created_at", { ascending: false })
    .limit(MESSAGE_LIMIT);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ...chat,
    messages: ((messages ?? []) as any[]).reverse().map((m) => ({
      ...m,
      media_url: m.media_path ? mediaUrl(id, m.media_path) : null,
    })),
  });
}

// Deletes the whole conversation. The FK cascade removes its participants and
// messages; attached media is then removed from chat-media.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const admin = createAdminClient();

  const chat = await getDirectChat(admin, id);
  if (!chat) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: media, error: mediaError } = await admin
    .from("messages")
    .select("media_path")
    .eq("conversation_id", id)
    .not("media_path", "is", null);

  if (mediaError) {
    return NextResponse.json({ error: mediaError.message }, { status: 500 });
  }

  const { error } = await admin
    .from("conversations")
    .delete()
    .eq("id", id)
    .eq("kind", "direct");

  await logAdminActivity({
    action: "chat.delete_conversation",
    description: `Deleted chat between ${participantNames(chat)}`,
    targetType: "conversation",
    targetId: id,
    status: error ? "failed" : "success",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await removeChatMedia(
    admin,
    (media ?? []).map((m: any) => m.media_path).filter(Boolean)
  );

  return NextResponse.json({ success: true });
}
