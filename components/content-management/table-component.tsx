//table-component.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { useRouter } from "next/navigation";

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

interface TableComponentProps {
  data: ContentItem[];
}

export function TableComponent({ data }: TableComponentProps) {
  const router = useRouter();

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "default";
      case "pending":
        return "secondary";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "rejected":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleViewMore = (contentId: string) => {
    router.push(`/content-management/review/${contentId}`);
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#CEE0FC] py-3 px-2">
            <TableHead className="font-semibold text-[#586986] text-xs">
              CONTENT ID
            </TableHead>
            <TableHead className="font-semibold text-[#586986] text-xs">
              NAME
            </TableHead>
            <TableHead className="font-semibold text-[#586986] text-xs">
              CONTENT TYPE
            </TableHead>
            <TableHead className="font-semibold text-[#586986] text-xs">
              PROPERTIES
            </TableHead>
            <TableHead className="font-semibold text-[#586986] text-xs">
              STATUS
            </TableHead>
            <TableHead className="font-semibold text-[#586986] text-xs">
              DATE POSTED
            </TableHead>
            <TableHead className="font-semibold text-[#586986] text-xs">
              ENGAGEMENT
            </TableHead>
            <TableHead className="font-semibold text-[#586986] flex justify-end items-center">
              <Image
                src="/images/More.png"
                alt="More icon"
                width={20}
                height={20}
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id} className="hover:bg-gray-50">
              <TableCell className="font-medium">{item.id}</TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-500">{item.email}</div>
                </div>
              </TableCell>
              <TableCell>{item.contentType}</TableCell>
              <TableCell>{item.properties}</TableCell>
              <TableCell>
                <Badge
                  variant={getStatusVariant(item.status)}
                  className={getStatusColor(item.status)}
                >
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(item.datePosted)}</TableCell>
              <TableCell>{item.engagement.toLocaleString()}</TableCell>
              <TableCell className="flex flex-row justify-end items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewMore(item.id)}
                  className="text-[#516684] hover:text-blue-500 hover:bg-blue-50 flex justify-end items-center gap-2"
                >
                  <span className="">View More</span>
                  <Image
                    src="/images/More.png"
                    alt="More icon"
                    width={20}
                    height={20}
                  />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
