//components\newsletter-subscribers\subscriber-list.tsx
"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { apiClient } from "../../lib/api-client";
import { Pagination } from "../common/pagination";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

const subscriberSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  subscriptionDate: z.string(),
  status: z.string(),
});

type Subscriber = z.infer<typeof subscriberSchema>;

type Filters = {
  name: string;
  subscriptionDate: string;
  status: string;
};

export default function SubscriberList() {
  const { currentPage, itemsPerPage } = useSelector(
    (state: RootState) => state.pagination
  );

  const [filters, setFilters] = useState<Filters>({
    name: "",
    subscriptionDate: "",
    status: "",
  });

  const { register, watch, reset } = useForm<Filters>({
    defaultValues: filters,
  });

  // Watch individual fields instead of all form values
  const nameValue = watch("name");
  const dateValue = watch("subscriptionDate");
  const statusValue = watch("status");

  useEffect(() => {
    // Update filters when any watched field changes
    setFilters({
      name: nameValue,
      subscriptionDate: dateValue,
      status: statusValue,
    });
  }, [nameValue, dateValue, statusValue]);

  const { data: subscribers = [], isLoading } = useQuery<Subscriber[]>({
    queryKey: ["subscribers", filters], // Add filters to queryKey
    queryFn: async () => {
      const { data } = await apiClient.get("/newsletter");
      return data;
    },
  });

  const filteredSubscribers = subscribers.filter((subscriber) => {
    const matchesName =
      !filters.name ||
      subscriber.name.toLowerCase().includes(filters.name.toLowerCase());
    const matchesDate =
      !filters.subscriptionDate ||
      subscriber.subscriptionDate.includes(filters.subscriptionDate);
    const matchesStatus =
      !filters.status || subscriber.status === filters.status;
    return matchesName && matchesDate && matchesStatus;
  });

  const totalItems = filteredSubscribers.length;
  const paginatedSubscribers = filteredSubscribers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetFilters = () => {
    reset();
    setFilters({
      name: "",
      subscriptionDate: "",
      status: "",
    });
  };

  return (
    <div className="flex flex-col gap-4 bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <input
            {...register("name")}
            placeholder="Filter by name"
            className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-700"
          />
          <input
            {...register("subscriptionDate")}
            type="date"
            className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-700"
          />
          <select
            {...register("status")}
            className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-700"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="InActive">Inactive</option>
          </select>
          <button
            onClick={resetFilters}
            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
          >
            Reset
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-gray-700">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th className="py-2 px-4 text-left">NAME</th>
              <th className="py-2 px-4 text-left">EMAIL</th>
              <th className="py-2 px-4 text-left">SUBSCRIPTION DATE</th>
              <th className="py-2 px-4 text-left">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {paginatedSubscribers.map((subscriber) => (
              <tr key={subscriber.id} className="border-b border-gray-200">
                <td className="py-2 px-4">{subscriber.name}</td>
                <td className="py-2 px-4">{subscriber.email}</td>
                <td className="py-2 px-4">{subscriber.subscriptionDate}</td>
                <td className="py-2 px-4">{subscriber.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination totalItems={totalItems} />
    </div>
  );
}
