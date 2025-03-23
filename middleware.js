import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request) {
  // Skip NextAuth API routes
  if (request.nextUrl.pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  const token = await getToken({ req: request })
  const isAuthenticated = !!token
  const isAuthPage =
    request.nextUrl.pathname.startsWith("/auth/signin") || request.nextUrl.pathname.startsWith("/auth/signup")

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isAuthPage) {
    // Get the callback URL from the query parameters or default to home
    const callbackUrl = new URL(request.nextUrl).searchParams.get("callbackUrl")
    const redirectUrl = callbackUrl || "/"
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  return NextResponse.next()
}

// Specify the paths that this middleware should run on
export const config = {
  matcher: ["/auth/signin", "/auth/signup"],
}

