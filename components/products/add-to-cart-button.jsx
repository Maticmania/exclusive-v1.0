"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { BsCart3, BsCheck } from "react-icons/bs"
import { useCartStore } from "@/store/auth-store"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function AddToCartButton({ product, buttonText = "Add to Cart" }) {
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const { addItem, items } = useCartStore()
  const router = useRouter()

  // Check if product is already in cart
  useEffect(() => {
    const productInCart = items.find((item) => item.product._id === product._id)
    if (productInCart) {
      setIsAdded(true)
    }
  }, [items, product._id])

  const handleQuantityChange = (e) => {
    const value = Number.parseInt(e.target.value)
    if (!isNaN(value) && value > 0 && value <= product.stock) {
      setQuantity(value)
    }
  }

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1)
    }
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const handleAddToCart = async () => {
    if (product.stock < 1) {
      toast.error("Product is out of stock")
      return
    }

    setIsAdding(true)

    try {
      // Add to local store first for immediate feedback
      addItem(product, quantity)

      // Then sync with server
      await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product._id,
          quantity,
        }),
      })

      setIsAdded(true)

      // If button text is "Buy Now", redirect to cart
      if (buttonText === "Buy Now") {
        router.push("/cart")
      } else {
        toast.success("Added to cart", {
          description: `${product.name} has been added to your cart.`,
          action: {
            label: "View Cart",
            onClick: () => router.push("/cart"),
          },
        })
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error("Failed to add item to cart")
    } finally {
      setIsAdding(false)

      // Reset isAdded state after 2 seconds if not redirecting
      if (buttonText !== "Buy Now") {
        setTimeout(() => {
          setIsAdded(false)
        }, 2000)
      }
    }
  }

  // If on product detail page with quantity selector
  if (buttonText === "Buy Now") {
    return (
      <Button onClick={handleAddToCart} disabled={isAdding || product.stock < 1} className="w-full">
        {isAdding ? "Adding..." : buttonText}
      </Button>
    )
  }

  // For product cards
  return (
    <Button
      onClick={handleAddToCart}
      disabled={isAdding || product.stock < 1 || isAdded}
      className="w-full flex items-center justify-center gap-2"
      variant={isAdded ? "outline" : "default"}
    >
      {isAdding ? (
        "Adding..."
      ) : isAdded ? (
        <>
          <BsCheck className="h-5 w-5" />
          <span>Added</span>
        </>
      ) : (
        <>
          <BsCart3 className="h-4 w-4" />
          <span>{buttonText}</span>
        </>
      )}
    </Button>
  )
}

