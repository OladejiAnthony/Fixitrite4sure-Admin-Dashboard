// app/api/admin/e-repair/[resource]/[id]/route.ts
// GET /api/admin/e-repair/{bookings|repairs|discovery|reports}/:id
// Bookings and repairs are keyed by booking id, discovery by invoice id,
// reports by calendar month (yyyy-MM).
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/require-admin";
import {
  loadBooking,
  loadDiscovery,
  loadRepair,
  loadReport,
} from "@/lib/e-repair";

const LOADERS = {
  bookings: loadBooking,
  repairs: loadRepair,
  discovery: loadDiscovery,
  reports: loadReport,
} as const;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ resource: string; id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { resource, id } = await params;
  const load = LOADERS[resource as keyof typeof LOADERS];
  // Non-uuid ids would make Postgres raise on the uuid columns; treat as 404.
  if (!load || (resource !== "reports" && !UUID.test(id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const data = await load(createAdminClient(), id);
    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load data" },
      { status: 500 }
    );
  }
}
