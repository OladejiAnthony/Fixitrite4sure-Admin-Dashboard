//components/profile/activity-feed.tsx
//components/profile/activity-feed.tsx
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Trash2, Pencil, Filter, Plus } from "lucide-react";
import { Pagination } from "@/components/common/pagination";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

// Zod schema
const activitySchema = z.object({
  id: z.number().optional(),
  adminName: z.string().min(1, "Admin name is required"),
  activityDescription: z.string().min(1, "Description is required"),
  dateTime: z.string(),
  status: z.string().default("Success"),
});

type Activity = z.infer<typeof activitySchema>;

export function ActivityFeedTab() {
  const queryClient = useQueryClient();
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [filterText, setFilterText] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<number | null>(null);

  const { currentPage, itemsPerPage } = useSelector(
    (state: RootState) => state.pagination
  );

  // Calculate paginated activities

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Activity>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      adminName: "",
      activityDescription: "",
      dateTime: new Date().toISOString(),
      status: "Success",
    },
  });

  // Fetch activities
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      const res = await apiClient.get("/activities");
      return res.data as Activity[];
    },
  });

  // Mutation: Add new
  const addActivityMutation = useMutation({
    mutationFn: (data: Activity) => apiClient.post("/activities", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      reset();
      setIsAddDialogOpen(false);
    },
  });

  // Mutation: Delete
  const deleteActivityMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/activities/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      setIsDeleteDialogOpen(false);
    },
  });

  // Mutation: Edit
  const updateActivityMutation = useMutation({
    mutationFn: ({ id, ...data }: Activity) =>
      apiClient.put(`/activities/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      setEditingActivity(null);
      reset();
    },
  });

  const onSubmit = (data: Activity) => {
    if (editingActivity?.id) {
      updateActivityMutation.mutate({ ...data, id: editingActivity.id });
    } else {
      addActivityMutation.mutate({
        ...data,
        dateTime: new Date().toISOString(),
      });
    }
  };

  const filteredActivities = activities.filter((a) => {
    const searchText = filterText.toLowerCase();
    return (
      a.activityDescription.toLowerCase().includes(searchText) ||
      a.adminName.toLowerCase().includes(searchText)
    );
  });

  const filteredAndPaginatedActivities = filteredActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDeleteClick = (id: number) => {
    setActivityToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleEditClick = (activity: Activity) => {
    setEditingActivity(activity);
    reset(activity);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Activity Feed</h2>
        <div className="flex items-center gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-blue-600 text-white">
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Activity</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input {...register("adminName")} placeholder="Admin Name" />
                {errors.adminName && (
                  <p className="text-sm text-red-500">
                    {errors.adminName.message}
                  </p>
                )}

                <Input
                  {...register("activityDescription")}
                  placeholder="Description"
                />
                {errors.activityDescription && (
                  <p className="text-sm text-red-500">
                    {errors.activityDescription.message}
                  </p>
                )}

                <Button type="submit" className="bg-blue-600 text-white">
                  Add Activity
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Activity</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input {...register("adminName")} placeholder="Admin Name" />
                {errors.adminName && (
                  <p className="text-sm text-red-500">
                    {errors.adminName.message}
                  </p>
                )}

                <Input
                  {...register("activityDescription")}
                  placeholder="Description"
                />
                {errors.activityDescription && (
                  <p className="text-sm text-red-500">
                    {errors.activityDescription.message}
                  </p>
                )}

                <Button type="submit" className="bg-blue-600 text-white">
                  Update Activity
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p>Are you sure you want to delete this activity?</p>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (activityToDelete) {
                      deleteActivityMutation.mutate(activityToDelete);
                    }
                  }}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setFilterText("")}
            className="text-sm flex items-center"
          >
            <Filter className="w-4 h-4 mr-1" />
            Clear Filter
          </Button>
        </div>
      </div>

      <Input
        className="mb-4 w-full max-w-xs"
        placeholder="Filter by name or activity..."
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
      />

      <div className="overflow-auto">
        <table className="min-w-full text-sm text-left border">
          <thead className="bg-[#F6F9FF] text-xs text-gray-500 uppercase">
            <tr>
              <th className="p-3">Admin Name</th>
              <th className="p-3">Activity Description</th>
              <th className="p-3">Date and Time</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : filteredAndPaginatedActivities.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No activities found.
                </td>
              </tr>
            ) : (
              filteredAndPaginatedActivities.map((activity: Activity) => (
                <tr
                  key={activity.id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3">{activity.adminName}</td>
                  <td className="p-3">{activity.activityDescription}</td>
                  <td className="p-3">
                    {format(new Date(activity.dateTime), "dd/MM/yyyy HH:mm")}
                  </td>
                  <td className="p-3">
                    <span className="text-green-600 font-medium">
                      {activity.status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditClick(activity)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() =>
                        activity.id && handleDeleteClick(activity.id)
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Add Pagination at the bottom */}
      <Pagination totalItems={filteredActivities.length} />
    </div>
  );
}
