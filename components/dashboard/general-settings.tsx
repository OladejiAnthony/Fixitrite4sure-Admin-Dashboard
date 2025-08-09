//components/dashboard/general-settings.tsx
"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

const settingsSchema = z.object({
  adminName: z.string().min(1, "Admin name is required"),
  adminEmail: z.string().email("Invalid email address"),
  passwordPolicy: z.string().optional(),
  ipWhitelist: z.string().optional(),
  firewallEnabled: z.boolean(),
  apiKeys: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export function GeneralSettings() {
  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      try {
        const response = await apiClient.get("/settings");
        return response.data;
      } catch (error) {
        toast.error("Failed to load settings");
        throw error; // Re-throw to maintain React Query's error handling
      }
    },
  });

  const { mutate: updateSettings } = useMutation({
    mutationFn: (data: SettingsFormValues) =>
      apiClient.patch("/settings", data),
    onSuccess: () => {
      toast.success("Settings updated successfully");
    },
    onError: (error) => {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      adminName: settings?.adminName || "",
      adminEmail: settings?.adminEmail || "",
      passwordPolicy: settings?.passwordPolicy || "",
      ipWhitelist: settings?.ipWhitelist || "",
      firewallEnabled: settings?.firewallEnabled || false,
      apiKeys: settings?.apiKeys || "",
    },
  });

  // State for toggling password visibility
  const [showPasswordPolicy, setShowPasswordPolicy] = React.useState(false);
  const [showIpWhitelist, setShowIpWhitelist] = React.useState(false);
  const [showApiKeys, setShowApiKeys] = React.useState(false);

  React.useEffect(() => {
    if (settings) {
      reset({
        adminName: settings.adminName || "",
        adminEmail: settings.adminEmail || "",
        passwordPolicy: settings.passwordPolicy || "",
        ipWhitelist: settings.ipWhitelist || "",
        firewallEnabled: settings.firewallEnabled || false,
        apiKeys: settings.apiKeys || "",
      });
    }
  }, [settings, reset]);

  const onSubmit = (data: SettingsFormValues) => {
    if (!isDirty) {
      toast.info("No changes detected");
      return;
    }

    toast.promise(
      new Promise((resolve, reject) => {
        updateSettings(data, {
          onSuccess: resolve,
          onError: reject,
        });
      }),
      {
        loading: "Saving changes...",
        success: "Settings updated successfully!",
        error: "Failed to update settings",
      }
    );
  };

  const handleBackup = () => {
    toast.promise(apiClient.post("/backup"), {
      loading: "Creating backup...",
      success: () => {
        return "Backup created successfully!";
      },
      error: "Failed to create backup",
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* GENERAL SETTINGS HEADER */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">
            GENERAL SETTINGS
          </h1>
        </div>

        {/* GENERAL INFORMATION SECTION */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            GENERAL INFORMATION
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Name
              </label>
              <input
                type="text"
                {...register("adminName")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.adminName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.adminName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                {...register("adminEmail")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.adminEmail && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.adminEmail.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* SECURITY SETTINGS SECTION */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            SECURITY SETTINGS
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password Policy
              </label>
              <div className="relative">
                <input
                  type={showPasswordPolicy ? "text" : "password"}
                  {...register("passwordPolicy")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter password policy"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                  onClick={() => setShowPasswordPolicy(!showPasswordPolicy)}
                >
                  {showPasswordPolicy ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-gray-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-gray-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IP Whitelist
              </label>
              <div className="relative">
                <input
                  type={showIpWhitelist ? "text" : "password"}
                  {...register("ipWhitelist")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter IP addresses (comma separated)"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                  onClick={() => setShowIpWhitelist(!showIpWhitelist)}
                >
                  {showIpWhitelist ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-gray-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-gray-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="firewallEnabled"
                {...register("firewallEnabled")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="firewallEnabled"
                className="ml-2 block text-sm text-gray-700"
              >
                Enable Firewall
                <p className="text-xs text-gray-500 mt-1">
                  This is for the purpose of additional security
                </p>
              </label>
            </div>
          </div>
        </div>

        {/* SYSTEM SETTINGS SECTION */}
        <div className="px-6 py-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            SYSTEM SETTINGS
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Keys
              </label>
              <div className="relative">
                <input
                  type={showApiKeys ? "text" : "password"}
                  {...register("apiKeys")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter API keys"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                  onClick={() => setShowApiKeys(!showApiKeys)}
                >
                  {showApiKeys ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-gray-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-gray-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handleBackup}
                className="px-4 py-2  text-sm font-medium text-white bg-[#0586CF] hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Backup Now
              </button>
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
