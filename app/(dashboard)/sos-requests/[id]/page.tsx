// app/(dashboard)/sos-requests/[id]/page.tsx
"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  displayName,
  formatDateTime,
  type SupportMessage,
  type SupportThread,
} from "@/lib/support-requests";
import {
  SUPPORT_ATTACHMENT_ACCEPT,
  removeSupportAttachment,
  uploadSupportAttachment,
  validateSupportAttachment,
} from "@/lib/support-attachments";
import { MessageMedia } from "@/components/sos/message-media";

// Text is optional when an attachment is picked; that pairing is checked in
// the submit handler since the file lives outside the form.
const replySchema = z.object({
  body: z.string().trim().max(4000),
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
    // Picks up new messages from the user.
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onPickFile = (picked: File | undefined) => {
    if (!picked) return;
    const invalid = validateSupportAttachment(picked);
    setFileError(invalid);
    if (invalid) {
      clearFile();
      return;
    }
    setFile(picked);
  };

  const replyMutation = useMutation({
    mutationFn: async ({ body, attachment }: { body: string; attachment: File | null }) => {
      const media = attachment ? await uploadSupportAttachment(attachment) : undefined;
      const res = await fetch(`/api/admin/support-requests/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, media }),
      });
      if (!res.ok) {
        if (media) await removeSupportAttachment(media.path);
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to send reply");
      }
      return res.json();
    },
    onSuccess: () => {
      reset({ body: "" });
      clearFile();
      queryClient.invalidateQueries({ queryKey: ["support-request", id] });
      queryClient.invalidateQueries({ queryKey: ["support-requests"] });
    },
  });

  const canSend = !!draft?.trim() || !!file;
  const onSubmit = handleSubmit(({ body }) => {
    if (!canSend || replyMutation.isPending) return;
    replyMutation.mutate({ body: body.trim(), attachment: file });
  });

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
      <div className="text-sm">
        <Link href="/sos-requests" className="text-sky-600 hover:underline">
          ← Request Overview
        </Link>
      </div>

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

                  <MessageMedia message={m} />

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
          {file && previewUrl && (
            <div className="relative mb-3 inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Attachment preview" className="h-24 rounded border" />
              <button
                type="button"
                onClick={clearFile}
                disabled={replyMutation.isPending}
                aria-label="Remove attachment"
                className="absolute -right-2 -top-2 rounded-full bg-gray-800 p-1 text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={SUPPORT_ATTACHMENT_ACCEPT}
            className="hidden"
            onChange={(e) => onPickFile(e.target.files?.[0])}
          />
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
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={replyMutation.isPending}
              >
                <Paperclip className="mr-1 h-4 w-4" />
                Photo
              </Button>
              <p className="text-xs text-gray-500">
                The user sees this from &quot;FixIt Support&quot; and gets a
                notification.
              </p>
            </div>
            <Button
              type="submit"
              className="bg-[#0586CF] text-white"
              disabled={replyMutation.isPending || !canSend}
            >
              {replyMutation.isPending
                ? file
                  ? "Uploading..."
                  : "Sending..."
                : "Send reply"}
            </Button>
          </div>
          {fileError && <p className="mt-2 text-sm text-red-600">{fileError}</p>}
          {replyMutation.error && (
            <p className="mt-2 text-sm text-red-600">
              {(replyMutation.error as Error).message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
