//components/profile/profile-sidebar.tsx
"use client";
import React from "react";

export type RulesTab =
  | "generalRules"
  | "accountUsage"
  | "contentGuidelines"
  | "privacySecurity"
  | "paymentTerms";

interface Props {
  active: RulesTab;
  onChange: (tab: RulesTab) => void;
}

const tabLabels: Record<RulesTab, string> = {
  generalRules: "General Rules",
  accountUsage: "Account Usage",
  contentGuidelines: "Content Gudelines",
  privacySecurity: "Privacy & Security",
  paymentTerms: "Payment Terms",
};

export function RulesSidebar({ active, onChange }: Props) {
  return (
    <div className="w-full max-w-[260px] h-[70vh] rounded-2xl border bg-white p-4">
      <h3 className="text-sm font-semibold mb-4">RULE</h3>
      <div className="flex flex-col space-y-2 ">
        {(Object.keys(tabLabels) as Array<RulesTab>).map((key) => (
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
