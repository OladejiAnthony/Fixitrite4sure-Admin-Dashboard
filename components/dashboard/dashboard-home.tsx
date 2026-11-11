//components/dashboard/dashboard-home.tsx
"use client"

import * as z from "zod"
import { useAdminActivities } from "@/hooks/use-admin-activities"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Pagination } from "@/components/common/pagination"
import { useSelector } from "react-redux"
import type { RootState } from "@/store/store"


// Row shape of public.admin_activity_log, served by /api/admin/activities.
const ActivitySchema = z.object({
  id: z.string(),
  admin_name: z.string(),
  action: z.string(),
  description: z.string(),
  target_type: z.string().nullable(),
  target_id: z.string().nullable(),
  status: z.string(),
  created_at: z.string(),
})

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const day = date.getDate()
  const month = date.toLocaleString("default", { month: "long" })
  const year = date.getFullYear()

  const ordinal = (n: number): string => {
    const s = ["th", "st", "nd", "rd"]
    const v = n % 100
    return n + (s[(v - 20) % 10] || s[v] || s[0])
  }

  return `${ordinal(day)} ${month} ${year}`
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).toLowerCase()
  return time.replace(" ", "")
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "success":
    case "approved":
      return "bg-green-100 text-green-800"
    case "failed":
    case "rejected":
      return "bg-red-100 text-red-800"
    case "pending":
      return "bg-orange-100 text-orange-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function DashboardHome() {
  const { data, isLoading, isError } = useAdminActivities()
  const { currentPage, itemsPerPage } = useSelector((state: RootState) => state.pagination)

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen text-lg text-gray-600">Loading...</div>
  }

  const parsed = z.array(ActivitySchema).safeParse(data)
  const activities = parsed.success ? parsed.data : []
  const loadFailed = isError || (data !== undefined && !parsed.success)

  const totalItems = activities.length
  const start = (currentPage - 1) * itemsPerPage
  const end = start + itemsPerPage
  const paginatedActivities = activities.slice(start, end)

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">DASHBOARD</h1>

      <div className="bg-blue-950 h-[200px] flex flex-col justify-center items-center  text-white text-center py-18 px-12 rounded-lg">
        <h2 className="text-3xl font-bold leading-tight mb-2">Have access to adverts information and payment details</h2>
        <p className="text-xs uppercase tracking-wider mb-8">PROMOTIONAL ADS</p>
        <Link href="/advertisement-banners">
          <Button className="bg-white h-[52px] w-[583px] text-[#1A1A1A] hover:bg-gray-100 px-6 py-2 rounded-md text-sm font-medium">
            View Adverts
          </Button>
        </Link>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent activity</h3>
        <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100 border-b border-gray-200">
                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DATE</TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TIME</TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIVITY</TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ADMIN&apos;S NAME</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedActivities.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                    {loadFailed ? "Could not load recent activity. Please refresh the page." : "No admin activity yet."}
                  </TableCell>
                </TableRow>
              )}
              {paginatedActivities.map((activity) => (
                <TableRow key={activity.id} className="border-b border-gray-200 last:border-b-0">
                  <TableCell className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{formatDate(activity.created_at)}</TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{formatTime(activity.created_at)}</TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-900">{activity.description}</TableCell>
                  <TableCell className="px-4 py-3">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}
                    >
                      {activity.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-900">{activity.admin_name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Pagination totalItems={totalItems} />
      </div>
    </div>
  )
}

