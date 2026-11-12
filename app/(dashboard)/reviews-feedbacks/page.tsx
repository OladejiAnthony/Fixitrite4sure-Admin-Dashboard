// app/(dashboard)/reviews-feedbacks/page.tsx
"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Rating } from "react-simple-star-rating";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Pagination } from "@/components/common/pagination";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { setCurrentPage } from "@/store/slices/pagination-slice";

// Shape returned by /api/admin/reviews (lib/reviews.ts).
interface Review {
  id: string;
  kind: "provider" | "product";
  name: string;
  email: string;
  rating: number;
  comment: string;
  date: string;
  subjectId: string | null;
  subjectName: string;
  subjectType: string;
  status: "active" | "reported";
  reportCount: number;
  reports: { id: string; reason: string; date: string }[];
  comments: {
    id: string;
    authorName: string;
    isAdmin: boolean;
    body: string;
    date: string;
  }[];
  response?: string;
  respondedBy?: string;
  canRespond: boolean;
}

type KindFilter = "all" | "provider" | "product";

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error ?? `Request failed (${res.status})`);
  return body as T;
}

const formatDate = (iso: string) => new Date(iso).toLocaleDateString();

const ReviewsFeedbacks = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { currentPage, itemsPerPage } = useSelector(
    (state: RootState) => state.pagination
  );
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const [responseText, setResponseText] = useState("");
  const [openRespondId, setOpenRespondId] = useState<string | null>(null);
  const [openDeleteId, setOpenDeleteId] = useState<string | null>(null);

  const {
    data: allReviews = [],
    isLoading,
    isError,
    error,
  } = useQuery<Review[]>({
    queryKey: ["admin-reviews"],
    queryFn: () => requestJson<Review[]>("/api/admin/reviews"),
  });

  const reviews =
    kindFilter === "all"
      ? allReviews
      : allReviews.filter((r) => r.kind === kindFilter);

  // Pagination logic
  const totalItems = reviews.length;
  const paginatedReviews = reviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const respondToReview = useMutation({
    mutationFn: ({ review, body }: { review: Review; body: string }) =>
      requestJson(`/api/admin/reviews/${review.kind}/${review.id}/response`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      setResponseText("");
      setOpenRespondId(null);
      toast({
        title: "Success",
        description: "Response has been posted on the review",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Error",
        description: err.message || "Failed to send response",
        variant: "destructive",
      });
    },
  });

  const deleteReview = useMutation({
    mutationFn: (review: Review) =>
      requestJson(`/api/admin/reviews/${review.kind}/${review.id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      setOpenDeleteId(null);
      // Step back a page if the last item on this page was deleted
      if (paginatedReviews.length === 1 && currentPage > 1) {
        dispatch(setCurrentPage(currentPage - 1));
      }
      toast({
        title: "Success",
        description: "Review has been deleted successfully",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Error",
        description: err.message || "Failed to delete review",
        variant: "destructive",
      });
    },
  });

  // Metrics (for the current filter)
  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / (totalItems || 1);
  const respondedCount = reviews.filter((r) => r.response).length;
  const reportedCount = reviews.filter((r) => r.reportCount > 0).length;

  const handleFilterChange = (value: string) => {
    setKindFilter(value as KindFilter);
    dispatch(setCurrentPage(1));
  };

  if (isLoading) {
    return <div className="p-6">Loading reviews...</div>;
  }

  if (isError) {
    return (
      <div className="p-6 text-red-600">
        Error loading reviews: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reviews & Feedback</h1>
        <Select value={kindFilter} onValueChange={handleFilterChange}>
          <SelectTrigger className="h-9 w-[220px] text-sm">
            <SelectValue placeholder="Review type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All reviews</SelectItem>
            <SelectItem value="provider">Service provider reviews</SelectItem>
            <SelectItem value="product">Product reviews</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="text-sm font-medium text-blue-800">Total Reviews</h3>
          <p className="text-2xl font-bold text-blue-900">{totalItems}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <h3 className="text-sm font-medium text-green-800">Average Rating</h3>
          <div className="flex items-center">
            <Rating
              size={20}
              readonly
              initialValue={averageRating}
              allowFraction
              SVGclassName="inline-block"
            />
            <span className="ml-2 text-2xl font-bold text-green-900">
              {averageRating.toFixed(1)}
            </span>
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <h3 className="text-sm font-medium text-purple-800">
            Responded Reviews
          </h3>
          <p className="text-2xl font-bold text-purple-900">{respondedCount}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
          <h3 className="text-sm font-medium text-red-800">Reported Reviews</h3>
          <p className="text-2xl font-bold text-red-900">{reportedCount}</p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">All Reviews</h2>

        {paginatedReviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet</p>
        ) : (
          paginatedReviews.map((review) => (
            <div
              key={`${review.kind}-${review.id}`}
              className="p-4 bg-gray-50 rounded-md border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{review.name}</h3>
                  <p className="text-sm text-gray-500">{review.email}</p>
                  <p className="mt-1 text-xs text-gray-600">
                    Review of{" "}
                    <span className="font-medium">{review.subjectName}</span>
                    {" · "}
                    {review.subjectType}
                  </p>
                  <div className="mt-1">
                    <Rating
                      size={20}
                      readonly
                      initialValue={review.rating}
                      SVGclassName="inline-block"
                    />
                    <span className="text-xs text-gray-500 ml-2">
                      {formatDate(review.date)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    {review.kind === "provider" ? "Service provider" : "Product"}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      review.status === "reported"
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {review.status === "reported"
                      ? `reported (${review.reportCount})`
                      : "active"}
                  </span>
                </div>
              </div>

              {review.comment && (
                <p className="mt-2 text-sm text-gray-700">{review.comment}</p>
              )}

              {review.response && (
                <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-100">
                  <p className="text-sm font-medium text-blue-800">
                    Response{review.respondedBy ? ` from ${review.respondedBy}` : ""}:
                  </p>
                  <p className="text-sm text-blue-700">{review.response}</p>
                </div>
              )}

              <div className="flex space-x-2 mt-3">
                {/* View Details Dialog */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-[#5D92E4] text-white"
                    >
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Review Details</DialogTitle>
                      <DialogDescription>
                        Detailed information about this review
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Name</Label>
                        <Input value={review.name} readOnly />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input value={review.email} readOnly />
                      </div>
                      <div>
                        <Label>Review Of</Label>
                        <Input
                          value={`${review.subjectName} (${review.subjectType})`}
                          readOnly
                        />
                      </div>
                      <div>
                        <Label>Rating</Label>
                        <div className="flex items-center">
                          <Rating
                            size={20}
                            readonly
                            initialValue={review.rating}
                            SVGclassName="inline-block"
                          />
                          <span className="ml-2">{review.rating} stars</span>
                        </div>
                      </div>
                      <div>
                        <Label>Comment</Label>
                        <Textarea
                          value={review.comment}
                          readOnly
                          className="min-h-[100px]"
                        />
                      </div>
                      {review.comments.length > 0 && (
                        <div>
                          <Label>Comments ({review.comments.length})</Label>
                          <div className="mt-1 space-y-2">
                            {review.comments.map((c) => (
                              <div
                                key={c.id}
                                className={`rounded-md border p-2 text-sm ${
                                  c.isAdmin
                                    ? "border-blue-100 bg-blue-50"
                                    : "border-gray-200 bg-gray-50"
                                }`}
                              >
                                <p className="text-xs text-gray-500">
                                  {c.authorName}
                                  {c.isAdmin ? " (admin)" : ""} ·{" "}
                                  {formatDate(c.date)}
                                </p>
                                <p className="text-gray-800">{c.body}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {review.reports.length > 0 && (
                        <div>
                          <Label>Reports ({review.reports.length})</Label>
                          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-gray-700">
                            {review.reports.map((rp) => (
                              <li key={rp.id}>
                                {rp.reason || "No reason given"}{" "}
                                <span className="text-xs text-gray-500">
                                  ({formatDate(rp.date)})
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Respond Dialog (provider reviews only: product reviews
                    have no comments table to hold a response) */}
                {review.canRespond && (
                  <Dialog
                    open={openRespondId === review.id}
                    onOpenChange={(open) => {
                      setOpenRespondId(open ? review.id : null);
                      setResponseText(open ? review.response || "" : "");
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-white text-[#5D92E4] border border-[#5D92E4]"
                      >
                        {review.response ? "Edit Response" : "Respond"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          Respond to {review.name}&apos;s Review
                        </DialogTitle>
                        <DialogDescription>
                          Your response is posted as a comment on this review
                          from your admin account, and app users can see it.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Original Comment</Label>
                          <Textarea
                            value={review.comment}
                            readOnly
                            className="min-h-[100px]"
                          />
                        </div>
                        <div>
                          <Label>Your Response</Label>
                          <Textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            className="min-h-[100px]"
                            maxLength={2000}
                            placeholder="Type your response here..."
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                          onClick={() =>
                            respondToReview.mutate({
                              review,
                              body: responseText,
                            })
                          }
                          disabled={
                            respondToReview.isPending || !responseText.trim()
                          }
                        >
                          {respondToReview.isPending
                            ? "Sending..."
                            : "Send Response"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}

                {/* Delete Dialog */}
                <Dialog
                  open={openDeleteId === review.id}
                  onOpenChange={(open) => setOpenDeleteId(open ? review.id : null)}
                >
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      Delete
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Deletion</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this review? This
                        permanently removes it from the app
                        {review.kind === "provider"
                          ? ", along with its comments, reactions and reports"
                          : ""}
                        . This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <p>
                        You&apos;re about to delete the review by{" "}
                        <span className="font-medium">{review.name}</span>.
                      </p>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button
                        variant="destructive"
                        onClick={() => deleteReview.mutate(review)}
                        disabled={deleteReview.isPending}
                      >
                        {deleteReview.isPending ? "Deleting..." : "Delete"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <Pagination totalItems={totalItems} />
    </div>
  );
};

export default ReviewsFeedbacks;
