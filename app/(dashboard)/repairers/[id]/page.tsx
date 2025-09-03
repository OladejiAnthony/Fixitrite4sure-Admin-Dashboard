//app\(dashboard)\repairers\[id]\page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { use } from "react"; // Import the use hook

interface Repairer {
    id: number;
    name: string;
    email: string;
    phone: string;
    status: "Active" | "Inactive" | "Online" | "Offline";
    lastLogin: string;
    address?: string;
    homeName?: string;
    verificationDocuments?: {
        governmentId: {
            type: string;
            frontImage: string;
            backImage: string;
        };
    };
}

const fetchRepairer = async (id: string): Promise<Repairer> => {
    const { data } = await apiClient.get(`/repairers/${id}`);
    return data;
};

export default function RepairerProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const repairerId = resolvedParams.id;

    const { data: repairer, isLoading } = useQuery({
        queryKey: ["repairer", repairerId],
        queryFn: () => fetchRepairer(repairerId),
    });

    if (isLoading) return <div className="p-6 text-center text-gray-500">Loading...</div>;

    return (
        <div className="min-h-screen bg-white p-6 font-sans text-gray-900">
            <h1 className="text-2xl font-bold uppercase mb-6">USER PROFILE</h1>

            {/* CUSTOMER'S PERSONAL DETAILS */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">REPAIRER'S PERSONAL DETAILS</h2>
                <div className="border border-gray-200 rounded-lg p-4">
                    <table className="w-full">
                        <tbody>
                            <tr className="border-b border-gray-200">
                                <td className="py-3 font-medium w-1/2">Name:</td>
                                <td className="py-3">{repairer?.name}</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-3 font-medium">Home Name:</td>
                                <td className="py-3">{repairer?.homeName || "N/A"}</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-3 font-medium">Email Address:</td>
                                <td className="py-3">{repairer?.email}</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-3 font-medium">Phone number:</td>
                                <td className="py-3">{repairer?.phone}</td>
                            </tr>
                            <tr>
                                <td className="py-3 font-medium">Status:</td>
                                <td className="py-3">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${repairer?.status === "Online" || repairer?.status === "Active"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                                        }`}>
                                        {repairer?.status}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ADDRESS */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">ADDRESS</h2>
                <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium mb-2">Address</h3>
                    <div className="border-t border-gray-200 pt-4">
                        <p className="text-gray-500">{repairer?.address || "No address provided"}</p>
                    </div>
                </div>
            </div>

            {/* VERIFICATION DOCUMENTS */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">VERIFICATION DOCUMENTS</h2>
                <div className="border border-gray-200 rounded-lg p-4">
                    <div className="mb-4">
                        <h3 className="font-bold">Government Issued ID</h3>
                        <p className="text-gray-600 mt-1">
                            {repairer?.verificationDocuments?.governmentId.type || "Driver's License"}
                        </p>
                    </div>
                    <div className="flex space-x-4">
                        <Button variant="outline" className="border-gray-300">
                            [Front]
                        </Button>
                        <Button variant="outline" className="border-gray-300">
                            [Back]
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
