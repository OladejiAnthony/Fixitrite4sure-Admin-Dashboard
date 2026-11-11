// app/api/admin/analytics/route.ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { dedupeProfilesByIdentity } from "@/lib/dedupe-profiles";

// Read-only aggregation over existing tables for the Analytics page:
// - user totals come from public.profiles (non-admin), deduplicated the same
//   way as the Customers/Repairers/Repair Companies/Vendors list routes so the
//   numbers match those pages;
// - "product orders" are public.orders, "service orders" are public.bookings.
// Months are bucketed in UTC.

const CHART_MONTHS = 12;

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
}

function monthLabel(date: Date): string {
  const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  return `${month} ${String(date.getUTCFullYear()).slice(-2)}`;
}

function bucketByMonth(rows: { created_at: string }[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = monthKey(new Date(row.created_at));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

function monthOverMonth(current: number, previous: number, noun: string): string {
  if (previous === 0) {
    return current === 0 ? `No ${noun} this month or last` : `No ${noun} last month`;
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  return `${pct >= 0 ? "+" : ""}${pct}% vs last month`;
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const admin = createAdminClient();

  const now = new Date();
  const windowStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (CHART_MONTHS - 1), 1)
  );

  const [profilesRes, ordersCountRes, bookingsCountRes, ordersRes, bookingsRes] =
    await Promise.all([
      admin
        .from("profiles")
        .select("id, user_type, email, phone_number, verification_status")
        .eq("is_admin", false),
      admin.from("orders").select("id", { count: "exact", head: true }),
      admin.from("bookings").select("id", { count: "exact", head: true }),
      admin
        .from("orders")
        .select("created_at")
        .gte("created_at", windowStart.toISOString()),
      admin
        .from("bookings")
        .select("created_at")
        .gte("created_at", windowStart.toISOString()),
    ]);

  const firstError =
    profilesRes.error ??
    ordersCountRes.error ??
    bookingsCountRes.error ??
    ordersRes.error ??
    bookingsRes.error;
  if (firstError) {
    return NextResponse.json({ error: firstError.message }, { status: 500 });
  }

  const profiles = profilesRes.data ?? [];
  const countType = (type: string) =>
    dedupeProfilesByIdentity(profiles.filter((p) => p.user_type === type)).length;

  const orderMonths = bucketByMonth(ordersRes.data ?? []);
  const bookingMonths = bucketByMonth(bookingsRes.data ?? []);

  const totalOrdersChart = Array.from({ length: CHART_MONTHS }, (_, i) => {
    const d = new Date(Date.UTC(windowStart.getUTCFullYear(), windowStart.getUTCMonth() + i, 1));
    const key = monthKey(d);
    return {
      month: monthLabel(d),
      product: orderMonths.get(key) ?? 0,
      service: bookingMonths.get(key) ?? 0,
    };
  });

  const thisMonth = totalOrdersChart[CHART_MONTHS - 1];
  const lastMonth = totalOrdersChart[CHART_MONTHS - 2];

  return NextResponse.json({
    user: {
      customers: countType("customer"),
      repairers: countType("repairer"),
      repairCompanies: countType("company"),
      vendors: countType("vendor"),
      timestamp: `As of ${now.toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "UTC",
      })} UTC`,
    },
    orders: {
      product: ordersCountRes.count ?? 0,
      productChange: monthOverMonth(thisMonth.product, lastMonth.product, "product orders"),
      service: bookingsCountRes.count ?? 0,
      serviceChange: monthOverMonth(thisMonth.service, lastMonth.service, "service orders"),
    },
    totalOrdersChart,
  });
}
