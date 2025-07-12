//content-review.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, Eye, User } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface ContentReviewProps {
  contentId: string;
}

export function ContentReview({ contentId }: ContentReviewProps) {
  const router = useRouter();

  const { data: content, isLoading } = useQuery({
    queryKey: ["content", contentId],
    queryFn: async () => {
      const response = await apiClient.get("/content");
      const allContent = response.data;
      return allContent.find((item: any) => item.id === contentId);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Content not found</div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Content Review</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Content Image */}
          <Card>
            <CardContent className="p-6">
              <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={content.image || "/placeholder.svg"}
                  alt={content.title}
                  fill
                  className="object-cover"
                />
              </div>
            </CardContent>
          </Card>

          {/* Content Details */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{content.title}</CardTitle>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {content.name}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(content.datePosted).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {content.engagement.toLocaleString()} views
                    </div>
                  </div>
                </div>
                <Badge className={getStatusColor(content.status)}>
                  {content.status.charAt(0).toUpperCase() +
                    content.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {content.description}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {content.tags.map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Content Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Content Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Type:</span>
                  <div className="font-medium">{content.contentType}</div>
                </div>
                <div>
                  <span className="text-gray-500">Category:</span>
                  <div className="font-medium">
                    {content.contentOverview.category}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Author:</span>
                  <div className="font-medium">
                    {content.contentOverview.author}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Published:</span>
                  <div className="font-medium">
                    {new Date(
                      content.contentOverview.publishDate
                    ).toLocaleDateString()}
                  </div>
                </div>
                {content.contentOverview.wordCount && (
                  <div>
                    <span className="text-gray-500">Word Count:</span>
                    <div className="font-medium">
                      {content.contentOverview.wordCount}
                    </div>
                  </div>
                )}
                {content.contentOverview.readTime && (
                  <div>
                    <span className="text-gray-500">Read Time:</span>
                    <div className="font-medium">
                      {content.contentOverview.readTime}
                    </div>
                  </div>
                )}
                {content.contentOverview.duration && (
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <div className="font-medium">
                      {content.contentOverview.duration}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {content.status === "pending" && (
                <>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Approve Content
                  </Button>
                  <Button variant="destructive" className="w-full">
                    Reject Content
                  </Button>
                </>
              )}
              <Button variant="outline" className="w-full bg-transparent">
                Edit Content
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
