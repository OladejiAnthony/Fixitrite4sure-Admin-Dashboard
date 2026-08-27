import { useQuery } from "@tanstack/react-query"

export function useAdvert(id: string | undefined) {
  return useQuery({
    queryKey: ["advert", id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/adverts/${id}`)
      if (!response.ok) throw new Error("Failed to fetch advert")
      return response.json()
    },
    enabled: !!id,
  })
}
