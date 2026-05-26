import { NextResponse, type NextRequest } from "next/server"

import { updateSession } from "@/lib/supabase/middleware"

const AUTH_PATHS = ["/login"]

const PUBLIC_PATHS = ["/login"]

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request)
  const { pathname } = request.nextUrl

  const isAuthPage = AUTH_PATHS.some((path) => pathname.startsWith(path))
  const isPublic = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path)
  )

  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  if (!user && !isPublic) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons|sw.js|workbox-.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ]
}
