// app/(dashboard)/sos-requests/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/common/pagination";
import Link from "next/link";

// Zod schema for request data validation
const requestSchema = z.object({
  id: z.string(),
  username: z.string(),
  location: z.string(),
  time: z.string(),
  status: z.enum(["Pending", "In Progress", "Resolved", "Closed"]),
});

type Request = z.infer<typeof requestSchema>;

// Tab types
type TabType = "all" | "pending" | "in-progress" | "resolved" | "closed";

export default function SosRequestPage() {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(requestSchema),
  });

  // Fetch requests data
  const { data: requests = [], isLoading } = useQuery<Request[]>({
    queryKey: ["sos-requests"],
    queryFn: async () => {
      const response = await apiClient.get("/sosRequests");
      return response.data;
    },
  });

  // Filter requests based on active tab
  const filteredRequests = requests.filter((request) => {
    if (activeTab === "all") return true;
    return request.status.toLowerCase().replace(" ", "-") === activeTab;
  });

  // Tab configuration
  const tabs = [
    { id: "all", label: "ALL REQUESTS" },
    { id: "pending", label: "PENDING REQUESTS" },
    { id: "in-progress", label: "IN PROGRESS REQUESTS" },
    { id: "resolved", label: "RESOLVED REQUESTS" },
    { id: "closed", label: "CLOSED REQUESTS" },
  ];

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
              onClick={() => setActiveTab(tab.id as TabType)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Request Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#202224] uppercase tracking-wider">
                  REQUEST ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#202224] uppercase tracking-wider">
                  USERNAME
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#202224] uppercase tracking-wider">
                  LOCATION
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#202224] uppercase tracking-wider">
                  TIME
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#202224] uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#202224] uppercase tracking-wider">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No requests found
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {request.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          request.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : request.status === "In Progress"
                            ? "bg-blue-100 text-blue-800"
                            : request.status === "Resolved"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Link href={`/sos-requests/${request.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-white bg-[#5D92E4]"
                        >
                          View Details
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
