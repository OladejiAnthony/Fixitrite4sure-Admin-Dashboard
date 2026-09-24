import { useQuery } from "@tanstack/react-query"

export function useContentPosts() {
  return useQuery({
    queryKey: ["content-posts"],
    queryFn: async () => {
      const response = await fetch("/api/admin/content")
      if (!response.ok) throw new Error("Failed to fetch content posts")
      return response.json()
    },
  })
}
