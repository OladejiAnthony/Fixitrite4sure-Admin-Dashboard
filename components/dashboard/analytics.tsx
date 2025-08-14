//components/dashboard/analytics.tsx
// components/dashboard/analytics.tsx
"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { apiClient } from "@/lib/api-client";
import { Users, Building2, Store, ShoppingBag, Wrench } from "lucide-react";


const analyticsSchema = z.object({
  user: z.object({
    customers: z.number(),
    repairers: z.number(),
    repairCompanies: z.number(),
    vendors: z.number(),
    timestamp: z.string(),
  }),
  orders: z.object({
    product: z.number(),
    productChange: z.string(),
    service: z.number(),
    serviceChange: z.string(),
  }),
  totalOrdersChart: z.array(z.object({
    month: z.string(),
    product: z.number(),
    service: z.number(),
  })),
});

type AnalyticsData = z.infer<typeof analyticsSchema>;

export function Analytics() {
  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["analytics"],
    queryFn: async () => {
      const res = await apiClient.get("/analytics");
      return analyticsSchema.parse(res.data);
    },
  });

  if (isLoading || !data) {
    return <div className="p-6 text-white">Loading...</div>;
  }

  const formatNumber = (num: number) => num.toLocaleString();

  const chartData = data.totalOrdersChart;
  const maxValue = Math.max(...chartData.flatMap((d) => [d.product, d.service]), 1);
  const productPoints = chartData.map((d) => (d.product / maxValue) * 100);
  const servicePoints = chartData.map((d) => (d.service / maxValue) * 100);

  return (
    <div className="min-h-screen  p-6 text-white">
      <h2 className="mb-6 text-2xl font-semibold text-black">ANALYTICS</h2>

      <div className="mb-6">
        <h3 className="mb-4 text-lg font-medium text-black">User Analytics</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="mb-2 inline-block w-full">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">Total Customers</div>
                <div className="rounded-full bg-violet-200 p-2">
                  <Users className="h-5 w-5 text-violet-600" />
                </div>
              </div>
            </div>
            <div className="text-3xl font-bold text-black">{formatNumber(data.user.customers)}</div>

            <div className="mt-2 text-xs text-gray-400">{data.user.timestamp}</div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="mb-2 inline-block w-full">
              <div className=" flex justify-between items-center">

                <div className="text-sm text-gray-500">Total Repairers</div>
                <div className="rounded-full bg-pink-200 p-2">
                  <Wrench className="h-5 w-5 text-pink-600" />
                </div>
              </div>
            </div>
            <div className="text-3xl font-bold text-black">{formatNumber(data.user.repairers)}</div>
            <div className="mt-2 text-xs text-gray-400">{data.user.timestamp}</div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="mb-2 inline-block w-full">
              <div className=" flex justify-between items-center">
                <div className="text-sm text-gray-500">Total Repair Company</div>
                <div className="rounded-full bg-amber-200 p-2">
                  <Building2 className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </div>
            <div className="text-3xl font-bold text-black">{formatNumber(data.user.repairCompanies)}</div>

            <div className="mt-2 text-xs text-gray-400">{data.user.timestamp}</div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="mb-2 inline-block w-full">
              <div className=" flex justify-between items-center">

                <div className="text-sm text-gray-500">Total Vendors</div>
                <div className="rounded-full bg-amber-200 p-2">
                  <Store className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </div>
            <div className="text-3xl font-bold text-black">{formatNumber(data.user.vendors)}</div>

            <div className="mt-2 text-xs text-gray-400">{data.user.timestamp}</div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="mb-4 text-lg font-medium">Order Analytics</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="mb-2 inline-block w-full">
              <div className=" flex justify-between items-center">
                <div className="text-sm text-gray-500">Product Orders</div>
                <div className="rounded-full bg-green-200 p-2">
                  <ShoppingBag className="h-5 w-5 text-green-600" />
                </div>

              </div>
            </div>
            <div className="text-3xl font-bold text-black">{formatNumber(data.orders.product)}</div>

            <div className="mt-2 text-sm text-green-500">{data.orders.productChange}</div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="mb-2 inline-block w-full">
              <div className=" flex justify-between items-center">

                <div className="text-sm text-gray-500">Service Orders</div>
                <div className="rounded-full bg-red-200 p-2">
                  <Wrench className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </div>
            <div className="text-3xl font-bold text-black">{formatNumber(data.orders.service)}</div>

            <div className="mt-2 text-sm text-red-500">{data.orders.serviceChange}</div>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white p-4 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium text-black">Total Orders</h3>
          <div className="flex gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="h-2 w-4 rounded bg-orange-500"></div>
              Product Orders
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-4 rounded bg-blue-500"></div>
              Service Orders
            </div>
          </div>
        </div>
        <div className="relative h-64 w-full">
          {/* Product line */}
          <ul className="absolute inset-0 flex" style={{ "--count": chartData.length - 1 } as React.CSSProperties}>

            {productPoints.slice(1).map((val, i) => (
              <li
                key={`product-${i}`}
                className="w-[calc(100%/var(--count))]"
                style={{
                  "--previous-value": `${productPoints[i]}%`,
                  "--value": `${productPoints[i + 1]}%`,
                  backgroundColor: "#F97316",
                  clipPath: "polygon(0 calc(100% - var(--previous-value)), 100% calc(100% - var(--value)), 100% calc(100% - var(--value) + 2px), 0 calc(100% - var(--previous-value) + 2px))",
                } as React.CSSProperties}
              />
            ))}
          </ul>
          {/* Service line */}
          <ul className="absolute inset-0 flex" style={{ "--count": chartData.length - 1 } as React.CSSProperties}>
            {servicePoints.slice(1).map((val, i) => (
              <li
                key={`service-${i}`}
                className="w-[calc(100%/var(--count))]"
                style={{
                  "--previous-value": `${servicePoints[i]}%`,
                  "--value": `${servicePoints[i + 1]}%`,
                  backgroundColor: "#3B82F6",
                  clipPath: "polygon(0 calc(100% - var(--previous-value)), 100% calc(100% - var(--value)), 100% calc(100% - var(--value) + 2px), 0 calc(100% - var(--previous-value) + 2px))",
                } as React.CSSProperties}
              />
            ))}
          </ul>
        </div>
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          {chartData.map((d) => (
            <span key={d.month}>{d.month}</span>
          ))}
        </div>
      </div>
    </div>
  );
}