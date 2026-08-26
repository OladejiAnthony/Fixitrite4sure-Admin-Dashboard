//components/layout/dashboard-layout.tsx
"use client";

import type React from "react";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { Header } from "./header";

// Access is already gated server-side in middleware.ts (session + is_admin
// check) before this ever renders, so no client-side redirect is needed here.
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1 p-6 bg-[#FAFAFA]">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

