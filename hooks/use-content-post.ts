import { useQuery } from "@tanstack/react-query"

export function useContentPost(id: string | undefined) {
  return useQuery({
    queryKey: ["content-post", id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/content/${id}`)
      if (!response.ok) throw new Error("Failed to fetch content post")
      return response.json()
    },
    enabled: !!id,
  })
}
