// app/api/admin/e-repair/[resource]/route.ts
// GET /api/admin/e-repair/{bookings|repairs|discovery|reports}
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/require-admin";
import {
  loadBookings,
  loadDiscoveries,
  loadRepairs,
  loadReports,
} from "@/lib/e-repair";

const LOADERS = {
  bookings: loadBookings,
  repairs: loadRepairs,
  discovery: loadDiscoveries,
  reports: loadReports,
} as const;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ resource: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { resource } = await params;
  const load = LOADERS[resource as keyof typeof LOADERS];
  if (!load) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    return NextResponse.json(await load(createAdminClient()));
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load data" },
      { status: 500 }
    );
  }
}
