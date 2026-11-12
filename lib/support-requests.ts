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
    is_admin: boolean;
  } | null;
};

export type SupportThread = Omit<SupportRequest, "last_message_preview"> & {
  messages: SupportMessage[];
};

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
