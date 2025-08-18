//app/(dashboard)/onboarding/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store"; // Assuming your store is set up
import { Pagination } from "@/components/common/pagination";


interface Onboarding {
    id: number;
    dateTime: string;
    surname: string;
    otherNames: string;
    phone: string;
    accountType: "Customer" | "Repairer" | "Repair Company" | "Vendor";
    status: string;
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    profilePicture: string;
    govIdType: string;
    govIdFront: string;
    govIdBack: string;
    dob: string;
    cardAddress: string;
    occupation: string;
    pollingUnit: string;
    vin: string;
    businessName?: string;
    businessPhone?: string;
    repairCategory?: string;
    repairSkills?: string[];
    yearsExperience?: number;
    associationName?: string;
    certificationUrl?: string;
    numberOfRepairers?: number;
    businessLicenseUrl?: string;
    proofOfInsuranceUrl?: string;
    registeredBusinessName?: string;
    typeOfBusiness?: string;
    cacRegistrationNumber?: string;
    dateOfRegistration?: string;
    cacDocumentUrl?: string;
    proofOfAddressUrl?: string;
}

async function fetchOnboarding() {
    const { data } = await apiClient.get("/onboarding");
    return data as Onboarding[];
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
    const totalPages = Math.ceil(totalItems / itemsPerPage);
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
                                    <td className="px-6 py-4 whitespace-nowrap">{item.dateTime}</td>

                                    <td className="px-6 py-4">{item.otherNames}{" "}{item.surname}</td>
                                    <td className="px-6 py-4">{item.status}</td>
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
            {/* Pagination Component */}
            <Pagination totalItems={totalItems} />
        </div>
    );
}
