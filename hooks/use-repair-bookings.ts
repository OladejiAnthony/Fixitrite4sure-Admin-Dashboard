import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"

export function useRepairBookings() {
  return useQuery({
    queryKey: ["repair-bookings"],
    queryFn: async () => {
      const response = await apiClient.get("/repairBookings")
      return response.data
    },
  })
}
