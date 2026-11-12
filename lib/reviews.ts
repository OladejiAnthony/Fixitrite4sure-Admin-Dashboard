// lib/reviews.ts
//
// Server-side data for Reviews & Feedback. Two review tables exist (schema
// owned by fixit-app-mobile/supabase/migrations):
//   reviews          - reviews of providers (repairers, companies, vendors),
//                      with review_comments and user review_reports
//   product_reviews  - reviews of marketplace products (no comments/reports)
//
// There is no admin-response column. An admin's response to a provider
// review is stored as a review_comments row written by that admin, so it
// also shows to app users as a comment from the admin's account.
import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchAll } from "@/lib/supabase/fetch-all";
import { displayName } from "@/lib/supabase/log-admin-activity";

type Admin = ReturnType<typeof createAdminClient>;

export type ReviewKind = "provider" | "product";

export function isReviewKind(v: string): v is ReviewKind {
  return v === "provider" || v === "product";
}

type PersonRef = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  business_name?: string | null;
  company_name?: string | null;
  email: string | null;
  is_admin?: boolean;
} | null;

const PERSON = "id, first_name, last_name, business_name, company_name, email";

// Reviews has two FKs to profiles, so each embed names the column it follows.
const PROVIDER_REVIEW_SELECT =
  "id, rating, body, created_at, " +
  `author:profiles!author_id(${PERSON}), ` +
  `provider:profiles!provider_id(${PERSON}, user_type), ` +
  "comments:review_comments(id, body, created_at, " +
  `author:profiles!author_id(${PERSON}, is_admin)), ` +
  "reports:review_reports(id, reason, created_at)";

const PRODUCT_REVIEW_SELECT =
  "id, rating, body, created_at, " +
  `author:profiles!author_id(${PERSON}), ` +
  `product:products(id, title, seller:profiles(${PERSON}))`;

type CommentRow = {
  id: string;
  body: string;
  created_at: string;
  author: PersonRef;
};

type ProviderReviewRow = {
  id: string;
  rating: number;
  body: string | null;
  created_at: string;
  author: PersonRef;
  provider: (PersonRef & { user_type: string }) | null;
  comments: CommentRow[];
  reports: { id: string; reason: string | null; created_at: string }[];
};

type ProductReviewRow = {
  id: string;
  rating: number;
  body: string | null;
  created_at: string;
  author: PersonRef;
  product: { id: string; title: string; seller: PersonRef } | null;
};

function personName(p: PersonRef): string {
  if (!p) return "Unknown user";
  const full = [p.first_name, p.last_name].filter(Boolean).join(" ").trim();
  return full || p.email || "Unknown user";
}

function businessName(p: PersonRef): string {
  if (!p) return "Unknown";
  return p.business_name || p.company_name || personName(p);
}

const USER_TYPE_LABEL: Record<string, string> = {
  repairer: "Repairer",
  company: "Repair company",
  vendor: "Vendor",
  customer: "Customer",
};

function mapProviderReview(r: ProviderReviewRow) {
  const comments = [...(r.comments ?? [])].sort((a, b) =>
    a.created_at.localeCompare(b.created_at)
  );
  const adminComments = comments.filter((c) => c.author?.is_admin);
  const latestAdmin = adminComments[adminComments.length - 1];
  const reports = r.reports ?? [];

  return {
    id: r.id,
    kind: "provider" as const,
    name: personName(r.author),
    email: r.author?.email ?? "",
    authorId: r.author?.id ?? null,
    rating: r.rating,
    comment: r.body ?? "",
    date: r.created_at,
    subjectId: r.provider?.id ?? null,
    subjectName: businessName(r.provider),
    subjectType: USER_TYPE_LABEL[r.provider?.user_type ?? ""] ?? "Provider",
    status: reports.length ? "reported" : "active",
    reportCount: reports.length,
    reports: reports.map((rp) => ({
      id: rp.id,
      reason: rp.reason ?? "",
      date: rp.created_at,
    })),
    comments: comments.map((c) => ({
      id: c.id,
      authorName: displayName(c.author, "Unknown user"),
      isAdmin: Boolean(c.author?.is_admin),
      body: c.body,
      date: c.created_at,
    })),
    response: latestAdmin?.body,
    respondedBy: latestAdmin ? displayName(latestAdmin.author) : undefined,
    canRespond: true,
  };
}

function mapProductReview(r: ProductReviewRow) {
  return {
    id: r.id,
    kind: "product" as const,
    name: personName(r.author),
    email: r.author?.email ?? "",
    authorId: r.author?.id ?? null,
    rating: r.rating,
    comment: r.body ?? "",
    date: r.created_at,
    subjectId: r.product?.id ?? null,
    subjectName: r.product?.title ?? "Deleted product",
    subjectType: r.product?.seller
      ? `Product from ${businessName(r.product.seller)}`
      : "Product",
    status: "active",
    reportCount: 0,
    reports: [],
    comments: [],
    response: undefined,
    respondedBy: undefined,
    // product_reviews has no comments table to hold a response.
    canRespond: false,
  };
}

export type AdminReview =
  | ReturnType<typeof mapProviderReview>
  | ReturnType<typeof mapProductReview>;

export async function loadReviews(admin: Admin): Promise<AdminReview[]> {
  const [providerRows, productRows] = await Promise.all([
    fetchAll<ProviderReviewRow>((from, to) =>
      admin
        .from("reviews")
        .select(PROVIDER_REVIEW_SELECT)
        .order("created_at", { ascending: false })
        .order("id")
        .range(from, to)
    ),
    fetchAll<ProductReviewRow>((from, to) =>
      admin
        .from("product_reviews")
        .select(PRODUCT_REVIEW_SELECT)
        .order("created_at", { ascending: false })
        .order("id")
        .range(from, to)
    ),
  ]);

  return [
    ...providerRows.map(mapProviderReview),
    ...productRows.map(mapProductReview),
  ].sort((a, b) => b.date.localeCompare(a.date));
}

export const REVIEW_TABLE: Record<ReviewKind, "reviews" | "product_reviews"> = {
  provider: "reviews",
  product: "product_reviews",
};
