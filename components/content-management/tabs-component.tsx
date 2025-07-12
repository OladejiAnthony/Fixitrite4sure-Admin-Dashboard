//tabs-component.tsx
"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TabsComponentProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function TabsComponent({ activeTab, onTabChange }: TabsComponentProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-[50%] grid-cols-4 bg-gray-100">
        <TabsTrigger
          value="all"
          className="data-[state=active]:bg-white data-[state=active]:text-black"
        >
          All
        </TabsTrigger>
        <TabsTrigger
          value="approved"
          className="data-[state=active]:bg-white data-[state=active]:text-black"
        >
          Approved
        </TabsTrigger>
        <TabsTrigger
          value="pending"
          className="data-[state=active]:bg-white data-[state=active]:text-black"
        >
          Pending Review
        </TabsTrigger>
        <TabsTrigger
          value="rejected"
          className="data-[state=active]:bg-white data-[state=active]:text-black"
        >
          Rejected
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
