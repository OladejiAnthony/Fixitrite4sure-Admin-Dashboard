// app/(auth)/layout.tsx
import type React from "react";
import { AuthLayout } from "@/components/layout/auth-layout";

export default function AuthLayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayout>{children}</AuthLayout>;
}

{/*
  
POST /api/dashboard/auth/login      ← public
POST /api/dashboard/auth/register   ← public
GET  /api/dashboard/auth/me         ← adminProtect
  
*/}
