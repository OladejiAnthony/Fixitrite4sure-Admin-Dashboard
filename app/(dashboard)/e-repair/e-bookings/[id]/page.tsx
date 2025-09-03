// app/(dashboard)/e-repair/e-bookings/[id]/page.tsx
"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { AssignRepairerDialog } from "./assign-repairer-dialog";
import { useQueryClient } from "@tanstack/react-query";

interface Booking {
    id: string;
    repairId: string;
    customerName: string;
    category: string;
    bookingDate: string;
    serviceType: string;
    technician: string;
    bookingStatus: string;
    initialCost: number;
    paymentStatus: string;
    customerPhone: string;
    customerAddress: string;
    deviceType: string;
    issueDescription: string;
    scheduledTime: string;
    priority: string;
    customerId?: string;
    brand?: string;
    model?: string;
    requestType?: string;
    thirdPartyName?: string;
    thirdPartyNumber?: string;
    reasonForCancellation?: string;
}

const fetchBooking = async (id: string): Promise<Booking> => {
    const { data } = await apiClient.get(`/e-repairBookings/${id}`);
    return data;
};

const updateBookingTechnician = async (bookingId: string, technicianId: string, technicianName: string) => {
    const { data } = await apiClient.patch(`/e-repairBookings/${bookingId}`, {
        technician: technicianName,
        technicianId: technicianId,
        bookingStatus: "In Progress"
    });
    return data;
};

export default function EBookingsDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { id } = React.use(params);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);

    const { data: booking, refetch } = useQuery<Booking>({
        queryKey: ["booking", id],
        queryFn: () => fetchBooking(id),
    });

    const assignMutation = useMutation({
        mutationFn: ({ technicianId, technicianName }: { technicianId: string; technicianName: string }) =>
            updateBookingTechnician(id, technicianId, technicianName),
        onSuccess: () => {
            refetch(); // Refetch current booking
            // Invalidate the bookings list query to force refetch
            queryClient.invalidateQueries({ queryKey: ["all-bookings"] });
        },
    });

    const handleAssignRepairer = (repairerId: string, repairerName: string) => {
        assignMutation.mutate({ technicianId: repairerId, technicianName: repairerName });
    };

    if (!booking) return <div className="p-6">Loading...</div>;

    const getStatusColor = (status: string, type: "status" | "payment") => {
        if (type === "status") {
            if (status === "In Progress") return "bg-[#E5D9F2] text-[#6A1B9A]";
            if (status === "Completed") return "bg-[#D4F4E2] text-[#1B5E20]";
            if (status === "Cancelled") return "bg-[#FFEBEE] text-[#B71C1C]";
        } else if (type === "payment") {
            if (status === "Paid") return "bg-[#D4F4E2] text-[#1B5E20]";
            if (status === "Unpaid") return "bg-[#FFEBEE] text-[#B71C1C]";
            if (status === "Partial") return "bg-[#FFF3E0] text-[#EF6C00]";
            if (status === "Refunded") return "bg-[#E0E0E0] text-[#424242]";
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
            <h1 className="mb-6 text-lg font-semibold text-gray-800">BOOKINGS</h1>
            <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-100 p-6 shadow-sm">
                <div>
                    <h2 className="mb-4 text-md font-semibold text-gray-800">BOOKING DETAILS</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-gray-500">Repair Id:</label>
                            <p className="text-sm text-gray-900">{booking.repairId}</p>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500">Booking Date:</label>
                            <p className="text-sm text-gray-900">{booking.bookingDate}</p>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500">Schedule Date:</label>
                            <p className="text-sm text-gray-900">{booking.scheduledTime}</p>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500">Repair Category:</label>
                            <p className="text-sm text-gray-900">{booking.category}</p>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500">Service Description:</label>
                            <p className="text-sm text-gray-900">{booking.issueDescription}</p>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500">Service Type:</label>
                            <p className="text-sm text-gray-900">{booking.serviceType}</p>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500">Booking Status:</label>
                            <span
                                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(booking.bookingStatus, "status")}`}
                            >
                                {booking.bookingStatus}
                            </span>
                        </div>
                    </div>
                </div>
                <div>
                    <h2 className="mb-4 text-md font-semibold text-gray-800">BOOKING STATUS {booking.bookingStatus}</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-gray-500">Customer Id:</label>
                            <p className="text-sm text-gray-900">{booking.customerId}</p>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500">Customer Name:</label>
                            <p className="text-sm text-gray-900">{booking.customerName}</p>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500">Product Type:</label>
                            <p className="text-sm text-gray-900">{booking.deviceType}</p>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500">Brand:</label>
                            <p className="text-sm text-gray-900">{booking.brand}</p>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500">Model:</label>
                            <p className="text-sm text-gray-900">{booking.model}</p>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500">Request Type:</label>
                            <p className="text-sm text-gray-900">{booking.requestType}</p>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500">Third Party's Name:</label>
                            <p className="text-sm text-gray-900">{booking.thirdPartyName}</p>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500">Third Party's Number:</label>
                            <p className="text-sm text-gray-900">{booking.thirdPartyNumber}</p>
                        </div>
                    </div>
                </div>
                {booking.bookingStatus === "In Progress" && (
                    <div className="col-span-2 mt-4">
                        <Button
                            variant="default"
                            className="bg-blue-600 text-white hover:bg-blue-700"
                            onClick={() => setAssignDialogOpen(true)}
                            disabled={assignMutation.isPending}
                        >
                            {assignMutation.isPending ? "Assigning..." : "Assign Repairer"}
                        </Button>
                    </div>
                )}
                {(booking.bookingStatus === "Completed" || booking.bookingStatus === "Cancelled") && (
                    <div>
                        <h2 className="mb-4 text-md font-semibold text-gray-800">Technician Information</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500">Repairer's Id:</label>
                                <p className="text-sm text-gray-900">{booking.technician}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500">Repairer's Name:</label>
                                <p className="text-sm text-gray-900">{booking.technician}</p>
                            </div>
                        </div>
                    </div>
                )}
                {(booking.bookingStatus === "Completed" || booking.bookingStatus === "Cancelled") && (
                    <div>
                        <h2 className="mb-4 text-md font-semibold text-gray-800">Service Description</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500">Initial Issue:</label>
                                <p className="text-sm text-gray-900">{booking.issueDescription}</p>
                            </div>
                        </div>
                    </div>
                )}
                {booking.bookingStatus === "Cancelled" && (
                    <div>
                        <h2 className="mb-4 text-md font-semibold text-gray-800">REASON FOR CANCELLATION</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-900">{booking.reasonForCancellation}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <AssignRepairerDialog
                open={assignDialogOpen}
                onOpenChange={setAssignDialogOpen}
                bookingId={id}
                onAssign={handleAssignRepairer}
                currentRepairer={booking.technician}
            />
        </div>
    );
}

