"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { useAuthStore } from "@/store/auth-store"
import { cn } from "@/lib/utils"
// import CartButton from "@/components/cart/cart-button"

export default function Navigation() {
  const pathname = usePathname()
  const { user, isAuthenticated, isAdmin, isSuperAdmin, isLoading } = useAuthStore()
  console.log(pathname);
  
  return (
    <nav className="bg-white shadow-sm">
      <div className="container max-w-screen-xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold">
                E-commerce
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className={cn(
                  "inline-flex items-center px-1 pt-1 border-b-2",
                  pathname === "/"
                    ? "border-primary text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                )}
              >
                Home
              </Link>
              <Link
                href="/products"
                className={cn(
                  "inline-flex items-center px-1 pt-1 border-b-2",
                  pathname === "/products"
                    ? "border-primary text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                )}
              >
                Products
              </Link>
              {isAdmin() && (
                <Link
                  href="/admin/dashboard"
                  className={cn(
                    "inline-flex items-center px-1 pt-1 border-b-2",
                    pathname.startsWith("/admin")
                      ? "border-primary text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                  )}
                >
                  Admin
                </Link>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {/* <CartButton /> */}

            {isLoading ? (
              <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
            ) : isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/account/profile"
                  className={cn(
                    "inline-flex items-center px-1 pt-1",
                    pathname.startsWith("/account") ? "text-gray-900" : "text-gray-500 hover:text-gray-700",
                  )}
                >
                  My Account
                </Link>
                <button onClick={() => signOut({ callbackUrl: "/" })} className="text-gray-500 hover:text-gray-700">
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/signin" className="text-gray-500 hover:text-gray-700">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

