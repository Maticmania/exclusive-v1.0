"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

export function useRoleCheck() {
  const { data: session, status } = useSession()
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    if (session?.user?.role) {
      setUserRole(session.user.role)
    }
  }, [session])

  const hasRole = (requiredRoles) => {
    if (status === "loading") return false
    if (!session || !session.user || !userRole) return false

    // Convert to array if single role is provided
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]

    return roles.includes(userRole)
  }

  const isAdmin = () => hasRole(["admin", "superadmin"])

  const isSuperAdmin = () => hasRole("superadmin")

  return {
    hasRole,
    isAdmin,
    isSuperAdmin,
    role: userRole,
    isLoading: status === "loading",
  }
}

