"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCartStore } from "@/store/auth-store"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function CartPage() {
  const { items, total, updateQuantity, removeItem, syncWithServer } = useCartStore()
  const [couponCode, setCouponCode] = useState("")
  const [loadingItemIds, setLoadingItemIds] = useState({})
  const [isUpdatingCart, setIsUpdatingCart] = useState(false)
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)

  // Sync with server when component mounts
  useEffect(() => {
    syncWithServer()
  }, [syncWithServer])

  // Set loading state for a specific item and action
  const setItemLoading = (itemId, action, isLoading) => {
    setLoadingItemIds((prev) => ({
      ...prev,
      [`${itemId}-${action}`]: isLoading,
    }))
  }

  // Check if a specific item and action is loading
  const isItemLoading = (itemId, action) => {
    return !!loadingItemIds[`${itemId}-${action}`]
  }

  const handleUpdateQuantity = async (itemId, change) => {
    const item = items.find((item) => item && item._id === itemId)
    if (!item) return

    const newQuantity = Math.max(1, item.quantity + change)
    const action = change > 0 ? "increase" : "decrease"

    setItemLoading(itemId, action, true)

    try {
      // Update on server
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: newQuantity,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update cart")
      }

      // Update local state
      updateQuantity(itemId, newQuantity)
    } catch (error) {
      console.error("Error updating cart:", error)
      toast.error("Failed to update cart")
    } finally {
      setItemLoading(itemId, action, false)
    }
  }

  const handleRemoveItem = async (itemId) => {
    setItemLoading(itemId, "remove", true)

    try {
      // Remove from server
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to remove item")
      }

      // Remove from local state
      removeItem(itemId)
      toast.success("Item removed from cart")
    } catch (error) {
      console.error("Error removing item:", error)
      toast.error("Failed to remove item")
    } finally {
      setItemLoading(itemId, "remove", false)
    }
  }

  const handleUpdateCart = async () => {
    setIsUpdatingCart(true)
    try {
      await syncWithServer()
      toast.success("Cart updated")
    } catch (error) {
      console.error("Error updating cart:", error)
      toast.error("Failed to update cart")
    } finally {
      setIsUpdatingCart(false)
    }
  }

  const handleApplyCoupon = () => {
    if (!couponCode) {
      toast.error("Please enter a coupon code")
      return
    }

    setIsApplyingCoupon(true)

    // Simulate API call
    setTimeout(() => {
      // This would typically call an API to validate and apply the coupon
      toast.info("Coupon functionality is not implemented yet")
      setIsApplyingCoupon(false)
    }, 1000)
  }

  const subtotal = total
  // You could add shipping calculation here
  const shipping = 0 // Free shipping
  const finalTotal = subtotal + shipping

  return (
    <div className="w-full mb-20 font-inter grid gap-10">
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
            items.map(
              (item) =>
                item && (
                  <Card key={item._id} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4">
                    <div className="flex items-center space-x-4 col-span-1 sm:col-span-2 md:col-span-1">
                      <div className="relative h-20 w-20 overflow-hidden rounded-md">
                        <Image
                          src={(item.product && item.product.images && item.product.images[0]) || "/placeholder.svg"}
                          alt={(item.product && item.product.name) || "Product"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium line-clamp-2">{item.product ? item.product.name : "Product"}</h3>
                        <button
                          onClick={() => handleRemoveItem(item._id)}
                          disabled={isItemLoading(item._id, "remove")}
                          className="text-sm text-red-500 flex items-center mt-1 disabled:opacity-50"
                        >
                          {isItemLoading(item._id, "remove") ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3 mr-1" />
                          )}
                          <span>{isItemLoading(item._id, "remove") ? "Removing..." : "Remove"}</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <p className="font-medium">
                        {formatCurrency(item.price || (item.product && item.product.price) || 0)}
                      </p>
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="flex items-center border rounded-md">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleUpdateQuantity(item._id, -1)}
                          disabled={
                            isItemLoading(item._id, "decrease") ||
                            isItemLoading(item._id, "increase") ||
                            item.quantity <= 1
                          }
                        >
                          {isItemLoading(item._id, "decrease") ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Minus className="h-3 w-3" />
                          )}
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleUpdateQuantity(item._id, 1)}
                          disabled={isItemLoading(item._id, "increase") || isItemLoading(item._id, "decrease")}
                        >
                          {isItemLoading(item._id, "increase") ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Plus className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-end">
                      <p className="font-semibold">
                        {formatCurrency((item.price || (item.product && item.product.price) || 0) * item.quantity)}
                      </p>
                    </div>
                  </Card>
                ),
            )
          )}
        </div>

        {items.length > 0 && (
          <>
            <div className="flex flex-wrap justify-between mt-6 gap-4 md:col-span-2 lg:col-span-3 font-poppins font-medium">
              <Button variant="outline" asChild>
                <Link href="/products">Continue Shopping</Link>
              </Button>
              <Button variant="outline" onClick={handleUpdateCart} disabled={isUpdatingCart}>
                {isUpdatingCart ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Cart"
                )}
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
                    disabled={isApplyingCoupon}
                  />
                </div>
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleApplyCoupon}
                  disabled={isApplyingCoupon}
                >
                  {isApplyingCoupon ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    "Apply Coupon"
                  )}
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
                      <span>{formatCurrency(finalTotal)}</span>
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

