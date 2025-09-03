// app/(dashboard)/e-repair/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from "@/components/common/pagination";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { Search, Filter } from "lucide-react";
import { format, parse, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox as CheckboxComponent } from "@/components/ui/checkbox";

const filterSchema = z.object({
  search: z.string().optional(),
  dateInput: z.string().optional(),
  serviceTypes: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  statuses: z.array(z.string()).optional(),
});

type FilterForm = z.infer<typeof filterSchema>;

interface Booking {
  id: string;
  repairId: string;
  customerName: string;
  category: string;
  bookingDate: string;
  serviceType: string;
  technician: string;
  bookingStatus: string;
  initialCost: number;
  paymentStatus: string;
  customerPhone: string;
  customerAddress: string;
  deviceType: string;
  issueDescription: string;
  scheduledTime: string;
  priority: string;
}

interface Repair {
  id: string;
  repairId: string;
  technician: string;
  repairStatus: string;
  startDate: string;
  completionDate: string;
  totalCost: number;
  paymentStatus: string;
  repairConfirmation: string;
  partsUsed: string[];
  laborHours: number;
  warranty: string;
  notes: string;
}

interface Discovery {
  id: string;
  repairId: string;
  discovery: string;
  description: string;
  discoveryDate: string;
  invoiceAmount: number;
  paymentStatus: string;
  technician: string;
  images: string[];
  priority: string;
  customerApproval: string;
}

interface ERepairReport {
  id: string;
  reportName: string;
  type: string;
  period: string;
  generatedDate: string;
  totalRevenue: number;
  status: string;
  downloads: number;
  repairsCompleted: number;
  averageCompletionTime: string;
  customerSatisfaction: string;
}

export default function ERepairPage() {
  const router = useRouter();
  const { currentPage, itemsPerPage } = useSelector(
    (state: RootState) => state.pagination
  );
  const [activeTab, setActiveTab] = React.useState("bookings");
  const [isServiceModalOpen, setIsServiceModalOpen] = React.useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = React.useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = React.useState(false);

  const form = useForm<FilterForm>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      search: "",
      dateInput: "",
      serviceTypes: [],
      categories: [],
      statuses: [],
    },
  });
  const filters = form.watch();

  // Fetch all data for each tab
  const { data: allBookings } = useQuery<Booking[]>({
    queryKey: ["all-bookings"],
    queryFn: async () => {
      const res = await apiClient.get("/e-repairBookings");
      return res.data as Booking[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: allRepairs } = useQuery<Repair[]>({
    queryKey: ["all-repairs"],
    queryFn: async () => {
      const res = await apiClient.get("/e-repairRepairs");
      return res.data as Repair[];
    },
  });

  const { data: allDiscoveries } = useQuery<Discovery[]>({
    queryKey: ["all-discoveries"],
    queryFn: async () => {
      const res = await apiClient.get("/e-repairDiscovery");
      return res.data as Discovery[];
    },
  });

  const { data: allReports } = useQuery<ERepairReport[]>({
    queryKey: ["all-e-repair-reports"],
    queryFn: async () => {
      const res = await apiClient.get("/e-repairReports");
      return res.data as ERepairReport[];
    },
  });

  // Filter and paginate data based on active tab
  const getFilteredData = () => {
    let data: any[] = [];
    let filteredData: any[] = [];

    // Helper function to normalize dates for comparison
    const normalizeDate = (dateString: string | undefined): string | null => {
      if (!dateString) return null;

      try {
        // Try parsing with date-fns format first
        const parsedDate = parse(dateString, "yyyy-MM-dd", new Date());
        if (isValid(parsedDate)) {
          return format(parsedDate, "yyyy-MM-dd");
        }

        // If that fails, try parsing as ISO string
        const date = new Date(dateString);
        if (isValid(date)) {
          return format(date, "yyyy-MM-dd");
        }

        return null;
      } catch (error) {
        console.error("Error parsing date:", error);
        return null;
      }
    };

    switch (activeTab) {
      case "bookings":
        data = allBookings || [];
        if (filters.search) {
          data = data.filter(
            (b: Booking) =>
              b.customerName.toLowerCase().includes(filters.search!.toLowerCase()) ||
              b.repairId.includes(filters.search!)
          );
        }
        if (filters.dateInput) {
          const targetDate = normalizeDate(filters.dateInput);
          if (targetDate) {
            data = data.filter((b: Booking) => {
              const bookingDate = normalizeDate(b.bookingDate);
              return bookingDate === targetDate;
            });
          }
        }
        if (filters.serviceTypes && filters.serviceTypes.length > 0) {
          data = data.filter((b: Booking) => filters.serviceTypes!.includes(b.serviceType));
        }
        if (filters.categories && filters.categories.length > 0) {
          data = data.filter((b: Booking) => filters.categories!.includes(b.category));
        }
        if (filters.statuses && filters.statuses.length > 0) {
          data = data.filter((b: Booking) => filters.statuses!.includes(b.bookingStatus));
        }
        break;
      case "repairs":
        data = allRepairs || [];
        if (filters.search) {
          data = data.filter(
            (r: Repair) =>
              r.technician.toLowerCase().includes(filters.search!.toLowerCase()) ||
              r.repairId.includes(filters.search!)
          );
        }
        if (filters.dateInput) {
          const targetDate = normalizeDate(filters.dateInput);
          if (targetDate) {
            data = data.filter((r: Repair) => {
              const repairDate = normalizeDate(r.startDate);
              return repairDate === targetDate;
            });
          }
        }
        if (filters.statuses && filters.statuses.length > 0) {
          data = data.filter((r: Repair) => filters.statuses!.includes(r.repairStatus));
        }
        break;
      case "discovery":
        data = allDiscoveries || [];
        if (filters.search) {
          data = data.filter(
            (d: Discovery) =>
              d.discovery.toLowerCase().includes(filters.search!.toLowerCase()) ||
              d.repairId.includes(filters.search!)
          );
        }
        if (filters.dateInput) {
          const targetDate = normalizeDate(filters.dateInput);
          if (targetDate) {
            data = data.filter((d: Discovery) => {
              const discoveryDate = normalizeDate(d.discoveryDate);
              return discoveryDate === targetDate;
            });
          }
        }
        if (filters.statuses && filters.statuses.length > 0) {
          data = data.filter((d: Discovery) => filters.statuses!.includes(d.paymentStatus));
        }
        break;
      case "reports":
        data = allReports || [];
        if (filters.search) {
          data = data.filter(
            (r: ERepairReport) =>
              r.reportName.toLowerCase().includes(filters.search!.toLowerCase()) ||
              r.id.includes(filters.search!)
          );
        }
        if (filters.dateInput) {
          const targetDate = normalizeDate(filters.dateInput);
          if (targetDate) {
            data = data.filter((r: ERepairReport) => {
              const reportDate = normalizeDate(r.generatedDate);
              return reportDate === targetDate;
            });
          }
        }
        break;
    }

    const start = (currentPage - 1) * itemsPerPage;
    filteredData = data.slice(start, start + itemsPerPage);
    return { data, filteredData };
  };


  const { data, filteredData } = getFilteredData();
  const totalItems = data.length;

  const getStatusColor = (
    status: string,
    type: "status" | "payment" | "confirmation" | "report"
  ) => {
    if (type === "status") {
      if (status === "In Progress") return "bg-[#E5D9F2] text-[#6A1B9A]";
      if (status === "Completed") return "bg-[#D4F4E2] text-[#1B5E20]";
      if (status === "Cancelled") return "bg-[#FFEBEE] text-[#B71C1C]";
    } else if (type === "payment") {
      if (status === "Paid") return "bg-[#D4F4E2] text-[#1B5E20]";
      if (status === "Unpaid") return "bg-[#FFEBEE] text-[#B71C1C]";
      if (status === "Partial") return "bg-[#FFF3E0] text-[#EF6C00]";
      if (status === "Pending") return "bg-[#E5D9F2] text-[#6A1B9A]";
      if (status === "Refunded") return "bg-[#E0E0E0] text-[#424242]";
    } else if (type === "confirmation") {
      if (status === "Confirmed") return "bg-[#D4F4E2] text-[#1B5E20]";
      if (status === "Pending") return "bg-[#E5D9F2] text-[#6A1B9A]";
      if (status === "N/A") return "bg-[#E0E0E0] text-[#424242]";
    } else if (type === "report") {
      if (status === "Completed") return "bg-[#D4F4E2] text-[#1B5E20]";
      if (status === "Processing") return "bg-[#FFF3E0] text-[#EF6C00]";
    }
    return "text-muted-foreground";
  };

  const handleReset = () => {
    form.reset();
  };

  const handleRowClick = (id: string) => {
    const tabToPath: Record<string, string> = {
      bookings: "e-bookings",
      repairs: "e-repairs",
      discovery: "e-product", // This should work if your file is at app/(dashboard)/e-repair/e-product/[id]/page.tsx
      reports: "e-report",
    };
    router.push(`/e-repair/${tabToPath[activeTab]}/${id}`);
  };

  const ServiceModal = () => {
    const [selected, setSelected] = React.useState<string[]>(filters.serviceTypes || []);
    const options = ["Home", "Workshop", "Pickup", "VIP"];

    const toggle = (value: string) => {
      setSelected((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
      );
    };

    return (
      <Dialog open={isServiceModalOpen} onOpenChange={setIsServiceModalOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="h-8 w-[180px] justify-start text-sm font-normal"
          >
            <Filter className="mr-2 h-4 w-4" />
            {filters.serviceTypes?.length ? `${filters.serviceTypes.length} selected` : "Service Type"}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[300px] p-4">
          <DialogHeader>
            <DialogTitle className="text-left">Service Type</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col space-y-2 py-2">
            {options.map((opt) => (
              <Button
                key={opt}
                variant="ghost"
                className={cn(
                  "justify-start font-normal rounded-[17px]",
                  selected.includes(opt) ? "bg-[#0586CF] text-white" : "hover:bg-[#0586CF] hover:text-white"
                )}
                onClick={() => toggle(opt)}
              >
                {opt}
              </Button>
            ))}
          </div>
          <div className="flex justify-end border-t pt-4">
            <Button
              className="h-8 rounded-full bg-[#0586CF] text-white"
              onClick={() => {
                form.setValue("serviceTypes", selected);
                setIsServiceModalOpen(false);
              }}
            >
              Apply
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const CategoryModal = () => {
    const [selected, setSelected] = React.useState<string[]>(filters.categories || []);
    const options = ["Gadgets", "Electrical", "Automobile", "Plumbing"];

    const toggle = (value: string) => {
      setSelected((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
      );
    };

    return (
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="h-8 w-[180px] justify-start text-sm font-normal"
          >
            <Filter className="mr-2 h-4 w-4" />
            {filters.categories?.length ? `${filters.categories.length} selected` : "Category"}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[300px] p-4">
          <DialogHeader>
            <DialogTitle className="text-left">Category</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col space-y-2 py-2">
            {options.map((opt) => (
              <Button
                key={opt}
                variant="ghost"
                className={cn(
                  "justify-start font-normal rounded-[17px]",
                  selected.includes(opt) ? "bg-[#0586CF] text-white" : "hover:bg-[#0586CF] hover:text-white"
                )}
                onClick={() => toggle(opt)}
              >
                {opt}
              </Button>
            ))}
          </div>
          <div className="flex justify-end border-t pt-4">
            <Button
              className="h-8 rounded-full bg-[#0586CF] text-white"
              onClick={() => {
                form.setValue("categories", selected);
                setIsCategoryModalOpen(false);
              }}
            >
              Apply
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const StatusModal = () => {
    const [selected, setSelected] = React.useState<string[]>(filters.statuses || []);
    const options = ["In Progress", "Completed", "Cancelled"];

    const toggle = (value: string) => {
      setSelected((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
      );
    };

    return (
      <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="h-8 w-[180px] justify-start text-sm font-normal"
          >
            <Filter className="mr-2 h-4 w-4" />
            {filters.statuses?.length ? `${filters.statuses.length} selected` : "Status"}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[300px] p-4">
          <DialogHeader>
            <DialogTitle className="text-left">Status</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col space-y-2 py-2">
            {options.map((opt) => (
              <Button
                key={opt}
                variant="ghost"
                className={cn(
                  "justify-start font-normal rounded-[17px]",
                  selected.includes(opt) ? "bg-[#0586CF] text-white" : "hover:bg-[#0586CF] hover:text-white"
                )}
                onClick={() => toggle(opt)}
              >
                {opt}
              </Button>
            ))}
          </div>
          <div className="flex justify-end border-t pt-4">
            <Button
              className="h-8 rounded-full bg-[#0586CF] text-white"
              onClick={() => {
                form.setValue("statuses", selected);
                setIsStatusModalOpen(false);
              }}
            >
              Apply
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const renderBookingsTable = () => (
    <Table>
      <TableHeader>
        <TableRow className="bg-[#CEE0FC] hover:bg-[#CEE0FC]">
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            REPAIR ID
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            CUSTOMER NAME
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            CATEGORY
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            BOOKING DATE
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            SERVICE TYPE
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            TECHNICIAN
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            BOOKING STATUS
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            INITIAL COST
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            PAYMENT STATUS
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredData.map((booking: Booking) => (
          <TableRow
            key={booking.id}
            onClick={() => handleRowClick(booking.id)}
            className="cursor-pointer border-b border-gray-200 hover:bg-gray-50"
          >
            <TableCell className="px-4 py-3 text-sm text-gray-900">
              {booking.repairId}
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-900">
              {booking.customerName}
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-900">
              {booking.category}
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-900">
              {booking.bookingDate}
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-900">
              {booking.serviceType}
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-900">
              {booking.technician}
            </TableCell>
            <TableCell className="px-4 py-3 text-sm">
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                  booking.bookingStatus,
                  "status"
                )}`}
              >
                {booking.bookingStatus}
              </span>
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-900">
              &#8358;{(booking.initialCost || 0).toLocaleString("en-US")}
            </TableCell>
            <TableCell className="px-4 py-3 text-sm">
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                  booking.paymentStatus,
                  "payment"
                )}`}
              >
                {booking.paymentStatus}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderRepairsTable = () => (
    <Table>
      <TableHeader>
        <TableRow className="bg-[#CEE0FC] hover:bg-[#CEE0FC]">
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            REPAIR ID
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            TECHNICIAN
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            REPAIR STATUS
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            START DATE
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            COMPLETION DATE
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            TOTAL COST
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            PAYMENT STATUS
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            REPAIR CONFIRMATION
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredData.map((repair: Repair) => (
          <TableRow
            key={repair.id}
            onClick={() => handleRowClick(repair.id)}
            className="cursor-pointer border-b border-gray-200 hover:bg-gray-50"
          >
            <TableCell className="px-4 py-3 text-sm text-gray-900">
              {repair.repairId}
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-900">
              {repair.technician}
            </TableCell>
            <TableCell className="px-4 py-3 text-sm">
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                  repair.repairStatus,
                  "status"
                )}`}
              >
                {repair.repairStatus}
              </span>
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-900">
              {repair.startDate}
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-900">
              {repair.completionDate || "-"}
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-900">
              &#8358;{(repair?.totalCost || 0).toLocaleString("en-US")}

            </TableCell>
            <TableCell className="px-4 py-3 text-sm">
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                  repair.paymentStatus,
                  "payment"
                )}`}
              >
                {repair.paymentStatus}
              </span>
            </TableCell>
            <TableCell className="px-4 py-3 text-sm">
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                  repair.repairConfirmation,
                  "confirmation"
                )}`}
              >
                {repair.repairConfirmation}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderDiscoveryTable = () => (
    <Table>
      <TableHeader>
        <TableRow className="bg-[#CEE0FC] hover:bg-[#CEE0FC]">
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            REPAIR ID
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            DISCOVERY
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            DESCRIPTION
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            DISCOVERY DATE
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            INVOICE AMOUNT
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            PAYMENT STATUS
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredData.map((discovery: Discovery) => (
          <TableRow
            key={discovery.id}
            onClick={() => handleRowClick(discovery.id)}
            className="cursor-pointer border-b border-gray-200 hover:bg-gray-50"
          >
            <TableCell className="px-4 py-3 text-sm text-gray-900">
              {discovery.repairId}
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-900">
              {discovery.discovery}
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-900">
              {discovery.description}
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-900">
              {discovery.discoveryDate}
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-900">
              &#8358;{(discovery?.invoiceAmount || 0).toLocaleString("en-US")}
            </TableCell>
            <TableCell className="px-4 py-3 text-sm">
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                  discovery.paymentStatus,
                  "payment"
                )}`}
              >
                {discovery.paymentStatus}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderReportsTable = () => (
    <Table>
      <TableHeader>
        <TableRow className="bg-[#CEE0FC] hover:bg-[#CEE0FC]">
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            Report ID
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            Report Name
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            Type
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            Period
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            Generated Date
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            Total Revenue
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            Status
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            Downloads
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredData.map((report: ERepairReport) => (
          <TableRow
            key={report.id}
            onClick={() => handleRowClick(report.id)}
            className="cursor-pointer border-b border-gray-200 hover:bg-gray-50"
          >
            <TableCell className="px-4 py-3 text-sm text-gray-900">
              {report.id}
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-900">
              {report.reportName}
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-900">
              {report.type}
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-900">
              {report.period}
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-900">
              {report.generatedDate}
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-900">
              &#8358;{(report.totalRevenue || 0).toLocaleString("en-US")}
            </TableCell>
            <TableCell className="px-4 py-3 text-sm">
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                  report.status,
                  "report"
                )}`}
              >
                {report.status}
              </span>
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-900">
              {report.downloads}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="flex h-12 items-center px-6 text-lg font-semibold text-gray-800">
        E-REPAIR
      </div>
      <Tabs defaultValue="bookings" className="px-6" onValueChange={setActiveTab}>
        <div className="mb-4 flex items-end justify-between">
          <TabsList className="bg-transparent p-0">
            <TabsTrigger
              value="bookings"
              className="h-10 rounded-none border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-500 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:shadow-none"
            >
              Bookings
            </TabsTrigger>
            <TabsTrigger
              value="repairs"
              className="h-10 rounded-none border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-500 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:shadow-none"
            >
              Repairs
            </TabsTrigger>
            <TabsTrigger
              value="discovery"
              className="h-10 rounded-none border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-500 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:shadow-none"
            >
              Discovery
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="h-10 rounded-none border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-500 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:shadow-none"
            >
              Reports
            </TabsTrigger>
          </TabsList>
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search"
              className="h-8 rounded-full pl-8 text-sm"
              {...form.register("search")}
            />
          </div>
        </div>
        <div className="mb-4 flex items-end space-x-2">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">
              Filter By
            </label>
            <Input
              placeholder="Date (YYYY-MM-DD)"
              className="h-8 w-[180px] text-sm"
              {...form.register("dateInput")}
            />
          </div>
          <ServiceModal />
          <CategoryModal />
          <StatusModal />
          <Button
            variant="destructive"
            className="h-8 rounded-full bg-red-500 text-sm text-white hover:bg-red-600"
            onClick={handleReset}
          >
            Reset Filter
          </Button>
        </div>
        <TabsContent value="bookings" className="mt-0">
          {renderBookingsTable()}
          <Pagination totalItems={totalItems} />
        </TabsContent>
        <TabsContent value="repairs" className="mt-0">
          {renderRepairsTable()}
          <Pagination totalItems={totalItems} />
        </TabsContent>
        <TabsContent value="discovery" className="mt-0">
          {renderDiscoveryTable()}
          <Pagination totalItems={totalItems} />
        </TabsContent>
        <TabsContent value="reports" className="mt-0">
          {renderReportsTable()}
          <Pagination totalItems={totalItems} />
        </TabsContent>
      </Tabs>
    </div>
  );
}