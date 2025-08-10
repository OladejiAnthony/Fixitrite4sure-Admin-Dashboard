//app/(dashboard)/news/page.tsx
"use client";

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { z } from "zod";
import Link from "next/link";
import { Pagination } from "@/components/common/pagination";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

/*
  This file implements the Published Articles table as requested.
  - Uses axios via apiClient
  - Uses @tanstack/react-query (v5) for data fetching/caching
  - Uses zod for runtime validation of API response
  - Integrates the Pagination component you provided (client-side pagination)
  - Matches the screenshot styling as closely as possible with Tailwind classes

  Notes:
  - This component expects an endpoint at GET /adverts (based on your db.json structure)
  - Each row "View details" links to /(dashboard)/news/[id] so make sure the dynamic route exists
*/

const newsSchema = z.array(
  z.object({
    id: z.union([z.string(), z.number()]),
    title: z.string(), // changed from content to title
    postedBy: z.string(),
    dateTime: z.string(),
    body: z.string().optional(), // optional since you're not using it in the table
  })
);

function formatDate(dt?: string) {
  if (!dt) return "";
  try {
    const d = new Date(dt);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day} - ${month} - ${year}`;
  } catch {
    return dt;
  }
}

export default function NewsPageClient() {
  const { data, isLoading, isError, error } = useQuery({
    // added error destructuring
    queryKey: ["news"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/news");
        const parsed = newsSchema.parse(res.data);
        return parsed;
      } catch (err) {
        console.error("Failed to fetch news:", err);
        throw err;
      }
    },
  });

  // Then you can log the error for debugging
  if (isError) {
    console.error("News fetch error:", error);
  }

  const totalItems = data?.length ?? 0;

  // pagination from redux
  const { currentPage, itemsPerPage } = useSelector(
    (state: RootState) => state.pagination
  );

  const pagedData = useMemo(() => {
    if (!data) return [];
    const start = (currentPage - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  }, [data, currentPage, itemsPerPage]);

  return (
    <div className="p-6">
      <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg leading-6 font-semibold text-slate-800">
            PUBLISHED ARTICLES
          </h3>
          {/* Optional actions if needed */}
        </div>

        {/* Table container replicating the screenshot */}
        <div className="overflow-hidden rounded-md border border-gray-100">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-transparent">
                <th className="text-left px-6 py-4 text-xs font-semibold tracking-wider text-gray-500">
                  TITLE
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold tracking-wider text-gray-500">
                  PUBLISHER
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold tracking-wider text-gray-500">
                  DATE
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold tracking-wider text-gray-500">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    Loading articles...
                  </td>
                </tr>
              )}

              {isError && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-sm text-red-500"
                  >
                    Error loading articles
                  </td>
                </tr>
              )}

              {!isLoading && data && pagedData.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    No articles found
                  </td>
                </tr>
              )}

              {pagedData.map((item) => (
                <tr key={String(item.id)} className="border-t border-gray-100">
                  <td className="px-6 py-4 align-top text-sm leading-5 text-slate-700 font-medium">
                    {/* Match font, size, and uppercase in screenshot */}
                    <div className="uppercase text-[13px] leading-[16px]">
                      {item.title ?? "TAKE IT ON"}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top text-sm leading-5 text-gray-600">
                    {item.postedBy ?? "Seye Mangi"}
                  </td>
                  <td className="px-6 py-4 align-top text-sm text-gray-600">
                    {formatDate(item.dateTime)}
                  </td>
                  <td className="px-6 py-4 align-top">
                    <Link
                      href={`/news/${item.id}`}
                      className="inline-flex items-center justify-center rounded-md border border-blue-300 bg-blue-600/0 px-3 py-1.5 text-sm font-medium leading-4 text-white shadow-sm"
                      style={{ backgroundColor: "#4ea8ff" }}
                    >
                      <span className="sr-only">View details</span>
                      <div className="text-[13px] leading-[16px] px-2 py-0.5">
                        View details
                      </div>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination control */}
        <Pagination totalItems={totalItems} />
      </div>
    </div>
  );
}
