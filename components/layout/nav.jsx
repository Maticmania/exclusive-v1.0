"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { useAuthStore } from "@/store/auth-store"
import { RxHamburgerMenu } from "react-icons/rx"
import { AiOutlineClose } from "react-icons/ai"
import { BsCart3, BsHeart, BsSearch } from "react-icons/bs"

export default function Navigation() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const pathname = usePathname()
  const { user, isAuthenticated, isAdmin, isSuperAdmin, isLoading } = useAuthStore()

  // Function to toggle the modal
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen)
  }

  // Close modal when clicking outside
  const closeModalOnOutsideClick = (e) => {
    if (e.target.id === "backdrop") {
      setIsModalOpen(false)
    }
  }

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isModalOpen])

  return (
    <div className="h-[80px] border-b-[0.005rem] border-black/30 w-full px-[5%] flex justify-between items-center bg-[#ffffff]">
      <Link href="/">
        <h1 className="font-bold font-inter text-2xl">Exclusive</h1>
      </Link>
      <ul className="hidden gap-[24px] md:flex">
        <Link
          href="/"
          className={`text-base font-poppins text-center ${pathname === "/" ? "text-primary font-semibold" : ""}`}
        >
          Home
        </Link>
        <Link
          href="/products"
          className={`text-base font-poppins text-center ${pathname === "/products" ? "text-primary font-semibold" : ""}`}
        >
          Products
        </Link>
        <Link
          href="/account/profile"
          className={`text-base font-poppins text-center ${pathname.startsWith("/account") ? "text-primary font-semibold" : ""}`}
        >
          Account
        </Link>
        {isAdmin() && (
          <Link
            href="/admin/dashboard"
            className={`text-base font-poppins text-center ${pathname.startsWith("/admin") ? "text-primary font-semibold" : ""}`}
          >
            Admin
          </Link>
        )}
      </ul>
      <div className="flex gap-2 md:gap-3 lg:gap-5 items-center">
        <label htmlFor="search" className="relative hidden lg:inline-flex">
          <input
            type="text"
            id="search"
            name="search"
            className="min-w-[243px] max-w-[243px] h-[38px] rounded px-3 text-[12px] border-0 bg-[#F5F5F5] text-black font-poppins"
            placeholder="What are you looking for?"
          />
          <span className="absolute font-bold top-2 right-4">
            <BsSearch className="text-gray-500" />
          </span>
        </label>

        <Link
          href="/account/wishlist"
          className={`${pathname === "/auth/signin" || pathname === "/auth/signup" ? "hidden" : "flex"}`}
        >
          <BsHeart className="text-xl hidden md:inline-flex" />
        </Link>

        <BsSearch className="text-xl inline-flex lg:hidden" />

        <Link
          href="/cart"
          className={`${pathname === "/auth/signin" || pathname === "/auth/signup" ? "hidden" : "flex"} relative`}
        >
          <BsCart3 className="text-xl" />
          {!isLoading && isAuthenticated && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              0
            </span>
          )}
        </Link>

        {isLoading ? (
          <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
        ) : isAuthenticated ? (
          <div className="hidden md:flex items-center space-x-4">
            <button onClick={() => signOut({ callbackUrl: "/" })} className="text-gray-500 hover:text-gray-700">
              Sign Out
            </button>
          </div>
        ) : (
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/auth/signin" className="text-gray-500 hover:text-gray-700">
              Sign In
            </Link>
            <Link href="/auth/signup" className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium">
              Sign Up
            </Link>
          </div>
        )}

        <button aria-label="Open menu" className="text-3xl inline-flex md:hidden" onClick={toggleModal}>
          <RxHamburgerMenu />
        </button>
      </div>

      {/* Hamburger Modal */}
      <div
        id="backdrop"
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeModalOnOutsideClick}
      >
        <div
          className={`fixed top-0 left-0 w-3/4 h-full bg-white p-6 transform transition-transform duration-300 ease-in-out ${
            isModalOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button aria-label="Close menu" className="text-2xl mb-4 cursor-pointer" onClick={toggleModal}>
            <AiOutlineClose />
          </button>
          <nav>
            <ul className="flex flex-col gap-6">
              <li>
                <Link
                  href="/"
                  className={`text-base font-poppins ${pathname === "/" ? "text-primary font-semibold" : ""}`}
                  onClick={toggleModal}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className={`text-base font-poppins ${pathname === "/products" ? "text-primary font-semibold" : ""}`}
                  onClick={toggleModal}
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  href="/account/profile"
                  className={`text-base font-poppins ${pathname.startsWith("/account") ? "text-primary font-semibold" : ""}`}
                  onClick={toggleModal}
                >
                  Account
                </Link>
              </li>
              {isAdmin() && (
                <li>
                  <Link
                    href="/admin/dashboard"
                    className={`text-base font-poppins ${pathname.startsWith("/admin") ? "text-primary font-semibold" : ""}`}
                    onClick={toggleModal}
                  >
                    Admin
                  </Link>
                </li>
              )}
              {isAuthenticated ? (
                <li>
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: "/" })
                      toggleModal()
                    }}
                    className="text-base font-poppins text-gray-500 hover:text-gray-700"
                  >
                    Sign Out
                  </button>
                </li>
              ) : (
                <>
                  <li>
                    <Link href="/auth/signin" className="text-base font-poppins" onClick={toggleModal}>
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link href="/auth/signup" className="text-base font-poppins" onClick={toggleModal}>
                      Sign Up
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  )
}

