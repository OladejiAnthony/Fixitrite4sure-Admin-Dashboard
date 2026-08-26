import { useQuery } from "@tanstack/react-query"

export function useCustomers() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await fetch("/api/admin/customers")
      if (!response.ok) throw new Error("Failed to fetch customers")
      return response.json()
    },
  })
}
