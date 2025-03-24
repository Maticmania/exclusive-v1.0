import { Inter, Poppins } from "next/font/google"
import "./globals.css"
import AuthSessionProvider from "@/components/providers/session-provider"
import Navigation from "@/components/layout/nav"
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
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className={inter.className}>
        <AuthSessionProvider>
          <Navigation />
          <main>{children}</main>
          {process.env.NODE_ENV !== "production" && <StoreDebug />}
          <Toaster position="bottom-right" />
        </AuthSessionProvider>
      </body>
    </html>
  )
}

