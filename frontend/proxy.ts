import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { IS_DEMO } from "@/lib/demo"

export async function proxy(request: NextRequest) {
  // Public demo: no accounts. Sign-in, settings and admin are not part of it.
  if (IS_DEMO) {
    const { pathname } = request.nextUrl
    if (pathname === "/login" || pathname.startsWith("/auth/") || pathname.startsWith("/admin") || pathname === "/dashboard/settings" || pathname === "/dashboard/repos/new") {
      return NextResponse.redirect(new URL("/dashboard/repos", request.url))
    }
    // ".../adrs/new", ".../knowledge/new": creating things is off, show the list instead
    if (pathname.startsWith("/dashboard/") && pathname.endsWith("/new")) {
      return NextResponse.redirect(new URL(pathname.slice(0, -"/new".length), request.url))
    }
    return NextResponse.next()
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  return response
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/admin/:path*", "/auth/:path*"],
}
