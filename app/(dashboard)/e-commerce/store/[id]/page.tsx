//app\(dashboard)\e-commerce\store\[id]\page.tsx
"use client";

import { useEcommerceItem } from "@/hooks/use-admin-ecommerce";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface Store {
  id: string;
  storeName: string;
  storeType: string;
  ownerName: string;
  email?: string;
  phone?: string;
  verificationStatus: string;
  totalProducts: number;
  activeProducts: number;
  rating: number | null;
  reviewCount: number;
  lastOrderDate: string;
  totalOrders: number;
  itemsSold: number;
  totalSales: number;
  status: string;
  location: string;
  joinedDate?: string;
}

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
        {value ?? "N/A"}
      </p>
    </div>
  );
}

export default function StoreDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  const { data: store, isLoading, error } = useEcommerceItem<Store>("stores", id);

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
  if (error || !store)
    return (
      <div className="p-6">
        {back}
        <p className="text-sm text-red-600">
          Could not load store: {(error as Error)?.message ?? "Not found"}
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-white p-6">
      {back}
      <h1 className="mb-6 text-lg font-semibold text-gray-800">STORE DETAILS</h1>
      <div className="grid grid-cols-3 gap-4 rounded-lg bg-white p-6 shadow-sm">
        <Field label="Store Id" value={store.id} />
        <Field label="Store Name" value={store.storeName} />
        <Field label="Store Type" value={store.storeType} />
        <Field label="Owner" value={store.ownerName} />
        <Field label="Email" value={store.email} />
        <Field label="Phone" value={store.phone} />
        <Field label="Total Products" value={store.totalProducts} badge="bg-blue-100 text-blue-800" />
        <Field label="Active Products" value={store.activeProducts} badge="bg-blue-100 text-blue-800" />
        <Field
          label="Rating"
          value={store.rating !== null ? `${store.rating} (${store.reviewCount} reviews)` : "No reviews"}
        />
        <Field label="Order Items" value={store.totalOrders} />
        <Field label="Items Sold" value={store.itemsSold} />
        <Field
          label="Total Sales"
          value={`₦${store.totalSales.toLocaleString("en-US")}`}
        />
        <Field label="Last Order Date" value={store.lastOrderDate} />
        <Field label="Status" value={store.status} badge="bg-green-100 text-green-800" />
        <Field label="Verification" value={store.verificationStatus} />
        <Field label="Joined" value={store.joinedDate} />
        <Field className="col-span-2" label="Location" value={store.location} />
      </div>
    </div>
  );
}
