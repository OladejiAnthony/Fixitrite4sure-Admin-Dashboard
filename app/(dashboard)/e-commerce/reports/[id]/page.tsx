//app\(dashboard)\e-commerce\report\[id]\page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface Report {
    id: string;
    reportName: string;
    type: string;
    period: string;
    generatedDate: string;
    totalRevenue: number;
    status: string;
    downloads: number;
}

const fetchReport = async (id: string): Promise<Report> => {
    const { data } = await apiClient.get(`/reports/${id}`);
    return data;
};

export default function ReportDetailsPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { id } = params;

    const { data: report } = useQuery<Report>({
        queryKey: ["report", id],
        queryFn: () => fetchReport(id),
    });

    if (!report) return <div className="p-6">Loading...</div>;

    return (
        <div className="min-h-screen bg-white p-6">
            <Button
                variant="ghost"
                className="mb-4 p-0 text-sm text-blue-600 hover:text-blue-800"
                onClick={() => router.back()}
            >
                <ArrowLeft className="mr-2 h-4 w-4" /> BACK
            </Button>
            <h1 className="mb-6 text-lg font-semibold text-gray-800">REPORT DETAILS</h1>
            <div className="grid grid-cols-3 gap-4 rounded-lg bg-white p-6 shadow-sm">
                <div>
                    <label className="text-xs font-medium text-gray-500">Report Id:</label>
                    <p className="text-sm text-gray-900">{report.id}</p>
                </div>
                <div>
                    <label className="text-xs font-medium text-gray-500">Report Name:</label>
                    <p className="text-sm text-gray-900">{report.reportName}</p>
                </div>
                <div>
                    <label className="text-xs font-medium text-gray-500">Type:</label>
                    <p className="text-sm text-gray-900">{report.type}</p>
                </div>
                <div>
                    <label className="text-xs font-medium text-gray-500">Period:</label>
                    <p className="text-sm text-gray-900">{report.period}</p>
                </div>
                <div>
                    <label className="text-xs font-medium text-gray-500">Generated Date:</label>
                    <p className="text-sm text-gray-900">{report.generatedDate}</p>
                </div>
                <div>
                    <label className="text-xs font-medium text-gray-500">Total Revenue:</label>
                    <p className="text-xl font-bold text-orange-600">&#8358;{report.totalRevenue.toLocaleString("en-US")}</p>
                </div>
                <div>
                    <label className="text-xs font-medium text-gray-500">Status:</label>
                    <p className="rounded bg-green-100 px-2 py-1 text-sm text-green-800 inline-block">{report.status}</p>
                </div>
                <div>
                    <label className="text-xs font-medium text-gray-500">Downloads:</label>
                    <p className="rounded bg-blue-100 px-2 py-1 text-sm text-blue-800 inline-block">{report.downloads}</p>
                </div>
            </div>
        </div>
    );
}