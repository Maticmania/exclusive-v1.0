"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { useWishlistStore, useAuthStore } from "@/store/auth-store"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function AddToWishlistButton({ productId }) {
  const [isAdding, setIsAdding] = useState(false)
  const { isInWishlist, addProduct, removeProduct } = useWishlistStore()
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()

  const isWishlisted = isInWishlist(productId)

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to your wishlist", {
        action: {
          label: "Sign In",
          onClick: () => router.push(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`),
        },
      })
      return
    }

    setIsAdding(true)

    try {
      if (isWishlisted) {
        // Remove from local store first
        removeProduct(productId)

        // Then sync with server
        await fetch(`/api/wishlist/${productId}`, {
          method: "DELETE",
        })

        toast.success("Removed from wishlist")
      } else {
        // Add to local store first
        addProduct({ _id: productId })

        // Then sync with server
        await fetch("/api/wishlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId,
          }),
        })

        toast.success("Added to wishlist", {
          action: {
            label: "View Wishlist",
            onClick: () => router.push("/account/wishlist"),
          },
        })
      }
    } catch (error) {
      console.error("Error updating wishlist:", error)
      toast.error("Failed to update wishlist")
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggleWishlist}
      disabled={isAdding}
      className={isWishlisted ? "text-red-500 border-red-200" : ""}
    >
      <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500" : ""}`} />
    </Button>
  )
}

