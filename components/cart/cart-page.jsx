"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCartStore } from "@/store/auth-store"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function CartPage({ initialCartItems = [] }) {
  const { items, updateQuantity, removeItem, syncWithServer } = useCartStore()
  const [isUpdating, setIsUpdating] = useState(false)
  const [couponCode, setCouponCode] = useState("")

  // Sync with server when component mounts
  useEffect(() => {
    syncWithServer()
  }, [syncWithServer])

  const handleUpdateQuantity = async (productId, change) => {
    const item = items.find((item) => item.product._id === productId)
    if (!item) return

    const newQuantity = Math.max(1, item.quantity + change)

    setIsUpdating(true)
    try {
      // Update local state first for immediate feedback
      updateQuantity(productId, newQuantity)

      // Then sync with server
      await fetch(`/api/cart/${item.product._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: newQuantity,
        }),
      })
    } catch (error) {
      console.error("Error updating cart:", error)
      toast.error("Failed to update cart")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemoveItem = async (productId) => {
    const item = items.find((item) => item.product._id === productId)
    if (!item) return

    setIsUpdating(true)
    try {
      // Update local state first for immediate feedback
      removeItem(productId)

      // Then sync with server
      await fetch(`/api/cart/${item.product._id}`, {
        method: "DELETE",
      })

      toast.success("Item removed from cart")
    } catch (error) {
      console.error("Error removing item:", error)
      toast.error("Failed to remove item")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdateCart = async () => {
    setIsUpdating(true)
    try {
      await syncWithServer()
      toast.success("Cart updated")
    } catch (error) {
      console.error("Error updating cart:", error)
      toast.error("Failed to update cart")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleApplyCoupon = () => {
    if (!couponCode) {
      toast.error("Please enter a coupon code")
      return
    }

    // This would typically call an API to validate and apply the coupon
    toast.info("Coupon functionality is not implemented yet")
  }

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  // You could add shipping calculation here
  const shipping = 0 // Free shipping
  const total = subtotal + shipping

  return (
    <div className="w-full  mb-20 font-inter grid gap-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="md:col-span-2 lg:col-span-3">
          <Card className="w-full py-2 px-6 hidden md:inline-flex">
            <ul className="w-full grid grid-cols-4 font-poppins text-base">
              <li>Product</li>
              <li className="text-center">Price</li>
              <li className="text-center">Quantity</li>
              <li className="text-end">Subtotal</li>
            </ul>
          </Card>
        </div>

        <div className="space-y-6 md:col-span-2 lg:col-span-3 font-poppins">
          {items.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">Your cart is empty</p>
              <Button asChild>
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </Card>
          ) : (
            items.map((item) => (
              <Card key={item.product._id} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4">
                <div className="flex items-center space-x-4 col-span-1 sm:col-span-2 md:col-span-1">
                  <div className="relative h-20 w-20 overflow-hidden rounded-md">
                    <Image
                      src={item.product.images[0] || "/placeholder.svg"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium line-clamp-2">{item.product.name}</h3>
                    <button
                      onClick={() => handleRemoveItem(item.product._id)}
                      className="text-sm text-red-500 flex items-center mt-1"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <p className="font-medium">{formatCurrency(item.product.price)}</p>
                </div>

                <div className="flex items-center justify-center">
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleUpdateQuantity(item.product._id, -1)}
                      disabled={isUpdating || item.quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleUpdateQuantity(item.product._id, 1)}
                      disabled={isUpdating}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <p className="font-semibold">{formatCurrency(item.product.price * item.quantity)}</p>
                </div>
              </Card>
            ))
          )}
        </div>

        {items.length > 0 && (
          <>
            <div className="flex flex-wrap justify-between mt-6 gap-4 md:col-span-2 lg:col-span-3 font-poppins font-medium">
              <Button variant="outline" asChild>
                <Link href="/products">Continue Shopping</Link>
              </Button>
              <Button variant="outline" onClick={handleUpdateCart} disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Update Cart"}
              </Button>
            </div>

            <div className="w-full md:col-span-2 lg:col-span-3 flex flex-col md:flex-row justify-between font-poppins">
              <div className="mt-6 flex md:w-2/5 gap-4">
                <div className="flex-grow">
                  <Input
                    placeholder="Coupon Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="mb-2 sm:mb-0 sm:mr-2 font-poppins placeholder:text-gray-400"
                  />
                </div>
                <Button className="bg-primary hover:bg-primary/90" onClick={handleApplyCoupon} disabled={isUpdating}>
                  Apply Coupon
                </Button>
              </div>

              <div className="mt-6 md:w-2/5 font-poppins">
                <Card>
                  <CardHeader>
                    <CardTitle>Cart Total</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between mb-2">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Shipping:</span>
                      <span>{shipping === 0 ? "Free" : formatCurrency(shipping)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-primary hover:bg-primary/90" asChild>
                      <Link href="/checkout">Proceed to checkout</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

