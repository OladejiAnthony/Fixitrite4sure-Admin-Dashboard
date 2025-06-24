import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"

export function useRepairers() {
  return useQuery({
    queryKey: ["repairers"],
    queryFn: async () => {
      const response = await apiClient.get("/repairers")
      return response.data
    },
  })
}
