// app/(dashboard)/notifications/page.tsx
import { Suspense } from "react";
import NotificationsPage from "@/components/dashboard/notification";

export default function NotificationPage() {
  return (
    <Suspense fallback={<div>Loading notifications...</div>}>
      <NotificationsPage />
    </Suspense>
  );
}