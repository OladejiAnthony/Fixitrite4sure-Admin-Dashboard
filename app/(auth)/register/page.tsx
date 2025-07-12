// app/(auth)/register/page.tsx
import { RegisterPage } from "@/components/auth/register-page";
import { AuthLayout } from "@/components/layout/auth-layout";

export default function Register() {
  return (
    <AuthLayout>
      <RegisterPage />
    </AuthLayout>
  );
}
