//components/auth/login-page.tsx
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  // app/login/page.tsx
  // Update the login success handler
  const onSubmit = async (data: LoginForm) => {
    console.log("Login started with data:", data); // Debug log
    setIsLoading(true);
    dispatch(loginStart());

    try {
      const response = await authService.login(data);
      localStorage.setItem("auth-token", response.token);

      // Make sure this matches exactly what your authReducer expects
      dispatch(
        loginSuccess({
          user: {
            id: response.user.id,
            name: response.user.name,
            email: response.user.email,
            role: response.user.role,
          },
          token: response.token,
        })
      );

      toast.success("Login successful!");
      router.push("/dashboard");
    } catch (error) {
      dispatch(loginFailure());
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-[90vh]">
      <CardHeader>
        <CardTitle className="text-center text-[#202224] font-nunito-sans text-[32px] font-bold tracking-[-0.114px]">
          Login
        </CardTitle>
        <CardDescription className="text-center text-primary font-nunito-sans text-[18px]  tracking-[-0.064px]">
          Please enter your email and password to Log in
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className=" font-nunito-sans text-[18px] font-medium tracking-[-0.064px] leading-normal"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@fixit.com"
              {...register("email")}
              className="bg-[#F2F2F2] h-[40px] rounded-lg border border-[#D8D8D8] text-primary font-nunito-sans text-[18px]  tracking-[-0.064px]"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className=" font-nunito-sans text-[18px] font-medium tracking-[-0.064px] leading-normal"
            >
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register("password")}
              className="h-[40px] rounded-lg border border-[#D8D8D8] bg-[#F2F2F2] text-primary font-nunito-sans text-[18px]  tracking-[-0.064px]"
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-[#0586CF] text-white hover:bg-[#046FA2] transition-colors rounded-xl py-6"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="flex justify-between items-center mt-4">
          <div className="mt-4 text-center text-sm">
            <p className=" font-nunito-sans text-primary text-[18px] font-medium tracking-[-0.064px]">
              Remember Password
            </p>
          </div>
          <div className="mt-4 text-center text-sm">
            <Link
              href="/forgot-password"
              className="text-primary hover:underline  font-nunito-sans text-[18px] font-medium tracking-[-0.064px]"
            >
              Forgot your password?
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-[16px]">
          {"Don't have an account? "}
          <Link
            href="/register"
            className=" text-primary font-nunito-sans text-[18px]  tracking-[-0.064px] hover:underline"
          >
            Sign up
          </Link>
        </div>

        {/* <div className="mt-4 p-3 bg-muted rounded-md">
          <p className="text-xs text-muted-foreground">
            <strong>Demo credentials:</strong>
            <br />
            Email: admin@fixit.com
            <br />
            Password: password123
          </p>
        </div>
         */}
      </CardContent>
    </Card>
  );
}
