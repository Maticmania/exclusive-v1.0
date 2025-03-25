"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, Eye } from "lucide-react"
import { useCartStore, useWishlistStore, useAuthStore } from "@/store/auth-store"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

export default function ProductCard({ product }) {
  const [isHovering, setIsHovering] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false)
  const { addItem } = useCartStore()
  const { addProduct, removeProduct, isInWishlist } = useWishlistStore()
  const { isAuthenticated } = useAuthStore()

  const isWishlisted = isInWishlist(product._id)

  // Calculate discount percentage if compareAtPrice exists
  const discountPercentage =
    product.compareAtPrice && product.price < product.compareAtPrice
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null

  const handleAddToCart = async () => {
    setIsAddingToCart(true)

    try {
      // Add to local store first for immediate feedback
      addItem(product)

      // Then sync with server
      await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1,
        }),
      })

      toast.success("Added to cart", {
        description: `${product.name} has been added to your cart.`,
      })
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error("Failed to add item to cart")
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error("Sign in required", {
        description: "Please sign in to add items to your wishlist",
      })
      return
    }

    setIsTogglingWishlist(true)

    try {
      if (isWishlisted) {
        // Remove from local store first
        removeProduct(product._id)

        // Then sync with server
        await fetch(`/api/wishlist/${product._id}`, {
          method: "DELETE",
        })

        toast.success("Removed from wishlist")
      } else {
        // Add to local store first
        addProduct(product)

        // Then sync with server
        await fetch("/api/wishlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: product._id,
          }),
        })

        toast.success("Added to wishlist")
      }
    } catch (error) {
      console.error("Error updating wishlist:", error)
      toast.error("Failed to update wishlist")
    } finally {
      setIsTogglingWishlist(false)
    }
  }

  return (
    <div
      className="group relative border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Discount badge */}
      {discountPercentage && (
        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
          -{discountPercentage}%
        </div>
      )}

      {/* Flash Sale badge */}
      {product.flashSale &&
        product.flashSale.isOnFlashSale &&
        new Date(product.flashSale.flashSaleStartDate) <= new Date() &&
        new Date(product.flashSale.flashSaleEndDate) >= new Date() && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
            FLASH SALE
          </div>
        )}

      <div className="relative h-48 w-full overflow-hidden">
        <Link href={`/products/${product._id}`}>
          <Image
            src={product.images?.[0] || "/placeholder.svg?height=192&width=256"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Wishlist and Quick view buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <button
            onClick={handleToggleWishlist}
            disabled={isTogglingWishlist}
            className="p-1.5 rounded-full bg-white shadow-sm hover:bg-gray-100 transition-colors"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
          </button>

          <Link
            href={`/products/${product._id}`}
            className="p-1.5 rounded-full bg-white shadow-sm hover:bg-gray-100 transition-colors"
          >
            <Eye className="h-4 w-4 text-gray-600" />
          </Link>
        </div>
      </div>

      <div className="p-4">
        <Link href={`/products/${product._id}`}>
          <h3 className="font-medium text-sm mb-1 line-clamp-1">{product.name}</h3>
        </Link>

        <div className="flex items-center gap-2 mb-2">
          {product.flashSale &&
          product.flashSale.isOnFlashSale &&
          new Date(product.flashSale.flashSaleStartDate) <= new Date() &&
          new Date(product.flashSale.flashSaleEndDate) >= new Date() ? (
            <>
              <span className="font-bold text-primary">{formatCurrency(product.currentPrice)}</span>
              <span className="text-gray-400 text-sm line-through">{formatCurrency(product.price)}</span>
              <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-sm">
                {product.flashSale.discountPercentage}% OFF
              </span>
            </>
          ) : (
            <>
              <span className="font-bold text-primary">{formatCurrency(product.price)}</span>
              {product.compareAtPrice && (
                <span className="text-gray-400 text-sm line-through">{formatCurrency(product.compareAtPrice)}</span>
              )}
            </>
          )}
        </div>

        {/* Star rating */}
        <div className="flex items-center mb-3">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`w-3.5 h-3.5 ${i < (product.rating || 4) ? "text-yellow-400" : "text-gray-300"}`}
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 22 20"
            >
              <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
            </svg>
          ))}
          <span className="ml-1 text-xs text-gray-500">({product.reviewCount || 75})</span>
        </div>

        {/* Add to cart button - visible on hover */}
        <div
          className={`transition-all duration-300 ${
            isHovering ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart || product.stock <= 0}
            className="w-full py-2 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors disabled:bg-gray-400"
          >
            {isAddingToCart ? "Adding..." : product.stock <= 0 ? "Out of Stock" : "Add To Cart"}
          </button>
        </div>
      </div>
    </div>
  )
}

