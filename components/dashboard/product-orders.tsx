"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Package, DollarSign, User, Store, Calendar } from "lucide-react"
import { useProductOrders } from "@/hooks/use-product-orders"

export function ProductOrders() {
  const { data: orders, isLoading } = useProductOrders()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredOrders = orders?.filter(
    (order) =>
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vendorName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Product Orders</h1>
          <p className="text-muted-foreground">Manage product orders and purchases</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Order
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Orders</CardTitle>
          <CardDescription>Find orders by customer or vendor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredOrders?.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold">Order #{order.id}</span>
                    <Badge
                      variant={
                        order.status === "delivered" ? "default" : order.status === "shipped" ? "secondary" : "outline"
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>Customer: {order.customerName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Store className="h-4 w-4 text-muted-foreground" />
                      <span>Vendor: {order.vendorName}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Ordered: {new Date(order.orderDate).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-lg font-semibold">${order.totalAmount}</span>
                  </div>

                  <div className="text-sm">
                    <p className="font-medium">Products:</p>
                    <div className="space-y-1">
                      {order.products.map((product, index) => (
                        <div key={index} className="text-muted-foreground">
                          {product.name} - Qty: {product.quantity} - ${product.price}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-sm">
                    <p className="font-medium">Shipping Address:</p>
                    <p className="text-muted-foreground">{order.shippingAddress}</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    Track Order
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders?.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No orders found matching your search.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
