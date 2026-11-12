// app/api/admin/user-chats/route.ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { USER_CHAT_SELECT, withParticipants } from "@/lib/supabase/user-chats";

// Every direct (user-to-user) chat that has at least one message, newest
// activity first. Support threads (kind = 'support') are excluded.
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("conversations")
    .select(USER_CHAT_SELECT)
    .eq("kind", "direct")
    .not("last_message_at", "is", null)
    .order("last_message_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json((data ?? []).map(withParticipants));
}
