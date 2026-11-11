// app/api/admin/vendors/[id]/route.ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { deleteUserCascade } from "@/lib/supabase/delete-user-cascade";
import { displayName, logAdminActivity } from "@/lib/supabase/log-admin-activity";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("profiles")
    .select(
      "id, business_name, company_name, first_name, last_name, email, phone_number, verification_status, created_at, id_type, id_front_image, id_back_image"
    )
    .eq("id", id)
    .eq("user_type", "vendor")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const body = await request.json();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("profiles")
    .update({
      business_name: body.business_name,
      email: body.email,
      phone_number: body.phone_number,
      verification_status: body.verification_status,
    })
    .eq("id", id)
    .eq("user_type", "vendor")
    .select()
    .single();

  await logAdminActivity({
    action: "vendor.update",
    description: `Updated vendor ${displayName(data ?? body)}`,
    targetType: "vendor",
    targetId: id,
    status: error ? "failed" : "success",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const admin = createAdminClient();

  const { data: existing, error: lookupError } = await admin
    .from("profiles")
    .select("id, business_name, company_name, first_name, last_name, email")
    .eq("id", id)
    .eq("user_type", "vendor")
    .maybeSingle();

  if (lookupError) {
    return NextResponse.json({ error: lookupError.message }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  }

  const { error } = await deleteUserCascade(admin, id);

  await logAdminActivity({
    action: "vendor.delete",
    description: `Deleted vendor ${displayName(existing)}`,
    targetType: "vendor",
    targetId: id,
    status: error ? "failed" : "success",
  });

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
