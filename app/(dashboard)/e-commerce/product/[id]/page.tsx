//app\(dashboard)\e-commerce\product\[id]\page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface Product {
    id: string;
    productName: string;
    category: string;
    quantity: number;
    price: number;
    status: string;
    storeId: string;
    dateAdded: string;
}

const fetchProduct = async (id: string): Promise<Product> => {
    const { data } = await apiClient.get(`/products/${id}`);
    return data;
};

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = React.use(params); // Unwrap the Promise with React.use()

    const { data: product } = useQuery<Product>({
        queryKey: ["product", id],
        queryFn: () => fetchProduct(id),
    });

    if (!product) return <div className="p-6">Loading...</div>;

    return (
        <div className="min-h-screen bg-white p-6">
            <Button
                variant="ghost"
                className="mb-4 p-0 text-sm text-blue-600 hover:text-blue-800"
                onClick={() => router.back()}
            >
                <ArrowLeft className="mr-2 h-4 w-4" /> BACK
            </Button>
            <h1 className="mb-6 text-lg font-semibold text-gray-800">PRODUCT DETAILS</h1>
            <div className="grid grid-cols-3 gap-4 rounded-lg bg-white p-6 shadow-sm">
                <div>
                    <label className="text-xs font-medium text-gray-500">Product Id:</label>
                    <p className="text-sm text-gray-900">{product.id}</p>
                </div>
                <div>
                    <label className="text-xs font-medium text-gray-500">Product Name:</label>
                    <p className="text-sm text-gray-900">{product.productName}</p>
                </div>
                <div>
                    <label className="text-xs font-medium text-gray-500">Category:</label>
                    <p className="text-sm text-gray-900">{product.category}</p>
                </div>
                <div>
                    <label className="text-xs font-medium text-gray-500">Quantity:</label>
                    <p className="rounded bg-blue-100 px-2 py-1 text-sm text-blue-800 inline-block">{product.quantity}</p>
                </div>
                <div>
                    <label className="text-xs font-medium text-gray-500">Price:</label>
                    <p className="text-xl font-bold text-orange-600">&#8358;{product.price.toLocaleString("en-US")}</p>
                </div>
                <div>
                    <label className="text-xs font-medium text-gray-500">Status:</label>
                    <p className="rounded bg-green-100 px-2 py-1 text-sm text-green-800 inline-block">{product.status}</p>
                </div>
                <div>
                    <label className="text-xs font-medium text-gray-500">Store Id:</label>
                    <p className="text-sm text-gray-900">{product.storeId}</p>
                </div>
                <div>
                    <label className="text-xs font-medium text-gray-500">Date Added:</label>
                    <p className="text-sm text-gray-900">{product.dateAdded}</p>
                </div>
            </div>
        </div>
    );
}