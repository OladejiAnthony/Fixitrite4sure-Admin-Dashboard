//components/rules/account-usage.tsx
// src/pages/account-usage.tsx

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserActivityTab } from "../account-usage/UserActivityTab";
import { AccountStatusTab } from "../account-usage/AccountStatusTab";
import { LoginHistoryTab } from "../account-usage/LoginHistoryTab";
import { UserMetricsTab } from "../account-usage/UserMetricsTab";

export default function AccountUsage() {
  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Account Usage</h2>
        <p className="text-sm text-gray-500">
          View user activity, login history, account status and metrics.
        </p>
      </div>

      <Tabs defaultValue="user-activity" className="w-full ">
        <TabsList className="space-x-5 mb-2">
          <TabsTrigger value="user-activity">User activity</TabsTrigger>
          <TabsTrigger value="account-status">Account status</TabsTrigger>
          <TabsTrigger value="login-history">Login history</TabsTrigger>
          <TabsTrigger value="user-metrics">User Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="user-activity">
          <UserActivityTab />
        </TabsContent>

        <TabsContent value="account-status">
          <AccountStatusTab />
        </TabsContent>

        <TabsContent value="login-history">
          <LoginHistoryTab />
        </TabsContent>

        <TabsContent value="user-metrics">
          <UserMetricsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
