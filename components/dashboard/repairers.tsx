"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Search, Star, MapPin, Phone, Mail } from "lucide-react"
import { useRepairers } from "@/hooks/use-repairers"

export function Repairers() {
  const { data: repairers, isLoading } = useRepairers()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredRepairers = repairers?.filter(
    (repairer) =>
      repairer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repairer.specialization.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Repairers</h1>
          <p className="text-muted-foreground">Manage registered repair professionals</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Repairer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Repairers</CardTitle>
          <CardDescription>Find repairers by name or specialization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search repairers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredRepairers?.map((repairer) => (
          <Card key={repairer.id}>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={`/placeholder-user.jpg`} />
                  <AvatarFallback>{repairer.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{repairer.name}</CardTitle>
                  <CardDescription>{repairer.specialization}</CardDescription>
                </div>
                <Badge variant={repairer.status === "active" ? "default" : "secondary"}>{repairer.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">{repairer.rating}</span>
                  <span className="text-sm text-muted-foreground">({repairer.completedJobs} jobs)</span>
                </div>

                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{repairer.location}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{repairer.phone}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{repairer.email}</span>
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRepairers?.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No repairers found matching your search.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
