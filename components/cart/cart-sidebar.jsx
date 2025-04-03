"use client"

import { useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { X, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/auth-store"
import { formatCurrency } from "@/lib/utils"

export default function CartSidebar({ isOpen, onClose }) {
  const { items, total, removeItem, updateQuantity, syncWithServer, isLoading } = useCartStore()

  // Sync with server when component mounts
  useEffect(() => {
    syncWithServer()
  }, [syncWithServer])

  const handleRemoveItem = async (itemId) => {
    try {
      await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      })
      removeItem(itemId)
    } catch (error) {
      console.error("Error removing item:", error)
    }
  }

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return

    try {
      await fetch(`/api/cart/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: newQuantity,
        }),
      })
      updateQuantity(itemId, newQuantity)
    } catch (error) {
      console.error("Error updating quantity:", error)
    }
  }

  return (
    <div
      className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-xl transform ${isOpen ? "translate-x-0" : "translate-x-full"} transition-transform duration-300 ease-in-out z-50`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-medium">Your Cart</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">Your cart is empty</p>
              <Button onClick={onClose} variant="outline">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item._id} className="flex items-start space-x-4">
                  <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                    <Image
                      src={item.product.images[0] || "/placeholder.svg"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">{item.product.name}</h4>
                    <p className="text-sm text-gray-500">{formatCurrency(item.price || item.product.price)}</p>
                    <div className="flex items-center mt-1">
                      <button
                        onClick={() => handleUpdateQuantity(item._id, Math.max(1, item.quantity - 1))}
                        className="h-6 w-6 flex items-center justify-center border rounded-md"
                      >
                        -
                      </button>
                      <span className="mx-2 text-sm">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                        className="h-6 w-6 flex items-center justify-center border rounded-md"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button onClick={() => handleRemoveItem(item._id)} className="text-gray-400 hover:text-gray-500">
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t">
            <div className="flex justify-between mb-4">
              <span className="font-medium">Total</span>
              <span className="font-medium">{formatCurrency(total)}</span>
            </div>
            <div className="space-y-2">
              <Button className="w-full" asChild>
                <Link href="/checkout" onClick={onClose}>
                  Checkout
                </Link>
              </Button>
              <Button variant="outline" className="w-full" onClick={onClose}>
                Continue Shopping
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

