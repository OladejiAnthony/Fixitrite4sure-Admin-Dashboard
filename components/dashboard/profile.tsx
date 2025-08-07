//components/dashboard/profile.tsx
"use client";
import React, { useState } from "react";
import {
  ProfileSidebar,
  ProfileTab,
} from "@/components/profile/profile-sidebar";
import { UserInfoTab } from "@/components/profile/user-info";
import { AccountSettingsTab } from "@/components/profile/account-settings";
import { ActivityFeedTab } from "@/components/profile/activity-feed";
import { SystemActivityTab } from "@/components/profile/system-activity";

export function Profile() {
  const [activeTab, setActiveTab] = useState<ProfileTab>("userInfo");

  const renderTab = () => {
    switch (activeTab) {
      case "userInfo":
        return <UserInfoTab />;
      case "accountSettings":
        return <AccountSettingsTab />;
      case "activityFeed":
        return <ActivityFeedTab />;
      case "systemActivity":
        return <SystemActivityTab />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 bg-[#FAFAFA]">
      <div className="md:w-[280px]">
        <ProfileSidebar active={activeTab} onChange={setActiveTab} />
      </div>
      <div className="flex-1 space-y-6">{renderTab()}</div>
    </div>
  );
}
