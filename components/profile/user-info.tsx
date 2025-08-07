//components/profile/user-info.tsx
"use client";
import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import type { User } from "@/types/profile";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Define validation schema with Zod
const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  bio: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

export function UserInfoTab() {
  const { user } = useSelector((state: RootState) => state.auth);
  console.log("Redux user:", user); // Add this line
  const queryClient = useQueryClient();

  // Fetch user data with React Query
  // Add better error handling
  const {
    data: userData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["user", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");
      const res = await apiClient.get(`/users/${user.id}`);
      return res.data as User;
    },
    enabled: !!user?.id,
    retry: false, // Don't retry if it fails
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: (data: Partial<User>) => {
      if (!user?.id) throw new Error("User not authenticated");
      return apiClient.patch(`/users/${user.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", user?.id] });
    },
  });

  // Initialize form with react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: userData || {},
  });

  // Reset form when userData changes
  useEffect(() => {
    if (userData) {
      reset(userData);
    }
  }, [userData, reset]);

  const onSubmit = async (data: UserFormData) => {
    try {
      await updateUserMutation.mutateAsync(data);
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  if (isLoading) return <div>Loading user info...</div>;
  if (isError) return <div>Error loading user: {error.message}</div>;
  if (!userData) return <div>User not found</div>;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm space-y-8">
      <h2 className="text-lg font-semibold mb-2">Personal Information</h2>

      {updateUserMutation.isError && (
        <div className="text-red-600">
          Failed to save changes. Please try again.
        </div>
      )}
      {updateUserMutation.isSuccess && (
        <div className="text-green-600">Profile updated successfully.</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Profile Picture */}
        <div className="flex items-center space-x-4">
          <Image
            src={
              userData.profileImage || "/placeholder.svg?height=100&width=100"
            }
            alt="Profile"
            width={80}
            height={80}
            className="rounded-full object-cover"
          />
          <div>
            <p className="text-sm font-semibold">Edit Image</p>
            <p className="text-xs text-blue-500 cursor-pointer">Change Image</p>
          </div>
        </div>

        {/* Name, Email, Phone, Role */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium mb-1">First Name</label>
            <Input
              {...register("name", {
                setValueAs: (v) => {
                  const parts = v.split(" ");
                  return `${parts[0]} ${
                    userData.name?.split(" ")[1] || ""
                  }`.trim();
                },
              })}
              defaultValue={userData.name?.split(" ")[0] || ""}
              placeholder="First Name"
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Last Name</label>
            <Input
              {...register("name", {
                setValueAs: (v) => {
                  const parts = userData.name?.split(" ") || ["", ""];
                  return `${parts[0] || ""} ${v}`.trim();
                },
              })}
              defaultValue={userData.name?.split(" ")[1] || ""}
              placeholder="Last Name"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">
              Email Address
            </label>
            <Input type="email" {...register("email")} placeholder="Email" />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">
              Phone Number
            </label>
            <Input {...register("phone")} placeholder="Phone" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Role</label>
            <Input
              value={userData.role || ""}
              readOnly
              className="bg-gray-100"
            />
          </div>
        </div>

        {/* Address Section */}
        <div>
          <h3 className="text-md font-semibold mb-2 text-[#1A3B6F]">Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium mb-1">Country</label>
              <Input {...register("country")} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">State</label>
              <Input {...register("state")} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">City</label>
              <Input {...register("city")} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">
                Postal Code
              </label>
              <Input {...register("postalCode")} />
            </div>
          </div>
        </div>

        {/* Bio */}
        <div>
          <h3 className="text-md font-semibold mb-2 text-[#1A3B6F]">Bio</h3>
          <textarea
            rows={4}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
            placeholder="Tell us more about yourself..."
            {...register("bio")}
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={updateUserMutation.isPending || !isDirty}
            className="bg-[#0586CF] text-white hover:bg-[#0478B9] transition-colors px-6 py-2 rounded-md"
          >
            {updateUserMutation.isPending ? "Saving..." : "Update"}
          </Button>
        </div>
      </form>
    </div>
  );
}
