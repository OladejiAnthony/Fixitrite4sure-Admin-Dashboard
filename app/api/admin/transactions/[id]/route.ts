// app/api/admin/transactions/[id]/route.ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/require-admin";

const PAYMENT_SELECT =
  "id, amount, status, created_at, " +
  "owner:profiles(id, first_name, last_name, email, phone_number), " +
  "invoice:invoices(id, booking_id, order_id, " +
  "booking:bookings(id, service:services(name)), " +
  "order:orders(id, total_amount))";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("payments")
    .select(PAYMENT_SELECT)
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}
