//app/(dashboard)/content-management/[id]/page.tsx
"use client";
import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useContentPost } from "@/hooks/use-content-post";

interface ContentItem {
  id: string;
  created_at: string;
  caption: string | null;
  media_url: string;
  media_type: "image" | "video";
  review_status: "approved" | "pending" | "rejected";
  review_reason: string | null;
  author: { first_name: string | null; last_name: string | null } | null;
}

function postedByName(item: ContentItem): string {
  const name = [item.author?.first_name, item.author?.last_name]
    .filter(Boolean)
    .join(" ");
  return name || "Unknown";
}

const reasonSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
});

type ReasonForm = z.infer<typeof reasonSchema>;

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day} - ${month} - ${year}`;
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

function getDisplayStatus(status: string): string {
  if (status === "rejected") return "Disapproved";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getStatusColor(status: string): string {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function ContentManagementDetail() {
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const [showRejectForm, setShowRejectForm] = useState(false);

  const { data, isLoading, error } = useContentPost(id);
  const content = data as ContentItem | undefined;

  const reviewMutation = useMutation({
    mutationFn: async (payload: {
      review_status: "approved" | "rejected";
      review_reason?: string;
    }) => {
      const res = await fetch(`/api/admin/content/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update content");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-post", id] });
      queryClient.invalidateQueries({ queryKey: ["content-posts"] });
      setShowRejectForm(false);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReasonForm>({
    resolver: zodResolver(reasonSchema),
  });

  const onReject = (data: ReasonForm) => {
    reviewMutation.mutate({ review_status: "rejected", review_reason: data.reason });
  };

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (error || !content)
    return <div className="p-6">Error loading content</div>;

  return (
    <div className="p-6 bg-white min-h-screen">
      <h1 className="text-xl font-semibold text-gray-900 mb-4">
        Content Management
      </h1>

      <div className="bg-white  p-4 mb-6">
        <h2 className="text-base font-medium text-gray-900 mb-4">
          Content Posted
        </h2>
        <div className="flex gap-4">
          {content.media_type === "video" ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video
              src={content.media_url}
              controls
              className="w-[360px] h-[200px] object-cover bg-black"
            />
          ) : (
            <img
              src={content.media_url}
              alt="Content image"
              className="w-[360px] h-[200px] object-cover"
            />
          )}
          <p className="text-sm text-gray-600 leading-5 flex-1">
            {content.caption || "No content text available"}
          </p>
        </div>
        {content.review_status === "pending" && (
          <>
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => reviewMutation.mutate({ review_status: "approved" })}
                className="bg-blue-500 text-white px-6 py-2 text-sm font-medium rounded-md hover:bg-blue-600"
                disabled={reviewMutation.isPending}
              >
                Approve content
              </button>
              <button
                onClick={() => setShowRejectForm((v) => !v)}
                className="border border-blue-500 text-blue-500 px-6 py-2 text-sm font-medium rounded-md hover:bg-blue-50"
                disabled={reviewMutation.isPending}
              >
                Disapprove content
              </button>
            </div>

            {showRejectForm && (
              <form onSubmit={handleSubmit(onReject)} className="mt-4">
                <textarea
                  {...register("reason")}
                  placeholder="Enter the reason for disapproval"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-[66px]"
                />
                {errors.reason && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.reason.message}
                  </p>
                )}
                <button
                  type="submit"
                  className="mt-2 bg-blue-500 text-white px-4 py-2 text-sm font-medium rounded-md self-end hover:bg-blue-600"
                  disabled={reviewMutation.isPending}
                >
                  Submit
                </button>
              </form>
            )}
          </>
        )}
      </div>

      <div className="bg-white  p-4">
        <div className="bg-[#D1D8E233] p-4 rounded-md mb-4">
          <h2 className="text-base font-medium text-gray-900 mb-4">
            CONTENT DETAILS
          </h2>
        </div>
        <dl className="grid grid-cols-1 gap-y-2 text-sm w-[50%]">
          <div className="flex justify-between">
            <dt className="font-medium text-gray-700">Posted by</dt>
            <dd className="text-gray-900">{postedByName(content)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium text-gray-700">Date and Time</dt>
            <dd className="text-gray-900">
              {formatDate(content.created_at)} {formatTime(content.created_at)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium text-gray-700">Status</dt>
            <dd className="text-gray-900">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  content.review_status
                )}`}
              >
                {getDisplayStatus(content.review_status)}
              </span>
            </dd>
          </div>
        </dl>
        {content.review_status === "rejected" && content.review_reason && (
          <div className="mt-6">
            <div className="bg-[#D1D8E233] p-4 rounded-md mb-4">
              <h2 className="text-sm font-medium text-gray-700">
                REASON FOR DISAPPROVAL
              </h2>
            </div>
            <div className="mt-1 block w-full  p-2 text-sm text-gray-900 bg-gray-50 h-[66px]">
              {content.review_reason}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-6 border-t border-gray-100 flex items-center justify-between gap-4">
        <div className="text-sm">
          <Link
            href="/content-management"
            className="text-sky-600 hover:underline"
          >
            ← Back to Content Management
          </Link>
        </div>
      </div>
    </div>
  );
}
