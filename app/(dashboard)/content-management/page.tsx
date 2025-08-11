//app/(dashboard)/content-management/page.tsx
"use client";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { Pagination } from "@/components/common/pagination";

// app/(dashboard)/content-management/page.tsx
interface ContentItem {
  id: string;
  name: string;
  datePosted: string;
  status: "approved" | "pending" | "rejected";
  contentText?: string; // Add this
  imageUrl?: string; // Add this
  reason?: string;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function getDisplayStatus(status: string): string {
  if (status === "rejected") return "Disapproved";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getStatusColor(status: string): string {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function ContentManagementPage() {
  const [currentTab, setCurrentTab] = useState<
    "all" | "pending" | "approved" | "disapproved"
  >("all");

  const { data = [], isLoading } = useQuery<ContentItem[]>({
    queryKey: ["content"],
    queryFn: () => apiClient.get("/content").then((res) => res.data),
  });

  const filteredData = useMemo(() => {
    if (currentTab === "all") return data;
    return data.filter((item) => {
      if (currentTab === "pending") return item.status === "pending";
      if (currentTab === "approved") return item.status === "approved";
      if (currentTab === "disapproved") return item.status === "rejected";
      return false;
    });
  }, [data, currentTab]);

  const { currentPage, itemsPerPage } = useSelector(
    (state: RootState) => state.pagination
  );

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      <h1 className="text-xl font-semibold text-gray-900 mb-4">
        CONTENT MANAGEMENT
      </h1>
      <div className="flex space-x-6 mb-6 text-sm text-gray-600">
        <button
          onClick={() => setCurrentTab("all")}
          className={`pb-2 ${
            currentTab === "all"
              ? "font-medium text-gray-900 border-b-2 border-blue-500"
              : ""
          }`}
        >
          All Contents
        </button>
        <button
          onClick={() => setCurrentTab("pending")}
          className={`pb-2 ${
            currentTab === "pending"
              ? "font-medium text-gray-900 border-b-2 border-blue-500"
              : ""
          }`}
        >
          Pending Contents
        </button>
        <button
          onClick={() => setCurrentTab("approved")}
          className={`pb-2 ${
            currentTab === "approved"
              ? "font-medium text-gray-900 border-b-2 border-blue-500"
              : ""
          }`}
        >
          Approved Contents
        </button>
        <button
          onClick={() => setCurrentTab("disapproved")}
          className={`pb-2 ${
            currentTab === "disapproved"
              ? "font-medium text-gray-900 border-b-2 border-blue-500"
              : ""
          }`}
        >
          Disapproved Contents
        </button>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                POSTING DATE
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                POSTING TIME
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                POSTED BY
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CONTENT STATUS
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ACTION
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedData.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(item.datePosted)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatTime(item.datePosted)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      item.status
                    )}`}
                  >
                    {getDisplayStatus(item.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <a
                    href={`/content-management/${item.id}`}
                    className="bg-blue-500 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-blue-600"
                  >
                    View Details
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination totalItems={filteredData.length} />
    </div>
  );
}
