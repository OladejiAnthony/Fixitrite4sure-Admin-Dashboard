// app/api/admin/onboarding/[id]/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/require-admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const admin = createAdminClient();

  const { data: profile, error } = await admin
    .from("profiles")
    .select(
      "id, user_type, first_name, last_name, business_name, company_name, phone_number, email, profile_image, id_type, id_details, id_front_image, id_back_image, verification_status, business_details, created_at"
    )
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  const { data: addresses, error: addressesError } = await admin
    .from("addresses")
    .select("id, address_type, formatted_address, contact_person")
    .eq("owner_id", id);

  if (addressesError) {
    return NextResponse.json({ error: addressesError.message }, { status: 500 });
  }

  return NextResponse.json({ ...profile, addresses });
}

const statusSchema = z.object({
  status: z.enum(["approved", "rejected"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const parsed = statusSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const admin = createAdminClient();
  const verification_status =
    parsed.data.status === "approved" ? "verified" : "rejected";

  const { data, error } = await admin
    .from("profiles")
    .update({ verification_status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
