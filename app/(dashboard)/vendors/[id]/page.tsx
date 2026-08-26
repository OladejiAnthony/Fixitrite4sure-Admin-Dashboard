// app/(dashboard)/vendors/[id]/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { use } from "react";

interface Vendor {
    id: string;
    business_name: string | null;
    company_name: string | null;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone_number: string | null;
    verification_status: string | null;
    created_at: string;
    id_type: string | null;
    id_front_image: string | null;
    id_back_image: string | null;
}

const fetchVendor = async (id: string): Promise<Vendor> => {
    const response = await fetch(`/api/admin/vendors/${id}`);
    if (!response.ok) throw new Error("Failed to fetch vendor");
    return response.json();
};

export default function VendorProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const vendorId = resolvedParams.id;

    const { data: vendor, isLoading } = useQuery({
        queryKey: ["vendor", vendorId],
        queryFn: () => fetchVendor(vendorId),
    });

    if (isLoading) return <div className="p-6 text-center text-gray-500">Loading...</div>;

    const name =
        vendor?.business_name ||
        vendor?.company_name ||
        [vendor?.first_name, vendor?.last_name].filter(Boolean).join(" ") ||
        "—";

    return (
        <div className="min-h-screen bg-white p-6 font-sans text-gray-900">
            <h1 className="text-2xl font-bold uppercase mb-6">VENDOR PROFILE</h1>

            <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">VENDOR'S DETAILS</h2>
                <div className="border border-gray-200 rounded-lg p-4">
                    <table className="w-full">
                        <tbody>
                            <tr className="border-b border-gray-200">
                                <td className="py-3 font-medium w-1/2">Business Name:</td>
                                <td className="py-3">{name}</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-3 font-medium">Email Address:</td>
                                <td className="py-3">{vendor?.email}</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-3 font-medium">Phone number:</td>
                                <td className="py-3">{vendor?.phone_number}</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-3 font-medium">Joined:</td>
                                <td className="py-3">
                                    {vendor?.created_at && new Date(vendor.created_at).toLocaleDateString()}
                                </td>
                            </tr>
                            <tr>
                                <td className="py-3 font-medium">Status:</td>
                                <td className="py-3">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${vendor?.verification_status === "verified"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                                        }`}>
                                        {vendor?.verification_status || "unverified"}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">VERIFICATION DOCUMENTS</h2>
                <div className="border border-gray-200 rounded-lg p-4">
                    <div className="mb-4">
                        <h3 className="font-bold">Government Issued ID</h3>
                        <p className="text-gray-600 mt-1">
                            {vendor?.id_type || "Not provided"}
                        </p>
                    </div>
                    <div className="flex space-x-4">
                        <Button variant="outline" className="border-gray-300" disabled={!vendor?.id_front_image}>
                            [Front]
                        </Button>
                        <Button variant="outline" className="border-gray-300" disabled={!vendor?.id_back_image}>
                            [Back]
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
