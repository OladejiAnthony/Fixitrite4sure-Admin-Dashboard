//components/auth/register-page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);

    try {
      const { user } = await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if (user) {
        try {
          await authService.grantAdminAccess(user.id);
        } catch {
          toast.error(
            "Account created, but admin access couldn't be granted automatically. Contact an existing admin."
          );
        }
      }

      toast.success("Registration successful! Please verify your email.");
      router.push(`/email-verification?email=${encodeURIComponent(data.email)}`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const labelClass =
    "font-nunito-sans text-[15px] font-medium tracking-[-0.064px] leading-normal";
  const inputClass =
    "h-11 rounded-lg border border-[#D8D8D8] bg-[#F2F2F2] text-primary font-nunito-sans text-[15px] tracking-[-0.064px]";

  return (
    <Card>
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-center text-[#202224] font-nunito-sans text-[28px] font-bold tracking-[-0.114px]">
          Create Account
        </CardTitle>
        <CardDescription className="text-center text-primary font-nunito-sans text-[16px] tracking-[-0.064px]">
          Register for a new admin account
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className={labelClass}>
              Full Name
            </Label>
            <Input
              id="name"
              placeholder="Enter your full name"
              {...register("name")}
              className={inputClass}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className={labelClass}>
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register("email")}
              className={inputClass}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className={labelClass}>
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              {...register("password")}
              className={inputClass}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className={labelClass}>
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              {...register("confirmPassword")}
              className={inputClass}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-[#0586CF] text-white hover:bg-[#046FA2] transition-colors rounded-xl h-12 text-[15px] font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-5 text-center text-[14px] font-nunito-sans">
          Already have an account?{" "}
          <Link href="/login" className="text-primary tracking-[-0.064px] hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
