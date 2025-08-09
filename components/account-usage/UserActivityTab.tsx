//components/account-usage/UserActivityTab.tsx
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiClient } from "@/lib/api-client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from "@/components/ui/table";

const formSchema = z.object({
  accountType: z.string().optional(),
  activityType: z.string().optional(),
});

type FormSchema = z.infer<typeof formSchema>;

export function UserActivityTab() {
  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await apiClient.get("/users");
      return res.data;
    },
  });

  const { data: activities } = useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      const res = await apiClient.get("/activities");
      return res.data;
    },
  });

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountType: "",
      activityType: "",
    },
  });

  const { register, handleSubmit, reset, watch } = form;
  const accountType = watch("accountType");
  const activityType = watch("activityType");

  const filteredData = activities?.filter((activity: any) => {
    const accountMatches = accountType
      ? activity.accountType === accountType
      : true;
    const activityMatches = activityType
      ? activity.activityType === activityType
      : true;
    return accountMatches && activityMatches;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <form
        onSubmit={handleSubmit(() => {})}
        className="flex flex-wrap gap-4 items-center"
      >
        <select {...register("accountType")} className="border rounded p-2">
          <option value="">Account Type</option>
          <option value="Customer">Customer</option>
          <option value="Repairer">Repairer</option>
          <option value="Vendor">Vendor</option>
        </select>

        <select {...register("activityType")} className="border rounded p-2">
          <option value="">Activity Type</option>
          <option value="Log In">Log In</option>
          <option value="Purchase">Purchase</option>
          <option value="Service Request">Service Request</option>
          <option value="Content Posting">Content Posting</option>
        </select>

        <Button type="button" variant="destructive" onClick={() => reset()}>
          Reset Filter
        </Button>
      </form>

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>User Name</TableHead>
              <TableHead>Account Type</TableHead>
              <TableHead>Activity Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(filteredData ?? []).map((row: any, index: number) => (
              <TableRow key={row.id}>
                <TableCell>{String(row.id).padStart(3, "0")}</TableCell>
                <TableCell>{row.adminName}</TableCell>
                <TableCell>{row.accountType || "Repairer"}</TableCell>
                <TableCell>{row.activityType || "Purchase"}</TableCell>
                <TableCell>
                  {new Date(row.dateTime).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <span
                    className={`text-sm font-medium ${
                      row.status === "Success"
                        ? "text-green-600"
                        : row.status === "Completed"
                        ? "text-emerald-500"
                        : row.status === "Rejected"
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    {row.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
