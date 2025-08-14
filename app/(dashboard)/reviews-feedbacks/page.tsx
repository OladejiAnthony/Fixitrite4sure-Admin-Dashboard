//app/(dashboard)/reviews-feedbacks/page.tsx
// app/(dashboard)/reviews-feedbacks/page.tsx
"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import { Rating } from "react-simple-star-rating";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Pagination } from "@/components/common/pagination";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import {
  setCurrentPage,
  setItemsPerPage,
} from "@/store/slices/pagination-slice";

interface Review {
  id: number;
  name: string;
  email: string;
  rating: number;
  comment: string;
  response?: string;
  status: string;
  date: string;
}

const ReviewsFeedbacks = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { currentPage, itemsPerPage } = useSelector(
    (state: RootState) => state.pagination
  );
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState("");

  // Fetch reviews data
  const {
    data: reviews = [],
    isLoading,
    isError,
  } = useQuery<Review[]>({
    queryKey: ["reviews"],
    queryFn: async () => {
      const { data } = await apiClient.get("/reviews");
      return data;
    },
  });

  // Pagination logic
  const totalItems = reviews.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedReviews = reviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Mutation for adding response
  const respondToReview = useMutation({
    mutationFn: async (updatedReview: Review) => {
      const { data } = await apiClient.patch(
        `/reviews/${updatedReview.id}`,
        updatedReview
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      setResponseText("");
      toast({
        title: "Success",
        description: "Response has been sent successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send response",
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting review
  const deleteReview = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/reviews/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      // Reset to first page if last item on current page is deleted
      if (paginatedReviews.length === 1 && currentPage > 1) {
        dispatch(setCurrentPage(currentPage - 1));
      }
      toast({
        title: "Success",
        description: "Review has been deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive",
      });
    },
  });

  // Calculate metrics
  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / (totalItems || 1);

  // Handlers
  const handleRespond = (review: Review) => {
    setSelectedReview(review);
    setResponseText(review.response || "");
  };

  const submitResponse = () => {
    if (!selectedReview) return;
    respondToReview.mutate({
      ...selectedReview,
      response: responseText,
    });
  };

  const confirmDelete = (id: number) => {
    deleteReview.mutate(id);
  };

  if (isLoading) {
    return <div className="p-6">Loading reviews...</div>;
  }

  if (isError) {
    return <div className="p-6">Error loading reviews</div>;
  }

  return (
    <div className="flex flex-col bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Reviews & Feedback
      </h1>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
          <p className="text-2xl font-bold text-purple-900">
            {reviews.filter((r) => r.response).length}
          </p>
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
              key={review.id}
              className="p-4 bg-gray-50 rounded-md border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{review.name}</h3>
                  <p className="text-sm text-gray-500">{review.email}</p>
                  <div className="mt-1">
                    <Rating
                      size={20}
                      readonly
                      initialValue={review.rating}
                      SVGclassName="inline-block"
                    />
                    <span className="text-xs text-gray-500 ml-2">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    review.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {review.status}
                </span>
              </div>

              {review.comment && (
                <p className="mt-2 text-sm text-gray-700">{review.comment}</p>
              )}

              {review.response && (
                <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-100">
                  <p className="text-sm font-medium text-blue-800">Response:</p>
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
                      onClick={() => setSelectedReview(review)}
                      className="bg-[#5D92E4] text-white"
                    >
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
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
                      {review.response && (
                        <div>
                          <Label>Your Response</Label>
                          <Textarea
                            value={review.response}
                            readOnly
                            className="min-h-[100px]"
                          />
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Respond Dialog */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleRespond(review)}
                      className="bg-white text-[#5D92E4] border border-[#5D92E4]"
                    >
                      {review.response ? "Edit Response" : "Respond"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        Respond to {review.name}'s Review
                      </DialogTitle>
                      <DialogDescription>
                        Write a response to this review
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
                          placeholder="Type your response here..."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setResponseText("")}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={submitResponse}
                        disabled={respondToReview.isPending}
                      >
                        {respondToReview.isPending
                          ? "Sending..."
                          : "Send Response"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Delete Dialog */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setSelectedReview(review)}
                    >
                      Delete
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Deletion</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this review? This action
                        cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <p>
                        You're about to delete the review by{" "}
                        <span className="font-medium">{review.name}</span>.
                      </p>
                    </div>
                    <DialogFooter>
                      <Button variant="outline">Cancel</Button>
                      <Button
                        variant="destructive"
                        onClick={() => confirmDelete(review.id)}
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
