// app/(dashboard)/repairers/[id]/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { use } from "react";

interface Service {
    id: string;
    name: string;
    profession: string | null;
    category: string;
    rating: number | null;
    status: string;
    created_at: string;
}

interface Repairer {
    id: string;
    first_name: string | null;
    last_name: string | null;
    business_name: string | null;
    email: string | null;
    phone_number: string | null;
    verification_status: string | null;
    created_at: string;
    id_type: string | null;
    id_front_image: string | null;
    id_back_image: string | null;
    services: Service[];
}

const fetchRepairer = async (id: string): Promise<Repairer> => {
    const response = await fetch(`/api/admin/repairers/${id}`);
    if (!response.ok) throw new Error("Failed to fetch repairer");
    return response.json();
};

export default function RepairerProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const repairerId = resolvedParams.id;

    const { data: repairer, isLoading } = useQuery({
        queryKey: ["repairer", repairerId],
        queryFn: () => fetchRepairer(repairerId),
    });

    if (isLoading) return <div className="p-6 text-center text-gray-500">Loading...</div>;

    const name =
        [repairer?.first_name, repairer?.last_name].filter(Boolean).join(" ") ||
        repairer?.business_name ||
        "—";

    return (
        <div className="min-h-screen bg-white p-6 font-sans text-gray-900">
            <h1 className="text-2xl font-bold uppercase mb-6">REPAIRER PROFILE</h1>

            <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">REPAIRER'S PERSONAL DETAILS</h2>
                <div className="border border-gray-200 rounded-lg p-4">
                    <table className="w-full">
                        <tbody>
                            <tr className="border-b border-gray-200">
                                <td className="py-3 font-medium w-1/2">Name:</td>
                                <td className="py-3">{name}</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-3 font-medium">Email Address:</td>
                                <td className="py-3">{repairer?.email}</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-3 font-medium">Phone number:</td>
                                <td className="py-3">{repairer?.phone_number}</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-3 font-medium">Joined:</td>
                                <td className="py-3">
                                    {repairer?.created_at && new Date(repairer.created_at).toLocaleDateString()}
                                </td>
                            </tr>
                            <tr>
                                <td className="py-3 font-medium">Status:</td>
                                <td className="py-3">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${repairer?.verification_status === "verified"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                                        }`}>
                                        {repairer?.verification_status || "unverified"}
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
                            {repairer?.id_type || "Not provided"}
                        </p>
                    </div>
                    <div className="flex space-x-4">
                        <Button variant="outline" className="border-gray-300" disabled={!repairer?.id_front_image}>
                            [Front]
                        </Button>
                        <Button variant="outline" className="border-gray-300" disabled={!repairer?.id_back_image}>
                            [Back]
                        </Button>
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-lg font-semibold mb-4">SERVICES OFFERED</h2>
                {repairer?.services.length ? (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                        <table className="w-full table-auto">
                            <thead>
                                <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Profession</th>
                                    <th className="px-4 py-3">Category</th>
                                    <th className="px-4 py-3">Rating</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {repairer.services.map((service) => (
                                    <tr key={service.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{service.name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{service.profession || "—"}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900 capitalize">{service.category}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{service.rating ?? "—"}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900 capitalize">{service.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">No services on record.</p>
                )}
            </div>
        </div>
    );
}
