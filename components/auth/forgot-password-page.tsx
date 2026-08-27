"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { authService } from "@/lib/auth-service";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);

    try {
      await authService.resetPassword(data.email);
      setIsSubmitted(true);
      toast.success("Password reset instructions sent to your email!");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to send reset instructions. Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card>
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-center text-[#202224] font-nunito-sans text-[28px] font-bold tracking-[-0.114px]">
            Check Your Email
          </CardTitle>
          <CardDescription className="text-center text-primary font-nunito-sans text-[16px] tracking-[-0.064px]">
            We've sent password reset instructions to your email address.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            <Button
              variant="outline"
              onClick={() => setIsSubmitted(false)}
              className="w-full h-12 text-[15px] font-medium rounded-xl"
            >
              Try Again
            </Button>
            <div className="text-center text-[14px] font-nunito-sans">
              <Link href="/login" className="text-primary hover:underline font-medium">
                Back to Sign In
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-center text-[#202224] font-nunito-sans text-[28px] font-bold tracking-[-0.114px]">
          Forgot Password
        </CardTitle>
        <CardDescription className="text-center text-primary font-nunito-sans text-[16px] tracking-[-0.064px]">
          Enter your email address and we'll send you instructions to reset your
          password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <Label
              htmlFor="email"
              className="font-nunito-sans text-[15px] font-medium tracking-[-0.064px] leading-normal"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              {...register("email")}
              className="h-11 rounded-lg border border-[#D8D8D8] bg-[#F2F2F2] text-primary font-nunito-sans text-[15px] tracking-[-0.064px]"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-[#0586CF] text-white hover:bg-[#046FA2] transition-colors rounded-xl h-12 text-[15px] font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Reset Instructions"}
          </Button>
        </form>

        <div className="mt-5 text-center text-[14px] font-nunito-sans">
          Remember your password?{" "}
          <Link href="/login" className="text-primary tracking-[-0.064px] hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
