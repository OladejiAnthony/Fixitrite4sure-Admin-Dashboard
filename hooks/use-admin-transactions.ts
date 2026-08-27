import { useQuery } from "@tanstack/react-query"

export function useAdminTransactions() {
  return useQuery({
    queryKey: ["admin-transactions"],
    queryFn: async () => {
      const response = await fetch("/api/admin/transactions")
      if (!response.ok) throw new Error("Failed to fetch transactions")
      return response.json()
    },
  })
}
