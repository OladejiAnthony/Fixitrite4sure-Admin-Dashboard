// app/(auth)/register/page.tsx
import { Suspense } from "react";
import { RegisterPage } from "@/components/auth/register-page";
import { AuthLayout } from "@/components/layout/auth-layout";

export default function Register() {
  return (
    <AuthLayout>
      <Suspense fallback={null}>
        <RegisterPage />
      </Suspense>
    </AuthLayout>
  );
}
