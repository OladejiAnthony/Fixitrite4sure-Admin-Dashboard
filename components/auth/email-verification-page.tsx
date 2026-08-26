//components/auth/email-verification-page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { authService } from "@/lib/auth-service";

const RESEND_COOLDOWN_SECONDS = 30;

const otpSchema = z.object({
  code: z
    .string()
    .length(6, "Enter all 6 digits")
    .regex(/^\d{6}$/, "Code must contain only numbers"),
});

type OtpForm = z.infer<typeof otpSchema>;

export function EmailVerificationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const onSubmit = async (data: OtpForm) => {
    if (!email) {
      toast.error("Missing email address. Please sign up again.");
      return;
    }

    setIsLoading(true);

    try {
      await authService.verifyEmail({ email, token: data.code });
      toast.success("Email verified! Please log in to continue.");
      router.push("/login");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Verification failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Missing email address. Please sign up again.");
      return;
    }

    setIsResending(true);

    try {
      await authService.resendVerificationCode(email);
      toast.success("Verification code resent!");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to resend code. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="h-[90vh]">
      <CardHeader>
        <CardTitle className="text-center text-[#202224] font-nunito-sans text-[32px] font-bold tracking-[-0.114px]">
          Verify Your Email
        </CardTitle>
        <CardDescription className="text-center text-primary font-nunito-sans text-[18px] tracking-[-0.064px]">
          {email
            ? `Enter the 6-digit code sent to ${email}`
            : "Enter the 6-digit code sent to your email"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col items-center space-y-6"
        >
          <Controller
            name="code"
            control={control}
            render={({ field }) => (
              <InputOTP
                maxLength={6}
                value={field.value}
                onChange={field.onChange}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            )}
          />
          {errors.code && (
            <p className="text-sm text-destructive">{errors.code.message}</p>
          )}

          <Button
            type="submit"
            className="w-full bg-[#0586CF] text-white hover:bg-[#046FA2] transition-colors rounded-xl py-6"
            disabled={isLoading}
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="font-nunito-sans text-primary text-[16px] tracking-[-0.064px]">
            {"Didn't receive the code? "}
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending || cooldown > 0}
              className="text-[#0586CF] font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
            >
              {cooldown > 0
                ? `Resend code in ${cooldown}s`
                : isResending
                ? "Resending..."
                : "Resend verification code"}
            </button>
          </p>
        </div>

        <div className="mt-4 text-center text-sm">
          <Link href="/login" className="text-primary hover:underline">
            Back to Sign In
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
