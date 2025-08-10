// app\(dashboard)\advertisement-banners\[id]\page.tsx
"use client";

import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiClient } from "@/lib/api-client";
import Image from "next/image";
import { format } from "date-fns";
import { ChevronLeft } from "lucide-react";

const statusSchema = z.object({
  status: z.enum(["Approved", "Rejected"]), // Changed from "Disapproved" to match your list
});

type StatusFormData = z.infer<typeof statusSchema>;

type AdvertDetails = {
  id: number;
  dateTime: string;
  advertiser: string;
  category: string;
  amountPaid: number;
  status: "Pending" | "Approved" | "Rejected";
  imageUrl?: string; // Make optional if not all adverts have images
  content?: string; // Make optional
};

export default function AdvertDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const advertId = params?.id;

  const { register, handleSubmit } = useForm<StatusFormData>({
    resolver: zodResolver(statusSchema),
  });

  // Fetch single advert data
  const { data: advert, isLoading } = useQuery<AdvertDetails>({
    queryKey: ["advert", advertId],
    queryFn: async () => {
      const res = await apiClient.get(`/adverts/${advertId}`);
      return res.data;
    },
    enabled: !!advertId,
  });

  // Mutation for updating status
  const mutation = useMutation({
    mutationFn: async (newStatus: "Approved" | "Rejected") => {
      await apiClient.patch(`/adverts/${advertId}`, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advert", advertId] });
      queryClient.invalidateQueries({ queryKey: ["adverts"] });
    },
  });

  const handleStatusChange = (newStatus: "Approved" | "Rejected") => {
    mutation.mutate(newStatus);
  };

  if (isLoading) {
    return <div className="p-6 text-gray-600">Loading advert details...</div>;
  }

  if (!advert) {
    return <div className="p-6 text-red-500">Advert not found.</div>;
  }

  return (
    <div className="w-full px-6 py-8">
      {/* Page Title with Back Button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()} // This will navigate to the previous page
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <h1 className="text-lg font-semibold text-gray-800 uppercase tracking-wide">
          Adverts and Banner
        </h1>
      </div>

      {/* Ad Content Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-4 uppercase">
          Advert Content
        </h2>

        {advert.imageUrl && (
          <div className="flex gap-4 mb-4">
            <div className="flex-shrink-0">
              <Image
                src={advert.imageUrl}
                alt="Advert"
                width={300}
                height={200}
                className="rounded-md object-cover"
              />
            </div>
            {advert.content && (
              <p className="text-xs leading-relaxed text-gray-600 max-w-2xl">
                {advert.content}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => handleStatusChange("Approved")}
            disabled={advert.status === "Approved"}
            className={`px-4 py-2 text-xs font-medium text-white rounded ${
              advert.status === "Approved"
                ? "bg-green-500"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {advert.status === "Approved" ? "Approved" : "Approve advert"}
          </button>
          <button
            onClick={() => handleStatusChange("Rejected")}
            disabled={advert.status === "Rejected"}
            className={`px-4 py-2 text-xs font-medium rounded ${
              advert.status === "Rejected"
                ? "bg-red-500 text-white"
                : "text-blue-600 border border-blue-600 hover:bg-blue-50"
            }`}
          >
            {advert.status === "Rejected" ? "Rejected" : "Reject advert"}
          </button>
        </div>
      </div>

      {/* Advert Details Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-sm font-medium text-gray-700 mb-4 uppercase">
          Advert Details
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Advertiser</span>
            <span className="font-medium text-gray-800">
              {advert.advertiser}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Date and Time</span>
            <span className="font-medium text-gray-800">
              {format(new Date(advert.dateTime), "dd-MM-yyyy HH:mm:ss")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Category</span>
            <span className="font-medium text-gray-800">{advert.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Status</span>
            <span className="font-medium text-gray-800">{advert.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Amount Paid</span>
            <span className="font-medium text-gray-800">
              ${advert.amountPaid.toFixed(3)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
