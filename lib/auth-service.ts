//lib/auth-service.ts
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const verifyEmailSchema = z.object({
  email: z.string().email(),
  token: z.string().length(6),
});

export const authService = {
  async login(credentials: z.infer<typeof loginSchema>) {
    const { email, password } = loginSchema.parse(credentials);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);

    return { user: data.user, session: data.session };
  },

  async register(userData: z.infer<typeof registerSchema>) {
    const { name, email, password } = registerSchema.parse(userData);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) throw new Error(error.message);

    return { user: data.user, session: data.session };
  },

  async verifyEmail(payload: z.infer<typeof verifyEmailSchema>) {
    const { email, token } = verifyEmailSchema.parse(payload);
    const supabase = createClient();

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "signup",
    });

    if (error) throw new Error(error.message);

    return { user: data.user, session: data.session };
  },

  async resendVerificationCode(email: string) {
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: z.string().email().parse(email),
    });

    if (error) throw new Error(error.message);
  },

  async resetPassword(email: string) {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (error) throw new Error(error.message);
  },

  async logout() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },
};
