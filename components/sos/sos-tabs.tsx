// components/sos/sos-tabs.tsx
"use client";

import Link from "next/link";

// Switches between the two SOS module pages.
export function SosTabs({ active }: { active: "requests" | "user-chats" }) {
  const tabs = [
    { id: "requests", label: "SOS Requests", href: "/sos-requests" },
    { id: "user-chats", label: "User Chats", href: "/sos-requests/user-chats" },
  ] as const;

  return (
    <div className="flex gap-2">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={tab.href}
          className={`rounded-md px-4 py-2 text-sm font-medium ${
            active === tab.id
              ? "bg-[#0586CF] text-white"
              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
