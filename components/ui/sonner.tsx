"use client"
import { Toaster as SonnerToaster, type ToasterProps } from "sonner"

/**
 * Global toast provider used across the app.
 * Wraps Sonner’s `<Toaster />` so we can keep the same
 * import path convention as the rest of shadcn/ui.
 *
 * Usage:
 *   import { Toaster } from "@/components/ui/sonner"
 *
 * Then place `<Toaster />` once (e.g. in `app/layout.tsx`).
 */
export function Toaster(props: ToasterProps) {
  return <SonnerToaster {...props} />
}
