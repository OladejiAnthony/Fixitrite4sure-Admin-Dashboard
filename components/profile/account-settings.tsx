//components/profile/account-settings.tsx
"use client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { useState } from "react";

// ----------------- Zod Schema -----------------
const schema = z
  .object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export function AccountSettingsTab() {
  const { user } = useSelector((state: RootState) => state.auth);
  const queryClient = useQueryClient();

  const [settings, setSettings] = useState({
    messageNotification: true,
    feedbackNotification: true,
    userNotification: true,
    contentNotification: true,
  });

  // ----------------- Update Notification Toggles -----------------
  const toggleNotification = (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);

    toast.success(`${key.replace(/([A-Z])/g, " $1")} updated`, {
      description: `${newSettings[key] ? "Enabled" : "Disabled"}`,
    });

    // You can also call a mock endpoint here:
    apiClient.patch(`/users/${user?.id}`, {
      [key]: newSettings[key],
    });
  };

  // ----------------- Update Password Mutation -----------------
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiClient.get(`/users/${user?.id}`);
      const userData = res.data;

      if (userData.password !== data.currentPassword) {
        throw new Error("Current password is incorrect");
      }

      return apiClient.patch(`/users/${user?.id}`, {
        password: data.newPassword,
      });
    },
    onSuccess: () => {
      toast.success("Password updated successfully!");
      reset();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update password.");
    },
  });

  // ----------------- Delete Account Mutation -----------------
  const deleteUserMutation = useMutation({
    mutationFn: () => apiClient.delete(`/users/${user?.id}`),
    onSuccess: () => {
      toast.success("Account deleted!");
      queryClient.invalidateQueries(); // optional: invalidate cache
    },
    onError: () => toast.error("Failed to delete account"),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormValues) => {
    updatePasswordMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* NOTIFICATION SETTINGS */}
      <div className="rounded-2xl bg-[#F8FAFC] p-6 space-y-4">
        <h3 className="font-semibold text-sm text-[#1A3B6F]">
          NOTIFICATION SETTINGS
        </h3>

        <div className="flex items-center justify-between text-sm">
          <div>
            <p className="font-medium">Message notifications</p>
            <p className="text-xs text-muted-foreground">
              Get notified when someone messages you
            </p>
          </div>
          <Switch
            checked={settings.messageNotification}
            onCheckedChange={() => toggleNotification("messageNotification")}
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <div>
            <p className="font-medium">Feedback notifications</p>
            <p className="text-xs text-muted-foreground">
              Get notified on reviews or feedback you get
            </p>
          </div>
          <Switch
            checked={settings.feedbackNotification}
            onCheckedChange={() => toggleNotification("feedbackNotification")}
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <div>
            <p className="font-medium">User notifications</p>
            <p className="text-xs text-muted-foreground">
              Get notified when new users register
            </p>
          </div>
          <Switch
            checked={settings.userNotification}
            onCheckedChange={() => toggleNotification("userNotification")}
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <div>
            <p className="font-medium">Content notifications</p>
            <p className="text-xs text-muted-foreground">
              Get notified on new content posted
            </p>
          </div>
          <Switch
            checked={settings.contentNotification}
            onCheckedChange={() => toggleNotification("contentNotification")}
          />
        </div>
      </div>

      {/* PASSWORD CHANGE */}
      <div className="rounded-2xl bg-[#F8FAFC] p-6 space-y-4">
        <h3 className="font-semibold text-sm text-[#1A3B6F]">
          PASSWORD AND SECURITY
        </h3>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Input
            type="password"
            placeholder="Current Password"
            {...register("currentPassword")}
          />
          {errors.currentPassword && (
            <p className="text-red-500 text-xs">
              {errors.currentPassword.message}
            </p>
          )}

          <Input
            type="password"
            placeholder="New Password"
            {...register("newPassword")}
          />
          {errors.newPassword && (
            <p className="text-red-500 text-xs">{errors.newPassword.message}</p>
          )}

          <Input
            type="password"
            placeholder="Confirm Password"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs">
              {errors.confirmPassword.message}
            </p>
          )}

          <div className="col-span-2 flex justify-end">
            <Button
              type="submit"
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              {updatePasswordMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </div>

      {/* DELETE ACCOUNT */}
      <div className="rounded-2xl bg-[#F8FAFC] p-6">
        <h3 className="font-semibold text-sm text-[#1A3B6F]">DELETE ACCOUNT</h3>
        <div className="flex flex-col justify-between items-start space-y-2">
          <p className="text-xs mt-2 text-muted-foreground">
            When you delete an account, you lose access to your files and data
            permanently. Do you still want to delete your account?
          </p>
          <Button
            onClick={() => deleteUserMutation.mutate()}
            variant="destructive"
            className="mt-4 self-end bg-red-500 text-white hover:bg-red-600"
          >
            {deleteUserMutation.isPending ? "Deleting..." : "Delete Account"}
          </Button>
        </div>
      </div>
    </div>
  );
}
