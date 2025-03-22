import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "./auth"

// Middleware to check if user is authenticated
export async function isAuthenticated() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return {
      authenticated: false,
      session: null,
      error: "Unauthorized",
    }
  }

  return {
    authenticated: true,
    session,
    error: null,
  }
}

// Middleware to check if user has required role
export async function hasRole(requiredRoles) {
  const { authenticated, session, error } = await isAuthenticated()

  if (!authenticated) {
    return {
      authorized: false,
      session: null,
      error,
    }
  }

  // Convert to array if single role is provided
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]

  if (!roles.includes(session.user.role)) {
    return {
      authorized: false,
      session,
      error: "Forbidden: Insufficient permissions",
    }
  }

  return {
    authorized: true,
    session,
    error: null,
  }
}

// Helper function to handle unauthorized responses
export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

// Helper function to handle forbidden responses
export function forbidden() {
  return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 })
}

