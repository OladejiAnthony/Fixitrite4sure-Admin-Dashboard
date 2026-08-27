// app\(dashboard)\advertisement-banners\[id]\page.tsx
"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { format } from "date-fns";
import { ChevronLeft } from "lucide-react";
import { useAdvert } from "@/hooks/use-advert";

const reasonSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
});
type ReasonForm = z.infer<typeof reasonSchema>;

type AdvertDetails = {
  id: string;
  created_at: string;
  caption: string | null;
  media_url: string;
  media_type: "image" | "video";
  review_status: "pending" | "approved" | "rejected";
  review_reason: string | null;
  author: { first_name: string | null; last_name: string | null; email: string | null } | null;
  tier: { label: string; amount: number; currency: string } | null;
  transaction: {
    status: "pending" | "successful" | "failed" | "abandoned";
    amount: number;
    currency: string;
    flutterwave_tx_ref: string;
    flutterwave_transaction_id: string | null;
  } | null;
};

const STATUS_LABEL: Record<AdvertDetails["review_status"], string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const STATUS_COLOR: Record<AdvertDetails["review_status"], string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function AdvertDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const advertId = params?.id as string;
  const [showRejectForm, setShowRejectForm] = useState(false);

  const { data: advert, isLoading } = useAdvert(advertId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReasonForm>({ resolver: zodResolver(reasonSchema) });

  const reviewMutation = useMutation({
    mutationFn: async (payload: { review_status: "approved" | "rejected"; review_reason?: string }) => {
      const res = await fetch(`/api/admin/adverts/${advertId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update advert");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advert", advertId] });
      queryClient.invalidateQueries({ queryKey: ["adverts"] });
      setShowRejectForm(false);
    },
  });

  const onReject = (data: ReasonForm) => {
    reviewMutation.mutate({ review_status: "rejected", review_reason: data.reason });
  };

  if (isLoading) {
    return <div className="p-6 text-gray-600">Loading advert details...</div>;
  }

  if (!advert) {
    return <div className="p-6 text-red-500">Advert not found.</div>;
  }

  const a = advert as AdvertDetails;
  const advertiser = [a.author?.first_name, a.author?.last_name].filter(Boolean).join(" ") || "Unknown advertiser";

  return (
    <div className="w-full px-6 py-8">
      {/* Page Title with Back Button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
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

        <div className="flex gap-4 mb-4">
          <div className="flex-shrink-0">
            {a.media_type === "video" ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video
                src={a.media_url}
                controls
                className="rounded-md w-[300px] h-[200px] object-cover bg-black"
              />
            ) : (
              <Image
                src={a.media_url}
                alt="Advert"
                width={300}
                height={200}
                className="rounded-md object-cover"
              />
            )}
          </div>
          {a.caption && (
            <p className="text-xs leading-relaxed text-gray-600 max-w-2xl">
              {a.caption}
            </p>
          )}
        </div>

        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[a.review_status]}`}
        >
          {STATUS_LABEL[a.review_status]}
        </span>
        {a.review_status === "rejected" && a.review_reason && (
          <p className="mt-3 text-xs text-gray-600">
            <span className="font-medium">Reason: </span>
            {a.review_reason}
          </p>
        )}

        {a.review_status === "pending" && (
          <>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => reviewMutation.mutate({ review_status: "approved" })}
                disabled={reviewMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-medium rounded disabled:opacity-50"
              >
                Approve advert
              </button>
              <button
                onClick={() => setShowRejectForm((v) => !v)}
                disabled={reviewMutation.isPending}
                className="text-blue-600 border border-blue-600 hover:bg-blue-50 px-4 py-2 text-xs font-medium rounded disabled:opacity-50"
              >
                Reject advert
              </button>
            </div>

            {showRejectForm && (
              <form onSubmit={handleSubmit(onReject)} className="mt-4">
                <textarea
                  {...register("reason")}
                  placeholder="Enter the reason for rejection"
                  className="block w-full max-w-2xl border border-gray-300 rounded-md shadow-sm p-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-[66px]"
                />
                {errors.reason && (
                  <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
                )}
                <button
                  type="submit"
                  disabled={reviewMutation.isPending}
                  className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs font-medium rounded disabled:opacity-50"
                >
                  Submit rejection
                </button>
              </form>
            )}
          </>
        )}
      </div>

      {/* Advert Details Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-sm font-medium text-gray-700 mb-4 uppercase">
          Advert Details
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Advertiser</span>
            <span className="font-medium text-gray-800">{advertiser}</span>
          </div>
          {a.author?.email && (
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="font-medium text-gray-800">{a.author.email}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500">Date and Time</span>
            <span className="font-medium text-gray-800">
              {format(new Date(a.created_at), "dd-MM-yyyy HH:mm:ss")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Tier</span>
            <span className="font-medium text-gray-800">{a.tier?.label ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Amount Paid</span>
            <span className="font-medium text-gray-800">
              {a.transaction
                ? `${a.transaction.currency} ${a.transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : a.tier
                ? `${a.tier.currency} ${a.tier.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Payment Status</span>
            <span className="font-medium text-gray-800">{a.transaction?.status ?? "—"}</span>
          </div>
          {a.transaction?.flutterwave_tx_ref && (
            <div className="flex justify-between">
              <span className="text-gray-500">Flutterwave Ref</span>
              <span className="font-medium text-gray-800">{a.transaction.flutterwave_tx_ref}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
