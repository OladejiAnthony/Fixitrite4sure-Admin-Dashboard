// app/(dashboard)/e-repair/e-report/[id]/page.tsx
// Report ids are calendar months (yyyy-MM); see lib/e-repair.ts.
"use client";

import { useERepairItem } from "@/hooks/use-admin-e-repair";
import type { ERepairReport } from "@/lib/e-repair";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="text-xs font-medium text-gray-500">{label}:</label>
            <div className="text-sm text-gray-900">{children}</div>
        </div>
    );
}

const getStatusColor = (status: string) => {
    if (status === "Completed") return "bg-[#D4F4E2] text-[#1B5E20]";
    if (status === "Processing") return "bg-[#FFF3E0] text-[#EF6C00]";
    return "";
};

export default function EReportDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = React.use(params);

    const { data: report, isLoading, error } = useERepairItem<ERepairReport>("reports", id);

    if (isLoading) return <div className="p-6">Loading...</div>;
    if (error || !report) {
        return (
            <div className="p-6 text-sm text-red-600">
                Could not load report: {(error as Error | null)?.message ?? "Not found"}
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
            <h1 className="mb-6 text-lg font-semibold text-gray-800">E REPORT DETAILS</h1>
            <div className="grid grid-cols-1 gap-4 rounded-lg bg-white p-6 shadow-sm sm:grid-cols-3">
                <Field label="Report Id">{report.id}</Field>
                <Field label="Report Name">{report.reportName}</Field>
                <Field label="Type">{report.type}</Field>
                <Field label="Period">{report.period}</Field>
                <Field label="Generated Date">{report.generatedDate}</Field>
                <Field label="Total Revenue (paid invoices)">
                    <p className="text-xl font-bold text-orange-600">
                        &#8358;{report.totalRevenue.toLocaleString("en-US")}
                    </p>
                </Field>
                <Field label="Status">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(report.status)}`}>
                        {report.status}
                    </span>
                </Field>
                <Field label="Total Bookings">{report.totalBookings}</Field>
                <Field label="Repairs Completed">{report.repairsCompleted}</Field>
                <Field label="Repairs In Progress">{report.repairsInProgress}</Field>
                <Field label="Pending Bookings">{report.pendingBookings}</Field>
                <Field label="Cancelled Bookings">{report.cancelledBookings}</Field>
                <Field label="Paid Invoices">{report.paidInvoices}</Field>
            </div>
        </div>
    );
}
