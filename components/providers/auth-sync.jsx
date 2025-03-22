"use client"

import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { useAuthStore } from "@/store/auth-store"

export default function AuthSync() {
  const { data: session, status } = useSession()
  const { setUser, clearUser, setLoading } = useAuthStore()

  useEffect(() => {
    // Update loading state based on NextAuth status
    setLoading(status === "loading")

    // Sync user data when session changes
    if (session?.user) {
      setUser({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role || "user", // Default to user if role is missing
        image: session.user.image,
      })
    } else if (status === "unauthenticated") {
      clearUser()
    }
  }, [session, status, setUser, clearUser, setLoading])

  return null // This component doesn't render anything
}

