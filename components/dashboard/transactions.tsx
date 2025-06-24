"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, DollarSign, Calendar, CreditCard } from "lucide-react"
import { useTransactions } from "@/hooks/use-transactions"

export function Transactions() {
  const { data: transactions, isLoading } = useTransactions()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredTransactions = transactions?.filter(
    (transaction) =>
      transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transactions</h1>
        <p className="text-muted-foreground">View and manage all payment transactions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Transactions</CardTitle>
          <CardDescription>Find transactions by customer or type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredTransactions?.map((transaction) => (
          <Card key={transaction.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-lg font-semibold">${transaction.amount}</span>
                    <Badge variant={transaction.status === "completed" ? "default" : "secondary"}>
                      {transaction.status}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>Customer: {transaction.customerName}</span>
                    <span>•</span>
                    <span>Type: {transaction.type.replace("_", " ")}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(transaction.date).toLocaleDateString()}</span>
                    <CreditCard className="h-4 w-4 ml-4" />
                    <span>{transaction.paymentMethod.replace("_", " ")}</span>
                  </div>

                  {transaction.repairerName && (
                    <div className="text-sm text-muted-foreground">Repairer: {transaction.repairerName}</div>
                  )}

                  {transaction.vendorName && (
                    <div className="text-sm text-muted-foreground">Vendor: {transaction.vendorName}</div>
                  )}
                </div>

                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTransactions?.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No transactions found matching your search.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
