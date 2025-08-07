//components/profile/system-activity.tsx
"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { format, isToday, parseISO } from "date-fns";
import { apiClient } from "@/lib/api-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// 1. Zod schema
const activitySchema = z.object({
  id: z.number(),
  adminName: z.string(),
  activityDescription: z.string(),
  dateTime: z.string(),
  status: z.string(),
  avatarUrl: z.string().optional(), // Add this if using avatars
});

const activityListSchema = z.array(activitySchema);

// 2. Types
type Activity = z.infer<typeof activitySchema>;

// 3. Group by date
function groupByDate(activities: Activity[]) {
  const grouped: Record<string, Activity[]> = {};
  activities.forEach((activity) => {
    const date = parseISO(activity.dateTime);
    const label = isToday(date) ? "Today" : format(date, "EEEE do MMM, yyyy");
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(activity);
  });
  return grouped;
}

export function SystemActivityTab() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      const res = await apiClient.get("/activities");
      return activityListSchema.parse(res.data);
    },
  });

  if (isLoading) return <div className="p-6">Loading activities...</div>;
  if (isError)
    return (
      <div className="p-6 text-red-600">Error: {(error as Error).message}</div>
    );

  // Add a null check before processing the data
  if (!data) return <div className="p-6">No activities found</div>;

  const grouped = groupByDate(data);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-6 text-gray-800">
        SYSTEM ACTIVITY
      </h2>

      <div className="space-y-8">
        {Object.entries(grouped).map(([dateLabel, items], index) => (
          <div key={dateLabel} className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">{dateLabel}</h3>

            {items.map((activity) => (
              <div key={activity.id} className="flex gap-3 items-start">
                <Avatar className="h-9 w-9">
                  {activity.avatarUrl ? (
                    <AvatarImage
                      src={activity.avatarUrl}
                      alt={activity.adminName}
                    />
                  ) : (
                    <AvatarFallback>
                      {activity.adminName
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>

                <div className="flex-1">
                  <p className="text-sm text-gray-800">
                    {activity.activityDescription}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(parseISO(activity.dateTime), "hh:mm a")}
                  </p>
                </div>
              </div>
            ))}

            {index !== Object.entries(grouped).length - 1 && (
              <hr className="border-t border-gray-200 mt-4" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
