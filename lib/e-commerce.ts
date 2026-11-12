// lib/e-commerce.ts
//
// Server-side data for the E-Commerce section (orders, stores, products,
// reports), read from Supabase with the service-role client and mapped into
// the shapes app/(dashboard)/e-commerce renders.
//
// Source tables (schema owned by fixit-app-mobile/supabase/migrations):
//   orders, order_items, invoices, payments  -> Orders tab
//   profiles (vendor/company) + products     -> Stores tab
//   products + product_reviews               -> Products tab
//   orders, aggregated per calendar month    -> Reports tab (no reports table
//                                               exists; these are derived)
import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

type Admin = ReturnType<typeof createAdminClient>;

// PostgREST caps every response (1000 rows by default), so page until a
// short page comes back.
const PAGE_SIZE = 1000;

async function fetchAll<T>(
  query: (
    from: number,
    to: number
  ) => PromiseLike<{ data: unknown; error: { message: string } | null }>
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await query(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    const page = (data ?? []) as T[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) return rows;
  }
}

// ---------------------------------------------------------------------------
// Shared helpers

type ProfileRef = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  business_name?: string | null;
  company_name?: string | null;
  email: string | null;
  phone_number?: string | null;
} | null;

function personName(p: ProfileRef): string {
  if (!p) return "Unknown";
  const full = [p.first_name, p.last_name].filter(Boolean).join(" ").trim();
  return full || p.email || "Unknown";
}

function storeName(p: ProfileRef): string {
  if (!p) return "Unknown store";
  return p.business_name || p.company_name || personName(p);
}

// Timestamps are stored as UTC; render dates as UTC so the list, filters and
// detail pages agree regardless of where the server runs.
function day(iso: string | null | undefined): string | undefined {
  return iso ? iso.slice(0, 10) : undefined;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ");
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

// ---------------------------------------------------------------------------
// Orders

const ORDER_SELECT =
  "id, status, total_amount, delivery, paid_at, created_at, updated_at, " +
  "customer:profiles(id, first_name, last_name, email, phone_number), " +
  "items:order_items(id, product_id, seller_id, title, unit_price, quantity, variant, " +
  "fulfilment_status, shipped_at, delivered_at, " +
  "seller:profiles(id, first_name, last_name, business_name, company_name, email)), " +
  "invoices(id, status, payments(id, status, created_at))";

type OrderRow = {
  id: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total_amount: number;
  delivery: Record<string, unknown> | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  customer: ProfileRef;
  items: {
    id: string;
    product_id: string | null;
    seller_id: string;
    title: string;
    unit_price: number;
    quantity: number;
    variant: string;
    fulfilment_status: "pending" | "shipped" | "delivered";
    shipped_at: string | null;
    delivered_at: string | null;
    seller: ProfileRef;
  }[];
  invoices: {
    id: string;
    status: "pending" | "paid" | "failed" | "refunded";
    payments: { id: string; status: string; created_at: string }[];
  }[];
};

const PAYMENT_LABEL: Record<string, string> = {
  paid: "Paid",
  pending: "Unpaid",
  failed: "Failed",
  refunded: "Refunded",
};

const SHIPPING_LABEL: Record<OrderRow["status"], string> = {
  pending: "-",
  cancelled: "-",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
};

// orders.delivery is a free-form snapshot written by the mobile app at
// checkout. Prefer a recognisable address field, else join its text values.
function deliveryAddress(delivery: OrderRow["delivery"]): string | undefined {
  if (!delivery || typeof delivery !== "object") return undefined;
  for (const key of ["formatted_address", "formattedAddress", "address", "fullAddress"]) {
    const v = delivery[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  const parts = Object.values(delivery).filter(
    (v): v is string => typeof v === "string" && v.trim() !== ""
  );
  return parts.length ? parts.join(", ") : undefined;
}

function mapOrder(o: OrderRow) {
  const items = o.items ?? [];
  const invoice = (o.invoices ?? [])[0];
  const payments = [...(invoice?.payments ?? [])].sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  );
  const payment = payments.find((p) => p.status === "paid") ?? payments[0];

  const sellers = unique(items.map((i) => i.seller_id)).map(
    (id) => items.find((i) => i.seller_id === id)!.seller
  );
  const stores = sellers.map(storeName).join(", ") || "-";
  const shipped = items.map((i) => i.shipped_at).filter(Boolean).sort() as string[];
  const delivered = items.map((i) => i.delivered_at).filter(Boolean).sort() as string[];
  const allDelivered = items.length > 0 && items.every((i) => i.fulfilment_status === "delivered");

  return {
    id: o.id,
    customerName: personName(o.customer),
    customerEmail: o.customer?.email ?? undefined,
    customerPhone: o.customer?.phone_number ?? undefined,
    customerAddress: deliveryAddress(o.delivery),
    orderDate: day(o.created_at)!,
    totalAmount: Number(o.total_amount),
    totalPrice: Number(o.total_amount),
    orderStatus: capitalize(o.status),
    paymentStatus: invoice ? PAYMENT_LABEL[invoice.status] : o.paid_at ? "Paid" : "Unpaid",
    paidDate: day(o.paid_at),
    shippingStatus: SHIPPING_LABEL[o.status],
    store: stores,
    storeName: stores,
    storesId: sellers.map((s) => s?.id).filter(Boolean).join(", ") || undefined,
    vendor: stores,
    transactionId: payment?.id,
    quantity: items.reduce((n, i) => n + i.quantity, 0),
    productId: items.map((i) => i.product_id).filter(Boolean).join(", ") || undefined,
    productName: items.map((i) => i.title).join(", ") || undefined,
    productStatus: unique(items.map((i) => capitalize(i.fulfilment_status))).join(", ") || undefined,
    shippingDate: day(shipped[0]),
    deliveryDate: allDelivered ? day(delivered[delivered.length - 1]) : undefined,
    items: items.map((i) => ({
      id: i.id,
      productId: i.product_id,
      productName: i.title,
      variant: i.variant || undefined,
      quantity: i.quantity,
      unitPrice: Number(i.unit_price),
      storeId: i.seller_id,
      storeName: storeName(i.seller),
      fulfilmentStatus: capitalize(i.fulfilment_status),
      shippedAt: day(i.shipped_at),
      deliveredAt: day(i.delivered_at),
    })),
  };
}

export async function loadOrders(admin: Admin) {
  const rows = await fetchAll<OrderRow>((from, to) =>
    admin
      .from("orders")
      .select(ORDER_SELECT)
      .order("created_at", { ascending: false }).order("id")
      .range(from, to)
  );
  return rows.map(mapOrder);
}

export async function loadOrder(admin: Admin, id: string) {
  const { data, error } = await admin
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapOrder(data as unknown as OrderRow) : null;
}

// ---------------------------------------------------------------------------
// Products

const LOW_STOCK_THRESHOLD = 5;

const PRODUCT_SELECT =
  "id, seller_id, title, description, price, discount_percent, category, stock, " +
  "free_delivery, delivery_fee, delivery_days, status, purchased_count, created_at, updated_at, " +
  "seller:profiles(id, first_name, last_name, business_name, company_name, email)";

type ProductRow = {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  price: number;
  discount_percent: number;
  category: string;
  stock: number;
  free_delivery: boolean;
  delivery_fee: number;
  delivery_days: number | null;
  status: "active" | "draft" | "archived";
  purchased_count: number;
  created_at: string;
  updated_at: string;
  seller: ProfileRef;
};

function productStatus(p: ProductRow): string {
  if (p.status !== "active") return capitalize(p.status);
  if (p.stock <= 0) return "Out of Stock";
  if (p.stock <= LOW_STOCK_THRESHOLD) return "Low Stock";
  return "Available";
}

type ReviewRow = { product_id: string; rating: number };

function ratingByProduct(reviews: ReviewRow[]) {
  const acc = new Map<string, { sum: number; count: number }>();
  for (const r of reviews) {
    const a = acc.get(r.product_id) ?? { sum: 0, count: 0 };
    a.sum += r.rating;
    a.count += 1;
    acc.set(r.product_id, a);
  }
  return acc;
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function mapProduct(p: ProductRow, rating?: { sum: number; count: number }) {
  return {
    id: p.id,
    productName: p.title,
    description: p.description ?? undefined,
    category: capitalize(p.category),
    quantity: p.stock,
    price: Number(p.price),
    discountPercent: Number(p.discount_percent),
    status: productStatus(p),
    listingStatus: capitalize(p.status),
    storeId: p.seller_id,
    storeName: storeName(p.seller),
    dateAdded: day(p.created_at)!,
    lastUpdated: day(p.updated_at),
    purchasedCount: p.purchased_count,
    freeDelivery: p.free_delivery,
    deliveryFee: Number(p.delivery_fee),
    deliveryDays: p.delivery_days,
    rating: rating ? round1(rating.sum / rating.count) : null,
    reviewCount: rating?.count ?? 0,
  };
}

export async function loadProducts(admin: Admin) {
  const [rows, reviews] = await Promise.all([
    fetchAll<ProductRow>((from, to) =>
      admin
        .from("products")
        .select(PRODUCT_SELECT)
        .order("created_at", { ascending: false }).order("id")
        .range(from, to)
    ),
    fetchAll<ReviewRow>((from, to) =>
      admin.from("product_reviews").select("product_id, rating").order("id").range(from, to)
    ),
  ]);
  const ratings = ratingByProduct(reviews);
  return rows.map((p) => mapProduct(p, ratings.get(p.id)));
}

export async function loadProduct(admin: Admin, id: string) {
  const [{ data, error }, reviews] = await Promise.all([
    admin.from("products").select(PRODUCT_SELECT).eq("id", id).maybeSingle(),
    fetchAll<ReviewRow>((from, to) =>
      admin
        .from("product_reviews")
        .select("product_id, rating")
        .eq("product_id", id)
        .order("id")
        .range(from, to)
    ),
  ]);
  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapProduct(data as unknown as ProductRow, ratingByProduct(reviews).get(id));
}

// ---------------------------------------------------------------------------
// Stores: vendor and company profiles, i.e. the accounts allowed to list
// products (public.is_product_seller). Companies are only included once they
// have listed something, since most of them are repair businesses.

type SellerRow = {
  id: string;
  user_type: "vendor" | "company";
  first_name: string | null;
  last_name: string | null;
  business_name: string | null;
  company_name: string | null;
  email: string | null;
  phone_number: string | null;
  verification_status: string | null;
  created_at: string;
  addresses: { formatted_address: string; created_at: string }[];
};

type SellerProductRow = { id: string; seller_id: string; status: string };
type SellerItemRow = {
  seller_id: string;
  quantity: number;
  unit_price: number;
  created_at: string;
  order: { status: string } | null;
};

// Orders count as sales once paid (processing onward), never when cancelled.
const SOLD_STATUSES = new Set(["processing", "shipped", "delivered"]);

async function loadStoreData(admin: Admin, sellerId?: string) {
  const sellers = await fetchAll<SellerRow>((from, to) => {
    let q = admin
      .from("profiles")
      .select(
        "id, user_type, first_name, last_name, business_name, company_name, email, " +
          "phone_number, verification_status, created_at, addresses(formatted_address, created_at)"
      )
      .in("user_type", ["vendor", "company"])
      .eq("is_admin", false);
    if (sellerId) q = q.eq("id", sellerId);
    return q.order("created_at", { ascending: false }).order("id").range(from, to);
  });

  const [products, reviews, items] = await Promise.all([
    fetchAll<SellerProductRow>((from, to) => {
      let q = admin.from("products").select("id, seller_id, status");
      if (sellerId) q = q.eq("seller_id", sellerId);
      return q.order("id").range(from, to);
    }),
    fetchAll<ReviewRow>((from, to) =>
      admin.from("product_reviews").select("product_id, rating").order("id").range(from, to)
    ),
    fetchAll<SellerItemRow>((from, to) => {
      let q = admin
        .from("order_items")
        .select("seller_id, quantity, unit_price, created_at, order:orders(status)");
      if (sellerId) q = q.eq("seller_id", sellerId);
      return q.order("id").range(from, to);
    }),
  ]);

  const productSeller = new Map(products.map((p) => [p.id, p.seller_id]));

  return sellers
    .filter(
      (s) => s.user_type === "vendor" || products.some((p) => p.seller_id === s.id)
    )
    .map((s) => {
      const own = products.filter((p) => p.seller_id === s.id);
      const ownReviews = reviews.filter((r) => productSeller.get(r.product_id) === s.id);
      const ownItems = items.filter((i) => i.seller_id === s.id);
      const sold = ownItems.filter((i) => i.order && SOLD_STATUSES.has(i.order.status));
      const lastOrder = ownItems.map((i) => i.created_at).sort().pop();
      const address = [...(s.addresses ?? [])]
        .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];

      return {
        id: s.id,
        storeName: storeName(s),
        storeType: capitalize(s.user_type),
        ownerName: personName(s),
        email: s.email ?? undefined,
        phone: s.phone_number ?? undefined,
        verificationStatus: s.verification_status
          ? capitalize(s.verification_status)
          : "Unverified",
        totalProducts: own.filter((p) => p.status !== "archived").length,
        activeProducts: own.filter((p) => p.status === "active").length,
        rating: ownReviews.length
          ? round1(ownReviews.reduce((n, r) => n + r.rating, 0) / ownReviews.length)
          : null,
        reviewCount: ownReviews.length,
        lastOrderDate: day(lastOrder) ?? "-",
        totalOrders: ownItems.length,
        itemsSold: sold.reduce((n, i) => n + i.quantity, 0),
        totalSales: sold.reduce((n, i) => n + Number(i.unit_price) * i.quantity, 0),
        status: own.some((p) => p.status === "active") ? "Active" : "Inactive",
        location: address?.formatted_address ?? "-",
        joinedDate: day(s.created_at),
      };
    });
}

export function loadStores(admin: Admin) {
  return loadStoreData(admin);
}

export async function loadStore(admin: Admin, id: string) {
  const [store] = await loadStoreData(admin, id);
  return store ?? null;
}

// ---------------------------------------------------------------------------
// Reports: one monthly sales report per calendar month (UTC) that has orders.
// Revenue counts paid, non-cancelled orders, matching SOLD_STATUSES.

type ReportOrderRow = {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
};

const MONTH_LABEL = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function buildReports(orders: ReportOrderRow[]) {
  const byMonth = new Map<string, ReportOrderRow[]>();
  for (const o of orders) {
    const key = o.created_at.slice(0, 7); // yyyy-MM
    byMonth.set(key, [...(byMonth.get(key) ?? []), o]);
  }

  const today = new Date().toISOString();
  const currentMonth = today.slice(0, 7);

  return Array.from(byMonth.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([month, rows]) => {
      const [y, m] = month.split("-").map(Number);
      const start = new Date(Date.UTC(y, m - 1, 1));
      const end = new Date(Date.UTC(y, m, 0));
      const sold = rows.filter((o) => SOLD_STATUSES.has(o.status));
      return {
        id: month,
        reportName: `Sales report, ${MONTH_LABEL.format(start)}`,
        type: "Monthly Sales",
        period: `${day(start.toISOString())} to ${day(end.toISOString())}`,
        generatedDate: day(today)!,
        totalRevenue: sold.reduce((n, o) => n + Number(o.total_amount), 0),
        status: month === currentMonth ? "Processing" : "Completed",
        totalOrders: rows.length,
        paidOrders: sold.length,
        pendingOrders: rows.filter((o) => o.status === "pending").length,
        cancelledOrders: rows.filter((o) => o.status === "cancelled").length,
        averageOrderValue: sold.length
          ? Math.round(
              (sold.reduce((n, o) => n + Number(o.total_amount), 0) / sold.length) * 100
            ) / 100
          : 0,
      };
    });
}

export async function loadReports(admin: Admin) {
  const orders = await fetchAll<ReportOrderRow>((from, to) =>
    admin
      .from("orders")
      .select("id, status, total_amount, created_at")
      .order("created_at", { ascending: false }).order("id")
      .range(from, to)
  );
  return buildReports(orders);
}

export async function loadReport(admin: Admin, month: string) {
  if (!/^\d{4}-\d{2}$/.test(month)) return null;
  const [y, m] = month.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1)).toISOString();
  const end = new Date(Date.UTC(y, m, 1)).toISOString();
  const orders = await fetchAll<ReportOrderRow>((from, to) =>
    admin
      .from("orders")
      .select("id, status, total_amount, created_at")
      .gte("created_at", start)
      .lt("created_at", end)
      .order("id")
      .range(from, to)
  );
  return buildReports(orders)[0] ?? null;
}
