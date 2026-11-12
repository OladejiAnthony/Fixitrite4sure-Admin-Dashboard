"use client";

import { useEcommerceItem } from "@/hooks/use-admin-ecommerce";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface OrderItem {
  id: string;
  productId: string | null;
  productName: string;
  variant?: string;
  quantity: number;
  unitPrice: number;
  storeId: string;
  storeName: string;
  fulfilmentStatus: string;
  shippedAt?: string;
  deliveredAt?: string;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  orderDate: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  paidDate?: string;
  shippingStatus: string;
  storeName: string;
  storesId?: string;
  transactionId?: string;
  quantity: number;
  shippingDate?: string;
  deliveryDate?: string;
  items: OrderItem[];
}

const naira = (n: number) => `₦${(n || 0).toLocaleString("en-US")}`;

function Field({
  label,
  value,
  badge,
  className,
}: {
  label: string;
  value: React.ReactNode;
  badge?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-xs font-medium text-gray-500">{label}:</label>
      <p
        className={
          badge
            ? `inline-block rounded px-2 py-1 text-sm ${badge}`
            : "break-all text-sm text-gray-900"
        }
      >
        {value || "N/A"}
      </p>
    </div>
  );
}

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  const { data: order, isLoading, error } = useEcommerceItem<Order>("orders", id);

  const back = (
    <Button
      variant="ghost"
      className="mb-4 p-0 text-sm text-blue-600 hover:text-blue-800"
      onClick={() => router.back()}
    >
      <ArrowLeft className="mr-2 h-4 w-4" /> BACK
    </Button>
  );

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (error || !order)
    return (
      <div className="p-6">
        {back}
        <p className="text-sm text-red-600">
          Could not load order: {(error as Error)?.message ?? "Not found"}
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-white p-6">
      {back}
      <h1 className="mb-6 text-lg font-semibold text-gray-800">ORDER DETAILS</h1>
      <div className="grid grid-cols-3 gap-4 rounded-lg bg-white p-6 shadow-sm">
        <Field label="Order Id" value={order.id} />
        <Field label="Order Date" value={order.orderDate} />
        <Field label="Order Status" value={order.orderStatus} badge="bg-purple-100 text-purple-800" />
        <Field label="Store Name" value={order.storeName} />
        <Field label="Store's Id" value={order.storesId} />
        <Field label="Quantity" value={String(order.quantity)} badge="bg-blue-100 text-blue-800" />
        <Field label="Transaction Id" value={order.transactionId} />
        <Field label="Paid Date" value={order.paidDate} />
        <Field label="Shipping Status" value={order.shippingStatus} badge="bg-blue-100 text-blue-800" />
        <Field label="Shipping Date" value={order.shippingDate} badge="bg-blue-100 text-blue-800" />
        <Field label="Delivery Date" value={order.deliveryDate} />

        <div className="col-span-3 border-t pt-4">
          <label className="text-xs font-medium text-gray-500">Items:</label>
          <Table className="mt-2">
            <TableHeader>
              <TableRow className="bg-[#CEE0FC] hover:bg-[#CEE0FC]">
                <TableHead className="text-xs uppercase text-gray-900">Product</TableHead>
                <TableHead className="text-xs uppercase text-gray-900">Store</TableHead>
                <TableHead className="text-xs uppercase text-gray-900">Qty</TableHead>
                <TableHead className="text-xs uppercase text-gray-900">Unit Price</TableHead>
                <TableHead className="text-xs uppercase text-gray-900">Subtotal</TableHead>
                <TableHead className="text-xs uppercase text-gray-900">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow
                  key={item.id}
                  className={item.productId ? "cursor-pointer hover:bg-gray-50" : undefined}
                  onClick={() =>
                    item.productId && router.push(`/e-commerce/product/${item.productId}`)
                  }
                >
                  <TableCell className="text-sm">
                    {item.productName}
                    {item.variant ? ` (${item.variant})` : ""}
                  </TableCell>
                  <TableCell className="text-sm">{item.storeName}</TableCell>
                  <TableCell className="text-sm">{item.quantity}</TableCell>
                  <TableCell className="text-sm">{naira(item.unitPrice)}</TableCell>
                  <TableCell className="text-sm">{naira(item.unitPrice * item.quantity)}</TableCell>
                  <TableCell className="text-sm">{item.fulfilmentStatus}</TableCell>
                </TableRow>
              ))}
              {order.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-gray-500">
                    No items on this order.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="col-span-3 border-t pt-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Field label="Customer Name" value={order.customerName} />
              <Field label="Customer Email" value={order.customerEmail} />
              <Field label="Customer Phone" value={order.customerPhone} />
              <Field label="Delivery Address" value={order.customerAddress} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Total Price:</label>
              <p className="text-xl font-bold text-orange-600">{naira(order.totalAmount)}</p>
              <Field
                className="mt-2"
                label="Payment Status"
                value={order.paymentStatus}
                badge="bg-green-100 text-green-800"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
