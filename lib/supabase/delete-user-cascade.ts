// lib/supabase/delete-user-cascade.ts
import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

type AdminClient = SupabaseClient<Database>;

const idsOf = (rows: { id: string }[] | null) => (rows ?? []).map((r) => r.id);

// Full cascade delete for a public.profiles row and everything that
// references it. Schema/migrations live in the sibling fixit-app-mobile
// repo (see CLAUDE.md) so there's no guarantee these FKs cascade at the DB
// level — this walks the dependency graph here instead, deepest tables
// first, so a partially-enforced FK never blocks a later delete. If the
// live schema already cascades some of these, the matching call below is
// just a harmless no-op (0 rows matched).
export async function deleteUserCascade(
  admin: AdminClient,
  userId: string
): Promise<{ error: string | null }> {
  const { data: reviewRows, error: reviewLookupError } = await admin
    .from("reviews")
    .select("id")
    .or(`provider_id.eq.${userId},author_id.eq.${userId}`);
  if (reviewLookupError) return { error: `reviews (lookup): ${reviewLookupError.message}` };
  const reviewIds = idsOf(reviewRows);

  if (reviewIds.length) {
    const { error } = await admin.from("review_comments").delete().in("review_id", reviewIds);
    if (error) return { error: `review_comments: ${error.message}` };
    const { error: reactionsError } = await admin
      .from("review_reactions")
      .delete()
      .in("review_id", reviewIds);
    if (reactionsError) return { error: `review_reactions: ${reactionsError.message}` };
    const { error: reportsError } = await admin
      .from("review_reports")
      .delete()
      .in("review_id", reviewIds);
    if (reportsError) return { error: `review_reports: ${reportsError.message}` };
  }

  {
    const { error } = await admin.from("review_comments").delete().eq("author_id", userId);
    if (error) return { error: `review_comments: ${error.message}` };
  }
  {
    const { error } = await admin.from("review_reactions").delete().eq("author_id", userId);
    if (error) return { error: `review_reactions: ${error.message}` };
  }
  {
    const { error } = await admin.from("review_reports").delete().eq("reporter_id", userId);
    if (error) return { error: `review_reports: ${error.message}` };
  }

  if (reviewIds.length) {
    const { error } = await admin.from("reviews").delete().in("id", reviewIds);
    if (error) return { error: `reviews: ${error.message}` };
  }

  const { data: bookingRows, error: bookingLookupError } = await admin
    .from("bookings")
    .select("id")
    .or(`customer_id.eq.${userId},provider_id.eq.${userId}`);
  if (bookingLookupError) return { error: `bookings (lookup): ${bookingLookupError.message}` };
  const bookingIds = idsOf(bookingRows);

  const { data: orderRows, error: orderLookupError } = await admin
    .from("orders")
    .select("id")
    .eq("customer_id", userId);
  if (orderLookupError) return { error: `orders (lookup): ${orderLookupError.message}` };
  const orderIds = idsOf(orderRows);

  const invoiceOr = [
    `owner_id.eq.${userId}`,
    bookingIds.length ? `booking_id.in.(${bookingIds.join(",")})` : null,
    orderIds.length ? `order_id.in.(${orderIds.join(",")})` : null,
  ]
    .filter((clause): clause is string => Boolean(clause))
    .join(",");
  const { data: invoiceRows, error: invoiceLookupError } = await admin
    .from("invoices")
    .select("id")
    .or(invoiceOr);
  if (invoiceLookupError) return { error: `invoices (lookup): ${invoiceLookupError.message}` };
  const invoiceIds = idsOf(invoiceRows);

  if (invoiceIds.length) {
    const { error } = await admin.from("payments").delete().in("invoice_id", invoiceIds);
    if (error) return { error: `payments: ${error.message}` };
  }
  {
    const { error } = await admin.from("payments").delete().eq("owner_id", userId);
    if (error) return { error: `payments: ${error.message}` };
  }
  if (invoiceIds.length) {
    const { error } = await admin.from("invoices").delete().in("id", invoiceIds);
    if (error) return { error: `invoices: ${error.message}` };
  }

  const { data: repairRequestRows, error: repairRequestLookupError } = await admin
    .from("repair_requests")
    .select("id")
    .or(`customer_id.eq.${userId},provider_id.eq.${userId}`);
  if (repairRequestLookupError)
    return { error: `repair_requests (lookup): ${repairRequestLookupError.message}` };
  const repairRequestIds = idsOf(repairRequestRows);

  if (bookingIds.length) {
    const { error } = await admin.from("bookings").delete().in("id", bookingIds);
    if (error) return { error: `bookings: ${error.message}` };
  }
  if (orderIds.length) {
    const { error } = await admin.from("orders").delete().in("id", orderIds);
    if (error) return { error: `orders: ${error.message}` };
  }
  if (repairRequestIds.length) {
    const { error } = await admin.from("repair_requests").delete().in("id", repairRequestIds);
    if (error) return { error: `repair_requests: ${error.message}` };
  }

  {
    const { error } = await admin.from("services").delete().eq("provider_id", userId);
    if (error) return { error: `services: ${error.message}` };
  }
  {
    const { error } = await admin.from("payment_cards").delete().eq("owner_id", userId);
    if (error) return { error: `payment_cards: ${error.message}` };
  }
  {
    const { error } = await admin.from("addresses").delete().eq("owner_id", userId);
    if (error) return { error: `addresses: ${error.message}` };
  }
  {
    const { error } = await admin.from("notifications").delete().eq("owner_id", userId);
    if (error) return { error: `notifications: ${error.message}` };
  }
  {
    const { error } = await admin.from("advert_transactions").delete().eq("user_id", userId);
    if (error) return { error: `advert_transactions: ${error.message}` };
  }
  {
    const { error } = await admin.from("bearing_posts").delete().eq("author_id", userId);
    if (error) return { error: `bearing_posts: ${error.message}` };
  }

  {
    const { error } = await admin.from("profiles").delete().eq("id", userId);
    if (error) return { error: `profiles: ${error.message}` };
  }

  const { error: authError } = await admin.auth.admin.deleteUser(userId);
  if (authError) return { error: `auth user: ${authError.message}` };

  return { error: null };
}
