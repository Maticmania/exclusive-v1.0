"use client"

import { useCartStore } from "@/store/cart-store"
import { formatCurrency } from "@/lib/utils"

export default function OrderSummary({ isSubmitting, handleSubmit, calculateTotals }) {
  const { items } = useCartStore()
  const { subtotal, shipping, total } = calculateTotals()

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span>{shipping > 0 ? formatCurrency(shipping) : "Free"}</span>
        </div>
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
      <button
        type="submit"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
      >
        {isSubmitting ? "Placing Order..." : "Place Order"}
      </button>
    </div>
  )
}
