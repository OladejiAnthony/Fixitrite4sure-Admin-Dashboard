// app/api/admin/transactions/route.ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/require-admin";

// public.payments — generic payment records against an invoice, which in
// turn traces back to whatever it was raised for (a booking's service, or
// an order).
const PAYMENT_SELECT =
  "id, amount, status, created_at, " +
  "owner:profiles(id, first_name, last_name, email, phone_number), " +
  "invoice:invoices(id, booking_id, order_id, " +
  "booking:bookings(id, service:services(name)), " +
  "order:orders(id, total_amount))";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("payments")
    .select(PAYMENT_SELECT)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
