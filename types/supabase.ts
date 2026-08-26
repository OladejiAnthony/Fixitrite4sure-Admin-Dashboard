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
  created_at: string;
  updated_at: string;
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
