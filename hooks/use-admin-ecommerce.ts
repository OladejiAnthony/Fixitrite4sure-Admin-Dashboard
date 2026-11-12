import { useQuery } from "@tanstack/react-query"

export type EcommerceResource = "orders" | "stores" | "products" | "reports"

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.error ?? `Request failed (${response.status})`)
  }
  return response.json()
}

// List for one E-Commerce tab, read from Supabase via /api/admin/e-commerce.
export function useEcommerceList<T>(resource: EcommerceResource) {
  return useQuery<T[]>({
    queryKey: ["admin-ecommerce", resource],
    queryFn: () => getJson<T[]>(`/api/admin/e-commerce/${resource}`),
  })
}

export function useEcommerceItem<T>(resource: EcommerceResource, id: string) {
  return useQuery<T>({
    queryKey: ["admin-ecommerce", resource, id],
    queryFn: () =>
      getJson<T>(`/api/admin/e-commerce/${resource}/${encodeURIComponent(id)}`),
    enabled: Boolean(id),
  })
}
