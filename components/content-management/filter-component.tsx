//filter-component.tsx
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
//import { Filter } from "lucide-react";
import Image from "next/image";

interface FilterComponentProps {
  filterValue: string;
  onFilterChange: (value: string) => void;
}

export function FilterComponent({
  filterValue,
  onFilterChange,
}: FilterComponentProps) {
  return (
    <div className="flex items-center gap-2">
      {/* <Filter className="h-4 w-4 text-[#134CA1]" /> */}
      <Image
        src="/images/Filter.png"
        alt="Filter"
        className="h-4 w-4"
        height={16}
        width={16}
      />
      <Select value={filterValue} onValueChange={onFilterChange}>
        <SelectTrigger className="w-[130px] h-10 border-gray-300">
          <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="Blog Post">Blog Post</SelectItem>
          <SelectItem value="Video">Video</SelectItem>
          <SelectItem value="Article">Article</SelectItem>
          <SelectItem value="Infographic">Infographic</SelectItem>
          <SelectItem value="Podcast">Podcast</SelectItem>
          <SelectItem value="Guide">Guide</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
