//components/dashboard/send-push-noti.tsx
// components/dashboard/send-push-noti.tsx
"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

export function SendPushNotification() {
  const { user } = useSelector((state: RootState) => state.auth);

  const [settings, setSettings] = useState({
    messageNotification: true,
    feedbackNotification: true,
    userNotification: true,
    contentNotification: true,
  });

  // Toggle logic same as account-settings.tsx
  const toggleNotification = (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);

    toast.success(`${key.replace(/([A-Z])/g, " $1")} updated`, {
      description: `${newSettings[key] ? "Enabled" : "Disabled"}`,
    });

    apiClient.patch(`/users/${user?.id}`, {
      [key]: newSettings[key],
    });
  };

  return (
    <div className="rounded-[10px] bg-white border border-[#E5E7EB] shadow-sm">
      {/* Header */}
      <div className="px-6 pt-5 pb-4">
        <h3 className="text-[15px] font-semibold text-black tracking-[0.2px]">
          NOTIFICATION SETTINGS
        </h3>
      </div>

      {/* Body */}
      <div className="px-6 pb-6 space-y-6">
        {/* Row: Message notifications */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-medium text-black leading-[18px]">
              Message notifications
            </p>
            <p className="text-[12px] text-[#6B7280] leading-[16px]">
              Get notified on every message you receive
            </p>
          </div>
          <Switch
            checked={settings.messageNotification}
            onCheckedChange={() => toggleNotification("messageNotification")}
          />
        </div>

        {/* Row: Feedback notifications */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-medium text-black leading-[18px]">
              Feedback notifications
            </p>
            <p className="text-[12px] text-[#6B7280] leading-[16px]">
              Get notified on every feedback you get
            </p>
          </div>
          <Switch
            checked={settings.feedbackNotification}
            onCheckedChange={() => toggleNotification("feedbackNotification")}
          />
        </div>

        {/* Row: User notifications */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-medium text-black leading-[18px]">
              User notifications
            </p>
            <p className="text-[12px] text-[#6B7280] leading-[16px]">
              Get notified on every new user
            </p>
          </div>
          <Switch
            checked={settings.userNotification}
            onCheckedChange={() => toggleNotification("userNotification")}
          />
        </div>

        {/* Row: Content notifications */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-medium text-black leading-[18px]">
              Content notifications
            </p>
            <p className="text-[12px] text-[#6B7280] leading-[16px]">
              Get notified on every content posted
            </p>
          </div>
          <Switch
            checked={settings.contentNotification}
            onCheckedChange={() => toggleNotification("contentNotification")}
          />
        </div>
      </div>
    </div>
  );
}
