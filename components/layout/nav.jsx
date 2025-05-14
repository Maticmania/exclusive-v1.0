"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { useAuthStore, useCartStore } from "@/store/auth-store"
import { BsCart3, BsHeart, BsSearch, BsPerson } from "react-icons/bs"
import { FiLogOut, FiMenu, FiX } from "react-icons/fi"
import { AiOutlineUser, AiOutlineShoppingCart, AiOutlineStar, AiOutlineDashboard } from "react-icons/ai"
import { MdOutlineCancel } from "react-icons/md"

export default function Navigation() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const { items } = useCartStore()
  const dropdownRef = useRef(null)
  const searchInputRef = useRef(null)

  // Calculate cart count
  const cartCount = items?.length || 0

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Focus search input when search is opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchOpen])

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?search=${encodeURIComponent(searchQuery.trim())}`)
      setIsSearchOpen(false)
      setIsMobileMenuOpen(false)
    }
  }

  const authStore = useAuthStore()
  const isAdmin = authStore.isAdmin()
  const isSuperAdmin = authStore.isSuperAdmin()

  return (
    <div className="h-[80px] border-b border-gray-200 w-full px-[5%] flex justify-between items-center bg-white sticky top-0 z-50 shadow-sm">
      {/* Mobile menu button */}
      <button
        className="md:hidden text-gray-800 focus:outline-none"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <FiX className="text-3xl" /> : <FiMenu className="text-3xl" />}
      </button>

      <Link href="/" className="font-bold text-2xl md:text-3xl text-gray-900">
        Exclusive
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-8">
        <Link href="/" className={`text-base ${pathname === "/" ? "text-primary font-semibold" : "text-gray-800"} hover:text-primary transition-colors`}>
          Home
        </Link>
        <Link
          href="/products"
          className={`text-base ${pathname === "/products" ? "text-primary font-semibold" : "text-gray-800"} hover:text-primary transition-colors`}
        >
          Products
        </Link>
        <Link
          href="/about"
          className={`text-base ${pathname === "/about" ? "text-primary font-semibold" : "text-gray-800"} hover:text-primary transition-colors`}
        >
          About
        </Link>
        <Link
          href="/contact"
          className={`text-base ${pathname === "/contact" ? "text-primary font-semibold" : "text-gray-800"} hover:text-primary transition-colors`}
        >
          Contact
        </Link>
        {!isAuthenticated && (
          <Link
            href="/auth/signup"
            className={`text-base ${pathname === "/auth/signup" ? "text-primary font-semibold" : "text-gray-800"} hover:text-primary transition-colors`}
          >
            Sign Up
          </Link>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {/* Desktop Search */}
        <div className="relative hidden md:flex items-center">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="What are you looking for?"
              className="bg-gray-100 rounded-full py-2 pl-4 pr-10 w-[250px] text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-gray-500 hover:text-primary transition-colors"
            >
              <BsSearch className="text-lg" />
            </button>
          </form>
        </div>

        {/* Mobile Search Button */}
        <button className="md:hidden text-gray-800" onClick={() => setIsSearchOpen(!isSearchOpen)}>
          <BsSearch className="text-2xl" />
        </button>

        <Link href="/account/wishlist" className="text-gray-800 hover:text-primary transition-colors">
          <BsHeart className="text-2xl" />
        </Link>

        <Link href="/cart" className="text-gray-800 relative hover:text-primary transition-colors">
          <BsCart3 className="text-2xl" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="bg-primary text-white rounded-full h-9 w-9 flex items-center justify-center"
          >
            <BsPerson className="text-2xl" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-50 py-2">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/account/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <AiOutlineUser className="mr-2 text-lg" />
                    Manage My Account
                  </Link>
                  <Link
                    href="/account/orders"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <AiOutlineShoppingCart className="mr-2 text-lg" />
                    My Order
                  </Link>
                  <Link
                    href="/account/cancellations"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <MdOutlineCancel className="mr-2 text-lg" />
                    My Cancellations
                  </Link>
                  <Link
                    href="/account/reviews"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <AiOutlineStar className="mr-2 text-lg" />
                    My Reviews
                  </Link>
                  {(isAdmin || isSuperAdmin) && (
                    <Link
                      href="/admin/dashboard"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <AiOutlineDashboard className="mr-2 text-lg" />
                      Admin Dashboard
                    </Link>
                  )}
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: "/" })
                      setIsDropdownOpen(false)
                    }}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FiLogOut className="mr-2 text-lg" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
          <div className="fixed top-0 left-0 h-full w-4/5 bg-white shadow-lg transform transition-transform duration-300 ease-in-out translate-x-0">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <Link href="/" className="font-bold text-2xl text-gray-900">
                Exclusive
              </Link>
              <button
                className="text-gray-800 focus:outline-none"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiX className="text-3xl" />
              </button>
            </div>
            <div className="flex flex-col space-y-6 p-6">
              <Link
                href="/"
                className={`text-lg ${pathname === "/" ? "text-primary font-semibold" : "text-gray-800"} hover:text-primary transition-colors`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/products"
                className={`text-lg ${pathname === "/products" ? "text-primary font-semibold" : "text-gray-800"} hover:text-primary transition-colors`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                href="/about"
                className={`text-lg ${pathname === "/about" ? "text-primary font-semibold" : "text-gray-800"} hover:text-primary transition-colors`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className={`text-lg ${pathname === "/contact" ? "text-primary font-semibold" : "text-gray-800"} hover:text-primary transition-colors`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              {(isAdmin || isSuperAdmin) && (
                <Link
                  href="/admin/dashboard"
                  className={`text-lg ${pathname.startsWith("/admin") ? "text-primary font-semibold" : "text-gray-800"} hover:text-primary transition-colors`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin
                </Link>
              )}
              {!isAuthenticated && (
                <Link
                  href="/auth/signup"
                  className={`text-lg ${pathname === "/auth/signup" ? "text-primary font-semibold" : "text-gray-800"} hover:text-primary transition-colors`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-white z-50 md:hidden">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <span className="font-semibold text-lg text-gray-900">Search</span>
            <button
              className="text-gray-800 focus:outline-none"
              onClick={() => setIsSearchOpen(false)}
            >
              <FiX className="text-3xl" />
            </button>
          </div>
          <div className="p-6">
            <form onSubmit={handleSearch} className="relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="What are you looking for?"
                className="w-full bg-gray-100 rounded-full py-4 pl-6 pr-14 text-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-0 top-0 h-full px-5 flex items-center justify-center text-gray-500 hover:text-primary transition-colors"
              >
                <BsSearch className="text-2xl" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}