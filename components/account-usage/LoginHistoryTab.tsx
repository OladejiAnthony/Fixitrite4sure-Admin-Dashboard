//
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, isAfter, isBefore } from "date-fns";
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
import { Key } from "react";

interface LoginRecord {
  userId: number;
  name: string;
  loginDate: string;
  ip: string;
}

const filterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type FilterSchema = z.infer<typeof filterSchema>;

export function LoginHistoryTab() {
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
      startDate: "",
      endDate: "",
    },
  });

  const startDate = watch("startDate");
  const endDate = watch("endDate");

  const loginRecords = users.flatMap((user: any) =>
    (user.loginHistory || []).map((login: any) => ({
      userId: user.id,
      name: user.name,
      loginDate: login.date,
      ip: login.ip,
    }))
  );

  const filteredLogins = loginRecords.filter(
    (record: { loginDate: string | number | Date }) => {
      const date = new Date(record.loginDate);
      const from = startDate ? new Date(startDate) : null;
      const to = endDate ? new Date(endDate) : null;

      const after = from
        ? isAfter(date, from) ||
          format(date, "yyyy-MM-dd") === format(from, "yyyy-MM-dd")
        : true;
      const before = to
        ? isBefore(date, to) ||
          format(date, "yyyy-MM-dd") === format(to, "yyyy-MM-dd")
        : true;

      return after && before;
    }
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <form
        onSubmit={handleSubmit(() => {})}
        className="flex flex-wrap gap-4 items-center"
      >
        <div>
          <label className="block text-sm text-gray-500 mb-1">Start Date</label>
          <input
            type="date"
            {...register("startDate")}
            className="border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1">End Date</label>
          <input
            type="date"
            {...register("endDate")}
            className="border rounded p-2"
          />
        </div>
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
              <TableHead>Name</TableHead>
              <TableHead>Login Date</TableHead>
              <TableHead>IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogins.map(
              (log: LoginRecord, index: Key | null | undefined) => (
                <TableRow key={index}>
                  <TableCell>{String(log.userId).padStart(3, "0")}</TableCell>
                  <TableCell>{log.name}</TableCell>
                  <TableCell>
                    {format(new Date(log.loginDate), "PPpp")}
                  </TableCell>
                  <TableCell>{log.ip}</TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
