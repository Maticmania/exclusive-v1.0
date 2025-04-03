"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { useWishlistStore, useAuthStore } from "@/store/auth-store"
import { toast } from "sonner"

export default function AddToWishlistButton({ product, className = "" }) {
  const [isLoading, setIsLoading] = useState(false)
  const { isInWishlist, addProduct, removeProduct } = useWishlistStore()
  const { isAuthenticated } = useAuthStore()
  const [isWishlisted, setIsWishlisted] = useState(false)

  useEffect(() => {
    if (product && product._id) {
      setIsWishlisted(isInWishlist(product._id))
    }
  }, [product, isInWishlist])

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error("Sign in required", {
        description: "Please sign in to add items to your wishlist",
      })
      return
    }

    if (!product) {
      console.log(product);
      

      toast.error("Invalid product")
      return
    }

    setIsLoading(true)

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

      setIsWishlisted(!isWishlisted)
    } catch (error) {
      console.error("Error updating wishlist:", error)
      toast.error("Failed to update wishlist")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggleWishlist}
      disabled={isLoading}
      className={`p-2 rounded-lg border hover:bg-gray-100 transition-colors ${className}`}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={`h-5 w-5 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"} ${
          isLoading ? "opacity-50" : ""
        }`}
      />
    </button>
  )
}

