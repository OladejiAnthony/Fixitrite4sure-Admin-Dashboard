import { useQuery } from "@tanstack/react-query"

export function useAdminTransaction(id: string | undefined) {
  return useQuery({
    queryKey: ["admin-transaction", id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/transactions/${id}`)
      if (!response.ok) throw new Error("Failed to fetch transaction")
      return response.json()
    },
    enabled: !!id,
  })
}
