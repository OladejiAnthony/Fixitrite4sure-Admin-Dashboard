//components/auth/login-page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { useDispatch } from "react-redux";
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from "@/store/slices/auth-slice";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (searchParams.get("error") === "unauthorized") {
      toast.error(
        "Your account doesn't have admin access yet. Contact an existing admin to get access."
      );
    }
  }, [searchParams]);

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    dispatch(loginStart());

    try {
      const { user, session } = await authService.login(data);

      if (!user) {
        throw new Error("Login failed. Please try again.");
      }

      dispatch(loginSuccess({ user, session }));

      toast.success("Login successful!");
      router.push("/dashboard");
    } catch (error) {
      dispatch(loginFailure());
      const message =
        error instanceof Error
          ? error.message
          : "Login failed. Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-center text-[#202224] font-nunito-sans text-[28px] font-bold tracking-[-0.114px]">
          Login
        </CardTitle>
        <CardDescription className="text-center text-primary font-nunito-sans text-[16px] tracking-[-0.064px]">
          Please enter your email and password to log in
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
              placeholder="admin@fixit.com"
              {...register("email")}
              className="bg-[#F2F2F2] h-11 rounded-lg border border-[#D8D8D8] text-primary font-nunito-sans text-[15px] tracking-[-0.064px]"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="password"
              className="font-nunito-sans text-[15px] font-medium tracking-[-0.064px] leading-normal"
            >
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register("password")}
              className="h-11 rounded-lg border border-[#D8D8D8] bg-[#F2F2F2] text-primary font-nunito-sans text-[15px] tracking-[-0.064px]"
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}

            <div className="flex justify-end pt-0.5">
              <Link
                href="/forgot-password"
                className="text-primary hover:underline font-nunito-sans text-[14px] font-medium tracking-[-0.064px]"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#0586CF] text-white hover:bg-[#046FA2] transition-colors rounded-xl h-12 text-[15px] font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-5 text-center text-[14px] font-nunito-sans">
          {"Don't have an account? "}
          <Link
            href="/register"
            className="text-primary tracking-[-0.064px] hover:underline font-medium"
          >
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
