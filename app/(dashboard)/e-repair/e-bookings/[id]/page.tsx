// app/(dashboard)/e-repair/e-bookings/[id]/page.tsx
"use client";

import { useERepairItem } from "@/hooks/use-admin-e-repair";
import type { ERepairBooking } from "@/lib/e-repair";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

// Read-only: bookings are created by customers and moved along by the
// assigned repairer in the mobile app (respond_to_booking /
// update_booking_progress). The old "Assign Repairer" action wrote to the
// json-server mock and has no Supabase equivalent yet.

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
    return (
        <div>
            <label className="text-xs font-medium text-gray-500">{label}:</label>
            <p className="text-sm text-gray-900 break-words">{value || "-"}</p>
        </div>
    );
}

const getStatusColor = (status: string, type: "status" | "payment") => {
    if (type === "status") {
        if (status === "Pending") return "bg-[#FFF3E0] text-[#EF6C00]";
        if (status === "Confirmed") return "bg-[#CEE0FC] text-[#0D47A1]";
        if (status === "In Progress") return "bg-[#E5D9F2] text-[#6A1B9A]";
        if (status === "Completed") return "bg-[#D4F4E2] text-[#1B5E20]";
        if (status === "Cancelled") return "bg-[#FFEBEE] text-[#B71C1C]";
    } else if (type === "payment") {
        if (status === "Paid") return "bg-[#D4F4E2] text-[#1B5E20]";
        if (status === "Unpaid" || status === "Failed") return "bg-[#FFEBEE] text-[#B71C1C]";
        if (status === "Refunded" || status === "Not invoiced") return "bg-[#E0E0E0] text-[#424242]";
    }
    return "";
};

const naira = (n: number) => `₦${n.toLocaleString("en-US")}`;

export default function EBookingsDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = React.use(params);

    const { data: booking, isLoading, error } = useERepairItem<ERepairBooking>("bookings", id);

    if (isLoading) return <div className="p-6">Loading...</div>;
    if (error || !booking) {
        return (
            <div className="p-6 text-sm text-red-600">
                Could not load booking: {(error as Error | null)?.message ?? "Not found"}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white p-6">
            <Button
                variant="ghost"
                className="mb-4 p-0 text-sm text-blue-600 hover:text-blue-800"
                onClick={() => router.back()}
            >
                <ArrowLeft className="mr-2 h-4 w-4" /> BACK
            </Button>
            <h1 className="mb-6 text-lg font-semibold text-gray-800">BOOKINGS</h1>
            <div className="grid grid-cols-1 gap-6 rounded-lg bg-gray-100 p-6 shadow-sm md:grid-cols-2">
                <div>
                    <h2 className="mb-4 text-md font-semibold text-gray-800">BOOKING DETAILS</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Repair Id" value={booking.repairId} />
                        <Field label="Booking Date" value={booking.bookingDate} />
                        <Field label="Schedule Date" value={booking.scheduledTime} />
                        <Field label="Repair Category" value={booking.category} />
                        <Field label="Service" value={booking.serviceName} />
                        <Field label="Service Type" value={booking.serviceType} />
                        <Field label="Service Location" value={booking.serviceLocation} />
                        <div>
                            <label className="text-xs font-medium text-gray-500">Booking Status:</label>
                            <p>
                                <span
                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(booking.bookingStatus, "status")}`}
                                >
                                    {booking.bookingStatus}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
                <div>
                    <h2 className="mb-4 text-md font-semibold text-gray-800">CUSTOMER AND ITEM</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Customer Id" value={booking.customerId} />
                        <Field label="Customer Name" value={booking.customerName} />
                        <Field label="Customer Phone" value={booking.customerPhone} />
                        <Field label="Customer Email" value={booking.customerEmail} />
                        <Field label="Product Type" value={booking.deviceType} />
                        <Field label="Brand" value={booking.brand} />
                        <Field label="Model" value={booking.model} />
                        <Field label="Serial Number" value={booking.serialNumber} />
                        <Field label="Repair Type" value={booking.repairType} />
                    </div>
                </div>
                <div>
                    <h2 className="mb-4 text-md font-semibold text-gray-800">TECHNICIAN INFORMATION</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Repairer's Id" value={booking.technicianId} />
                        <Field label="Repairer's Name" value={booking.technician} />
                        <Field label="Repairer's Phone" value={booking.technicianPhone} />
                        <Field label="Assigned Staff" value={booking.assignedStaff} />
                    </div>
                </div>
                <div>
                    <h2 className="mb-4 text-md font-semibold text-gray-800">PAYMENT</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Quote" value={booking.initialCost ? naira(booking.initialCost) : undefined} />
                        <Field label="Invoice Number" value={booking.invoiceNumber} />
                        <Field label="Invoice Total" value={booking.invoiceId ? naira(booking.totalCost) : undefined} />
                        <Field label="Amount Paid" value={booking.invoiceId ? naira(booking.amountPaid) : undefined} />
                        <div>
                            <label className="text-xs font-medium text-gray-500">Payment Status:</label>
                            <p>
                                <span
                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(booking.paymentStatus, "payment")}`}
                                >
                                    {booking.paymentStatus}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
                <div className="md:col-span-2">
                    <h2 className="mb-4 text-md font-semibold text-gray-800">SERVICE DESCRIPTION</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field label="Initial Issue" value={booking.issueDescription} />
                        <Field label="Specific Instructions" value={booking.specificInstructions} />
                    </div>
                </div>
                {booking.media.length > 0 && (
                    <div className="md:col-span-2">
                        <h2 className="mb-4 text-md font-semibold text-gray-800">ATTACHMENTS</h2>
                        <div className="flex flex-wrap gap-3">
                            {booking.media.map((m) =>
                                m.type === "video" ? (
                                    <video key={m.url} src={m.url} controls className="h-32 rounded-md bg-black" />
                                ) : (
                                    <a key={m.url} href={m.url} target="_blank" rel="noreferrer">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={m.url} alt="Repair attachment" className="h-32 w-32 rounded-md object-cover" />
                                    </a>
                                )
                            )}
                        </div>
                    </div>
                )}
                {booking.bookingStatus === "Cancelled" && (
                    <div className="md:col-span-2">
                        <h2 className="mb-4 text-md font-semibold text-gray-800">REASON FOR CANCELLATION</h2>
                        <p className="text-sm text-gray-900">
                            {booking.reasonForCancellation || "No reason given (cancelled by the customer, or declined without a reason)."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
