//app/(dashboard)/content-management/review/[id]/page.tsx
import { ContentReview } from "@/components/content-management/content-review";

interface ContentReviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function ContentReviewPage({
  params,
}: ContentReviewPageProps) {
  const { id } = await params;

  return <ContentReview contentId={id} />;
}
