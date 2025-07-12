// app/(auth)/login/page.tsx
import { LoginPage } from "@/components/auth/login-page";
import { AuthLayout } from "@/components/layout/auth-layout";

export default function Login() {
  return (
    <AuthLayout>
      <LoginPage />
    </AuthLayout>
  );
}
