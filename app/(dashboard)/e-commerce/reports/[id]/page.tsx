//app\(dashboard)\e-commerce\reports\[id]\page.tsx
"use client";

import { useEcommerceItem } from "@/hooks/use-admin-ecommerce";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

// Monthly sales report derived from public.orders (id = yyyy-MM).
interface Report {
  id: string;
  reportName: string;
  type: string;
  period: string;
  generatedDate: string;
  totalRevenue: number;
  status: string;
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
}

const naira = (n: number) => `₦${(n || 0).toLocaleString("en-US")}`;

function Field({ label, value, badge }: { label: string; value: React.ReactNode; badge?: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-500">{label}:</label>
      <p
        className={
          badge ? `inline-block rounded px-2 py-1 text-sm ${badge}` : "text-sm text-gray-900"
        }
      >
        {value}
      </p>
    </div>
  );
}

export default function ReportDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  const { data: report, isLoading, error } = useEcommerceItem<Report>("reports", id);

  const back = (
    <Button
      variant="ghost"
      className="mb-4 p-0 text-sm text-blue-600 hover:text-blue-800"
      onClick={() => router.back()}
    >
      <ArrowLeft className="mr-2 h-4 w-4" /> BACK
    </Button>
  );

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (error || !report)
    return (
      <div className="p-6">
        {back}
        <p className="text-sm text-red-600">
          Could not load report: {(error as Error)?.message ?? "Not found"}
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-white p-6">
      {back}
      <h1 className="mb-6 text-lg font-semibold text-gray-800">REPORT DETAILS</h1>
      <div className="grid grid-cols-3 gap-4 rounded-lg bg-white p-6 shadow-sm">
        <Field label="Report Id" value={report.id} />
        <Field label="Report Name" value={report.reportName} />
        <Field label="Type" value={report.type} />
        <Field label="Period" value={report.period} />
        <Field label="Generated Date" value={report.generatedDate} />
        <div>
          <label className="text-xs font-medium text-gray-500">Total Revenue:</label>
          <p className="text-xl font-bold text-orange-600">{naira(report.totalRevenue)}</p>
        </div>
        <Field label="Status" value={report.status} badge="bg-green-100 text-green-800" />
        <Field label="Total Orders" value={report.totalOrders} badge="bg-blue-100 text-blue-800" />
        <Field label="Paid Orders" value={report.paidOrders} />
        <Field label="Pending Orders" value={report.pendingOrders} />
        <Field label="Cancelled Orders" value={report.cancelledOrders} />
        <Field label="Average Order Value" value={naira(report.averageOrderValue)} />
      </div>
    </div>
  );
}
