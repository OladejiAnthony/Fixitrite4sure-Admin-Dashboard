//components/dashboard/content-management.tsx
"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { TabsComponent } from "@/components/content-management/tabs-component";
import { SearchComponent } from "@/components/content-management/search-component";
import { FilterComponent } from "@/components/content-management/filter-component";
import { TableComponent } from "@/components/content-management/table-component";
import { PaginationComponent } from "@/components/ui/pagination-component";
import { usePagination } from "@/hooks/use-pagination";

interface ContentItem {
  id: string;
  name: string;
  email: string;
  contentType: string;
  properties: string;
  status: string;
  datePosted: string;
  engagement: number;
}

export function ContentManagement() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValue, setFilterValue] = useState("all");

  const { data: content, isLoading } = useQuery({
    queryKey: ["content"],
    queryFn: async () => {
      const response = await apiClient.get("/content");
      return response.data as ContentItem[];
    },
  });

  const filteredData = useMemo(() => {
    if (!content) return [];

    let filtered = content;

    // Filter by tab
    if (activeTab !== "all") {
      filtered = filtered.filter((item) => item.status === activeTab);
    }

    // Filter by content type
    if (filterValue !== "all") {
      filtered = filtered.filter((item) => item.contentType === filterValue);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          new Date(item.datePosted).toLocaleDateString().includes(searchTerm)
      );
    }

    return filtered;
  }, [content, activeTab, filterValue, searchTerm]);

  const {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    paginatedData,
    setCurrentPage,
    setItemsPerPage,
  } = usePagination({
    data: filteredData,
    initialItemsPerPage: 10,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex gap-4 items-center">
        <FilterComponent
          filterValue={filterValue}
          onFilterChange={setFilterValue}
        />
        <SearchComponent
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </div>

      {/* Table with Pagination */}
      <div className="border rounded-lg overflow-hidden">
        <TableComponent data={paginatedData} />
        <h1>Pagination</h1>
        {/* Pagination - Make sure this is always visible when there's data */}
        {totalItems > 0 && (
          <div className="border-t bg-white">
            <div className="bg-blue-100">
              {" "}
              {/* Temporary debug */}
              <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
                showItemsPerPage={true}
                itemsPerPageOptions={[5, 10, 20, 50]}
              />
            </div>
          </div>
        )}
      </div>

      {/* No results message */}
      {filteredData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No content found matching your criteria.
        </div>
      )}
    </div>
  );
}
