// app/(auth)/email-verification/page.tsx
import { Suspense } from "react";
import { EmailVerificationPage } from "@/components/auth/email-verification-page";
import { AuthLayout } from "@/components/layout/auth-layout";

export default function EmailVerification() {
  return (
    <AuthLayout>
      <Suspense fallback={null}>
        <EmailVerificationPage />
      </Suspense>
    </AuthLayout>
  );
}
