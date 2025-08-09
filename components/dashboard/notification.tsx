//components/dashboard/notification.tsx
"use client";
import { useNotifications } from "@/hooks/useNotifications";
import { format } from "date-fns";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { User } from "lucide-react"; // For avatar icon

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
    <div className="p-6 space-y-8 ">
      <h1 className="text-xl font-bold">NOTIFICATIONS</h1>
      {["today", "yesterday", "earlier"].map(
        (section) =>
          grouped[section as keyof typeof grouped].length > 0 && (
            <div key={section} className="bg-white pb-2">
              <h3 className="text-lg font-semibold capitalize mb-4">
                {section}
              </h3>
              <ul className="space-y-3">
                {grouped[section as keyof typeof grouped].map((n) => (
                  <li
                    key={n.id}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-md hover:bg-muted hover:m-2",
                      highlightId === n.id.toString() && "bg-muted m-2"
                    )}
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0 mt-1">
                      <div className="bg-muted rounded-full p-2">
                        <User className="w-5 h-5 text-muted-foreground" />
                        {/*
                          <Image
  src="/path/to/avatar.jpg"
  alt="User Avatar"
  width={32}
  height={32}
  className="rounded-full"
/>

                        */}
                      </div>
                    </div>

                    {/* Notification Text */}
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{n.type}:</p>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(n.createdAt), "p")}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {n.message}{" "}
                        <button
                          className=" underline ml-1 text-[#333] font-bold"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View details
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )
      )}
    </div>
  );
}
