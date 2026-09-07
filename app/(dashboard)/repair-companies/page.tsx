// app/(dashboard)/repair-companies/page.tsx

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Pagination } from "@/components/common/pagination";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2, Pencil } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";

interface RepairCompany {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  joined: string;
}

interface ProfileRow {
  id: string;
  company_name: string | null;
  business_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone_number: string | null;
  verification_status: string | null;
  created_at: string;
}

const toRepairCompany = (row: ProfileRow): RepairCompany => ({
  id: row.id,
  name:
    row.company_name ||
    row.business_name ||
    [row.first_name, row.last_name].filter(Boolean).join(" ") ||
    "—",
  email: row.email || "—",
  phone: row.phone_number || "—",
  status: row.verification_status || "unverified",
  joined: row.created_at,
});

const fetchRepairCompanies = async (): Promise<RepairCompany[]> => {
  const response = await fetch("/api/admin/repair-companies");
  if (!response.ok) throw new Error("Failed to fetch repair companies");
  const rows: ProfileRow[] = await response.json();
  return rows.map(toRepairCompany);
};

const companySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  status: z.string().min(1, "Status is required"),
});

type CompanyForm = z.infer<typeof companySchema>;

export default function RepairCompaniesPage() {
  const [tab, setTab] = useState<"total" | "verified" | "unverified">("total");
  const [editTarget, setEditTarget] = useState<RepairCompany | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RepairCompany | null>(null);

  const queryClient = useQueryClient();
  const { data: companies, isLoading } = useQuery({
    queryKey: ["repair-companies"],
    queryFn: fetchRepairCompanies,
  });

  const { currentPage, itemsPerPage } = useSelector(
    (state: RootState) => state.pagination
  );

  const filteredCompanies = companies?.filter((company) => {
    if (tab === "total") return true;
    if (tab === "verified") return company.status === "verified";
    if (tab === "unverified") return company.status !== "verified";
    return false;
  }) || [];

  const totalItems = filteredCompanies.length;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const paginatedCompanies = filteredCompanies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalCount = companies?.length || 0;
  const verifiedCount = companies?.filter((c) => c.status === "verified").length || 0;
  const unverifiedCount = companies?.filter((c) => c.status !== "verified").length || 0;

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
  });

  // Re-seed the shared form whenever a different row is opened for editing,
  // since the dialog and form are mounted once and reused across rows.
  useEffect(() => {
    if (editTarget) {
      reset({
        name: editTarget.name,
        email: editTarget.email,
        phone: editTarget.phone,
        status: editTarget.status,
      });
    }
  }, [editTarget, reset]);

  const editMutation = useMutation({
    mutationFn: (company: RepairCompany) =>
      fetch(`/api/admin/repair-companies/${company.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: company.name,
          email: company.email,
          phone_number: company.phone,
          verification_status: company.status,
        }),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to update repair company");
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repair-companies"] });
      toast({ title: "Repair company updated successfully" });
      setEditTarget(null);
    },
    onError: () => {
      toast({ title: "Failed to update repair company", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/admin/repair-companies/${id}`, { method: "DELETE" }).then((res) => {
        if (!res.ok) throw new Error("Failed to delete repair company");
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repair-companies"] });
      toast({ title: "Repair company deleted successfully" });
      setDeleteTarget(null);
    },
    onError: () => {
      toast({ title: "Failed to delete repair company", variant: "destructive" });
    },
  });

  if (isLoading) return <div className="p-6 text-center text-gray-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-white p-6 font-sans text-gray-900">
      <h2 className="text-xl font-bold uppercase tracking-wide mb-6">Repair Companies</h2>
      <div className="flex space-x-6 mb-6 border-b border-gray-200 pb-2">
        <button
          onClick={() => setTab("total")}
          className={`text-sm font-medium ${tab === "total" ? "text-gray-900 border-b-2 border-blue-500" : "text-gray-500"}`}
        >
          TOTAL COMPANY ({totalCount})
        </button>
        <button
          onClick={() => setTab("verified")}
          className={`text-sm font-medium ${tab === "verified" ? "text-gray-900 border-b-2 border-blue-500" : "text-gray-500"}`}
        >
          VERIFIED COMPANY ({verifiedCount})
        </button>
        <button
          onClick={() => setTab("unverified")}
          className={`text-sm font-medium ${tab === "unverified" ? "text-gray-900 border-b-2 border-blue-500" : "text-gray-500"}`}
        >
          UNVERIFIED COMPANY ({unverifiedCount})
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone Number</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedCompanies.map((company) => (
              <tr key={company.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  <Link href={`/repair-companies/${company.id}`} className="hover:underline hover:text-blue-300">
                    {company.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{company.email}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{company.phone}</td>
                <td className={`px-4 py-3 text-sm capitalize ${company.status === "verified" ? "text-green-600" : "text-orange-500"}`}>
                  {company.status}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(company.joined).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-500 hover:text-blue-700"
                      onClick={() => setEditTarget(company)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => setDeleteTarget(company)}
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

      <Dialog
        open={editTarget !== null}
        onOpenChange={(open) => !open && setEditTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Edit Repair Company
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit((data) => {
              if (editTarget) editMutation.mutate({ ...editTarget, ...data });
            })}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="name" className="text-sm font-medium">
                Company Name
              </Label>
              <Input id="name" {...register("name")} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input id="email" {...register("email")} className="mt-1" />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </Label>
              <Input id="phone" {...register("phone")} className="mt-1" />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="status" className="text-sm font-medium">
                Status
              </Label>
              <select
                id="status"
                {...register("status")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              Save Changes
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete repair company?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-gray-900">{deleteTarget?.name}</span>{" "}
              ({deleteTarget?.email}), their login, and all of their bookings,
              orders, invoices, payments, and reviews. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
