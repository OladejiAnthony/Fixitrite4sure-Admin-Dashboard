// types/supabase.ts
//
// Hand-written from the live schema (introspected via the project's
// PostgREST OpenAPI endpoint) since the Supabase CLI isn't set up in this
// repo yet. Regenerate with `supabase gen types typescript` once it is —
// this is a best-effort stand-in, not a source of truth.
//
// `profiles.is_admin` is included ahead of the migration that adds it
// (owned by fixit-app-mobile, see DASHBOARD.md §1) so the admin-gate code
// compiles against the target shape now.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type ProfilesRow = {
  id: string;
  user_type: "customer" | "repairer" | "company" | "vendor";
  first_name: string | null;
  last_name: string | null;
  business_name: string | null;
  company_name: string | null;
  phone_number: string | null;
  email: string | null;
  id_type: string | null;
  id_details: Json | null;
  profile_image: string | null;
  id_front_image: string | null;
  id_back_image: string | null;
  verification_status: string | null;
  profile_completed: boolean;
  business_details: Json | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

type ServicesRow = {
  id: string;
  provider_id: string;
  name: string;
  profession: string | null;
  category: "auto" | "gadget" | "plumbing" | "electrical";
  image_url: string | null;
  rating: number | null;
  status: string;
  created_at: string;
}

type BookingsRow = {
  id: string;
  customer_id: string;
  provider_id: string;
  service_id: string | null;
  repair_request_id: string | null;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
}

type RepairRequestsRow = {
  id: string;
  customer_id: string;
  provider_id: string | null;
  category: "auto" | "gadget" | "plumbing" | "electrical";
  form_data: Json | null;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}

type OrdersRow = {
  id: string;
  customer_id: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total_amount: number;
  // Added by fixit-app-mobile 20261104160000_marketplace / 20261105090000.
  delivery: Json | null;
  payment_card_id: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

// Marketplace tables (fixit-app-mobile 20261104160000_marketplace.sql).
type ProductsRow = {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  price: number;
  discount_percent: number;
  category: "auto" | "gadget" | "plumbing" | "electrical";
  stock: number;
  free_delivery: boolean;
  delivery_fee: number;
  delivery_days: number | null;
  status: "active" | "draft" | "archived";
  purchased_count: number;
  created_at: string;
  updated_at: string;
}

type OrderItemsRow = {
  id: string;
  order_id: string;
  product_id: string | null;
  seller_id: string;
  title: string;
  unit_price: number;
  quantity: number;
  variant: string;
  fulfilment_status: "pending" | "shipped" | "delivered";
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
}

type ProductReviewsRow = {
  id: string;
  product_id: string;
  author_id: string;
  rating: number;
  body: string | null;
  created_at: string;
}

type InvoicesRow = {
  id: string;
  booking_id: string | null;
  order_id: string | null;
  owner_id: string;
  amount: number;
  status: "pending" | "paid" | "failed" | "refunded";
  created_at: string;
}

type PaymentsRow = {
  id: string;
  invoice_id: string;
  owner_id: string;
  amount: number;
  status: "pending" | "paid" | "failed" | "refunded";
  created_at: string;
}

type PaymentCardsRow = {
  id: string;
  owner_id: string;
  last4: string;
  brand: string;
  exp_month: number;
  exp_year: number;
  created_at: string;
}

type ReviewsRow = {
  id: string;
  provider_id: string;
  author_id: string;
  rating: number;
  body: string | null;
  created_at: string;
}

type ReviewCommentsRow = {
  id: string;
  review_id: string;
  author_id: string;
  body: string;
  created_at: string;
}

type ReviewReactionsRow = {
  id: string;
  review_id: string;
  author_id: string;
  reaction: "like" | "dislike";
  created_at: string;
}

type ReviewReportsRow = {
  id: string;
  review_id: string;
  reporter_id: string;
  reason: string;
  created_at: string;
}

type AddressesRow = {
  id: string;
  owner_id: string;
  address_type: "home" | "work" | "billing" | "other";
  formatted_address: string | null;
  latitude: number | null;
  longitude: number | null;
  contact_person: string | null;
  created_at: string;
}

type NotificationsRow = {
  id: string;
  owner_id: string;
  title: string;
  body: string | null;
  read: boolean;
  created_at: string;
}

type VerificationCodesRow = {
  id: string;
  phone_number: string;
  code: string;
  verified: boolean;
  expires_at: string;
  created_at: string;
}

type AdvertTiersRow = {
  id: string;
  label: string;
  description: string | null;
  amount: number;
  currency: string;
  active: boolean;
}

type AdvertTransactionsRow = {
  id: string;
  user_id: string;
  advert_tier: string;
  amount: number;
  currency: string;
  flutterwave_tx_ref: string;
  flutterwave_transaction_id: string | null;
  status: "pending" | "successful" | "failed" | "abandoned";
  raw_response: Json | null;
  created_at: string;
  updated_at: string;
}

// `review_status`/`review_reason`/`reviewed_by`/`reviewed_at` are included
// ahead of the migration that adds them (owned by fixit-app-mobile, see the
// admin-dashboard plan's Phase B) so the moderation code compiles against
// the target shape now — same convention as `profiles.is_admin` above.
type BearingPostsRow = {
  id: string;
  author_id: string;
  caption: string | null;
  media_url: string;
  media_type: "image" | "video";
  like_count: number;
  is_advert: boolean;
  advert_tier: string | null;
  advert_transaction_id: string | null;
  review_status: "pending" | "approved" | "rejected";
  review_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Added by fixit-app-mobile migration 20261111120000_admin_activity_log.sql.
type AdminActivityLogRow = {
  id: string;
  admin_id: string | null;
  admin_name: string;
  action: string;
  description: string;
  target_type: string | null;
  target_id: string | null;
  status: "success" | "failed";
  created_at: string;
}

// Added by fixit-app-mobile migrations 20261104190000_chat.sql and
// 20261104200000_store_likes_and_support_chat.sql. A support conversation
// (kind = 'support') belongs to subject_user_id, who is its only
// participant; admins read it without being participants.
type ConversationsRow = {
  id: string;
  pair_key: string;
  kind: "direct" | "support";
  subject_user_id: string | null;
  last_message_at: string | null;
  last_message_preview: string | null;
  last_message_sender_id: string | null;
  created_at: string;
}

type MessagesRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string | null;
  media_type: "image" | "video" | null;
  // Object path in the private chat-media bucket; serve via signed URL.
  media_path: string | null;
  created_at: string;
}

type TableDef<Row extends { id?: string }> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<ProfilesRow>;
      services: TableDef<ServicesRow>;
      bookings: TableDef<BookingsRow>;
      repair_requests: TableDef<RepairRequestsRow>;
      orders: TableDef<OrdersRow>;
      order_items: TableDef<OrderItemsRow>;
      products: TableDef<ProductsRow>;
      product_reviews: TableDef<ProductReviewsRow>;
      invoices: TableDef<InvoicesRow>;
      payments: TableDef<PaymentsRow>;
      payment_cards: TableDef<PaymentCardsRow>;
      reviews: TableDef<ReviewsRow>;
      review_comments: TableDef<ReviewCommentsRow>;
      review_reactions: TableDef<ReviewReactionsRow>;
      review_reports: TableDef<ReviewReportsRow>;
      addresses: TableDef<AddressesRow>;
      notifications: TableDef<NotificationsRow>;
      verification_codes: TableDef<VerificationCodesRow>;
      advert_tiers: TableDef<AdvertTiersRow>;
      advert_transactions: TableDef<AdvertTransactionsRow>;
      bearing_posts: TableDef<BearingPostsRow>;
      admin_activity_log: TableDef<AdminActivityLogRow>;
      conversations: TableDef<ConversationsRow>;
      messages: TableDef<MessagesRow>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
