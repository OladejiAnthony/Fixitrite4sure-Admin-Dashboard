import { useQuery } from "@tanstack/react-query"

export function useAdminActivities() {
  return useQuery({
    queryKey: ["admin-activities"],
    queryFn: async () => {
      const response = await fetch("/api/admin/activities")
      if (!response.ok) throw new Error("Failed to fetch activities")
      return response.json()
    },
  })
}
