import { NextRequest, NextResponse } from "next/server"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123"
const COOKIE_NAME = "admin_session"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = request.cookies.get(COOKIE_NAME)?.value

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (session !== "authenticated") {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  if (pathname === "/admin/login" && session === "authenticated") {
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
