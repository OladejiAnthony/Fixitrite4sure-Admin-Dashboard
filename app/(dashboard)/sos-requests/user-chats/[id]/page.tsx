// app/(dashboard)/sos-requests/user-chats/[id]/page.tsx
"use client";

import { use, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessageMedia } from "@/components/sos/message-media";
import { ConfirmDeleteDialog } from "@/components/sos/confirm-delete-dialog";
import {
  displayName,
  formatDateTime,
  participantsLabel,
  personName,
  type SupportUser,
  type UserChatMessage,
  type UserChatThread,
} from "@/lib/support-requests";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Read-only view of one direct chat between two users, with delete controls
// for a single message or the whole conversation.
export default function UserChatDetailsPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [messageTarget, setMessageTarget] = useState<UserChatMessage | null>(null);
  const [deleteChatOpen, setDeleteChatOpen] = useState(false);

  const {
    data: thread,
    isLoading,
    error,
  } = useQuery<UserChatThread>({
    queryKey: ["user-chat", id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/user-chats/${id}`);
      if (res.status === 404) throw new Error("Chat not found");
      if (!res.ok) throw new Error("Failed to load chat");
      return res.json();
    },
    refetchInterval: 15_000,
  });

  const deleteMessage = useMutation({
    mutationFn: async (messageId: string) => {
      const res = await fetch(`/api/admin/user-chats/${id}/messages/${messageId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to delete message");
      }
    },
    onSuccess: () => {
      setMessageTarget(null);
      queryClient.invalidateQueries({ queryKey: ["user-chat", id] });
      queryClient.invalidateQueries({ queryKey: ["user-chats"] });
    },
  });

  const deleteChat = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/user-chats/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to delete chat");
      }
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["user-chat", id] });
      queryClient.invalidateQueries({ queryKey: ["user-chats"] });
      router.push("/sos-requests/user-chats");
    },
  });

  const messageCount = thread?.messages.length ?? 0;
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messageCount]);

  if (isLoading) return <div>Loading...</div>;
  if (error) {
    return (
      <div className="space-y-4">
        <Link href="/sos-requests/user-chats" className="text-sm text-sky-600 hover:underline">
          ← User Chats
        </Link>
        <p>Error loading chat: {(error as Error).message}</p>
      </div>
    );
  }
  if (!thread) return <div>Chat not found</div>;

  const participants = thread.participants;
  // The first participant's messages sit on the left, the other's on the right.
  const leftId = participants[0]?.id;
  const byId = new Map<string, SupportUser>(participants.map((p) => [p.id, p]));
  // Prefer the participant record; fall back to the message's own sender
  // embed if that participant row is gone.
  const senderName = (m: UserChatMessage) => personName(byId.get(m.sender_id) ?? m.sender);

  return (
    <div className="space-y-6">
      <div className="text-sm">
        <Link href="/sos-requests/user-chats" className="text-sky-600 hover:underline">
          ← User Chats
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">USER CHAT</h1>
        <Button
          variant="outline"
          className="text-red-600 border-red-200 hover:bg-red-50"
          onClick={() => {
            deleteChat.reset();
            setDeleteChatOpen(true);
          }}
        >
          <Trash2 className="mr-1 h-4 w-4" />
          Delete conversation
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">CHAT DETAILS</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {participants.map((p, i) => (
            <div key={p.id} className="space-y-2 text-sm">
              <p className="font-medium text-gray-900">Participant {i + 1}</p>
              <p>
                <span className="text-gray-500">Name: </span>
                {displayName(p)}
              </p>
              <p className="capitalize">
                <span className="normal-case text-gray-500">Account type: </span>
                {p.user_type}
              </p>
              <p>
                <span className="text-gray-500">Phone: </span>
                {p.phone_number || "-"}
              </p>
              <p>
                <span className="text-gray-500">Email: </span>
                {p.email || "-"}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1 border-t border-gray-100 pt-4 text-sm">
          <p>
            <span className="text-gray-500">Chat ID: </span>
            <span className="font-mono">{thread.id}</span>
          </p>
          <p>
            <span className="text-gray-500">Started: </span>
            {formatDateTime(thread.created_at)}
          </p>
          <p>
            <span className="text-gray-500">Last activity: </span>
            {thread.last_message_at ? formatDateTime(thread.last_message_at) : "-"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">MESSAGES ({thread.messages.length})</h2>

        {thread.messages.length === 0 ? (
          <p className="text-sm text-gray-500">No messages.</p>
        ) : (
          <div className="max-h-[600px] overflow-y-auto space-y-3 pr-2">
            {thread.messages.map((m) => {
              const left = m.sender_id === leftId;
              const name = senderName(m);
              return (
                <div key={m.id} className={`group flex items-start gap-2 ${left ? "justify-start" : "flex-row-reverse"}`}>
                  <div
                    aria-hidden
                    className={`mt-5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      left ? "bg-gray-200 text-gray-700" : "bg-blue-100 text-[#0586CF]"
                    }`}
                  >
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div className={`flex max-w-[70%] flex-col ${left ? "items-start" : "items-end"}`}>
                    <p className="mb-1 text-sm font-semibold text-gray-900">{name}</p>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        left ? "bg-gray-100 text-gray-900" : "bg-[#0586CF] text-white"
                      }`}
                    >
                      <MessageMedia message={m} />
                      {m.body && (
                        <p className="whitespace-pre-wrap break-words text-sm">{m.body}</p>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{formatDateTime(m.created_at)}</p>
                  </div>
                  <button
                    type="button"
                    aria-label="Delete message"
                    title="Delete message"
                    onClick={() => {
                      deleteMessage.reset();
                      setMessageTarget(m);
                    }}
                    className="mt-1 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <ConfirmDeleteDialog
        open={messageTarget !== null}
        title="Delete this message?"
        description={
          <>
            This permanently deletes the message from{" "}
            <span className="font-medium text-gray-900">
              {messageTarget ? senderName(messageTarget) : ""}
            </span>
            {messageTarget?.media_type ? ", including its attachment" : ""}. It disappears for
            both users and cannot be undone.
          </>
        }
        pending={deleteMessage.isPending}
        error={deleteMessage.error ? (deleteMessage.error as Error).message : null}
        onCancel={() => setMessageTarget(null)}
        onConfirm={() => messageTarget && deleteMessage.mutate(messageTarget.id)}
      />

      <ConfirmDeleteDialog
        open={deleteChatOpen}
        title="Delete this conversation?"
        description={
          <>
            This permanently deletes every message and attachment in the chat between{" "}
            <span className="font-medium text-gray-900">{participantsLabel(participants)}</span>.
            It disappears for both users and cannot be undone.
          </>
        }
        pending={deleteChat.isPending}
        error={deleteChat.error ? (deleteChat.error as Error).message : null}
        onCancel={() => setDeleteChatOpen(false)}
        onConfirm={() => deleteChat.mutate()}
      />
    </div>
  );
}
