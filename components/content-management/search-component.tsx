//search-component.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchComponentProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
}

export function SearchComponent({
  searchTerm,
  onSearchChange,
  placeholder = "Search by Name & Email",
}: SearchComponentProps) {
  return (
    <div className="relative w-full max-w-[492px]">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md bg-[#CEE0FC] p-2.5 pl-[35px]"
      />
    </div>
  );
}
