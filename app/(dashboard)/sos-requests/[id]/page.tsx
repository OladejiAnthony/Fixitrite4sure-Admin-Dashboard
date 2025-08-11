//app/(dashboard)/sos-requests/[id]/page.tsx
"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, use } from "react"; // <-- import `use` from React
import { useRouter } from "next/navigation";
import Link from "next/link";

// Zod schema for request data validation
const requestSchema = z.object({
  id: z.string(),
  username: z.string(),
  location: z.string(),
  time: z.string(),
  status: z.enum(["Pending", "In Progress", "Resolved", "Closed"]),
  issueDescription: z.string(),
  attachedFile: z.string().optional(),
});

type Request = z.infer<typeof requestSchema>;

// Status update schema
const statusUpdateSchema = z.object({
  status: z.enum(["Pending", "In Progress", "Resolved", "Closed"]),
});

interface PageProps {
  params: Promise<{ id: string }>; // ✅ make it a Promise now
}

export default function SosDetailsPage({ params }: PageProps) {
  const { id } = use(params); // ✅ unwrap params with `use()`
  const router = useRouter();
  const [isEditingStatus, setIsEditingStatus] = useState(false);

  // Fetch request details
  const {
    data: request,
    isLoading,
    error,
  } = useQuery<Request>({
    queryKey: ["sos-request", id], // ✅ use unwrapped `id`
    queryFn: async () => {
      const response = await apiClient.get(`/sosRequests/${id}`);
      return requestSchema.parse(response.data);
    },
  });

  // Status update mutation
  const { mutate: updateStatus } = useMutation({
    mutationFn: async (newStatus: string) => {
      const response = await apiClient.patch(`/sosRequests/${id}`, {
        status: newStatus,
      });
      return response.data;
    },
    onSuccess: () => {
      router.refresh();
      setIsEditingStatus(false);
    },
  });

  // Form for status update
  const { handleSubmit } = useForm({
    resolver: zodResolver(statusUpdateSchema),
  });

  const handleViewFile = () => {
    if (request?.attachedFile) {
      window.open(request.attachedFile, "_blank");
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error)
    return <div>Error loading request: {(error as Error).message}</div>;
  if (!request) return <div>Request not found</div>;

  // Determine which buttons to show based on status
  const renderButtons = () => {
    switch (request.status) {
      case "Pending":
        return (
          <div className="mt-4 flex gap-4">
            <Button variant="outline" className="bg-[#0586CF] text-white">
              Assign to responder
            </Button>
            <Button
              variant="outline"
              className="text-[#0586CF] border border-[#0586CF] bg-white"
            >
              Message customer
            </Button>
            <Button
              variant="outline"
              className="text-[#0586CF] border border-[#0586CF] bg-white"
              onClick={() => setIsEditingStatus(true)}
            >
              Change request status
            </Button>
          </div>
        );
      case "In Progress":
        return (
          <>
            <Button variant="outline">Message customer</Button>
            <Button variant="outline" onClick={() => setIsEditingStatus(true)}>
              Change request status
            </Button>
          </>
        );
      case "Resolved":
        return (
          <>
            <Button variant="outline" onClick={() => setIsEditingStatus(true)}>
              Change request status
            </Button>
            <Button variant="outline">Message customer</Button>
          </>
        );
      case "Closed":
        return <Button variant="outline">Message customer</Button>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        SOS REQUEST MANAGEMENT
      </h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">REQUEST DETAILS</h2>

        <div className="space-y-4">
          <div className="flex items-start">
            <span className="w-48 font-medium">Request ID:</span>
            <span>{request.id}</span>
          </div>

          <div className="flex items-start">
            <span className="w-48 font-medium">Customer's Name:</span>
            <span>{request.username}</span>
          </div>

          <div className="flex items-start">
            <span className="w-48 font-medium">Customer's Location:</span>
            <span>{request.location}</span>
          </div>

          <div className="flex items-start">
            <span className="w-48 font-medium">Date and Time:</span>
            <span>{request.time}</span>
          </div>

          <div className="flex items-start">
            <span className="w-48 font-medium">Issue Description:</span>
            <span>{request.issueDescription}</span>
          </div>

          {request.attachedFile && (
            <div className="flex items-start">
              <span className="w-48 font-medium">Attached File:</span>
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={handleViewFile}
              >
                View File
              </Button>
            </div>
          )}

          <div className="flex items-start">
            <span className="w-48 font-medium">Request Status:</span>
            {isEditingStatus ? (
              <form
                onSubmit={handleSubmit((data) => updateStatus(data.status))}
                className="flex items-center gap-2"
              >
                <Select
                  name="status"
                  defaultValue={request.status}
                  onValueChange={(value) => updateStatus(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditingStatus(false)}
                >
                  Cancel
                </Button>
              </form>
            ) : (
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    request.status === "Pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : request.status === "In Progress"
                      ? "bg-blue-100 text-blue-800"
                      : request.status === "Resolved"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {request.status}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Buttons section */}
        <div className="mt-6 flex gap-4">{renderButtons()}</div>
      </div>

      <div className="px-6 py-6 mt-10 border-t border-gray-100 flex items-center justify-between gap-4">
        <div className="text-sm">
          <Link href="/sos-requests" className="text-sky-600 hover:underline">
            ← Request Overview
          </Link>
        </div>
      </div>
    </div>
  );
}
