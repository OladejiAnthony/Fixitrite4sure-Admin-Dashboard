// app/(dashboard)/e-commerce/page.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from "@/components/common/pagination";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { Search, Filter, X } from "lucide-react";
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

const filterSchema = z.object({
  search: z.string().optional(),
  orderStatus: z.enum(["All", "Pending", "Completed"]).optional(),
  dateInput: z.string().optional(),
});

type FilterForm = z.infer<typeof filterSchema>;

interface Order {
  id: string;
  customerName: string;
  orderDate: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  shippingStatus: string;
  store: string;
  storesId?: string;
  storeName?: string;
  vendor?: string;
  transactionId?: string;
  serviceProvider?: string;
  shipmentId?: string;
  quantity?: number;
  productStatus?: string;
  productId?: string;
  productName?: string;
  shippingDate?: string;
  deliveryDate?: string;
  customerAddress?: string;
  totalPrice?: number;
}

interface Store {
  id: string;
  storeName: string;
  totalProducts: number;
  rating: number;
  lastOrderDate: string;
  status: string;
  location: string;
}

interface Product {
  id: string;
  productName: string;
  category: string;
  quantity: number;
  price: number;
  status: string;
  storeId: string;
  dateAdded: string;
}

interface Report {
  id: string;
  reportName: string;
  type: string;
  period: string;
  generatedDate: string;
  totalRevenue: number;
  status: string;
  downloads: number;
}

export default function ECommercePage() {
  const router = useRouter();
  const { currentPage, itemsPerPage } = useSelector(
    (state: RootState) => state.pagination
  );
  const [isStatusModalOpen, setIsStatusModalOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("order");

  const form = useForm<FilterForm>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      search: "",
      orderStatus: "All",
      dateInput: "",
    },
  });
  const filters = form.watch();

  // Fetch all data for each tab
  const { data: allOrders } = useQuery<Order[]>({
    queryKey: ["all-orders"],
    queryFn: async () => {
      const res = await apiClient.get("/orders");
      return res.data as Order[];
    },
  });

  const { data: allStores } = useQuery<Store[]>({
    queryKey: ["all-stores"],
    queryFn: async () => {
      const res = await apiClient.get("/stores");
      return res.data as Store[];
    },
  });

  const { data: allProducts } = useQuery<Product[]>({
    queryKey: ["all-products"],
    queryFn: async () => {
      const res = await apiClient.get("/products");
      return res.data as Product[];
    },
  });

  const { data: allReports } = useQuery<Report[]>({
    queryKey: ["all-reports"],
    queryFn: async () => {
      const res = await apiClient.get("/reports");
      return res.data as Report[];
    },
  });

  // Filter and paginate data based on active tab
  const getFilteredData = () => {
    let data: any[] = [];
    let filteredData: any[] = [];

    switch (activeTab) {
      case "order":
        data = allOrders || [];
        if (filters.search) {
          data = data.filter(
            (o) =>
              o.customerName.toLowerCase().includes(filters.search!.toLowerCase()) ||
              o.id.includes(filters.search!)
          );
        }
        if (filters.orderStatus && filters.orderStatus !== "All") {
          data = data.filter((o) => o.orderStatus === filters.orderStatus);
        }
        if (filters.dateInput) {
          const parsedDate = parse(filters.dateInput, "yyyy-MM-dd", new Date());
          if (isValid(parsedDate)) {
            const targetDate = format(parsedDate, "yyyy-MM-dd");
            data = data.filter(
              (o) => format(new Date(o.orderDate), "yyyy-MM-dd") === targetDate
            );
          }
        }
        break;
      case "store":
        data = allStores || [];
        if (filters.search) {
          data = data.filter(
            (s) =>
              s.storeName.toLowerCase().includes(filters.search!.toLowerCase()) ||
              s.id.includes(filters.search!)
          );
        }
        break;
      case "product":
        data = allProducts || [];
        if (filters.search) {
          data = data.filter(
            (p) =>
              p.productName.toLowerCase().includes(filters.search!.toLowerCase()) ||
              p.id.includes(filters.search!)
          );
        }
        break;
      case "reports":
        data = allReports || [];
        if (filters.search) {
          data = data.filter(
            (r) =>
              r.reportName.toLowerCase().includes(filters.search!.toLowerCase()) ||
              r.id.includes(filters.search!)
          );
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
    type: "order" | "payment" | "shipping" | "store" | "product" | "report"
  ) => {
    if (type === "order") {
      if (status === "Pending") return "bg-[#E5D9F2] text-[#6A1B9A]";
      if (status === "Completed") return "bg-[#D4F4E2] text-[#1B5E20]";
    } else if (type === "payment") {
      if (status === "Paid") return "bg-[#D4F4E2] text-[#1B5E20]";
      if (status === "Unpaid") return "bg-[#FFEBEE] text-[#B71C1C]";
    } else if (type === "shipping") {
      if (status === "Delivered") return "bg-[#FFF3E0] text-[#EF6C00]";
      if (status === "Shipped") return "bg-[#E3F2FD] text-[#1565C0]";
      if (status && status.includes("Processing"))
        return "bg-[#E5D9F2] text-[#6A1B9A]";
      if (status === "-") return "text-muted-foreground";
    } else if (type === "store" || type === "product") {
      if (status === "Active") return "bg-[#D4F4E2] text-[#1B5E20]";
      if (status === "Inactive") return "bg-[#FFEBEE] text-[#B71C1C]";
      if (status === "Suspended") return "bg-[#FFF3E0] text-[#EF6C00]";
      if (status === "Available") return "bg-[#D4F4E2] text-[#1B5E20]";
      if (status === "Low Stock") return "bg-[#FFF3E0] text-[#EF6C00]";
      if (status === "Out of Stock") return "bg-[#FFEBEE] text-[#B71C1C]";
    } else if (type === "report") {
      if (status === "Completed") return "bg-[#D4F4E2] text-[#1B5E20]";
      if (status === "Processing") return "bg-[#FFF3E0] text-[#EF6C00]";
    }
    return "";
  };

  const handleReset = () => {
    form.reset();
  };

  const handleStatusSelect = (status: "All" | "Pending" | "Completed") => {
    form.setValue("orderStatus", status);
    setIsStatusModalOpen(false);
  };

  const handleRowClick = (id: string) => {
    router.push(`/e-commerce/${activeTab}/${id}`);
  };

  const renderOrdersTable = () => (
    <Table>
      <TableHeader>
        <TableRow className="bg-[#CEE0FC] hover:bg-[#CEE0FC]">
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            Order Number
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            Customer Name
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            Order Date
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            Total Amount
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            Order Status
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            Payment Status
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            Shipping Status
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            Store
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredData.map((order: Order) => (
          <TableRow
            key={order.id}
            onClick={() => handleRowClick(order.id)}
            className="cursor-pointer border-b border-gray-200 hover:bg-gray-50"
          >
            <TableCell className="px-4 py-3 text-sm text-gray-900">
              {order.id}
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-900">
              {order.customerName}
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-900">
              {order.orderDate}
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-900">
              &#8358;{(order.totalAmount || 0).toLocaleString("en-US")}
            </TableCell>

            <TableCell className="px-4 py-3 text-sm">
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                  order.orderStatus,
                  "order"
                )}`}
              >
                {order.orderStatus}
              </span>
            </TableCell>
            <TableCell className="px-4 py-3 text-sm">
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                  order.paymentStatus,
                  "payment"
                )}`}
              >
                {order.paymentStatus}
              </span>
            </TableCell>
            <TableCell className="px-4 py-3 text-sm">
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                  order.shippingStatus,
                  "shipping"
                )}`}
              >
                {order.shippingStatus}
              </span>
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-900">
              {order.store}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderStoresTable = () => (
    <Table>
      <TableHeader>
        <TableRow className="bg-[#CEE0FC] hover:bg-[#CEE0FC]">
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            Store ID
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            Store Name
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            Total Products
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            Rating
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            Last Order Date
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            Status
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            Location
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredData.map((store: Store) => (
          <TableRow
            key={store.id}
            onClick={() => handleRowClick(store.id)}
            className="cursor-pointer border-b border-gray-200 hover:bg-gray-50"
          >
            <TableCell className="px-4 py-3 text-sm text-gray-900">
              {store.id}
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-900">
              {store.storeName}
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-900">
              {store.totalProducts}
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-900">
              {store.rating}
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-900">
              {store.lastOrderDate}
            </TableCell>
            <TableCell className="px-4 py-3 text-sm">
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                  store.status,
                  "store"
                )}`}
              >
                {store.status}
              </span>
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-900">
              {store.location}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderProductsTable = () => (
    <Table>
      <TableHeader>
        <TableRow className="bg-[#CEE0FC] hover:bg-[#CEE0FC]">
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            Product ID
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            Product Name
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            Category
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            Quantity
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            Price
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            Status
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            Store ID
          </TableHead>
          <TableHead className="h-10 px-4 py-2 text-left text-xs font-medium uppercase text-gray-900">
            Date Added
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredData.map((product: Product) => (
          <TableRow
            key={product.id}
            onClick={() => handleRowClick(product.id)}
            className="cursor-pointer border-b border-gray-200 hover:bg-gray-50"
          >
            <TableCell className="px-4 py-3 text-sm text-gray-900">
              {product.id}
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-900">
              {product.productName}
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-900">
              {product.category}
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-900">
              {product.quantity}
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-900">
              {product.price ? `&#8358;${product.price.toLocaleString("en-US")}` : '&#8358;0'}
            </TableCell>

            <TableCell className="px-4 py-3 text-sm">
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                  product.status,
                  "product"
                )}`}
              >
                {product.status}
              </span>
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-900">
              {product.storeId}
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-900">
              {product.dateAdded}
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
        {filteredData.map((report: Report) => (
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
              {report.totalRevenue ? `&#8358;${report.totalRevenue.toLocaleString("en-US")}` : '&#8358;0'}
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
        E-COMMERCE MGT
      </div>
      <Tabs defaultValue="order" className="px-6" onValueChange={setActiveTab}>
        <div className="mb-4 flex items-end justify-between">
          <TabsList className="bg-transparent p-0">
            <TabsTrigger
              value="order"
              className="h-10 rounded-none border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-500 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:shadow-none"
            >
              Order
            </TabsTrigger>
            <TabsTrigger
              value="store"
              className="h-10 rounded-none border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-500 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:shadow-none"
            >
              Store
            </TabsTrigger>
            <TabsTrigger
              value="product"
              className="h-10 rounded-none border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-500 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:shadow-none"
            >
              Product
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
        <TabsContent value="order" className="mt-0">
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

            {/* Order Status Filter Modal */}
            <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="h-8 w-[180px] justify-start text-sm font-normal"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  {filters.orderStatus === "All" ? "Select Status" : filters.orderStatus}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[300px] p-4">
                <DialogHeader>
                  <DialogTitle className="text-left">Select Status</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col space-y-2 py-2">
                  <Button
                    variant="ghost"
                    className="justify-start font-normal hover:bg-[#0586CF] rounded-[17px] hover:text-white"
                    onClick={() => handleStatusSelect("Completed")}
                  >
                    Completed
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start font-normal hover:bg-[#0586CF] rounded-[17px] hover:text-white"
                    onClick={() => handleStatusSelect("Pending")}
                  >
                    Pending
                  </Button>
                </div>
                <div className="flex justify-end border-t pt-4">
                  <Button
                    variant="outline"
                    className="h-8 rounded-full bg-[#0586CF] text-white"
                    onClick={() => handleStatusSelect("All")}
                  >
                    Apply Now
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="destructive"
              className="h-8 rounded-full bg-red-500 text-sm text-white hover:bg-red-600"
              onClick={handleReset}
            >
              Reset Filter
            </Button>
          </div>
          {renderOrdersTable()}
          <Pagination totalItems={totalItems} />
        </TabsContent>
        <TabsContent value="store" className="mt-0">
          {renderStoresTable()}
          <Pagination totalItems={totalItems} />
        </TabsContent>
        <TabsContent value="product" className="mt-0">
          {renderProductsTable()}
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