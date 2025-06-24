import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"

export function useRepairCompanies() {
  return useQuery({
    queryKey: ["repair-companies"],
    queryFn: async () => {
      const response = await apiClient.get("/repairCompanies")
      return response.data
    },
  })
}
