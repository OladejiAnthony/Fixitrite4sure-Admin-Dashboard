//components/notifications/NotificationDropdown.tsx
"use client";
import { useNotifications } from "@/hooks/useNotifications";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function NotificationDropdown() {
  const { data, isLoading } = useNotifications();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="p-4 space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  const grouped = {
    today: [] as typeof data,
    yesterday: [] as typeof data,
  };

  data.forEach((n) => {
    const date = new Date(n.createdAt).toDateString();
    if (date === today) grouped.today.push(n);
    else if (date === yesterday) grouped.yesterday.push(n);
  });

  return (
    <div className="w-auto p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">Notifications</h3>
        <Button
          variant="link"
          size="sm"
          onClick={() => router.push("/notifications")}
        >
          View all
        </Button>
      </div>
      {["today", "yesterday"].map(
        (section) =>
          grouped[section as keyof typeof grouped].length > 0 && (
            <div key={section} className="mb-4">
              <p className="text-xs font-medium text-muted-foreground mb-1 capitalize">
                {section}
              </p>
              <ul className="space-y-2">
                {grouped[section as keyof typeof grouped].map((n) => (
                  <li
                    key={n.id}
                    className="text-sm border p-2 rounded hover:bg-muted cursor-pointer"
                    onClick={() =>
                      router.push(`/notifications?highlight=${n.id}`)
                    }
                  >
                    <p>{n.message}</p>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(n.createdAt), "p")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )
      )}
    </div>
  );
}
