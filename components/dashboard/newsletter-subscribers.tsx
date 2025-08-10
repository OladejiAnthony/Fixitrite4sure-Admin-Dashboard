//components/dashboard/newsletter-subscribers.tsx
"use client";
import React, { useState } from "react";

import Analytics from "../newsletter-subscribers/analytics";
import SubscriberList from "../newsletter-subscribers/subscriber-list";
import SubscriberDetails from "../newsletter-subscribers/subscriber-details";
import {
  NewsletterSidebar,
  SubscriberTab,
} from "../newsletter-subscribers/newsletter-sidebar";

export function NewslettersSubscribers() {
  const [activeTab, setActiveTab] = useState<SubscriberTab>("analytics");

  const renderTab = () => {
    switch (activeTab) {
      case "analytics":
        return <Analytics />;
      case "subscriberList":
        return <SubscriberList />;
      case "subscriberDetails":
        return <SubscriberDetails />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 bg-[#FAFAFA]">
      <div className="md:w-[280px]">
        <NewsletterSidebar active={activeTab} onChange={setActiveTab} />
      </div>
      <div className="flex-1 space-y-6">{renderTab()}</div>
    </div>
  );
}
