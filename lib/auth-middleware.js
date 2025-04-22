import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "./auth"

// Middleware to check if user is authenticated
export async function isAuthenticated() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return {
      success: false,
      session: null,
      message: "Unauthorized",
      status: 401,
    }
  }

  return {
    success: true,
    session,
    message: null,
    status: 200,
  }
}

// Middleware to check if user has required role
export async function hasRole(requiredRoles) {
  const { success, session, message, status } = await isAuthenticated()

  if (!success) {
    return {
      authorized: false,
      session: null,
      error: message,
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

// Helper function to check admin role
export async function checkAdminRole(session) {
  if (!session || !session.user) {
    return false
  }

  return session.user.role === "admin" || session.user.role === "superadmin"
}

// Helper function to check API role
export async function checkApiRole(request, requiredRoles) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return {
      success: false,
      message: "Unauthorized",
      status: 401,
    }
  }

  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]

  if (!roles.includes(session.user.role)) {
    return {
      success: false,
      message: "Forbidden: Insufficient permissions",
      status: 403,
    }
  }

  return { success: true }
}
