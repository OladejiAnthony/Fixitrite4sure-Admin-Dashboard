// app/(dashboard)/e-repair/e-product/[id]/page.tsx
// Discovery details: the invoice a repairer raised on a booking (keyed by
// invoice id), with the items they found were needed.
"use client";

import { useERepairItem } from "@/hooks/use-admin-e-repair";
import type { ERepairDiscovery } from "@/lib/e-repair";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

function Field({ label, value, wide }: { label: string; value?: React.ReactNode; wide?: boolean }) {
    return (
        <div className={wide ? "col-span-2" : undefined}>
            <label className="text-xs font-medium text-gray-500">{label}</label>
            <div className="text-sm text-gray-900 break-words">{value || "-"}</div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
                <h2 className="text-sm font-medium text-gray-700">{title}</h2>
            </div>
            {children}
        </div>
    );
}

const paymentColor = (status: string) => {
    if (status === "Paid") return "bg-[#D4F4E2] text-[#1B5E20]";
    if (status === "Unpaid" || status === "Failed") return "bg-[#FFEBEE] text-[#B71C1C]";
    if (status === "Refunded") return "bg-[#E0E0E0] text-[#424242]";
    return "";
};

const naira = (n: number) => `₦${n.toLocaleString("en-US")}`;

export default function EProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = React.use(params);

    const { data: discovery, isLoading, error } = useERepairItem<ERepairDiscovery>("discovery", id);

    if (isLoading) return <div className="p-6">Loading...</div>;
    if (error || !discovery) {
        return (
            <div className="p-6 text-sm text-red-600">
                Could not load discovery: {(error as Error | null)?.message ?? "Not found"}
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

            <h1 className="mb-2 text-lg font-semibold text-gray-800">DISCOVERY DETAILS</h1>

            <Section title="REPAIR DETAILS">
                <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-4">
                    <Field label="Repair Id" value={discovery.repairId} />
                    <Field label="Booking Date" value={discovery.bookingDate} />
                    <Field label="Schedule Date" value={discovery.scheduledTime} />
                    <Field label="Completion Date" value={discovery.completionDate} />
                    <Field label="Repair Category" value={discovery.category} />
                    <Field label="Service Type" value={discovery.serviceType} />
                    <Field label="Repair Status" value={discovery.bookingStatus} />
                    <Field label="Repairer's Name" value={discovery.technician} />
                </div>
            </Section>

            <Section title="CUSTOMER AND ITEM">
                <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-4">
                    <Field label="Customer Id" value={discovery.customerId} />
                    <Field label="Customer Name" value={discovery.customerName} />
                    <Field label="Product Type" value={discovery.deviceType} />
                    <Field label="Brand" value={discovery.brand} />
                    <Field label="Model" value={discovery.model} />
                    <Field label="Serial Number" value={discovery.serialNumber} />
                    <Field label="Initial Issue" value={discovery.issueDescription} wide />
                </div>
            </Section>

            <Section title="DISCOVERY DETAILS">
                <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-4">
                    <Field label="Discovery Id" value={discovery.discoveryId} />
                    <Field label="Discovery Date" value={discovery.discoveryDate} />
                    <Field label="Last Updated" value={discovery.lastUpdated} />
                    <Field label="Due Date" value={discovery.dueDate} />
                </div>
                {discovery.items.length > 0 ? (
                    <div className="overflow-x-auto px-4 pb-4">
                        <table className="w-full text-left text-sm">
                            <thead className="text-xs uppercase text-gray-500">
                                <tr>
                                    <th className="py-2 pr-4">Item</th>
                                    <th className="py-2 pr-4">Replacement Part</th>
                                    <th className="py-2 pr-4">Condition</th>
                                    <th className="py-2 pr-4">Qty</th>
                                    <th className="py-2 pr-4">Unit Price</th>
                                    <th className="py-2">Line Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {discovery.items.map((item, i) => (
                                    <tr key={i} className="border-t border-gray-200">
                                        <td className="py-2 pr-4">{item.name}</td>
                                        <td className="py-2 pr-4">{item.repairPart || "-"}</td>
                                        <td className="py-2 pr-4">{item.condition}</td>
                                        <td className="py-2 pr-4">{item.quantity}</td>
                                        <td className="py-2 pr-4">{naira(item.unitPrice)}</td>
                                        <td className="py-2">{naira(item.unitPrice * item.quantity)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="px-4 pb-4 text-sm text-gray-500">
                        The repairer accepted with a quote and has not itemised this invoice.
                    </p>
                )}
            </Section>

            <Section title="PAYMENT INFORMATION">
                <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-4">
                    <Field label="Initial Quote" value={discovery.initialCost ? naira(discovery.initialCost) : undefined} />
                    <Field label="Invoice Total" value={naira(discovery.invoiceAmount)} />
                    <Field label="Total Amount Paid" value={naira(discovery.amountPaid)} />
                    <Field
                        label="Payment Status"
                        value={
                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${paymentColor(discovery.paymentStatus)}`}>
                                {discovery.paymentStatus}
                            </span>
                        }
                    />
                </div>
            </Section>
        </div>
    );
}
