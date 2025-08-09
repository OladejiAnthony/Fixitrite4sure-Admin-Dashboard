//components/dashboard/profile.tsx
"use client";
import React, { useState } from "react";

import { RulesSidebar, RulesTab } from "../rules/rules-sidebar";
import { GeneralRules } from "../rules/general-rules";
import AccountUsage from "../rules/account-usage";
import { ContentGuidelines } from "../rules/content-guidelines";
import { PrivacySecurity } from "../rules/privacy-security";
import { PaymentTerms } from "../rules/payment-terms";

export function Rules() {
  const [activeTab, setActiveTab] = useState<RulesTab>("generalRules");

  const renderTab = () => {
    switch (activeTab) {
      case "generalRules":
        return <GeneralRules />;
      case "accountUsage":
        return <AccountUsage />;
      case "contentGuidelines":
        return <ContentGuidelines />;
      case "privacySecurity":
        return <PrivacySecurity />;
      case "paymentTerms":
        return <PaymentTerms />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 bg-[#FAFAFA]">
      <div className="md:w-[280px]">
        <RulesSidebar active={activeTab} onChange={setActiveTab} />
      </div>
      <div className="flex-1 space-y-6">{renderTab()}</div>
    </div>
  );
}
