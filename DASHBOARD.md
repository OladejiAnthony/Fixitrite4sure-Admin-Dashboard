# DASHBOARD.md — Connecting fixit-admin-dashboard to the shared Supabase backend

This guide is written from inside `fixit-app-mobile`, after inspecting both codebases. It covers what "connect" actually means here, what's already true vs. what needs to change, and gives you copy-paste prompts to run **in a separate Claude Code session opened inside the `fixit-admin-dashboard` project** (its folder on disk is `Fix-it Full Repo/Frontend codebase/fixit-app-dashboard`).

Two apps talking to the same Supabase project don't need a direct connection to each other — they each connect independently to Supabase, and Supabase (specifically Postgres + RLS) is what "connects" them. So this is really two things: (1) point the dashboard at the same Supabase project, and (2) make sure its data model and access rules make sense for an admin, which the mobile app's rules don't currently allow.

## 0. What I found (current state)

- **fixit-app-mobile** is already fully on Supabase (`app/lib/supabase.ts`, `@supabase/supabase-js`, RLS-protected tables in `supabase/migrations/`). This is the schema of record.
- **fixit-admin-dashboard** (Next.js 15, App Router) has **no Supabase dependency at all yet**. Every page currently reads from a separate hosted json-server (`lib/api-client.ts` → `https://fixit-dashboard-api.onrender.com`, backed by its own `db.json`), and `lib/auth-service.ts` does fake auth: it fetches the whole `users` table client-side and compares plaintext passwords. None of this talks to Supabase — connecting isn't a config tweak, it's replacing this data layer.
- The dashboard already has `@reduxjs/toolkit` and `@tanstack/react-query` installed (same choices as the mobile app), so the target architecture can mirror the mobile app's Redux-for-app-state / TanStack-Query-for-server-state split.

## 1. Non-negotiable architecture decisions

**Migrations stay single-sourced in `fixit-app-mobile`.** This repo's `supabase/migrations/` is already the schema of record and already has a CI pipeline (`.github/workflows/supabase-deploy.yml`) that pushes every merge straight to the live project — there is no staging step. Do **not** let a Claude session create a second, independent `supabase/migrations/` folder inside `fixit-admin-dashboard` — two migration histories against one database will drift and eventually conflict. Any schema change the dashboard needs gets added as a new migration **here**, in this repo, the normal way (see the `supabase-schema` skill). The dashboard project only ever _reads/writes_ the resulting schema; it never owns it.

**Admin privilege is not the same shape as the mobile app's RLS.** The mobile app's RLS policies are owner-scoped (`auth.uid() = owner_id`/`customer_id`) — by design, a logged-in customer can only see their own rows. An admin needs to see _everyone's_ rows (all customers, all bookings, all payments). Rather than rewriting every existing policy to carve out an admin exception, the cleaner fix — and the standard pattern for admin dashboards — is:

- The dashboard's **browser-side** Supabase client uses the public **anon key**, same as the mobile app, and is only used for the admin's own login/session.
- All actual cross-user admin reads/writes go through **Next.js Route Handlers or Server Actions** (server-side code, never shipped to the browser) using the **service_role key**, which bypasses RLS entirely. Next.js is well suited to this precisely because it has a real server; the mobile app doesn't, which is why it can't do this and had to rely on RLS alone.
- The service*role key must never be prefixed `NEXT_PUBLIC*`and must never be imported into a Client Component — only into server-only files (Route Handlers, Server Actions,`"server-only"`-guarded modules).

**"Admin" needs to exist as a concept at all.** `profiles.user_type` is currently an enum of `customer | repairer | company | vendor` — there's no admin value, and adding one to the enum would ripple through every role-based screen in the mobile app for no reason. The minimal, safe addition is a new migration in this repo adding `is_admin boolean not null default false` to `public.profiles`, checked server-side (via service_role, since an admin's own client-side session is still subject to RLS) when the dashboard's login/middleware decides whether to grant access. **This migration needs to happen before anything else below — it's a blocking prerequisite.** I can create it in this session if you want; just ask.

## 2. One-time setup (you do this by hand, not via a prompt)

1. In the Supabase dashboard for the shared project (ref `whxuzentzpqelkjkrwma`), go to **Settings → API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key (treat this like a root DB password — it bypasses every RLS policy)
2. In `fixit-admin-dashboard`, create `.env.local` (already covered by Next.js's default `.gitignore`) with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=<project url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
   SUPABASE_SERVICE_ROLE_KEY=<service role key>
   ```
   Add the same three **key names only** to a new `.env.example` there, so the pattern matches this repo's `env-vars` convention.
3. Once the `is_admin` migration (§1) has been pushed, flip it to `true` for your own admin account directly in the Supabase SQL editor:
   ```sql
   update public.profiles set is_admin = true where id = '<your auth.users uuid>';
   ```

## 3. What actually maps to existing tables — and what doesn't

Not every dashboard page has a backing table yet. Don't let a Claude session "connect" a page by inventing a table on the spot inside the dashboard repo — that violates §1. Split the work into pages that can be wired today and pages that need schema design first (back in this repo).

**Maps cleanly to existing `supabase/migrations` tables today:**

| Dashboard page(s)                     | Table(s)                                                           |
| ------------------------------------- | ------------------------------------------------------------------ |
| `customers`                           | `profiles` where `user_type = 'customer'`                          |
| `repairers`                           | `profiles` where `user_type = 'repairer'`, `services`              |
| `repair-companies`                    | `profiles` where `user_type = 'company'`                           |
| `vendors`                             | `profiles` where `user_type = 'vendor'`                            |
| `repair-bookings`                     | `bookings`, `repair_requests`                                      |
| `product-orders`                      | `orders`                                                           |
| `invoices`                            | `invoices`                                                         |
| `transactions`, `transaction-details` | `payments`                                                         |
| `reviews-feedbacks`                   | `reviews`, `review_comments`, `review_reactions`, `review_reports` |

**No backing table exists yet — needs a new migration in `fixit-app-mobile` before it can be wired for real:** `content-management`, `news`, `faq`, `advertisement-banners`, `newsletter-subscribers`, `currency-settings`, `language-settings`, `general-settings`, `rules`, `terms-and-conditions`, `insurance`, `logistics`, `e-commerce` (store/product/report sub-pages), `sos-requests` (unless this is meant to be `repair_requests` filtered by an emergency flag that doesn't exist yet — confirm intent before assuming), `super-admin`, `support-sytem`, `send-push-notifications`, `onboarding` (as CMS content, not the mobile app's signup onboarding), `analytics` (this is probably read-only aggregation over existing tables rather than its own table — worth designing as a view, not a table, once you get there).

Treat the first group as Phase 2 (below) and the second group as its own later effort — don't try to do both in one pass.

## 4. Phased plan

1. **Auth + access gate.** Replace `lib/auth-service.ts`'s fake plaintext-password flow with real Supabase auth, and gate the `(dashboard)` route group on `is_admin`.
2. **Core entity pages** (the "maps cleanly" table above). Swap each page's data source from `apiClient`/`db.json` to Supabase, one entity at a time.
3. **Retire the old backend.** Once nothing in the dashboard calls `lib/api-client.ts` or the hosted `fixit-dashboard-api` json-server anymore, remove that dependency and (separately, with the user's confirmation) consider decommissioning the `fixit-dashboard-api` deployment.
4. **Schema gap-fill.** For the "no backing table" group, design and migrate tables in `fixit-app-mobile` first, then wire the corresponding dashboard pages the same way as Phase 2.

## 5. Prompts to copy into a Claude Code session opened in `fixit-admin-dashboard`

Open a **new** Claude Code session with that project as the working directory — its own `CLAUDE.md`/skills (if any) should drive from there, not this repo's. Run these one at a time, in order; each is self-contained context since that session won't have this conversation.

### Prompt A — wire up the Supabase clients

```
This Next.js 15 App Router project (fixit-admin-dashboard) needs to connect to Supabase.
It currently has no Supabase dependency — auth and all data currently go through axios
against a separate hosted json-server (lib/api-client.ts, lib/auth-service.ts). I want to
replace that with real Supabase, not add it alongside.

Environment variables are already in .env.local: NEXT_PUBLIC_SUPABASE_URL,
NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY.

Please:
1. Install @supabase/supabase-js and @supabase/ssr.
2. Set up the standard @supabase/ssr pattern for Next.js App Router: a browser client
   for Client Components, a server client for Server Components/Route Handlers/Server
   Actions that reads/writes the session via cookies, and middleware.ts that refreshes
   the session on every request.
3. Add a separate server-only helper that creates a Supabase client using
   SUPABASE_SERVICE_ROLE_KEY (never NEXT_PUBLIC_-prefixed), for use only in Route
   Handlers/Server Actions — never imported into a Client Component. Mark the file
   with the "server-only" package so an accidental client import fails the build
   instead of leaking the key.
4. Do not touch application data logic yet — this step is just getting both clients
   wired and typed against the existing tables (ask me for the schema/types if you
   need them, or generate types via the Supabase CLI if it's set up).
```

### Prompt B — real auth + admin gate

```
Now replace the fake auth in lib/auth-service.ts (it currently fetches all users and
compares plaintext passwords against a hosted json-server) with real Supabase auth.

Requirements:
- Login/register/forgot-password (app/(auth)/*) should use supabase.auth.signInWithPassword,
  signUp, and resetPasswordForEmail via the browser Supabase client from the previous step.
- public.profiles has a boolean column `is_admin` (default false). A user must have
  is_admin = true to reach anything under app/(dashboard)/*. Enforce this in middleware.ts
  by checking the session server-side (via the service-role/server client, since RLS on
  profiles is owner-scoped and a plain client-side read may not be enough to safely gate
  access) and redirecting non-admins to /login with an error, not just hiding UI.
- Update store/slices/auth-slice.ts to hold the Supabase session/user instead of the old
  fake token shape, keeping the same slice/thunk pattern already used there.
- Remove the old plaintext-password logic in lib/auth-service.ts entirely rather than
  leaving it dead or as a fallback.
```

### Prompt C — wire core entity pages to Supabase

```
Supabase tables already exist (owned by a separate mobile-app repo's migrations, do not
create new migrations here) for these dashboard pages:

- customers  → public.profiles where user_type = 'customer'
- repairers  → public.profiles where user_type = 'repairer' (+ public.services)
- repair-companies → public.profiles where user_type = 'company'
- vendors    → public.profiles where user_type = 'vendor'
- repair-bookings  → public.bookings, public.repair_requests
- product-orders   → public.orders
- invoices   → public.invoices
- transactions / transaction-details → public.payments
- reviews-feedbacks → public.reviews, public.review_comments, public.review_reactions, public.review_reports

For each page listed above, replace its current data fetching (via lib/api-client.ts /
axios against the old json-server) with a Supabase-backed data layer:
- Reads/writes that only need the admin's own session can go through the browser
  Supabase client directly from a query hook.
- Anything that needs to see rows across all users (which is most of this, since RLS is
  owner-scoped per user) should go through a Route Handler or Server Action using the
  service-role server client from Prompt A, called from a TanStack Query hook on the
  client side (@tanstack/react-query is already a dependency here).
- Follow the existing file organization in lib/ and store/ for where query/mutation
  logic lives, and keep the existing page/component structure — this is a data-layer
  swap, not a UI rewrite.
- Do the pages one at a time (start with customers), and show me the pattern before
  repeating it across the rest, so I can confirm it before it's applied everywhere.
```

### Prompt D (run in fixit-app-mobile, not the dashboard) — schema gap-fill

```
The fixit-admin-dashboard project has pages with no backing Supabase table yet:
content-management, news, faq, advertisement-banners, newsletter-subscribers,
currency-settings, language-settings, general-settings, rules, terms-and-conditions,
insurance, logistics, e-commerce (store/product/report), sos-requests, super-admin,
support-sytem, send-push-notifications, onboarding (CMS content), analytics.

For [name the specific page(s) you're ready to tackle], help me design the Postgres
schema following this repo's supabase-schema skill conventions (new migration file,
RLS enabled with explicit policies, referencing public.profiles(id) for any owner
column). Ask me about the actual fields/relationships this page needs before writing
the migration — don't guess the shape from the page name alone.
```

## 6. Before you start

The `is_admin` migration (§1) is a prerequisite for Prompt B and blocks everything after it. Want me to create that migration in this repo now?
