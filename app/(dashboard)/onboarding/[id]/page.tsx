//app/(dashboard)/onboarding/[id]/page.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Address {
    id: string;
    address_type: string;
    formatted_address: string | null;
    contact_person: string | null;
}

interface Onboarding {
    id: string;
    user_type: "customer" | "repairer" | "company" | "vendor";
    first_name: string | null;
    last_name: string | null;
    business_name: string | null;
    company_name: string | null;
    phone_number: string | null;
    email: string | null;
    profile_image: string | null;
    id_type: string | null;
    id_details: Record<string, string> | null;
    id_front_image: string | null;
    id_back_image: string | null;
    verification_status: string | null;
    business_details: Record<string, unknown> | null;
    created_at: string;
    addresses: Address[];
}

const accountTypeLabels: Record<Onboarding["user_type"], string> = {
    customer: "Customer",
    repairer: "Repairer",
    company: "Repair Company",
    vendor: "Vendor",
};

// Every signup flow writes the same 13 id_details keys regardless of ID
// type — only the ones relevant to the chosen ID type end up non-empty.
const idDetailLabels: Record<string, string> = {
    firstNameP: "First Name (on ID)",
    otherNames: "Other Names (on ID)",
    dob: "Date of Birth",
    placeOfBirth: "Place of Birth",
    passportNumber: "Passport Number",
    issuedDate: "Issued Date",
    expiryDate: "Expiry Date",
    address: "Address (on ID)",
    licenseNumber: "Licence Number",
    occupation: "Occupation",
    pollingUnit: "Polling Unit",
    vin: "Voter's Identification Number (VIN)",
    nin: "National Identification Number (NIN)",
};

async function fetchOnboardingDetails(id: string) {
    const response = await fetch(`/api/admin/onboarding/${id}`);
    if (!response.ok) throw new Error("Failed to fetch onboarding record");
    return response.json() as Promise<Onboarding>;
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
    if (!value) return null;
    return (
        <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
            <p className="bg-white border border-gray-300 p-2 rounded-md text-sm text-gray-800">{value}</p>
        </div>
    );
}

function extractFileValue(value: unknown): { uri: string | null; name: string | null } {
    if (typeof value === "string") return { uri: value || null, name: null };
    if (value && typeof value === "object") {
        const obj = value as Record<string, unknown>;
        return {
            uri: typeof obj.uri === "string" ? obj.uri : null,
            name: typeof obj.name === "string" ? obj.name : null,
        };
    }
    return { uri: null, name: null };
}

const isFetchableUrl = (uri: string) => /^https?:\/\//i.test(uri);

function ImagePlaceholder({ label, text }: { label: string; text: string }) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
            <div className="w-32 h-24 rounded-md border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center p-2">
                <p className="text-[11px] text-gray-500 text-center leading-tight">{text}</p>
            </div>
        </div>
    );
}

// identity-documents is a private bucket, so the API route signs these
// paths into short-lived https URLs before they reach us — a value that
// still isn't an http(s) URL here means the field is genuinely empty or
// unsigned. We render a real <img> whenever the value is an http(s) URL,
// and an honest explanation otherwise instead of a broken image icon.
function ImageField({ label, value }: { label: string; value: unknown }) {
    const { uri, name } = extractFileValue(value);
    const [imgFailed, setImgFailed] = useState(false);

    if (!uri) {
        return <ImagePlaceholder label={label} text="Not provided" />;
    }

    if (!isFetchableUrl(uri)) {
        return (
            <ImagePlaceholder
                label={label}
                text="Not viewable — stored on the user's device, not yet uploaded to cloud storage"
            />
        );
    }

    return (
        <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
            {imgFailed ? (
                <a
                    href={uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                >
                    View file{name ? `: ${name}` : ""}
                </a>
            ) : (
                <a href={uri} target="_blank" rel="noopener noreferrer">
                    <img
                        src={uri}
                        alt={label}
                        onError={() => setImgFailed(true)}
                        className="w-32 h-24 object-cover rounded-md border border-gray-300 hover:opacity-80 transition-opacity"
                    />
                </a>
            )}
        </div>
    );
}

export default function OnboardingDetailsPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["onboarding", id],
        queryFn: () => fetchOnboardingDetails(id),
    });

    const updateStatusMutation = useMutation({
        mutationFn: (newStatus: "approved" | "rejected") =>
            fetch(`/api/admin/onboarding/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            }).then((res) => {
                if (!res.ok) throw new Error("Failed to update status");
                return res.json();
            }),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["onboarding"] });
            toast.success(`User ${variables === "approved" ? "approved" : "rejected"} successfully`);
            router.push("/onboarding");
        },
        onError: () => {
            toast.error("Failed to update user status");
        },
    });

    if (isLoading || !data) {
        return <div className="p-6 text-center text-gray-600">Loading...</div>;
    }

    const name =
        [data.first_name, data.last_name].filter(Boolean).join(" ") ||
        data.company_name ||
        data.business_name ||
        "—";

    const idDetailEntries = Object.entries(data.id_details || {}).filter(
        ([, value]) => value
    );

    const businessDetails = data.business_details || {};

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="px-6 py-4 border-b border-gray-200">
                <Link
                    href="/onboarding"
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Onboarding Page
                </Link>
            </div>

            <div className="mx-auto bg-white rounded-lg shadow-md overflow-hidden p-6 space-y-8">
                <h1 className="text-xl font-bold text-gray-800">
                    {accountTypeLabels[data.user_type].toUpperCase()} DETAILS
                </h1>

                <div>
                    <h2 className="text-base font-semibold text-blue-800 mb-4">PERSONAL DETAILS</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <DetailRow label="Name" value={name} />
                        <DetailRow label="Email Address" value={data.email} />
                        <DetailRow label="Phone Number" value={data.phone_number} />
                        <DetailRow
                            label="Joined"
                            value={data.created_at ? new Date(data.created_at).toLocaleString() : null}
                        />
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                            <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${data.verification_status === "verified"
                                    ? "bg-green-100 text-green-800"
                                    : data.verification_status === "rejected"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                            >
                                {data.verification_status || "unverified"}
                            </span>
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-base font-semibold text-blue-800 mb-4">ADDRESS</h2>
                    {data.addresses.length ? (
                        <div className="space-y-2">
                            {data.addresses.map((addr) => (
                                <p key={addr.id} className="bg-white border border-gray-300 p-2 rounded-md text-sm text-gray-800">
                                    <span className="capitalize font-medium">{addr.address_type}:</span>{" "}
                                    {addr.formatted_address || "Not provided"}
                                </p>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">No address on record.</p>
                    )}
                </div>

                <div>
                    <h2 className="text-base font-semibold text-blue-800 mb-4">GOVERNMENT ID</h2>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <DetailRow label="ID Type" value={data.id_type} />
                        <ImageField label="Profile Picture" value={data.profile_image} />
                        <ImageField label="ID Front" value={data.id_front_image} />
                        <ImageField label="ID Back" value={data.id_back_image} />
                    </div>
                    {idDetailEntries.length > 0 && (
                        <div className="grid grid-cols-2 gap-4">
                            {idDetailEntries.map(([key, value]) => (
                                <DetailRow key={key} label={idDetailLabels[key] || key} value={value} />
                            ))}
                        </div>
                    )}
                </div>

                {data.user_type === "repairer" && (
                    <div>
                        <h2 className="text-base font-semibold text-blue-800 mb-4">PROFESSIONAL INFORMATION</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <DetailRow label="Repair Category" value={businessDetails.repair_category as string} />
                            <DetailRow label="Skills" value={businessDetails.skills as string} />
                            <DetailRow label="Years of Experience" value={businessDetails.years_of_experience as string} />
                            <DetailRow label="Association Name" value={businessDetails.association_name as string} />
                            <ImageField label="Certification" value={businessDetails.certification_image} />
                        </div>
                    </div>
                )}

                {data.user_type === "company" && (
                    <div>
                        <h2 className="text-base font-semibold text-blue-800 mb-4">COMPANY INFORMATION</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <DetailRow
                                label="Repair Categories"
                                value={Array.isArray(businessDetails.repair_categories) ? businessDetails.repair_categories.join(", ") : undefined}
                            />
                            <DetailRow label="Staff Count" value={businessDetails.staff_count as string} />
                            <DetailRow label="Skills" value={businessDetails.skills as string} />
                            <DetailRow label="Years of Service" value={businessDetails.years_of_service as string} />
                            <DetailRow label="Registration Number" value={businessDetails.registration_number as string} />
                            <ImageField label="Certification" value={businessDetails.certification_image} />
                            <ImageField label="Business License" value={businessDetails.business_license} />
                            <ImageField label="Proof of Insurance" value={businessDetails.proof_of_insurance} />
                        </div>
                    </div>
                )}

                {data.user_type === "vendor" && (
                    <div>
                        <h2 className="text-base font-semibold text-blue-800 mb-4">BUSINESS INFORMATION</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <DetailRow label="Registered Business Name" value={businessDetails.reg_business_name as string} />
                            <DetailRow label="CAC Number" value={businessDetails.cac_number as string} />
                            <DetailRow label="Registration Date" value={businessDetails.registration_date as string} />
                            <DetailRow label="Business Type" value={businessDetails.business_type as string} />
                            <ImageField label="Certification" value={businessDetails.certification_image} />
                            <ImageField label="Business License" value={businessDetails.business_license} />
                            <ImageField label="Proof of Insurance" value={businessDetails.proof_of_insurance} />
                        </div>
                    </div>
                )}

                <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
                    <button
                        onClick={() => updateStatusMutation.mutate("approved")}
                        disabled={updateStatusMutation.isPending || data.verification_status === "verified"}
                        className={`bg-blue-500 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors ${updateStatusMutation.isPending || data.verification_status === "verified" ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        {updateStatusMutation.isPending ? "Processing..." : "Accept User"}
                    </button>
                    <button
                        onClick={() => updateStatusMutation.mutate("rejected")}
                        disabled={updateStatusMutation.isPending || data.verification_status === "rejected"}
                        className={`bg-red-500 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-red-600 transition-colors ${updateStatusMutation.isPending || data.verification_status === "rejected" ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        {updateStatusMutation.isPending ? "Processing..." : "Reject User"}
                    </button>
                </div>
            </div>
        </div>
    );
}
