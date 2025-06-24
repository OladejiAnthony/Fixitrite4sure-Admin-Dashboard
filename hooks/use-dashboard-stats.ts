import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await apiClient.get("/dashboardStats")
      return response.data
    },
  })
}
