//app/(dashboard)/transaction-details/page.tsx
"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/common/pagination";
import Link from "next/link";
import { useAdminTransactions } from "@/hooks/use-admin-transactions";

interface Transaction {
  id: string;
  amount: number;
  status: "pending" | "paid" | "failed" | "refunded";
  created_at: string;
  owner: { first_name: string | null; last_name: string | null } | null;
  invoice: {
    booking: { service: { name: string | null } | null } | null;
    order: { id: string; total_amount: number } | null;
  } | null;
}

function paymentBy(t: Transaction) {
  const name = [t.owner?.first_name, t.owner?.last_name].filter(Boolean).join(" ");
  return name || "Unknown";
}

function purpose(t: Transaction) {
  if (t.invoice?.booking?.service?.name) return t.invoice.booking.service.name;
  if (t.invoice?.order) return "Product order";
  return "—";
}

const STATUS_LABEL: Record<Transaction["status"], string> = {
  pending: "Pending",
  paid: "Successful",
  failed: "Failed",
  refunded: "Refunded",
};

const STATUS_COLOR: Record<Transaction["status"], string> = {
  pending: "text-orange-500",
  paid: "text-green-600",
  failed: "text-red-600",
  refunded: "text-gray-500",
};

export default function TransactionPage() {
  const { currentPage, itemsPerPage } = useSelector((state: RootState) => state.pagination);

  const { data: transactions = [], isLoading } = useAdminTransactions();

  const totalItems = (transactions as Transaction[]).length;
  const paginatedTransactions = (transactions as Transaction[]).slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen text-gray-500">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold uppercase text-gray-900 mb-2">Transaction Details</h1>
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Transaction List</h3>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200">
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date & Time</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Payment By</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Purpose</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Amount Paid</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.map((transaction) => (
                <TableRow key={transaction.id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(transaction.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{paymentBy(transaction)}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{purpose(transaction)}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₦{transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`${STATUS_COLOR[transaction.status]} font-medium`}>
                      {STATUS_LABEL[transaction.status]}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link href={`/transaction-details/${transaction.id}`}>
                      <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50 text-xs px-4 py-1">
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Pagination totalItems={totalItems} />
      </div>
    </div>
  );
}
