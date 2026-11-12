# DASHBOARD.md: Connecting fixit-admin-dashboard to the shared Supabase backend

Status as of 2026-11-12. This started as a plan written from inside `fixit-app-mobile`; it now tracks where the migration actually stands. The folder on disk is `Fix-it Full Repo/Frontend codebase/fixit-app-dashboard`.

The two apps don't connect to each other. Each connects to the same Supabase project, and Postgres + RLS is what links them. That means two jobs: (1) point the dashboard at the same project, and (2) give it admin-level access, which the mobile app's owner-scoped RLS doesn't allow.

## 0. Current state

- **fixit-app-mobile** is fully on Supabase and owns the schema (`supabase/migrations/`, RLS on every table). It is the schema of record.
- **fixit-admin-dashboard is partway through the migration.** Supabase clients, real auth and the admin gate are done, and most core pages read live data. The rest still read the old hosted json-server (`lib/api-client.ts` → `https://fixit-dashboard-api.onrender.com`, backed by root `db.json`), which serves **fake data**.
- Auth is real: `lib/auth-service.ts` uses `supabase.auth.*`. The old plaintext-password flow is gone.
- The `profiles.is_admin` column exists (mobile migration `20260826120000_profile_is_admin.sql`). `middleware.ts` checks that a session exists; the `is_admin` check runs in `app/(dashboard)/layout.tsx`, because the Edge runtime can't load the service-role client.

Find whatever still uses the mock with:

```
grep -rl '@/lib/api-client' app components hooks lib store
```

## 1. Non-negotiable architecture decisions

**Migrations stay single-sourced in `fixit-app-mobile`.** Its `supabase/migrations/` is the schema of record, and its CI (`.github/workflows/supabase-deploy.yml`) pushes every merge straight to the live project with no staging step. **Never create a `supabase/migrations/` folder in this repo.** Two migration histories against one database will drift and conflict. Any schema change the dashboard needs is a new migration in the mobile repo, written the normal way (its `supabase-schema` skill). This repo only reads and writes the resulting schema.

**Admin access goes through the server, never through RLS exceptions.** Mobile RLS is owner-scoped (`auth.uid() = owner_id` / `customer_id`), and an admin needs everyone's rows. So:

- The browser client (`lib/supabase/client.ts`) uses the public **anon key** and is only for the admin's own login and session.
- Cross-user reads and writes go through **Route Handlers** under `app/api/admin/*`, using the **service_role** client (`lib/supabase/admin.ts`), which bypasses RLS. Every handler calls `requireAdmin()` first.
- The service_role key is never `NEXT_PUBLIC_`-prefixed and never imported into a Client Component. Server modules that use it start with `import "server-only"` so an accidental client import fails the build.

**"Admin" is a flag, not a user type.** `profiles.user_type` stays `customer | repairer | company | vendor`. Admins are `profiles.is_admin = true`, checked server-side with the service_role client.

## 2. One-time setup (done)

`.env.local` holds `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` for project ref `whxuzentzpqelkjkrwma`. Production needs the same three set in Vercel.

To make an account an admin, run this in the Supabase SQL editor:

```sql
update public.profiles set is_admin = true where id = '<auth.users uuid>';
```

## 3. Page status

### On Supabase (live data)

| Dashboard page | Route(s) | Source |
| --- | --- | --- |
| `customers`, `repairers`, `repair-companies`, `vendors` | `api/admin/{customers,repairers,repair-companies,vendors}` | `profiles` by `user_type` |
| `transaction-details` | `api/admin/transactions` | `payments` → `invoices` → `bookings` / `orders` |
| `reviews-feedbacks` | `api/admin/reviews` | `reviews` and related tables |
| `e-commerce` (orders, stores, products, reports) | `api/admin/e-commerce/[resource]` | `orders`, `order_items`, `products`, `product_reviews`, `invoices`, `payments` (`lib/e-commerce.ts`) |
| `e-repair` (bookings, repairs, discovery, reports), `bookings` | `api/admin/e-repair/[resource]` | `bookings`, `repair_requests`, `invoices`, `invoice_items`, `payments`, `staff` (`lib/e-repair.ts`) |
| `advertisement-banners` | `api/admin/adverts` | adverts tables |
| `content-management` | `api/admin/content` | content tables |
| `onboarding` | `api/admin/onboarding` | onboarding content |
| `super-admin` | `api/admin/super-admins` | `profiles.is_admin` |
| `sos-requests` | `api/admin/support-requests`, `api/admin/user-chats` | support requests and support chats |
| `analytics`, dashboard home activity feed | `api/admin/analytics`, `api/admin/activities` | aggregates; `admin_activity_log` |

### Still on the json-server mock (fake data)

Backing tables already exist for these, so they can be wired now:

- `transactions` list page (`components/dashboard/transactions.tsx` → `hooks/use-transactions.ts`). `api/admin/transactions` already exists, so this only needs the hook switched.
- `repair-bookings` (`hooks/use-repair-bookings.ts`). Overlaps with E-Repair; reuse `lib/e-repair.ts`.
- `product-orders` (`hooks/use-product-orders.ts`). Overlaps with E-Commerce orders; reuse `lib/e-commerce.ts`.
- `invoices` (`hooks/use-invoices.ts`) → `invoices`, `invoice_items`.
- `notifications` (`hooks/useNotifications.ts`) → `notifications`.
- Dashboard stats (`hooks/use-dashboard-stats.ts`). Probably derivable from existing tables, the same way `analytics` is.
- `profile`, `account-usage`. Should read the signed-in admin's own profile and `admin_activity_log`.

No backing table yet. These need a migration in `fixit-app-mobile` first (Prompt D below):

- `news`, `currency-settings`, `general-settings`, `language-settings`, `logistics`, `send-push-notifications`, `newsletter-subscribers`.

Static pages with no data source (hardcoded content): `faq`, `help`, `insurance`, `members`, `rules`, `terms-and-conditions`, `support-sytem`, `services`, `settings`. Decide per page whether they need a table at all.

## 4. Phased plan

1. **Auth + access gate.** Done.
2. **Core entity pages.** Mostly done. What remains is the "can be wired now" list in §3.
3. **Retire the old backend.** Once nothing imports `lib/api-client.ts`, remove it and `db.json`. Separately, and only with the owner's confirmation, decommission the `fixit-dashboard-api` deployment on Render.
4. **Schema gap-fill.** For the "no backing table" list, design and migrate the tables in `fixit-app-mobile` first, then wire the pages the same way as phase 2.

## 5. How to wire a page

Copy the E-Commerce / E-Repair pattern:

1. **Loader** in `lib/<section>.ts`: `import "server-only"`, query with the service_role client, page large tables with `lib/supabase/fetch-all.ts` (order by a unique column last), and map rows into the shape the page renders.
2. **Routes**: `app/api/admin/<section>/[resource]/route.ts` and `[resource]/[id]/route.ts`. Call `requireAdmin()` first, then the loader. Return 404 for non-uuid ids.
3. **Hook**: `hooks/use-admin-<section>.ts`, a TanStack Query hook that `fetch`es the route.
4. **Page**: swap `apiClient` for the hook. Import row types with `import type` from the loader file. Show loading, error and empty states.

Rules learned along the way:

- Check real column names against the mobile repo's migrations. `types/supabase.ts` is hand-written and best-effort.
- When a table has two foreign keys to the same table, embeds need a hint, for example `profiles!bookings_customer_id_fkey`.
- Never fill missing fields with hardcoded sample values. Show `-`.
- If the old mock had a field the real schema doesn't record, drop it or relabel it. Don't invent it.
- Writes that change a booking's or order's state belong to the mobile app's RPCs. Don't add admin write paths for them without deciding the business rule first.

## 6. Prompt D (run in fixit-app-mobile, not here): schema gap-fill

```
The fixit-admin-dashboard project has pages with no backing Supabase table yet:
news, currency-settings, general-settings, language-settings, logistics,
send-push-notifications, newsletter-subscribers.

For [name the specific page(s) you're ready to tackle], help me design the Postgres
schema following this repo's supabase-schema skill conventions (new migration file,
RLS enabled with explicit policies, referencing public.profiles(id) for any owner
column). Ask me about the actual fields/relationships this page needs before writing
the migration. Don't guess the shape from the page name alone.
```
