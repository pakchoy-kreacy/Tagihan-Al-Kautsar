import { NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const supabaseCookie = Object.keys(request.cookies).find((key) =>
    key.startsWith("sb-") && key.includes("-auth-token")
  )

  const hasSession = supabaseCookie
    ? request.cookies.get(supabaseCookie)?.value
    : null

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!hasSession) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  if (pathname === "/admin/login" && hasSession) {
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
