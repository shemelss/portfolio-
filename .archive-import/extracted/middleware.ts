import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get("auth")
  const url = request.nextUrl.clone()

  // If trying to access protected pages without being logged in
  if ((url.pathname.startsWith("/game") || url.pathname.startsWith("/admin")) && !authCookie) {
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  // If trying to access admin pages, check for admin role
  if (url.pathname.startsWith("/admin") && authCookie) {
    try {
      const userData = JSON.parse(decodeURIComponent(authCookie.value))
      if (userData.role !== "admin") {
        // Redirect non-admin users to game page
        url.pathname = "/game"
        url.searchParams.set("error", "admin_access_denied")
        return NextResponse.redirect(url)
      }
    } catch (error) {
      // Invalid auth cookie, redirect to login
      url.pathname = "/"
      return NextResponse.redirect(url)
    }
  }

  // If trying to access login page while already logged in
  if (url.pathname === "/" && authCookie) {
    try {
      const userData = JSON.parse(decodeURIComponent(authCookie.value))
      // Redirect based on role
      if (userData.role === "admin") {
        url.pathname = "/admin"
      } else {
        url.pathname = "/game"
      }
      return NextResponse.redirect(url)
    } catch (error) {
      // Invalid auth cookie, stay on login page
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/game/:path*", "/admin/:path*"],
}
