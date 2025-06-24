"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Wrench, Calendar, DollarSign, TrendingUp, Package, CheckCircle, Clock } from "lucide-react"
import { useDashboardStats } from "@/hooks/use-dashboard-stats"

export function DashboardHome() {
  const { data: stats, isLoading } = useDashboardStats()

  if (isLoading) {
    return <div>Loading...</div>
  }

  const statCards = [
    {
      title: "Total Customers",
      value: stats?.totalCustomers || 0,
      icon: Users,
      description: "Active customers",
      trend: "+12%",
    },
    {
      title: "Total Repairers",
      value: stats?.totalRepairers || 0,
      icon: Wrench,
      description: "Registered repairers",
      trend: "+8%",
    },
    {
      title: "Total Bookings",
      value: stats?.totalBookings || 0,
      icon: Calendar,
      description: "All time bookings",
      trend: "+15%",
    },
    {
      title: "Total Revenue",
      value: `$${stats?.totalRevenue?.toLocaleString() || 0}`,
      icon: DollarSign,
      description: "Total earnings",
      trend: "+23%",
    },
    {
      title: "Active Repairs",
      value: stats?.activeRepairs || 0,
      icon: Clock,
      description: "Currently in progress",
      trend: "+5%",
    },
    {
      title: "Completed Repairs",
      value: stats?.completedRepairs || 0,
      icon: CheckCircle,
      description: "Successfully completed",
      trend: "+18%",
    },
    {
      title: "Pending Orders",
      value: stats?.pendingOrders || 0,
      icon: Package,
      description: "Awaiting processing",
      trend: "-3%",
    },
    {
      title: "Monthly Growth",
      value: `${stats?.monthlyGrowth || 0}%`,
      icon: TrendingUp,
      description: "Growth this month",
      trend: "+2%",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your FixIt admin dashboard</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                <span
                  className={`inline-flex items-center ${
                    card.trend.startsWith("+") ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {card.trend}
                </span>{" "}
                from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New repair booking received</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Repair completed successfully</p>
                  <p className="text-xs text-muted-foreground">15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New repairer registered</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <button className="flex items-center justify-start space-x-2 p-2 rounded-md hover:bg-muted transition-colors">
                <Users className="h-4 w-4" />
                <span className="text-sm">Manage Customers</span>
              </button>
              <button className="flex items-center justify-start space-x-2 p-2 rounded-md hover:bg-muted transition-colors">
                <Wrench className="h-4 w-4" />
                <span className="text-sm">View Repairers</span>
              </button>
              <button className="flex items-center justify-start space-x-2 p-2 rounded-md hover:bg-muted transition-colors">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Check Bookings</span>
              </button>
              <button className="flex items-center justify-start space-x-2 p-2 rounded-md hover:bg-muted transition-colors">
                <Package className="h-4 w-4" />
                <span className="text-sm">Process Orders</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
