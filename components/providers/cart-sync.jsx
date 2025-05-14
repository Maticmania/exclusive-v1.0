"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useCartStore } from "@/store/cart-store"

export default function CartSync() {
  const { data: session, status } = useSession()
  const { syncWithServer, isServerSynced } = useCartStore()

  useEffect(() => {
    // Only sync when user is authenticated and cart is not already synced
    if (status === "authenticated" && session && !isServerSynced) {
      syncWithServer(session)
    }
  }, [status, session, syncWithServer, isServerSynced])

  return null // This is a utility component with no UI
}
