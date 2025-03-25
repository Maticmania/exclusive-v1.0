import { Inter, Poppins } from "next/font/google"
import { headers } from "next/headers"
import "./globals.css"
import AuthSessionProvider from "@/components/providers/session-provider"
import Navigation from "@/components/layout/nav"
import Footer from "@/components/layout/footer"
import StoreDebug from "@/components/debug/store-debug"
import { Toaster } from "sonner"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
})

export const metadata = {
  title: "Exclusive | E-commerce",
  description: "Your exclusive e-commerce platform",
}

export default function RootLayout({ children }) {
  const headersList = headers()
  const isAdminPage = headersList.get("x-is-admin-page") === "true"
  const isAuthPage = headersList.get("x-is-auth-page") === "true"

  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className={inter.className}>
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

