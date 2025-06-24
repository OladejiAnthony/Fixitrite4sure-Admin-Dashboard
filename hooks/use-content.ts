import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"

export function useContent() {
  return useQuery({
    queryKey: ["content"],
    queryFn: async () => {
      const response = await apiClient.get("/content")
      return response.data
    },
  })
}
