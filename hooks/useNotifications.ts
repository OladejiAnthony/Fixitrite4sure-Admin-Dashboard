///hooks/useNotifications.ts
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { notificationsArraySchema } from "@/lib/schemas/notification-schema";

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await apiClient.get("/notifications");
      const parsed = notificationsArraySchema.parse(res.data);
      return parsed;
    },
  });
}
