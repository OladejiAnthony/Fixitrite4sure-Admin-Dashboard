// app/(dashboard)/sos-requests/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/common/pagination";
import { setCurrentPage } from "@/store/slices/pagination-slice";
import type { RootState } from "@/store/store";
import {
  displayName,
  formatDateTime,
  type SupportRequest,
} from "@/lib/support-requests";

type TabType = "all" | "awaiting" | "replied";

const tabs: { id: TabType; label: string }[] = [
  { id: "all", label: "ALL REQUESTS" },
  { id: "awaiting", label: "AWAITING REPLY" },
  { id: "replied", label: "REPLIED" },
];

export default function SosRequestPage() {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const dispatch = useDispatch();
  const { currentPage, itemsPerPage } = useSelector(
    (state: RootState) => state.pagination
  );

  const {
    data: requests = [],
    isLoading,
    error,
  } = useQuery<SupportRequest[]>({
    queryKey: ["support-requests"],
    queryFn: async () => {
      const res = await fetch("/api/admin/support-requests");
      if (!res.ok) throw new Error("Failed to load support requests");
      return res.json();
    },
    refetchInterval: 30_000,
  });

  const filteredRequests = requests.filter((r) => {
    if (activeTab === "awaiting") return r.awaiting_reply;
    if (activeTab === "replied") return !r.awaiting_reply;
    return true;
  });

  const start = (currentPage - 1) * itemsPerPage;
  const pageRequests = filteredRequests.slice(start, start + itemsPerPage);

  const awaitingCount = requests.filter((r) => r.awaiting_reply).length;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-gray-900">
        SOS REQUEST MANAGEMENT
      </h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-3 text-sm font-medium tracking-wide transition-colors duration-200 ${
                activeTab === tab.id
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
              onClick={() => {
                setActiveTab(tab.id);
                dispatch(setCurrentPage(1));
              }}
            >
              {tab.label}
              {tab.id === "awaiting" && awaitingCount > 0 && (
                <span className="ml-2 rounded-full bg-yellow-100 px-2 text-xs text-yellow-800">
                  {awaitingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Request Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["USER", "ACCOUNT TYPE", "CONTACT", "LAST MESSAGE", "LAST ACTIVITY", "STATUS", "ACTION"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-medium text-[#202224] uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-red-600">
                    {(error as Error).message}
                  </td>
                </tr>
              ) : pageRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No requests found
                  </td>
                </tr>
              ) : (
                pageRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {displayName(request.user)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {request.user?.user_type ?? "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.user?.phone_number || request.user?.email || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {request.last_message_preview ?? "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(request.last_message_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          request.awaiting_reply
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {request.awaiting_reply ? "Awaiting reply" : "Replied"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Link href={`/sos-requests/${request.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-white bg-[#5D92E4]"
                        >
                          View Chat
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <Pagination totalItems={filteredRequests.length} />
        </div>
      </div>
    </div>
  );
}
