// app/api/admin/onboarding/[id]/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/require-admin";

// id_front_image/id_back_image and the business_details document fields are
// saved by the mobile app as bare identity-documents storage paths, not
// public URLs - that bucket is owner-only, so uploadUserFile() there can't
// hand back anything fetchable from a browser. Sign them here with the
// service-role client (the only client allowed to read another user's file
// in that bucket) before the JSON response reaches the dashboard.
//
// profile_image is NOT one of these - uploadUserFile() saves it to the
// public "avatars" bucket and already hands back a usable public URL, so it
// must pass through unchanged. Signing it here as an identity-documents path
// looks up a nonexistent object (the value isn't a path in that bucket) and
// silently nulls the field out.
const IDENTITY_DOCUMENTS_BUCKET = "identity-documents";
const SIGNED_URL_TTL_SECONDS = 60 * 60; // covers a single admin review session

type BusinessDocument = { path: string; name: string; size?: number };

function isBusinessDocument(value: unknown): value is BusinessDocument {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as Record<string, unknown>).path === "string"
  );
}

async function withSignedDocumentUrls(
  admin: ReturnType<typeof createAdminClient>,
  profile: Record<string, unknown>
) {
  const businessDetails =
    (profile.business_details as Record<string, unknown> | null) ?? null;
  const certificationImage = businessDetails?.certification_image;
  const businessLicense = businessDetails?.business_license;
  const proofOfInsurance = businessDetails?.proof_of_insurance;

  const paths = [
    profile.id_front_image,
    profile.id_back_image,
    typeof certificationImage === "string" ? certificationImage : null,
    isBusinessDocument(businessLicense) ? businessLicense.path : null,
    isBusinessDocument(proofOfInsurance) ? proofOfInsurance.path : null,
  ].filter((path): path is string => typeof path === "string" && path.length > 0);

  if (paths.length === 0) return profile;

  const { data: signedUrls, error } = await admin.storage
    .from(IDENTITY_DOCUMENTS_BUCKET)
    .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);
  if (error) throw error;

  const signedUrlByPath = new Map(
    (signedUrls ?? []).map((entry) => [entry.path, entry.signedUrl])
  );

  return {
    ...profile,
    id_front_image:
      typeof profile.id_front_image === "string"
        ? signedUrlByPath.get(profile.id_front_image) ?? null
        : profile.id_front_image,
    id_back_image:
      typeof profile.id_back_image === "string"
        ? signedUrlByPath.get(profile.id_back_image) ?? null
        : profile.id_back_image,
    business_details: businessDetails && {
      ...businessDetails,
      certification_image:
        typeof certificationImage === "string"
          ? signedUrlByPath.get(certificationImage) ?? null
          : certificationImage,
      business_license: isBusinessDocument(businessLicense)
        ? {
            uri: signedUrlByPath.get(businessLicense.path) ?? null,
            name: businessLicense.name,
            size: businessLicense.size,
          }
        : businessLicense,
      proof_of_insurance: isBusinessDocument(proofOfInsurance)
        ? {
            uri: signedUrlByPath.get(proofOfInsurance.path) ?? null,
            name: proofOfInsurance.name,
            size: proofOfInsurance.size,
          }
        : proofOfInsurance,
    },
  };
}

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

  const signedProfile = await withSignedDocumentUrls(admin, profile);

  return NextResponse.json({ ...signedProfile, addresses });
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
