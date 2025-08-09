//components/account-usage/UserMetricsTab.tsx
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { differenceInDays, parseISO, isToday, subDays } from "date-fns";

export function UserMetricsTab() {
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await apiClient.get("/users");
      return res.data;
    },
  });

  // Daily Metrics
  const totalLoginToday = users.flatMap((user: any) =>
    (user.loginHistory || []).filter((login: any) =>
      isToday(parseISO(login.date))
    )
  ).length;

  const activeUsersToday = users.filter(
    (user: any) =>
      user.activityStatus === "Active" &&
      (user.loginHistory || []).some((login: any) =>
        isToday(parseISO(login.date))
      )
  ).length;

  const newUsersToday = users.filter((user: any) =>
    isToday(parseISO(user.createdAt))
  ).length;

  // Weekly Metrics
  const totalLoginThisWeek = users.flatMap((user: any) =>
    (user.loginHistory || []).filter((login: any) => {
      const date = parseISO(login.date);
      return date >= subDays(new Date(), 7);
    })
  ).length;

  const activeUsersThisWeek = users.filter(
    (user: any) =>
      user.activityStatus === "Active" &&
      (user.loginHistory || []).some((login: any) => {
        const date = parseISO(login.date);
        return date >= subDays(new Date(), 7);
      })
  ).length;

  const newUsersThisWeek = users.filter((user: any) => {
    const date = parseISO(user.createdAt);
    return date >= subDays(new Date(), 7);
  }).length;

  return (
    <div className="p-6 bg-white rounded-xl border border-gray-200">
      {/* Daily Report */}
      <h2 className="text-base font-semibold text-gray-800 mb-4">
        Daily Report
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MetricCard label="Total Login Today" value={totalLoginToday} />
        <MetricCard label="Active Users Today" value={activeUsersToday} />
        <MetricCard label="New Users Today" value={newUsersToday} />
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-4" />

      {/* Weekly Report */}
      <h2 className="text-base font-semibold text-gray-800 mb-4">
        Weekly Report
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard label="Total Login" value={totalLoginThisWeek} />
        <MetricCard label="Active Users" value={activeUsersThisWeek} />
        <MetricCard label="New Users" value={newUsersThisWeek} />
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-4 py-6 flex flex-col items-center justify-center">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">
        {value.toLocaleString()}
      </p>
    </div>
  );
}
