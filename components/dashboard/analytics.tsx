//components/dashboard/analytics.tsx
// components/dashboard/analytics.tsx
"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { apiClient } from "@/lib/api-client";
import { Users, Building2, Store, ShoppingBag, Wrench } from "lucide-react";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

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
  const months = chartData.map((d) => d.month);

  const series = [
    {
      name: "Service order",
      data: chartData.map((d) => d.service),
      color: "#3B82F6",
    },
    {
      name: "Product order",
      data: chartData.map((d) => d.product),
      color: "#F97316",
    },
  ];

  const options = {
    chart: {
      type: 'line' as 'line' | 'area' | 'bar' | 'pie' | 'donut' | 'radialBar' | 'scatter' | 'bubble' | 'heatmap' | 'candlestick' | 'boxPlot' | 'radar' | 'polarArea' | 'rangeBar' | 'rangeArea' | 'treemap',
      height: "100%",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    stroke: {
      curve: 'smooth' as "smooth" | "straight" | "stepline" | "linestep" | "monotoneCubic",
      width: 3,
    },
    xaxis: {
      categories: months,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
          fontFamily: "inherit",
          fontWeight: 400,
        },
      },
    },
    yaxis: {
      show: false,
    },
    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 0,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
      padding: {
        top: 0,
        right: 20,
        bottom: 0,
        left: 110, // Adjusted for left labels space
      },
    },
    markers: {
      size: 0,
    },
    legend: {
      show: false,
    },
    tooltip: {
      enabled: true,
      style: {
        fontSize: "12px",
        fontFamily: "inherit",
      },
    },
    annotations: {
      texts: [
        {
          x: 0,  // Use index instead of month string
          y: chartData[0].service,
          text: "Service order",
          foreColor: "#3B82F6",
          fontSize: "13px",
          fontFamily: "inherit",
          fontWeight: 500,
          textAnchor: "end",
          offsetX: 0,
          offsetY: 4,
        },
        {
          x: 0,  // Use index instead of month string
          y: chartData[0].product,
          text: "Product order",
          foreColor: "#F97316",
          fontSize: "13px",
          fontFamily: "inherit",
          fontWeight: 500,
          textAnchor: "end",
          offsetX: 0,
          offsetY: 4,
        },
      ],
      points: [
        {
          x: 6,  // Use index instead of month string
          y: chartData[6].product,
          marker: {
            size: 5,
            fillColor: "#F97316",
            strokeWidth: 0,
            shape: "circle",
            radius: 5,
          },
        },
      ],
    }

  };


  return (
    <div className="min-h-screen p-6 text-white">
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
          <div className="text-sm text-gray-500">
            From {chartData[0].month} · To {chartData[chartData.length - 1].month} ·
          </div>
        </div>
        <div className="relative h-64 w-full">
          <Chart options={options} series={series} type="line" width="100%" height="100%" />
        </div>
      </div>
    </div>
  );
}


