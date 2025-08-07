//components/dashboard/notification.tsx
"use client";
import { useNotifications } from "@/hooks/useNotifications";
import { format } from "date-fns";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

// Define a type for the notification object
type Notification = {
  id: number;
  message: string;
  createdAt: string;
};

const grouped = {
  today: [] as Notification[],
  yesterday: [] as Notification[],
  earlier: [] as Notification[],
};

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");

  if (isLoading) {
    return <div className="p-4 space-y-2">Loading notifications...</div>;
  }

  if (!data) return <div className="p-4">No notifications found.</div>;

  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  const grouped = {
    today: [] as typeof data,
    yesterday: [] as typeof data,
    earlier: [] as typeof data,
  };

  data.forEach((n) => {
    const date = new Date(n.createdAt).toDateString();
    if (date === today) grouped.today.push(n);
    else if (date === yesterday) grouped.yesterday.push(n);
    else grouped.earlier.push(n);
  });

  return (
    <div className="p-6 space-y-6 ">
      {["today", "yesterday", "earlier"].map(
        (section) =>
          grouped[section as keyof typeof grouped].length > 0 && (
            <div key={section}>
              <h3 className="text-lg font-semibold capitalize mb-3">
                {section}
              </h3>
              <ul className="space-y-2">
                {grouped[section as keyof typeof grouped].map(
                  (n: Notification) => (
                    <li
                      key={n.id}
                      className={cn(
                        "border p-3 rounded",
                        highlightId === n.id.toString()
                          ? "border-primary bg-muted"
                          : "hover:bg-muted cursor-pointer"
                      )}
                      onClick={() => {
                        // optionally handle click
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <p>{n.message}</p>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(n.createdAt), "p")}
                        </span>
                      </div>
                    </li>
                  )
                )}
              </ul>
            </div>
          )
      )}
    </div>
  );
}
