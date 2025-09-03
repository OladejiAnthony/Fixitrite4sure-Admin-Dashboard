"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface Order {
  id: string;
  customerName: string;
  orderDate: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  shippingStatus: string;
  store: string;
  storesId?: string;
  storeName?: string;
  vendor?: string;
  transactionId?: string;
  serviceProvider?: string;
  shipmentId?: string;
  quantity?: number;
  productStatus?: string;
  productId?: string;
  productName?: string;
  shippingDate?: string;
  deliveryDate?: string;
  customerAddress?: string;
  totalPrice?: number;
}

const fetchOrder = async (id: string): Promise<Order> => {
  const { data } = await apiClient.get(`/orders/${id}`);
  return data;
};

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params); // Unwrap the Promise with React.use()

  const { data: order } = useQuery<Order>({
    queryKey: ["order", id],
    queryFn: () => fetchOrder(id),
  });

  if (!order) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-white p-6">
      <Button
        variant="ghost"
        className="mb-4 p-0 text-sm text-blue-600 hover:text-blue-800"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> BACK
      </Button>
      <h1 className="mb-6 text-lg font-semibold text-gray-800">ORDER DETAILS</h1>
      <div className="grid grid-cols-3 gap-4 rounded-lg bg-white p-6 shadow-sm">
        <div>
          <label className="text-xs font-medium text-gray-500">Order Id:</label>
          <p className="text-sm text-gray-900">{order.id}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500">Store's Id:</label>
          <p className="text-sm text-gray-900">{order.storesId || "N/A"}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500">Service Provider:</label>
          <p className="text-sm text-gray-900">{order.serviceProvider || "N/A"}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500">Order Date:</label>
          <p className="text-sm text-gray-900">{order.orderDate}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500">Store Name:</label>
          <p className="text-sm text-gray-900">{order.storeName || order.store}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500">Shipment Id:</label>
          <p className="text-sm text-gray-900">{order.shipmentId || "N/A"}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500">Quantity:</label>
          <p className="rounded bg-blue-100 px-2 py-1 text-sm text-blue-800 inline-block">{order.quantity || 0}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500">Vendor:</label>
          <p className="text-sm text-gray-900">{order.vendor || "N/A"}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500">Shipping Date:</label>
          <p className="rounded bg-blue-100 px-2 py-1 text-sm text-blue-800 inline-block">{order.shippingDate || "N/A"}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500">Product Status:</label>
          <p className="rounded bg-green-100 px-2 py-1 text-sm text-green-800 inline-block">{order.productStatus || "N/A"}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500">Transaction Id:</label>
          <p className="text-sm text-gray-900">{order.transactionId || "N/A"}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500">Shipping Status:</label>
          <p className="rounded bg-blue-100 px-2 py-1 text-sm text-blue-800 inline-block">{order.shippingStatus}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500">Product Id:</label>
          <p className="text-sm text-gray-900">{order.productId || "N/A"}</p>
        </div>
        <div className="col-span-2">
          <label className="text-xs font-medium text-gray-500">Product Name:</label>
          <p className="text-sm text-gray-900">{order.productName || "N/A"}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500">Delivery Date:</label>
          <p className="text-sm text-gray-900">{order.deliveryDate || "N/A"}</p>
        </div>
        <div className="col-span-3 border-t pt-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-500">Customer Name:</label>
              <p className="text-sm text-gray-900">{order.customerName}</p>
              <label className="mt-2 text-xs font-medium text-gray-500">Customer Address:</label>
              <p className="text-sm text-gray-900">{order.customerAddress || "N/A"}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Total Price:</label>
              <p className="text-xl font-bold text-orange-600">&#8358;{(order.totalPrice || order.totalAmount).toLocaleString("en-US")}</p>
              <label className="mt-2 text-xs font-medium text-gray-500">Payment Status:</label>
              <p className="rounded bg-green-100 px-2 py-1 text-sm text-green-800 inline-block">{order.paymentStatus}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
