// app/(dashboard)/customers/[id]/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { use } from "react"; // Import the use hook

interface Customer {
    id: string;
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

const fetchCustomer = async (id: string): Promise<Customer> => {
    const response = await fetch(`/api/admin/customers/${id}`);
    if (!response.ok) throw new Error("Failed to fetch customer");
    return response.json();
};

export default function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const customerId = resolvedParams.id;


    const { data: customer, isLoading } = useQuery({
        queryKey: ["customer", customerId],
        queryFn: () => fetchCustomer(customerId),
    });

    if (isLoading) return <div className="p-6 text-center text-gray-500">Loading...</div>;

    const name = [customer?.first_name, customer?.last_name].filter(Boolean).join(" ") || "—";

    return (
        <div className="min-h-screen bg-white p-6 font-sans text-gray-900">
            <h1 className="text-2xl font-bold uppercase mb-6">USER PROFILE</h1>

            {/* CUSTOMER'S PERSONAL DETAILS */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">CUSTOMER'S PERSONAL DETAILS</h2>
                <div className="border border-gray-200 rounded-lg p-4">
                    <table className="w-full">
                        <tbody>
                            <tr className="border-b border-gray-200">
                                <td className="py-3 font-medium w-1/2">Name:</td>
                                <td className="py-3">{name}</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-3 font-medium">Email Address:</td>
                                <td className="py-3">{customer?.email}</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-3 font-medium">Phone number:</td>
                                <td className="py-3">{customer?.phone_number}</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-3 font-medium">Joined:</td>
                                <td className="py-3">
                                    {customer?.created_at && new Date(customer.created_at).toLocaleDateString()}
                                </td>
                            </tr>
                            <tr>
                                <td className="py-3 font-medium">Status:</td>
                                <td className="py-3">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${customer?.verification_status === "verified"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                                        }`}>
                                        {customer?.verification_status || "unverified"}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* VERIFICATION DOCUMENTS */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">VERIFICATION DOCUMENTS</h2>
                <div className="border border-gray-200 rounded-lg p-4">
                    <div className="mb-4">
                        <h3 className="font-bold">Government Issued ID</h3>
                        <p className="text-gray-600 mt-1">
                            {customer?.id_type || "Not provided"}
                        </p>
                    </div>
                    <div className="flex space-x-4">
                        <Button variant="outline" className="border-gray-300" disabled={!customer?.id_front_image}>
                            [Front]
                        </Button>
                        <Button variant="outline" className="border-gray-300" disabled={!customer?.id_back_image}>
                            [Back]
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
