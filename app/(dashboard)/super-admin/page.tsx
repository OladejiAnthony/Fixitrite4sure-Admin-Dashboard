// app/(dashboard)/super-admin/page.tsx

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store"; // Assuming store is configured with the pagination slice
import { Pagination } from "@/components/common/pagination";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2, Pencil } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast"; // Assuming shadcn toast is available

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
  lastLogin: string | null;
}

const fetchAdmins = async (): Promise<Admin[]> => {
  const res = await fetch("/api/admin/super-admins");
  if (!res.ok) throw new Error("Failed to load admins");
  return res.json();
};

const editSchema = z.object({
  name: z.string().min(1, "Name is required"),
  status: z.enum(["Active", "Inactive"]),
});
const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type EditForm = z.infer<typeof editSchema>;
type InviteForm = z.infer<typeof inviteSchema>;

function formatLastLogin(lastLogin: string | null) {
  return lastLogin ? new Date(lastLogin).toLocaleString() : "Never";
}

export default function SuperAdminPage() {
  const [tab, setTab] = useState<"total" | "active" | "inactive">("total");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  const queryClient = useQueryClient();
  const { data: admins, isLoading } = useQuery({
    queryKey: ["superAdmins"],
    queryFn: fetchAdmins,
  });

  const { currentPage, itemsPerPage } = useSelector(
    (state: RootState) => state.pagination
  );

  const filteredAdmins = admins?.filter((admin) => {
    if (tab === "total") return true;
    if (tab === "active") return admin.status === "Active";
    if (tab === "inactive") return admin.status === "Inactive";
    return false;
  }) || [];

  const totalItems = filteredAdmins.length;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const paginatedAdmins = filteredAdmins.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalCount = admins?.length || 0;
  const activeCount = admins?.filter((a) => a.status === "Active").length || 0;
  const inactiveCount =
    admins?.filter((a) => a.status === "Inactive").length || 0;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditForm>({
    resolver: zodResolver(editSchema),
  });
  const {
    register: registerInvite,
    handleSubmit: handleInviteSubmit,
    formState: { errors: inviteErrors },
    reset: resetInvite,
  } = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
  });

  const inviteMutation = useMutation({
    mutationFn: async (data: InviteForm) => {
      const res = await fetch("/api/admin/super-admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "Failed to send invite" }));
        throw new Error(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superAdmins"] });
      toast({ title: "Invite sent successfully" });
      resetInvite();
      setIsInviteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: error.message || "Failed to send invite", variant: "destructive" });
    },
  });

  const editMutation = useMutation({
    mutationFn: async ({ id, ...data }: EditForm & { id: string }) => {
      const res = await fetch(`/api/admin/super-admins/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "Failed to update admin" }));
        throw new Error(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superAdmins"] });
      toast({ title: "Admin updated successfully" });
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: error.message || "Failed to update admin", variant: "destructive" });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/super-admins/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "Failed to revoke admin access" }));
        throw new Error(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superAdmins"] });
      toast({ title: "Admin access revoked" });
    },
    onError: (error: Error) => {
      toast({ title: error.message || "Failed to revoke admin access", variant: "destructive" });
    },
  });

  const onInviteSubmit = (data: InviteForm) => {
    inviteMutation.mutate(data);
  };

  if (isLoading) return <div className="p-6 text-center text-gray-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-white p-6 font-sans text-gray-900">
      <h2 className="text-xl font-bold uppercase tracking-wide mb-6">Admin</h2>
      <div className="flex space-x-6 mb-6 border-b border-gray-200 pb-2">
        <button
          onClick={() => setTab("total")}
          className={`text-sm font-medium ${tab === "total" ? "text-gray-900 border-b-2 border-blue-500" : "text-gray-500"}`}
        >
          TOTAL ADMIN ({totalCount})
        </button>
        <button
          onClick={() => setTab("active")}
          className={`text-sm font-medium ${tab === "active" ? "text-gray-900 border-b-2 border-blue-500" : "text-gray-500"}`}
        >
          ACTIVE ADMIN ({activeCount})
        </button>
        <button
          onClick={() => setTab("inactive")}
          className={`text-sm font-medium ${tab === "inactive" ? "text-gray-900 border-b-2 border-blue-500" : "text-gray-500"}`}
        >
          INACTIVE ADMIN ({inactiveCount})
        </button>
      </div>
      <div className="flex items-center space-x-2 mb-4">
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-md flex items-center">
              + Invite with Email
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">Invite Admin via Email</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleInviteSubmit(onInviteSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="invite-email" className="text-sm font-medium">Email</Label>
                <Input
                  id="invite-email"
                  {...registerInvite("email")}
                  className="mt-1"
                />
                {inviteErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{inviteErrors.email.message}</p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600"
                disabled={inviteMutation.isPending}
              >
                {inviteMutation.isPending ? "Sending..." : "Send Invite"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

      </div>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Last Login</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedAdmins.map((admin) => (
              <tr key={admin.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  <Link href={`/super-admin/${admin.id}`} className="hover:underline hover:text-blue-300">
                    {admin.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{admin.email}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{admin.role}</td>
                <td className={`px-4 py-3 text-sm ${admin.status === "Active" ? "text-green-600" : "text-orange-500"}`}>
                  {admin.status}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{formatLastLogin(admin.lastLogin)}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex space-x-2">
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>

                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-lg font-semibold">
                            Edit Admin
                          </DialogTitle>
                        </DialogHeader>
                        <form
                          onSubmit={handleSubmit((data) => {
                            editMutation.mutate({ id: admin.id, ...data });
                          })}
                          className="space-y-4"
                        >
                          <div>
                            <Label htmlFor="name" className="text-sm font-medium">
                              Name
                            </Label>
                            <Input
                              id="name"
                              defaultValue={admin.name}
                              {...register("name")}
                              className="mt-1"
                            />
                            {errors.name && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.name.message}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="status" className="text-sm font-medium">
                              Status
                            </Label>
                            <select
                              id="status"
                              defaultValue={admin.status}
                              {...register("status")}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            >
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                            </select>
                          </div>
                          <Button
                            type="submit"
                            className="w-full bg-blue-500 hover:bg-blue-600"
                            disabled={editMutation.isPending}
                          >
                            {editMutation.isPending ? "Saving..." : "Save Changes"}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      title="Revoke admin access"
                      onClick={() => {
                        if (confirm("Revoke this admin's dashboard access? Their account itself won't be deleted.")) {
                          revokeMutation.mutate(admin.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
        <p>Showing {startItem}-{endItem} of {totalItems}</p>
        <Pagination totalItems={totalItems} />
      </div>
    </div>
  );
}
