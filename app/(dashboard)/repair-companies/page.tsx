//app\(dashboard)\repairers\page.tsx

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
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
import { Trash2, Pencil, Filter } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast"; // Assuming shadcn toast is available

interface RepairCompany {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: "Active" | "Inactive" | "Online" | "Offline";
  lastLogin: string;
}


const fetchRepairCompanies = async (): Promise<RepairCompany[]> => {
  const { data } = await apiClient.get("/repair-companies");
  return data;
};

const repairCompanySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  status: z.enum(["Active", "Inactive", "Online", "Offline"]),
});


type RepairerForm = z.infer<typeof repairCompanySchema>;


export default function RepairCompaniesPage() {
  const [tab, setTab] = useState<"total" | "active" | "inactive">("total");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const queryClient = useQueryClient();
  const { data: repairCompanies, isLoading } = useQuery({
    queryKey: ["repair-companies"],
    queryFn: fetchRepairCompanies,
  });

  const { currentPage, itemsPerPage } = useSelector(
    (state: RootState) => state.pagination
  );

  const filteredRepairers = repairCompanies?.filter((repairer) => {

    console.log("Status:", repairer.status)
    if (tab === "total") return true;
    if (tab === "active") return repairer.status === "Online" || repairer.status === "Active";
    if (tab === "inactive") return repairer.status === "Offline" || repairer.status === "Inactive";
    return false;
  }) || [];

  const totalItems = filteredRepairers.length;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const paginatedRepairers = filteredRepairers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalCount = repairCompanies?.length || 0;
  const activeCount = repairCompanies?.filter((c) => c.status === "Online" || c.status === "Active").length || 0;
  const inactiveCount = repairCompanies?.filter((c) => c.status === "Offline" || c.status === "Inactive").length || 0;

  // Update your useForm hook
  const { register, handleSubmit, formState: { errors }, reset } = useForm<RepairerForm>({
    resolver: zodResolver(repairCompanySchema),
  });




  const editMutation = useMutation({
    mutationFn: (repairCompany: RepairCompany) => apiClient.put(`/repair-companies/${repairCompany.id}`, repairCompany),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repair-companies"] });
      toast({ title: "Repair Company updated successfully" });
      setIsEditDialogOpen(false); // Close the dialog
    },
    onError: () => {
      toast({ title: "Failed to update repair company", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/repair-companies/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repair-companies"] });
      toast({ title: "Repair Company deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete repair company", variant: "destructive" });
    },
  });



  if (isLoading) return <div className="p-6 text-center text-gray-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-white p-6 font-sans text-gray-900">
      <h2 className="text-xl font-bold uppercase tracking-wide mb-6">Repairer Company</h2>
      <div className="flex space-x-6 mb-6 border-b border-gray-200 pb-2">
        <button
          onClick={() => setTab("total")}
          className={`text-sm font-medium ${tab === "total" ? "text-gray-900 border-b-2 border-blue-500" : "text-gray-500"}`}
        >
          TOTAL COMPANY ({totalCount})
        </button>
        <button
          onClick={() => setTab("active")}
          className={`text-sm font-medium ${tab === "active" ? "text-gray-900 border-b-2 border-blue-500" : "text-gray-500"}`}
        >
          ACTIVE COMPANY ({activeCount})
        </button>
        <button
          onClick={() => setTab("inactive")}
          className={`text-sm font-medium ${tab === "inactive" ? "text-gray-900 border-b-2 border-blue-500" : "text-gray-500"}`}
        >
          INACTIVE COMPANY ({inactiveCount})
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
              <th className="px-4 py-3">Last Login</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedRepairers.map((repairer) => (
              <tr key={repairer.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  <Link href={`/repairers/${repairer.id}`} className="hover:underline hover:text-blue-300">
                    {repairer.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{repairer.email}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{repairer.phone}</td>
                <td className={`px-4 py-3 text-sm ${repairer.status === "Active" ? "text-green-600" : "text-orange-500"}`}>
                  {repairer.status}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{repairer.lastLogin}</td>
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
                            Edit Vendor
                          </DialogTitle>
                        </DialogHeader>
                        <form
                          onSubmit={handleSubmit((data) => {
                            editMutation.mutate({ ...repairer, ...data });
                          })}
                          className="space-y-4"
                        >
                          <div>
                            <Label htmlFor="name" className="text-sm font-medium">
                              Name
                            </Label>
                            <Input
                              id="name"
                              defaultValue={repairer.name}
                              {...register("name")}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="email" className="text-sm font-medium">
                              Email
                            </Label>
                            <Input
                              id="email"
                              defaultValue={repairer.email}
                              {...register("email")}
                              className="mt-1"
                            />
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
                            <Input
                              id="phone"
                              defaultValue={repairer.phone}
                              {...register("phone")}
                              className="mt-1"
                            />
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
                              defaultValue={repairer.status}
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
                          >
                            Save Changes
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this repairer?")) {
                          deleteMutation.mutate(repairer.id);
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

