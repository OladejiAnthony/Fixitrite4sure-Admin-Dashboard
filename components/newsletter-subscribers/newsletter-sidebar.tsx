//components\newsletter-subscribers\newsletter-sidebar.tsx
"use client";
import React from "react";

export type SubscriberTab =
  | "analytics"
  | "subscriberList"
  | "subscriberDetails";

interface Props {
  active: SubscriberTab;
  onChange: (tab: SubscriberTab) => void;
}

const tabLabels: Record<SubscriberTab, string> = {
  analytics: "Analytics",
  subscriberList: "Subscriber List ",
  subscriberDetails: "Subscriber Details",
};

export function NewsletterSidebar({ active, onChange }: Props) {
  return (
    <div className="w-full max-w-[260px] h-[70vh] rounded-2xl border bg-white p-4">
      <h3 className="text-[18px] font-semibold mb-4">Newsletter Subscribers</h3>
      <div className="flex flex-col space-y-2 ">
        {(Object.keys(tabLabels) as Array<SubscriberTab>).map((key) => (
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
