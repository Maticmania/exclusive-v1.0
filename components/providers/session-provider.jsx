"use client"

import { SessionProvider } from "next-auth/react"
import AuthSync from "./auth-sync"
import CartSync from "./cart-sync"

export default function AuthSessionProvider({ children }) {
  return (
    <SessionProvider>
      <AuthSync />
      <CartSync />
      {children}
    </SessionProvider>
  )
}

