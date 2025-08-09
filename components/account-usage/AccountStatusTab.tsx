//
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from "@/components/ui/table";

const filterSchema = z.object({
  accountType: z.string().optional(),
  activityStatus: z.string().optional(),
});

type FilterSchema = z.infer<typeof filterSchema>;

export function AccountStatusTab() {
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await apiClient.get("/users");
      return res.data;
    },
  });

  const { register, handleSubmit, reset, watch } = useForm<FilterSchema>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      accountType: "",
      activityStatus: "",
    },
  });

  const accountType = watch("accountType");
  const activityStatus = watch("activityStatus");

  const filteredUsers = users.filter((user: any) => {
    const typeMatch = accountType
      ? user.role === accountType.toLowerCase()
      : true;
    const statusMatch = activityStatus
      ? user.activityStatus === activityStatus
      : true;
    return typeMatch && statusMatch;
  });

  const activeCount = users.filter(
    (u: any) => u.activityStatus === "Active"
  ).length;
  const inactiveCount = users.filter(
    (u: any) => u.activityStatus === "Inactive"
  ).length;
  const suspendedCount = users.filter(
    (u: any) => u.activityStatus === "Suspended"
  ).length;

  return (
    <div className="space-y-4">
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-md bg-green-50 p-4 text-center shadow-sm">
          <h4 className="text-sm text-gray-600">Active Accounts</h4>
          <p className="text-xl font-bold text-green-600">{activeCount}</p>
        </div>
        <div className="rounded-md bg-yellow-50 p-4 text-center shadow-sm">
          <h4 className="text-sm text-gray-600">Inactive Accounts</h4>
          <p className="text-xl font-bold text-yellow-600">{inactiveCount}</p>
        </div>
        <div className="rounded-md bg-red-50 p-4 text-center shadow-sm">
          <h4 className="text-sm text-gray-600">Suspended Accounts</h4>
          <p className="text-xl font-bold text-red-600">{suspendedCount}</p>
        </div>
      </div>

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

        <select {...register("activityStatus")} className="border rounded p-2">
          <option value="">Activity Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Suspended">Suspended</option>
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
              <TableHead>Activity Status</TableHead>
              <TableHead>Time Stamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user: any) => (
              <TableRow key={user.id}>
                <TableCell>{String(user.id).padStart(3, "0")}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </TableCell>
                <TableCell>{user.activityStatus}</TableCell>
                <TableCell>
                  {new Date(user.lastLogin ?? user.createdAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
