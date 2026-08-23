"use client"

import { useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useCartStore } from "@/store/auth-store"

export default function CartSync() {
  const { status } = useSession()
  const { syncWithServer } = useCartStore()
  // Track the previous status to detect the login transition
  const prevStatusRef = useRef(status)

  useEffect(() => {
    const prevStatus = prevStatusRef.current
    prevStatusRef.current = status

    // Trigger merge+sync when the user has just signed in
    if (status === "authenticated" && prevStatus !== "authenticated") {
      syncWithServer()
    }
  }, [status, syncWithServer])

  return null // Utility component — no UI
}
