"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Truck, MapPin, Phone, Calendar } from "lucide-react"
import { useLogistics } from "@/hooks/use-logistics"

export function Logistics() {
  const { data: logistics, isLoading } = useLogistics()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredLogistics = logistics?.filter(
    (item) =>
      item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Logistics</h1>
        <p className="text-muted-foreground">Track deliveries and shipments</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Shipments</CardTitle>
          <CardDescription>Find shipments by customer or tracking number</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search shipments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredLogistics?.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Truck className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold">{item.trackingNumber}</span>
                    <Badge
                      variant={
                        item.status === "delivered" ? "default" : item.status === "in_transit" ? "secondary" : "outline"
                      }
                    >
                      {item.status.replace("_", " ")}
                    </Badge>
                  </div>

                  <div className="text-sm">
                    <p className="font-medium">Customer: {item.customerName}</p>
                    <p className="text-muted-foreground">Order ID: {item.orderId}</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">From:</p>
                        <p className="text-muted-foreground">{item.pickupAddress}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">To:</p>
                        <p className="text-muted-foreground">{item.deliveryAddress}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Est. Delivery: {new Date(item.estimatedDelivery).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="text-sm">
                    <p className="font-medium">Driver: {item.driver}</p>
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{item.driverPhone}</span>
                    </div>
                  </div>
                </div>

                <Button variant="outline" size="sm">
                  Track Package
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLogistics?.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No shipments found matching your search.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
