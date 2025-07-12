"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
// import { DataTable } from "@/components/ui/data-table";
import { DataTable } from "../ui/data-table";
import { SearchComponent } from "@/components/content-management/search-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";

interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  totalBookings: number;
  status: string;
}

export function Members() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: members, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await apiClient.get("/customers");
      return response.data as Member[];
    },
  });

  const filteredData = useMemo(() => {
    if (!members) return [];

    if (searchTerm) {
      return members.filter(
        (member) =>
          member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.phone.includes(searchTerm)
      );
    }

    return members;
  }, [members, searchTerm]);

  const columns = [
    {
      key: "id",
      header: "ID",
      className: "font-medium",
    },
    {
      key: "name",
      header: "NAME",
      render: (member: Member) => (
        <div>
          <div className="font-medium">{member.name}</div>
          <div className="text-sm text-gray-500">{member.email}</div>
        </div>
      ),
    },
    {
      key: "phone",
      header: "PHONE",
    },
    {
      key: "joinDate",
      header: "JOIN DATE",
      render: (member: Member) =>
        new Date(member.joinDate).toLocaleDateString(),
    },
    {
      key: "totalBookings",
      header: "BOOKINGS",
      className: "text-center",
    },
    {
      key: "status",
      header: "STATUS",
      render: (member: Member) => (
        <Badge variant={member.status === "active" ? "default" : "secondary"}>
          {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "ACTIONS",
      className: "text-center",
      render: (member: Member) => (
        <div className="flex items-center justify-center gap-2">
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">MEMBERS</h1>
        <p className="text-gray-600 mt-2">Manage your platform members</p>
      </div>

      {/* Search */}
      <div className="flex gap-4 items-center">
        <SearchComponent
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search members by name, email, or phone..."
        />
      </div>

      {/* Data Table with Pagination */}
      <DataTable
        data={filteredData}
        columns={columns}
        initialItemsPerPage={10}
        showPagination={true}
        itemsPerPageOptions={[5, 10, 20, 50]}
      />
    </div>
  );
}
