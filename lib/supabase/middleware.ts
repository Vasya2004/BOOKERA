import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { hasSupabaseEnv, getSupabaseEnv } from "@/lib/supabase/env";

function isPrefetchRequest(request: NextRequest) {
  return (
    request.headers.get("next-router-prefetch") === "1" ||
    request.headers.get("purpose") === "prefetch"
  );
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!hasSupabaseEnv()) {
    return response;
  }

  const hasAuthCookies = request.cookies
    .getAll()
    .some((cookie) => cookie.name.includes("sb-") || cookie.name.includes("supabase"));
  if (!hasAuthCookies || isPrefetchRequest(request)) {
    return response;
  }

  const { url, anonKey } = getSupabaseEnv();

  const supabase = createServerClient<Database>(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  await supabase.auth.getUser();

  return response;
}
