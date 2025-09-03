// app/(dashboard)/e-repair/e-product/[id]/page.tsx
// app/(dashboard)/e-repair/e-product/[id]/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface Discovery {
    id: string;
    repairId: string;
    discovery: string;
    description: string;
    discoveryDate: string;
    invoiceAmount: number;
    paymentStatus: string;
    technician: string;
    images: string[];
    priority: string;
    customerApproval: string;
    // New fields from screenshot
    reportId: string;
    bookingDate: string;
    scheduleDate: string;
    startDate: string;
    completionDate: string;
    reportCategory: string;
    serviceDescription: string;
    serviceType: string;
    serviceAddress: string;
    reporterName: string;
    customerId: string;
    customerName: string;
    productType: string;
    brand: string;
    model: string;
    requestType: string;
    thirdPartyName: string;
    thirdPartyNumber: string;
    initialIssue: string;
    initialCost: number;
    discoveryId: string;
    repairIssue: string;
    damageStatus: string;
    recommendation: string;
    replacementPart: string;
    discoveryResponse: string;
    totalCost: number;
    totalAmountPaid: number;
}

const fetchDiscovery = async (id: string): Promise<Discovery> => {
    const { data } = await apiClient.get(`/e-repairDiscovery/${id}`);
    return data;
};

export default function EProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = React.use(params);

    const { data: discovery } = useQuery<Discovery>({
        queryKey: ["discovery", id],
        queryFn: () => fetchDiscovery(id),
    });

    if (!discovery) return <div className="p-6">Loading...</div>;

    const getStatusColor = (status: string, type: "payment" | "confirmation" | "damage") => {
        if (type === "payment") {
            if (status === "Paid") return "bg-[#D4F4E2] text-[#1B5E20]";
            if (status === "Unpaid") return "bg-[#FFEBEE] text-[#B71C1C]";
            if (status === "Pending") return "bg-[#E5D9F2] text-[#6A1B9A]";
        } else if (type === "confirmation") {
            if (status === "Approved") return "bg-[#D4F4E2] text-[#1B5E20]";
            if (status === "Pending") return "bg-[#E5D9F2] text-[#6A1B9A]";
        } else if (type === "damage") {
            if (status === "Not") return "bg-[#D4F4E2] text-[#1B5E20]";
        }
        return "";
    };

    return (
        <div className="min-h-screen bg-white p-6">
            <Button
                variant="ghost"
                className="mb-4 p-0 text-sm text-blue-600 hover:text-blue-800"
                onClick={() => router.back()}
            >
                <ArrowLeft className="mr-2 h-4 w-4" /> BACK
            </Button>

            <h1 className="mb-2 text-lg font-semibold text-gray-800">DiSCOVERY DETAILS</h1>

            {/* REPAIR DETAILS */}
            <div className="mb-6 rounded-lg border border-gray-200 bg-white">
                <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
                    <h2 className="text-sm font-medium text-gray-700">REPAIR DETAILS</h2>
                </div>
                <div className="grid grid-cols-4 gap-4 p-4">
                    <div>
                        <label className="text-xs font-medium text-gray-500">Report Id</label>
                        <p className="text-sm text-gray-900">{discovery.reportId}</p>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500">Booking Date</label>
                        <p className="text-sm text-gray-900">{discovery.bookingDate}</p>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500">Schedule Date</label>
                        <p className="text-sm text-gray-900">{discovery.scheduleDate}</p>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500">Start Date</label>
                        <p className="text-sm text-gray-900">{discovery.startDate}</p>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500">Completion Date</label>
                        <p className="text-sm text-gray-900">{discovery.completionDate || "N/A"}</p>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500">Report Category</label>
                        <p className="text-sm text-gray-900">{discovery.reportCategory}</p>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500">Service Description</label>
                        <p className="text-sm text-gray-900">{discovery.serviceDescription}</p>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500">Service Type</label>
                        <p className="text-sm text-gray-900">{discovery.serviceType}</p>
                    </div>
                    <div className="col-span-2">
                        <label className="text-xs font-medium text-gray-500">Service Address</label>
                        <p className="text-sm text-gray-900">{discovery.serviceAddress}</p>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500">Reporter's Name</label>
                        <p className="text-sm text-gray-900">{discovery.reporterName}</p>
                    </div>
                </div>
            </div>

            {/* REPAIR STATUS */}
            <div className="mb-6 rounded-lg border border-gray-200 bg-white">
                <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
                    <h2 className="text-sm font-medium text-gray-700">SERVICE STATUS IN PROGRESS</h2>
                </div>
                <div className="grid grid-cols-4 gap-4 p-4">
                    <div>
                        <label className="text-xs font-medium text-gray-500">Customer Id</label>
                        <p className="text-sm text-gray-900">{discovery.customerId}</p>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500">Customer Name</label>
                        <p className="text-sm text-gray-900">{discovery.customerName}</p>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500">Product Type</label>
                        <p className="text-sm text-gray-900">{discovery.productType}</p>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500">Brand</label>
                        <p className="text-sm text-gray-900">{discovery.brand}</p>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500">Model</label>
                        <p className="text-sm text-gray-900">{discovery.model}</p>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500">Request Type</label>
                        <p className="text-sm text-gray-900">{discovery.requestType}</p>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500">Third Party's Name</label>
                        <p className="text-sm text-gray-900">{discovery.thirdPartyName}</p>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500">Third Party's Number</label>
                        <p className="text-sm text-gray-900">{discovery.thirdPartyNumber}</p>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500">Report Confirmative</label>
                        <p className="text-sm text-gray-900">N/A</p>
                    </div>
                </div>
            </div>

            {/* Service Description */}
            <div className="mb-6 rounded-lg border border-gray-200 bg-white">
                <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
                    <h2 className="text-sm font-medium text-gray-700">Service Description</h2>
                </div>
                <div className="p-4">
                    <div>
                        <label className="text-xs font-medium text-gray-500">Initial Issue</label>
                        <p className="text-sm text-gray-900">{discovery.initialIssue}</p>
                    </div>
                </div>
            </div>

            {/* DISCOVERY DETAILS */}
            <div className="mb-6 rounded-lg border border-gray-200 bg-white">
                <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
                    <h2 className="text-sm font-medium text-gray-700">DISCOVERY DETAILS</h2>
                </div>
                <div className="grid grid-cols-4 gap-4 p-4">
                    <div>
                        <label className="text-xs font-medium text-gray-500">Discovery Id</label>
                        <p className="text-sm text-gray-900">{discovery.discoveryId}</p>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500">Discovery Date</label>
                        <p className="text-sm text-gray-900">{discovery.discoveryDate}</p>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500">Repair Issue</label>
                        <p className="text-sm text-gray-900">{discovery.repairIssue}</p>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500">Damage Status</label>
                        <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(discovery.damageStatus, "damage")}`}
                        >
                            {discovery.damageStatus}
                        </span>
                    </div>
                    <div className="col-span-2">
                        <label className="text-xs font-medium text-gray-500">Recommendation</label>
                        <p className="text-sm text-gray-900">{discovery.recommendation}</p>
                    </div>
                    <div className="col-span-2">
                        <label className="text-xs font-medium text-gray-500">Replacement Part</label>
                        <p className="text-sm text-gray-900">{discovery.replacementPart}</p>
                    </div>
                    <div className="col-span-2">
                        <label className="text-xs font-medium text-gray-500">Discovery Response</label>
                        <p className="text-sm text-gray-900">{discovery.discoveryResponse}</p>
                    </div>
                </div>
            </div>

            {/* PAYMENT INFORMATION */}
            <div className="rounded-lg border border-gray-200 bg-white">
                <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
                    <h2 className="text-sm font-medium text-gray-700">PAYMENT INFORMATION</h2>
                </div>
                <div className="grid grid-cols-4 gap-4 p-4">
                    <div>
                        <label className="text-xs font-medium text-gray-500">Initial Cost</label>
                        <p className="text-sm text-gray-900">&#8358;{discovery.initialCost?.toLocaleString("en-US") || "0.00"}</p>
                        <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor("Paid", "payment")}`}
                        >
                            Paid
                        </span>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500">Discovery Cost</label>
                        <p className="text-sm text-gray-900">&#8358;{discovery.invoiceAmount?.toLocaleString("en-US") || "0.00"}</p>
                        <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(discovery.paymentStatus, "payment")}`}
                        >
                            {discovery.paymentStatus}
                        </span>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500">Total Cost</label>
                        <p className="text-sm text-gray-900">&#8358;{discovery.totalCost?.toLocaleString("en-US") || "0.00"}</p>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500">Total Amount Paid</label>
                        <p className="text-sm text-gray-900">&#8358;{discovery.totalAmountPaid?.toLocaleString("en-US") || "0.00"}</p>
                        <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor("Paid", "payment")}`}
                        >
                            Paid
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}