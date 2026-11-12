// app/api/admin/user-chats/[id]/messages/[messageId]/route.ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { displayName, logAdminActivity } from "@/lib/supabase/log-admin-activity";
import { getDirectChat, removeChatMedia } from "@/lib/supabase/user-chats";

// Deletes one message from a direct chat. The refresh_conversation_after_delete
// trigger then recomputes the conversation's inbox preview.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id, messageId } = await params;
  const admin = createAdminClient();

  const chat = await getDirectChat(admin, id);
  if (!chat) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: message } = await admin
    .from("messages")
    .select("id, sender_id, media_path")
    .eq("id", messageId)
    .eq("conversation_id", id)
    .maybeSingle();

  if (!message) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  const { error } = await admin
    .from("messages")
    .delete()
    .eq("id", messageId)
    .eq("conversation_id", id);

  const sender = chat.participants.find((p: any) => p.id === message.sender_id);
  const others = chat.participants.filter((p: any) => p.id !== message.sender_id);
  await logAdminActivity({
    action: "chat.delete_message",
    description:
      `Deleted a message from ${displayName(sender, "a deleted user")}` +
      (others.length ? ` in chat with ${displayName(others[0], "a deleted user")}` : ""),
    targetType: "message",
    targetId: messageId,
    status: error ? "failed" : "success",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (message.media_path) await removeChatMedia(admin, [message.media_path]);

  return NextResponse.json({ success: true });
}
