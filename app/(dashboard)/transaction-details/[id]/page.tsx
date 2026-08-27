//app/(dashboard)/transaction-details/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useAdminTransaction } from "@/hooks/use-admin-transaction";

interface Transaction {
  id: string;
  amount: number;
  status: "pending" | "paid" | "failed" | "refunded";
  created_at: string;
  owner: { first_name: string | null; last_name: string | null; email: string | null; phone_number: string | null } | null;
  invoice: {
    booking: { service: { name: string | null } | null } | null;
    order: { id: string; total_amount: number } | null;
  } | null;
}

const STATUS_LABEL: Record<Transaction["status"], string> = {
  pending: "Pending",
  paid: "Successful",
  failed: "Failed",
  refunded: "Refunded",
};

function purpose(t: Transaction) {
  if (t.invoice?.booking?.service?.name) return `Booking — ${t.invoice.booking.service.name}`;
  if (t.invoice?.order) return "Product order";
  return "—";
}

export default function TransactionDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: transaction, isLoading } = useAdminTransaction(id);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen text-gray-500">Loading...</div>;
  }

  if (!transaction) {
    return <div className="flex items-center justify-center h-screen text-red-500">Transaction not found</div>;
  }

  const t = transaction as Transaction;
  const created = new Date(t.created_at);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className=" mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold uppercase text-gray-900 mb-6">Transaction Details</h1>

        <div className="h-[55px] bg-[#D1D8E233] p-2">
          <h3 className="text-lg font-semibold uppercase text-[#1A3B6F] mb-4">Transaction Information</h3>
        </div>

        <div className="space-y-2 px-3 mb-8 mt-3">
          <p className="text-sm text-gray-900">
            <span className="font-medium">Transaction ID:</span> {t.id}
          </p>
          <p className="text-sm text-gray-900">
            <span className="font-medium">Date:</span> {created.toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-900">
            <span className="font-medium">Time:</span> {created.toLocaleTimeString()}
          </p>
          <p className="text-sm text-gray-900">
            <span className="font-medium">Status:</span>{" "}
            <span className={t.status === "paid" ? "text-green-600" : t.status === "failed" ? "text-red-600" : "text-orange-500"}>
              {STATUS_LABEL[t.status]}
            </span>
          </p>
        </div>
        <div className="h-[55px] bg-[#D1D8E233] p-2">
          <h3 className="text-lg font-semibold uppercase text-[#1A3B6F] mb-4">User Information</h3>
        </div>

        <div className="space-y-2 px-3 mb-8 mt-3">
          <p className="text-sm text-gray-900">
            <span className="font-medium">Name:</span> {[t.owner?.first_name, t.owner?.last_name].filter(Boolean).join(" ") || "Unknown"}
          </p>
          <p className="text-sm text-gray-900">
            <span className="font-medium">Email:</span> {t.owner?.email ?? "—"}
          </p>
          <p className="text-sm text-gray-900">
            <span className="font-medium">Phone number:</span> {t.owner?.phone_number ?? "—"}
          </p>
        </div>

        <div className="h-[55px] bg-[#D1D8E233] p-2">
          <h3 className="text-lg font-semibold uppercase text-[#1A3B6F] mb-4">Payment Information</h3>
        </div>

        <div className="space-y-2 px-3 mb-8 mt-3">
          <p className="text-sm text-gray-900">
            <span className="font-medium">Amount paid:</span> ₦{t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="h-[55px] bg-[#D1D8E233] p-2">
          <h3 className="text-lg font-semibold uppercase text-[#1A3B6F] mb-4">Item Information</h3>
        </div>
        <div className="space-y-2 px-3 mb-8 mt-3">
          <p className="text-sm text-gray-900">
            <span className="font-medium">Payment purpose:</span> {purpose(t)}
          </p>
        </div>
      </div>
    </div>
  );
}
