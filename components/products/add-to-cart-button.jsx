"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BsCart3, BsPlus, BsDash } from "react-icons/bs"
import { useCartStore } from "@/store/auth-store"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function AddToCartButton({ product }) {
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const { addItem } = useCartStore()
  const router = useRouter()

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

      toast.success("Added to cart", {
        description: `${product.name} has been added to your cart. action`,
        action: {
          label: "View Cart",
          onClick: () => router.push("/cart"),
        },
      })
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error("Failed to add item to cart")
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center border rounded-md">
        <button
          onClick={decreaseQuantity}
          disabled={quantity <= 1}
          className="px-2 py-1 text-gray-500 hover:text-gray-700"
        >
          <BsDash />
        </button>
        <Input
          type="number"
          value={quantity}
          onChange={handleQuantityChange}
          min={1}
          max={product.stock}
          className="w-16 text-center border-0 focus-visible:ring-0"
        />
        <button
          onClick={increaseQuantity}
          disabled={quantity >= product.stock}
          className="px-2 py-1 text-gray-500 hover:text-gray-700"
        >
          <BsPlus />
        </button>
      </div>

      <Button onClick={handleAddToCart} disabled={isAdding || product.stock < 1} className="flex items-center gap-2">
        <BsCart3 className="h-4 w-4" />
        <span>{isAdding ? "Adding..." : "Add to Cart"}</span>
      </Button>
    </div>
  )
}

