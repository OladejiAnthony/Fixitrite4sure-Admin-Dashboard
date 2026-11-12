// app/(dashboard)/sos-requests/user-chats/page.tsx
"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/common/pagination";
import { SosTabs } from "@/components/sos/sos-tabs";
import { ConfirmDeleteDialog } from "@/components/sos/confirm-delete-dialog";
import { setCurrentPage } from "@/store/slices/pagination-slice";
import type { RootState } from "@/store/store";
import {
  displayName,
  formatDateTime,
  participantsLabel,
  type UserChat,
} from "@/lib/support-requests";

// Direct chats between users of the mobile app. Admins can read and delete
// them; there is no reply here (support replies live on the SOS Requests tab).
export default function UserChatsPage() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { currentPage, itemsPerPage } = useSelector(
    (state: RootState) => state.pagination
  );
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<UserChat | null>(null);

  const {
    data: chats = [],
    isLoading,
    error,
  } = useQuery<UserChat[]>({
    queryKey: ["user-chats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/user-chats");
      if (!res.ok) throw new Error("Failed to load user chats");
      return res.json();
    },
    refetchInterval: 30_000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/user-chats/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to delete chat");
      }
    },
    onSuccess: () => {
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["user-chats"] });
    },
  });

  const term = search.trim().toLowerCase();
  const filtered = term
    ? chats.filter((c) =>
        c.participants.some((p) =>
          [displayName(p), p.email, p.phone_number]
            .filter(Boolean)
            .some((v) => v!.toLowerCase().includes(term))
        )
      )
    : chats;

  const start = (currentPage - 1) * itemsPerPage;
  const pageChats = filtered.slice(start, start + itemsPerPage);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-gray-900">SOS REQUEST MANAGEMENT</h1>

      <SosTabs active="user-chats" />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-4">
          <p className="text-sm text-gray-600">
            Chats between users on the mobile app. Open a chat to read it, or delete
            content that breaks the rules.
          </p>
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              dispatch(setCurrentPage(1));
            }}
            placeholder="Search by name, email or phone"
            className="w-full max-w-xs"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["PARTICIPANTS", "ACCOUNT TYPES", "LAST MESSAGE", "LAST ACTIVITY", "ACTION"].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-medium text-[#202224] uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-red-600">
                    {(error as Error).message}
                  </td>
                </tr>
              ) : pageChats.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No chats found
                  </td>
                </tr>
              ) : (
                pageChats.map((chat) => (
                  <tr key={chat.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {participantsLabel(chat.participants)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {chat.participants.map((p) => p.user_type).join(" ↔ ") || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {chat.last_message_preview ?? "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(chat.last_message_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Link href={`/sos-requests/user-chats/${chat.id}`}>
                          <Button variant="outline" size="sm" className="text-white bg-[#5D92E4]">
                            View Chat
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          aria-label="Delete chat"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => {
                            deleteMutation.reset();
                            setDeleteTarget(chat);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <Pagination totalItems={filtered.length} />
        </div>
      </div>

      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        title="Delete this chat?"
        description={
          <>
            This permanently deletes every message and attachment in the chat between{" "}
            <span className="font-medium text-gray-900">
              {deleteTarget ? participantsLabel(deleteTarget.participants) : ""}
            </span>
            . It disappears for both users and cannot be undone.
          </>
        }
        pending={deleteMutation.isPending}
        error={deleteMutation.error ? (deleteMutation.error as Error).message : null}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
      />
    </div>
  );
}
