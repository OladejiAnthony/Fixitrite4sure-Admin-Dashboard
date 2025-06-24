"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Calendar, DollarSign, User, Wrench } from "lucide-react"
import { useRepairBookings } from "@/hooks/use-repair-bookings"

export function RepairBookings() {
  const { data: bookings, isLoading } = useRepairBookings()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredBookings = bookings?.filter(
    (booking) =>
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.service.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Repair Bookings</h1>
          <p className="text-muted-foreground">Manage repair service bookings</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Booking
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Bookings</CardTitle>
          <CardDescription>Find bookings by customer or service</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredBookings?.map((booking) => (
          <Card key={booking.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Wrench className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold">{booking.service}</span>
                    <Badge
                      variant={
                        booking.status === "completed"
                          ? "default"
                          : booking.status === "in-progress"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {booking.status.replace("-", " ")}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>Customer: {booking.customerName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Wrench className="h-4 w-4 text-muted-foreground" />
                      <span>Repairer: {booking.repairerName}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Booked: {new Date(booking.bookingDate).toLocaleDateString()}</span>
                    </div>
                    <span>•</span>
                    <span>Scheduled: {new Date(booking.scheduledDate).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-medium">
                      Estimated: ${booking.estimatedCost}
                      {booking.actualCost && ` | Actual: $${booking.actualCost}`}
                    </span>
                  </div>

                  <div className="text-sm">
                    <p className="font-medium">Description:</p>
                    <p className="text-muted-foreground">{booking.description}</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBookings?.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No bookings found matching your search.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
