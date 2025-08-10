//app/(dashboard)/news/[id]\page.tsx
"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { apiClient } from "@/lib/api-client";
import Image from "next/image";
import { useForm } from "react-hook-form";
import Link from "next/link";

const newsItemSchema = z.object({
  id: z.union([z.string(), z.number()]),
  title: z.string(),
  postedBy: z.string(),
  dateTime: z.string(),
  body: z.string().optional(),
  imageUrl: z.string().optional(),
  analytics: z
    .object({
      openedNewsletter: z.number().optional(),
      clickedLink: z.number().optional(),
      didNotOpen: z.number().optional(),
    })
    .optional(),
});

type NewsItem = z.infer<typeof newsItemSchema>;

function formatNumber(n?: number) {
  if (n === undefined || n === null) return "-";
  return n.toLocaleString("en-US");
}

function formatDate(dt?: string) {
  if (!dt) return "";
  try {
    const d = new Date(dt);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day} - ${month} - ${year}`;
  } catch {
    return dt;
  }
}

export default function NewsDetailsPage() {
  const params = useParams() as { id?: string };
  console.log("Route params:", params); // Debug what's being received

  const id = params?.id;
  const router = useRouter();

  const { data, isLoading, isError, error } = useQuery<NewsItem>({
    queryKey: ["news", params.id],
    queryFn: async () => {
      try {
        const res = await apiClient.get(`/news/${params.id}`);
        if (!res.data) throw new Error("Not found");
        return newsItemSchema.parse(res.data);
      } catch (err) {
        console.error("API error:", err);
        throw err;
      }
    },
  });

  if (isError) {
    console.error("Query error:", error);
  }

  const { register, handleSubmit, reset } = useForm<{ note: string }>();
  const onSubmit = (vals: { note: string }) => {
    alert("Note saved locally: " + vals.note);
    reset();
  };

  return (
    <div className="p-6">
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* Header bar */}
        {/* <div className="px-6 py-4 border-b border-gray-100 bg-white/60">
          <h2 className="text-lg font-semibold tracking-wide text-slate-800">
            NEWS CONTENT DETAILS
          </h2>
        </div> */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
          <h4 className="text-xs font-semibold text-slate-700">NEWS CONTENT</h4>
        </div>

        <div className="px-6 py-6">
          <div className="flex gap-6">
            {/* Left image block */}
            <div className="w-[180px] flex-shrink-0">
              <div className="rounded-sm overflow-hidden border border-gray-100">
                {data?.imageUrl ? (
                  <Image
                    src={data.imageUrl}
                    alt={data.title ?? "news image"}
                    width={220}
                    height={180}
                    className="object-cover w-[220px] h-[180px]"
                  />
                ) : (
                  <div className="w-[220px] h-[180px] bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
                    No image
                  </div>
                )}
              </div>
            </div>

            {/* Right body text */}
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-800 mb-2 leading-[18px] uppercase">
                {data?.title ?? "TAKE IT ON"}
              </h3>
              <p
                className="text-[13px] leading-[18px] text-slate-700 uppercase"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {isLoading && "Loading news content..."}
                {isError && "Error loading content."}
                {!isLoading &&
                  !isError &&
                  (data?.body ?? "No body content available.")}
              </p>

              {/* small metadata beneath */}
              <div className="mt-4 flex items-center text-xs text-gray-500 gap-4">
                <div>
                  <span className="font-medium text-slate-600">
                    {data?.postedBy ?? "Seye Mangi"}
                  </span>
                </div>
                <div>•</div>
                <div>{data?.dateTime ? formatDate(data.dateTime) : ""}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics section */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
          <h4 className="text-xs font-semibold text-slate-700">
            NEWS ANALYTICS
          </h4>
        </div>

        <div className="px-6 py-6">
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-start">
              <div className="w-[160px] text-sm font-bold text-slate-800">
                {formatNumber(data?.analytics?.openedNewsletter)}
              </div>
              <div className="flex-1 text-sm text-slate-700">
                Opened Newsletter
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-[160px] text-sm font-bold text-slate-800">
                {formatNumber(data?.analytics?.clickedLink)}
              </div>
              <div className="flex-1 text-sm text-slate-700">Clicked link</div>
            </div>

            <div className="flex items-start">
              <div className="w-[160px] text-sm font-bold text-slate-800">
                {formatNumber(data?.analytics?.didNotOpen)}
              </div>
              <div className="flex-1 text-sm text-slate-700">
                Did not open newsletter
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-6 border-t border-gray-100 flex items-center justify-between gap-4">
          <div className="text-sm">
            <Link href="/news" className="text-sky-600 hover:underline">
              ← Back to articles
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
