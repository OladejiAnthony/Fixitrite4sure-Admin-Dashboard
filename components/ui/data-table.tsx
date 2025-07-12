"use client";

import type React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// Make sure the import path is correct. If the file exists with a different name or location, update the path accordingly.
// For example, if the file is named 'PaginationComponent.tsx' in the same folder:
import { PaginationComponent } from "./pagination-component";
// Or, if the correct path is 'components/ui/PaginationComponent':
// import { PaginationComponent } from "@/components/ui/PaginationComponent";
// Update the import path below if your usePagination hook is in a different location
// import { usePagination } from "@/hooks/use-pagination";
import { usePagination } from "../../hooks/use-pagination";

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  initialItemsPerPage?: number;
  showPagination?: boolean;
  itemsPerPageOptions?: number[];
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  initialItemsPerPage = 10,
  showPagination = true,
  itemsPerPageOptions = [5, 10, 20, 50],
  className,
}: DataTableProps<T>) {
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    paginatedData,
    setCurrentPage,
    setItemsPerPage,
  } = usePagination({
    data,
    initialItemsPerPage,
  });

  const displayData = showPagination ? paginatedData : data;

  return (
    <div className={`border rounded-lg ${className}`}>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            {columns.map((column, index) => (
              <TableHead
                key={index}
                className={`font-semibold text-gray-900 ${
                  column.className || ""
                }`}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayData.map((item, rowIndex) => (
            <TableRow key={rowIndex} className="hover:bg-gray-50">
              {columns.map((column, colIndex) => (
                <TableCell key={colIndex} className={column.className || ""}>
                  {column.render
                    ? column.render(item)
                    : String(item[column.key] || "")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {showPagination && totalItems > 0 && (
        <div className="border-t">
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
            showItemsPerPage={true}
            itemsPerPageOptions={itemsPerPageOptions}
          />
        </div>
      )}

      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">No data available.</div>
      )}
    </div>
  );
}
