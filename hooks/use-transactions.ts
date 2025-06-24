import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"

export function useTransactions() {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const response = await apiClient.get("/transactions")
      return response.data
    },
  })
}
