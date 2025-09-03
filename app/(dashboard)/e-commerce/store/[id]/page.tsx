//app\(dashboard)\e-commerce\store\[id]\page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface Store {
    id: string;
    storeName: string;
    totalProducts: number;
    rating: number;
    lastOrderDate: string;
    status: string;
    location: string;
}

const fetchStore = async (id: string): Promise<Store> => {
    const { data } = await apiClient.get(`/stores/${id}`);
    return data;
};

export default function StoreDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = React.use(params); // Unwrap the Promise with React.use()

    const { data: store } = useQuery<Store>({
        queryKey: ["store", id],
        queryFn: () => fetchStore(id),
    });

    if (!store) return <div className="p-6">Loading...</div>;

    return (
        <div className="min-h-screen bg-white p-6">
            <Button
                variant="ghost"
                className="mb-4 p-0 text-sm text-blue-600 hover:text-blue-800"
                onClick={() => router.back()}
            >
                <ArrowLeft className="mr-2 h-4 w-4" /> BACK
            </Button>
            <h1 className="mb-6 text-lg font-semibold text-gray-800">STORE DETAILS</h1>
            <div className="grid grid-cols-3 gap-4 rounded-lg bg-white p-6 shadow-sm">
                <div>
                    <label className="text-xs font-medium text-gray-500">Store Id:</label>
                    <p className="text-sm text-gray-900">{store.id}</p>
                </div>
                <div>
                    <label className="text-xs font-medium text-gray-500">Store Name:</label>
                    <p className="text-sm text-gray-900">{store.storeName}</p>
                </div>
                <div>
                    <label className="text-xs font-medium text-gray-500">Total Products:</label>
                    <p className="rounded bg-blue-100 px-2 py-1 text-sm text-blue-800 inline-block">{store.totalProducts}</p>
                </div>
                <div>
                    <label className="text-xs font-medium text-gray-500">Rating:</label>
                    <p className="text-sm text-gray-900">{store.rating}</p>
                </div>
                <div>
                    <label className="text-xs font-medium text-gray-500">Last Order Date:</label>
                    <p className="text-sm text-gray-900">{store.lastOrderDate}</p>
                </div>
                <div>
                    <label className="text-xs font-medium text-gray-500">Status:</label>
                    <p className="rounded bg-green-100 px-2 py-1 text-sm text-green-800 inline-block">{store.status}</p>
                </div>
                <div className="col-span-3">
                    <label className="text-xs font-medium text-gray-500">Location:</label>
                    <p className="text-sm text-gray-900">{store.location}</p>
                </div>
            </div>
        </div>
    );
}