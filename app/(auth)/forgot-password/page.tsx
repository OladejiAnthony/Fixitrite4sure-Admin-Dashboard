// app/(auth)/forgot-password/page.tsx
import { ForgotPasswordPage } from "@/components/auth/forgot-password-page";
import { AuthLayout } from "@/components/layout/auth-layout";

export default function ForgotPassword() {
  return (
    <AuthLayout>
      <ForgotPasswordPage />
    </AuthLayout>
  );
}
