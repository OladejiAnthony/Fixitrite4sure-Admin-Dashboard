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

// Matches the messages check constraints: body char_length <= 4000, and a
// message needs text, an attachment, or both. The attachment is uploaded to
// chat-media by the browser first (admin's own session, own folder - see
// uploadSupportAttachment) and only its path is sent here.
// Admin replies may carry images only, no videos: the type must be "image"
// and the file extension must be an image one. Keep in step with the
// EXTENSIONS map in lib/support-attachments.ts.
const SUPPORT_IMAGE_EXTENSIONS = ["png", "jpg", "webp", "heic", "heif", "gif"];

const replySchema = z
  .object({
    body: z.string().trim().max(4000).optional().default(""),
    media: z
      .object({
        path: z
          .string()
          .regex(/^[0-9a-f-]{36}\/[\w.-]+$/, "Invalid attachment")
          .refine(
            (p) => SUPPORT_IMAGE_EXTENSIONS.includes(p.split(".").pop()?.toLowerCase() ?? ""),
            "Only photos can be sent"
          ),
        type: z.literal("image"),
      })
      .optional(),
  })
  .refine((v) => v.body.length > 0 || v.media, {
    message: "Reply cannot be empty",
  });

const SUPPORT_SELECT =
  "id, created_at, last_message_at, last_message_sender_id, subject_user_id, " +
  "user:profiles!subject_user_id(id, user_type, first_name, last_name, business_name, company_name, email, phone_number, profile_image)";

const MESSAGE_SELECT =
  "id, sender_id, body, media_type, media_path, created_at, " +
  "sender:profiles!sender_id(id, first_name, last_name, is_admin)";

// Newest N messages, returned oldest-first for display.
const MESSAGE_LIMIT = 500;

// chat-media is a private bucket. Attachments are served through the
// ./media route, which keeps the URL stable across the page's 15s refetches
// and redirects to a freshly signed URL.
const mediaUrl = (conversationId: string, path: string) =>
  `/api/admin/support-requests/${conversationId}/media?path=${encodeURIComponent(path)}`;

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

  const c = conversation as any;

  return NextResponse.json({
    ...c,
    awaiting_reply: c.last_message_sender_id === c.subject_user_id,
    messages: ordered.map((m) => ({
      ...m,
      media_url: m.media_path ? mediaUrl(id, m.media_path) : null,
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

  const { body, media } = parsed.data;
  // The insert policy also enforces this; checking here gives a clear 400.
  if (media && !media.path.startsWith(`${user.id}/`)) {
    return NextResponse.json({ error: "Invalid attachment" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: id,
      sender_id: user.id,
      body: body || null,
      media_type: media?.type ?? null,
      media_path: media?.path ?? null,
    })
    .select("id, sender_id, body, media_type, media_path, created_at")
    .single();

  const attachmentNote = media ? " (with a photo)" : "";
  await logAdminActivity({
    action: "support.reply",
    description: `Replied to support request from ${displayName((conversation as any).user)}${attachmentNote}`,
    targetType: "support_request",
    targetId: id,
    status: error ? "failed" : "success",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
