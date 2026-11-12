//app/(dashboard)/e-repair/e-repairs/[id]/page.tsx
"use client";

import { useERepairItem } from "@/hooks/use-admin-e-repair";
import type { ERepairBooking } from "@/lib/e-repair";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

function Row({ label, children }: { label: string; children?: React.ReactNode }) {
    return (
        <div className="flex justify-between gap-4">
            <span className="text-xs font-medium text-gray-500">{label}:</span>
            <span className="max-w-[260px] text-right text-sm font-medium text-gray-900 break-words">
                {children || "-"}
            </span>
        </div>
    );
}

const getStatusColor = (status: string, type: "status" | "payment" | "confirmation") => {
    if (type === "status") {
        if (status === "Confirmed") return "bg-[#CEE0FC] text-[#0D47A1]";
        if (status === "In Progress") return "bg-[#E5D9F2] text-[#6A1B9A]";
        if (status === "Completed") return "bg-[#D4F4E2] text-[#1B5E20]";
        if (status === "Cancelled") return "bg-[#FFEBEE] text-[#B71C1C]";
    } else if (type === "payment") {
        if (status === "Paid") return "bg-[#D4F4E2] text-[#1B5E20]";
        if (status === "Unpaid" || status === "Failed") return "bg-[#FFEBEE] text-[#B71C1C]";
        if (status === "Refunded" || status === "Not invoiced") return "bg-[#E0E0E0] text-[#424242]";
    } else if (type === "confirmation") {
        if (status === "Confirmed") return "bg-[#D4F4E2] text-[#1B5E20]";
        if (status === "Pending") return "bg-[#E5D9F2] text-[#6A1B9A]";
        if (status === "N/A") return "bg-[#E0E0E0] text-[#424242]";
    }
    return "";
};

const naira = (n: number) => `₦${n.toLocaleString("en-US")}`;

export default function ERepairDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = React.use(params);

    const { data: repair, isLoading, error } = useERepairItem<ERepairBooking>("repairs", id);

    if (isLoading) return <div className="p-6">Loading...</div>;
    if (error || !repair) {
        return (
            <div className="p-6 text-sm text-red-600">
                Could not load repair: {(error as Error | null)?.message ?? "Not found"}
            </div>
        );
    }

    const Badge = ({ status, type }: { status: string; type: "status" | "payment" | "confirmation" }) => (
        <span className={`inline-flex w-fit rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(status, type)}`}>
            {status}
        </span>
    );

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

            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-lg bg-white">
                    <div className="bg-[#F9FAFB] px-4 py-3">
                        <h2 className="text-sm font-semibold text-gray-900">REPAIR DETAILS</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4 p-4">
                        <Row label="Repair Id">{repair.repairId}</Row>
                        <Row label="Booking Id">{repair.id}</Row>
                        <Row label="Booking Date">{repair.bookingDate}</Row>
                        <Row label="Schedule Date">{repair.scheduledTime}</Row>
                        <Row label="Completion Date">{repair.completionDate}</Row>
                        <Row label="Repair Category">{repair.category}</Row>
                        <Row label="Service">{repair.serviceName}</Row>
                        <Row label="Service Type">{repair.serviceType}</Row>
                        <Row label="Service Location">{repair.serviceLocation}</Row>
                        <Row label="Repairer's Id">{repair.technicianId}</Row>
                        <Row label="Repairer's Name">{repair.technician}</Row>
                        <Row label="Assigned Staff">{repair.assignedStaff}</Row>
                    </div>
                </div>

                <div className="rounded-lg bg-white">
                    <div className="bg-[#F9FAFB] px-4 py-3">
                        <h2 className="text-sm font-semibold text-gray-900">
                            REPAIR STATUS <Badge status={repair.bookingStatus} type="status" />
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4 p-4">
                        <Row label="Customer Id">{repair.customerId}</Row>
                        <Row label="Customer Name">{repair.customerName}</Row>
                        <Row label="Customer Phone">{repair.customerPhone}</Row>
                        <Row label="Product Type">{repair.deviceType}</Row>
                        <Row label="Brand">{repair.brand}</Row>
                        <Row label="Model">{repair.model}</Row>
                        <Row label="Serial Number">{repair.serialNumber}</Row>
                        <Row label="Repair Type">{repair.repairType}</Row>
                        <Row label="Repair Confirmation">
                            <Badge status={repair.repairConfirmation} type="confirmation" />
                        </Row>
                    </div>
                </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-lg bg-white">
                    <div className="bg-[#F9FAFB] px-4 py-3">
                        <h2 className="text-sm font-semibold text-gray-900">Service Description</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4 p-4">
                        <Row label="Initial Issue">{repair.issueDescription}</Row>
                        <Row label="Specific Instructions">{repair.specificInstructions}</Row>
                    </div>
                </div>

                <div className="rounded-lg bg-white">
                    <div className="bg-[#F9FAFB] px-4 py-3">
                        <h2 className="text-sm font-semibold text-gray-900">PAYMENT INFORMATION</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4 p-4">
                        <Row label="Quote">{repair.initialCost ? naira(repair.initialCost) : undefined}</Row>
                        <Row label="Invoice Number">{repair.invoiceNumber}</Row>
                        <Row label="Total Cost">{repair.invoiceId ? naira(repair.totalCost) : undefined}</Row>
                        <Row label="Total Amount Paid">{repair.invoiceId ? naira(repair.amountPaid) : undefined}</Row>
                        <Row label="Payment Status">
                            <Badge status={repair.paymentStatus} type="payment" />
                        </Row>
                    </div>
                </div>
            </div>
        </div>
    );
}
