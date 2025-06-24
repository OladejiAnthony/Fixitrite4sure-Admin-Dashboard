import type React from "react";
import { AuthLayout } from "@/components/layout/auth-layout";

export default function AuthLayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayout>{children}</AuthLayout>;
}
