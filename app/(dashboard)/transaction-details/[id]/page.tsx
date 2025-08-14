//app/(dashboard)/transaction-details/[id]/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";

interface Transaction {
  id: string;
  date: string;
  time: string;
  status: "Successful" | "Pending";
  user: {
    name: string;
    email: string;
    phone: string;
  };
  payment: {
    method: string;
    amount: number;
  };
  item: {
    purpose: string;
    itemPaidFor: string;
  };
}

export default function TransactionDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: transaction, isLoading } = useQuery<Transaction>({
    queryKey: ["transaction", id],
    queryFn: () => apiClient.get(`/transactions/${id}`).then((res) => res.data),
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen text-gray-500">Loading...</div>;
  }

  if (!transaction) {
    return <div className="flex items-center justify-center h-screen text-red-500">Transaction not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className=" mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold uppercase text-gray-900 mb-6">Transaction Details</h1>

        <div className="h-[55px] bg-[#D1D8E233] p-2">
          <h3 className="text-lg font-semibold uppercase text-[#1A3B6F] mb-4">Transaction Information</h3>
        </div>

        <div className="space-y-2 px-3 mb-8 mt-3">
          <p className="text-sm text-gray-900">
            <span className="font-medium">Transaction ID:</span> {transaction.id}
          </p>
          <p className="text-sm text-gray-900">
            <span className="font-medium">Date:</span> {transaction.date}
          </p>
          <p className="text-sm text-gray-900">
            <span className="font-medium">Time:</span> {transaction.time}
          </p>
          <p className="text-sm text-gray-900">
            <span className="font-medium">Status:</span>{" "}
            <span className={transaction.status === "Successful" ? "text-green-600" : "text-orange-500"}>
              {transaction.status}
            </span>
          </p>
        </div>
        <div className="h-[55px] bg-[#D1D8E233] p-2">
          <h3 className="text-lg font-semibold uppercase text-[#1A3B6F] mb-4">User Information</h3>
        </div>

        <div className="space-y-2 px-3 mb-8 mt-3">
          <p className="text-sm text-gray-900">
            <span className="font-medium">Name:</span> {transaction.user.name}
          </p>
          <p className="text-sm text-gray-900">
            <span className="font-medium">Email:</span> {transaction.user.email}
          </p>
          <p className="text-sm text-gray-900">
            <span className="font-medium">Phone number:</span> {transaction.user.phone}
          </p>
        </div>

        <div className="h-[55px] bg-[#D1D8E233] p-2">
          <h3 className="text-lg font-semibold uppercase text-[#1A3B6F] mb-4">Payment Information</h3>
        </div>

        <div className="space-y-2 px-3 mb-8 mt-3">
          <p className="text-sm text-gray-900">
            <span className="font-medium">Payment method:</span> {transaction.payment.method}
          </p>
          <p className="text-sm text-gray-900">
            <span className="font-medium">Amount paid:</span> #{transaction.payment.amount}
          </p>
        </div>

        <div className="h-[55px] bg-[#D1D8E233] p-2">
          <h3 className="text-lg font-semibold uppercase text-[#1A3B6F] mb-4">Item Information</h3>
        </div>
        <div className="space-y-2 px-3 mb-8 mt-3">
          <p className="text-sm text-gray-900">
            <span className="font-medium">Payment purpose::</span> {transaction.item.purpose}
          </p>
          <p className="text-sm text-gray-900">
            <span className="font-medium">Item paid for:</span> {transaction.item.itemPaidFor}
          </p>
        </div>
      </div>
    </div>
  );
}