// middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Middleware runs on the Edge runtime, which can't load the service-role
// admin client (Vercel's Edge bundler rejects it as an unsupported
// module). So middleware only does the cheap, Edge-safe check — is there
// a session at all — using the anon key. The actual profiles.is_admin
// check (which needs the service-role client to bypass owner-scoped RLS)
// lives in app/(dashboard)/layout.tsx, a Server Component that runs on
// the regular Node.js runtime.
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/email-verification",
  "/api/auth/grant-admin",
];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refreshes the session cookie on every request.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicPath = PUBLIC_PATHS.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isPublicPath) {
    return response;
  }

  if (!user) {
    return redirectToLogin(request);
  }

  return response;
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("error", "unauthorized");
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
