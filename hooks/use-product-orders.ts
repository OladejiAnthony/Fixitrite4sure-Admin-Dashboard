import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"

export function useProductOrders() {
  return useQuery({
    queryKey: ["product-orders"],
    queryFn: async () => {
      const response = await apiClient.get("/productOrders")
      return response.data
    },
  })
}
