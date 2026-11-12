import { useQuery } from "@tanstack/react-query"

export type ERepairResource = "bookings" | "repairs" | "discovery" | "reports"

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.error ?? `Request failed (${response.status})`)
  }
  return response.json()
}

// List for one E-Repair tab, read from Supabase via /api/admin/e-repair.
export function useERepairList<T>(resource: ERepairResource) {
  return useQuery<T[]>({
    queryKey: ["admin-e-repair", resource],
    queryFn: () => getJson<T[]>(`/api/admin/e-repair/${resource}`),
    refetchInterval: 30000,
  })
}

export function useERepairItem<T>(resource: ERepairResource, id: string) {
  return useQuery<T>({
    queryKey: ["admin-e-repair", resource, id],
    queryFn: () =>
      getJson<T>(`/api/admin/e-repair/${resource}/${encodeURIComponent(id)}`),
    enabled: Boolean(id),
  })
}
