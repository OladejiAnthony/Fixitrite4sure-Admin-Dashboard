import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"

export function useLogistics() {
  return useQuery({
    queryKey: ["logistics"],
    queryFn: async () => {
      const response = await apiClient.get("/logistics")
      return response.data
    },
  })
}
