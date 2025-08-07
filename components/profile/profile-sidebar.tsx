//components/profile/profile-sidebar.tsx
"use client";
import React from "react";

export type ProfileTab =
  | "userInfo"
  | "accountSettings"
  | "activityFeed"
  | "systemActivity";

interface Props {
  active: ProfileTab;
  onChange: (tab: ProfileTab) => void;
}

const tabLabels: Record<ProfileTab, string> = {
  userInfo: "User Information",
  accountSettings: "Account Settings",
  activityFeed: "Activity Feed",
  systemActivity: "System Activity",
};

export function ProfileSidebar({ active, onChange }: Props) {
  return (
    <div className="w-full max-w-[260px] h-[70vh] rounded-2xl border bg-white p-4">
      <h3 className="text-sm font-semibold mb-4">PROFILE</h3>
      <div className="flex flex-col space-y-2">
        {(Object.keys(tabLabels) as Array<ProfileTab>).map((key) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`text-left px-4 py-2 rounded-lg flex items-center gap-2 font-medium text-sm transition ${
              active === key
                ? "bg-[#E7EEFF] text-[#4880FF]"
                : "text-[#555] hover:bg-gray-100"
            }`}
          >
            {tabLabels[key]}
          </button>
        ))}
      </div>
    </div>
  );
}
