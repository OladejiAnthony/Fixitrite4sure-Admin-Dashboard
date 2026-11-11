// lib/supabase/log-admin-activity.ts
import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Records an admin action in public.admin_activity_log, which backs the
// dashboard's "Recent activity" table. Call it from app/api/admin/** write
// handlers after the write has been attempted.
//
// Never throws: a logging failure (including the table not existing yet
// because the fixit-app-mobile migration hasn't been applied) is reported to
// the server console and must not block the admin action itself.

type ActivityInput = {
  action: string;
  description: string;
  targetType?: string;
  targetId?: string | null;
  status?: "success" | "failed";
};

type NamedRow = {
  first_name?: string | null;
  last_name?: string | null;
  business_name?: string | null;
  company_name?: string | null;
  email?: string | null;
} | null | undefined;

// Best human-readable label for a profile-like row, for activity descriptions.
export function displayName(row: NamedRow, fallback = "unknown account"): string {
  if (!row) return fallback;
  const full = [row.first_name, row.last_name].filter(Boolean).join(" ").trim();
  return full || row.business_name || row.company_name || row.email || fallback;
}

export async function logAdminActivity(input: ActivityInput): Promise<void> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const admin = createAdminClient();

    let adminName = user?.email ?? "Unknown admin";
    if (user) {
      const { data: profile } = await admin
        .from("profiles")
        .select("first_name, last_name, email")
        .eq("id", user.id)
        .maybeSingle();
      adminName = displayName(profile, adminName);
    }

    const { error } = await admin.from("admin_activity_log").insert({
      admin_id: user?.id ?? null,
      admin_name: adminName,
      action: input.action,
      description: input.description,
      target_type: input.targetType ?? null,
      target_id: input.targetId ?? null,
      status: input.status ?? "success",
    });

    if (error) {
      console.error("logAdminActivity insert failed:", error.message);
    }
  } catch (err) {
    console.error("logAdminActivity failed:", err);
  }
}
