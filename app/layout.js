import { headers } from "next/headers"
import "./globals.css"
import AuthSessionProvider from "@/components/providers/session-provider"
import Navigation from "@/components/layout/nav"
import Footer from "@/components/layout/footer"
import StoreDebug from "@/components/debug/store-debug"
import { Toaster } from "sonner"


export const metadata = {
  title: "Exclusive | E-commerce",
  description: "Your exclusive e-commerce platform",
}

export default async function RootLayout({ children }) {
  const headersList = await headers() // Await here
  const isAdminPage = headersList.get("x-is-admin-page") === "true"
  const isAuthPage = headersList.get("x-is-auth-page") === "true"

  return (
    <html lang="en">
      <body>
        <AuthSessionProvider>
          {!isAdminPage && !isAuthPage && <Navigation />}
          <main>{children}</main>
          {!isAdminPage && !isAuthPage && <Footer />}
          {process.env.NODE_ENV !== "production" && <StoreDebug />}
          <Toaster position="bottom-right" />
        </AuthSessionProvider>
      </body>
    </html>
  )
}

