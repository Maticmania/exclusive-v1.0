import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request) {
  // Add a custom header to indicate if this is an admin page
  const isAdminPage = request.nextUrl.pathname.startsWith("/admin")
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth")

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-is-admin-page", isAdminPage ? "true" : "false")
  requestHeaders.set("x-is-auth-page", isAuthPage ? "true" : "false")

  // Skip NextAuth API routes
  if (request.nextUrl.pathname.startsWith("/api/auth")) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  const token = await getToken({ req: request })
  const isAuthenticated = !!token
  const isAuthPageNextAuth =
    request.nextUrl.pathname.startsWith("/auth/signin") || request.nextUrl.pathname.startsWith("/auth/signup")

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isAuthPageNextAuth) {
    // Get the callback URL from the query parameters or default to home
    const callbackUrl = new URL(request.nextUrl).searchParams.get("callbackUrl")
    const redirectUrl = callbackUrl || "/"
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/auth/signin",
    "/auth/signup",
  ],
}

