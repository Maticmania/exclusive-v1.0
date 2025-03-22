"use client"

import { SessionProvider } from "next-auth/react"
import AuthSync from "./auth-sync"

export default function AuthSessionProvider({ children }) {
  return (
    <SessionProvider>
      <AuthSync />
      {children}
    </SessionProvider>
  )
}

