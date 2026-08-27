//app\(dashboard)\advertisement-banners\page.tsx
"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { Pagination } from "@/components/common/pagination";
import { format } from "date-fns";
import { useAdverts } from "@/hooks/use-adverts";

type Advert = {
  id: string;
  created_at: string;
  media_type: "image" | "video";
  review_status: "pending" | "approved" | "rejected";
  author: { first_name: string | null; last_name: string | null } | null;
  tier: { label: string; amount: number; currency: string } | null;
  transaction: { amount: number; currency: string } | null;
};

const REVIEW_TO_DISPLAY: Record<Advert["review_status"], "Pending" | "Approved" | "Rejected"> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

function advertiserName(a: Advert) {
  const name = [a.author?.first_name, a.author?.last_name].filter(Boolean).join(" ");
  return name || "Unknown advertiser";
}

function advertAmount(a: Advert) {
  const amount = a.transaction?.amount ?? a.tier?.amount;
  const currency = a.transaction?.currency ?? a.tier?.currency ?? "NGN";
  if (amount == null) return "—";
  return `${currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const FiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["All", "Pending", "Approved", "Rejected"]).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});
type Filters = z.infer<typeof FiltersSchema>;

export default function AdvertisementBannerPage() {
  // pagination from redux slice
  const { currentPage, itemsPerPage } = useSelector(
    (s: RootState) => s.pagination
  );

  const {
    register,
    watch,
    reset,
    formState: { errors },
  } = useForm<Filters>({
    resolver: zodResolver(FiltersSchema),
    defaultValues: {
      search: "",
      status: "All",
      dateFrom: "",
      dateTo: "",
    },
  });

  const watched = watch();

  // fetch adverts (bearing_posts where is_advert = true, via Supabase)
  const {
    data: adverts = [] as Advert[],
    isLoading,
    isError,
  } = useAdverts();

  // client-side filtering
  const filtered = useMemo(() => {
    const s = (watched.search ?? "").trim().toLowerCase();
    const status = watched.status ?? "All";
    const from = watched.dateFrom ? new Date(watched.dateFrom) : null;
    const to = watched.dateTo ? new Date(watched.dateTo) : null;

    return ((adverts as Advert[]) || []).filter((a) => {
      if (s) {
        const hay = `${advertiserName(a)} ${a.tier?.label ?? ""} ${advertAmount(a)}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }

      if (status && status !== "All") {
        if (REVIEW_TO_DISPLAY[a.review_status] !== status) return false;
      }

      if (from) {
        const d = new Date(a.created_at);
        if (d < from) return false;
      }

      if (to) {
        const d = new Date(a.created_at);
        const endOfTo = new Date(to);
        endOfTo.setHours(23, 59, 59, 999);
        if (d > endOfTo) return false;
      }

      return true;
    });
  }, [adverts, watched]);

  // pagination (client side)
  const totalItems = filtered.length;
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  //const pageItems = filtered.slice(start, end);
  const pageItems: Advert[] = filtered.slice(start, end);

  return (
    <div className="w-full">
      {/* Title */}
      <div className="mb-4">
        <h2 className="text-[14px] leading-[18px] font-semibold text-[#1f2937]">
          ADVERTS AND BANNER
        </h2>
      </div>

      {/* Filters box (light grey background as screenshot) */}
      <div className="bg-[#F8FAFC] border border-[#E6E9EB] rounded-[6px] p-[16px] mb-[20px]">
        <div className="flex flex-col lg:flex-row gap-[12px]">
          <div className="flex-1 min-w-0">
            <label className="block text-[12px] leading-[14px] font-medium text-[#4B5563] mb-[6px]">
              Search
            </label>
            <input
              {...register("search")}
              placeholder="Search by advertiser, tier or amount"
              className="w-full bg-white border border-[#D1D5DB] rounded-[6px] px-[12px] py-[10px] text-[13px] leading-[18px] outline-none focus:ring-2 focus:ring-[#93C5FD]"
            />
            {errors.search ? (
              <p className="text-[12px] text-red-600 mt-[6px]">
                {String(errors.search.message)}
              </p>
            ) : null}
          </div>

          <div className="w-[170px]">
            <label className="block text-[12px] leading-[14px] font-medium text-[#4B5563] mb-[6px]">
              Status
            </label>
            <select
              {...register("status")}
              className="w-full bg-white border border-[#D1D5DB] rounded-[6px] px-[12px] py-[10px] text-[13px] leading-[18px] outline-none focus:ring-2 focus:ring-[#93C5FD]"
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="w-[170px]">
            <label className="block text-[12px] leading-[14px] font-medium text-[#4B5563] mb-[6px]">
              From
            </label>
            <input
              type="date"
              {...register("dateFrom")}
              className="w-full bg-white border border-[#D1D5DB] rounded-[6px] px-[12px] py-[10px] text-[13px] leading-[18px] outline-none focus:ring-2 focus:ring-[#93C5FD]"
            />
          </div>

          <div className="w-[170px]">
            <label className="block text-[12px] leading-[14px] font-medium text-[#4B5563] mb-[6px]">
              To
            </label>
            <input
              type="date"
              {...register("dateTo")}
              className="w-full bg-white border border-[#D1D5DB] rounded-[6px] px-[12px] py-[10px] text-[13px] leading-[18px] outline-none focus:ring-2 focus:ring-[#93C5FD]"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() =>
                reset({ search: "", status: "All", dateFrom: "", dateTo: "" })
              }
              className="h-[40px] px-[14px] py-[8px] text-[13px] leading-[18px] border border-[#D1D5DB] rounded-[6px] bg-white hover:bg-[#F3F4F6]"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-[#E6E9EB] rounded-[10px] overflow-hidden">
        <div className="px-[20px] py-[12px] border-b border-[#F1F5F9] bg-[#F8FAFC]">
          <div className="text-[12px] leading-[14px] font-semibold text-[#374151]">
            ADVERT LIST
          </div>
        </div>

        <div className="p-0">
          <table className="min-w-full" role="table">
            <thead>
              <tr className="bg-white">
                <th className="text-left px-[24px] py-[14px] text-[12px] leading-[14px] text-[#6B7280] font-medium uppercase tracking-[0.02em]">
                  Date and time
                </th>
                <th className="text-left px-[24px] py-[14px] text-[12px] leading-[14px] text-[#6B7280] font-medium uppercase tracking-[0.02em]">
                  Advertiser
                </th>
                <th className="text-left px-[24px] py-[14px] text-[12px] leading-[14px] text-[#6B7280] font-medium uppercase tracking-[0.02em]">
                  Tier
                </th>
                <th className="text-left px-[24px] py-[14px] text-[12px] leading-[14px] text-[#6B7280] font-medium uppercase tracking-[0.02em]">
                  Amount Paid
                </th>
                <th className="text-left px-[24px] py-[14px] text-[12px] leading-[14px] text-[#6B7280] font-medium uppercase tracking-[0.02em]">
                  Status
                </th>
                <th className="text-center px-[24px] py-[14px] text-[12px] leading-[14px] text-[#6B7280] font-medium uppercase tracking-[0.02em]">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-[24px] py-[30px] text-center text-[13px] text-[#6B7280]"
                  >
                    Loading adverts...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-[24px] py-[30px] text-center text-[13px] text-red-600"
                  >
                    Failed to load adverts.
                  </td>
                </tr>
              ) : pageItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-[24px] py-[30px] text-center text-[13px] text-[#6B7280]"
                  >
                    No adverts found.
                  </td>
                </tr>
              ) : (
                pageItems.map((adv) => (
                  <tr key={adv.id} className="hover:bg-[#FBFDFF]">
                    <td className="px-[24px] py-[16px] text-[13px] leading-[18px] text-[#4B5563] whitespace-nowrap">
                      {format(new Date(adv.created_at), "dd-MM-yyyy HH:mm:ss")}
                    </td>
                    <td className="px-[24px] py-[16px] text-[13px] leading-[18px] text-[#111827]">
                      {advertiserName(adv)}
                    </td>
                    <td className="px-[24px] py-[16px] text-[13px] leading-[18px] text-[#4B5563]">
                      {adv.tier?.label ?? "—"}
                    </td>
                    <td className="px-[24px] py-[16px] text-[13px] leading-[18px] text-[#111827]">
                      {advertAmount(adv)}
                    </td>
                    <td className="px-[24px] py-[16px] text-[13px] leading-[18px]">
                      <span
                        className={`inline-block text-[12px] leading-[14px] font-medium px-[10px] py-[6px] rounded-[18px] ${
                          adv.review_status === "pending"
                            ? "bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]"
                            : adv.review_status === "approved"
                            ? "bg-[#ECFDF5] text-[#065F46] border border-[#34D399]"
                            : "bg-[#FEF2F2] text-[#991B1B] border border-[#FCA5A5]"
                        }`}
                      >
                        {REVIEW_TO_DISPLAY[adv.review_status]}
                      </span>
                    </td>
                    <td className="px-[24px] py-[16px] text-center">
                      <Link
                        href={`/advertisement-banners/${adv.id}`}
                        className="inline-block"
                      >
                        <button
                          className="text-[13px] leading-[18px] font-medium px-[12px] py-[6px] rounded-[6px] bg-[#5D92E4] text-white hover:bg-[#2563EB] border border-[#2563EB]"
                          aria-label={`View details for advert ${adv.id}`}
                        >
                          View details
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer: showing x - y of z and pagination */}
        <div className="px-[20px] py-[12px] bg-white border-t border-[#F1F5F9] flex items-center justify-between">
          <div className="text-[12px] leading-[14px] text-[#6B7280]">
            {totalItems === 0
              ? "Showing 0 of 0"
              : `Showing ${Math.min(start + 1, totalItems)} - ${Math.min(
                  end,
                  totalItems
                )} of ${totalItems}`}
          </div>
          <div className="flex items-center">
            <Pagination totalItems={totalItems} />
          </div>
        </div>
      </div>
    </div>
  );
}
