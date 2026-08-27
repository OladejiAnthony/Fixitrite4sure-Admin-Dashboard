import { useQuery } from "@tanstack/react-query"

export function useAdverts() {
  return useQuery({
    queryKey: ["adverts"],
    queryFn: async () => {
      const response = await fetch("/api/admin/adverts")
      if (!response.ok) throw new Error("Failed to fetch adverts")
      return response.json()
    },
  })
}
