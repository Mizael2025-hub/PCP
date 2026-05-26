import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

type CookieOptions = {
  name?: string
  value?: string
  path?: string
  domain?: string
  maxAge?: number
  expires?: Date
  httpOnly?: boolean
  secure?: boolean
  sameSite?: "lax" | "strict" | "none"
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },

        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options
          })
        },

        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: "",
            ...options
          })
        }
      }
    }
  )

  const {
    data: { user }
  } = await supabase.auth.getUser()

  const isAuthPage = request.nextUrl.pathname.startsWith("/login")

  if (!user && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons|sw.js|workbox-.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ]
}
