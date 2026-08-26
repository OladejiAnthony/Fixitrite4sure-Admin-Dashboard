import type React from "react";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function DashboardLayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=unauthorized");
  }

  // RLS on profiles is owner-scoped, so the admin's own session isn't
  // enough to safely gate access — check via service_role, which needs
  // the Node.js runtime this Server Component runs on (middleware.ts
  // can't use it — it's Edge-only and rejects this module at build time).
  const admin = createAdminClient();
  const { data: profile, error } = await admin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (error || !profile?.is_admin) {
    redirect("/login?error=unauthorized");
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
