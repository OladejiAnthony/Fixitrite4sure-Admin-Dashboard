// components/newsletter-subscribers/subscriber-details.tsx
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import React from "react";

interface Activity {
  date: string;
  activity: string;
}

interface Subscriber {
  id: number;
  name: string;
  email: string;
  subscriptionDate: string;
  subscriptionStatus: string;
  activityLog?: Activity[]; // Make activityLog optional
}

const fetchSubscriber = async (): Promise<Subscriber> => {
  const { data } = await apiClient.get<Subscriber[]>("/newsletter");
  return (
    data[0] || {
      // Provide fallback object if data[0] is undefined
      id: 0,
      name: "",
      email: "",
      subscriptionDate: "",
      subscriptionStatus: "",
      activityLog: [],
    }
  );
};

export default function SubscriberDetails() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["subscriberDetails"],
    queryFn: fetchSubscriber,
  });

  if (isLoading) {
    return <div className="p-4 text-sm text-gray-500">Loading...</div>;
  }

  if (isError || !data) {
    return (
      <div className="p-4 text-sm text-red-500">
        Failed to load subscriber details.
      </div>
    );
  }

  // Ensure activityLog is always an array
  const activityLog = data.activityLog || [];

  return (
    <div className="bg-white rounded-lg border border-gray-200 w-full gap-y-6">
      {/* Subscriber Details */}
      <div>
        <div className="bg-[#D1D8E233] w-full py-[12px] px-[18px]">
          <h2 className="text-sm font-semibold text-gray-500 mb-3">
            SUBSCRIBER DETAILS
          </h2>
        </div>
        <div className="px-5 pt-4 pb-3 border-gray-200">
          <div className="space-y-2">
            <div className="flex">
              <span className="w-40 text-sm font-medium text-gray-500">
                Name:
              </span>
              <span className="text-sm text-gray-900">{data.name}</span>
            </div>
            <div className="flex">
              <span className="w-40 text-sm font-medium text-gray-500">
                Email:
              </span>
              <span className="text-sm text-gray-900">{data.email}</span>
            </div>
            <div className="flex">
              <span className="w-40 text-sm font-medium text-gray-500">
                Subscription Date:
              </span>
              <span className="text-sm text-gray-900">
                {data.subscriptionDate}
              </span>
            </div>
            <div className="flex">
              <span className="w-40 text-sm font-medium text-gray-500">
                Subscription Status:
              </span>
              <span className="text-sm text-gray-900">
                {data.subscriptionStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="mt-4">
        <div className="bg-[#D1D8E233] w-full py-[12px] px-[18px]">
          <h2 className="text-sm font-semibold text-gray-500 mb-3">
            ACTIVITY LOG
          </h2>
        </div>
        <div className="px-5 pt-4 pb-3">
          <div className="space-y-2">
            {activityLog.length > 0 ? (
              activityLog.map((log, index) => (
                <div key={index} className="flex">
                  <span className="w-40 text-sm text-gray-900">{log.date}</span>
                  <span className="text-sm text-gray-900">{log.activity}</span>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">No activity found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
