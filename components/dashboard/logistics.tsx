//components/dashboard/logistics.tsx
// components/dashboard/logistics.tsx
"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Pagination } from "@/components/common/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type TabType = "carriers" | "shipment" | "logistics" | "tracking";

interface LogisticsData {
  id: string;
  vendorLecId: string;
  vendorId: string;
  lecPartners: string;
  shippingCostKg: number;
  maxPackageWeight: number;
  shippingDays: number;
  handlingFee: number;
}

interface ShipmentData {
  id: string;
  shipmentId: string;
  orderId: string;
  carrierId: string;
  trackingNumber: string;
  shipmentDate: string;
  eta: string;
}

interface CarrierData {
  id: string;
  carrierId: string;
  carrierName: string;
  contactName: string;
  address: string;
  trackingUrl: string;
}

interface TrackingData {
  id: string;
  trackingId: string;
  shipmentId: string;
  status: string;
  updateDate: string;
  location: string;
}

export function Logistics() {
  const [activeTab, setActiveTab] = useState<TabType>("logistics");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all data
  const { data: logisticsData, isLoading: isLogisticsLoading } = useQuery<
    LogisticsData[]
  >({
    queryKey: ["logistics"],
    queryFn: () => apiClient.get("/logistics").then((res) => res.data),
  });

  const { data: shipmentData, isLoading: isShipmentLoading } = useQuery<
    ShipmentData[]
  >({
    queryKey: ["shipments"],
    queryFn: () => apiClient.get("/shipments").then((res) => res.data),
  });

  const { data: carrierData, isLoading: isCarrierLoading } = useQuery<
    CarrierData[]
  >({
    queryKey: ["carriers"],
    queryFn: () => apiClient.get("/carriers").then((res) => res.data),
  });

  const { data: trackingData, isLoading: isTrackingLoading } = useQuery<
    TrackingData[]
  >({
    queryKey: ["tracking"],
    queryFn: () => apiClient.get("/tracking").then((res) => res.data),
  });

  // Create separate filtered data for each tab
  const filteredLogisticsData = useMemo(() => {
    if (!logisticsData) return [];
    if (!searchTerm) return logisticsData;

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return logisticsData.filter(
      (item) =>
        item.vendorLecId.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.vendorId.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.lecPartners.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.shippingCostKg.toString().includes(searchTerm) ||
        item.maxPackageWeight.toString().includes(searchTerm) ||
        item.shippingDays.toString().includes(searchTerm) ||
        item.handlingFee.toString().includes(searchTerm)
    );
  }, [logisticsData, searchTerm]);

  const filteredShipmentData = useMemo(() => {
    if (!shipmentData) return [];
    if (!searchTerm) return shipmentData;

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return shipmentData.filter(
      (item) =>
        item.shipmentId.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.orderId.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.carrierId.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.trackingNumber.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.shipmentDate.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.eta.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [shipmentData, searchTerm]);

  const filteredCarrierData = useMemo(() => {
    if (!carrierData) return [];
    if (!searchTerm) return carrierData;

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return carrierData.filter(
      (item) =>
        item.carrierId.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.carrierName.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.contactName.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.address.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.trackingUrl.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [carrierData, searchTerm]);

  const filteredTrackingData = useMemo(() => {
    if (!trackingData) return [];
    if (!searchTerm) return trackingData;

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return trackingData.filter(
      (item) =>
        item.trackingId.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.shipmentId.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.status.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.updateDate.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.location.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [trackingData, searchTerm]);

  // Get the correct filtered data based on active tab
  const currentData = useMemo(() => {
    switch (activeTab) {
      case "logistics":
        return filteredLogisticsData;
      case "shipment":
        return filteredShipmentData;
      case "carriers":
        return filteredCarrierData;
      case "tracking":
        return filteredTrackingData;
      default:
        return [];
    }
  }, [
    activeTab,
    filteredLogisticsData,
    filteredShipmentData,
    filteredCarrierData,
    filteredTrackingData,
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">LOGISTICS</h1>

      {/* Tabs */}
      <div className="flex space-x-8 border-b">
        <button
          className={`pb-2 px-1 font-medium ${
            activeTab === "carriers"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("carriers")}
        >
          CARRIERS
        </button>
        <button
          className={`pb-2 px-1 font-medium ${
            activeTab === "shipment"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("shipment")}
        >
          SHIPMENT
        </button>
        <button
          className={`pb-2 px-1 font-medium ${
            activeTab === "logistics"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("logistics")}
        >
          LOGISTICS
        </button>
        <button
          className={`pb-2 px-1 font-medium ${
            activeTab === "tracking"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("tracking")}
        >
          TRACKING
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button variant="outline" className="h-8">
            Delete
          </Button>
          <Button variant="outline" className="h-8">
            Edit
          </Button>
          <Button variant="outline" className="h-8">
            Filter
          </Button>
        </div>
        <Input
          placeholder="Search..."
          className="w-64 h-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tables */}
      <div className="border rounded-md">
        {activeTab === "logistics" && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>VENDOR LEC ID</TableHead>
                <TableHead>VENDOR ID</TableHead>
                <TableHead>LEC PARTNERS</TableHead>
                <TableHead>SHIPPING COST / KG</TableHead>
                <TableHead>MAX PACKAGE WEIGHT</TableHead>
                <TableHead>SHIPPING DAYS</TableHead>
                <TableHead>HANDLING FEE</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogisticsData?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.vendorLecId}</TableCell>
                  <TableCell>{item.vendorId}</TableCell>
                  <TableCell>{item.lecPartners}</TableCell>
                  <TableCell>{item.shippingCostKg}</TableCell>
                  <TableCell>{item.maxPackageWeight}</TableCell>
                  <TableCell>{item.shippingDays}</TableCell>
                  <TableCell>{item.handlingFee}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {activeTab === "shipment" && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SHIPMENT ID</TableHead>
                <TableHead>ORDER ID</TableHead>
                <TableHead>CARRIER ID</TableHead>
                <TableHead>TRACKING NUMBER</TableHead>
                <TableHead>SHIPMENT DATE</TableHead>
                <TableHead>ETA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShipmentData?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.shipmentId}</TableCell>
                  <TableCell>{item.orderId}</TableCell>
                  <TableCell>{item.carrierId}</TableCell>
                  <TableCell>{item.trackingNumber}</TableCell>
                  <TableCell>{item.shipmentDate}</TableCell>
                  <TableCell>{item.eta}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {activeTab === "carriers" && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CARRIER ID</TableHead>
                <TableHead>CARRIER NAME</TableHead>
                <TableHead>CONTACT NAME</TableHead>
                <TableHead>ADDRESS</TableHead>
                <TableHead>TRACKING URL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCarrierData?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.carrierId}</TableCell>
                  <TableCell>{item.carrierName}</TableCell>
                  <TableCell>{item.contactName}</TableCell>
                  <TableCell>{item.address}</TableCell>
                  <TableCell>{item.trackingUrl}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {activeTab === "tracking" && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>TRACKING ID</TableHead>
                <TableHead>SHIPMENT ID</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead>UPDATE DATE</TableHead>
                <TableHead>LOCATION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrackingData?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.trackingId}</TableCell>
                  <TableCell>{item.shipmentId}</TableCell>
                  <TableCell>{item.status}</TableCell>
                  <TableCell>{item.updateDate}</TableCell>
                  <TableCell>{item.location}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {currentData && <Pagination totalItems={currentData.length} />}
    </div>
  );
}
