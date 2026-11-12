// app/(dashboard)/sos-requests/[id]/page.tsx
"use client";

import { use, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  displayName,
  formatDateTime,
  type SupportMessage,
  type SupportThread,
} from "@/lib/support-requests";

const replySchema = z.object({
  body: z.string().trim().min(1).max(4000),
});
type ReplyForm = z.infer<typeof replySchema>;

interface PageProps {
  params: Promise<{ id: string }>;
}

function senderLabel(message: SupportMessage, userName: string) {
  if (message.from_user) return userName;
  const s = message.sender;
  const name = s ? [s.first_name, s.last_name].filter(Boolean).join(" ") : "";
  return name ? `${name} (Support)` : "FixIt Support";
}

export default function SosDetailsPage({ params }: PageProps) {
  const { id } = use(params);
  const bottomRef = useRef<HTMLDivElement>(null);

  const {
    data: thread,
    isLoading,
    error,
  } = useQuery<SupportThread>({
    queryKey: ["support-request", id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/support-requests/${id}`);
      if (res.status === 404) throw new Error("Request not found");
      if (!res.ok) throw new Error("Failed to load request");
      return res.json();
    },
    // Signed media URLs last an hour; refetching keeps them fresh and picks
    // up new messages.
    refetchInterval: 15_000,
  });

  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    watch,
  } = useForm<ReplyForm>({
    resolver: zodResolver(replySchema),
    defaultValues: { body: "" },
  });
  const draft = watch("body");

  const replyMutation = useMutation({
    mutationFn: async ({ body }: ReplyForm) => {
      const res = await fetch(`/api/admin/support-requests/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to send reply");
      }
      return res.json();
    },
    onSuccess: () => {
      reset({ body: "" });
      queryClient.invalidateQueries({ queryKey: ["support-request", id] });
      queryClient.invalidateQueries({ queryKey: ["support-requests"] });
    },
  });

  const onSubmit = handleSubmit((values) => replyMutation.mutate(values));

  const messageCount = thread?.messages.length ?? 0;
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messageCount]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading request: {(error as Error).message}</div>;
  if (!thread) return <div>Request not found</div>;

  const userName = displayName(thread.user);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        SOS REQUEST MANAGEMENT
      </h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">REQUEST DETAILS</h2>

        <div className="space-y-4">
          <div className="flex items-start">
            <span className="w-48 font-medium">Request ID:</span>
            <span className="font-mono text-sm">{thread.id}</span>
          </div>
          <div className="flex items-start">
            <span className="w-48 font-medium">Name:</span>
            <span>{userName}</span>
          </div>
          <div className="flex items-start">
            <span className="w-48 font-medium">Account type:</span>
            <span className="capitalize">{thread.user?.user_type ?? "-"}</span>
          </div>
          <div className="flex items-start">
            <span className="w-48 font-medium">Phone:</span>
            <span>{thread.user?.phone_number || "-"}</span>
          </div>
          <div className="flex items-start">
            <span className="w-48 font-medium">Email:</span>
            <span>{thread.user?.email || "-"}</span>
          </div>
          <div className="flex items-start">
            <span className="w-48 font-medium">Opened:</span>
            <span>{formatDateTime(thread.created_at)}</span>
          </div>
          <div className="flex items-start">
            <span className="w-48 font-medium">Last activity:</span>
            <span>{formatDateTime(thread.last_message_at)}</span>
          </div>
          <div className="flex items-start">
            <span className="w-48 font-medium">Status:</span>
            <span
              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                thread.awaiting_reply
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {thread.awaiting_reply ? "Awaiting reply" : "Replied"}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">
          CHAT ({thread.messages.length})
        </h2>

        {thread.messages.length === 0 ? (
          <p className="text-sm text-gray-500">No messages yet.</p>
        ) : (
          <div className="max-h-[600px] overflow-y-auto space-y-3 pr-2">
            {thread.messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.from_user ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    m.from_user
                      ? "bg-gray-100 text-gray-900"
                      : "bg-[#0586CF] text-white"
                  }`}
                >
                  <div
                    className={`text-xs mb-1 ${
                      m.from_user ? "text-gray-500" : "text-blue-100"
                    }`}
                  >
                    {senderLabel(m, userName)} · {formatDateTime(m.created_at)}
                  </div>

                  {m.media_url && m.media_type === "image" && (
                    <a href={m.media_url} target="_blank" rel="noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.media_url}
                        alt="Attachment"
                        className="mb-2 max-h-64 rounded"
                      />
                    </a>
                  )}
                  {m.media_url && m.media_type === "video" && (
                    <video
                      src={m.media_url}
                      controls
                      className="mb-2 max-h-64 rounded"
                    />
                  )}
                  {m.media_type && !m.media_url && (
                    <p className="text-xs italic">Attachment unavailable</p>
                  )}

                  {m.body && (
                    <p className="whitespace-pre-wrap break-words text-sm">
                      {m.body}
                    </p>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 border-t border-gray-100 pt-4">
          <Textarea
            {...register("body")}
            rows={3}
            maxLength={4000}
            placeholder="Write a reply. Enter to send, Shift+Enter for a new line."
            disabled={replyMutation.isPending}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSubmit();
              }
            }}
          />
          <div className="mt-2 flex items-center justify-between gap-4">
            <p className="text-xs text-gray-500">
              The user sees this from &quot;FixIt Support&quot; and gets a
              notification.
            </p>
            <Button
              type="submit"
              className="bg-[#0586CF] text-white"
              disabled={replyMutation.isPending || !draft?.trim()}
            >
              {replyMutation.isPending ? "Sending..." : "Send reply"}
            </Button>
          </div>
          {replyMutation.error && (
            <p className="mt-2 text-sm text-red-600">
              {(replyMutation.error as Error).message}
            </p>
          )}
        </form>
      </div>

      <div className="px-6 py-6 mt-10 border-t border-gray-100 flex items-center justify-between gap-4">
        <div className="text-sm">
          <Link href="/sos-requests" className="text-sky-600 hover:underline">
            ← Request Overview
          </Link>
        </div>
      </div>
    </div>
  );
}
