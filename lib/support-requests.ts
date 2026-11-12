// lib/support-requests.ts
// Client-side shapes and helpers for /api/admin/support-requests. Support
// requests are Supabase support conversations; there is no status column,
// so awaiting_reply is derived from who sent the last message.

export type SupportUser = {
  id: string;
  user_type: "customer" | "repairer" | "company" | "vendor";
  first_name: string | null;
  last_name: string | null;
  business_name: string | null;
  company_name: string | null;
  email: string | null;
  phone_number: string | null;
  profile_image: string | null;
};

export type SupportRequest = {
  id: string;
  created_at: string;
  last_message_at: string;
  last_message_preview: string | null;
  awaiting_reply: boolean;
  user: SupportUser | null;
};

export type SupportMessage = {
  id: string;
  sender_id: string;
  body: string | null;
  media_type: "image" | "video" | null;
  media_url: string | null;
  created_at: string;
  from_user: boolean;
  sender: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    business_name?: string | null;
    company_name?: string | null;
    email?: string | null;
    is_admin: boolean;
  } | null;
};

export type SupportThread = Omit<SupportRequest, "last_message_preview"> & {
  messages: SupportMessage[];
};

// Direct (user-to-user) chats from /api/admin/user-chats.
export type UserChat = {
  id: string;
  created_at: string;
  last_message_at: string;
  last_message_preview: string | null;
  last_message_sender_id: string | null;
  participants: SupportUser[];
};

export type UserChatMessage = Omit<SupportMessage, "from_user">;

export type UserChatThread = Omit<UserChat, "last_message_preview"> & {
  messages: UserChatMessage[];
};

// A person's own name for chat messages: "First Last", with the business or
// company name after it when there is one, e.g. "Ada Obi (Ada's Repairs)".
export function personName(
  p: {
    first_name: string | null;
    last_name: string | null;
    business_name?: string | null;
    company_name?: string | null;
    email?: string | null;
  } | null | undefined
) {
  if (!p) return "Deleted user";
  const person = [p.first_name, p.last_name].filter(Boolean).join(" ").trim();
  const org = p.business_name || p.company_name;
  if (person && org) return `${person} (${org})`;
  return person || org || p.email || "Unnamed user";
}

export function participantsLabel(participants: SupportUser[]) {
  if (participants.length === 0) return "Deleted users";
  return participants.map((p) => displayName(p)).join(" ↔ ");
}

export function displayName(user: SupportUser | null) {
  if (!user) return "Deleted user";
  const person = [user.first_name, user.last_name].filter(Boolean).join(" ");
  return (
    user.business_name ||
    user.company_name ||
    person ||
    user.email ||
    "Unnamed user"
  );
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
