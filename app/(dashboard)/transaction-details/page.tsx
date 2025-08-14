//app/(dashboard)/transaction-details/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { setCurrentPage, setItemsPerPage } from "@/store/slices/pagination-slice";
import { apiClient } from "@/lib/api-client";
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

interface Transaction {
  id: string;
  dateTime: string;
  paymentBy: string;
  purpose: string;
  amountPaid: number;
  status: "Successful" | "Pending";
}

export default function TransactionPage() {
  const dispatch = useDispatch();
  const { currentPage, itemsPerPage } = useSelector((state: RootState) => state.pagination);

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: () => apiClient.get("/transactions").then((res) => res.data),
  });

  const totalItems = transactions.length;
  const paginatedTransactions = transactions.slice(
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
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.dateTime}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.paymentBy}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.purpose}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{(transaction.amountPaid ?? 0).toFixed(3)}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={transaction.status === "Successful" ? "text-green-600 font-medium" : "text-orange-500 font-medium"}>
                      {transaction.status}
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