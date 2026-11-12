// lib/e-repair.ts
//
// Server-side data for the E-Repair section (bookings, repairs, discovery,
// reports), read from Supabase with the service-role client and mapped into
// the shapes app/(dashboard)/e-repair renders.
//
// Source tables (schema owned by fixit-app-mobile/supabase/migrations, see
// 20261104120000_service_bookings_flow.sql and 20261105090000):
//   bookings + repair_requests + invoices          -> Bookings tab
//   bookings the provider accepted                 -> Repairs tab
//   invoices on bookings + invoice_items           -> Discovery tab (what the
//                                                     repairer itemised)
//   bookings, aggregated per calendar month        -> Reports tab (no reports
//                                                     table exists; derived)
import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchAll } from "@/lib/supabase/fetch-all";

type Admin = ReturnType<typeof createAdminClient>;

// ---------------------------------------------------------------------------
// Row shapes

// Embeds can come back as an object or a one-element array depending on how
// PostgREST reads the relationship, so every embed goes through first().
type MaybeArray<T> = T | T[] | null;

function first<T>(value: MaybeArray<T>): T | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

type ProfileRef = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  business_name: string | null;
  company_name: string | null;
  email: string | null;
  phone_number: string | null;
};

type InvoiceItemRow = {
  name: string;
  repair_part: string | null;
  quantity: number;
  unit_price: number | string;
  item_state: "new" | "fairly_used";
  sort_order: number;
};

type InvoiceRow = {
  id: string;
  invoice_number: string | null;
  amount: number | string;
  currency: string;
  status: "pending" | "paid" | "failed" | "refunded";
  due_date: string | null;
  created_at: string;
  updated_at: string;
  items: InvoiceItemRow[] | null;
  payments: { amount: number | string; status: string }[] | null;
};

type RepairRequestRow = {
  id: string;
  category: Category;
  service_mode: "HomeService" | "Workshop" | "Pickup" | "VIP" | null;
  form_data: Record<string, unknown> | null;
  media: unknown;
  scheduled_at: string | null;
  latitude: number | null;
  longitude: number | null;
};

type Category = "auto" | "gadget" | "plumbing" | "electrical";
type BookingStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";

type BookingRow = {
  id: string;
  status: BookingStatus;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
  quote_amount: number | string | null;
  currency: string;
  decline_reason: string | null;
  customer_id: string;
  provider_id: string | null;
  customer: MaybeArray<ProfileRef>;
  provider: MaybeArray<ProfileRef>;
  assigned_staff: MaybeArray<{ first_name: string; last_name: string }>;
  service: MaybeArray<{ name: string; category: Category }>;
  repair_request: MaybeArray<RepairRequestRow>;
  invoices: MaybeArray<InvoiceRow>;
};

const PROFILE_COLUMNS =
  "id, first_name, last_name, business_name, company_name, email, phone_number";

const BOOKING_SELECT =
  "id, status, scheduled_at, created_at, updated_at, quote_amount, currency, " +
  "decline_reason, customer_id, provider_id, " +
  `customer:profiles!bookings_customer_id_fkey(${PROFILE_COLUMNS}), ` +
  `provider:profiles!bookings_provider_id_fkey(${PROFILE_COLUMNS}), ` +
  "assigned_staff:staff(first_name, last_name), " +
  "service:services(name, category), " +
  "repair_request:repair_requests(id, category, service_mode, form_data, media, " +
  "scheduled_at, latitude, longitude), " +
  "invoices(id, invoice_number, amount, currency, status, due_date, created_at, updated_at, " +
  "items:invoice_items(name, repair_part, quantity, unit_price, item_state, sort_order), " +
  "payments(amount, status))";

// ---------------------------------------------------------------------------
// Labels. Category and service-type labels match the filter options on
// app/(dashboard)/e-repair/page.tsx.

const CATEGORY_LABEL: Record<Category, string> = {
  auto: "Automobile",
  gadget: "Gadgets",
  plumbing: "Plumbing",
  electrical: "Electrical",
};

const SERVICE_MODE_LABEL: Record<NonNullable<RepairRequestRow["service_mode"]>, string> = {
  HomeService: "Home",
  Workshop: "Workshop",
  Pickup: "Pickup",
  VIP: "VIP",
};

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const PAYMENT_LABEL: Record<InvoiceRow["status"], string> = {
  pending: "Unpaid",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};

const ITEM_STATE_LABEL: Record<InvoiceItemRow["item_state"], string> = {
  new: "New",
  fairly_used: "Fairly used",
};

// A booking the provider has accepted is a repair job.
const ACCEPTED: BookingStatus[] = ["confirmed", "in_progress", "completed"];

// ---------------------------------------------------------------------------
// Helpers

function displayName(p: ProfileRef | null): string {
  if (!p) return "Unknown";
  const full = [p.first_name, p.last_name].filter(Boolean).join(" ").trim();
  return p.business_name || p.company_name || full || p.email || "Unknown";
}

// Timestamps are stored as UTC; render them as UTC so the list, filters and
// detail pages agree regardless of where the server runs.
function day(iso: string | null | undefined): string | undefined {
  return iso ? iso.slice(0, 10) : undefined;
}

function dateTime(iso: string | null | undefined): string | undefined {
  return iso ? `${iso.slice(0, 10)} ${iso.slice(11, 16)} UTC` : undefined;
}

// Short, human-friendly reference for a uuid (searchable on the list page).
function ref(prefix: string, id: string): string {
  return `${prefix}-${id.slice(0, 8).toUpperCase()}`;
}

// repair_requests.form_data is Record<string, string>; field names differ by
// category (see fixit-app-mobile app/screens/repairServices/repairFormConfig.ts).
function formText(form: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const v = form[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
}

function mediaList(value: unknown): { url: string; type: "image" | "video" }[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const { url, type } = item as Record<string, unknown>;
    return typeof url === "string" ? [{ url, type: type === "video" ? "video" : "image" }] : [];
  });
}

function money(value: number | string | null | undefined): number | null {
  return value == null ? null : Number(value);
}

// ---------------------------------------------------------------------------
// Bookings / Repairs (one shape; Repairs is the accepted subset)

function mapBooking(b: BookingRow) {
  const customer = first(b.customer);
  const provider = first(b.provider);
  const staff = first(b.assigned_staff);
  const service = first(b.service);
  const request = first(b.repair_request);
  const invoice = first(b.invoices);
  const form = (request?.form_data ?? {}) as Record<string, unknown>;
  const category = request?.category ?? service?.category;
  const scheduledAt = request?.scheduled_at ?? b.scheduled_at;
  const quote = money(b.quote_amount);
  const invoiceAmount = money(invoice?.amount);
  const amountPaid = (invoice?.payments ?? [])
    .filter((p) => p.status === "paid")
    .reduce((n, p) => n + Number(p.amount), 0);

  return {
    id: b.id,
    repairId: ref("BK", b.id),
    status: b.status,
    bookingStatus: STATUS_LABEL[b.status],
    bookingDate: day(b.created_at)!,
    scheduledDate: day(scheduledAt),
    scheduledTime: dateTime(scheduledAt),
    // No started_at / completed_at columns exist. A completed booking is
    // terminal, so its updated_at is when it was marked completed (unless the
    // repairer re-sent the invoice afterwards).
    completionDate: b.status === "completed" ? day(b.updated_at) : undefined,
    category: category ? CATEGORY_LABEL[category] : "-",
    serviceName: service?.name,
    serviceType: request?.service_mode ? SERVICE_MODE_LABEL[request.service_mode] : "-",
    serviceLocation:
      request?.latitude != null && request?.longitude != null
        ? `${request.latitude.toFixed(5)}, ${request.longitude.toFixed(5)}`
        : undefined,

    customerId: b.customer_id,
    customerName: displayName(customer),
    customerEmail: customer?.email ?? undefined,
    customerPhone: customer?.phone_number ?? undefined,

    technicianId: b.provider_id ?? undefined,
    technician: provider ? displayName(provider) : "Unassigned",
    technicianPhone: provider?.phone_number ?? undefined,
    assignedStaff: staff
      ? [staff.first_name, staff.last_name].filter(Boolean).join(" ")
      : undefined,

    deviceType: formText(form, "productType", "gadgetType"),
    brand: formText(form, "productBrand"),
    model: formText(form, "modelNumber", "productModel", "gadgetSeries"),
    serialNumber: formText(form, "serialNumber"),
    repairType: formText(form, "repairType"),
    issueDescription: formText(form, "issueDescription"),
    specificInstructions: formText(form, "specificInstructions"),
    media: mediaList(request?.media),

    currency: b.currency,
    initialCost: quote ?? 0,
    totalCost: invoiceAmount ?? quote ?? 0,
    amountPaid,
    invoiceId: invoice?.id,
    invoiceNumber: invoice?.invoice_number ?? undefined,
    paymentStatus: invoice ? PAYMENT_LABEL[invoice.status] : "Not invoiced",
    // There is no customer sign-off column; a repair counts as confirmed once
    // the repairer has marked it completed.
    repairConfirmation:
      b.status === "completed" ? "Confirmed" : ACCEPTED.includes(b.status) ? "Pending" : "N/A",
    reasonForCancellation: b.status === "cancelled" ? b.decline_reason ?? undefined : undefined,
  };
}

async function loadBookingRows(admin: Admin, statuses?: BookingStatus[]) {
  return fetchAll<BookingRow>((from, to) => {
    let q = admin.from("bookings").select(BOOKING_SELECT);
    if (statuses) q = q.in("status", statuses);
    return q.order("created_at", { ascending: false }).order("id").range(from, to);
  });
}

async function loadBookingRow(admin: Admin, id: string) {
  const { data, error } = await admin
    .from("bookings")
    .select(BOOKING_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as unknown as BookingRow | null;
}

export async function loadBookings(admin: Admin) {
  return (await loadBookingRows(admin)).map(mapBooking);
}

export async function loadBooking(admin: Admin, id: string) {
  const row = await loadBookingRow(admin, id);
  return row ? mapBooking(row) : null;
}

export async function loadRepairs(admin: Admin) {
  return (await loadBookingRows(admin, ACCEPTED)).map(mapBooking);
}

export async function loadRepair(admin: Admin, id: string) {
  const row = await loadBookingRow(admin, id);
  return row && ACCEPTED.includes(row.status) ? mapBooking(row) : null;
}

// ---------------------------------------------------------------------------
// Discovery: the invoice a repairer raised on a booking, with the items
// (labour, parts) they found were needed. Keyed by invoice id.

function mapDiscovery(b: BookingRow) {
  const invoice = first(b.invoices);
  if (!invoice) return null;
  const booking = mapBooking(b);
  const items = [...(invoice.items ?? [])].sort((x, y) => x.sort_order - y.sort_order);

  return {
    ...booking,
    id: invoice.id,
    bookingId: b.id,
    discoveryId: invoice.invoice_number ?? ref("INV", invoice.id),
    discovery: items.map((i) => i.name).join(", ") || "Quote only (not itemised)",
    description: booking.issueDescription ?? "-",
    discoveryDate: day(invoice.created_at)!,
    lastUpdated: day(invoice.updated_at),
    dueDate: invoice.due_date ?? undefined,
    invoiceAmount: Number(invoice.amount),
    paymentStatus: PAYMENT_LABEL[invoice.status],
    items: items.map((i) => ({
      name: i.name,
      repairPart: i.repair_part ?? undefined,
      quantity: i.quantity,
      unitPrice: Number(i.unit_price),
      condition: ITEM_STATE_LABEL[i.item_state],
    })),
  };
}

export async function loadDiscoveries(admin: Admin) {
  const rows = await loadBookingRows(admin);
  return rows
    .map(mapDiscovery)
    .filter((d): d is NonNullable<typeof d> => d !== null)
    .sort((a, b) => b.discoveryDate.localeCompare(a.discoveryDate));
}

export async function loadDiscovery(admin: Admin, invoiceId: string) {
  const { data, error } = await admin
    .from("invoices")
    .select("booking_id")
    .eq("id", invoiceId)
    .not("booking_id", "is", null)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.booking_id) return null;
  const row = await loadBookingRow(admin, data.booking_id as string);
  return row ? mapDiscovery(row) : null;
}

// ---------------------------------------------------------------------------
// Reports: one monthly repairs report per calendar month (UTC) that has
// bookings. Revenue counts paid invoices on that month's bookings.

type ReportBookingRow = {
  id: string;
  status: BookingStatus;
  created_at: string;
  invoices: MaybeArray<{ amount: number | string; status: string }>;
};

const MONTH_LABEL = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function buildReports(bookings: ReportBookingRow[]) {
  const byMonth = new Map<string, ReportBookingRow[]>();
  for (const b of bookings) {
    const key = b.created_at.slice(0, 7); // yyyy-MM
    byMonth.set(key, [...(byMonth.get(key) ?? []), b]);
  }

  const today = new Date().toISOString();
  const currentMonth = today.slice(0, 7);

  return Array.from(byMonth.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([month, rows]) => {
      const [y, m] = month.split("-").map(Number);
      const start = new Date(Date.UTC(y, m - 1, 1));
      const end = new Date(Date.UTC(y, m, 0));
      const paid = rows
        .map((b) => first(b.invoices))
        .filter((i): i is NonNullable<typeof i> => i?.status === "paid");
      const count = (s: BookingStatus) => rows.filter((b) => b.status === s).length;

      return {
        id: month,
        reportName: `Repairs report, ${MONTH_LABEL.format(start)}`,
        type: "Monthly Repairs",
        period: `${day(start.toISOString())} to ${day(end.toISOString())}`,
        generatedDate: day(today)!,
        totalRevenue: paid.reduce((n, i) => n + Number(i.amount), 0),
        status: month === currentMonth ? "Processing" : "Completed",
        totalBookings: rows.length,
        repairsCompleted: count("completed"),
        repairsInProgress: count("confirmed") + count("in_progress"),
        pendingBookings: count("pending"),
        cancelledBookings: count("cancelled"),
        paidInvoices: paid.length,
      };
    });
}

const REPORT_SELECT = "id, status, created_at, invoices(amount, status)";

export async function loadReports(admin: Admin) {
  const rows = await fetchAll<ReportBookingRow>((from, to) =>
    admin
      .from("bookings")
      .select(REPORT_SELECT)
      .order("created_at", { ascending: false })
      .order("id")
      .range(from, to)
  );
  return buildReports(rows);
}

export async function loadReport(admin: Admin, month: string) {
  if (!/^\d{4}-\d{2}$/.test(month)) return null;
  const [y, m] = month.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1)).toISOString();
  const end = new Date(Date.UTC(y, m, 1)).toISOString();
  const rows = await fetchAll<ReportBookingRow>((from, to) =>
    admin
      .from("bookings")
      .select(REPORT_SELECT)
      .gte("created_at", start)
      .lt("created_at", end)
      .order("id")
      .range(from, to)
  );
  return buildReports(rows)[0] ?? null;
}

export type ERepairBooking = ReturnType<typeof mapBooking>;
export type ERepairDiscovery = NonNullable<ReturnType<typeof mapDiscovery>>;
export type ERepairReport = ReturnType<typeof buildReports>[number];
