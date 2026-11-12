// app/api/admin/support-requests/route.ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/require-admin";

// Support requests are public.conversations rows with kind = 'support',
// created by the mobile app's start_support_conversation(). One per user;
// subject_user_id is the user who opened it. Conversations with no messages
// yet (opened, never used) are skipped, same as support_conversations().
//
// conversations has two FKs to profiles (subject_user_id and
// last_message_sender_id), so the embed names the column to join on.
const SUPPORT_SELECT =
  "id, created_at, last_message_at, last_message_preview, last_message_sender_id, subject_user_id, " +
  "user:profiles!subject_user_id(id, user_type, first_name, last_name, business_name, company_name, email, phone_number, profile_image)";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("conversations")
    .select(SUPPORT_SELECT)
    .eq("kind", "support")
    .not("last_message_at", "is", null)
    .order("last_message_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // There is no status column on conversations. "Awaiting reply" means the
  // user sent the latest message; anything else means an admin answered last.
  const rows = (data ?? []).map((c: any) => ({
    ...c,
    awaiting_reply: c.last_message_sender_id === c.subject_user_id,
  }));

  return NextResponse.json(rows);
}
