// app/(dashboard)/bookings/page.tsx
// All repair bookings, read from Supabase via /api/admin/e-repair/bookings
// (same data as the E-Repair Bookings tab). Rows open the E-Repair booking
// details page.
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Search } from "lucide-react";
import { useERepairList } from "@/hooks/use-admin-e-repair";
import type { ERepairBooking } from "@/lib/e-repair";
import type { RootState } from "@/store/store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/common/pagination";
import { cn } from "@/lib/utils";

const STATUSES = ["All", "Pending", "Confirmed", "In Progress", "Completed", "Cancelled"];

const statusColor = (status: string) => {
  if (status === "Pending") return "bg-[#FFF3E0] text-[#EF6C00]";
  if (status === "Confirmed") return "bg-[#CEE0FC] text-[#0D47A1]";
  if (status === "In Progress") return "bg-[#E5D9F2] text-[#6A1B9A]";
  if (status === "Completed") return "bg-[#D4F4E2] text-[#1B5E20]";
  if (status === "Cancelled") return "bg-[#FFEBEE] text-[#B71C1C]";
  return "";
};

const paymentColor = (status: string) => {
  if (status === "Paid") return "bg-[#D4F4E2] text-[#1B5E20]";
  if (status === "Unpaid" || status === "Failed") return "bg-[#FFEBEE] text-[#B71C1C]";
  return "bg-[#E0E0E0] text-[#424242]";
};

const HEADERS = [
  "Repair ID",
  "Customer",
  "Repairer",
  "Category",
  "Service Type",
  "Booking Date",
  "Scheduled",
  "Status",
  "Cost",
  "Payment",
];

export default function BookingsPage() {
  const router = useRouter();
  const { currentPage, itemsPerPage } = useSelector(
    (state: RootState) => state.pagination
  );
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("All");

  const { data: bookings, isLoading, isError, error } =
    useERepairList<ERepairBooking>("bookings");

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return (bookings ?? []).filter(
      (b) =>
        (status === "All" || b.bookingStatus === status) &&
        (!q ||
          b.repairId.toLowerCase().includes(q) ||
          b.customerName.toLowerCase().includes(q) ||
          b.technician.toLowerCase().includes(q))
    );
  }, [bookings, search, status]);

  const start = (currentPage - 1) * itemsPerPage;
  const pageRows = filtered.slice(start, start + itemsPerPage);

  let message: string | null = null;
  if (isLoading) message = "Loading...";
  else if (isError) message = `Could not load bookings: ${(error as Error).message}`;
  else if (pageRows.length === 0) message = "No bookings found.";

  return (
    <div className="min-h-screen bg-white">
      <div className="flex h-12 items-center px-6 text-lg font-semibold text-gray-800">
        BOOKINGS
      </div>
      <div className="px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <Button
                key={s}
                variant="outline"
                className={cn(
                  "h-8 rounded-full text-sm font-normal",
                  status === s && "bg-[#0586CF] text-white hover:bg-[#0586CF] hover:text-white"
                )}
                onClick={() => setStatus(s)}
              >
                {s}
              </Button>
            ))}
          </div>
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search ID, customer, repairer"
              className="h-8 rounded-full pl-8 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#CEE0FC] hover:bg-[#CEE0FC]">
                {HEADERS.map((h) => (
                  <TableHead
                    key={h}
                    className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900"
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {message && (
                <TableRow>
                  <TableCell
                    colSpan={HEADERS.length}
                    className={cn(
                      "px-4 py-6 text-center text-sm",
                      isError ? "text-red-600" : "text-gray-500"
                    )}
                  >
                    {message}
                  </TableCell>
                </TableRow>
              )}
              {pageRows.map((b) => (
                <TableRow
                  key={b.id}
                  onClick={() => router.push(`/e-repair/e-bookings/${b.id}`)}
                  className="cursor-pointer border-b border-gray-200 hover:bg-gray-50"
                >
                  <TableCell className="px-4 py-3 text-sm">{b.repairId}</TableCell>
                  <TableCell className="px-4 py-3 text-sm">{b.customerName}</TableCell>
                  <TableCell className="px-4 py-3 text-sm">{b.technician}</TableCell>
                  <TableCell className="px-4 py-3 text-sm">{b.category}</TableCell>
                  <TableCell className="px-4 py-3 text-sm">{b.serviceType}</TableCell>
                  <TableCell className="px-4 py-3 text-sm">{b.bookingDate}</TableCell>
                  <TableCell className="px-4 py-3 text-sm">{b.scheduledDate || "-"}</TableCell>
                  <TableCell className="px-4 py-3 text-sm">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusColor(b.bookingStatus)}`}>
                      {b.bookingStatus}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm">
                    {b.totalCost ? `₦${b.totalCost.toLocaleString("en-US")}` : "-"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${paymentColor(b.paymentStatus)}`}>
                      {b.paymentStatus}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Pagination totalItems={filtered.length} />
      </div>
    </div>
  );
}
