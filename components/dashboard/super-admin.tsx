"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, Users, Settings, Database, Activity, AlertTriangle } from "lucide-react"

export function SuperAdmin() {
  const adminActions = [
    {
      title: "User Management",
      description: "Manage all user accounts and permissions",
      icon: Users,
      action: "Manage Users",
      status: "active",
    },
    {
      title: "System Settings",
      description: "Configure global system settings",
      icon: Settings,
      action: "Configure",
      status: "active",
    },
    {
      title: "Database Management",
      description: "Monitor and manage database operations",
      icon: Database,
      action: "View Database",
      status: "active",
    },
    {
      title: "System Monitoring",
      description: "Monitor system performance and health",
      icon: Activity,
      action: "View Metrics",
      status: "warning",
    },
    {
      title: "Security Audit",
      description: "Review security logs and audit trails",
      icon: Shield,
      action: "View Audit",
      status: "active",
    },
    {
      title: "System Alerts",
      description: "Manage system alerts and notifications",
      icon: AlertTriangle,
      action: "View Alerts",
      status: "error",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Super Admin</h1>
        <p className="text-muted-foreground">Advanced system administration and management</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {adminActions.map((action) => (
          <Card key={action.title}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <action.icon className="h-8 w-8 text-primary" />
                <Badge
                  variant={
                    action.status === "active" ? "default" : action.status === "warning" ? "secondary" : "destructive"
                  }
                >
                  {action.status}
                </Badge>
              </div>
              <CardTitle className="text-lg">{action.title}</CardTitle>
              <CardDescription>{action.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">{action.action}</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system health and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Server Status</span>
                <Badge variant="default">Online</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Database</span>
                <Badge variant="default">Connected</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">API Services</span>
                <Badge variant="default">Running</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Background Jobs</span>
                <Badge variant="secondary">Processing</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Admin Actions</CardTitle>
            <CardDescription>Latest administrative activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">User permissions updated</p>
                  <p className="text-xs text-muted-foreground">5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">System backup completed</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Security audit initiated</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
