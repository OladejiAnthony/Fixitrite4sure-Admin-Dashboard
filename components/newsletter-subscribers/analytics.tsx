// components/newsletter-subscribers/analytics.tsx
import React, { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../lib/api-client";
import axios from "axios";

type NewsletterStats = {
  id?: number;
  month: string;
  year: number;
  totalSubscribers: number;
  activeSubscribers: number;
  unsubscribers: number;
  openRate: string;
  clickThroughRate: string;
};

const monthsList = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

async function fetchCurrentDate() {
  const resp = await axios.get("http://worldclockapi.com/api/json/utc/now");
  return resp.data;
}

async function fetchNewsletterStats() {
  const { data } = await apiClient.get<NewsletterStats[]>("/newsletter");
  return data || [];
}

export default function Analytics() {
  const { data: dateData } = useQuery({
    queryKey: ["external_current_date"],
    queryFn: fetchCurrentDate,
    staleTime: 1000 * 60 * 60,
  });

  const { data: newsletter = [], isLoading } = useQuery({
    queryKey: ["newsletter_stats"],
    queryFn: fetchNewsletterStats,
    staleTime: 1000 * 60 * 2,
  });

  const months = monthsList;

  const years = useMemo(() => {
    const currentYear = dateData?.currentDateTime
      ? new Date(dateData.currentDateTime).getFullYear()
      : new Date().getFullYear();
    const list: number[] = [];
    for (let y = currentYear; y >= 2000; y--) list.push(y);
    return list;
  }, [dateData]);

  // ✅ Local state to store selections
  const [selectedMonth, setSelectedMonth] = useState<string>(months[3]); // default April
  const [selectedYear, setSelectedYear] = useState<number>(years[0] || 2000);

  // ✅ When data loads, set defaults based on first record
  useEffect(() => {
    if (newsletter.length > 0) {
      setSelectedMonth(newsletter[0].month);
      setSelectedYear(newsletter[0].year);
    }
  }, [newsletter]);

  // ✅ Filter data based on selected values
  const selectedStats: NewsletterStats | undefined = newsletter.find(
    (n) => n.month === selectedMonth && n.year === selectedYear
  );

  const fallback: NewsletterStats = {
    month: selectedMonth,
    year: selectedYear,
    totalSubscribers: 0,
    activeSubscribers: 0,
    unsubscribers: 0,
    openRate: "0%",
    clickThroughRate: "0%",
  };

  const s = selectedStats || fallback;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm max-w-full">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <h3 className="text-2xl font-semibold leading-7 text-slate-900">
            ANALYTICS
          </h3>
          <p className="mt-1 text-sm leading-5 text-gray-500">
            See how many people have subscribed to your newsletter.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month select */}
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Select Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="h-9 px-3 text-sm leading-5 bg-white border border-gray-200 rounded-md shadow-sm focus:outline-none"
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Year select */}
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Select Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="h-9 px-3 text-sm leading-5 bg-white border border-gray-200 rounded-md shadow-sm focus:outline-none"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="relative rounded-xl border border-gray-100 bg-white p-5 h-28">
          <div className="absolute right-4 top-3 text-xs text-gray-400">
            {s.month}
          </div>
          <div className="text-sm text-gray-500 mt-2">Total Subscribers</div>
          <div className="mt-3 text-3xl font-extrabold">
            {s.totalSubscribers.toLocaleString()}
          </div>
        </div>

        <div className="relative rounded-xl border border-gray-100 bg-white p-5 h-28">
          <div className="absolute right-4 top-3 text-xs text-gray-400">
            {s.month}
          </div>
          <div className="text-sm text-gray-500 mt-2">Active Subscribers</div>
          <div className="mt-3 text-3xl font-extrabold">
            {s.activeSubscribers.toLocaleString()}
          </div>
        </div>

        <div className="relative rounded-xl border border-gray-100 bg-white p-5 h-28">
          <div className="absolute right-4 top-3 text-xs text-gray-400">
            {s.month}
          </div>
          <div className="text-sm text-gray-500 mt-2">Unsubscribers</div>
          <div className="mt-3 text-3xl font-extrabold">
            {s.unsubscribers.toLocaleString()}
          </div>
        </div>

        <div className="relative rounded-xl border border-gray-100 bg-white p-5 h-28">
          <div className="absolute right-4 top-3 text-xs text-gray-400">
            {s.month}
          </div>
          <div className="text-sm text-gray-500 mt-2">Open Rate</div>
          <div className="mt-3 text-2xl font-semibold">{s.openRate}</div>
        </div>

        <div className="relative rounded-xl border border-gray-100 bg-white p-5 h-28">
          <div className="absolute right-4 top-3 text-xs text-gray-400">
            {s.month}
          </div>
          <div className="text-sm text-gray-500 mt-2">Click-Through Rate</div>
          <div className="mt-3 text-2xl font-semibold">
            {s.clickThroughRate}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="mt-4 text-sm text-gray-400">Loading...</div>
      )}
    </div>
  );
}
