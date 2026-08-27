// app\(dashboard)\advertisement-banners\[id]\page.tsx
"use client";

import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { ChevronLeft } from "lucide-react";
import { useAdvert } from "@/hooks/use-advert";

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
  const advertId = params?.id as string;

  const { data: advert, isLoading } = useAdvert(advertId);

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
        <p className="mt-4 text-xs text-gray-500">
          Approve/reject actions are unavailable until the moderation columns are added to
          bearing_posts in fixit-app-mobile — see the admin-dashboard plan&apos;s Phase B.
        </p>
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
