import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"

export function useVendors() {
  return useQuery({
    queryKey: ["vendors"],
    queryFn: async () => {
      const response = await apiClient.get("/vendors")
      return response.data
    },
  })
}
