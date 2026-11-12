// lib/supabase/user-chats.ts
import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { displayName } from "@/lib/supabase/log-admin-activity";

// Shared by the app/api/admin/user-chats/** routes. Direct (user-to-user)
// chats are public.conversations rows with kind = 'direct', each with two
// conversation_participants. RLS only lets participants read them, so admin
// access always goes through the service-role client, and every route must
// check kind = 'direct' so it can't be pointed at a support thread.

export const USER_CHAT_SELECT =
  "id, created_at, last_message_at, last_message_preview, last_message_sender_id, " +
  "participants:conversation_participants(user:profiles(id, user_type, first_name, last_name, business_name, company_name, email, phone_number, profile_image))";

type AdminClient = ReturnType<typeof createAdminClient>;

// Flattens the participant embed to a plain list of profiles.
export function withParticipants(c: any) {
  const { participants, ...rest } = c;
  return {
    ...rest,
    participants: ((participants ?? []) as any[]).map((p) => p.user).filter(Boolean),
  };
}

// The direct conversation with its participants, or null if it doesn't exist
// or isn't a direct chat.
export async function getDirectChat(admin: AdminClient, id: string) {
  const { data, error } = await admin
    .from("conversations")
    .select(USER_CHAT_SELECT)
    .eq("id", id)
    .eq("kind", "direct")
    .maybeSingle();
  if (error || !data) return null;
  return withParticipants(data);
}

export function participantNames(chat: { participants: any[] }): string {
  const names = chat.participants.map((p) => displayName(p, "a deleted user"));
  return names.length ? names.join(" and ") : "deleted users";
}

// Best-effort removal of chat-media objects after their messages are gone.
export async function removeChatMedia(admin: AdminClient, paths: string[]) {
  if (paths.length === 0) return;
  const { error } = await admin.storage.from("chat-media").remove(paths);
  if (error) console.error("Failed to remove chat media:", error.message);
}
