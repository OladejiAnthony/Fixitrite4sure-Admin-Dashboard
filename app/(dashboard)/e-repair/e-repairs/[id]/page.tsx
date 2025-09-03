//app/(dashboard)/e-repair/e-repairs/[id]/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface Repair {
    id: string;
    repairId: string;
    technician: string;
    repairStatus: string;
    startDate: string;
    completionDate: string;
    totalCost: number;
    paymentStatus: string;
    repairConfirmation: string;
    partsUsed: string[];
    laborHours: number;
    warranty: string;
    notes: string;
    // New fields to match the screenshot
    resultId?: string;
    bookingId?: string;
    buckingDate?: string;
    scheduleDate?: string;
    repairCategory?: string;
    serviceDescription?: string;
    serviceType?: string;
    serviceAddress?: string;
    repairs1Id?: string;
    repairs2Name?: string;
    customerId?: string;
    customerName?: string;
    productType?: string;
    brand?: string;
    model?: string;
    requestType?: string;
    thirdPartyName?: string;
    thirdPartyNumber?: string;
    initialIssue?: string;
    initialCost?: number;
}

const fetchRepair = async (id: string): Promise<Repair> => {
    const { data } = await apiClient.get(`/e-repairRepairs/${id}`);
    return data;
};

export default function ERepairDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = React.use(params);

    const { data: repair } = useQuery<Repair>({
        queryKey: ["repair", id],
        queryFn: () => fetchRepair(id),
    });

    if (!repair) return <div className="p-6">Loading...</div>;

    const getStatusColor = (status: string, type: "status" | "payment" | "confirmation") => {
        if (type === "status") {
            if (status === "In Progress") return "bg-[#E5D9F2] text-[#6A1B9A]";
            if (status === "Completed") return "bg-[#D4F4E2] text-[#1B5E20]";
            if (status === "Cancelled") return "bg-[#FFEBEE] text-[#B71C1C]";
        } else if (type === "payment") {
            if (status === "Paid") return "bg-[#D4F4E2] text-[#1B5E20]";
            if (status === "Unpaid") return "bg-[#FFEBEE] text-[#B71C1C]";
            if (status === "Partial") return "bg-[#FFF3E0] text-[#EF6C00]";
            if (status === "Refunded") return "bg-[#E0E0E0] text-[#424242]";
        } else if (type === "confirmation") {
            if (status === "Confirmed") return "bg-[#D4F4E2] text-[#1B5E20]";
            if (status === "Pending") return "bg-[#E5D9F2] text-[#6A1B9A]";
            if (status === "N/A") return "bg-[#E0E0E0] text-[#424242]";
        }
        return "";
    };

    return (
        <div className="min-h-screen bg-[#F5F5F5] p-6">
            <Button
                variant="ghost"
                className="mb-4 p-0 text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8] hover:bg-transparent"
                onClick={() => router.back()}
            >
                <ArrowLeft className="mr-2 h-4 w-4" /> BACK
            </Button>

            <h1 className="mb-6 text-2xl font-bold text-gray-900">REPAIR DETAILS</h1>

            {/* First Row: REPAIR DETAILS and REPAIR STATUS side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* REPAIR DETAILS Section */}
                <div className="rounded-lg bg-white">
                    <div className=" bg-[#F9FAFB] px-4 py-3">
                        <h2 className="text-sm font-semibold text-gray-900">REPAIR DETAILS</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4 p-4">
                        <div className="flex justify-between">
                            <span className="text-xs font-medium text-gray-500">Result Id:</span>
                            <span className="text-sm font-medium text-gray-900">{repair.resultId || "RFP0001"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs font-medium text-gray-500">Booking Id:</span>
                            <span className="text-sm font-medium text-gray-900">{repair.bookingId || "28 May 2013"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs font-medium text-gray-500">Bucking Date:</span>
                            <span className="text-sm font-medium text-gray-900">{repair.buckingDate || "28 May 2013"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs font-medium text-gray-500">Schedule Date:</span>
                            <span className="text-sm font-medium text-gray-900">{repair.scheduleDate || "28 May 2013"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs font-medium text-gray-500">Start Date:</span>
                            <span className="text-sm font-medium text-gray-900">{repair.startDate || "28 May 2013"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs font-medium text-gray-500">Completion Date:</span>
                            <span className="text-sm font-medium text-gray-900">{repair.completionDate || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs font-medium text-gray-500">Repair Category:</span>
                            <span className="text-sm font-medium text-gray-900">{repair.repairCategory || "Automobile"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs font-medium text-gray-500">Service Description:</span>
                            <span className="text-sm font-medium text-gray-900">{repair.serviceDescription || "Engine Repair"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs font-medium text-gray-500">Service Type:</span>
                            <span className="text-sm font-medium text-gray-900">{repair.serviceType || "WorkShop"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs font-medium text-gray-500">Service Address:</span>
                            <span className="text-sm font-medium text-gray-900 text-right max-w-[200px]">
                                {repair.serviceAddress || "S123 Lektil login Street Auto: site center Laptu, Nigeria"}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs font-medium text-gray-500">Repairs*1 Id:</span>
                            <span className="text-sm font-medium text-gray-900">{repair.repairs1Id || "Repairs*1 Id:"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs font-medium text-gray-500">Repairs*2 Name:</span>
                            <span className="text-sm font-medium text-gray-900">{repair.repairs2Name || "Creative Books"}</span>
                        </div>
                    </div>
                </div>

                {/* REPAIR STATUS IN PROGRESS Section */}
                <div className="rounded-lg bg-white">
                    <div className="bg-[#F9FAFB] px-4 py-3">
                        <h2 className="text-sm font-semibold text-gray-900">REPAIR STATUS IN PROGRESS</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4 p-4">
                        <div className="flex justify-between">
                            <span className="text-xs font-medium text-gray-500">Customer Id:</span>
                            <span className="text-sm font-medium text-gray-900">{repair.customerId || "PIC0097-09-073"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs font-medium text-gray-500">Customer Name:</span>
                            <span className="text-sm font-medium text-gray-900">{repair.customerName || "Christine Brooks"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs font-medium text-gray-500">Product Type:</span>
                            <span className="text-sm font-medium text-gray-900">{repair.productType || "Car"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs font-medium text-gray-500">Brand:</span>
                            <span className="text-sm font-medium text-gray-900">{repair.brand || "Boraz"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs font-medium text-gray-500">Model:</span>
                            <span className="text-sm font-medium text-gray-900">{repair.model || "CS5004L"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs font-medium text-gray-500">Request Type:</span>
                            <span className="text-sm font-medium text-gray-900">{repair.requestType || "Third Party"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs font-medium text-gray-500">Third Party Name:</span>
                            <span className="text-sm font-medium text-gray-900">{repair.thirdPartyName || "Christine Brooks"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs font-medium text-gray-500">Third Party's Number:</span>
                            <span className="text-sm font-medium text-gray-900">{repair.thirdPartyNumber || "+254-83 3296800"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs font-medium text-gray-500">Repair Confirmation:</span>
                            <span className="text-sm font-medium text-gray-900">{repair.repairConfirmation || "N/A"}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Service Description Section */}
            <div className="rounded-lg  bg-white mb-6 w-[50%]">
                <div className=" bg-[#F9FAFB] px-4 py-3">
                    <h2 className="text-sm font-semibold text-gray-900">Service Description</h2>
                </div>
                <div className="p-4">
                    <div className="flex justify-between">
                        <span className="text-xs font-medium text-gray-500">Initial Issue:</span>
                        <span className="text-sm font-medium text-gray-900 max-w-[400px] text-right">
                            {repair.initialIssue || "Audiosuit Engine Noise and Overloading"}
                        </span>
                    </div>
                </div>
            </div>

            {/* PAYMENT INFORMATION Section */}
            <div className="rounded-lg  bg-white w-[50%]">
                <div className=" bg-[#F9FAFB] px-4 py-3">
                    <h2 className="text-sm font-semibold text-gray-900">PAYMENT INFORMATION</h2>
                </div>
                <div className="grid grid-cols-1 gap-4 p-4">
                    <div className="flex justify-between">
                        <span className="text-xs font-medium text-gray-500">Initial Cost:</span>
                        <span className="text-sm font-medium text-gray-900">
                            &#8358;{(repair.initialCost || 25850).toLocaleString("en-US")}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-xs font-medium text-gray-500">Payment Status:</span>
                        <span
                            className={`inline-flex w-fit rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                                repair.paymentStatus,
                                "payment"
                            )}`}
                        >
                            {repair.paymentStatus || "Paid"}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-xs font-medium text-gray-500">Total Cost:</span>
                        <span className="text-sm font-medium text-gray-900">
                            &#8358;{(repair.totalCost || 25850).toLocaleString("en-US")}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-500">Total Amount Paid:</span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                                &#8358;{(repair.totalCost || 25850).toLocaleString("en-US")}
                            </span>
                            <span
                                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                                    repair.paymentStatus,
                                    "payment"
                                )}`}
                            >
                                {repair.paymentStatus || "Paid"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}