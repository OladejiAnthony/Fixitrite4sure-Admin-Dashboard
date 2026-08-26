// app/(auth)/login/page.tsx
import { Suspense } from "react";
import { LoginPage } from "@/components/auth/login-page";
import { AuthLayout } from "@/components/layout/auth-layout";

export default function Login() {
  return (
    <AuthLayout>
      <Suspense fallback={null}>
        <LoginPage />
      </Suspense>
    </AuthLayout>
  );
}
