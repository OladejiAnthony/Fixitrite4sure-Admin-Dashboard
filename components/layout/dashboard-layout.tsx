//components/layout/dashboard-layout.tsx
"use client";

import type React from "react";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { Header } from "./header";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    if (!token && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

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
