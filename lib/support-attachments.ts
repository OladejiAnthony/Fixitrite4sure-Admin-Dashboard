// lib/support-attachments.ts
// Photo attachments on admin support replies. Admins can send text and images
// only, no videos (users can still send videos, and the thread still plays
// them). Uploaded from the browser
// on the admin's own session straight to the private chat-media bucket
// (bucket and policies: fixit-app-mobile/supabase/migrations/20261104190000_chat.sql).
// The "Users upload their own chat media" policy only allows the uploader's
// own folder, so objects go to {adminId}/... - the same layout the mobile app
// uses. Going direct also avoids pushing large files through a Route
// Handler (serverless request body limits).
import { createClient } from "@/lib/supabase/client";

// chat-media's bucket file_size_limit.
export const SUPPORT_ATTACHMENT_MAX_BYTES = 50 * 1024 * 1024;

// Image types chat-media allows. Video types are deliberately left out.
const EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
  "image/gif": "gif",
};

export const SUPPORT_ATTACHMENT_ACCEPT = Object.keys(EXTENSIONS).join(",");

export type SupportAttachment = { path: string; type: "image" };

// Returns an error message for a file that can't be sent, or null.
export function validateSupportAttachment(file: File): string | null {
  if (!EXTENSIONS[file.type]) {
    return file.type.startsWith("video/")
      ? "Videos can't be sent. Attach a photo instead."
      : "Only photos (JPG, PNG, WebP, HEIC, GIF) can be sent.";
  }
  if (file.size > SUPPORT_ATTACHMENT_MAX_BYTES) {
    return "Photos must be 50MB or smaller.";
  }
  return null;
}

export async function uploadSupportAttachment(
  file: File
): Promise<SupportAttachment> {
  const invalid = validateSupportAttachment(file);
  if (invalid) throw new Error(invalid);

  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Your session has expired. Sign in again.");

  const random = Math.random().toString(36).slice(2, 10);
  const path = `${user.id}/${Date.now()}-${random}.${EXTENSIONS[file.type]}`;

  const { error } = await supabase.storage
    .from("chat-media")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  return { path, type: "image" };
}

// Best-effort cleanup when the reply couldn't be saved after the upload.
export async function removeSupportAttachment(path: string) {
  try {
    const { error } = await createClient().storage.from("chat-media").remove([path]);
    if (error) console.warn("Failed to remove chat media:", error.message);
  } catch (error) {
    console.warn("Failed to remove chat media:", error);
  }
}
