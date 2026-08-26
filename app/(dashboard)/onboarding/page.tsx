//app/(dashboard)/onboarding/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Pagination } from "@/components/common/pagination";

interface ProfileRow {
    id: string;
    user_type: "customer" | "repairer" | "company" | "vendor";
    first_name: string | null;
    last_name: string | null;
    business_name: string | null;
    company_name: string | null;
    phone_number: string | null;
    verification_status: string | null;
    created_at: string;
}

interface Onboarding {
    id: string;
    dateTime: string;
    name: string;
    phone: string;
    accountType: string;
    status: string;
}

const accountTypeLabels: Record<ProfileRow["user_type"], string> = {
    customer: "Customer",
    repairer: "Repairer",
    company: "Repair Company",
    vendor: "Vendor",
};

const toOnboarding = (row: ProfileRow): Onboarding => ({
    id: row.id,
    dateTime: row.created_at,
    name:
        [row.first_name, row.last_name].filter(Boolean).join(" ") ||
        row.company_name ||
        row.business_name ||
        "—",
    phone: row.phone_number || "—",
    accountType: accountTypeLabels[row.user_type],
    status: row.verification_status || "pending",
});

async function fetchOnboarding(): Promise<Onboarding[]> {
    const response = await fetch("/api/admin/onboarding");
    if (!response.ok) throw new Error("Failed to fetch onboarding records");
    const rows: ProfileRow[] = await response.json();
    return rows.map(toOnboarding);
}

export default function OnboardingPage() {
    const currentPage = useSelector((state: RootState) => state.pagination.currentPage);
    const itemsPerPage = useSelector((state: RootState) => state.pagination.itemsPerPage);

    const { data = [], isLoading } = useQuery({
        queryKey: ["onboarding"],
        queryFn: fetchOnboarding,
    });

    if (isLoading) {
        return <div className="p-6 text-center text-gray-600">Loading...</div>;
    }

    const totalItems = data.length;
    const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
                <h1 className="text-xl font-bold text-gray-800 px-6 py-4 border-b border-gray-200">ONBOARDING</h1>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-700">
                        <thead className="bg-gray-50 text-xs uppercase font-medium text-gray-500">
                            <tr>
                                <th className="px-6 py-3">Date and Time</th>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Phone Number</th>
                                <th className="px-6 py-3">Account Type</th>
                                <th className="px-6 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map((item) => (
                                <tr key={item.id} className="bg-white border-b border-gray-200 hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(item.dateTime).toLocaleString()}</td>
                                    <td className="px-6 py-4">{item.name}</td>
                                    <td className="px-6 py-4 capitalize">{item.status}</td>
                                    <td className="px-6 py-4">{item.phone}</td>
                                    <td className="px-6 py-4">{item.accountType}</td>
                                    <td className="px-6 py-4">
                                        <Link
                                            href={`/onboarding/${item.id}`}
                                            className="bg-blue-500 text-white px-4 py-2 rounded-md text-xs font-medium hover:bg-blue-600 transition-colors"
                                        >
                                            View details
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <Pagination totalItems={totalItems} />
        </div>
    );
}
